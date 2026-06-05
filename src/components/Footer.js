import "../assets/scss/footer.scss";
import React from "react";
import { FaInstagram, FaMapMarkedAlt, FaWhatsapp } from "react-icons/fa";

const WHATSAPP_URL =
  "https://api.whatsapp.com/send?phone=5491121690959&text=Hola%20vengo%20de%20la%20pagina%20web%20oficial%20!";
const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=El%20Malambo%201733%2C%20Marcos%20Paz";
const INSTAGRAM_URL = "https://www.instagram.com/dulce.tentacion.mp/";

export default function Footer() {
  return (
    <footer>
      <div className="content">
        <div className="container">
          <div className="working-hours subcontainer">
            <h4>Horarios de atención</h4>
            <p>Lunes a viernes de 20:30 a 24</p>
            <p>Sábados y domingos de 13 a 24</p>
          </div>
          <div className="location subcontainer">
            <h4>Ubicación</h4>
            <p>El Malambo 1733, Marcos Paz</p>
            <p>Entre Dorrego y Beruti</p>
          </div>
          <div className="contact subcontainer">
            <h4>Contacto</h4>
            <p>WhatsApp: 11-2169-0959</p>
          </div>
        </div>

        <div className="icons" aria-label="Redes y ubicación">
          <a target="_blank" rel="noopener noreferrer" href={INSTAGRAM_URL}>
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
            href={MAPS_URL}
          >
            <FaMapMarkedAlt aria-hidden="true" />
            <span>Google Maps</span>
          </a>
        </div>

        <div className="copyright">
          <p>Copyright © 2023 | André Espinoza</p>
        </div>
      </div>
    </footer>
  );
}
