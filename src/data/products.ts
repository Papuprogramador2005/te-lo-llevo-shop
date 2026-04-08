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

  // Librería
  { id: 19, name: "Cuaderno 100h", price: 35.00, image: "📓", category: "Librería", unit: "pza" },
  { id: 20, name: "Lápices 12pz", price: 25.00, image: "✏️", category: "Librería", unit: "pza" },
  { id: 21, name: "Plumas 3pz", price: 18.00, image: "🖊️", category: "Librería", unit: "pza" },
  { id: 22, name: "Colores 24pz", price: 65.00, image: "🖍️", category: "Librería", unit: "pza" },
  { id: 23, name: "Pegamento", price: 15.00, image: "🧴", category: "Librería", unit: "pza" },
  { id: 24, name: "Tijeras", price: 28.00, image: "✂️", category: "Librería", unit: "pza" },
];

export const categories = ["Todos", "Frutas", "Verduras", "Abarrotes", "Librería"];
