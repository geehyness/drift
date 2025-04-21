'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useShoppingCart } from '@/context/ShoppingCartContext';
import styles from './Header.module.css';

const NAV_ITEMS = [
  { path: '/', name: 'Home' },
  { path: '/menu', name: 'Menu' },
  { path: '/about', name: 'About' },
  { path: '/contact', name: 'Contact' },
  { path: '/orders/search', name: 'Track Order' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Destructure necessary state and functions from context
  const { getTotalItems, toggleCart, closeCart, isCartOpen } = useShoppingCart();

  // Add client-side state for the item count displayed in the header
  // Initialize to 0, consistent with server render before localStorage is read
  const [clientItemCount, setClientItemCount] = useState(0);

  // Ref for the mobile menu to detect clicks outside
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Use useEffect to update the clientItemCount state after the component mounts
  // This runs only on the client and reflects the actual cart content from localStorage.
  useEffect(() => {
    // This will cause a re-render after hydration if the localStorage cart is not empty
    setClientItemCount(getTotalItems());
  }, [getTotalItems]); // Depend on getTotalItems to update the count if the cart changes


  const closeAll = () => {
    closeCart();
    setIsMenuOpen(false);
  };

  const handleToggleCart = () => {
    toggleCart();
    setIsMenuOpen(false); // Close mobile menu when cart is opened
  };

  // Close menu when clicking outside or pressing escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Use mobileMenuRef to check if the click is outside the mobile menu div
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    // Add event listeners only when the mobile menu is open
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    // Clean up event listeners when the mobile menu is closed or component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]); // Dependency array: only re-run effect when isMenuOpen changes


  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          {/* Link logo to homepage, close all menus/cart on click */}
          <Link href="/" onClick={closeAll}>
            <div className={styles.logoCard}>
              {/* Ensure your logo image exists at the path /images/logo.png */}
              <Image
                src="/images/vercel.png" // Replace with the actual path to your logo
                alt="Drift Logo"
                width={130} // Adjust width/height as needed
                height={130} // Adjust width/height as needed
                className={styles.logoImage} // Optional class for styling
                priority // Give logo high loading priority
              />
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.path} className={styles.navItem}>
                {/* Link for navigation, close all menus/cart on click */}
                <Link
                  href={item.path}
                  className={styles.navLink}
                  onClick={closeAll}
                >
                  {item.name}
                </Link>
              </li>
            ))}
            {/* Desktop Cart Button */}
            <li className={`${styles.navItem} ${styles.cartItem}`}> {/* Added cartItem class for potential specific styling */}
              <button
                className={styles.cartButton}
                onClick={handleToggleCart} // Toggle cart overlay
                // Use clientItemCount for aria-label - will be 0 on server, updated on client
                aria-label={`Cart (${clientItemCount} items)`}
                aria-expanded={isCartOpen} // Use isCartOpen state from context
              >
                🛒 {
                  // Conditionally render span based on clientItemCount
                  // No suppressHydrationWarning needed here anymore
                  // because its content is consistent with the state derived client-side after mount.
                  clientItemCount > 0 && <span>{clientItemCount}</span>
                }
              </button>
            </li>
          </ul>
        </nav>

        {/* Mobile Navigation */}
        <div className={styles.mobileNav} ref={mobileMenuRef}> {/* Attach ref to the mobile nav container */}
          {/* Mobile Menu Toggle Button */}
          <button
            className={`${styles.menuButton} ${isMenuOpen ? styles.open : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)} // Toggle mobile menu state
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen} // Use isMenuOpen state
          >
            {/* Hamburger icon (styled in CSS) */}
            <span className={styles.hamburger}></span>
          </button>

          {/* Mobile Menu Container (styled to slide in/out) */}
          <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}>
            <ul className={styles.navList}>
              {NAV_ITEMS.map((item) => (
                <li key={item.path} className={styles.navItem}>
                  {/* Link for navigation, close all menus/cart on click */}
                  <Link
                    href={item.path}
                    className={styles.navLink}
                    onClick={closeAll}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              {/* Mobile Cart Button */}
              <li className={styles.navItem}> {/* Keeping class name consistent */}
                <button
                  className={styles.cartButton}
                  onClick={handleToggleCart} // Toggle cart overlay
                  // Use clientItemCount for aria-label
                   aria-label={`Cart (${clientItemCount} items)`}
                >
                  {/* Display icon and count based on clientItemCount */}
                   🛒 Cart ({clientItemCount})
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}