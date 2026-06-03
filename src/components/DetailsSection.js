import React from "react";

const DetailsSection = ({
  product,
  rocklets,
  sauces,
  priceWithAddOns,
  chosenFlavours = [],
}) => {
  const hasAddOns = sauces.chosenSauces?.length > 0 || rocklets.included;

  return (
    <div className="details-section">
      <p>
        {product.name}:{" "}
        <span className={hasAddOns ? "" : "subtotal"}>${product.price}</span>
      </p>

      <h5>Sabores</h5>
      <ul>
        {chosenFlavours.length > 0 ? (
          chosenFlavours.map((flavour) => <li key={flavour}>{flavour}</li>)
        ) : (
          <li>Sin sabores seleccionados</li>
        )}
      </ul>

      {(sauces.chosenSauces?.length > 0 || rocklets.included) && (
        <div className="aderezos-section">
          <h5>Aderezos</h5>

          {sauces.chosenSauces?.length > 0 && (
            <p>
              <strong>Salsa de {sauces.chosenSauces[0]}</strong>
              <span>${sauces.price}</span>
            </p>
          )}

          {rocklets.included && (
            <p>
              <strong>Rocklets</strong>
              <span>${rocklets.price}</span>
            </p>
          )}
        </div>
      )}

      {hasAddOns && (
        <p>
          {product.name} + aderezos:
          <span className="subtotal">${priceWithAddOns}</span>
        </p>
      )}
    </div>
  );
};

export default DetailsSection;
