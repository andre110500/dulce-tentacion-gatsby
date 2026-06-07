import "../assets/scss/footer.scss";
import React from "react";
import { FaInstagram, FaMapMarkedAlt, FaWhatsapp } from "react-icons/fa";
import brand from "../config/brand";

const WHATSAPP_URL = `https://api.whatsapp.com/send?phone=${
  brand.contact.whatsappNumber
}&text=${encodeURIComponent(brand.contact.whatsappMessage)}`;

export default function Footer() {
  return (
    <footer>
      <div className="content">
        <div className="container">
          <div className="working-hours subcontainer">
            <h4>Horarios de atención</h4>
            <p>{brand.hours.weekday}</p>
            <p>{brand.hours.weekend}</p>
          </div>
          <div className="location subcontainer">
            <h4>Ubicación</h4>
            <p>{brand.location.address}</p>
            <p>{brand.location.crossStreets}</p>
          </div>
          <div className="contact subcontainer">
            <h4>Contacto</h4>
            <p>WhatsApp: {brand.contact.whatsappDisplay}</p>
          </div>
        </div>

        <div className="icons" aria-label="Redes y ubicación">
          <a target="_blank" rel="noopener noreferrer" href={brand.contact.instagramUrl}>
            <FaInstagram aria-hidden="true" />
            <span>Instagram</span>
          </a>
          <a target="_blank" rel="noopener noreferrer" href={WHATSAPP_URL}>
            <FaWhatsapp aria-hidden="true" />
            <span>WhatsApp</span>
          </a>
          <a
            className="footer-map-link"
            target="_blank"
            rel="noopener noreferrer"
            href={brand.location.mapsUrl}
          >
            <FaMapMarkedAlt aria-hidden="true" />
            <span>Google Maps</span>
          </a>
        </div>

        <div className="copyright">
          <p>Copyright © 2023 | {brand.author}</p>
        </div>
      </div>
    </footer>
  );
}
