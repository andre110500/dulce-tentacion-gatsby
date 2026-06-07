import React from "react";
import { StaticImage } from "gatsby-plugin-image";
import brand from "../config/brand";

export default function BrandLogo({
  variant = "default",
  alt = brand.name,
  className = "logo",
  width,
}) {
  const style = width ? { display: "block", maxWidth: `${width}px` } : undefined;

  const image =
    variant === "white" ? (
      <StaticImage
        src="../images/brand/logo-white.png"
        alt={alt}
        placeholder="blurred"
        className={className}
      />
    ) : (
      <StaticImage
        src="../images/brand/logo.png"
        alt={alt}
        placeholder="blurred"
        className={className}
      />
    );

  if (width) {
    return <span style={style}>{image}</span>;
  }

  return image;
}
