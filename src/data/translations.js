export const typeLabels = {
  drink: "Bebidas",
  "ice-cream": "Helados",
  "frozen-treat": "Postres helados",
  cigarette: "Cigarrillos",
  "add-on": "Agregados",
};

export const subTypeLabels = {
  "wafer-cone": "Cucuruchos",
  "pot-topping": "Toppings",
  can: "Latas",
  fernet: "Fernet",
  liqueur: "Licores",
  "small-bottle": "Petaca",
  "soft-drink": "Sin alcohol",
  wine: "Vinos",
  dessert: "Postres",
  popsicle: "Paletas",
};

export const typeOrder = [
  "ice-cream",
  "frozen-treat",
  "drink",
  "cigarette",
  "add-on",
];

export const subTypeOrder = {
  "ice-cream": ["", "wafer-cone"],
  drink: ["soft-drink", "can", "wine", "fernet", "liqueur", "small-bottle"],
  "frozen-treat": ["popsicle", "dessert"],
};

export const translateType = (type) => typeLabels[type] || type;
export const translateSubType = (subType) => subTypeLabels[subType] || subType;

