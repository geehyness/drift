// types/meal.ts
import { Image } from 'sanity'; // Sanity v3 might export Image type directly

export interface SanityImage extends Image {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
    _weak?: boolean;
    _key?: string;
    // If fetching with URL directly
    url?: string;
  };
  // Add other Sanity image fields like hotspot, crop if you use them
  hotspot?: {
    _key?: string;
    _type: 'sanity.imageHotspot';
    x: number;
    y: number;
    height: number;
    width: number;
  };
  crop?: {
    _key?: string;
    _type: 'sanity.imageCrop';
    top: number;
    bottom: number;
    left: number;
    right: number;
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
  _key?: string; // Sanity array item key
  name: string;
  price?: number; // Price adjustment for this option
}

export interface Choice {
  _id: string;
  _type: 'choice';
  name: string;
  description?: string;
  isRequired: boolean;
  maxOptions: number;
  options: Array<ChoiceOption>;
}

export interface Meal {
  _id: string;
  _type: 'meal'; // Or 'drink', etc.
  name: string;
  description?: string;
  // Define sizes OR a single price, not typically both for base price
  sizes?: Array<{
    _key?: string; // Sanity array item key
    label: string;
    price: number;
  }>;
  price?: number; // Used for items without sizes
  image?: SanityImage; // Sanity image asset
  category?: { _type: 'reference'; _ref: string } | { _type: 'category'; title: string; /* other category fields */ };
  isAvailable: boolean;
  extras?: Array<Extra>; // Available extras (actual Extra objects, assuming dereferenced)
  choices?: Array<Choice>; // Available choice groups (actual Choice objects, assuming dereferferenced)
  notes?: string;
}

// Structure for storing selected choices in the CartItem
export interface SelectedChoiceGroup {
  _ref: string; // Reference to the original Choice document ID
  choiceName: string; // Store name for display
  selectedOptions: Array<{
    _key?: string; // Key from the original option
    name: string;
    price?: number; // Store price at time of adding, in case it changes later
  }>;
}

// Represents a single unique item configuration in the shopping cart
export interface CartItem {
  itemId: string; // Unique ID: mealId + hash(selectedSize + selectedChoices) - used for map keys, updates etc.
  mealId: string; // The _id of the original meal document (useful for lookup if needed)
  name: string; // Display name for the item instance (e.g., "Meat Platter (3 Meats, Fries)")
  basePrice: number; // The price of the selected size or the single meal price at time of adding

  image?: SanityImage; // Include image for display in cart

  quantity: number; // How many units of *this specific configuration* are in the cart

  // The configuration details that make this item unique
  selectedSize?: {
     label: string;
     price: number; // Price at time of adding
     _key?: string; // Key from the original size option
  };
  selectedChoices?: Array<SelectedChoiceGroup>; // Selected choices for this item instance

  // Available extras for selection IN THE CART (passed from Meal)
  availableExtras: Array<Extra>;
  // Selected extras per *quantity instance*. This structure supports selecting extras per individual unit.
  selectedExtras: Array<Array<Extra>>; // Array of arrays: outer array is for each quantity (length = item.quantity), inner array is selected extras for that specific unit instance

  // Other fields from Meal that might be useful for display/logic in cart (optional)
  // category?: any; // Reference or expanded category
}


// Inside types/meal.ts or wherever ShoppingCartContextType is defined

interface ShoppingCartContextType {
  isCartOpen: boolean;
  cartItems: CartItem[];
  openCart: () => void;
  closeCart: () => void;
  addToCart: (item: Omit<CartItem, 'quantity' | 'selectedExtras'> & { availableExtras: Array<Extra> }) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  updateExtraSelection: (itemId: string, quantityIndex: number, extra: Extra) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getCartTotal: () => number;
  getItemQuantity: (itemId: string) => number;
  toggleCart: () => void; // <--- Added this line
}