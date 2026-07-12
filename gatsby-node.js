const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

exports.sourceNodes = async ({ actions }) => {
  const { createNode } = actions;
  const fallbackProductImage =
    "https://res.cloudinary.com/dto1ctatc/image/upload/v1739735861/dulce-tentacion/meta-image_wd4l7m.png";

  const fetchProducts = async () => {
    const apiUrl = process.env.GATSBY_API_URL;
    const requestOptions = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await fetch(`${apiUrl}/products`, requestOptions);

    if (!response.ok) {
      throw new Error("Request failed");
    }

    const data = await response.json();

    return data;
  };

  const fetchApiRouteContent = async (apiRoute) => {
    const apiUrl = process.env.GATSBY_API_URL;
    const requestOptions = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const response = await fetch(`${apiUrl}/${apiRoute}`, requestOptions);

    if (!response.ok) {
      throw new Error(`Request failed for apiRoute: ${apiRoute}`);
    }

    const data = await response.json();

    return data;
  };

  try {
    // Fetch all products
    const products = await fetchProducts();

    // Extract unique apiRoute values
    const uniqueApiRoutes = [
      ...new Set(
        products
          .map((p) => {
            return p.apiRoute;
          })
          .filter(Boolean)
      ),
    ];

    // Map products to Gatsby nodes
    products.forEach((product) => {
      const hasProductImage = Boolean(product.imgUrl);
      const productNode = {
        id: `${product._id}`,
        parent: `__SOURCE__`,
        internal: {
          type: `Product`,
        },
        children: [],
        name: product.name,
        description: product.description,
        price: product.price,
        _id: product._id,
        imgUrl: hasProductImage ? product.imgUrl : fallbackProductImage,
        hasProductImage,
        outOfStock: product.outOfStock,
        type: product.type,
        subType: product.subType,
        flavours: product.flavours,
        apiRoute: product.apiRoute,
      };

      const contentDigest = crypto
        .createHash(`md5`)
        .update(JSON.stringify(productNode))
        .digest(`hex`);

      productNode.internal.contentDigest = contentDigest;

      createNode(productNode);
    });

    // Fetch and create nodes for each unique apiRoute
    for (const apiRoute of uniqueApiRoutes) {
      const allFlavours = await fetchApiRouteContent(apiRoute);
      for (const flavour of allFlavours) {
        const flavourNode = {
          id: flavour._id,
          _id: flavour._id,
          parent: `__SOURCE__`,
          internal: {
            type: `Flavour`,
          },
          children: [],
          apiRoute,
          name: flavour.name,
          outOfStock: flavour.outOfStock,
          imgUrl:
            flavour.imgUrl ||
            "https://res.cloudinary.com/dto1ctatc/image/upload/v1739735861/dulce-tentacion/meta-image_wd4l7m.png",
        };

        const contentDigest = crypto
          .createHash(`md5`)
          .update(JSON.stringify(flavourNode))
          .digest(`hex`);

        flavourNode.internal.contentDigest = contentDigest;

        createNode(flavourNode);
      }
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  return;
};

exports.onPostBuild = () => {
  const src = path.join(__dirname, "src", "images", "brand", "logo.png");
  const dest = path.join(__dirname, "public", "meta-image.png");
  fs.copyFileSync(src, dest);
};
