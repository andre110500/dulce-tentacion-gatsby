import React, { createContext, useState, useEffect, useReducer } from "react";

import { toast } from "react-toastify";

export const GlobalContext = createContext({
  ACTIONS: {},
  dispatch: () => {},
  cartItems: [],
});

export function triggerAlert(message) {
  const MultiLineToast = () => (
    <div>
      <div>{message}</div>
    </div>
  );
  toast.success(<MultiLineToast />, {
    autoClose: 2500,
    hideProgressBar: false,
    closeButton: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  });
}

function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem("cartItems");
    if (saved) {
      const items = JSON.parse(saved);
      return items.map((item) => ({
        ...item,
        getTotalCartItemPrice() {
          if (this.product.priceWithAddOns) {
            return this.product.priceWithAddOns * this.count;
          }
          return this.product.price * this.count;
        },
      }));
    }
  } catch (e) {}
  return [];
}

export default function GlobalContextProvider({ children }) {
  const [cartItems, dispatch] = useReducer(reducer, null, () =>
    loadCartFromStorage()
  );

  useEffect(() => {
    try {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    } catch (e) {}
  }, [cartItems]);

  const ACTIONS = {
    ADD_CART_ITEM: "add-cart-item",
    REMOVE_CART_ITEM: "remove-cart-item",
  };

  function reducer(cartItems, action) {
    let product;
    let indexOfProductInCart;
    let isProductInCart;
    let quantity;

    function areArraysEqual(arr1, arr2) {
      if (!arr1 || !arr2) return false;
      if (arr1.length !== arr2.length) return false;
      const sortedArr1 = [...arr1].sort();
      const sortedArr2 = [...arr2].sort();
      return sortedArr1.every((value, index) => value === sortedArr2[index]);
    }

    if (action.payload && action.payload.product) {
      product = action.payload.product;
      quantity = action.payload.quantity;
      isProductInCart = () => {
        return cartItems.some((cartItem) => {
          //check if it is scoped ice cream
          if (product.flavours) {
            return false;
          }
          //   check if it's the same product

          if (product._id !== cartItem.product._id) {
            return false;
          }

          // Check flavors if they exist
          if (product.chosenFlavours || cartItem.product.chosenFlavours) {
            // If one has flavors and the other doesn't, they're different
            if (!product.chosenFlavours || !cartItem.product.chosenFlavours) {
              return false;
            }
            // Compare flavors
            if (
              !areArraysEqual(
                product.chosenFlavours,
                cartItem.product.chosenFlavours
              )
            ) {
              return false;
            }
          }

          // If we get here, all checks passed
          return true;
        });
      };

      indexOfProductInCart = () => {
        return cartItems.findIndex((cartItem) => {
          if (product.chosenFlavours && cartItem.product.chosenFlavours) {
            // Check both _id and chosenFlavours
            return (
              product._id === cartItem.product._id &&
              areArraysEqual(
                product.chosenFlavours,
                cartItem.product.chosenFlavours
              )
            );
          }
          // Check only _id if chosenFlavours is not present
          return product._id === cartItem.product._id;
        });
      };
    }

    const cartItemsCopy = [...cartItems];

    switch (action.type) {
      case "add-cart-item": {
        //function to create a new item on the cart (a stack)
        function newCartItem(product) {
          return {
            product,
            count: quantity || 1,
            getTotalCartItemPrice() {
              if (this.product.priceWithAddOns) {
                return this.product.priceWithAddOns * this.count;
              } else {
                return this.product.price * this.count;
              }
            },
          };
        }

        const message = `Agregaste${quantity > 1 ? ` ${quantity}` : ""} ${product.name.toUpperCase()} ➔`;
        triggerAlert(message);

        if (!isProductInCart()) {
          console.log("--------------------------------");
          console.log("is not in the cart");
          console.log("--------------------------------");
          //create 1 instance of the product in the cart
          cartItemsCopy.push(newCartItem(product));

          return cartItemsCopy;
        } else {
          console.log("--------------------------------");
          console.log("is in the cart");
          console.log("--------------------------------");
          //increase the count of the item

          cartItemsCopy[indexOfProductInCart()].count += quantity;

          return cartItemsCopy;
        }
      }
      case "remove-cart-item": {
        if (cartItems[indexOfProductInCart()].count > 1) {
          cartItemsCopy[indexOfProductInCart()].count -= quantity;
          return cartItemsCopy;
        } else {
          cartItemsCopy.splice(indexOfProductInCart(), 1);
          return cartItemsCopy;
        }
      }
      case "remove-stack": {
        cartItemsCopy.splice(indexOfProductInCart(), 1);
        return cartItemsCopy;
      }
      case "replace-cart-item": {
        const { oldIdentity, newProduct } = action.payload;
        const targetIndex = cartItemsCopy.findIndex((item) => {
          if (item.product._id !== oldIdentity._id) return false;
          return areArraysEqual(
            item.product.chosenFlavours || [],
            oldIdentity.chosenFlavours || []
          );
        });
        if (targetIndex !== -1) {
          const oldCount = cartItemsCopy[targetIndex].count;
          cartItemsCopy[targetIndex] = {
            product: newProduct,
            count: oldCount,
            getTotalCartItemPrice() {
              if (this.product.priceWithAddOns) {
                return this.product.priceWithAddOns * this.count;
              }
              return this.product.price * this.count;
            },
          };
        }
        return cartItemsCopy;
      }
      case "add-addon-to-item": {
        const { productId, chosenFlavours, addOns } = action.payload;
        return cartItemsCopy.map((item) => {
          if (
            item.product._id !== productId ||
            JSON.stringify(item.product.chosenFlavours) !== JSON.stringify(chosenFlavours)
          ) {
            return item;
          }

          const existing = item.product.addOns || {
            sauces: { price: 0, chosenSauces: [] },
            rocklets: { price: 0, included: false },
          };

          const mergedSauces =
            addOns.sauces?.chosenSauces ?? existing.sauces?.chosenSauces ?? [];
          const mergedRocklets =
            addOns.rocklets?.included !== undefined
              ? addOns.rocklets.included
              : existing.rocklets?.included || false;

          const saucePrice = addOns.sauces?.price || existing.sauces?.price || 0;
          const rockletsPrice = addOns.rocklets?.price || existing.rocklets?.price || 0;
          const newPriceWithAddOns =
            item.product.price +
            mergedSauces.length * saucePrice +
            (mergedRocklets ? rockletsPrice : 0);

          return {
            ...item,
            product: {
              ...item.product,
              addOns: {
                sauces: { price: saucePrice, chosenSauces: mergedSauces },
                rocklets: { price: rockletsPrice, included: mergedRocklets },
              },
              priceWithAddOns: newPriceWithAddOns,
            },
          };
        });
      }
      case "reset": {
        return [];
      }
    }
  }

  function getTotalCartPriceWithoutDiscount() {
    let total = 0;

    for (var i = 0; i < cartItems.length; i++) {
      total += cartItems[i].getTotalCartItemPrice();
    }
    return total;
  }

  return (
    <GlobalContext.Provider
      value={{
        getTotalCartPriceWithoutDiscount,
        cartItems,
        dispatch,
        ACTIONS,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
