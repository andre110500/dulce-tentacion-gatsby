import React, { useEffect, useRef } from "react";
import { deliveryMapCenter } from "../data/delivery-zones";

export default function DeliveryMap({
  zones,
  activeZoneId,
  userCoords,
  onMapPick,
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);

  useEffect(() => {
    let disposed = false;

    async function setupMap() {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (disposed || !mapRef.current || mapInstanceRef.current) return;

      const map = L.map(mapRef.current, {
        center: deliveryMapCenter,
        zoom: 13,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      const zoneLayer = L.geoJSON(
        {
          type: "FeatureCollection",
          features: zones.map((zone) => ({
            type: "Feature",
            properties: {
              id: zone.id,
              name: zone.name,
              fee: zone.fee,
              color: zone.color,
            },
            geometry: zone.geometry,
          })),
        },
        {
          style: (feature) => {
            const isActive = feature.properties.id === activeZoneId;

            return {
              color: feature.properties.color,
              fillColor: feature.properties.color,
              fillOpacity: isActive ? 0.38 : 0.2,
              opacity: 0.95,
              weight: isActive ? 4 : 3,
            };
          },
          onEachFeature: (feature, layer) => {
            layer.bindPopup(
              `<strong>${feature.properties.name}</strong><br/>Envio: $ ${feature.properties.fee}`
            );
          },
        }
      ).addTo(map);

      const bounds = zoneLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [26, 26] });
      }

      map.on("click", (event) => {
        onMapPick?.([event.latlng.lat, event.latlng.lng]);
      });

      mapInstanceRef.current = { L, map, zoneLayer };
    }

    setupMap();

    return () => {
      disposed = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.map.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [zones, onMapPick]);

  useEffect(() => {
    const mapContext = mapInstanceRef.current;
    if (!mapContext) return;

    const { zoneLayer } = mapContext;
    zoneLayer.eachLayer((layer) => {
      const feature = layer.feature;
      const isActive = feature.properties.id === activeZoneId;

      layer.setStyle({
        fillOpacity: isActive ? 0.38 : 0.2,
        weight: isActive ? 4 : 3,
      });
    });
  }, [activeZoneId]);

  useEffect(() => {
    const mapContext = mapInstanceRef.current;
    if (!mapContext || !userCoords) return;

    const { L, map } = mapContext;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(userCoords);
    } else {
      userMarkerRef.current = L.marker(userCoords, {
        draggable: true,
        icon: L.divIcon({
          className: "shipping-map__pin",
          html: "<span></span>",
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        }),
      }).addTo(map);

      userMarkerRef.current.on("dragend", (event) => {
        const position = event.target.getLatLng();
        onMapPick?.([position.lat, position.lng]);
      });
    }

    map.setView(userCoords, Math.max(map.getZoom(), 14));
  }, [userCoords]);

  return <div className="shipping-map__canvas" ref={mapRef} />;
}
