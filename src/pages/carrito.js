import "../assets/scss/carrito.scss";
import React, { useEffect, useState, useRef } from "react";
import { GlobalContext } from "../context/GlobalContext";

import { useContext } from "react";
import { Link, graphql, useStaticQuery } from "gatsby";

import Swal from "sweetalert2";
import { createWhatsAppLink, createMessage } from "../logic/whatsappLink";

import CartItem from "../components/CartItem";
import SummarySection from "../components/SummarySection";
import DeliverySection from "../components/DeliverySection";
import { BannerSection } from "../components/BannerSection";

import { FaArrowRight, FaCopy } from "react-icons/fa";
import { TbCopyCheckFilled } from "react-icons/tb";

import { triggerAlert } from "../context/GlobalContext";
import { StaticImage } from "gatsby-plugin-image";
import MobileShopNav from "../components/MobileShopNav";
export default function Cart() {
  const { dispatch, cartItems, getTotalCartPriceWithoutDiscount } =
    useContext(GlobalContext);
  const [deliveryInfo, setDeliveryInfo] = useState({});
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [textCopied, setTextCopied] = useState(false);

  const flavourData = useStaticQuery(graphql`
    query CartSauceFlavours {
      allFlavour {
        nodes {
          apiRoute
          name
          outOfStock
          localImage {
            childImageSharp {
              gatsbyImageData(width: 48, height: 48, layout: FIXED)
            }
          }
        }
      }
    }
  `);
  const sauceFlavours = flavourData.allFlavour.nodes.filter(
    (flavour) => flavour.apiRoute === "generic/sauce"
  );

  function getAllIceCreamDiscounts() {
    function countFlavourAppearances(flavour) {
      const count = cartItems.reduce((acc, item) => {
        if (item.product.flavours === flavour) {
          return acc + item.count; // Add the count of this item to the accumulator
        }
        return acc; // Return the accumulator unchanged if the flavour doesn't match
      }, 0);
      console.log(`Flavour: ${flavour}, Total Appearances: ${count}`); // Log the flavour and its total count
      return count;
    }

    function getDiscountAmount(flavourCount) {
      const discountMap = {
        2: 300,
        3: 500,
      };
      const amount = discountMap[flavourCount] || 0; // Return 0 if no discount
      console.log(`Flavour Count: ${flavourCount}, Discount Amount: ${amount}`); // Log the flavour count and discount amount
      return amount;
    }

    function getIceCreamName(flavourCount) {
      const flavourNames = {
        2: "1/4 kg",
        3: "1/2 kg",
      };
      const name = flavourNames[flavourCount] || ""; // Return empty string if no match
      console.log(`Flavour Count: ${flavourCount}, Ice Cream Name: ${name}`); // Log the flavour count and ice cream name
      return name;
    }

    function calculateDiscountsForFlavour(flavourCount) {
      const appearances = countFlavourAppearances(flavourCount);
      const numberOfCombos = Math.floor(appearances / 2);
      const discountAmount = getDiscountAmount(flavourCount);
      const iceCreamName = getIceCreamName(flavourCount);

      console.log(
        `Calculating Discounts for Flavour Count: ${flavourCount}, Appearances: ${appearances}, Number of Combos: ${numberOfCombos}`
      ); // Log the number of combos

      return Array.from({ length: numberOfCombos }, () => ({
        name: `Descuento 2u ${iceCreamName}`,
        amount: discountAmount,
      }));
    }

    const discounts = [];
    for (let flavourCount = 2; flavourCount <= 3; flavourCount++) {
      discounts.push(...calculateDiscountsForFlavour(flavourCount));
    }

    console.log(`Final Discounts:`, discounts); // Log the final discounts array
    return discounts;
  }

  function getTotalDiscountAmmount() {
    let total = 0;
    getAllIceCreamDiscounts().forEach((discount) => {
      total += discount.amount;
    });
    return total;
  }

  function getTotalCartPriceWithDiscount() {
    return getTotalCartPriceWithoutDiscount() - getTotalDiscountAmmount();
  }

  //get deliveryInfo from localStorage if there is any
  //and populate form with it
  useEffect(() => {
    let deliveryInfoString = localStorage.getItem("deliveryInfo");

    if (deliveryInfoString) {
      const deliveryInfo = JSON.parse(deliveryInfoString);

      setDeliveryInfo({ ...deliveryInfo });
    }
  }, []);

  //add deliveryInfo to localStorage on every state update
  useEffect(() => {
    //save  deliveryInfo to local storage
    if (Object.keys(deliveryInfo).length > 0) {
      const deliveryInfoString = JSON.stringify(deliveryInfo);
      localStorage.setItem("deliveryInfo", deliveryInfoString);
    }

    ///////////////////////////
  }, [deliveryInfo]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (e.target.checkValidity()) {
      console.log(paymentMethod);
      const messageData = {
        cartItems,
        paymentMethod,
        deliveryInfo,
        totalCartPriceWithoutDiscount: getTotalCartPriceWithoutDiscount(),
        totalCartPriceWithDiscount: getTotalCartPriceWithDiscount(),
        totalDiscountAmmount: getTotalDiscountAmmount(),
        allIceCreamDiscounts: getAllIceCreamDiscounts(),
      };

      const whatsappLink = createWhatsAppLink(messageData);

      // Create a promise that resolves after 5 seconds
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(resolve, 5000);
      });

      try {
        // Race between the fetch and the timeout
        const response = await Promise.race([
          fetch("https://submit-form.com/L6kPWEs29", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: createMessage(messageData) }),
          }),
          timeoutPromise,
        ]);

        if (response && response.json) {
          const data = await response.json();
          console.log("Success:", data);
        }
      } catch (error) {
        console.error("Error:", error);
      }

      // Show success message and continue with the flow
      Swal.fire({
        title: "Gracias!",
        html: `En caso de no haberse enviado el mensaje con tu pedido reintentalo <a href="${whatsappLink}" target="_blank">acá</a>.`,
        icon: "info",
        confirmButtonText: "OK",
      });

      // Reset the cart and redirect
      dispatch({ type: "reset" });
      window.scrollTo(0, 0);

      // Check if device is mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        // On mobile, try to open WhatsApp app
        // If the app is installed and the browser has permission to open it, this will open it
        // If not, it will fall back to WhatsApp Web in a new tab
        window.location.href = whatsappLink;
      } else {
        // On PC, always open in new tab
        window.open(whatsappLink, "_blank");
      }
    } else {
      const formElements = e.target.elements;
      for (const element of formElements) {
        e.target.reportValidity();
      }
      // Focus the first invalid field manually
      //fallback for firefox on mobile
      const form = e.target;
      const firstInvalid = form.querySelector(":invalid");
      if (firstInvalid) {
        firstInvalid.focus();
      }
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setTextCopied(true);
      triggerAlert("Alias copiado al portapapeles");
      console.log("Copied to clipboard: " + text); // Optional: Show a confirmation
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  ///////////////////////////
  return (
    <main id="cart" className={cartItems.length === 0 ? "cart-empty-page" : ""}>
      <div className="content">
        <BannerSection h2="Acá podés completar tu pedido" h1="Carrito">
          <StaticImage src="../images/cart-banner.jpg" />
        </BannerSection>

        {cartItems.length > 0 ? (
          <>
            <div className="container">
              <section className="product-cards">
                {cartItems.map((cartItem, index) => {
                  return (
                    <CartItem cartItem={cartItem} sauceFlavours={sauceFlavours} key={`cart-item-${index}`} />
                  );
                })}
              </section>
              <form
                noValidate
                id="checkout-form"
                autoComplete="on"
                onSubmit={(e) => handleSubmit(e)}
              >
                {cartItems.length > 1 && (
                  <SummarySection
                    isDeliveryChecked={deliveryInfo.isChecked}
                    getTotalCartPriceWithDiscount={
                      getTotalCartPriceWithDiscount
                    }
                    getAllIceCreamDiscounts={getAllIceCreamDiscounts}
                  />
                )}
                <DeliverySection
                  handleSubmit={handleSubmit}
                  deliveryInfo={deliveryInfo}
                  setDeliveryInfo={setDeliveryInfo}
                />

                <section className="payment options">
                  <label
                    className={`option ${paymentMethod === "cash" && "checked"
                      }`}
                  >
                    <span>Efectivo</span>
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      required
                      onClick={(e) => {
                        setPaymentMethod(e.target.value);
                      }}
                    />
                  </label>

                  <label
                    className={`option ${paymentMethod === "transfer" && "checked"
                      }`}
                  >
                    <span>Transferencia</span>
                    <input
                      type="radio"
                      name="payment"
                      value="transfer"
                      onClick={(e) => {
                        setPaymentMethod(e.target.value);
                      }}
                    />
                  </label>
                  {paymentMethod === "transfer" && (
                    <>
                      <p
                        className="alias"
                        onClick={() =>
                          copyToClipboard(process.env.GATSBY_ALIAS)
                        }
                      >
                        Alias :{" "}
                        <span style={{ color: "blue" }}>
                          {process.env.GATSBY_ALIAS}
                        </span>
                        {textCopied ? (
                          <TbCopyCheckFilled size={"1.3rem"} />
                        ) : (
                          <FaCopy size={"1.3rem"} />
                        )}
                      </p>
                      <p className="titular">
                        Titular:
                        <span>{process.env.GATSBY_OWNER}</span>
                      </p>
                    </>
                  )}
                </section>

                <button type="submit" form="checkout-form">
                  Finalizar
                </button>
              </form>
            </div>
            <p className="info">
              Al presionar "Finalizar", se abrirá un chat de WhatsApp con toda
              la info de tu pedido pre-cargada. Solo deberás enviarla y nosotros
              haremos el resto.
            </p>
          </>
        ) : (
          <div className="empty">
            <StaticImage
              src="../images/sad-shopping-cart.png"
              alt="Carrito vacio"
              placeholder="blurred"
              className="sad-shopping-cart"
            />
            <p>No hay nada acá, ¿por qué no agregás algo?</p>
            <Link to="/catalogo" className="empty-cta">
              Ver catálogo
              <FaArrowRight aria-hidden="true" />
            </Link>
            <StaticImage
              src="../images/anime-girl-thinking.png"
              alt=""
              placeholder="blurred"
              className="empty-character"
            />
          </div>
        )}
      </div>
      <MobileShopNav currentPage="cart" />
    </main>
  );
}
