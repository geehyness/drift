'use client';

import Image from 'next/image';
import { useShoppingCart } from '@/context/ShoppingCartContext';
import { urlFor } from '@/lib/sanity';
import styles from './MealCard.module.css';
import { useState, useMemo, useEffect } from 'react';
import { Category, Meal } from '@/types/meal';

const generateCartItemId = (mealId: string, sizeKey?: string) => {
  return sizeKey ? `${mealId}_size-${sizeKey}` : mealId;
};

export default function MealCard({ meal }: { meal: Meal }) {
  const { addToCart } = useShoppingCart();
  const [showModal, setShowModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState(meal.sizes?.[0] || null);
  const [isAdding, setIsAdding] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showModal]);

  const hasSingleOption = meal.sizes?.length === 1;
  const needsCustomization = meal.sizes && meal.sizes.length > 1;

  const priceDisplay = useMemo(() => {
    if (meal.sizes?.length) {
      if (hasSingleOption) return `R${meal.sizes[0].price.toFixed(2)}`;
      const minPrice = Math.min(...meal.sizes.map(s => s.price));
      return `From R${minPrice.toFixed(2)}`;
    }
    return meal.price ? `R${meal.price.toFixed(2)}` : '';
  }, [meal.sizes, meal.price, hasSingleOption]);

  const handleAddToCart = async (size = selectedSize) => {
    setIsAdding(true);
    try {
      await addToCart({
        itemId: generateCartItemId(meal._id, size?._key),
        mealId: meal._id,
        name: size ? `${meal.name} (${size.label})` : meal.name,
        basePrice: size?.price || meal.price || 0,
        //quantity: 1,
        //selectedExtras: [[]],
        image: meal.image,
        selectedSize: size ? {
          label: size.label,
          price: size.price,
          _key: size._key
        } : undefined,
        availableExtras: meal.extras || [] 
      });
      setShowModal(false);
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuickAdd = () => {
    if (hasSingleOption && meal.sizes) {
      handleAddToCart(meal.sizes[0]);
    } else {
      handleAddToCart();
    }
  };

  const getCategoryTitle = (category: any) => {
    if (category?._ref) {
      // If it's a reference, return the title from expanded category
      return (category as Category).title;
    }
    return category?.title || '';
  };

  return (
    <>
      <article className={styles.card}>
        <div className={styles.imageContainer}>
          {meal.image?.asset?._ref && (
            <Image
              src={urlFor(meal.image).width(400).url()}
              alt={meal.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={styles.image}
              priority={false}
            />
          )}
          {meal.category ? (
            <div className={styles.categoryBadge}>
              {getCategoryTitle(meal.category)}
            </div>
          ) : null}

        </div>

        <div className={styles.content}>
          <h3 className={styles.title}>{meal.name}</h3>
          {meal.description && (
            <p className={styles.description}>{meal.description}</p>
          )}
          <div className={styles.price}>{priceDisplay}</div>

          <div className={styles.actions}>
            {needsCustomization ? (
              <button
                className={styles.customizeButton}
                onClick={() => setShowModal(true)}
              >
                Choose Options
              </button>
            ) : (
              <button
                className={styles.addButton}
                onClick={handleQuickAdd}
                disabled={isAdding}
              >
                {isAdding ? 'Adding...' : 'Add to Cart'}
              </button>
            )}
          </div>
        </div>
      </article>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>{meal.name}</h3>
            <div className={styles.sizeOptions}>
              {meal.sizes?.map(size => (
                <button
                  key={size._key}
                  className={`${styles.sizeButton} ${
                    selectedSize?._key === size._key ? styles.selected : ''
                  }`}
                  onClick={() => setSelectedSize(size)}
                >
                  <span>{size.label}</span>
                  <span>R{size.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
            <button
              className={styles.addButton}
              onClick={() => handleAddToCart()}
              disabled={isAdding}
            >
              {isAdding ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}