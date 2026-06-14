import "../assets/scss/catalogo.scss";
import React, { useContext, useEffect, useRef, useState } from "react";
import { GlobalContext } from "../context/GlobalContext";
import { graphql, navigate } from "gatsby";
import { translateType, translateSubType, typeOrder, subTypeOrder } from "../data/translations";
import { GatsbyImage, getImage, StaticImage } from "gatsby-plugin-image";
import {
  FaChevronRight,
  FaHeart,
  FaIceCream,
  FaMinus,
  FaPlus,
  FaSearchPlus,
  FaSmoking,
  FaThLarge,
  FaTimes,
  FaWineBottle,
} from "react-icons/fa";
import { GiIceCreamCone } from "react-icons/gi";
import MobileShopNav from "../components/MobileShopNav";
import BrandLogo from "../components/BrandLogo";

const catalogHeroSlides = [
  {
    id: "catalog",
    title: "Catalogo",
    lines: ["Elegi tus productos", "favoritos"],
    visualLabel: "Mostrador de heladeria",
    hasImage: true,
  },
  {
    id: "promo-placeholder",
    title: "Envios",
    lines: ["Gratis en rayito", "hornero y santa"],
    visualLabel: "Repartidor de envios",
    imageType: "delivery",
  },
  {
    id: "sundae-slide",
    title: "Juntadas",
    lines: ["Helado y", "bebidas"],
    visualLabel: "Pedido completo con helado y bebidas",
    imageType: "order",
  },
];

const getProductType = (product) => product.type || product.productType;
const getProductSubType = (product) => product.subType || product.subtype;
const isFormOnlyAddOn = (product) =>
  getProductSubType(product) === "pot-topping";

const typeIcons = {
  drink: FaWineBottle,
  cigarette: FaSmoking,
};

const subTypeIcons = {
  "wafer-cone": GiIceCreamCone,
};

function getProductPlaceholderIcon(product) {
  return typeIcons[getProductType(product)] || subTypeIcons[getProductSubType(product)] || FaIceCream;
}

const sectionIcons = {
  "ice-cream": FaIceCream,
  "frozen-treat": FaIceCream,
  drink: FaWineBottle,
  "add-on": GiIceCreamCone,
  cigarette: FaSmoking,
};

function getSectionItemCount(section) {
  if (section.groups) {
    return section.groups.reduce((total, group) => total + group.items.length, 0);
  }

  return section.items.length;
}

const formatPrice = (price) =>
  new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  }).format(price);

const cleanProductName = (name) =>
  name
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((word) =>
      word.length > 1
        ? `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`
        : word.toUpperCase()
    )
    .join(" ");

function getVisibleProducts(products) {
  return products
    .map(({ node }) => node)
    .filter((product) => {
      return !product.outOfStock && !isFormOnlyAddOn(product);
    })
    .sort((a, b) => b.price - a.price);
}

