import "../assets/scss/envios.scss";
import React, { useMemo, useState } from "react";
import { Link, navigate } from "gatsby";
import {
  FaCheckCircle,
  FaLocationArrow,
  FaMapMarkerAlt,
  FaMotorcycle,
  FaShoppingCart,
} from "react-icons/fa";
import MobileShopNav from "../components/MobileShopNav";

const STORAGE_KEY = "deliveryZoneQuote";

const mapBounds = {
  north: -34.735,
  south: -34.825,
  west: -58.91,
  east: -58.765,
};

const deliveryZones = [
  {
    id: "centro",
    name: "Zona Centro",
    fee: 900,
    color: "#f54983",
    description: "Casco centrico y alrededores cercanos.",
    polygon: [
      [-34.759, -58.852],
      [-34.755, -58.81],
      [-34.783, -58.795],
      [-34.797, -58.826],
      [-34.787, -58.858],
    ],
  },
  {
    id: "media",
    name: "Zona Media",
    fee: 1300,
    color: "#13a6a6",
    description: "Barrios dentro del radio habitual de reparto.",
    polygon: [
      [-34.747, -58.879],
      [-34.739, -58.803],
      [-34.789, -58.775],
      [-34.818, -58.819],
      [-34.797, -58.89],
    ],
  },
  {
    id: "lejana",
    name: "Zona Extendida",
    fee: 1800,
    color: "#f6a623",
    description: "Puntos mas alejados dentro de Marcos Paz.",
    polygon: [
      [-34.738, -58.902],
      [-34.731, -58.784],
      [-34.812, -58.758],
      [-34.829, -58.839],
      [-34.802, -58.912],
    ],
  },
];

function projectPoint([lat, lng]) {
  const x = ((lng - mapBounds.west) / (mapBounds.east - mapBounds.west)) * 100;
  const y = ((mapBounds.north - lat) / (mapBounds.north - mapBounds.south)) * 100;

  return [x, y];
}

function polygonToPoints(polygon) {
  return polygon.map((point) => projectPoint(point).join(",")).join(" ");
}

function isPointInPolygon(point, polygon) {
  const [lat, lng] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [latI, lngI] = polygon[i];
    const [latJ, lngJ] = polygon[j];
    const intersects =
      lngI > lng !== lngJ > lng &&
      lat < ((latJ - latI) * (lng - lngI)) / (lngJ - lngI) + latI;

    if (intersects) inside = !inside;
  }

  return inside;
}

function findZone(coords) {
  return deliveryZones.find((zone) => isPointInPolygon(coords, zone.polygon));
}

function formatPrice(price) {
  return new Intl.NumberFormat("es-AR").format(price);
}

