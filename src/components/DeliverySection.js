import React, { useEffect, useState } from "react";

export default function DeliverySection({ setDeliveryInfo, deliveryInfo }) {
  useEffect(() => {
    console.log(deliveryInfo);
  }, [deliveryInfo]);

  const [isTakeAwayChecked, setIsTakeAwayChecked] = useState(false);

  function checkValidity(e) {
    const isValid = e.target.validity.valid;

    if (!isValid) {
      e.target.classList.add("invalid");
    } else {
      e.target.classList.remove("invalid");
    }
  }

  return (
    <>
      <section className="fullfillment-method options">
        <label
          className={`option ${isTakeAwayChecked && "checked"}`}
          htmlFor="pickup"
        >
          <span>Retiro en el local</span>
          <input
            type="radio"
            name="fullfillment-method"
            value="pickup"
            id="pickup"
            checked={isTakeAwayChecked}
            required
            onChange={() => {
              setDeliveryInfo((prev) => ({ ...prev, isChecked: false }));
              setIsTakeAwayChecked(true);
            }}
          />
        </label>

        <label
          className={`option ${deliveryInfo.isChecked && "checked"}`}
          htmlFor="delivery"
        >
          <span>Delivery</span>
          <input
            onChange={() => {
              setDeliveryInfo((prev) => ({ ...prev, isChecked: true }));
              setIsTakeAwayChecked(false);
            }}
            checked={deliveryInfo.isChecked === true}
            type="radio"
            name="fullfillment-method"
            value="delivery"
            id="delivery"
            required
          />
        </label>
      </section>

      {deliveryInfo.isChecked && (
        <div id="delivery-details">
          <div className="container">
            <input
              placeholder="Barrio *"
              defaultValue={
                deliveryInfo?.neighborhood ? deliveryInfo.neighborhood : ""
              }
              required
              onBlur={checkValidity}
              onChange={(e) => {
                setDeliveryInfo((prev) => ({
                  ...prev,
                  neighborhood: e.target.value,
                }));
              }}
            />

            <div className="error">Seleccioná un barrio</div>
          </div>

          <div className="container">
            <input
              type="text"
              placeholder="Dirección *"
              autoComplete="street-address"
              required
              onBlur={checkValidity}
              defaultValue={deliveryInfo.address}
              onChange={(event) => {
                setDeliveryInfo((prev) => ({
                  ...prev,
                  address: event.target.value,
                }));
              }}
            />

            <div className="error">Escribí una dirección</div>
          </div>

          <div className="container">
            <input
              type="text"
              placeholder="Entre calles *"
              required
              onBlur={checkValidity}
              defaultValue={deliveryInfo.crossStreets}
              onChange={(event) =>
                setDeliveryInfo((prev) => ({
                  ...prev,
                  crossStreets: event.target.value,
                }))
              }
            />

            <div className="error">Escribí las entrecalles</div>
          </div>

          <textarea
            id="aditional-info"
            placeholder={`Opcional:
Descripción de la casa, ejemplo: frente rojo, puerta negra de chapa.`}
            defaultValue={deliveryInfo.aditionalInfo}
            onChange={(event) =>
              setDeliveryInfo((prev) => ({
                ...prev,
                aditionalInfo: event.target.value,
              }))
            }
          ></textarea>
        </div>
      )}
    </>
  );
}
