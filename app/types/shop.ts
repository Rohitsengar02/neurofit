export interface CartItem {
  id: string;
  name: string;
  mainImage: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  addedAt?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  mainImage: string;
  images: string[];
  price: number;
  discountedPrice: number;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  features?: string[];
  specifications?: Record<string, string>;
}
