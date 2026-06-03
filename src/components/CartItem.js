import React, { useRef } from "react";
import { GlobalContext } from "../context/GlobalContext";
import { useContext } from "react";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import DetailsSection from "./DetailsSection";
import { SharedCardDescription } from "./SharedCardSections";
import { FaMinus, FaPlus, FaTrashAlt } from "react-icons/fa";
export default function CartItem({ cartItem }) {
  const { dispatch } = useContext(GlobalContext);
  const product = cartItem.product;
  const image = getImage(product.localImage);
  const inputRef = useRef(null);

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
      {product.chosenFlavours && (
        <DetailsSection
          product={product}
          rocklets={{
            price: product.addOns.rocklets.price,
            included: product.addOns.rocklets.included,
          }}
          priceWithAddOns={product.priceWithAddOns}
          sauces={{
            price: product.addOns.sauces.price,
            chosenSauces: product.addOns.sauces.chosenSauces,
          }}
          chosenFlavours={product.chosenFlavours}
        />
      )}
    </div>
  );
}
