import React from "react";
import { FaCheck } from "react-icons/fa";

export default function SauceSelector({
  sauces,
  chosenSauces,
  onChange,
  maxSelections = 1,
  namePrefix = "sauce",
  disableWhenMaxed = true,
}) {
  return (
    <div className="sauce-selector">
      <ul className="container container--sauces">
        {sauces
          .filter((flavour) => !flavour.outOfStock)
          .map((flavour) => {
            const isSelected = chosenSauces.includes(flavour.name);
            const isDisabled =
              disableWhenMaxed && !isSelected && chosenSauces.length >= maxSelections;
            const sauceClass = flavour.name
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/\s+/g, "-");

            return (
              <li key={flavour.name}>
                <label
                  className={`${isSelected ? "selected" : ""} ${
                    isDisabled ? "disabled" : ""
                  }`}
                  htmlFor={`${namePrefix}-${flavour.name}`}
                >
                  <span>{flavour.name}</span>
                  <div>
                    <input
                      id={`${namePrefix}-${flavour.name}`}
                      type="checkbox"
                      disabled={isDisabled}
                      name={`${namePrefix}-flavour`}
                      value={flavour.name}
                      onChange={onChange}
                    />
                    {isSelected && (
                      <FaCheck className="check-icon" aria-hidden="true" />
                    )}
                    <span
                      className={`sauce-swatch sauce-swatch--${sauceClass}`}
                      aria-hidden="true"
                    />
                  </div>
                </label>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
