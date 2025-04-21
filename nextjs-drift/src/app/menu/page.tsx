'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { client } from '@/lib/sanity';
import styles from './page.module.css';
import MealCard from '@/components/MealCard';
import { Meal, Category } from '@/types/meal';
import { useSearchParams, useRouter } from 'next/navigation';

interface CategoryWithCount extends Category {
  mealCount: number;
}

export default function MenuPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentCategorySlug = useMemo(() => searchParams.get('category'), [searchParams]);

  const [allMeals, setAllMeals] = useState<Meal[]>([]);
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data once on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [categoriesData, mealsData] = await Promise.all([
          client.fetch<CategoryWithCount[]>(`
            *[_type == "category"] | order(title asc) {
              _id,
              _type,
              title,
              slug { current },
              "mealCount": count(*[_type == "meal" && references(^._id) && isAvailable == true])
            }
          `),
          client.fetch<Meal[]>(`
            *[_type == "meal" && isAvailable == true] {
              _id,
              _type,
              name,
              description,
              price,
              isAvailable,
              featured,
              "category": category->{
                _id,
                _type,
                title,
                slug { current }
              },
              image {
                asset-> {
                  _id,
                  _type,
                  url
                }
              },
              extras[]-> {
                _id,
                _type,
                name,
                price,
                isAvailable
              },
              sizes[] {
                _key,
                label,
                price
              },
              choices[]-> {
                _id,
                _type,
                name,
                description,
                isRequired,
                maxOptions,
                options[] {
                  _key,
                  name,
                  price
                }
              }
            }
          `)
        ]);

        setCategories(categoriesData.filter(c => c.slug?.current));
        setAllMeals(mealsData.filter(m => m._id));

      } catch (err) {
        console.error("Error fetching data:", err);
        setError('Failed to load menu. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Memoized filtered meals
  const filteredMeals = useMemo(() => {
    if (!currentCategorySlug) return allMeals;
    return allMeals.filter(meal => 
      meal.category?.slug?.current === currentCategorySlug
    );
  }, [allMeals, currentCategorySlug]);

  // Category click handler remains the same
  const handleCategoryClick = useCallback((slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    slug ? params.set('category', slug) : params.delete('category');
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  // Loading and error states remain the same
  // ...

  return (
    <main className={styles.menuPage}>
      {/* Header remains the same */}

      {/* Category Filter */}
      <section className={`container ${styles.categoryFilter}`}>
        {/* Mobile dropdown */}
        <select 
          className={styles.mobileCategorySelect}
          value={currentCategorySlug || ''}
          onChange={(e) => handleCategoryClick(e.target.value || null)}
        >
          <option value="">All Items ({allMeals.length})</option>
          {categories.map(category => (
            <option key={category._id} value={category.slug?.current}>
              {category.title} ({category.mealCount})
            </option>
          ))}
        </select>

        {/* Desktop tabs */}
        <div className={styles.filterButtons}>
          <button
            onClick={() => handleCategoryClick(null)}
            className={!currentCategorySlug ? styles.active : ''}
          >
            All Items ({allMeals.length})
          </button>
          {categories.map(category => (
            category.slug?.current && (
              <button
                key={category._id}
                onClick={() => handleCategoryClick(category.slug.current)}
                className={currentCategorySlug === category.slug.current ? styles.active : ''}
              >
                {category.title} 
                <span className={styles.categoryCount}>{category.mealCount}</span>
              </button>
            )
          ))}
        </div>
      </section>

      {/* Menu Items */}
      <section className={`container ${styles.menuItems}`}>
        {filteredMeals.length > 0 ? (
          <div className={styles.mealsGrid}>
            {filteredMeals.map(meal => (
              <MealCard key={meal._id} meal={meal} />
            ))}
          </div>
        ) : (
          <div className={styles.noItems}>
            <p>No meals available in this category</p>
            {currentCategorySlug && (
              <button
                onClick={() => handleCategoryClick(null)}
                className={styles.viewAllButton}
              >
                View All Items
              </button>
            )}
          </div>
        )}
      </section>
    </main>
  );
}