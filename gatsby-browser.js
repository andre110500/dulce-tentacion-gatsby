import React from "react";

import GlobalContextProvider from "./src/context/GlobalContext";

export const wrapRootElement = ({ element }) => (
  <GlobalContextProvider>{element}</GlobalContextProvider>
);

export const onRouteUpdate = () => {
  const wrapper = document.getElementById("gatsby-focus-wrapper");
  if (wrapper) {
    wrapper.scrollTop = 0;
  }
  window.scrollTo(0, 0);
};
