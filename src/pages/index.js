////////////
import "../assets/scss/index.scss";
import React, { useState, useRef } from "react";
import CountUp from "react-countup";
import { Link } from "gatsby";
import animationData from "../assets/animations/delivery.json";
import Lottie from "lottie-react";
import ScrollTrigger from "react-scroll-trigger";

import TextCarousel from "../components/TextCarousel";
import ImagesCarousel from "../components/ImagesCarousel";

import { StaticImage } from "gatsby-plugin-image";
import brand from "../config/brand";

const stringsArray = [
  "Helado Artesanal de la mejor calidad",
  "Aceptamos Mercado Pago",
  "Delivery Sin Cargo por la zona",
  "El sabor de la felicidad",
  "Somos calidad a precio accesible",
];

const firstCarousel = [
  <StaticImage
    src="../images/promotional/1cuarto.jpeg"
    alt="shopping-cart"
    placeholder="blurred"
    loading="eager"
    height={200}
    width={200}
    layout="fixed"
    transformOptions={{ cropFocus: "center" }} // Align cropping to the center
  />,
  <StaticImage
    src="../images/promotional/1cuarto2.jpeg"
    alt="shopping-cart"
    placeholder="blurred"
    loading="eager"
    height={200}
    width={200}
    layout="fixed"
    transformOptions={{ cropFocus: "center" }} // Align cropping to the center
  />,
  <StaticImage
    src="../images/promotional/1kg.jpeg"
    alt="shopping-cart"
    placeholder="blurred"
    height={200}
    width={200}
    layout="fixed"
    transformOptions={{ cropFocus: "center" }} // Align cropping to the center
  />,
  <StaticImage
    src="../images/promotional/todos.jpeg"
    alt="shopping-cart"
    placeholder="blurred"
    height={200}
    width={200}
    layout="fixed"
    transformOptions={{ cropFocus: "center" }} // Align cropping to the center
  />,
];

const secondCarousel = [
  <StaticImage
    src="../images/promotions/cuarto.png"
    alt="shopping-cart"
    placeholder="blurred"
    loading="eager"
    height={200}
    width={200}
    layout="fixed"
    transformOptions={{ cropFocus: "center" }} // Align cropping to the center
  />,
  <StaticImage
    src="../images/promotions/deals.png"
    alt="shopping-cart"
    placeholder="blurred"
    loading="eager"
    height={200}
    width={200}
    layout="fixed"
    transformOptions={{ cropFocus: "center" }} // Align cropping to the center
  />,
  <StaticImage
    src="../images/promotions/kilo.png"
    alt="shopping-cart"
    placeholder="blurred"
    height={200}
    width={200}
    layout="fixed"
    transformOptions={{ cropFocus: "center" }} // Align cropping to the center
  />,
  <StaticImage
    src="../images/promotions/medio.png"
    alt="shopping-cart"
    placeholder="blurred"
    height={200}
    width={200}
    layout="fixed"
    transformOptions={{ cropFocus: "center" }} // Align cropping to the center
  />,
];

const thirdCarousel = [
  <StaticImage
    src="../images/kids/1.jpg"
    alt="shopping-cart"
    placeholder="blurred"
  />,
  <StaticImage
    src="../images/kids/2.jpg"
    alt="shopping-cart"
    placeholder="blurred"
  />,
  <StaticImage
    src="../images/kids/3.jpg"
    alt="shopping-cart"
    placeholder="blurred"
  />,
  <StaticImage
    src="../images/kids/4.jpg"
    alt="shopping-cart"
    placeholder="blurred"
  />,
  <StaticImage
    src="../images/kids/5.jpg"
    alt="shopping-cart"
    placeholder="blurred"
  />,
  <StaticImage
    src="../images/kids/6.jpg"
    alt="shopping-cart"
    placeholder="blurred"
  />,
];

export default function Home() {
  const deliveryAnimationRef = useRef(null);
  return (
    <main id="home">
      <TextCarousel slides={stringsArray} />

      <section className="hero">
        <div className="content">
          <h3>#DULCE-TENTACION</h3>
          <div className="container">
            <ImagesCarousel slides={firstCarousel} />
          </div>
          <h3>#Promos</h3>
          <div className="container">
            <ImagesCarousel slides={secondCarousel} />
          </div>
        </div>
      </section>
      <section className="motto">
        <div className="content">
          <p>
            No podes comprar felicidad, pero si podes comprar helado, lo que es
            casi lo mismo! 😎
          </p>

          <ImagesCarousel slides={thirdCarousel} slidesPerView={1} />
        </div>
      </section>
      <section class="stats">
        <div className="content">
          <Counter value={4} text={"Años en el rubro"} duration={4} />
          <Counter value={500} text={"Clientes satisfechos"} duration={5} />
          <Counter value={20} text={"Sabores diferentes"} duration={6} />
        </div>
      </section>
      <section className="call-to-action">
        <div className="content">
          <h2>{brand.delivery.homepageText}</h2>
          <div className="container">
            <StaticImage
              src="../images/online-shop.png"
              alt="shopping-cart"
              placeholder="blurred"
            />
            <Lottie
              lottieRef={deliveryAnimationRef}
              animationData={animationData}
              autoplay={true}
              loop={true}
            />
          </div>
          <Link to="/catalogo">
            <button>Pedi ya! 😋🍦</button>
          </Link>
        </div>
      </section>
    </main>
  );
}

function Counter({ value, duration, text }) {
  const [startCounters, setStartCounters] = useState(false);
  return (
    <ScrollTrigger onEnter={() => setStartCounters(true)} className="container">
      <p>
        {startCounters ? (
          <CountUp end={value} duration={duration} start={0} delay={0.5} />
        ) : (
          "0"
        )}
      </p>
      <p>{text}</p>
    </ScrollTrigger>
  );
}
