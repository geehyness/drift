// app/(site)/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { client } from '@/lib/sanity';
import styles from './page.module.css';
import MealCard from '@/components/MealCard';
import { Meal, Category } from '@/types/meal';
import Link from 'next/link';

interface CategoryWithCount extends Category {
  mealCount: number;
}

export default function HomePage() {
  const [featuredMeals, setFeaturedMeals] = useState<Meal[]>([]);
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const featuredMealsQuery = `*[_type == "meal" && isAvailable == true][0...6] {
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
            _type,
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
        }`;

        const categoriesQuery = `*[_type == "category" && popular == true] | order(title asc) {
          _id,
          _type,
          title,
          slug { current },
          "mealCount": count(*[_type == "meal" && references(^._id) && isAvailable == true])
        }`;

        const [mealsData, categoriesData] = await Promise.all([
          client.fetch<Meal[]>(featuredMealsQuery),
          client.fetch<CategoryWithCount[]>(categoriesQuery)
        ]);

        const validMeals = (mealsData || []).filter(meal => 
          meal && meal._id && typeof meal.name === 'string'
        );
        const validCategories = (categoriesData || []).filter(category => 
          category && category._id && category.slug?.current
        );

        setFeaturedMeals(validMeals);
        setCategories(validCategories);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>Loading...</p>
    </div>
  );

  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <main className={styles.homePage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
          <h1>Welcome to Drift</h1>
          <p>Delicious meals made with love</p>
          <Link href="/menu" className={styles.ctaButton}>
            View Full Menu
          </Link>
        </div>
      </section>

      {/* Popular Categories */}
      <section className={`container ${styles.section}`}>
        <h2>Popular Categories</h2>
        <div className={styles.categoryGrid}>
          {categories.map(category => (
            <Link
              key={category._id}
              href={`/menu?category=${category.slug.current}`}
              className={styles.categoryCard}
            >
              <div className={styles.categoryContent}>
                <h3>{category.title}</h3>
                <p className={styles.mealCount}>{category.mealCount} items</p>
              </div>
              <div className={styles.categoryHover}></div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Meals */}
      <section className={`container ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <h2>Featured Dishes</h2>
          <Link href="/menu" className={styles.viewAll}>
            View All Menu Items →
          </Link>
        </div>
        <div className={styles.mealsGrid}>
          {featuredMeals.length > 0 ? (
            featuredMeals.map(meal => (
              meal && meal._id ? (
                <MealCard key={meal._id} meal={meal} />
              ) : null
            ))
          ) : (
            <p className={styles.noItems}>No featured meals available</p>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className={`container ${styles.ctaSection}`}>
        <h2>Ready to order?</h2>
        <Link href="/menu" className={styles.ctaButton}>
          Browse Full Menu
        </Link>
      </section>
    </main>
  );
}