import "../assets/scss/envios.scss";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, navigate } from "gatsby";
import {
  FaCheckCircle,
  FaCopy,
  FaLocationArrow,
  FaMapMarkerAlt,
  FaMotorcycle,
  FaSearch,
  FaShoppingCart,
} from "react-icons/fa";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point, polygon } from "@turf/helpers";
import DeliveryMap from "../components/DeliveryMap";
import MobileShopNav from "../components/MobileShopNav";
import { deliveryAddresses } from "../data/delivery-addresses";
import { deliveryBlocks } from "../data/delivery-blocks";
import { deliveryStreetRules } from "../data/delivery-street-rules";
import { deliveryZones } from "../data/delivery-zones";

const STORAGE_KEY = "deliveryZoneQuote";
const ADDRESS_HISTORY_KEY = "deliveryAddressHistory";
const MIN_CONFIDENT_ACCURACY_METERS = 250;
const MAX_ADDRESS_HISTORY_ITEMS = 12;

function findZone(coords) {
  const [lat, lng] = coords;
  const userPoint = point([lng, lat]);

  return deliveryZones.find((zone) =>
    booleanPointInPolygon(userPoint, polygon(zone.geometry.coordinates))
  );
}

function formatPrice(price) {
  return new Intl.NumberFormat("es-AR").format(price);
}

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function normalizeStreetName(value) {
  return normalizeText(value).replace(/^(EL|LA|LOS|LAS)\s+/, "");
}

function parseAddress(value) {
  const normalized = normalizeText(value);
  const match = normalized.match(/^(.+?)\s+(\d+[A-Z]?)$/);

  if (!match) return null;

  return {
    street: normalizeStreetName(match[1].replace(/^C\s+/, "")),
    number: match[2],
  };
}

function findAddressInLocalList(value) {
  const parsed = parseAddress(value);
  if (!parsed) return null;

  return deliveryAddresses.find(
    (item) =>
      normalizeStreetName(item.street) === parsed.street &&
      String(item.number).toUpperCase() === parsed.number
  );
}

function toAddressNumber(value) {
  const number = Number.parseInt(String(value).replace(/\D/g, ""), 10);
  return Number.isFinite(number) ? number : null;
}

