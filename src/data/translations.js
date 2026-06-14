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

export const translateType = (type) => typeLabels[type] || type;
export const translateSubType = (subType) => subTypeLabels[subType] || subType;
