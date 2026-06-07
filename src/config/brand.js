const brand = {
  name: "Dulce Tentación",
  legalName: "Dulce Tentación Marcos Paz",
  description: "Catalogo online",
  author: "André Espinoza",
  siteUrl: "https://dulce-tentacion-mp.netlify.app",
  metaImage: "/meta-image.png",
  manifestIcon: "src/images/brand/logo.png",
  location: {
    address: "El Malambo 1733, Marcos Paz",
    crossStreets: "Entre Dorrego y Beruti",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=El%20Malambo%201733%2C%20Marcos%20Paz",
  },
  contact: {
    whatsappDisplay: "11-2169-0959",
    whatsappNumber: "5491121690959",
    whatsappMessage: "Hola vengo de la pagina web oficial !",
    instagramHandle: "dulce.tentacion.mp",
    instagramUrl: "https://www.instagram.com/dulce.tentacion.mp/",
  },
  delivery: {
    mainArea: "Marcos Paz",
    secondaryArea: "y Santa Isabel",
    homepageText: "Envios a Marcos Paz y Mariano Acosta",
  },
  hours: {
    timezone: "America/Argentina/Buenos_Aires",
    weekday: "Lunes a viernes de 20:30 a 24",
    weekend: "Sábados y domingos de 13 a 24",
    weekdayOpeningMinutes: 20 * 60 + 30,
    weekendOpeningMinutes: 13 * 60,
    closingMinutes: 24 * 60,
  },
};

module.exports = brand;
