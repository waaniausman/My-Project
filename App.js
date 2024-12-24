import React, { useState, useCallback, createContext, useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  FlatList,
  Dimensions,
  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Sidebar from './components/Sidebar'

const Stack = createNativeStackNavigator();
const { width,height } = Dimensions.get('window');

// Cart Context
const CartContext = createContext();

// Cart Provider Component
const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  const addToCart = (item, customizations) => {
    setCart((prevCart) => {
      const newItem = {
        ...item,
        customizations,
        id: `${item.id}-${Date.now()}`,
        quantity: 1,
      };
      return [...prevCart, newItem];
    });
  };
  

  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const updateItemQuantity = (itemId, newQuantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const getAddOnPrice = (addOn) => {
    const addOnOptions = [
      { label: 'Cheese Slice', price: '87.00' },
      { label: 'Double Cheese Slice', price: '174.00' },
      { label: 'Pesto Chicken', price: '217.00' },
      { label: 'Chicken Mortadella', price: '217.00' },
      { label: 'Spicy Pakistani', price: '217.00' },
      { label: 'Chicken Honey Mustard', price: '217.00' },
      { label: 'Pulled Beef', price: '217.00' },
      { label: 'Extra Chocolate Drizzle', price: '50.00' },
      { label: 'Nutella Filling', price: '75.00' },
      { label: 'Cream Cheese', price: '60.00' },
      { label: 'Caramel Drizzle', price: '50.00' },
      { label: 'Extra Sprinkles', price: '30.00' },
    ];
    const option = addOnOptions.find(option => option.label === addOn);
    return option ? option.price : '0.00';
  };

  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => {
      const itemPrice = parseFloat(item.price.replace(',', ''));
      const addOnsPrice = item.customizations.addOns ? item.customizations.addOns.reduce((addOnSum, addOn) => {
        return addOnSum + parseFloat(getAddOnPrice(addOn));
      }, 0) : 0;
      return sum + (itemPrice + addOnsPrice) * item.quantity;
    }, 0);
    setTotal(newTotal.toFixed(2));
  }, [cart]);

  return (
    <CartContext.Provider value={{ cart, total, addToCart, removeFromCart, updateItemQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

// Customization Modal Component
const CustomizationModal = ({ visible, item, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState({
    sandwich: '',
    bread: '',
    flavor: '',
    addOns: [],
  });

  useEffect(() => {
    setSelections({
      sandwich: '',
      bread: '',
      flavor: '',
      addOns: [],
    });
    setQuantity(1);
  }, [item]);

  if (!item) return null;

  const donutFlavors = [
    { label: 'Rafaello', price: '0.00' },
    { label: 'Cookie-Doh (Filled)', price: '0.00' },
    { label: 'Glazed', price: '0.00' },
    { label: 'Cinnamon Glazed', price: '0.00' },
    { label: 'Plain Chocolate', price: '0.00' },
    { label: 'Pink Sprinkle', price: '0.00' },
    { label: 'Choco Sprinkle', price: '0.00' },
    { label: 'Peanut Butter', price: '0.00' },
  ];

  const sandwichOptions = [
    { label: 'Pulled Beef', price: '0.00' },
    { label: 'Pesto Chicken', price: '0.00' },
    { label: 'Chicken Mortadella', price: '0.00' },
    { label: 'Breakfast Croissant', price: '0.00' },
    { label: 'Spicy Pakistani', price: '0.00' },
    { label: 'Chicken Honey Mustard', price: '0.00' },
  ];

  const breadOptions = [
    { label: 'Ciabatta', price: '0.00' },
    { label: 'Croissant', price: '0.00' },
    { label: 'Multi grain bread', price: '0.00' },
  ];

  const sandwichAddOns = [
    { label: 'Cheese Slice', price: '87.00' },
    { label: 'Double Cheese Slice', price: '174.00' },
    { label: 'Pesto Chicken', price: '217.00' },
    { label: 'Chicken Mortadella', price: '217.00' },
    { label: 'Spicy Pakistani', price: '217.00' },
    { label: 'Chicken Honey Mustard', price: '217.00' },
    { label: 'Pulled Beef', price: '217.00' },
  ];

  const sweetAddOns = [
    { label: 'Extra Chocolate Drizzle', price: '50.00' },
    { label: 'Nutella Filling', price: '75.00' },
    { label: 'Cream Cheese', price: '60.00' },
    { label: 'Caramel Drizzle', price: '50.00' },
    { label: 'Extra Sprinkles', price: '30.00' },
  ];

  const handleSelection = (type, value) => {
    setSelections(prev => {
      const newSelections = { ...prev };
      switch (type) {
        case 'sandwich':
          newSelections.sandwich = value;
          break;
        case 'bread':
          newSelections.bread = value;
          break;
        case 'flavor':
          newSelections.flavor = value;
          break;
        case 'addOns':
          if (newSelections.addOns.includes(value)) {
            newSelections.addOns = newSelections.addOns.filter(a => a !== value);
          } else if (newSelections.addOns.length < 3) {
            newSelections.addOns.push(value);
          }
          break;
      }
      return newSelections;
    });
  };

  const renderOptionGroup = (title, options, selectedValue, onSelect, type, required = false) => (
    <View style={styles.optionGroup}>
      <View style={styles.optionHeader}>
        <Text style={styles.optionTitle}>{title}</Text>
        {required && <Text style={styles.requiredText}>Required</Text>}
      </View>
      <Text style={styles.optionSubtitle}>
        {type === 'addOns' ? 'Select up to 3 options' : 'Please select one option'}
      </Text>
      {options.map((option) => (
        <TouchableOpacity
          key={option.label}
          style={styles.optionItem}
          onPress={() => onSelect(type, option.label)}
        >
          <View style={styles.radioContainer}>
            <View style={[
              styles.radioOuter,
              (type === 'addOns' ? 
                selectedValue.includes(option.label) : 
                selectedValue === option.label) && styles.radioOuterSelected
            ]}>
              {(type === 'addOns' ? 
                selectedValue.includes(option.label) : 
                selectedValue === option.label) && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.optionLabel}>{option.label}</Text>
          </View>
          {option.price !== '0.00' && (
            <Text style={styles.optionPrice}>Rs. {option.price}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const isSelectionValid = () => {
    if (item.category === 'O-D WICH' || item.name.includes('OD-Wich')) {
      return selections.sandwich && selections.bread;
    } else if (item.name.toLowerCase().includes('donut') || 
               item.name.toLowerCase().includes('cookie') || 
               item.name.toLowerCase().includes('brownie') ||
               item.category === 'MONDAY OVERDOSE' ||
               item.name === 'Thank You') {
      return selections.flavor !== '';
    }
    return true;
  };

  const getCustomizationOptions = () => {
    if (item.category === 'O-D WICH' || item.name.includes('OD-Wich')) {
      return (
        <>
          {renderOptionGroup('Choose Sandwich', sandwichOptions, selections.sandwich, handleSelection, 'sandwich', true)}
          {renderOptionGroup('Choose Bread', breadOptions, selections.bread, handleSelection, 'bread', true)}
          {renderOptionGroup('Add Ons', sandwichAddOns, selections.addOns, handleSelection, 'addOns')}
        </>
      );
    } else if (item.name.toLowerCase().includes('donut') || 
               item.name.toLowerCase().includes('cookie') || 
               item.name.toLowerCase().includes('brownie') ||
               item.category === 'MONDAY OVERDOSE' ||
               item.name === 'Thank You') {
      return (
        <>
          {renderOptionGroup('Choose Flavor', donutFlavors, selections.flavor, handleSelection, 'flavor', true)}
          {renderOptionGroup('Add Ons', sweetAddOns, selections.addOns, handleSelection, 'addOns')}
        </>
      );
    }
    return null;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{item.name}</Text>
          </View>
          
          <ScrollView style={styles.modalScroll}>
            {getCustomizationOptions()}
          </ScrollView>

          <View style={styles.modalFooter}>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            {selections.addOns.length > 0 && (
              <View style={styles.addOnsSummary}>
                <Text style={styles.addOnsSummaryText}>
                  Selected Add-ons: {selections.addOns.join(', ')}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.addToCartButton,
                !isSelectionValid() && styles.addToCartButtonDisabled
              ]}
              disabled={!isSelectionValid()}
              onPress={() => {
                onAddToCart({
                  ...item,
                  quantity,
                  customizations: selections,
                });
                onClose();
              }}
            >
              <Text style={styles.addToCartButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Product List Component
const ProductList = ({ items, searchQuery }) => {
  const { addToCart } = useContext(CartContext);
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredItems = items.filter(item =>
    (item.name?.toLowerCase() || '').includes((searchQuery || '').toLowerCase()) ||
    (item.description?.toLowerCase() || '').includes((searchQuery || '').toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={styles.productCard}>
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.productImage} />
      )}
      <View style={styles.productInfo}>
        {item.badge && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDescription}>{item.description}</Text>
        <Text style={styles.price}>Rs. {item.price}</Text>
      </View>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setSelectedItem(item)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.productList}>
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />

      <CustomizationModal
        visible={selectedItem !== null}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onAddToCart={(itemWithCustomizations) => {
          addToCart(itemWithCustomizations, itemWithCustomizations.customizations);
          setSelectedItem(null);
        }}
      />
    </View>
  );
};


// Welcome Screen Component
const WelcomeScreen = ({ navigation }) => (
  <View style={styles.container}>
    <View style={styles.logoContainer}>
      <Image
        source={{ uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202024-11-18%20at%205.50.18%20PM-LMIR59z8hGB2CEGqKDeoVd8GuRnGgm.jpeg' }}
        style={styles.logo}
      />
    </View>
    <Text style={styles.welcomeText}>Welcome to OD 👋</Text>
    <Text style={styles.subtitle}>Please select your order type to continue</Text>
    <View style={styles.optionsContainer}>
      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => navigation.navigate('Main', { orderType: 'delivery' })}
      >
        <View style={styles.optionContent}>
          <Text style={styles.optionIcon}>🚚</Text>
          <Text style={styles.optionText}>Delivery</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => navigation.navigate('Main', { orderType: 'pickup' })}
      >
        <View style={styles.optionContent}>
          <Text style={styles.optionIcon}>🏪</Text>
          <Text style={styles.optionText}>Pick-Up</Text>
        </View>
      </TouchableOpacity>
    </View>
  </View>
);

// Main Screen Component
const MainScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('NEW ARRIVAL');
  const { cart, total } = useContext(CartContext);
  const scrollViewRef = useRef(null);
  const [categoryPositions, setCategoryPositions] = useState({});
  const [activeIndex, setActiveIndex] = useState(0); // For carousel
  const timerRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const categories = [
    'NEW ARRIVAL',
    'MONDAY OVERDOSE',
    'OD ON THE GO',
    'O-DONUT',
    'EXCLUSIVE DEALS',
    'O-D WICH',
    'O-COMBOS'
  ];

  const allItems = [
    {
      id: 1,
      name: 'Buy 2 OD-Wich Only !',
      description: 'Any Sandwich',
      price: '861.00',
      badge: 'Hot 🔥',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202024-11-18%20at%204.13.27%20PM%20(1)-wjeHmnNFEulO01Oqz7L79TcU6E99To.jpeg',
      category: 'NEW ARRIVAL'
    },
    {
      id: 2,
      name: 'Thank You',
      description: 'Box Of 6 Regular',
      price: '1,629.00',
      badge: 'Best Seller',
      category: 'NEW ARRIVAL'
    },
    {
      id: 3,
      name: 'Glazed Monday\'s',
      description: 'Box Of 6 Regular Glazed',
      price: '595.00',
      badge: 'Hot 🔥',
      category: 'MONDAY OVERDOSE'
    },
    {
      id: 4,
      name: 'Brownies',
      description: 'These Are Dark Chocolate Fudge Brownies Made With Callebaut Chocolate.',
      price: '332.35',
      originalPrice: '391.00',
      discount: '15% Off',
      category: 'OD ON THE GO'
    },
    {
      id: 5,
      name: 'Cookies',
      description: 'They Are Assorted In 2 Flavors. 1-Chocolate Chunk : It\'s A Chewy Cookies',
      price: '332.35',
      originalPrice: '391.00',
      discount: '15% Off',
      category: 'OD ON THE GO'
    },
    {
      id: 6,
      name: 'Box Of 12 Regular',
      description: 'Any Flavor',
      price: '2,483.70',
      originalPrice: '2,922.00',
      discount: '15% Off',
      
      tag: 'Top Trending',
      category: 'O-DONUT'
    },
    {
      id: 7,
      name: 'Exclusive Deal 1',
      description: '4 OD - Wich + 4 Drinks & Box Of 6 Minis',
      price: '3,440.00',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202024-11-18%20at%204.13.28%20PM%20(1)-DzMimcDP6EOPc3rdl1oY6WGYIkoBnD.jpeg',
      category: 'EXCLUSIVE DEALS'
    },
    {
      id: 8,
      name: 'Chicken Mortadella',
      description: 'Chicken Mortadella, Siracha Mayo, Cheese, Tomato, Rocket Leaves, Served In A Ciabatta',
      price: '657.90',
      originalPrice: '774.00',
      discount: '15% ',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202024-11-18%20at%204.13.27%20PM%20(1)-wjeHmnNFEulO01Oqz7L79TcU6E99To.jpeg',
      category: 'O-D WICH'
    },
    {
      id: 9,
      name: '2 OD-Wich + 2 Coolers',
      price: '1,888.00',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202024-11-18%20at%204.13.29%20PM%20(1)-wdBqT6xhwjlFU1ElDnFoIHJJJrG3Up.jpeg',
      category: 'O-COMBOS'
    },
    {
      id: 10,
      name: 'Buy  OD-Wich ',
      description: 'Any Sandwich',
      price: '861.00',
      badge: 'Hot 🔥',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202024-11-18%20at%204.13.27%20PM%20(1)-wjeHmnNFEulO01Oqz7L79TcU6E99To.jpeg',
      category: 'NEW ARRIVAL'
    },
    {
      id: 11,
      name: ' OD-Wich !',
      description: 'Any Sandwich',
      price: '861.00',
      badge: 'Hot 🔥',
     
      category: 'NEW ARRIVAL'
    },
    {
      id: 12,
      name: 'Exclusive Deals',
      description: 'Any Sandwich',
      price: '2000.00',
      badge: 'Hot 🔥',
      
      category: 'NEW ARRIVAL'
    },
    {
      id: 13,
      name: 'Exclusive Deals',
      description: 'Any Sandwich',
      price: '2000.00',
      badge: 'Hot 🔥',
      
      category: 'NEW ARRIVAL'
    },
    {
      id: 14,
      name: 'Box Of 2 Regular',
      description: 'Any Flavor',
      price: '500.0',
      originalPrice: '2,922.00',
      discount: '15% Off',
     
      category: 'O-DONUT'
    },  {
      id: 15,
      name: 'Box Of 4 Regular',
      description: 'Any Flavor',
      price: '800.0',
      originalPrice: '2,922.00',
      discount: '15% Off',
     
      tag: 'Top Trending',
      category: 'O-DONUT'
    },  {
      id: 16,
      name: 'Box Of 6 Regular',
      description: 'Any Flavor',
      price: '1000.0',
      originalPrice: '2,922.00',
      discount: '15% Off',
      
      tag: 'Top Trending',
      category: 'O-DONUT'
    },
    {
      id: 17,
      name: 'Box Of 8 Regular',
      description: 'Any Flavor',
      price: '1200.0',
      originalPrice: '2,922.00',
      discount: '15% Off',
      
      tag: 'Top Trending',
      category: 'O-DONUT'
    },
    {
      id: 18,
      name: 'Box Of 10 Regular',
      description: 'Any Flavor',
      price: '1500.00',
      originalPrice: '2,922.00',
      discount: '15% Off',
     
      tag: 'Top Trending',
      category: 'O-DONUT'
    },
    {
      id: 19,
      name: 'New Monday\'s',
      description: 'Box Of 4 Regular Glazed',
      price: '300.00',
      badge: 'Hot 🔥',
      category: 'MONDAY OVERDOSE'
    },
    {
      id: 20,
      name: 'Monday\'s super',
      description: 'Box Of 8 Regular Glazed',
      price: '700.00',
      badge: 'Hot 🔥',
      category: 'MONDAY OVERDOSE'
    },
    {
      id: 21,
      name: 'Great Monday\'s',
      description: 'Box Of 10 Regular Glazed',
      price: '1000.00',
      badge: 'Hot 🔥',
      category: 'MONDAY OVERDOSE'
    },
    {
      id: 22,
      name: 'Hot Monday',
      description: 'Box Of 12 Regular Glazed',
      price: '1500.00',
      badge: 'Hot 🔥',
      category: 'MONDAY OVERDOSE'
    },
    {
      id: 23,
      name: 'Donuts',
      description: 'These Are Dark Chocolate Fudge Brownies Made With Callebaut Chocolate.',
      price: '332.35',
      originalPrice: '391.00',
      discount: '15% Off',
      category: 'OD ON THE GO'
    },
    {
      id: 24,
      name: 'Cup Cakes',
      description: 'These Are Dark Chocolate Fudge Brownies Made With Callebaut Chocolate.',
      price: '332.35',
      originalPrice: '391.00',
      discount: '15% Off',
      category: 'OD ON THE GO'
    },
    {
      id: 25,
      name: 'Brownies And donuts',
      description: 'These Are Dark Chocolate Fudge Brownies Made With Callebaut Chocolate.',
      price: '332.35',
      originalPrice: '391.00',
      discount: '15% Off',
      category: 'OD ON THE GO'
    },
    {
      id: 26,
      name: 'Exclusive Deal 2',
      description: '4 OD - Wich + 4 Drinks & Box Of 6 Minis',
      price: '3,000.00',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202024-11-18%20at%204.13.28%20PM%20(1)-DzMimcDP6EOPc3rdl1oY6WGYIkoBnD.jpeg',
      category: 'EXCLUSIVE DEALS'
    },
    {
      id: 27,
      name: 'Exclusive Deal 3',
      description: '4 OD - Wich + 4 Drinks & Box Of 6 Minis',
      price: '3,500.00',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202024-11-18%20at%204.13.28%20PM%20(1)-DzMimcDP6EOPc3rdl1oY6WGYIkoBnD.jpeg',
      category: 'EXCLUSIVE DEALS'
    },
    {
      id: 28,
      name: 'Exclusive Deal 4',
      description: '4 OD - Wich + 4 Drinks & Box Of 6 Minis',
      price: '3,440.00',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202024-11-18%20at%204.13.28%20PM%20(1)-DzMimcDP6EOPc3rdl1oY6WGYIkoBnD.jpeg',
      category: 'EXCLUSIVE DEALS'
    },
    {
      id: 29,
      name: 'Exclusive Deal 5',
      description: '4 OD - Wich + 4 Drinks & Box Of 6 Minis',
      price: ',4440.00',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202024-11-18%20at%204.13.28%20PM%20(1)-DzMimcDP6EOPc3rdl1oY6WGYIkoBnD.jpeg',
      category: 'EXCLUSIVE DEALS'
    },
    {
      id: 30,
      name: 'Exclusive Deal 1',
      description: '4 OD - Wich + 4 Drinks & Box Of 6 Minis',
      price: '2,440.00',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202024-11-18%20at%204.13.28%20PM%20(1)-DzMimcDP6EOPc3rdl1oY6WGYIkoBnD.jpeg',
      category: 'EXCLUSIVE DEALS'
    },
    {
      id: 31,
      name: 'Chicken wich',
      description: 'Chicken Mortadella, Siracha Mayo, Cheese, Tomato, Rocket Leaves, Served In A Ciabatta',
      price: '877.90',
      originalPrice: '984.00',
      discount: '15% ',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202024-11-18%20at%204.13.27%20PM%20(1)-wjeHmnNFEulO01Oqz7L79TcU6E99To.jpeg',
      category: 'O-D WICH'
    },
    {
      id: 32,
      name: 'Mortadella',
      description: 'Chicken Mortadella, Siracha Mayo, Cheese, Tomato, Rocket Leaves, Served In A Ciabatta',
      price: '647.90',
      originalPrice: '764.00',
      discount: '15% ',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202024-11-18%20at%204.13.27%20PM%20(1)-wjeHmnNFEulO01Oqz7L79TcU6E99To.jpeg',
      category: 'O-D WICH'
    },
    {
      id: 33,
      name: 'SandWich',
      description: 'Chicken Mortadella, Siracha Mayo, Cheese, Tomato, Rocket Leaves, Served In A Ciabatta',
      price: '657.90',
      originalPrice: '774.00',
      discount: '15% ',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202024-11-18%20at%204.13.27%20PM%20(1)-wjeHmnNFEulO01Oqz7L79TcU6E99To.jpeg',
      category: 'O-D WICH'
    },
    {
      id: 34,
      name: 'Chicken',
      description: 'Chicken Mortadella, Siracha Mayo, Cheese, Tomato, Rocket Leaves, Served In A Ciabatta',
      price: '657.90',
      originalPrice: '774.00',
      discount: '15% ',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202024-11-18%20at%204.13.27%20PM%20(1)-wjeHmnNFEulO01Oqz7L79TcU6E99To.jpeg',
      category: 'O-D WICH'
    },
    
    

    

    
    


  ];

  const promotionalImages = [
    {
      id: 1,
      uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202024-11-23%20at%2012.20.33%20AM-Eksb8Bv3oucJY4LMSaqxl6e5KXEiBg.jpeg',
      alt: 'Donut Box Special'
    },
    {
      id: 2,
      uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storagecom/WhatsApp%20Image%202024-11-23%20at%2012.20.45%20AM-D0aceKhL3zXPr2b5l6BG0JuoXT6TN5.jpeg',
      alt: 'Cookie-Doh Special'
    },
    {
      id: 3,
      uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202024-11-23%20at%2012.20.56%20AM-N7m3UaWuCxSwqpXQrnvTYF2iD7NV1f.jpeg',
      alt: 'Combo Deals'
    }
  ];

  useEffect(() => {
    const positions = {};
    categories.forEach((category, index) => {
      positions[category] = index * height;
    });
    setCategoryPositions(positions);
  }, []);

  useEffect(() => {
    // Auto-scroll for carousel
    const startTimer = () => {
      timerRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev === promotionalImages.length - 1 ? 0 : prev + 1));
      }, 3000);
    };
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [promotionalImages.length]);

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.y;
    let closestCategory = categories[0];
    let minDistance = Math.abs(categoryPositions[categories[0]] - scrollPosition);

    categories.forEach((category) => {
      const distance = Math.abs(categoryPositions[category] - scrollPosition);
      if (distance < minDistance) {
        closestCategory = category;
        minDistance = distance;
      }
    });

    setSelectedCategory(closestCategory);
  };

  const scrollToCategory = (category) => {
    scrollViewRef.current.scrollTo({
      y: categoryPositions[category],
      animated: true,
    });
  };

  const handleCarouselScroll = (event) => {
    const slideWidth = event.nativeEvent.layoutMeasurement.width;
    const offset = event.nativeEvent.contentOffset.x;
    const active = Math.round(offset / slideWidth);
    setActiveIndex(active);
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.header}>
      <TouchableOpacity style={styles.menuButton} onPress={() => setIsSidebarOpen(true)} > <Text>☰</Text> </TouchableOpacity>
        <View style={styles.locationContainer}>
          <Text style={styles.locationLabel}>Pick-Up From</Text>
          <Text style={styles.locationText}>PIA Branch</Text>
        </View>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => navigation.navigate('Search', { allItems })}
        >
          <Text>🔍</Text>
        </TouchableOpacity>
      </View>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <FlatList
  data={categories}
  horizontal
  showsHorizontalScrollIndicator={false}
  keyExtractor={(item) => item}
  renderItem={({ item: category }) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        selectedCategory === category && styles.selectedCategoryTab
      ]}
      onPress={() => scrollToCategory(category)}
    >
      <Text 
        style={[
          styles.categoryTabText,
          selectedCategory === category && styles.selectedCategoryTabText
        ]}
        numberOfLines={1}
      >
        {category}
      </Text>
    </TouchableOpacity>
  )}
  contentContainerStyle={styles.categoriesContentContainer}
  style={styles.categoriesContainer}
/>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.contentContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Carousel Component */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleCarouselScroll}
            style={styles.carouselScrollView}
          >
            {promotionalImages.map((image) => (
              <Image
                key={image.id}
                source={{ uri: image.uri }}
                style={styles.carouselImage}
                accessibilityLabel={image.alt}
              />
            ))}
          </ScrollView>
          <View style={styles.carouselPagination}>
            {promotionalImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.carouselDot,
                  index === activeIndex && styles.carouselDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {categories.map((category) => (
          <View key={category} style={{ minHeight: height }}>
            <Text style={styles.sectionTitle}>{category}</Text>
            <ProductList 
              items={allItems.filter(item => item.category === category)} 
              searchQuery="" 
            />
          </View>
        ))}
      </ScrollView>

      {cart.length > 0 && (
        <TouchableOpacity 
          style={styles.viewCartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cart.length}</Text>
          </View>
          <Text style={styles.viewCartText}>View Cart</Text>
          <Text style={styles.cartTotalText}>Rs. {total}</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

// Search Screen Component
const SearchScreen = ({ route, navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { allItems } = route.params || {};

  return (
    <SafeAreaView style={styles.searchContainer}>
      <View style={styles.searchHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.searchTitle}>Search products</Text>
      </View>
      <View style={styles.searchInputContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
      </View>
      <ProductList items={allItems || []} searchQuery={searchQuery} />
    </SafeAreaView>
  );
};

// Cart Screen Component
const CartScreen = ({ navigation }) => {
  const { cart, total, removeFromCart, updateItemQuantity } = useContext(CartContext);

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      {item.image && <Image source={{ uri: item.image }} style={styles.cartItemImage} />}
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        <Text style={styles.cartItemDescription}>
          {item.customizations.sandwich && `Sandwich: ${item.customizations.sandwich}`}
          {item.customizations.bread && `\nBread: ${item.customizations.bread}`}
          {item.customizations.flavor && `\nFlavor: ${item.customizations.flavor}`}
          {item.customizations.addOns?.length > 0 && `\nAdd-ons: ${item.customizations.addOns.join(', ')}`}
        </Text>
        <Text style={styles.cartItemPrice}>Rs. {item.price}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateItemQuantity(item.id, Math.max(1, item.quantity - 1))}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateItemQuantity(item.id, item.quantity + 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeButton}>
        <Text style={styles.removeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.cartContainer}>
      <View style={styles.cartHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.cartTitle}>My Cart</Text>
      </View>
      <View style={styles.pickUpContainer}>
        <Text style={styles.pickUpLabel}>Pick-Up From</Text>
        <View style={styles.pickUpInfo}>
          <Text style={styles.pickUpLocation}>PIA Branch</Text>
          <TouchableOpacity>
            <Text style={styles.changeButton}>Change</Text>
          </TouchableOpacity>
        </View>
      </View>
      {cart.length === 0 ? (
        <Text style={styles.emptyCartText}>Your cart is empty</Text>
      ) : (
        <>
          <FlatList
            data={cart}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={styles.cartList}
          />
          <View style={styles.promoCodeContainer}>
            <Text style={styles.promoCodeText}>Please login to apply promo code</Text>
          </View>
          <View style={styles.totalContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>Rs. {total}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TAX (16.0%)</Text>
              <Text style={styles.totalValue}>Rs. {(parseFloat(total) * 0.16).toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>Rs. {(parseFloat(total) * 1.16).toFixed(2)}</Text>
            </View>
          </View>
          <TouchableOpacity 
        style={styles.checkoutButton}
        onPress={() => navigation.navigate('Checkout')}
      >
        <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
      </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
};
const CheckoutScreen = ({ navigation }) => {
  const [customerDetails, setCustomerDetails] = useState({
    fullName: '',
    phone: '',
    email: '',
    instructions: ''
  });
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('ASAP');
  const [selectedPayment, setSelectedPayment] = useState('Select Payment Method');

  const handleDateConfirm = (date) => {
    setSelectedDate(date.toLocaleString());
    setDatePickerVisible(false);
  };

  return (
    <SafeAreaView style={styles.checkoutContainer}>
      {/* Header */}
      <View style={styles.checkoutHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.checkoutTitle}>Checkout</Text>
      </View>

      <ScrollView style={styles.checkoutContent}>
        {/* Customer Details Card */}
          <View style={styles.checkoutCard}>
            <TextInput
              style={styles.checkoutInput}
              placeholder="Full Name"
              value={customerDetails.fullName}
              onChangeText={(text) => setCustomerDetails(prev => ({...prev, fullName: text}))}
            />

            <View style={styles.phoneContainer}>
              <View style={styles.countryCodeContainer}>
              <Image 
          source={{ uri: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-VKONfbfWJx2G9PocLhYmOjzBnfNij3.png" }}
          style={styles.flagIcon}
              />
                <Text style={styles.countryCode}>+92</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="Phone Number"
                keyboardType="phone-pad"
                value={customerDetails.phone}
                onChangeText={(text) => setCustomerDetails(prev => ({...prev, phone: text}))}
              />
            </View>

            <TextInput
              style={styles.checkoutInput}
              placeholder="Email"
              keyboardType="email-address"
              value={customerDetails.email}
              onChangeText={(text) => setCustomerDetails(prev => ({...prev, email: text}))}
            />

        <View style={styles.pickupSection}>
          <Text style={styles.pickupLabel}>Pick-Up From</Text>
          <View style={styles.locationContainer}>
            <Picker
              selectedValue={customerDetails.pickupLocation}
              style={styles.locationPicker}
              onValueChange={(value) => setCustomerDetails(prev => ({ ...prev, pickupLocation: value }))}
            >
              <Picker.Item label="Select a branch" value="" />
              <Picker.Item label="PIA Branch" value="PIA Branch" />
              <Picker.Item label="Barkat Market Branch" value="Barkat Market Branch" />
            </Picker>
          </View>
            </View>

            <TextInput
            style={styles.instructionsInput}
            placeholder="Add any instructions for your order"
            value={customerDetails.instructions}
            onChangeText={(text) => setCustomerDetails(prev => ({...prev, instructions: text}))}
            />
                </View>

                {/* Payment Method Card */}
          <View style={styles.checkoutCard}>
            <View style={styles.cardHeader}>
            <Image 
          source={{ uri: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-vv2slSj2hgUY7YGLAQ0eSOUlrrRfGn.png" }}
          style={styles.cardIcon}
              />
              <Text style={styles.cardTitle}>Payment Method</Text>
            </View>
            <View style={styles.locationContainer}>
              <Picker
                selectedValue={selectedPayment}
                style={styles.locationPicker}
                onValueChange={(value) => setSelectedPayment(value)}
              >
                <Picker.Item label="Select Payment Method" value="Select Payment Method" />
                <Picker.Item label="Cash on Delivery" value="Cash on Delivery" />
                <Picker.Item label="Credit/Debit Card" value="Credit/Debit Card" />
              </Picker>
            </View>
          </View>

          {/* Pickup Time Card */}
              <View style={styles.checkoutCard}>
              <View style={styles.cardHeader}>
              <Image
              source={{ uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-DxqvhBCm35qIUhLSk1s0e0FVQoeMkR.png' }}
              style={styles.cardIcon}
                
                />
                <Text style={styles.cardTitle}>Estimated Pick-Up Time</Text>
              </View>
              <TouchableOpacity 
                style={styles.selectionButton}
                onPress={() => setDatePickerVisible(true)}
              >
                <Text style={styles.selectionText}>{selectedDate}</Text>
                <Text style={styles.chooseButton}>Choose</Text>
              </TouchableOpacity>
              </View>

              {/* Total Section */}
              <View style={styles.totalCard}>
                <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalAmount}>Rs. 1889.00</Text>
                </View>
                <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TAX (16.0%)</Text>
                <Text style={styles.totalAmount}>Rs. 302.24</Text>
                </View>
                <View style={[styles.totalRow, styles.grandTotal]}>
                <Text style={styles.grandTotalLabel}>Grand Total</Text>
                <Text style={styles.grandTotalAmount}>Rs. 2191.24</Text>
                </View>
              </View>
                </ScrollView>

                {/* Confirm Button */}
              <TouchableOpacity 
          style={styles.confirmButton}
          onPress={() => alert('Order Confirmed')}
              >
          <Text style={styles.confirmText}>Confirm Order</Text>
              </TouchableOpacity>

              {/* Date Time Picker */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleDateConfirm}
        onCancel={() => setDatePickerVisible(false)}
      />
    </SafeAreaView>
  );
};
const PaymentOptionsScreen = ({ navigation, route }) => {
  const handlePaymentSelection = (method) => {
    // Handle payment selection and navigate back
    navigation.navigate('Checkout', { selectedPayment: method });
  };

  return (
    <SafeAreaView style={styles.paymentContainer}>
      <View style={styles.paymentHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.paymentTitle}>Payment Options</Text>
      </View>

      <View style={styles.paymentContent}>
        <TouchableOpacity 
          style={styles.paymentOption}
          onPress={() => handlePaymentSelection('Cash on Delivery')}
        >
          <MaterialCommunityIcons name="cash" size={24} color="#333" />
          <Text style={styles.optionText}>Cash on Delivery</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.paymentOption}
          onPress={() => handlePaymentSelection('Credit/Debit Card')}
        >
          <MaterialCommunityIcons name="credit-card" size={24} color="#333" />
          <Text style={styles.optionText}>Credit/Debit Card</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// App Component
export default function App() {
  return (
    <NavigationContainer>
      <CartProvider>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Main" component={MainScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="PaymentOptions" component={PaymentOptionsScreen} />
        </Stack.Navigator>
      </CartProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  checkoutContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  checkoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#E75480',
  },
  backArrow: {
    fontSize: 24,
    color: 'white',
    marginRight: 16,
  },
  checkoutTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  checkoutContent: {
    flex: 1,
    padding: 16,
  },
  checkoutCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  checkoutInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  phoneContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  paymentContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#E75480',
  },
  backArrow: {
    fontSize: 24,
    color: 'white',
    marginRight: 16,
  },
  paymentTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  paymentContent: {
    padding: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  flagIcon: {
    width: 24,
    height: 16,
    marginRight: 8,
  },
  countryCode: {
    fontSize: 16,
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  pickupSection: {
    marginVertical: 12,
  },
  pickupLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  locationContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  mapButton: {
    alignSelf: 'flex-start',
  },
  mapButtonText: {
    color: '#E75480',
    fontSize: 14,
    fontWeight: '600',
  },
  instructionsButton: {
    marginTop: 12,
  },
  instructionsText: {
    color: '#E75480',
    fontSize: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  selectionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
  },
  selectionText: {
    fontSize: 16,
    color: '#333',
  },
  chooseButton: {
    color: '#E75480',
    fontSize: 14,
    fontWeight: '600',
  },
  totalCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 80,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '500',
  },
  grandTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  grandTotalAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E75480',
  },
  confirmButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#E75480',
    padding: 16,
    alignItems: 'center',
  },
  confirmText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  optionsContainer: {
    gap: 20,
  },
  optionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIcon: {
    fontSize: 24,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  flagIcon: {
    width: 50,
    height: 30,
  },
  cardIcon: {
    width: 30,
    height: 30,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#E91E63',
  },
  menuButton: {
    padding: 8,
  },
  locationContainer: {
    flex: 1,
    marginLeft: 16,
    marginRight: 16,
  },
  locationLabel: {
    fontSize: 16,
    color: '#fff',
  },
  locationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000', 

  },
  searchButton: {
    padding: 8,
  },
  contentContainer: {
    flex: 1,
  },
  promotionalBanner: {
    width: '100%',
    height: 200,
  },
  promotionalBannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoriesContainer: {
    flexGrow: 0,
    backgroundColor: '#fff',
  },
  categoriesContentContainer: {
    paddingHorizontal: 8, 
    paddingVertical: 8,  
  },
  categoryTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 4,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  selectedCategoryTab: {
    backgroundColor: '#E91E63',
  },
  categoryTabText: {
    color: '#666',
    fontSize: 14,
  },
  selectedCategoryTabText: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,  
    marginBottom: 8, 
    paddingHorizontal: 20,
  },
  productList: {
    padding: 8,
    gap: 8,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 8,
  },
  productInfo: {
    flex: 1,
  },
  badgeContainer: {
    backgroundColor: '#FFE0E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    color: '#E91E63',
    fontSize: 12,
    fontWeight: '500',
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E91E63',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    fontSize: 24,
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalScroll: {
    padding: 16,
  },
  optionGroup: {
    marginBottom: 24,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  requiredText: {
    color: 'red',
    fontSize: 14,
  },
  optionSubtitle: {
    color: '#666',
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#E91E63',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E91E63',
  },
  optionLabel: {
    fontSize: 16,
  },
  optionPrice: {
    fontSize: 16,
    color: '#666',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  quantityText: {
    fontSize: 18,
    marginHorizontal: 20,
  },
  addToCartButton: {
    backgroundColor: '#E91E63',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addToCartButtonDisabled: {
    opacity: 0.5,
  },
  cartContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  cartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 24,
    marginRight: 16,
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  pickUpContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pickUpLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  pickUpInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickUpLocation: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  changeButton: {
    color: '#E91E63',
    fontSize: 14,
  },
  emptyCartText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  cartList: {
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cartItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  cartItemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 18,
    color: '#E91E63',
  },
  promoCodeContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  promoCodeText: {
    fontSize: 14,
    color: '#666',
  },
  totalContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  checkoutButton: {
    backgroundColor: '#E91E63',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  carouselContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  carouselScrollView: {
    width: '100%',
    height: '100%',
  },
  carouselImage: {
    width: Dimensions.get('window').width,
    height: '100%',
    resizeMode: 'cover',
  },
  carouselPagination: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  carouselDotActive: {
    backgroundColor: '#E91E63',
  },
  viewCartButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#E91E63',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  viewCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartTotalText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#E91E63',
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
    marginRight: 16,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchInputContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  addOnsSummary: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  addOnsSummaryText: {
    fontSize: 14,
    color: '#666',
  },
  
  cartBadge: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#E91E63',
    fontSize: 12,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#E91E63',
  },
  backButton: {
    fontSize: 24,
    color: '#fff',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  phoneInput: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  flagIcon: {
    width: 24,
    height: 16,
    marginRight: 4,
  },
  countryCodeText: {
    fontSize: 16,
  },
  phoneNumber: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  pickupLocation: {
    marginTop: 8,
  },
  pickupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  locationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapButton: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  instructionsButton: {
    marginTop: 16,
  },
  instructionsButtonText: {
    color: '#666',
    fontSize: 14,
  },
  selectionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
  },
  selectionButtonText: {
    fontSize: 16,
  },
  chooseText: {
    color: '#E91E63',
    fontSize: 14,
  },
  subtotalSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#E91E63',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
});
const uniqueStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#E91E63',
  },
  menuButton: {
    padding: 8,
  },
  mainHeaderTitle: {
    fontSize: 18,
    color: '#fff',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 300,
    backgroundColor: '#fff',
    padding: 16,
    elevation: 10,
    zIndex: 10,
  },
  sidebarHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sidebarMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sidebarMenuText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#333',
  },
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 5,
  },
  sidebarOverlayBackground: {
    flex: 1,
  },
});

