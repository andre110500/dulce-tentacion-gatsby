import React, { useRef, useState } from "react";
import { GlobalContext } from "../context/GlobalContext";
import { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { navigate } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import DetailsSection from "./DetailsSection";
import SauceSelector from "./SauceSelector";
import { SharedCardDescription } from "./SharedCardSections";
import { FaMinus, FaPlus, FaTrashAlt, FaIceCream } from "react-icons/fa";

async function handleToggleRocklets(dispatch, product) {
  const current = product.addOns?.rocklets?.included || false;
  dispatch({
    type: "add-addon-to-item",
    payload: {
      productId: product._id,
      chosenFlavours: product.chosenFlavours,
      addOns: {
        rocklets: {
          price: product.addOns?.rocklets?.price || 1500,
          included: !current,
        },
      },
    },
  });
}

export default function CartItem({ cartItem, sauceFlavours, allFlavours }) {
  const { dispatch } = useContext(GlobalContext);
  const product = cartItem.product;
  const image = getImage(product.localImage);
  const inputRef = useRef(null);
  const [showSauceSelector, setShowSauceSelector] = useState(false);

  const currentSauces = product.addOns?.sauces?.chosenSauces || [];
  const saucePrice = product.addOns?.sauces?.price || 500;

  const flavourMap = React.useMemo(() => {
    if (!allFlavours) return {};
    const map = {};
    allFlavours.forEach((f) => {
      map[f.name.toLowerCase()] = f;
    });
    return map;
  }, [allFlavours]);

  function handleSauceChange(e) {
    const { value, checked } = e.target;
    if (checked) {
      dispatch({
        type: "add-addon-to-item",
        payload: {
          productId: product._id,
          chosenFlavours: product.chosenFlavours,
          addOns: {
            sauces: {
              price: saucePrice,
              chosenSauces: [value],
            },
          },
        },
      });
      setShowSauceSelector(false);
    } else {
      dispatch({
        type: "add-addon-to-item",
        payload: {
          productId: product._id,
          chosenFlavours: product.chosenFlavours,
          addOns: {
            sauces: {
              price: saucePrice,
              chosenSauces: [],
            },
          },
        },
      });
    }
  }

  return (
    <div className="product-card cart-product-card">
      <button
        className="remove"
        type="button"
        aria-label={`Quitar ${product.name} del carrito`}
        onClick={() =>
          dispatch({
            type: "remove-stack",
            payload: { product: product },
          })
        }
      >
        <FaTrashAlt aria-hidden="true" />
      </button>
      <div className="image-container">
        {image ? (
          <GatsbyImage image={image} alt={product.name} />
        ) : product.imgUrl ? (
          <img src={product.imgUrl} alt={product.name} />
        ) : (
          <div className="image-placeholder" aria-hidden="true">
            DT
          </div>
        )}
      </div>
      {!product.chosenFlavours && (
        <>
          <SharedCardDescription product={product} units={cartItem.count} />
          <div className="quantity">
            <button
              type="button"
              onClick={() => {
                dispatch({
                  type: "remove-cart-item",
                  payload: { product: product, quantity: 1 },
                });
                inputRef.current.value = cartItem.count - 1;
              }}
            >
              <FaMinus aria-hidden="true" />
            </button>
            <input
              ref={inputRef}
              required
              type="number"
              defaultValue={cartItem.count}
              onBlur={(e) => {
                if (e.target.value === "") {
                  e.target.value = 1;
                }
                const newValue = parseInt(e.target.value, 10);
                const currentCount = cartItem.count;

                if (newValue > currentCount) {
                  const difference = newValue - currentCount;
                  dispatch({
                    type: "add-cart-item",
                    payload: { product: product, quantity: difference },
                  });
                } else if (newValue < currentCount) {
                  const difference = currentCount - newValue;
                  dispatch({
                    type: "remove-cart-item",
                    payload: { product: product, quantity: difference },
                  });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.target.blur();
                }
              }}
              min="0"
            />
            <button
              type="button"
              onClick={() => {
                dispatch({
                  type: "add-cart-item",
                  payload: { product: product, quantity: 1 },
                });
                inputRef.current.value = cartItem.count + 1;
              }}
            >
              <FaPlus aria-hidden="true" />
            </button>
          </div>
        </>
      )}
      {product.chosenFlavours && product.addOns && (
        <DetailsSection
          product={product}
          rocklets={{
            price: product.addOns.rocklets?.price || 1500,
            included: product.addOns.rocklets?.included || false,
          }}
          priceWithAddOns={product.priceWithAddOns}
          sauces={{
            price: product.addOns.sauces?.price || 500,
            chosenSauces: currentSauces,
          }}
          chosenFlavours={product.chosenFlavours}
          flavourMap={flavourMap}
          onChangeFlavours={() =>
            navigate(`/form?id=${product._id}`, { state: { editingItem: product } })
          }
        />
      )}
      {product.chosenFlavours && (
        <div className="cart-addon-buttons">
          <button type="button" className="addon-btn" onClick={() => setShowSauceSelector((v) => !v)}>
            <FaIceCream aria-hidden="true" /> {currentSauces.length > 0 ? "Cambiar salsa" : "Agregar salsa"}
          </button>
          <button type="button" className="addon-btn" onClick={() => handleToggleRocklets(dispatch, product)}>
            <FaIceCream aria-hidden="true" /> {product.addOns?.rocklets?.included ? "Quitar rocklets" : "Agregar rocklets"}
          </button>
        </div>
      )}
      <AnimatePresence>
        {showSauceSelector && sauceFlavours && (
          <motion.div
            className="cart-sauce-selector"
            key="sauce-selector"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <SauceSelector
              sauces={sauceFlavours}
              chosenSauces={currentSauces}
              onChange={handleSauceChange}
              maxSelections={1}
              namePrefix={`sauce-${product._id}`}
              disableWhenMaxed={false}
            />
            <button type="button" className="addon-btn cancel" onClick={() => setShowSauceSelector(false)}>
              Cancelar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
