import { Product } from "@/types/product";

export const products: Product[] = [
  // Frutas
  { id: 1, name: "Manzana Roja", price: 12.50, image: "🍎", category: "Frutas", unit: "kg" },
  { id: 2, name: "Plátano", price: 15.00, image: "🍌", category: "Frutas", unit: "kg" },
  { id: 3, name: "Naranja", price: 10.00, image: "🍊", category: "Frutas", unit: "kg" },
  { id: 4, name: "Uvas", price: 35.00, image: "🍇", category: "Frutas", unit: "kg" },
  { id: 5, name: "Fresa", price: 40.00, image: "🍓", category: "Frutas", unit: "kg" },
  { id: 6, name: "Piña", price: 25.00, image: "🍍", category: "Frutas", unit: "pza" },

  // Verduras
  { id: 7, name: "Tomate", price: 14.00, image: "🍅", category: "Verduras", unit: "kg" },
  { id: 8, name: "Zanahoria", price: 8.00, image: "🥕", category: "Verduras", unit: "kg" },
  { id: 9, name: "Brócoli", price: 18.00, image: "🥦", category: "Verduras", unit: "kg" },
  { id: 10, name: "Lechuga", price: 12.00, image: "🥬", category: "Verduras", unit: "pza" },
  { id: 11, name: "Cebolla", price: 10.00, image: "🧅", category: "Verduras", unit: "kg" },
  { id: 12, name: "Papa", price: 16.00, image: "🥔", category: "Verduras", unit: "kg" },

  // Abarrotes
  { id: 13, name: "Arroz 1kg", price: 22.00, image: "🍚", category: "Abarrotes", unit: "pza" },
  { id: 14, name: "Frijol 1kg", price: 28.00, image: "🫘", category: "Abarrotes", unit: "pza" },
  { id: 15, name: "Aceite 1L", price: 35.00, image: "🫒", category: "Abarrotes", unit: "pza" },
  { id: 16, name: "Azúcar 1kg", price: 25.00, image: "🧂", category: "Abarrotes", unit: "pza" },
  { id: 17, name: "Leche 1L", price: 22.00, image: "🥛", category: "Abarrotes", unit: "pza" },
  { id: 18, name: "Huevo 12pz", price: 42.00, image: "🥚", category: "Abarrotes", unit: "pza" },

  // Bebidas
  { id: 50, name: "Agua Natural 1L", price: 10.00, image: "💧", category: "Bebidas", unit: "pza" },
  { id: 51, name: "Refresco Cola 600ml", price: 18.00, image: "🥤", category: "Bebidas", unit: "pza" },
  { id: 52, name: "Jugo de Naranja 1L", price: 28.00, image: "🧃", category: "Bebidas", unit: "pza" },
  { id: 53, name: "Café Molido 250g", price: 55.00, image: "☕", category: "Bebidas", unit: "pza" },
  { id: 54, name: "Té Verde 20 sobres", price: 35.00, image: "🍵", category: "Bebidas", unit: "pza" },
  { id: 55, name: "Leche de Almendra 1L", price: 45.00, image: "🥛", category: "Bebidas", unit: "pza" },
  { id: 56, name: "Agua Mineral 600ml", price: 12.00, image: "🫧", category: "Bebidas", unit: "pza" },
  { id: 57, name: "Chocolate en Polvo 400g", price: 48.00, image: "🍫", category: "Bebidas", unit: "pza" },

  // Librería
  { id: 19, name: "Cuaderno Profesional 100h", price: 35.00, image: "📓", category: "Librería", unit: "pza" },
  { id: 20, name: "Cuaderno Universitario 200h", price: 55.00, image: "📒", category: "Librería", unit: "pza" },
  { id: 21, name: "Cuaderno Cuadrícula 100h", price: 38.00, image: "📗", category: "Librería", unit: "pza" },
  { id: 22, name: "Lápices 12pz", price: 25.00, image: "✏️", category: "Librería", unit: "pza" },
  { id: 23, name: "Lapiceros 3pz", price: 18.00, image: "🖊️", category: "Librería", unit: "pza" },
  { id: 24, name: "Lapiceros de Gel 6pz", price: 35.00, image: "🖋️", category: "Librería", unit: "pza" },
  { id: 25, name: "Borradores 3pz", price: 12.00, image: "🧹", category: "Librería", unit: "pza" },
  { id: 26, name: "Marcadores 12pz", price: 65.00, image: "🖍️", category: "Librería", unit: "pza" },
  { id: 27, name: "Marcadores Fluorescentes 6pz", price: 45.00, image: "🔆", category: "Librería", unit: "pza" },
  { id: 28, name: "Carpeta Plástica", price: 22.00, image: "📁", category: "Librería", unit: "pza" },
  { id: 29, name: "Carpeta con Broche", price: 28.00, image: "📂", category: "Librería", unit: "pza" },
  { id: 30, name: "Pegamento en Barra", price: 15.00, image: "🧴", category: "Librería", unit: "pza" },
  { id: 31, name: "Pegamento Líquido 250ml", price: 25.00, image: "🫗", category: "Librería", unit: "pza" },
  { id: 32, name: "Tijeras Escolares", price: 28.00, image: "✂️", category: "Librería", unit: "pza" },
  { id: 33, name: "Agenda 2025", price: 85.00, image: "📅", category: "Librería", unit: "pza" },
  { id: 34, name: "Resma de Papel A4", price: 95.00, image: "📄", category: "Librería", unit: "pza" },
  { id: 35, name: "Resma de Papel Carta", price: 90.00, image: "🗒️", category: "Librería", unit: "pza" },
  { id: 36, name: "Colores de Madera 24pz", price: 65.00, image: "🎨", category: "Librería", unit: "pza" },
  { id: 37, name: "Acuarelas 12 colores", price: 55.00, image: "🖼️", category: "Librería", unit: "pza" },
  { id: 38, name: "Pinceles Set 6pz", price: 42.00, image: "🖌️", category: "Librería", unit: "pza" },
  { id: 39, name: "Lienzo para Pintar 30x40", price: 75.00, image: "🎭", category: "Librería", unit: "pza" },
  { id: 40, name: "Mochila Escolar", price: 250.00, image: "🎒", category: "Librería", unit: "pza" },
  { id: 41, name: "Mochila con Ruedas", price: 350.00, image: "🧳", category: "Librería", unit: "pza" },
  { id: 42, name: "Calculadora Científica", price: 180.00, image: "🔢", category: "Librería", unit: "pza" },
  { id: 43, name: "Calculadora Básica", price: 65.00, image: "🧮", category: "Librería", unit: "pza" },
  { id: 44, name: "Set de Regalo Literario", price: 120.00, image: "🎁", category: "Librería", unit: "pza" },
  { id: 45, name: "Diario Personal", price: 95.00, image: "📖", category: "Librería", unit: "pza" },

  // Restaurantes
  { id: 100, name: "Hamburguesa Clásica", price: 89.00, image: "🍔", category: "Restaurantes", unit: "pza" },
  { id: 101, name: "Pizza Margarita", price: 165.00, image: "🍕", category: "Restaurantes", unit: "pza" },
  { id: 102, name: "Tacos al Pastor (5)", price: 75.00, image: "🌮", category: "Restaurantes", unit: "pza" },
  { id: 103, name: "Burrito de Carne", price: 85.00, image: "🌯", category: "Restaurantes", unit: "pza" },
  { id: 104, name: "Sushi Roll California", price: 145.00, image: "🍣", category: "Restaurantes", unit: "pza" },
  { id: 105, name: "Pollo Frito (4 piezas)", price: 135.00, image: "🍗", category: "Restaurantes", unit: "pza" },
  { id: 106, name: "Ensalada César", price: 75.00, image: "🥗", category: "Restaurantes", unit: "pza" },
  { id: 107, name: "Pasta Boloñesa", price: 95.00, image: "🍝", category: "Restaurantes", unit: "pza" },

  // Heladerías
  { id: 110, name: "Helado de Vainilla", price: 35.00, image: "🍨", category: "Heladerías", unit: "pza" },
  { id: 111, name: "Cono de Chocolate", price: 30.00, image: "🍦", category: "Heladerías", unit: "pza" },
  { id: 112, name: "Paleta de Fresa", price: 25.00, image: "🍡", category: "Heladerías", unit: "pza" },
  { id: 113, name: "Banana Split", price: 85.00, image: "🍌", category: "Heladerías", unit: "pza" },
  { id: 114, name: "Sundae de Caramelo", price: 65.00, image: "🍮", category: "Heladerías", unit: "pza" },
  { id: 115, name: "Frappé de Café", price: 55.00, image: "🥤", category: "Heladerías", unit: "pza" },

  // Panadería
  { id: 120, name: "Pan Francés (pieza)", price: 5.00, image: "🥖", category: "Panadería", unit: "pza" },
  { id: 121, name: "Croissant", price: 18.00, image: "🥐", category: "Panadería", unit: "pza" },
  { id: 122, name: "Concha", price: 8.00, image: "🍞", category: "Panadería", unit: "pza" },
  { id: 123, name: "Bolillo (5pz)", price: 15.00, image: "🥖", category: "Panadería", unit: "pza" },
  { id: 124, name: "Pastel de Chocolate", price: 285.00, image: "🍰", category: "Panadería", unit: "pza" },
  { id: 125, name: "Donas Glaseadas (6)", price: 65.00, image: "🍩", category: "Panadería", unit: "pza" },
  { id: 126, name: "Galletas de Avena", price: 45.00, image: "🍪", category: "Panadería", unit: "pza" },

  // Farmacia
  { id: 130, name: "Paracetamol 500mg (20)", price: 35.00, image: "💊", category: "Farmacia", unit: "pza" },
  { id: 131, name: "Alcohol 70° 500ml", price: 28.00, image: "🧴", category: "Farmacia", unit: "pza" },
  { id: 132, name: "Curitas (50pz)", price: 45.00, image: "🩹", category: "Farmacia", unit: "pza" },
  { id: 133, name: "Termómetro Digital", price: 95.00, image: "🌡️", category: "Farmacia", unit: "pza" },
  { id: 134, name: "Mascarillas (10pz)", price: 35.00, image: "😷", category: "Farmacia", unit: "pza" },
  { id: 135, name: "Vitamina C 30 tabs", price: 75.00, image: "💊", category: "Farmacia", unit: "pza" },

  // COMBOS - Básicos
  { id: 200, name: "🍳 Combo Desayuno", price: 145.00, image: "🍳", category: "Combos", unit: "combo" },
  { id: 201, name: "🍛 Combo Almuerzo", price: 195.00, image: "🍛", category: "Combos", unit: "combo" },
  { id: 202, name: "🧼 Combo Limpieza", price: 165.00, image: "🧼", category: "Combos", unit: "combo" },
  // COMBOS - Rápidos
  { id: 203, name: "🍜 Combo Emergencia", price: 95.00, image: "🍜", category: "Combos", unit: "combo" },
  { id: 204, name: "☕ Combo Antojo", price: 110.00, image: "☕", category: "Combos", unit: "combo" },
  // COMBOS - Familiares
  { id: 205, name: "👨‍👩‍👧 Combo Semanal Familiar", price: 385.00, image: "👨‍👩‍👧", category: "Combos", unit: "combo" },
];

