// context/ShoppingCartContext.tsx
"use client"; // <--- Add this directive at the very top

import { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
// Import necessary types from your types file (ensure types/meal.ts is updated with the corrected interface)
import { CartItem, Extra, Meal, SelectedChoiceGroup, ShoppingCartContextType, SanityImage } from '@/types/meal';


// Define the context with the type we created
const ShoppingCartContext = createContext<ShoppingCartContextType | undefined>(undefined);

// Define the props for the provider component
interface ShoppingCartProviderProps {
  children: ReactNode;
}

// Helper to generate a consistent unique ID for a cart item configuration
// This ID must uniquely represent the combination of meal ID, selected size, and selected choices
const generateCartItemId = (mealId: string, selectedSize?: { _key?: string }, selectedChoices?: Array<{ _ref: string; selectedOptions: Array<{ _key?: string }> }>): string => {
  let id = mealId;
  // Include size key if a size is selected
  if (selectedSize?._key) {
    id += `_size-${selectedSize._key}`;
  }

  // Include choice selections if any choices are made
  if (selectedChoices && selectedChoices.length > 0) {
    // Sort choices and options by their _ref and _key for consistent ID generation
    // Important: Use the _key from the *option* itself for uniqueness within a choice group
    const sortedChoices = [...selectedChoices].sort((a, b) => a._ref.localeCompare(b._ref));
    for (const choiceGroup of sortedChoices) {
      id += `_choice-${choiceGroup._ref}`;
      if (choiceGroup.selectedOptions.length > 0) {
        const sortedOptions = [...choiceGroup.selectedOptions].sort((a, b) => (a._key || '').localeCompare(b._key || ''));
        id += `-${sortedOptions.map(opt => opt._key).join(',')}`;
      }
    }
  }
  // You might want to hash the final string for a shorter ID, but this is reliable
  // For example: import hash from 'object-hash'; return mealId + '_' + hash({ size: selectedSize, choices: selectedChoices });
  // Using a direct string concatenation for simplicity here.
  return id;
};


export function ShoppingCartProvider({ children }: ShoppingCartProviderProps) {
  // State to hold the cart items, initialized from localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Check if code is running in the browser environment
    if (typeof window !== 'undefined') {
      try {
        const jsonCartData = localStorage.getItem('shopping-cart');
        // Parse the JSON data from localStorage, default to empty array if null or parsing fails
        const parsedData = jsonCartData != null ? JSON.parse(jsonCartData) : [];
        // Optional: Add validation/type checking for parsedData here if needed
        return parsedData;
      } catch (error) {
        console.error("Failed to parse shopping cart from localStorage:", error);
        return []; // Return empty array if parsing fails
      }
    }
    return []; // Default to empty array if not in browser
  });

  // Effect to persist cart items to localStorage whenever the cartItems state changes
  useEffect(() => {
    // Check if code is running in the browser environment
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('shopping-cart', JSON.stringify(cartItems));
      } catch (error) {
        console.error("Failed to save shopping cart to localStorage:", error);
      }
    }
  }, [cartItems]); // Dependency array: run whenever cartItems changes


  // State to manage the open/closed state of the cart overlay
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Functions to open and close the cart
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  // Function to toggle the cart open/closed state
  const toggleCart = useCallback(() => setIsCartOpen(prev => !prev), []); // <--- The actual toggle function


  // Get the quantity of a specific unique item configuration in the cart
  // This function is now used by the MealCard to potentially show quantity (though simplified there)
  // and by the ShoppingCart to render quantities.
  const getItemQuantity = useCallback((itemId: string) => {
      // Find the item by its unique itemId and return its quantity, or 0 if not found
      return cartItems.find(item => item.itemId === itemId)?.quantity || 0;
  }, [cartItems]); // Dependency array: run whenever cartItems changes


  // Add an item with a specific configuration to the cart
  const addToCart = useCallback((itemToAdd: Omit<CartItem, 'quantity' | 'selectedExtras'> & { availableExtras: Array<Extra> }) => {
    setCartItems(currentItems => {
      // Check if an item with this exact configuration already exists in the cart
      const existingItemIndex = currentItems.findIndex(item => item.itemId === itemToAdd.itemId);

      if (existingItemIndex > -1) {
        // If the item configuration exists, increase its quantity
        return currentItems.map((item, index) => {
          if (index === existingItemIndex) {
              // When increasing quantity, we also need to ensure there's a corresponding
              // empty array in `selectedExtras` for the new unit's extras selection.
            return {
                ...item,
                quantity: item.quantity + 1,
                selectedExtras: [...item.selectedExtras, []] // Add an empty array for the new unit
            };
          }
          return item;
        });
      } else {
        // If the item configuration does not exist, add it as a new item with quantity 1
         const newItem: CartItem = {
            ...itemToAdd, // Spread the provided item details (includes itemId, mealId, name, basePrice, selectedSize, selectedChoices, availableExtras, image)
            quantity: 1, // Start with quantity 1 for a new item configuration
            // Initialize selectedExtras with an array containing one empty array,
            // representing the extras selection for the first unit.
            selectedExtras: [[]],
         };
        return [...currentItems, newItem]; // Add the new item configuration to the cart
      }
    });
  }, []); // No external dependencies needed for this callback


  // Remove a unique item instance (a specific configuration) from the cart
  const removeFromCart = useCallback((itemId: string) => {
    setCartItems(currentItems => {
      // Filter out the item that matches the given itemId
      return currentItems.filter(item => item.itemId !== itemId);
    });
  }, []); // No external dependencies needed for this callback


  // Update the quantity of a specific unique item instance in the cart
  const updateQuantity = useCallback((itemId: string, newQuantity: number) => {
      setCartItems(currentItems => {
          const itemIndex = currentItems.findIndex(item => item.itemId === itemId);

          // If the item is not found, return the current items unchanged
          if (itemIndex === -1) {
              console.warn(`Attempted to update quantity for non-existent item: ${itemId}`);
              return currentItems;
          }

          const itemToUpdate = currentItems[itemIndex];

          // If the new quantity is 0 or less, remove the item entirely
          if (newQuantity <= 0) {
              return currentItems.filter(item => item.itemId !== itemId);
          } else {
              // Update the quantity
              const updatedQuantity = newQuantity;

              // Adjust the size of the selectedExtras array to match the new quantity
              const updatedSelectedExtras = [...itemToUpdate.selectedExtras];
              if (updatedQuantity > itemToUpdate.quantity) {
                  // If quantity increased, add empty arrays for the new units
                  for (let i = itemToUpdate.quantity; i < updatedQuantity; i++) {
                      updatedSelectedExtras.push([]);
                  }
              } else if (updatedQuantity < itemToUpdate.quantity) {
                  // If quantity decreased, remove the excess extra arrays
                  updatedSelectedExtras.splice(updatedQuantity);
              }

              // Return a new array with the updated item
              return currentItems.map((item, index) => {
                  if (index === itemIndex) {
                      return {
                          ...item,
                          quantity: updatedQuantity,
                          selectedExtras: updatedSelectedExtras, // Use the adjusted extras array
                      };
                  }
                  return item;
              });
          }
      });
  }, []); // No external dependencies needed for this callback


  // Update the extra selection for a specific quantity instance of a unique item
  const updateExtraSelection = useCallback((itemId: string, quantityIndex: number, extra: Extra) => {
      setCartItems(currentItems => {
          const itemIndex = currentItems.findIndex(item => item.itemId === itemId);

          // If the item is not found, return current items unchanged
          if (itemIndex === -1) {
              console.warn(`Attempted to update extra for non-existent item: ${itemId}`);
              return currentItems;
          }

          const itemToUpdate = currentItems[itemIndex];

          // Validate the quantityIndex
          if (quantityIndex < 0 || quantityIndex >= itemToUpdate.quantity) {
              console.error(`Invalid quantityIndex ${quantityIndex} for item ${itemId} with quantity ${itemToUpdate.quantity}`);
              return currentItems; // Invalid index
          }

          // Get the current selected extras for the specific quantity instance
          const currentSelectedExtrasForThisQuantity = itemToUpdate.selectedExtras[quantityIndex] || [];
          // Check if the extra is already selected for this quantity instance
          const extraIndex = currentSelectedExtrasForThisQuantity.findIndex(e => e?._id === extra._id);

          let newSelectedExtrasForThisQuantity;
          if (extraIndex === -1) {
              // If the extra is not selected, add it to the list for this quantity instance
              // Ensure no null/undefined extras are accidentally added
              if (extra && extra._id) {
                 newSelectedExtrasForThisQuantity = [...currentSelectedExtrasForThisQuantity, extra];
              } else {
                 console.warn("Attempted to add null/undefined extra:", extra);
                 return currentItems; // Prevent adding invalid extra
              }

          } else {
              // If the extra is already selected, remove it from the list for this quantity instance
              newSelectedExtrasForThisQuantity = currentSelectedExtrasForThisQuantity.filter(e => e?._id !== extra._id);
          }

          // Create a new selectedExtras array for the item, updating the array for the specific quantity index
          const newSelectedExtras = [...itemToUpdate.selectedExtras];
          newSelectedExtras[quantityIndex] = newSelectedExtrasForThisQuantity;

          // Update the item in the cart
          return currentItems.map((item, index) => {
              if (index === itemIndex) {
                  return {
                      ...item,
                      selectedExtras: newSelectedExtras,
                  };
              }
              return item;
          });
      });
  }, []); // No external dependencies needed for this callback


  // Clear all items from the cart
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []); // No external dependencies needed for this callback


  // Get the total number of individual units across all items in the cart
  const getTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]); // Dependency array: run whenever cartItems changes


  // Calculate the total monetary value of the cart
  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => {
      // Calculate the price per unit including the base price and selected choice option prices
      const pricePerUnitIncludingChoices = item.basePrice + (item.selectedChoices?.reduce((sum, choiceGroup) =>
          sum + choiceGroup.selectedOptions.reduce((optSum, option) => optSum + (option.price || 0), 0)
      , 0) || 0);

      // Calculate the total extra price for ALL quantities of this item instance
      // item.selectedExtras is an array where each element is the list of extras for one unit
      const extrasTotal = item.selectedExtras.reduce((sum, extrasForOneQuantity) =>
         sum + (extrasForOneQuantity?.reduce((acc, extra) => acc + (extra?.price || 0), 0) || 0) // Sum prices of extras for a single quantity
      , 0); // Sum the results across all quantities


      // The total for this *line item* is (Base Price + Choices Price Per Unit) * Quantity + Total Extras (summed across all quantities)
      const itemLineTotal = (pricePerUnitIncludingChoices * item.quantity) + extrasTotal;

      // Add this line item total to the overall cart total
      return total + itemLineTotal;
    }, 0);
  }, [cartItems]); // Dependency array: run whenever cartItems changes


  // Memoize the context value to prevent unnecessary re-renders
  const contextValue: ShoppingCartContextType = useMemo(() => ({
      isCartOpen,
      cartItems,
      openCart,
      closeCart,
      toggleCart, // <--- Include the toggle function here
      addToCart,
      removeFromCart,
      updateQuantity,
      updateExtraSelection,
      clearCart,
      getTotalItems,
      getCartTotal,
      getItemQuantity,
  }), [
      cartItems,
      isCartOpen,
      openCart,
      closeCart,
      toggleCart, // <--- Include toggleCart in dependencies
      addToCart,
      removeFromCart,
      updateQuantity,
      updateExtraSelection,
      clearCart,
      getTotalItems,
      getCartTotal,
      getItemQuantity,
  ]); // Dependency array includes all values used in the memoized object

  // Provide the context value to the children components
  return (
    <ShoppingCartContext.Provider value={contextValue}>
      {children}
    </ShoppingCartContext.Provider>
  );
}

// Custom hook to easily access the shopping cart context
export function useShoppingCart() {
  const context = useContext(ShoppingCartContext);
  // Throw an error if the hook is used outside of a ShoppingCartProvider
  if (context === undefined) {
    throw new Error('useShoppingCart must be used within a ShoppingCartProvider');
  }
  return context;
}