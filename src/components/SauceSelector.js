import React from "react";
import { motion, AnimatePresence } from "framer-motion";
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
                      checked={isSelected}
                      onChange={onChange}
                    />
                    <AnimatePresence>
                      {isSelected && (
                        <motion.span
                          key="check"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{ duration: 0.25 }}
                          style={{ display: "flex" }}
                        >
                          <FaCheck className="check-icon" aria-hidden="true" />
                        </motion.span>
                      )}
                    </AnimatePresence>
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
