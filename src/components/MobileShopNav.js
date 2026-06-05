import React, { useContext, useEffect, useState } from "react";
import { Link } from "gatsby";
import { toZonedTime } from "date-fns-tz";
import { GlobalContext } from "../context/GlobalContext";
import {
  FaClipboardList,
  FaMapMarkerAlt,
  FaShoppingCart,
  FaStore,
} from "react-icons/fa";

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=El%20Malambo%201733%2C%20Marcos%20Paz";
const TIME_ZONE = "America/Argentina/Buenos_Aires";

function getStoreStatus() {
  const argentinaTime = toZonedTime(new Date(), TIME_ZONE);
  const day = argentinaTime.getDay();
  const minutes = argentinaTime.getHours() * 60 + argentinaTime.getMinutes();
  const isWeekend = day === 0 || day === 6;
  const openingMinutes = isWeekend ? 13 * 60 : 20 * 60 + 30;
  const closingMinutes = 24 * 60;

  return minutes >= openingMinutes && minutes < closingMinutes;
}

export default function MobileShopNav({ currentPage }) {
  const { cartItems } = useContext(GlobalContext);
  const [isOpen, setIsOpen] = useState(false);
  const cartCount = cartItems.reduce((total, item) => total + item.count, 0);
  const isCart = currentPage === "cart";
  const primaryTarget = isCart ? "/catalogo" : "/carrito";
  const PrimaryIcon = isCart ? FaClipboardList : FaShoppingCart;

  useEffect(() => {
    const updateStatus = () => setIsOpen(getStoreStatus());

    updateStatus();
    const intervalId = setInterval(updateStatus, 60000);

    return () => clearInterval(intervalId);
  }, []);

  function scrollToFooter() {
    const workingHours = document.querySelector("footer .working-hours");
    const footer = document.querySelector("footer");
    const target = workingHours || footer;

    target?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    if (!workingHours) return;

    window.setTimeout(() => {
      workingHours.classList.remove("working-hours--highlight");
      void workingHours.offsetWidth;
      workingHours.classList.add("working-hours--highlight");
    }, 450);
  }

  return (
    <nav className="mobile-shop-nav" aria-label="Accesos rapidos de compra">
      <a
        href={MAPS_URL}
        className="mobile-shop-nav__info mobile-shop-nav__info--delivery"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaMapMarkerAlt aria-hidden="true" />
        <span>
          <strong>Entrega en</strong>
          <span>Marcos Paz</span>
          <small>y Santa Isabel</small>
        </span>
      </a>

      <Link
        to={primaryTarget}
        className={`mobile-shop-nav__primary ${
          isCart ? "mobile-shop-nav__primary--catalog" : "mobile-shop-nav__primary--cart"
        }`}
        aria-label={isCart ? "Volver al catalogo" : "Ir al carrito"}
      >
        <PrimaryIcon aria-hidden="true" />
        <span className="mobile-shop-nav__primary-label">
          {isCart ? "Menu" : "Carrito"}
        </span>
        {!isCart && cartCount > 0 && (
          <span className="mobile-shop-nav__badge">{cartCount}</span>
        )}
      </Link>

      <button
        type="button"
        className={`mobile-shop-nav__info mobile-shop-nav__info--status ${
          isOpen ? "mobile-shop-nav__info--open" : "mobile-shop-nav__info--closed"
        }`}
        aria-label="Ver horarios de atencion"
        onClick={scrollToFooter}
      >
        <FaStore aria-hidden="true" />
        <span>
          <strong>Horarios</strong>
          <span>{isOpen ? "Abierto ahora" : "Ver atencion"}</span>
        </span>
      </button>
    </nav>
  );
}
