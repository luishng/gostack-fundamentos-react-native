import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cart = await AsyncStorage.getItem('@GoMarketPlace:cart');

      if (cart) {
        setProducts(JSON.parse(cart));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async newProduct => {
      let newCart = [];

      if (products.find(product => product.id === newProduct.id)) {
        newCart = products.map(oldProduct => {
          if (oldProduct.id === newProduct.id) {
            oldProduct.quantity += 1;
          }

          return oldProduct;
        });
      } else {
        newCart = [
          ...products,
          {
            ...newProduct,
            quantity: 1,
          },
        ];
      }

      setProducts(newCart);

      await AsyncStorage.setItem(
        '@GoMarketPlace:cart',
        JSON.stringify(newCart),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newCartIncremented = products.map(product => {
        if (product.id === id) {
          product.quantity += 1;
        }

        return product;
      });

      setProducts(newCartIncremented);

      await AsyncStorage.setItem(
        '@GoMarketPlace:cart',
        JSON.stringify(newCartIncremented),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newCartDecremented = products.map(product => {
        if (product.id === id) {
          if (product.quantity !== 0) {
            product.quantity -= 1;
          }
        }

        return product;
      });

      setProducts(newCartDecremented);

      await AsyncStorage.setItem(
        '@GoMarketPlace:cart',
        JSON.stringify(newCartDecremented),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
