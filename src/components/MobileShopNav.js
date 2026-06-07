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
  const [viewportOffset, setViewportOffset] = useState(0);
  const viewportLock = React.useRef({ height: null, width: null });
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

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    let frameId;

    const updateViewportOffset = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        const viewport = window.visualViewport;
        const currentHeight = viewport?.height || window.innerHeight;
        const currentWidth = viewport?.width || window.innerWidth;
        const lock = viewportLock.current;
        const widthChanged =
          lock.width !== null && Math.abs(currentWidth - lock.width) > 24;

        if (lock.height === null || widthChanged) {
          lock.height = currentHeight;
          lock.width = currentWidth;
        }

        lock.height = Math.min(lock.height, currentHeight);
        lock.width = currentWidth;

        setViewportOffset(Math.max(0, Math.round(currentHeight - lock.height)));
      });
    };

    updateViewportOffset();
    window.addEventListener("resize", updateViewportOffset);
    window.visualViewport?.addEventListener("resize", updateViewportOffset);
    window.visualViewport?.addEventListener("scroll", updateViewportOffset);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updateViewportOffset);
      window.visualViewport?.removeEventListener("resize", updateViewportOffset);
      window.visualViewport?.removeEventListener("scroll", updateViewportOffset);
    };
  }, []);

  function scrollToFooterSection(targetSelector, highlightSelectors) {
    const targetSection = document.querySelector(targetSelector);
    const footer = document.querySelector("footer");
    const target = targetSection || footer;

    target?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    const highlightedElements = highlightSelectors
      .map((selector) => document.querySelector(selector))
      .filter(Boolean);

    if (highlightedElements.length === 0) return;

    window.setTimeout(() => {
      highlightedElements.forEach((element) => {
        element.classList.remove("footer-highlight");
      });
      void highlightedElements[0].offsetWidth;
      highlightedElements.forEach((element) => {
        element.classList.add("footer-highlight");
      });
    }, 450);
  }

  return (
    <nav
      className="mobile-shop-nav"
      aria-label="Accesos rapidos de compra"
      style={{
        "--mobile-shop-nav-y-offset": `-${viewportOffset}px`,
        "--mobile-shop-nav-bottom-offset": `${viewportOffset}px`,
      }}
    >
      <button
        type="button"
        className="mobile-shop-nav__info mobile-shop-nav__info--delivery"
        aria-label="Ver zonas de entrega y ubicacion"
        onClick={() =>
          scrollToFooterSection("footer .location", [
            "footer .location",
            "footer .footer-map-link",
          ])
        }
      >
        <FaMapMarkerAlt aria-hidden="true" />
        <span>
          <strong>Entrega en</strong>
          <span>Marcos Paz</span>
          <small>y Santa Isabel</small>
        </span>
      </button>

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
        onClick={() =>
          scrollToFooterSection("footer .working-hours", ["footer .working-hours"])
        }
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
