import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const initialState = {
  items: [],
  total: 0,
  itemCount: 0
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'LOAD_CART':
      // Validate loaded cart data
      try {
        const validItems = action.payload.items.filter(item => 
          item && item.product && item.product._id && item.quantity
        );
        
        return {
          ...action.payload,
          items: validItems,
          total: validItems.reduce((sum, item) => sum + ((item.product.price || 0) * (item.quantity || 1)), 0),
          itemCount: validItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
        };
      } catch (error) {
        console.error('Error loading cart:', error);
        return initialState;
      }
      
    case 'ADD_ITEM': {
      // Validate product data
      if (!action.payload.product || !action.payload.product._id) {
        console.error('Invalid product data in ADD_ITEM');
        return state;
      }
      
      const existingItem = state.items.find(
        item => item.product._id === action.payload.product._id && 
                item.size === action.payload.size && 
                item.color === action.payload.color
      );

      let newItems;
      if (existingItem) {
        // Check if we have enough stock
        const variant = action.payload.product.variants?.find(
          v => v.size === action.payload.size && v.color === action.payload.color
        );
        
        const newQuantity = existingItem.quantity + action.payload.quantity;
        if (variant && variant.stock < newQuantity) {
          console.error(`Not enough stock for ${action.payload.product.name}`);
          return state;
        }
        
        newItems = state.items.map(item =>
          item.product._id === action.payload.product._id && 
          item.size === action.payload.size && 
          item.color === action.payload.color
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        newItems = [...state.items, action.payload];
      }

      const newState = {
        items: newItems,
        total: newItems.reduce((sum, item) => sum + ((item.product.price || 0) * (item.quantity || 1)), 0),
        itemCount: newItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
      };
      
      localStorage.setItem('cart', JSON.stringify(newState));
      return newState;
    }
    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.product._id === action.payload.productId && 
        item.size === action.payload.size && 
        item.color === action.payload.color
          ? { ...item, quantity: action.payload.quantity }
          : item
      );

      const newState = {
        items: newItems,
        total: newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
        itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0)
      };
      
      localStorage.setItem('cart', JSON.stringify(newState));
      return newState;
    }
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(
        item => !(item.product._id === action.payload.productId && 
                 item.size === action.payload.size && 
                 item.color === action.payload.color)
      );

      const newState = {
        items: newItems,
        total: newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
        itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0)
      };
      
      localStorage.setItem('cart', JSON.stringify(newState));
      return newState;
    }
    case 'CLEAR_CART': {
      const newState = { items: [], total: 0, itemCount: 0 };
      localStorage.setItem('cart', JSON.stringify(newState));
      return newState;
    }
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartData });
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  const addToCart = (product, size, color, quantity = 1) => {
    // Ensure we have valid product data
    if (!product || !product._id) {
      console.error('Invalid product data');
      return;
    }
    
    // If size or color not provided, use first variant if available
    const finalSize = size || (product.variants && product.variants.length > 0 ? product.variants[0].size : 'M');
    const finalColor = color || (product.variants && product.variants.length > 0 ? product.variants[0].color : 'Default');
    
    // Check if we have stock for this variant
    const variant = product.variants?.find(v => v.size === finalSize && v.color === finalColor);
    if (variant && variant.stock < quantity) {
      console.error(`Not enough stock for ${product.name} in ${finalSize}/${finalColor}`);
      return;
    }
    
    dispatch({
      type: 'ADD_ITEM',
      payload: { product, size: finalSize, color: finalColor, quantity }
    });
  };

  const updateQuantity = (productId, size, color, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
    } else {
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { productId, size, color, quantity }
      });
    }
  };

  const removeFromCart = (productId, size, color) => {
    dispatch({
      type: 'REMOVE_ITEM',
      payload: { productId, size, color }
    });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotalPrice = () => {
    return state.total;
  };

  const value = {
    ...state,
    cartItems: state.items,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getCartTotal: getTotalPrice
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}