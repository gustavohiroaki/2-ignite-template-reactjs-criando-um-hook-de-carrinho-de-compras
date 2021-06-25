import React, { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";
import {
  addState,
  updateState,
  removeStateFromArray,
} from "../util/handleState";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      let newState;
      const productInCartIndex = cart.findIndex(
        (product) => product.id === productId
      );
      const { data: stock } = await api.get<Stock>(`/stock/${productId}`);

      const hasProduct = productInCartIndex !== -1;
      if (!hasProduct) {
        const { data: productFromApi } = await api.get(
          `/products/${productId}`
        );

        newState = addState<Product>(
          cart,
          {
            id: productId,
            amount: 1,
            title: productFromApi.title,
            price: productFromApi.price,
            image: productFromApi.image,
          },
          setCart
        );

        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newState));
      } else {
        const product = cart[productInCartIndex];

        if (stock.amount > product.amount) {
          newState = updateState<Product>(
            cart,
            {
              id: productId,
              title: product.title,
              price: product.price,
              image: product.image,
              amount: (product.amount += 1),
            },
            setCart,
            productId
          );

          localStorage.setItem("@RocketShoes:cart", JSON.stringify(newState));
        } else {
          toast.error("Quantidade solicitada fora de estoque");
        }
      }
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const productIndex = cart.findIndex(
        (product) => product.id === productId
      );

      const hasProduct = productIndex !== -1;
      if (hasProduct) {
        const newCart = removeStateFromArray(cart, setCart, productId);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
      } else {
        toast.error("Erro na remoção do produto");
      }
    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount <= 0) return;

      let newCart;
      const productIndex = cart.findIndex(
        (product) => product.id === productId
      );

      const hasProduct = productIndex !== -1;
      if (!hasProduct) {
        toast.error("Erro na alteração de quantidade do produto");
        return;
      }

      const { data: productFromApi } = await api.get<Stock>(
        `/stock/${productId}`
      );
      const product = cart[productIndex];

      const productAvaliable = productFromApi.amount >= amount;
      if (!productAvaliable) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }

      newCart = updateState(
        cart,
        {
          amount,
          id: productId,
          image: product.image,
          price: product.price,
          title: product.title,
        },
        setCart,
        productId
      );

      localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
    } catch {}
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
