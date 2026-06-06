import { StaticImage } from "gatsby-plugin-image";
import React from "react";

export function CatalogBanner() {
  return (
    <StaticImage
      src="../../images/catalog-banner.jpg"
      alt="Catalog banner"
      placeholder="blurred"
    />
  );
}

export function CartBanner() {
  return (
    <StaticImage
      src="../../images/cart-banner.jpg"
      alt="anime styled ice cream shop from inside"
      placeholder="blurred"
    />
  );
}

export function ReviewsBanner() {
  return (
    <StaticImage
      src="../../images/reviews-banner.jpeg"
      alt="anime styled street ice cream shop  "
      placeholder="blurred"
    />
  );
}

export function GalleryBanner() {
  return (
    <StaticImage
      src="../../images/gallery-banner.jpeg"
      alt="tokyo in anime style  "
      placeholder="blurred"
    />
  );
}

export function AboutUsBanner() {
  return (
    <StaticImage
      src="../../images/about-us-banner.jpg"
      alt="anime styled ice cream shop from outside"
      placeholder="blurred"
    />
  );
}
