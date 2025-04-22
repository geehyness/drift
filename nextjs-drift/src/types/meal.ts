// types/meal.ts

// Core Sanity Image Type
export interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
    url?: string;
  };
  // Keep these if you need them
  hotspot?: any;
  crop?: any;
}

// Category Reference (unexpanded)
export interface CategoryReference {
  _type: 'reference';
  _ref: string;
}

// Expanded Category Document
export interface Category {
  _id: string;
  _type: 'category';
  title: string;
  slug: {
    current: string;
  };
}

export interface Extra {
  _id: string;
  _type: 'extra';
  name: string;
  price: number;
  isAvailable: boolean;
  description?: string;
}

export interface ChoiceOption {
  _key: string;
  name: string;
  price?: number;
}

export interface Choice {
  _id: string;
  _type: 'choice';
  name: string;
  description?: string;
  isRequired: boolean;
  maxOptions: number;
  options: ChoiceOption[];
}

export interface MealSize {
  _key: string;
  label: string;
  price: number;
}

export interface Meal {
  _id: string;
  _type: 'meal';
  name: string;
  description?: string;
  price?: number;
  sizes?: MealSize[];
  image?: {
    _type:'image',
    asset: {
      _ref: string;
      _type: 'reference';
      url?: string;
    }
  };
  category?: CategoryReference | Category;
  isAvailable: boolean;
  featured?: boolean;
  extras?: Extra[];
  choices?: Choice[];
  notes?: string;
}

// Cart Types
export interface SelectedChoiceGroup {
  _ref: string;
  choiceName: string;
  selectedOptions: Array<{
    _key?: string;
    name: string;
    price?: number;
  }>;
}

export interface CartItem {
  itemId: string;
  mealId: string;
  name: string;
  basePrice: number;
  image?: SanityImage;
  quantity: number;
  selectedSize?: {
    label: string;
    price: number;
    _key?: string;
  };
  selectedChoices?: SelectedChoiceGroup[];
  availableExtras: Extra[];
  selectedExtras: Extra[][];
}

// Shopping Cart Context Type
export interface ShoppingCartContextType {
  isCartOpen: boolean;
  cartItems: CartItem[];
  openCart: () => void;
  closeCart: () => void;
  addToCart: (item: Omit<CartItem, 'quantity' | 'selectedExtras'> & { 
    availableExtras: Extra[] 
  }) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  updateExtraSelection: (itemId: string, quantityIndex: number, extra: Extra) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getCartTotal: () => number;
  getItemQuantity: (itemId: string) => number;
  toggleCart: () => void;
}

// Helper Types
export interface CategoryWithCount extends Category {
  mealCount: number;
}

// Type Guards
export function isExpandedCategory(
  category: CategoryReference | Category
): category is Category {
  return (category as Category)._id !== undefined;
}

export function isFullyExpandedMeal(meal: Meal): meal is Meal & {
  category: Category;
  extras: Extra[];
  choices: Choice[];
} {
  return (
    isExpandedCategory(meal.category!) &&
    Array.isArray(meal.extras) &&
    Array.isArray(meal.choices)
  );
}