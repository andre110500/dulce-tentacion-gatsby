import "../assets/scss/catalogo.scss";
import React, { useContext, useRef, useState } from "react";
import { GlobalContext } from "../context/GlobalContext";
import { graphql, navigate } from "gatsby";
import { GatsbyImage, getImage, StaticImage } from "gatsby-plugin-image";
import {
  FaBirthdayCake,
  FaChevronRight,
  FaHeart,
  FaIceCream,
  FaRegClock,
  FaRegHeart,
  FaThLarge,
  FaTruck,
} from "react-icons/fa";
import { GiIcePop, GiIceCreamCone } from "react-icons/gi";
import { PiPopsicleFill } from "react-icons/pi";
import MobileShopNav from "../components/MobileShopNav";

const catalogSections = [
  {
    id: "helados",
    label: "Helados",
    title: "Helado Artesanal",
    icon: FaIceCream,
    matcher: (product) =>
      /(kg|1\/2|1\/4|kilo|cuarto|medio|helado artesanal)/i.test(
        `${product.name} ${product.description || ""}`
      ),
    limit: 3,
  },
  {
    id: "postres",
    label: "Postres",
    title: "Postres Helados",
    icon: FaBirthdayCake,
    matcher: (product) => /(torta|postre|alfajor)/i.test(product.name),
    limit: 4,
  },
  {
    id: "palitos",
    label: "Palitos",
    title: "Palitos Helados",
    icon: GiIcePop,
    matcher: (product) =>
      /(palito|pico|bombon|crema duo|twister|osito|alfamio|bombon)/i.test(
        product.name
      ),
    limit: 6,
  },
  {
    id: "conos",
    label: "Conos",
    title: "Conos",
    icon: GiIceCreamCone,
    matcher: (product) => /(cono|cucurucho|oblea)/i.test(product.name),
    limit: 6,
  },
];

const formatPrice = (price) =>
  new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  }).format(price);

const cleanProductName = (name) =>
  name
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

function getVisibleProducts(products) {
  return products
    .map(({ node }) => node)
    .filter((product) => {
      const isExcludedName =
        /salsa/i.test(product.name) || /rocklets/i.test(product.name);

      return !product.outOfStock && !isExcludedName;
    })
    .sort((a, b) => b.price - a.price);
}

function buildSections(products) {
  const usedProductIds = new Set();

  const sections = catalogSections.map((section) => {
    const items = products
      .filter((product) => section.matcher(product))
      .filter((product) => {
        if (usedProductIds.has(product._id)) return false;
        usedProductIds.add(product._id);
        return true;
      });

    return {
      ...section,
      items,
    };
  });

  const uncategorized = products.filter(
    (product) => !usedProductIds.has(product._id)
  );

  if (uncategorized.length === 0) return sections;

  return [
    ...sections,
    {
      id: "otros",
      label: "Otros",
      title: "Otros Favoritos",
      icon: PiPopsicleFill,
      items: uncategorized,
      limit: 8,
    },
  ];
}

export default function Shop(props) {
  const [activeCategory, setActiveCategory] = useState("todos");
  const products = getVisibleProducts(props.data.allProduct.edges);
  const sections = buildSections(products).filter((section) => section.items.length > 0);
  const displayedSections =
    activeCategory === "todos"
      ? sections
      : sections.filter((section) => section.id === activeCategory);

  return (
    <main id="catalog">
      <CatalogHero />

      <div className="catalog-shell">
        <CategoryTabs
          sections={sections}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />

        <div className="catalog-sections">
          {displayedSections.map((section, index) => (
            <CatalogSection
              key={section.id}
              section={section}
              isCompact={activeCategory === "todos" && index < 2}
              setActiveCategory={setActiveCategory}
            />
          ))}
        </div>

        <CatalogInfo />
      </div>
      <MobileShopNav currentPage="catalog" />
    </main>
  );
}

function CatalogHero() {
  return (
    <section className="catalog-hero" aria-labelledby="catalog-title">
      <div className="catalog-hero__copy">
        <h1 id="catalog-title">Catálogo</h1>
        <p>
          Elegí tus productos
          <br />
          favoritos <FaHeart aria-hidden="true" />
        </p>
        <div className="catalog-hero__dots" aria-hidden="true">
          <span className="active" />
          <span />
          <span />
        </div>
      </div>

      <div className="catalog-hero__logo" aria-hidden="true">
        <StaticImage
          src="../images/logo512.png"
          alt=""
          placeholder="blurred"
          layout="constrained"
          width={210}
        />
      </div>

      <div className="catalog-hero__image">
        <StaticImage
          src="../images/catalog-banner.jpg"
          alt="Mostrador de heladería Dulce Tentación"
          placeholder="blurred"
          layout="constrained"
          width={520}
        />
      </div>
    </section>
  );
}

