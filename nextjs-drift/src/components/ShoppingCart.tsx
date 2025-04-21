'use client';

import { useState, ChangeEvent, useEffect, useCallback, useMemo, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from 'react';
import { useShoppingCart } from '@/context/ShoppingCartContext';
import styles from './ShoppingCart.module.css';
import Image from 'next/image';
import { urlFor } from '@/lib/sanity'; // Assuming urlFor is correctly set up
import { CartItem, Extra } from '@/types/meal'; // Import types

export default function ShoppingCart() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    updateExtraSelection,
    clearCart,
    getTotalItems,
    getCartTotal,
    closeCart,
    isCartOpen,
  } = useShoppingCart();

  // Log cart items with details for debugging
  // console.log('Current Cart Items:', cartItems.map(item => ({
  //   itemId: item.itemId,
  //   mealId: item.mealId,
  //   name: item.name,
  //   quantity: item.quantity,
  //   basePrice: item.basePrice,
  //   selectedSize: item.selectedSize,
  //   selectedChoices: item.selectedChoices,
  //   availableExtrasCount: item.availableExtras?.length || 0,
  //   selectedExtrasCountPerQuantity: item.selectedExtras.map(extras => extras.length),
  //   selectedExtras: item.selectedExtras,
  // })));


  // Checkout state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [checkoutError, setCheckoutError] = useState('');
  const [customerPhoneNumber, setCustomerPhoneNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isContactCollapsed, setIsContactCollapsed] = useState(true);

  // Effect to prevent body scrolling when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Cleanup function to reset overflow when component unmounts or isCartOpen changes
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isCartOpen]);

  // Calculate the total price for a single line item in the cart
  // This includes base price, choice option prices, and extra prices (per quantity instance)
  const calculateItemTotal = useCallback((item: CartItem) => {
    // Base price comes from the selected size or the single item price saved on the CartItem
    const basePrice = item.basePrice;
    const quantity = item.quantity;

    // Calculate total price from selected choices for one unit of this item configuration
    const choicesPricePerUnit = item.selectedChoices?.reduce((sum, choiceGroup) =>
        sum + choiceGroup.selectedOptions.reduce((optSum, option) => optSum + (option.price || 0), 0)
    , 0) || 0;

    // Calculate total price from selected extras for ALL quantities of this item instance
    // item.selectedExtras is an array where each element corresponds to one unit (quantity)
    const extrasTotal = item.selectedExtras.reduce((sum, extrasForOneQuantity) =>
         sum + (extrasForOneQuantity?.reduce((acc, extra) => acc + (extra?.price || 0), 0) || 0) // Sum prices of extras for a single quantity
    , 0); // Sum the results across all quantities


    // The total for this *line item* in the cart is (Base Price + Choices Price Per Unit) * Quantity + Total Extras (summed across all quantities)
    const priceIncludingChoicesPerUnit = basePrice + choicesPricePerUnit;

    return (priceIncludingChoicesPerUnit * quantity) + extrasTotal;

  }, []); // Dependencies for useCallback


  // Check if a specific extra is selected for a specific quantity instance of an item
  const isExtraSelected = useCallback((item: CartItem, quantityIndex: number, extra: Extra) => {
    // Ensure selectedExtras and the specific extrasArray exist before checking
    return item.selectedExtras[quantityIndex]?.some(e => e?._id === extra._id) || false;
  }, []); // Dependencies for useCallback

  // Payment method handler
  const handlePaymentMethodChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedPaymentMethod(event.target.value);
    setPaymentProof(null); // Clear proof if payment method changes
    setCheckoutError(''); // Clear checkout errors
  };

  // Payment proof handler
  const handlePaymentProofChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setPaymentProof(event.target.files[0]);
      setCheckoutError(''); // Clear checkout errors
    } else {
      setPaymentProof(null);
    }
  };

  // Phone number handler
  const handlePhoneNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    const valueWithoutSpaces = event.target.value.replace(/\s/g, ''); // Remove spaces
    setCustomerPhoneNumber(valueWithoutSpaces);
    setPhoneNumberError(''); // Clear phone number errors on change
  };

  // WhatsApp number handler
  const handleWhatsappNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    setWhatsappNumber(event.target.value);
  };

  // Name handler
  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCustomerName(event.target.value);
  };

  // Email handler
  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCustomerEmail(event.target.value);
  };

  // Phone validation (Swazi numbers starting with 76, 78, or 79 followed by 6 digits)
  const validateSwaziPhoneNumber = (number: string) => {
    const swaziRegex = /^(76|78|79)\d{6}$/;
    return swaziRegex.test(number);
  };

  // Toggle contact information section
  const toggleContactSection = () => {
    setIsContactCollapsed(!isContactCollapsed);
  };

  // Handle the checkout process
  const handleCheckout = async () => {
    // Basic validation checks
    if (cartItems.length === 0) {
      setCheckoutError('Your cart is empty.');
      return;
    }

    if (!selectedPaymentMethod) {
      setCheckoutError('Please select a payment method.');
      return;
    }

    if (['eWallet', 'MoMo'].includes(selectedPaymentMethod) && !paymentProof) {
      setCheckoutError('Please upload proof of payment.');
      return;
    }

    // Phone number validation
    if (!customerPhoneNumber) {
      setPhoneNumberError('Please enter your phone number.');
      return;
    }
    if (!validateSwaziPhoneNumber(customerPhoneNumber)) {
      setPhoneNumberError('Please enter a valid 8-digit Swazi phone number starting with 76, 78, or 79.');
      return;
    }

    setIsSubmitting(true); // Indicate submission is in progress
    setCheckoutError(''); // Clear previous errors

    // Prepare data for the backend API
    const orderData = {
      cartItems: cartItems.map((item: { itemId: any; mealId: any; name: any; basePrice: any; quantity: any; selectedSize: any; selectedChoices: any; selectedExtras: any[][]; }) => ({
        // Include essential CartItem fields for the order
        itemId: item.itemId, // Unique item config ID
        mealId: item.mealId, // Original meal ID
        name: item.name, // Display name with config
        basePrice: item.basePrice, // Base price of the config
        quantity: item.quantity, // Quantity of this config
        selectedSize: item.selectedSize, // Selected size details
        selectedChoices: item.selectedChoices, // Selected choices details

        // Include selected extras, ensuring serializable format and filtering nulls
        selectedExtras: item.selectedExtras.map((extrasForOneQuantity: any[]) =>
          extrasForOneQuantity
            .filter(extra => extra !== null && extra !== undefined) // Filter out any null/undefined entries
            .map(extra => ({
              _id: extra._id,
              name: extra.name,
              price: extra.price
            }))
        )
      })),
      total: getCartTotal(), // Calculated total from context
      paymentMethod: selectedPaymentMethod,
      customerPhoneNumber,
      whatsappNumber: whatsappNumber || undefined, // Use undefined if empty
      customerName: customerName || undefined, // Use undefined if empty
      customerEmail: customerEmail || undefined, // Use undefined if empty
      orderDate: new Date().toISOString(), // Capture current time
    };

    const formData = new FormData();
    // Append the JSON order data
    formData.append('orderData', JSON.stringify(orderData));

    // Append the payment proof file if available
    if (paymentProof) {
      formData.append('paymentProof', paymentProof);
    }

    try {
      // Send the data to your backend API endpoint
      const response = await fetch('/api/checkout', {
        method: 'POST',
        body: formData, // Use FormData to send file and JSON
      });

      if (response.ok) {
        const data = await response.json();
        // Handle successful order placement
        alert(`Order placed successfully! Your Order Number is: ${data.orderNumber}`);
        clearCart(); // Clear the cart on success
        closeCart(); // Close the cart overlay
      } else {
        // Handle API errors
        const errorData = await response.json();
        setCheckoutError(errorData.error || 'Failed to place order. Please try again.');
        console.error("Checkout API error:", errorData);
      }
    } catch (error) {
      // Handle network or other unexpected errors
      setCheckoutError('Failed to connect to the server. Please try again later.');
      console.error("Checkout failed:", error);
    } finally {
      setIsSubmitting(false); // End submission state
    }
  };

  // If cart is not open, render nothing
  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay backdrop */}
      <div className={`${styles.overlayBackdrop} ${isCartOpen ? styles.open : ''}`} onClick={closeCart} aria-hidden="true" />

      {/* Shopping Cart Overlay */}
      <div className={`${styles.cartOverlay} ${isCartOpen ? styles.open : ''}`} role="dialog" aria-modal="true" aria-label="Shopping Cart">
        <div className={styles.cartContainer}>
          {/* Cart Header */}
          <div className={styles.cartHeader}>
            <h2>Your Order ({getTotalItems()})</h2>
            {/* Close button */}
            <button className={styles.closeButton} onClick={closeCart} aria-label="Close shopping cart">
              ×
            </button>
          </div>

          {/* Cart Items List or Empty Cart Message */}
          {cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <p>Your cart is empty</p>
              <button className={styles.continueShopping} onClick={closeCart}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {/* List of items in the cart */}
              <ul className={styles.cartItems}>
                {cartItems.map((item) => (
                  <li key={item.itemId} className={styles.cartItem}> {/* Use the unique itemId as the key */}
                    {/* Item Image */}
                    <div className={styles.itemImage}>
                      {/* Check if image asset reference exists before rendering Image */}
                      {item.image?.asset?._ref && (
                         <Image
                           src={urlFor(item.image).width(80).height(80).url()} // Use urlFor to get image URL
                           alt={item.name}
                           width={80}
                           height={80}
                           className={styles.cartImage}
                         />
                       )}
                    </div>

                    {/* Item Details */}
                    <div className={styles.itemDetails}>
                      <h3>{item.name}</h3> {/* Display the generated descriptive name */}
                      {/* Display base price (size price or single price) */}
                      <p className={styles.basePrice}>Base: R{item.basePrice?.toFixed(2) || '0.00'}</p>

                      {/* Display selected size and choices if they exist */}
                      {(item.selectedSize || (item.selectedChoices && item.selectedChoices.length > 0)) && (
                          <div className={styles.selectedConfig}>
                              {item.selectedSize && (
                                  <span><span className={styles.configTitle}>Size:</span> {item.selectedSize.label}</span>
                              )}
                              {/* Map over selected choices to display chosen options */}
                              {item.selectedChoices && item.selectedChoices.map((choiceGroup: { selectedOptions: { name: string; price: number | null | undefined; }[]; _ref: Key | null | undefined; choiceName: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | Iterable<ReactNode> | null | undefined; }) => (
                                  choiceGroup.selectedOptions.length > 0 && (
                                      <span key={choiceGroup._ref}> {/* Use choice group reference as key */}
                                          <span className={styles.configTitle}>{choiceGroup.choiceName}:</span>{' '}
                                          {/* Map over selected options within the group, display name and price if > 0 */}
                                          {choiceGroup.selectedOptions.map((opt: { name: string; price: number | null | undefined; }) => opt.name + (opt.price !== undefined && opt.price !== null && opt.price > 0 ? ` (+R${opt.price.toFixed(2)})` : '')).join(', ')}
                                      </span>
                                  )
                              ))}
                          </div>
                      )}


                      {/* Quantity Controls */}
                      <div className={styles.quantityControls}>
                        <button
                          onClick={() => updateQuantity(item.itemId, item.quantity - 1)} // Update quantity for the unique item
                          disabled={item.quantity <= 1} // Disable decrement button if quantity is 1
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <p>-</p>
                        </button>
                        <span>{item.quantity}</span> {/* Display current quantity */}
                        <button
                           onClick={() => updateQuantity(item.itemId, item.quantity + 1)} // Update quantity for the unique item
                           aria-label={`Increase quantity of ${item.name}`}
                        >
                          <p>+</p>
                        </button>
                      </div>

                      {/* Extras Selection Section (only if item has available extras) */}
                      {/* Check if item.availableExtras exists and has elements, filtering out any nulls */}
                      {item.availableExtras && item.availableExtras.filter((extra: null | undefined) => extra !== null && extra !== undefined).length > 0 && (
                         <div className={styles.extrasContainer} style={{ '--item-quantity': item.quantity } as React.CSSProperties}> {/* Pass quantity as CSS variable for grid */}
                           <h4 className={styles.extrasTitle}>Extras:</h4>
                           <div className={styles.extrasGrid}>
                             <div className={styles.extrasHeader}>
                               <span className={styles.extraNameHeader}>Extra</span>
                               {/* Render a column header for each quantity instance */}
                               {Array.from({ length: item.quantity }).map((_, idx) => (
                                 <span key={idx} className={styles.quantityHeader}>
                                   #{idx + 1}
                                 </span>
                               ))}
                             </div>

                             {/* Map over AVAILABLE extras to show selection options */}
                             {item.availableExtras.map((extra: Extra) => (
                               extra && extra._id ? ( // Add null/undefined check for extra existence and _id
                                 <div key={extra._id} className={styles.extraRow}>
                                   <span className={styles.extraName}>
                                     {extra.name} (+R{extra.price?.toFixed(2) || '0.00'}) {/* Display extra name and price */}
                                   </span>
                                   {/* Render a checkbox/indicator for each quantity instance of this extra */}
                                   {Array.from({ length: item.quantity }).map((_, idx) => (
                                     <div
                                       key={`${extra._id}-${idx}`} // Unique key for checkbox per extra and quantity
                                       className={`${styles.extraCheckbox} ${
                                         isExtraSelected(item, idx, extra) ? styles.selected : '' // Check if this extra is selected for this quantity
                                       }`}
                                       onClick={() => updateExtraSelection(item.itemId, idx, extra)} // Toggle selection for this extra at this quantity index
                                       aria-label={`${isExtraSelected(item, idx, extra) ? 'Deselect' : 'Select'} ${extra.name} for item unit ${idx + 1}`}
                                     >
                                       {isExtraSelected(item, idx, extra) ? '✓' : ''} {/* Display checkmark if selected */}
                                     </div>
                                   ))}
                                 </div>
                               ) : null // Skip rendering if extra is null/undefined
                             ))}
                           </div>
                         </div>
                       )}
                    </div>

                    {/* Item Total Price */}
                    <div className={styles.itemTotal}>
                      R{calculateItemTotal(item).toFixed(2)} {/* Display the total for this line item */}
                    </div>

                    {/* Remove Button */}
                    <button
                      className={styles.removeButton}
                      onClick={() => removeFromCart(item.itemId)} // Remove the unique item instance
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      × {/* Times symbol */}
                    </button>
                  </li>
                ))}
              </ul>

              {/* Cart Footer */}
              <div className={styles.cartFooter}>
                {/* Total Price */}
                <div className={styles.total}>
                  <span>Total:</span>
                  <span>R{getCartTotal().toFixed(2)}</span> {/* Display overall cart total */}
                </div>

                {/* Form Section: Phone Number */}
                <div className={styles.formSection}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="phoneNumber">Phone Number*</label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      value={customerPhoneNumber}
                      onChange={handlePhoneNumberChange}
                      placeholder="e.g., 76xxxxxx or 78xxxxxx"
                      required
                      pattern="^(76|78|79)\d{6}$" // HTML5 validation pattern (redundant with JS but good practice)
                      maxLength={8}
                    />
                    {/* Display phone number error message */}
                    {phoneNumberError && <p className={styles.error}>{phoneNumberError}</p>}
                  </div>
                </div>

                {/* Collapsible Additional Information Section */}
                <div className={`${styles.formSection} ${styles.collapsible} ${!isContactCollapsed ? styles.open : ''}`}>
                  {/* Section Header to toggle collapse */}
                  <div className={styles.sectionHeader} onClick={toggleContactSection} role="button" aria-expanded={!isContactCollapsed} aria-controls="additionalInfoSection">
                    <h3>Additional Information</h3>
                    {/* Chevron icon that rotates */}
                    <svg
                      className={`${styles.chevron} ${!isContactCollapsed ? styles.rotate : ''}`}
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                  {/* Section Content (hidden when collapsed) */}
                  <div id="additionalInfoSection" className={styles.sectionContent} aria-hidden={isContactCollapsed}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="name">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        value={customerName}
                        onChange={handleNameChange}
                        placeholder="Your full name"
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label htmlFor="whatsappNumber">WhatsApp Number</label>
                      <input
                        type="tel"
                        id="whatsappNumber"
                        value={whatsappNumber}
                        onChange={handleWhatsappNumberChange}
                        placeholder="If different from phone number"
                        maxLength={8}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        value={customerEmail}
                        onChange={handleEmailChange}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Section: Payment Method */}
                <div className={styles.formSection}>
                  <h3>Payment Method</h3>
                  <div className={styles.inputGroup}>
                    <select
                      value={selectedPaymentMethod}
                      onChange={handlePaymentMethodChange}
                      required
                    >
                      <option value="">Select Payment Method</option>
                      {/* Uncomment these options if you support eWallet/MoMo */}
                      {/* <option value="eWallet">eWallet</option>
                      <option value="MoMo">MoMo</option> */}
                      <option value="Cash on Collect">Cash on Collect</option>
                    </select>
                  </div>

                  {/* Payment Proof Upload (only shown for eWallet/MoMo) */}
                  {['eWallet', 'MoMo'].includes(selectedPaymentMethod) && (
                    <div className={styles.inputGroup}>
                      <label htmlFor="paymentProof" className={styles.fileInputLabel}>
                        Upload Proof of Payment
                        <input
                          type="file"
                          id="paymentProof"
                          className={styles.fileInput}
                          accept="image/*,application/pdf" // Accept images and PDFs
                          onChange={handlePaymentProofChange}
                        />
                      </label>
                      {/* Display the selected file name */}
                      {paymentProof && (
                        <p className={styles.fileName}>{paymentProof.name}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Display general checkout error message */}
                {checkoutError && (
                  <div className={styles.error} style={{ margin: '1rem 0' }}>
                    {checkoutError}
                  </div>
                )}

                {/* Action Buttons: Clear Cart and Place Order */}
                <div className={styles.actions}>
                  <button
                    onClick={clearCart}
                    className={styles.clearButton}
                    // Disable if cart is empty or submission is in progress
                    disabled={cartItems.length === 0 || isSubmitting}
                  >
                    Clear Cart
                  </button>
                  <button
                    onClick={handleCheckout}
                    className={styles.checkoutButton}
                    // Disable based on validation rules and submission state
                    disabled={
                        isSubmitting || // Submission in progress
                        cartItems.length === 0 || // Cart is empty
                        !selectedPaymentMethod || // No payment method selected
                        (['eWallet', 'MoMo'].includes(selectedPaymentMethod) && !paymentProof) || // Proof required but not uploaded
                        phoneNumberError !== '' || // Phone number has a validation error
                        customerPhoneNumber === '' // Phone number is empty
                    }
                  >
                    {isSubmitting ? 'Processing...' : 'Place Order'} {/* Button text changes during submission */}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}