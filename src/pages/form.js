import "../assets/scss/form.scss";
import { useState } from "react";
import { useContext } from "react";
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
  const products = data.allProduct.edges;
  const allFlavours = data.allFlavour.nodes;
  const [rockletsChecked, setRockletsChecked] = useState(false);
  const [mainMenuChosenFlavours, setMainMenuChosenFlavours] = useState([]);
  const [sauceMenuChosenFlavours, setSauceMenuChosenFlavours] = useState([]);
  if (!productIdParam) {
    return <p>Page not found</p>; // Or redirect to a 404 page
  }

  const product = products.find((product) => {
    return product.node._id === productIdParam;
  }).node;

  const saucePrice = products.find((product) => {
    return product.node.apiRoute === "generic/sauce";
  }).node.price;

  const rockletsProduct = products.find((product) => {
    return product.node.name.toLowerCase() === "rocklets";
  }).node;
  const rockletsPrice = rockletsProduct.price;

  const totalPrice =
    sauceMenuChosenFlavours.length * saucePrice +
    product.price +
    (rockletsChecked ? rockletsPrice : 0);

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

  function handleSubmit(e) {
    e.preventDefault();
    const buttonSubmitter = e.nativeEvent.submitter;
    const buttonName = buttonSubmitter.name;
    if (mainMenuChosenFlavours.length > 0) {
      dispatch({
        type: "add-cart-item",
        payload: {
          id: product._id,
          product: {
            ...product,
            addOns: {
              sauces: {
                price: saucePrice,
                chosenSauces:
                  sauceMenuChosenFlavours.length > 0
                    ? sauceMenuChosenFlavours
                    : undefined,
              },
              rocklets: { price: rockletsPrice, included: rockletsChecked },
            },
            priceWithAddOns: totalPrice,
            chosenFlavours:
              mainMenuChosenFlavours.length > 0
                ? mainMenuChosenFlavours
                : undefined,
          },
          quantity: 1,
        },
      });
      if (buttonName == "go to cart") {
        navigate("/carrito");
      } else {
        navigate("/catalogo");
      }
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
            <div className="rocklets-section">
              <div className="rocklets-card">
                <div className="rocklets-card__image">
                  {getImage(rockletsProduct.localImage) ? (
                    <GatsbyImage
                      image={getImage(rockletsProduct.localImage)}
                      alt={rockletsProduct.name}
                    />
                  ) : (
                    <img src={rockletsProduct.imgUrl} alt={rockletsProduct.name} />
                  )}
                </div>
                <div className="rocklets-card__content">
                  <strong>Rocklets</strong>
                  <span>${rockletsPrice}</span>
                </div>
                <button
                  className={`rocklets-toggle ${rockletsChecked ? "selected" : ""}`}
                  type="button"
                  aria-pressed={rockletsChecked}
                  onClick={() => setRockletsChecked((value) => !value)}
                >
                  <span>{rockletsChecked ? "Sí" : "No"}</span>
                </button>
              </div>
              <div className="addon-toggle">
                <button
                  className={rockletsChecked ? "selected" : ""}
                  type="button"
                  onClick={() => setRockletsChecked(true)}
                >
                  {rockletsChecked && <FaCheck aria-hidden="true" />}
                  Sí
                </button>
                <button
                  className={!rockletsChecked ? "selected" : ""}
                  type="button"
                  onClick={() => setRockletsChecked(false)}
                >
                  No
                </button>
              </div>
            </div>

            <section className="order-summary">
              <div className="choice-section__header">
                <div>
                  <p>Resumen</p>
                  <h2>Tu pedido</h2>
                </div>
              </div>
              <DetailsSection
                product={product}
                rocklets={{ price: rockletsPrice, included: rockletsChecked }}
                sauces={{
                  price: saucePrice,
                  chosenSauces: sauceMenuChosenFlavours,
                }}
                priceWithAddOns={totalPrice}
                chosenFlavours={mainMenuChosenFlavours}
              />
            </section>
          </>
        )}
        <div className="buttons-container">
          <button name="go to cart">Comprar ahora 🛒</button>
          <button name="go to catalog">
            <FaChevronLeft aria-hidden="true" />
            Seguir comprando
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
