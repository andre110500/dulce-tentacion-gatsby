import React from "react";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { motion, AnimatePresence } from "framer-motion";
import RockletsIcon from "./RockletsIcon";

function FlavourThumb({ flavour, flavourMap }) {
  const data = flavourMap[flavour.toLowerCase()];
  const image = data ? getImage(data.localImage) : null;

  return (
    <div className="flavour-thumb" title={flavour}>
      <div className="flavour-thumb__image">
        {image ? (
          <GatsbyImage
            image={image}
            alt={flavour}
            imgStyle={{ objectFit: "cover" }}
          />
        ) : data?.imgUrl ? (
          <img src={data.imgUrl} alt={flavour} />
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

function SauceBadge({ sauce, price }) {
  const sauceClass = sauce
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");

  return (
    <span className="sauce-badge">
      <span className={`sauce-swatch sauce-swatch--${sauceClass}`} />
      <span>Salsa de {sauce}</span>
      {price != null && <span className="sauce-badge__price">${price}</span>}
    </span>
  );
}

const DetailsSection = ({
  product,
  rocklets,
  sauces,
  priceWithAddOns,
  chosenFlavours = [],
  flavourMap = {},
}) => {
  const hasAddOns = sauces.chosenSauces?.length > 0 || rocklets.included;

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
              <FlavourThumb key={flavour} flavour={flavour} flavourMap={flavourMap} />
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
                  <SauceBadge sauce={s} price={sauces.price} />
                </motion.span>
              ))}
            {rocklets.included && (
              <motion.span
                key="rocklets"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.35 }}
                style={{ display: "inline-flex" }}
              >
                <span className="rocklets-badge">
                  <span className="rocklets-badge__icon">
                    <RockletsIcon size={16} />
                  </span>
                  <span>Rocklets</span>
                  <span className="rocklets-badge__price">${rocklets.price}</span>
                </span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default DetailsSection;
