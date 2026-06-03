import "../assets/scss/header.scss";
import React from "react";
import { GlobalContext } from "../context/GlobalContext";
import { Link } from "gatsby";
import { useContext, useRef, useEffect, useState } from "react";
import cartIcon from "../images/cart.svg";
import { StaticImage } from "gatsby-plugin-image";

import Hamburger from "hamburger-react";

const tabsObj = ["Catalogo", "Kiosko", "Nosotros", "Galeria", "Testimonios"];

export default function Header() {
  const headerRef = useRef(null);

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

    //Update on mount and window resize

    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);
    //Cleanup the event listener

    return () => {
      window.removeEventListener("resize", updateHeaderHeight);
    };
  }, []);

  const [isOpen, setOpen] = useState(false);
  return (
    <header ref={headerRef}>
      <div className="content">
        <Link to="/" activeClassName="active">
          <StaticImage
            src="../images/logo-white.png"
            alt="Logo"
            placeholder="blurred"
            className="logo"
          />
        </Link>
        <div className="container">
          <nav>
            <Tabs />
          </nav>
          <input
            type="checkbox"
            id="checkbox"
            onChange={(e) => {
              console.log("change");
              setOpen(e.target.checked);
            }}
          />
          <label htmlFor="checkbox" className="overlay"></label>
          <Sidebar />

          <CartButton />
          <label
            className="hamburger-menu"
            htmlFor="checkbox"
            aria-label="Abrir menú"
          >
            <Hamburger toggled={isOpen} size={24} toggle={setOpen} />
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