function CategoryTabs({ sections, activeCategory, setActiveCategory }) {
  const tabs = [
    { id: "todos", label: "Todos", icon: FaThLarge },
    ...sections.map(({ id, label, icon }) => ({ id, label, icon })),
  ];

  return (
    <nav className="category-tabs" aria-label="Categorías del catálogo">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          className={activeCategory === id ? "active" : ""}
          onClick={() => setActiveCategory(id)}
          type="button"
        >
          <Icon aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

function CatalogSection({ section, isCompact, setActiveCategory }) {
  const Icon = section.icon;
  const items = isCompact ? section.items.slice(0, section.limit) : section.items;

  return (
    <section
      className={`catalog-section ${isCompact ? "catalog-section--compact" : ""}`}
      id={section.id}
    >
      <div className="catalog-section__header">
        <div className="catalog-section__title">
          <span className="catalog-section__icon">
            <Icon aria-hidden="true" />
          </span>
          <h2>{section.title}</h2>
        </div>
        {section.items.length > items.length && (
          <button
            className="view-all"
            type="button"
            onClick={() => setActiveCategory(section.id)}
          >
            Ver todos <FaChevronRight aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="product-cards">
        {items.map((product) => (
          <Card key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}

function Card({ product }) {
  const { dispatch } = useContext(GlobalContext);
  const image = getImage(product.localImage);
  const buttonRef = useRef(null);
  const [isFavorite, setIsFavorite] = useState(false);

  function handleClick() {
    if (!product.apiRoute) {
      dispatch({
        type: "add-cart-item",
        payload: {
          product: structuredClone(product),
          quantity: 1,
        },
      });
    } else {
      navigate(`/form?id=${product._id}`);
    }
  }

  return (
    <article className="product-card">
      <button
        className={`favorite-button ${isFavorite ? "active" : ""}`}
        type="button"
        aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        aria-pressed={isFavorite}
        onClick={() => setIsFavorite((value) => !value)}
      >
        {isFavorite ? (
          <FaHeart aria-hidden="true" />
        ) : (
          <FaRegHeart aria-hidden="true" />
        )}
      </button>

      <div className="image-container">
        <ProductImage product={product} image={image} />
      </div>

      <div className="description">
        <h3 className="name">{cleanProductName(product.name)}</h3>
        <p className="subtotal">$ {formatPrice(product.price)}</p>
        {product.description && <p className="description-string">{product.description}</p>}
      </div>

      <Button
        buttonRef={buttonRef}
        handleClick={handleClick}
        apiRoute={product.apiRoute}
      />
    </article>
  );
}

function ProductImage({ product, image }) {
  const resolvedImage = image || getImage(product.localImage);

  if (resolvedImage) {
    return <GatsbyImage image={resolvedImage} alt={product.name} />;
  }

  return <img src={product.imgUrl} alt={product.name} loading="lazy" />;
}

function Button({ apiRoute, buttonRef, handleClick }) {
  return (
    <button
      ref={buttonRef}
      className="to-cart"
      type="button"
      onAnimationEnd={() => {
        buttonRef.current.classList.remove("active");
        handleClick();
      }}
      onClick={() => {
        buttonRef.current.classList.add("active");
      }}
    >
      <span>+ {apiRoute ? "Elegir" : "Agregar"}</span>
    </button>
  );
}

function CatalogInfo() {
  return (
    <section className="catalog-info" aria-label="Información del local">
      <div>
        <FaTruck aria-hidden="true" />
        <p>
          <strong>Entrega en Marcos Paz</strong>
          <span>y zonas aledanas</span>
        </p>
      </div>
      <div>
        <FaRegClock aria-hidden="true" />
        <p>
          <span>Lunes a Viernes 20:30 a 24:00</span>
          <span>Sábados y Domingos 13:00 a 24:00</span>
        </p>
      </div>
      <div>
        <FaHeart aria-hidden="true" />
        <p>
          <strong>Hecho con amor</strong>
          <span>para endulzar tus momentos</span>
        </p>
      </div>
    </section>
  );
}

export const query = graphql`
  query MyQuery {
    allProduct {
      edges {
        node {
          price
          localImage {
            childImageSharp {
              gatsbyImageData(
                width: 220
                height: 220
                layout: CONSTRAINED
                placeholder: BLURRED
              )
            }
          }
          outOfStock
          description
          name
          imgUrl
          apiRoute
          _id
          flavours
        }
      }
    }
  }
`;