function distanceBetween(a, b) {
  const earthRadiusMeters = 6371000;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const deltaLat = ((b[0] - a[0]) * Math.PI) / 180;
  const deltaLng = ((b[1] - a[1]) * Math.PI) / 180;
  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function interpolateCoords(coords, progress) {
  if (coords.length === 1) return coords[0];

  const segmentLengths = coords.slice(1).map((coord, index) => distanceBetween(coords[index], coord));
  const totalLength = segmentLengths.reduce((sum, length) => sum + length, 0);

  if (!totalLength) return coords[0];

  let targetDistance = totalLength * progress;

  for (let index = 0; index < segmentLengths.length; index += 1) {
    const segmentLength = segmentLengths[index];

    if (targetDistance <= segmentLength) {
      const segmentProgress = segmentLength ? targetDistance / segmentLength : 0;
      const start = coords[index];
      const end = coords[index + 1];

      return [
        start[0] + (end[0] - start[0]) * segmentProgress,
        start[1] + (end[1] - start[1]) * segmentProgress,
      ];
    }

    targetDistance -= segmentLength;
  }

  return coords[coords.length - 1];
}

function interpolateAddressPoints(addressPoints, requestedNumber) {
  const sortedPoints = [...addressPoints]
    .filter((item) => Number.isFinite(item.number) && item.coords?.length === 2)
    .sort((a, b) => a.number - b.number);

  if (sortedPoints.length < 2) return null;

  const firstPoint = sortedPoints[0];
  const lastPoint = sortedPoints[sortedPoints.length - 1];

  if (requestedNumber < firstPoint.number || requestedNumber > lastPoint.number) {
    return null;
  }

  if (requestedNumber === lastPoint.number) return lastPoint.coords;

  const startIndex = sortedPoints.findIndex(
    (item, index) =>
      requestedNumber >= item.number &&
      sortedPoints[index + 1] &&
      requestedNumber < sortedPoints[index + 1].number
  );

  if (startIndex === -1) return null;

  const startPoint = sortedPoints[startIndex];
  const endPoint = sortedPoints[startIndex + 1];
  const progress =
    (requestedNumber - startPoint.number) / (endPoint.number - startPoint.number);

  return [
    startPoint.coords[0] + (endPoint.coords[0] - startPoint.coords[0]) * progress,
    startPoint.coords[1] + (endPoint.coords[1] - startPoint.coords[1]) * progress,
  ];
}

function interpolateBlockSegment(segment, requestedNumber) {
  const minNumber = Math.min(segment.numberStart, segment.numberEnd);
  const maxNumber = Math.max(segment.numberStart, segment.numberEnd);

  if (
    requestedNumber < minNumber ||
    requestedNumber > maxNumber ||
    !segment.startCoords?.length ||
    !segment.endCoords?.length
  ) {
    return null;
  }

  const rangeSize = Math.abs(segment.numberEnd - segment.numberStart) + 1;
  const progress = Math.abs(requestedNumber - segment.numberStart) / rangeSize;

  return [
    segment.startCoords[0] + (segment.endCoords[0] - segment.startCoords[0]) * progress,
    segment.startCoords[1] + (segment.endCoords[1] - segment.startCoords[1]) * progress,
  ];
}

function findAddressInBlocks(parsed, requestedNumber) {
  if (!parsed || requestedNumber === null) return null;

  for (const block of deliveryBlocks) {
    const blockSides = block.sides || block.streetSegments || [];
    const segment = blockSides.find(
      (item) =>
        normalizeStreetName(item.street) === parsed.street &&
        requestedNumber >= Math.min(item.numberStart, item.numberEnd) &&
        requestedNumber <= Math.max(item.numberStart, item.numberEnd)
    );

    if (!segment) continue;

    const coords = interpolateBlockSegment(segment, requestedNumber);
    if (!coords) continue;

    return {
      street: segment.street,
      number: parsed.number,
      label: `${segment.street} ${parsed.number}, Marcos Paz`,
      coords,
      source: "manzana-local",
      blockId: block.id,
      blockLabel: block.label,
      blockSource: block.source,
    };
  }

  return null;
}

function streetHasBlockSides(street) {
  return deliveryBlocks.some((block) => {
    const blockSides = block.sides || block.streetSegments || [];

    return blockSides.some((side) => normalizeStreetName(side.street) === street);
  });
}

function buildAddressPointsFromRule(rule) {
  if (!rule.coords?.length || !Number.isFinite(rule.numberStart) || !Number.isFinite(rule.numberEnd)) {
    return [];
  }

  const minNumber = Math.min(rule.numberStart, rule.numberEnd);
  const maxNumber = Math.max(rule.numberStart, rule.numberEnd);
  const points = [];

  for (let number = minNumber; number < maxNumber; number += 100) {
    const progress =
      (number - rule.numberStart) / (rule.numberEnd - rule.numberStart);

    points.push({
      number,
      coords: interpolateCoords(rule.coords, Math.max(0, Math.min(1, progress))),
    });
  }

  points.push({
    number: maxNumber,
    coords: interpolateCoords(
      rule.coords,
      Math.max(0, Math.min(1, (maxNumber - rule.numberStart) / (rule.numberEnd - rule.numberStart)))
    ),
  });

  return points;
}

function findAddressByStreetRule(value) {
  const parsed = parseAddress(value);
  const requestedNumber = toAddressNumber(parsed?.number);

  if (!parsed || requestedNumber === null) return null;

  const blockResult = findAddressInBlocks(parsed, requestedNumber);
  if (blockResult) return blockResult;

  if (streetHasBlockSides(parsed.street)) return null;

  const rule = deliveryStreetRules.find(
    (item) =>
      [item.street, ...(item.aliases || [])].some(
        (streetName) => normalizeStreetName(streetName) === parsed.street
      ) &&
      ((item.addressPoints?.length && item.addressPoints.length >= 2) ||
        (item.coords?.length &&
          Number.isFinite(item.numberStart) &&
          Number.isFinite(item.numberEnd)))
  );

  if (!rule) return null;

  const addressPoints = rule.addressPoints?.length
    ? rule.addressPoints
    : buildAddressPointsFromRule(rule);
  const coords = interpolateAddressPoints(addressPoints, requestedNumber);

  if (!coords) return null;

  return {
    street: rule.street,
    number: parsed.number,
    label: `${rule.label || rule.street} ${parsed.number}, Marcos Paz`,
    coords,
    source: "regla-local",
  };
}

function buildAddressEntry(address, coords) {
  const parsed = parseAddress(address);
  const street = parsed?.street || normalizeText(address.replace(/\d+/g, ""));
  const number = parsed?.number || "";

  return `{
  street: "${street}",
  number: "${number}",
  label: "${address.trim()}, Marcos Paz",
  coords: [${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}],
},`;
}

export default function Envios() {
  const [address, setAddress] = useState("");
  const [addressHistory, setAddressHistory] = useState([]);
  const [reference, setReference] = useState("");
  const [coords, setCoords] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [copyNotice, setCopyNotice] = useState("");

  const detectedZone = useMemo(() => {
    if (!coords) return null;
    return findZone(coords);
  }, [coords]);

  const selectedZone = deliveryZones.find((zone) => zone.id === selectedZoneId);
  const activeZone = detectedZone || selectedZone;

  useEffect(() => {
    try {
      const savedHistory = JSON.parse(localStorage.getItem(ADDRESS_HISTORY_KEY) || "[]");

      if (Array.isArray(savedHistory)) {
        setAddressHistory(savedHistory.filter(Boolean).slice(0, MAX_ADDRESS_HISTORY_ITEMS));
      }
    } catch {
      setAddressHistory([]);
    }
  }, []);

  function saveAddressToHistory(value) {
    const cleanedValue = value.trim();
    if (!cleanedValue) return;

    const nextHistory = [
      cleanedValue,
      ...addressHistory.filter(
        (item) => normalizeText(item) !== normalizeText(cleanedValue)
      ),
    ].slice(0, MAX_ADDRESS_HISTORY_ITEMS);

    setAddressHistory(nextHistory);
    localStorage.setItem(ADDRESS_HISTORY_KEY, JSON.stringify(nextHistory));
  }

  const handleMapPick = useCallback((pickedCoords) => {
    setCoords(pickedCoords);
    setLocationAccuracy(null);
    setSelectedZoneId("");
    setStatus("ready");
    setError("");
    setNotice("Punto ajustado en el mapa.");
    setLookupResult((prev) =>
      prev
        ? {
            ...prev,
            source: "manual",
            label: "Punto marcado manualmente",
            coords: pickedCoords,
          }
        : {
            source: "manual",
            label: "Punto marcado manualmente",
            coords: pickedCoords,
          }
    );
    setCopyNotice("");
  }, []);

  function requestLocation() {
    setError("");
    setNotice("");

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
        setLocationAccuracy(position.coords.accuracy);
        setSelectedZoneId("");
        setStatus("ready");
        setNotice("Revisa el marcador. Si no esta exacto, movelo en el mapa.");
        setLookupResult({
          source: "browser",
          label: "Ubicacion del navegador",
          coords: currentCoords,
        });
      },
      () => {
        setStatus("idle");
        setError("No pudimos tomar tu ubicacion. Podes elegir la zona manualmente.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  function searchAddress() {
    const cleanedAddress = address.trim();
    if (!cleanedAddress) {
      setError("Escribi una direccion para buscarla en el mapa.");
      return;
    }

    setError("");
    setNotice("");
    setCopyNotice("");

    const result = findAddressInLocalList(cleanedAddress) || findAddressByStreetRule(cleanedAddress);

    if (!result) {
      setCoords(null);
      setLocationAccuracy(null);
      setStatus("idle");
      setLookupResult({
        coords: null,
        source: "base-local",
        label: cleanedAddress,
      });
      setError(
        "Esa direccion todavia no esta cargada ni calibrada en la base local. Marca el punto exacto en el mapa y copia la entrada para agregarla."
      );
      return;
    }

    setCoords(result.coords);
    setLocationAccuracy(null);
    setSelectedZoneId("");
    setStatus("ready");
    setNotice(
      result.source === "manzana-local"
        ? "Direccion ubicada por manzana local."
        : result.source === "regla-local"
        ? "Direccion estimada con una regla local de calle."
        : "Direccion encontrada en la base local."
    );
    setLookupResult({
      coords: result.coords,
      source: result.source || "base-local",
      label: result.label,
      blockLabel: result.blockLabel,
      blockSource: result.blockSource,
    });
    saveAddressToHistory(cleanedAddress);
  }

  async function copyAddressEntry() {
    if (!address.trim() || !coords) return;

    const entry = buildAddressEntry(address, coords);
    await navigator.clipboard.writeText(entry);
    setCopyNotice("Entrada copiada.");
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
                list="saved-delivery-addresses"
                placeholder="Ej: Sarmiento 1234"
                onChange={(event) => {
                  setAddress(event.target.value);
                  setSelectedZoneId("");
                  setCoords(null);
                  setLocationAccuracy(null);
                  setNotice("");
                  setLookupResult(null);
                }}
              />
              <datalist id="saved-delivery-addresses">
                {addressHistory.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </label>

            <button type="button" className="search-address-button" onClick={searchAddress}>
              <FaSearch aria-hidden="true" />
              Buscar direccion
            </button>

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
                  setLocationAccuracy(null);
                  setError("");
                  setNotice("");
                  setLookupResult(null);
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
          {notice && <p className="shipping-alert shipping-alert--soft">{notice}</p>}

          {lookupResult && (
            <div className="shipping-debug">
              <strong>Resultado de busqueda</strong>
              <span>Fuente: {lookupResult.source}</span>
              {lookupResult.label && <span>{lookupResult.label}</span>}
              {lookupResult.blockLabel && <span>{lookupResult.blockLabel}</span>}
              {lookupResult.blockSource && <span>Datos: {lookupResult.blockSource}</span>}
              {lookupResult.coords ? (
                <span>
                  Lat: {lookupResult.coords[0].toFixed(6)} / Lon:{" "}
                  {lookupResult.coords[1].toFixed(6)}
                </span>
              ) : (
                <span>Sin coordenadas</span>
              )}
            </div>
          )}

          {address.trim() && coords && (
            <div className="shipping-debug">
              <strong>Entrada para base local</strong>
              <code>{buildAddressEntry(address, coords)}</code>
              <button type="button" onClick={copyAddressEntry}>
                <FaCopy aria-hidden="true" />
                Copiar entrada
              </button>
              {copyNotice && <span>{copyNotice}</span>}
            </div>
          )}

          {locationAccuracy > MIN_CONFIDENT_ACCURACY_METERS && (
            <p className="shipping-alert shipping-alert--soft">
              La ubicacion del navegador es aproximada. Si no coincide, busca tu direccion
              manualmente.
            </p>
          )}

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
          <p className="shipping-map__hint">
            Toca el mapa o arrastra el pin para marcar el domicilio exacto.
          </p>
          <DeliveryMap
            zones={deliveryZones}
            activeZoneId={activeZone?.id}
            userCoords={coords}
            onMapPick={handleMapPick}
          />

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