export const categories = [
  "Todos",
  "Combos",
  "Frutas",
  "Verduras",
  "Abarrotes",
  "Bebidas",
  "Restaurantes",
  "Heladerías",
  "Panadería",
  "Farmacia",
  "Librería",
];

export interface ComboInfo {
  id: number;
  name: string;
  tagline: string;
  group: "Básicos" | "Rápidos" | "Familiares";
  items: string[];
}

export const combosInfo: ComboInfo[] = [
  {
    id: 200, name: "🍳 Combo Desayuno", group: "Básicos",
    tagline: "Desayuno listo y para preparar",
    items: ["Pan", "Huevos", "Leche", "Mantequilla"],
  },
  {
    id: 201, name: "🍛 Combo Almuerzo", group: "Básicos",
    tagline: "Con este combo tu almuerzo completo",
    items: ["Arroz", "Pollo o carne", "Papa", "Verduras (cebolla, tomate)"],
  },
  {
    id: 202, name: "🧼 Combo Limpieza", group: "Básicos",
    tagline: "Combo perfecto para el cuidado del hogar",
    items: ["Detergente", "Lejía", "Esponja", "Papel higiénico"],
  },
  {
    id: 203, name: "🍜 Combo Emergencia", group: "Rápidos",
    tagline: "¿Nada que cocinar en casa? Este combo te salva el día",
    items: ["Fideos instantáneos", "Atún", "Galletas", "Bebida"],
  },
  {
    id: 204, name: "☕ Combo Antojo", group: "Rápidos",
    tagline: "Para el antojito en casa",
    items: ["Galletas", "Chocolate", "Café o leche"],
  },
  {
    id: 205, name: "👨‍👩‍👧 Combo Semanal Familiar", group: "Familiares",
    tagline: "Toda la semana cubierta para tu familia",
    items: ["Arroz (1kg o más)", "Azúcar", "Aceite", "Fideos", "Huevos"],
  },
];
