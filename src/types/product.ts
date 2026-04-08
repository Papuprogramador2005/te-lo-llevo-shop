export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  unit: string;
}

export interface CartItem extends Product {
  quantity: number;
}
