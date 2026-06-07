require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});

const brand = require("./src/config/brand");

/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/
 */

/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    title: brand.name,
    description: brand.description,
    author: brand.author,
    image: brand.metaImage,
    siteUrl: brand.siteUrl,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: brand.legalName,
        short_name: brand.name,
        start_url: `/`,
        background_color: `#FFFFFF`,
        theme_color: `#e8547e`,
        display: `standalone`,
        icon: brand.manifestIcon,
      },
    },
    {
      resolve: `gatsby-plugin-layout`,
      options: {
        component: require.resolve(`./src/components/Layout.js`),
      },
    },
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-sass",
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`, // Needed for dynamic images
    `gatsby-plugin-perf-budgets`,
    `gatsby-plugin-webpack-bundle-analyser-v2`,

    {
      resolve: `gatsby-plugin-remote-images`,
      options: {
        nodeType: "Flavour",
        imagePath: "imgUrl",
      },
    },
    {
      resolve: `gatsby-plugin-remote-images`,
      options: {
        nodeType: "Product",
        imagePath: "imgUrl",
      },
    },

    {
      resolve: `gatsby-plugin-sharp`,
      options: {
        defaults: {
          formats: [`webp`],
        },
      },
    },
  ],
};
