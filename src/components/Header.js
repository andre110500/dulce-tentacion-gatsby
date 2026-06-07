import "../assets/scss/header.scss";
import React from "react";
import { GlobalContext } from "../context/GlobalContext";
import { Link } from "gatsby";
import { useContext, useRef, useEffect, useState } from "react";
import cartIcon from "../images/cart.svg";
import BrandLogo from "./BrandLogo";

const tabsObj = ["Catalogo", "Nosotros", "Galeria", "Testimonios"];

export default function Header() {
  const headerRef = useRef(null);
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const headerHeight = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty(
          "--header-height",
          `${headerHeight}px`
        );
      }
    };

    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);

    return () => {
      window.removeEventListener("resize", updateHeaderHeight);
    };
  }, []);

  return (
    <header ref={headerRef}>
      <div className="content">
        <Link to="/" activeClassName="active">
          <BrandLogo variant="white" />
        </Link>
        <div className="container">
          <nav>
            <Tabs />
          </nav>
          <input
            type="checkbox"
            id="checkbox"
            checked={isOpen}
            onChange={(e) => setOpen(e.target.checked)}
          />
          <label htmlFor="checkbox" className="overlay"></label>
          <Sidebar />

          <CartButton />
          <label
            className="hamburger-menu"
            htmlFor="checkbox"
            aria-label={isOpen ? "Cerrar menu" : "Abrir menu"}
          >
            <span className={`hamburger-icon ${isOpen ? "is-open" : ""}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </label>
        </div>
      </div>
    </header>
  );
}

function CartButton() {
  const { cartItems } = useContext(GlobalContext);
  const [className, setClassName] = useState("as");
  const [isFirstMount, setIsFirstMount] = useState(true);

  useEffect(() => {
    if (isFirstMount) {
      setIsFirstMount(false);
      return;
    }

    setClassName("wobble-hor-bottom");
  }, [cartItems]);

  const totalItems = () => {
    let totalItems = 0;
    cartItems.forEach((item) => (totalItems += item.count));
    return totalItems;
  };
  return (
    <Link
      to="/carrito"
      className={className}
      id="cart-button"
      onAnimationEnd={() => setClassName("as")}
    >
      <img src={cartIcon} alt="shopping cart" />
      <span id="total-items" className="neon-green">
        {cartItems.length > 0 ? totalItems() : null}
      </span>
    </Link>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <Tabs />
    </aside>
  );
}

function Tabs() {
  return (
    <>
      {tabsObj.map((tab) => (
        <Link key={tab} to={`/${tab.toLowerCase()}`} activeClassName="active">
          {tab}
        </Link>
      ))}
    </>
  );
}
