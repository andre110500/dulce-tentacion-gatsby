// to make a line break use "\n"
//tabs are visible on whatsapp
export function createMessage({
  cartItems,
  deliveryInfo,
  totalCartPriceWithDiscount,
  totalCartPriceWithoutDiscount,
  allIceCreamDiscounts,
  totalDiscountAmmount,
  paymentMethod,
  deliveryFee = 0,
  deliveryQuote,
}) {
  const CART_ITEM_BULLET = "•";
  const INDENT = "    "; // Four spaces for indentation

  const createCartItemsList = () => {
    return cartItems
      .map((cartItem) => {
        const product = cartItem.product;

        const itemLine = `*${cartItem.count} -* ${product.name}   ($${
          product.price
        } ${cartItem.count > 1 ? "c/u" : ""})\n`;

        // Check for add-ons
        let addOnsDetails = "";
        let subtotalLine = ""; // Initialize subtotal line for this item
        let hasAddOns =
          product.addOns?.rocklets?.included ||
          product.addOns?.sauces?.chosenSauces?.length > 0;

        if (hasAddOns) {
          // Create Aderezos section
          addOnsDetails += `${INDENT}*Aderezos:*\n`;
          if (product.addOns.rocklets.included) {
            addOnsDetails += `${INDENT}${INDENT}- Rocklets ($${product.addOns.rocklets.price})\n`;
          }
          if (product.addOns.sauces.chosenSauces?.length > 0) {
            addOnsDetails += `${INDENT}${INDENT}*Salsas:*\n`;
            product.addOns.sauces.chosenSauces.forEach((sauce) => {
              addOnsDetails += `${INDENT}${INDENT}${INDENT}-${sauce} ($${product.addOns.sauces.price})\n`;
            });
          }

          // Add line for Helado + aderezos
          addOnsDetails += `${INDENT}*${product.name} + aderezos ($${product.priceWithAddOns}*)\n`;
        }

        // Calculate subtotal for this item if it has add-ons
        subtotalLine = `${INDENT}*Subtotal: $${cartItem.getTotalCartItemPrice()} ($${
          product.priceWithAddOns || product.price
        } x ${cartItem.count})*\n`;
        if (cartItem.count === 1) {
          subtotalLine = "";
        }

        // Logic to display chosen flavours
        if (product.chosenFlavours) {
          let flavoursList = `${INDENT}*${
            product.chosenFlavours.length > 1 ? "Sabores" : "Sabor"
          }*:\n`;
          product.chosenFlavours.forEach((flavour) => {
            flavoursList += `${INDENT}${INDENT}-${flavour}\n`;
          });

          return itemLine + flavoursList + addOnsDetails + subtotalLine; // Combine item line with add-ons details, subtotal, and flavours
        }

        return itemLine + addOnsDetails + subtotalLine; // Combine item line with add-ons details and subtotal if no flavours
      })
      .join(""); // Join all cart items into a single string
  };

  const cartItemsList = createCartItemsList();
  function formatDiscounts(discounts) {
    return discounts.map(
      (discount) => `\n${discount.name}: - $${discount.amount}`
    );
  }
  return (
    `*Orden*:\n${cartItemsList}` +
    formatDiscounts(allIceCreamDiscounts).join("") +
    (deliveryFee > 0 ? `\nEnvio (${deliveryQuote?.zoneName || "zona verificada"}): $${deliveryFee}` : "") +
    `\n*Total: $${totalCartPriceWithDiscount}*\n\n` +
    (paymentMethod === "cash"
      ? "*Paga en efectivo*\n"
      : `*Paga con transferencia*: \nALIAS: ${process.env.GATSBY_ALIAS}\nTITULAR: ${process.env.GATSBY_OWNER}\n`) +
    (deliveryInfo.isChecked
      ? `*Datos para el delivery*:\n${INDENT}Barrio: ${deliveryInfo.neighborhood}\n${INDENT}Direccion: ${deliveryInfo.address}\n${INDENT}Entrecalles: ${deliveryInfo.crossStreets}` +
        (deliveryInfo.aditionalInfo
          ? `\n${INDENT}Extra: ${deliveryInfo.aditionalInfo}`
          : "")
      : "\n*Retira en el local*")
  );
}

export function createWhatsAppLink(messageData) {
  const message = createMessage(messageData);

  const phoneNumber = `5491121690959`;

  // Encode the message text for use in the URL
  const encodedMessage = encodeURIComponent(message);

  // Create the WhatsApp link with the phone number and pre-filled message
  // Usar el esquema adecuado según el dispositivo
  const link = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  // Return the link
  return link;
}