export default function Envios() {
  const [address, setAddress] = useState("");
  const [reference, setReference] = useState("");
  const [coords, setCoords] = useState(null);
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const detectedZone = useMemo(() => {
    if (!coords) return null;
    return findZone(coords);
  }, [coords]);

  const selectedZone = deliveryZones.find((zone) => zone.id === selectedZoneId);
  const activeZone = detectedZone || selectedZone;
  const markerPoint = coords ? projectPoint(coords) : null;

  function requestLocation() {
    setError("");

    if (!navigator.geolocation) {
      setError("Tu navegador no permite compartir ubicacion.");
      return;
    }

    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentCoords = [
          position.coords.latitude,
          position.coords.longitude,
        ];

        setCoords(currentCoords);
        setSelectedZoneId("");
        setStatus("ready");
      },
      () => {
        setStatus("idle");
        setError("No pudimos tomar tu ubicacion. Podes elegir la zona manualmente.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  function saveQuote() {
    if (!activeZone || !address.trim()) return;

    const quote = {
      source: "envios",
      zoneId: activeZone.id,
      zoneName: activeZone.name,
      fee: activeZone.fee,
      address: address.trim(),
      reference: reference.trim(),
      coords,
      checkedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(quote));
    localStorage.setItem(
      "deliveryInfo",
      JSON.stringify({
        isChecked: true,
        neighborhood: activeZone.name,
        address: address.trim(),
        aditionalInfo: reference.trim(),
        deliveryQuote: quote,
      })
    );

    navigate("/carrito");
  }

  return (
    <main id="shipping">
      <section className="shipping-tool">
        <div className="shipping-copy">
          <p className="eyebrow">
            <FaMotorcycle aria-hidden="true" />
            Delivery en Marcos Paz
          </p>
          <h1>Consulta tu zona de envio</h1>
          <p>
            Escribi tu direccion y usa tu ubicacion para confirmar si llegamos.
            Si estas dentro de una zona, guardamos el costo para sumarlo en el carrito.
          </p>

          <div className="shipping-form">
            <label>
              Direccion
              <input
                type="text"
                value={address}
                placeholder="Ej: Sarmiento 1234"
                onChange={(event) => setAddress(event.target.value)}
              />
            </label>

            <label>
              Referencia
              <input
                type="text"
                value={reference}
                placeholder="Casa, esquina, timbre o aclaracion"
                onChange={(event) => setReference(event.target.value)}
              />
            </label>

            <button type="button" className="location-button" onClick={requestLocation}>
              <FaLocationArrow aria-hidden="true" />
              {status === "loading" ? "Buscando ubicacion..." : "Usar mi ubicacion"}
            </button>

            <label>
              Elegir zona manualmente
              <select
                value={selectedZoneId}
                onChange={(event) => {
                  setSelectedZoneId(event.target.value);
                  setCoords(null);
                  setError("");
                }}
              >
                <option value="">Seleccionar si no usas ubicacion</option>
                {deliveryZones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} - $ {formatPrice(zone.fee)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error && <p className="shipping-alert">{error}</p>}

          {activeZone ? (
            <div className="shipping-result shipping-result--ok">
              <FaCheckCircle aria-hidden="true" />
              <div>
                <strong>Llegamos a tu domicilio</strong>
                <span>
                  {activeZone.name}: $ {formatPrice(activeZone.fee)}
                </span>
              </div>
            </div>
          ) : (
            status === "ready" && (
              <div className="shipping-result">
                <FaMapMarkerAlt aria-hidden="true" />
                <div>
                  <strong>Fuera de las zonas marcadas</strong>
                  <span>Escribinos por WhatsApp y lo revisamos.</span>
                </div>
              </div>
            )
          )}

          <div className="shipping-actions">
            <button
              type="button"
              disabled={!activeZone || !address.trim()}
              onClick={saveQuote}
            >
              <FaShoppingCart aria-hidden="true" />
              Usar en el carrito
            </button>
            <Link to="/catalogo">Seguir comprando</Link>
          </div>
        </div>

        <div className="shipping-map" aria-label="Mapa de zonas de envio">
          <svg viewBox="0 0 100 100" role="img">
            <rect width="100" height="100" rx="6" />
            <path d="M8 25 C28 16 38 34 58 24 S86 16 94 29" />
            <path d="M12 73 C30 60 48 76 66 61 S84 51 92 66" />
            <path d="M25 8 L33 92" />
            <path d="M69 7 L61 94" />
            <path d="M7 51 L93 47" />

            {[...deliveryZones].reverse().map((zone) => (
              <polygon
                key={zone.id}
                points={polygonToPoints(zone.polygon)}
                fill={zone.color}
                className={activeZone?.id === zone.id ? "is-active" : ""}
              />
            ))}

            {markerPoint && (
              <g className="shipping-marker" transform={`translate(${markerPoint[0]} ${markerPoint[1]})`}>
                <circle r="3.2" />
                <circle r="1.2" />
              </g>
            )}
          </svg>

          <div className="shipping-zones">
            {deliveryZones.map((zone) => (
              <div key={zone.id}>
                <span style={{ background: zone.color }} />
                <p>
                  <strong>{zone.name}</strong>
                  $ {formatPrice(zone.fee)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MobileShopNav currentPage="shipping" />
    </main>
  );
}
