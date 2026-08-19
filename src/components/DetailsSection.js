import React from "react";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { motion, AnimatePresence } from "framer-motion";

import { FaTimes } from "react-icons/fa";

import RockletsIcon from "./RockletsIcon";
import WhiteChocolateDropsIcon from "./WhiteChocolateDropsIcon";

function FlavourThumb({ flavour, flavourMap, allFlavours }) {
  const data = flavourMap[flavour.toLowerCase()];
  const fallback = allFlavours?.find((f) => f.name.toLowerCase() === flavour.toLowerCase());
  const source = data || fallback;
  const image = source ? getImage(source.localImage) : null;

  return (
    <div className="flavour-thumb" title={flavour}>
      <div className="flavour-thumb__image">
        {image ? (
          <GatsbyImage
            image={image}
            alt={flavour}
            imgStyle={{ objectFit: "cover" }}
          />
        ) : source?.imgUrl ? (
          <img src={source.imgUrl} alt={flavour} />
        ) : (
          <div className="flavour-thumb--fallback">
            <span>{flavour[0]}</span>
          </div>
        )}
      </div>
      <span className="flavour-thumb__label">{flavour}</span>
    </div>
  );
}

function SauceBadge({ sauce, price, onRemove }) {
  const sauceClass = sauce
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");

  return (
    <span
      className={`sauce-badge${onRemove ? " sauce-badge--removable" : ""}`}
      onClick={onRemove}
      role={onRemove ? "button" : undefined}
      tabIndex={onRemove ? 0 : undefined}
    >
      <span className={`sauce-swatch sauce-swatch--${sauceClass}`} />
      <span>Salsa de {sauce}</span>
      {price != null && <span className="sauce-badge__price">${price}</span>}
      {onRemove && (
        <span className="sauce-badge__remove">
          <FaTimes size={10} />
        </span>
      )}
    </span>
  );
}

const DetailsSection = ({
  product,
  toggleAddons = {},
  sauces,
  priceWithAddOns,
  chosenFlavours = [],
  flavourMap = {},
  allFlavours,
  onChangeFlavours,
  onRemoveAddon,
  onRemoveSauce,
}) => {
  const hasAddOns =
    sauces.chosenSauces?.length > 0 ||
    Object.values(toggleAddons).some((a) => a.included);

  return (
    <div className="details-section">
      <p className="details-section__title">
        {product.name}
        <span className="details-section__price">
          {hasAddOns ? (
            <>
              <span className="details-section__price-base">${product.price}</span>
              <span className="details-section__price-sep">&rarr;</span>
              ${priceWithAddOns}
            </>
          ) : (
            `$${product.price}`
          )}
        </span>
      </p>

      {chosenFlavours.length > 0 && (
        <div className="flavours-row">
          <span className="details-section__label">Sabores</span>
          <div className="flavours-row__list">
            {chosenFlavours.map((flavour) => (
              <FlavourThumb key={flavour} flavour={flavour} flavourMap={flavourMap} allFlavours={allFlavours} />
            ))}
          </div>
        </div>
      )}

      <div className={`aderezos-section${hasAddOns ? "" : " aderezos-section--empty"}`}>
        {hasAddOns && <span className="details-section__label">Aderezos</span>}
        <div className="aderezos-list">
          <AnimatePresence>
            {sauces.chosenSauces?.length > 0 &&
              sauces.chosenSauces.map((s) => (
                <motion.span
                  key={`sauce-${s}`}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.35 }}
                  style={{ display: "inline-flex" }}
                >
                  <SauceBadge sauce={s} price={sauces.price} onRemove={onRemoveSauce ? () => onRemoveSauce() : undefined} />
                </motion.span>
              ))}
            {Object.entries(toggleAddons).map(([key, addon]) => (
              addon.included && (
                <motion.span
                  key={key}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.35 }}
                  style={{ display: "inline-flex" }}
                >
                  <span
                    className={`addon-badge${onRemoveAddon ? " addon-badge--removable" : ""}`}
                    onClick={onRemoveAddon ? () => onRemoveAddon(key) : undefined}
                    role={onRemoveAddon ? "button" : undefined}
                    tabIndex={onRemoveAddon ? 0 : undefined}
                  >
                    {key === "rocklets" && (
                      <span className="addon-badge__icon">
                        <RockletsIcon size={16} />
                      </span>
                    )}
                    {key === "gotas de chocolate blanco" && (
                      <span className="addon-badge__icon">
                        <WhiteChocolateDropsIcon size={16} />
                      </span>
                    )}
                    <span>{addon.name}</span>
                    <span className="addon-badge__price">${addon.price}</span>
                    {onRemoveAddon && (
                      <span className="addon-badge__remove">
                        <FaTimes size={10} />
                      </span>
                    )}
                  </span>
                </motion.span>
              )
            ))}
          </AnimatePresence>
        </div>
      </div>


    </div>
  );
};

export default DetailsSection;