function buildSections(products) {
  const sections = [];

  const byType = {};
  for (const product of products) {
    let type = getProductType(product);
    const st = getProductSubType(product);
    if (st === "wafer-cone") type = "ice-cream";
    if (!byType[type]) byType[type] = [];
    byType[type].push(product);
  }

  const sortedTypes = Object.keys(byType).sort((a, b) => {
    const ai = typeOrder.indexOf(a);
    const bi = typeOrder.indexOf(b);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  for (const type of sortedTypes) {
    const typeProducts = byType[type];
    const bySubType = {};
    for (const product of typeProducts) {
      const st = getProductSubType(product) || "";
      if (!bySubType[st]) bySubType[st] = [];
      bySubType[st].push(product);
    }

    const subTypeKeys = Object.keys(bySubType).sort((a, b) => {
      const order = subTypeOrder[type] || [];
      const ai = order.indexOf(a);
      const bi = order.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
    const isFlat = subTypeKeys.length === 1 && subTypeKeys[0] === "";
    const groups = [];
    for (const st of subTypeKeys) {
      if (st === "wafer-cone") {
        groups.push({ id: st, label: "Agregados", icon: FaIceCream, items: bySubType[st] });
      } else if (st === "") {
        groups.push({ id: st, label: "", icon: null, items: bySubType[st] });
      } else {
        groups.push({ id: st, label: translateSubType(st), icon: FaIceCream, items: bySubType[st] });
      }
    }

    const icon = sectionIcons[type] || FaIceCream;

    if (isFlat) {
      sections.push({ id: type, label: translateType(type), title: translateType(type), icon, items: typeProducts });
    } else {
      sections.push({ id: type, label: translateType(type), title: translateType(type), icon, groups });
    }
  }

  return sections;
}

export default function Shop(props) {
  const [activeCategory, setActiveCategory] = useState("todos");
  const products = getVisibleProducts(props.data.allProduct.edges);
  const sections = buildSections(products).filter(
    (section) => getSectionItemCount(section) > 0
  );
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
      </div>
      <MobileShopNav currentPage="catalog" />
    </main>
  );
}

function CatalogHero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const swipeStart = useRef(null);
  const slide = catalogHeroSlides[activeSlide];

  function goToSlide(index) {
    setActiveSlide(index);
  }

  function goToNextSlide() {
    setActiveSlide((currentSlide) =>
      currentSlide === catalogHeroSlides.length - 1 ? 0 : currentSlide + 1
    );
  }

  function goToPreviousSlide() {
    setActiveSlide((currentSlide) =>
      currentSlide === 0 ? catalogHeroSlides.length - 1 : currentSlide - 1
    );
  }

  useEffect(() => {
    const intervalId = setInterval(goToNextSlide, 5200);

    return () => clearInterval(intervalId);
  }, [activeSlide]);

  function handlePointerDown(event) {
    if (event.target.closest("button")) return;

    event.preventDefault();
    swipeStart.current = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event) {
    if (!swipeStart.current) return;

    const swipeDistanceX = event.clientX - swipeStart.current.x;
    const swipeDistanceY = event.clientY - swipeStart.current.y;
    const isHorizontalSwipe =
      Math.abs(swipeDistanceX) > 46 &&
      Math.abs(swipeDistanceX) > Math.abs(swipeDistanceY) * 1.25;

    if (!isHorizontalSwipe) return;

    event.preventDefault();
    if (swipeDistanceX < 0) {
      goToNextSlide();
    } else {
      goToPreviousSlide();
    }

    event.currentTarget.releasePointerCapture?.(swipeStart.current.pointerId);
    swipeStart.current = null;
  }

  function handlePointerEnd(event) {
    if (!swipeStart.current) return;

    event.currentTarget.releasePointerCapture?.(swipeStart.current.pointerId);
    swipeStart.current = null;
  }

  return (
    <section
      className="catalog-hero"
      aria-labelledby="catalog-title"
      aria-live="polite"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      <div className="catalog-hero__copy">
        <h1 id="catalog-title">{slide.title}</h1>
        <p>
          {slide.lines[0]}
          <br />
          {slide.lines[1]} <FaHeart aria-hidden="true" />
        </p>
        <div className="catalog-hero__dots" aria-label="Slides del catalogo">
          {catalogHeroSlides.map((heroSlide, index) => (
            <button
              key={heroSlide.id}
              type="button"
              className={index === activeSlide ? "active" : ""}
              aria-label={`Ver slide ${index + 1}`}
              aria-current={index === activeSlide}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>

      <div className="catalog-hero__logo" aria-hidden="true">
        <BrandLogo alt="" width={210} />
      </div>

      <div className="catalog-hero__image">
        {slide.hasImage ? (
          <StaticImage
            src="../images/catalog-banner.jpg"
            alt="Mostrador de heladeria"
            placeholder="blurred"
            layout="constrained"
            width={520}
          />
        ) : slide.imageType === "delivery" ? (
          <StaticImage
            src="../images/delivery-slide.png"
            alt="Repartidor en moto para envios"
            placeholder="blurred"
            layout="constrained"
            width={520}
          />
        ) : slide.imageType === "order" ? (
          <StaticImage
            src="../images/catalog-friends-slide.png"
            alt="Amigos compartiendo helado y bebidas"
            placeholder="blurred"
            layout="constrained"
            width={520}
          />
        ) : (
          <div className="catalog-hero__placeholder" aria-label={slide.visualLabel}>
            <span>{slide.visualLabel}</span>
          </div>
        )}
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
  const items = section.items
    ? isCompact
      ? section.items.slice(0, section.limit)
      : section.items
    : [];
  const hasHiddenItems = section.items && section.items.length > items.length;
  const isShortSimpleSection = !section.groups && section.items?.length <= 4;

  return (
    <section
      className={`catalog-section ${isCompact ? "catalog-section--compact" : ""} ${
        section.groups ? "catalog-section--grouped" : ""
      } ${isShortSimpleSection ? "catalog-section--short-simple" : ""}`}
      id={section.id}
    >
      <div className="catalog-section__header">
        <div className="catalog-section__title">
          <span className="catalog-section__icon">
            <Icon aria-hidden="true" />
          </span>
          <h2>{section.title}</h2>
        </div>
        {hasHiddenItems && (
          <button
            className="view-all"
            type="button"
            onClick={() => setActiveCategory(section.id)}
          >
            Ver todos <FaChevronRight aria-hidden="true" />
          </button>
        )}
      </div>

      {section.groups ? (
        <div className="catalog-subsections">
          {section.groups.map((group) => {
            const GroupIcon = group.icon;

            return (
              <div className="catalog-subsection" key={group.id}>
                {group.label && (
                  <div className="catalog-subsection__header">
                    <span>
                      <GroupIcon aria-hidden="true" />
                    </span>
                    <h3>{group.label}</h3>
                  </div>
                )}
                <div className="product-cards">
                  {group.items.map((product) => (
                    <Card key={product._id} product={product} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="product-cards">
          {items.map((product) => (
            <Card key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

function Card({ product }) {
  const { dispatch, cartItems } = useContext(GlobalContext);
  const image = getImage(product.localImage);
  const buttonRef = useRef(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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
        className="detail-button"
        type="button"
        aria-label={`Ver detalle de ${cleanProductName(product.name)}`}
        onClick={() => setIsDetailOpen(true)}
      >
        <FaSearchPlus aria-hidden="true" />
      </button>

      <div className="image-container">
        <ProductImage product={product} image={image} />
      </div>

      <div className="description">
        <h3 className="name">{cleanProductName(product.name)}</h3>
        <p className="subtotal">$ {formatPrice(product.price)}</p>
        {product.description && (
          <p className="description-string">{product.description}</p>
        )}
      </div>

      <Button
        buttonRef={buttonRef}
        handleClick={handleClick}
        apiRoute={product.apiRoute}
      />

      {isDetailOpen && (
        <ProductDetailModal
          product={product}
          image={image}
          dispatch={dispatch}
          onClose={() => setIsDetailOpen(false)}
        />
      )}
    </article>
  );
}

function ProductImage({ product, image }) {
  const hasProductImage = product.hasProductImage !== false;
  const resolvedImage = hasProductImage ? image || getImage(product.localImage) : null;
  const PlaceholderIcon = getProductPlaceholderIcon(product);

  if (resolvedImage) {
    return <GatsbyImage image={resolvedImage} alt={product.name} />;
  }

  if (hasProductImage && product.imgUrl) {
    return <img src={product.imgUrl} alt={product.name} loading="lazy" />;
  }

  return (
    <span className="product-placeholder" aria-hidden="true">
      <PlaceholderIcon />
    </span>
  );
}

function ProductDetailModal({ product, image, dispatch, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const productName = cleanProductName(product.name);
  const hasOptions = Boolean(product.apiRoute);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.classList.add("modal-open");
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  function addToCart() {
    dispatch({
      type: "add-cart-item",
      payload: {
        product: structuredClone(product),
        quantity,
      },
    });
    onClose();
  }

  function chooseOptions() {
    onClose();
    navigate(`/form?id=${product._id}`);
  }

  return (
    <div
      className="product-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`product-modal-${product._id}`}
    >
      <button
        className="product-modal__backdrop"
        type="button"
        aria-label="Cerrar detalle"
        onClick={onClose}
      />

      <div className="product-modal__panel">
        <button
          className="product-modal__close"
          type="button"
          aria-label="Cerrar detalle"
          onClick={onClose}
        >
          <FaTimes aria-hidden="true" />
        </button>

        <div className="product-modal__image">
          <ProductImage product={product} image={image} />
        </div>

        <div className="product-modal__content">
          <p className="product-modal__eyebrow">Detalle del producto</p>
          <h3 id={`product-modal-${product._id}`}>{productName}</h3>
          <p className="product-modal__price">$ {formatPrice(product.price)}</p>
          {product.description && (
            <p className="product-modal__description">{product.description}</p>
          )}

          {hasOptions ? (
            <button
              className="product-modal__primary"
              type="button"
              onClick={chooseOptions}
            >
              Elegir sabores
            </button>
          ) : (
            <div className="product-modal__simple-buy">
              <div className="quantity-control" aria-label="Cantidad">
                <button
                  type="button"
                  aria-label="Restar unidad"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                >
                  <FaMinus aria-hidden="true" />
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  aria-label="Sumar unidad"
                  onClick={() => setQuantity((value) => value + 1)}
                >
                  <FaPlus aria-hidden="true" />
                </button>
              </div>

              <button
                className="product-modal__primary"
                type="button"
                onClick={addToCart}
              >
                Agregar {quantity}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
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

export const query = graphql`
  query MyQuery {
    allProduct {
      edges {
        node {
          price
          localImage {
            childImageSharp {
              gatsbyImageData(
                width: 520
                height: 520
                layout: CONSTRAINED
                placeholder: BLURRED
              )
            }
          }
          outOfStock
          description
          name
          imgUrl
          hasProductImage
          type
          subType
          apiRoute
          _id
          flavours
        }
      }
    }
  }
`;
