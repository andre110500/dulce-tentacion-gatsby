import React, { useContext, useEffect, useState } from "react";
import { Link } from "gatsby";
import { toZonedTime } from "date-fns-tz";
import { GlobalContext } from "../context/GlobalContext";
import {
  FaIceCream,
  FaMapMarkerAlt,
  FaShoppingCart,
  FaStore,
  FaWhatsapp,
} from "react-icons/fa";

const WHATSAPP_URL =
  "https://api.whatsapp.com/send?phone=5491121690959&text=Hola%20vengo%20de%20la%20pagina%20web%20oficial%20!";
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
  const PrimaryIcon = isCart ? FaIceCream : FaShoppingCart;

  useEffect(() => {
    const updateStatus = () => setIsOpen(getStoreStatus());

    updateStatus();
    const intervalId = setInterval(updateStatus, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <nav className="mobile-shop-nav" aria-label="Accesos rapidos de compra">
      <a
        href={MAPS_URL}
        className="mobile-shop-nav__info"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaMapMarkerAlt aria-hidden="true" />
        <span>
          <strong>Entrega en</strong>
          Marcos Paz
        </span>
      </a>

      <Link
        to={primaryTarget}
        className="mobile-shop-nav__primary"
        aria-label={isCart ? "Volver al catalogo" : "Ir al carrito"}
      >
        <PrimaryIcon aria-hidden="true" />
        {!isCart && cartCount > 0 && (
          <span className="mobile-shop-nav__badge">{cartCount}</span>
        )}
      </Link>

      <a
        href={WHATSAPP_URL}
        className={`mobile-shop-nav__info ${
          isOpen ? "mobile-shop-nav__info--open" : "mobile-shop-nav__info--closed"
        }`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {isOpen ? <FaWhatsapp aria-hidden="true" /> : <FaStore aria-hidden="true" />}
        <span>
          <strong>{isOpen ? "Abierto" : "Cerrado"}</strong>
          {isOpen ? "Pedinos ahora" : "Volvemos pronto"}
        </span>
      </a>
    </nav>
  );
}
