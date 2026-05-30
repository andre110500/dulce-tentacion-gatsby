import React from "react";

import { GlobalContext } from "../context/GlobalContext";

import { useContext } from "react";
export default function SummarySection({
  getTotalCartPriceWithDiscount,
  isDeliveryChecked,
  getAllIceCreamDiscounts,
  deliveryFee = 0,
  getTotalOrderPrice,
}) {
  const { getTotalCartPriceWithoutDiscount } = useContext(GlobalContext);
  console.log(JSON.stringify(getAllIceCreamDiscounts()));
  const noDisccount =
    getTotalCartPriceWithDiscount() == getTotalCartPriceWithoutDiscount();
  const hasDeliveryFee = isDeliveryChecked && deliveryFee > 0;
  const totalOrderPrice = getTotalOrderPrice
    ? getTotalOrderPrice()
    : getTotalCartPriceWithDiscount() + deliveryFee;
  return (
    <section className="summary">
      <h3>{noDisccount && !hasDeliveryFee ? "Total del carrito" : "Detalle:"} </h3>

      <div className="container">
        {(!noDisccount || hasDeliveryFee) && (
          <p>
            Productos: <span>$ {getTotalCartPriceWithoutDiscount()}</span>
          </p>
        )}

        {getAllIceCreamDiscounts().length > 0 &&
          getAllIceCreamDiscounts().map((discount, index) => (
            <p key={index}>
              {discount.name} <span>- ${discount.amount}</span>
            </p>
          ))}
        {/* Step 2: Conditional rendering based on isDeliveryChecked */}

        {hasDeliveryFee && (
          <p>
            Envio: <span>$ {deliveryFee}</span>
          </p>
        )}

        {noDisccount && !hasDeliveryFee ? (
          <h3>$ {getTotalCartPriceWithoutDiscount()}</h3>
        ) : (
          <p>
            Total:
            <span>${totalOrderPrice}</span>
          </p>
        )}

        {/* {isDeliveryChecked && (
          <p>
            Delivery: <span>preguntar</span>
          </p> // You can customize this message as needed
        )} */}
      </div>
    </section>
  );
}
