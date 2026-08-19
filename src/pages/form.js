import "../assets/scss/form.scss";
import { useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { GlobalContext } from "../context/GlobalContext";
import React from "react";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { navigate } from "gatsby";
import { graphql } from "gatsby";
import DetailsSection from "../components/DetailsSection";
import SauceSelector from "../components/SauceSelector";
import {
  FaCheck,
  FaChevronLeft,
} from "react-icons/fa";

export default function IceCreamForm({ data, location }) {
  const { dispatch } = useContext(GlobalContext);
  const allParams = new URLSearchParams(location.search);
  const productIdParam = allParams.get("id");
  const editParam = allParams.get("edit");
  const products = data.allProduct.edges;
  const allFlavours = data.allFlavour.nodes;
  const editingItem = editParam ? JSON.parse(decodeURIComponent(editParam)) : null;

  const toggleAddonsProducts = products
    .filter((p) => p.node.type === "add-on" && !p.node.apiRoute && p.node.subType === "pot-topping")
    .map((p) => p.node);

  const [toggleAddonsState, setToggleAddonsState] = useState(() => {
    if (!editingItem?.addOns?.toggleAddons) return {};
    const state = {};
    for (const [key, addon] of Object.entries(editingItem.addOns.toggleAddons)) {
      state[key] = addon.included;
    }
    return state;
  });
  const [mainMenuChosenFlavours, setMainMenuChosenFlavours] = useState(
    editingItem?.chosenFlavours || []
  );
  const [sauceMenuChosenFlavours, setSauceMenuChosenFlavours] = useState(
    editingItem?.addOns?.sauces?.chosenSauces || []
  );

  useEffect(() => {
    document.body.classList.add("form-sticky-actions-active");

    return () => {
      document.body.classList.remove("form-sticky-actions-active");
    };
  }, []);

  if (!productIdParam) {
    return <p>Page not found</p>;
  }

  const product = products.find((product) => {
    return product.node._id === productIdParam;
  }).node;

  const saucePrice = products.find((product) => {
    return product.node.apiRoute === "generic/sauce";
  }).node.price;

  const toggleAddonsTotalPrice = toggleAddonsProducts.reduce((sum, addon) => {
    return sum + (toggleAddonsState[addon._id] ? addon.price : 0);
  }, 0);

  const totalPrice =
    sauceMenuChosenFlavours.length * saucePrice +
    product.price +
    toggleAddonsTotalPrice;

  const flavoursOfSelectedProduct = allFlavours.filter((flavour) => {
    return flavour.apiRoute === product.apiRoute;
  });
  const saucesFlavours = allFlavours.filter((flavour) => {
    return flavour.apiRoute === "generic/sauce";
  });

  //nuevo fin

  function handleMainMenuChange(e) {
    const { value, checked } = e.target;

    if (checked) {
      setMainMenuChosenFlavours((prev) => [...prev, value]);
    } else {
      setMainMenuChosenFlavours((prev) =>
        prev.filter((flavour) => flavour !== value)
      );
    }
  }

  function handleSauceMenuChange(e) {
    const { value, checked } = e.target;

    if (checked) {
      setSauceMenuChosenFlavours((prev) => [...prev, value]);
    } else {
      setSauceMenuChosenFlavours((prev) =>
        prev.filter((flavour) => flavour !== value)
      );
    }
  }

  function handleToggleAddon(key) {
    setToggleAddonsState((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const buttonSubmitter = e.nativeEvent.submitter;
    const buttonName = buttonSubmitter.name;
    if (mainMenuChosenFlavours.length > 0) {
      const toggleAddons = {};
      for (const addon of toggleAddonsProducts) {
        const key = addon._id;
        toggleAddons[key] = {
          name: addon.name,
          price: addon.price,
          included: !!toggleAddonsState[key],
        };
      }

      const newProduct = {
        ...product,
        addOns: {
          sauces: {
            price: saucePrice,
            chosenSauces:
              sauceMenuChosenFlavours.length > 0
                ? sauceMenuChosenFlavours
                : undefined,
          },
          toggleAddons,
        },
        priceWithAddOns: totalPrice,
        chosenFlavours:
          mainMenuChosenFlavours.length > 0
            ? mainMenuChosenFlavours
            : undefined,
      };

      if (editingItem) {
        dispatch({
          type: "replace-cart-item",
          payload: {
            oldIdentity: {
              _id: editingItem._id,
              chosenFlavours: editingItem.chosenFlavours,
            },
            newProduct,
          },
        });
      } else {
        dispatch({
          type: "add-cart-item",
          payload: {
            id: product._id,
            product: newProduct,
            quantity: 1,
          },
        });
      }

      navigate("/carrito");
    } else {
      Swal.fire(
        `Elige por lo menos un sabor`,
        "O es que queres un pote vacio ? :V",
        "warning"
      );
    }
  }

  function unorderedList(
    flavours,
    apiRoute,
    handleChange,
    chosenFlavours,
    namePrefix,
    maxSelections
  ) {
    const isSauce = apiRoute === "generic/sauce";
    const title =
      maxSelections === 1
        ? `Elegí ${isSauce ? `una salsa ($${saucePrice})` : "un sabor"}`
        : `Podés elegir hasta ${maxSelections} sabores`;

    return (
      <section className={`choice-section ${isSauce ? "choice-section--addons" : ""}`}>
        <div className="choice-section__header">
          <div>
            <p>{isSauce ? "Opcional" : "Paso principal"}</p>
            <h2>{title}</h2>
          </div>
          <span className="choice-section__counter">
            {maxSelections > 1 && (
              <>{chosenFlavours.length}/{maxSelections}</>
            )}
          </span>
        </div>

        <div className="choice-group">
          <h3>{isSauce ? "Salsas" : "Sabores"}</h3>
          <ul className={`container ${isSauce ? "container--sauces" : ""}`}>
            {flavours
              .filter((flavour) => !flavour.outOfStock)
              .map((flavour) => {
                const image = getImage(flavour.localImage);
                const isSelected = chosenFlavours.includes(flavour.name);
                const isDisabled =
                  !isSelected && chosenFlavours.length >= maxSelections;
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
  checked={isSelected}
  disabled={isDisabled}
  name={`${namePrefix}-flavour`}
  value={flavour.name}
  onChange={handleChange}
/>
                        {isSelected && (
                          <FaCheck className="check-icon" aria-hidden="true" />
                        )}
                        {isSauce && (
                          <span
                            className={`sauce-swatch sauce-swatch--${sauceClass}`}
                            aria-hidden="true"
                          />
                        )}
                        {!isSauce && image && (
                          <GatsbyImage image={image} alt={flavour.name} />
                        )}
                        {!isSauce && !image && flavour.imgUrl && (
                          <img
                            className="flavour-image"
                            src={flavour.imgUrl}
                            alt={flavour.name}
                            loading="lazy"
                          />
                        )}
                      </div>
                    </label>
                  </li>
                );
              })}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <main id="ice-cream-list">
      <form onSubmit={handleSubmit}>
        <section className="form-hero">
          <div className="form-hero__image">
            {getImage(product.localImage) ? (
              <GatsbyImage image={getImage(product.localImage)} alt={product.name} />
            ) : (
              <img src={product.imgUrl} alt={product.name} />
            )}
          </div>
          <div className="form-hero__copy">
            <p>Armá tu pedido</p>
            <h1>{product.name}</h1>
            {product.description && <span>{product.description}</span>}
          </div>
        </section>
        {<h1>{product.name} 🍨</h1>}

        {unorderedList(
          flavoursOfSelectedProduct,
          product.apiRoute,
          handleMainMenuChange,
          mainMenuChosenFlavours,
          "main",
          product.flavours || 1
        )}

        {product.apiRoute === "generic/flavour" && (
          <section className="choice-section choice-section--addons">
            <div className="choice-section__header">
              <div>
                <p>Opcional</p>
                <h2>Elegí una salsa (${saucePrice})</h2>
              </div>
            </div>
            <div className="choice-group">
              <h3>Salsas</h3>
              <SauceSelector
                sauces={saucesFlavours}
                chosenSauces={sauceMenuChosenFlavours}
                onChange={handleSauceMenuChange}
                maxSelections={1}
                namePrefix="sauce"
              />
            </div>
          </section>
        )}

        {product.apiRoute === "generic/flavour" && (
          <>
            {toggleAddonsProducts.map((addon) => {
              const key = addon._id;
              const isChecked = !!toggleAddonsState[key];
              return (
                <div className="addon-section" key={key}>
                  <div className="addon-card">
                    <div className="addon-card__image">
                      {getImage(addon.localImage) ? (
                        <GatsbyImage
                          image={getImage(addon.localImage)}
                          alt={addon.name}
                        />
                      ) : (
                        <img src={addon.imgUrl} alt={addon.name} />
                      )}
                    </div>
                    <div className="addon-card__content">
                      <strong>{addon.name}</strong>
                      <span>${addon.price}</span>
                    </div>
                    <button
                      className={`addon-toggle-btn ${isChecked ? "selected" : ""}`}
                      type="button"
                      aria-pressed={isChecked}
                      onClick={() => handleToggleAddon(key)}
                    >
                      <span>{isChecked ? "Sí" : "No"}</span>
                    </button>
                  </div>
                  <div className="addon-toggle">
                    <button
                      className={isChecked ? "selected" : ""}
                      type="button"
                      onClick={() => setToggleAddonsState((prev) => ({ ...prev, [key]: true }))}
                    >
                      {isChecked && <FaCheck aria-hidden="true" />}
                      Sí
                    </button>
                    <button
                      className={!isChecked ? "selected" : ""}
                      type="button"
                      onClick={() => setToggleAddonsState((prev) => ({ ...prev, [key]: false }))}
                    >
                      No
                    </button>
                  </div>
                </div>
              );
            })}

            <section className="order-summary">
              <div className="choice-section__header">
                <div>
                  <p>Resumen</p>
                  <h2>Tu pedido</h2>
                </div>
              </div>
              <DetailsSection
                product={product}
                toggleAddons={toggleAddonsProducts.reduce((acc, addon) => {
                  const key = addon._id;
                  acc[key] = { name: addon.name, price: addon.price, included: !!toggleAddonsState[key] };
                  return acc;
                }, {})}
                sauces={{
                  price: saucePrice,
                  chosenSauces: sauceMenuChosenFlavours,
                }}
                priceWithAddOns={totalPrice}
                chosenFlavours={mainMenuChosenFlavours}
                flavourMap={Object.fromEntries(
                  (() => {
                    const seen = {};
                    allFlavours.forEach((f) => {
                      const key = f.name.toLowerCase();
                      if (!seen[key] || f.apiRoute === "generic/flavour") {
                        seen[key] = f;
                      }
                    });
                    return Object.entries(seen);
                  })()
                )}
              />
            </section>
          </>
        )}
        <div className="buttons-container">
          <button name="go to cart">{editingItem ? "Guardar cambios" : "Comprar ahora"} 🛒</button>
          <button
            type={editingItem ? "button" : "submit"}
            name={editingItem ? undefined : "go to catalog"}
            onClick={editingItem ? () => navigate("/carrito") : undefined}
          >
            <FaChevronLeft aria-hidden="true" />
            {editingItem ? "Cancelar" : "Seguir comprando"}
          </button>
        </div>
      </form>
    </main>
  );
}

export const query = graphql`
  query MyQueryTwo {
    allProduct {
      edges {
        node {
          price
          localImage {
            childImageSharp {
              gatsbyImageData(
                width: 160
                height: 160
                layout: FIXED
                placeholder: BLURRED
              )
            }
          }
          outOfStock
          name
          description
          imgUrl
          _id
          flavours
          apiRoute
          type
          subType
        }
      }
    }
    allFlavour {
      nodes {
        apiRoute

        name
        imgUrl
        outOfStock

        localImage {
          absolutePath
          childImageSharp {
            gatsbyImageData(width: 48, height: 48, layout: CONSTRAINED)
          }
        }
      }
    }
  }
`;
