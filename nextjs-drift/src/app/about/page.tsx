// src/app/about/page.tsx
'use client'; // Required for useState and useEffect

import { useState, useEffect } from 'react';
import { client } from '@/lib/sanity'; // Assuming your client setup is here
import styles from './about.module.css';
import Image from 'next/image'; // Import next/image

// Define a TypeScript interface for the fetched data structure
interface AboutPageData {
  _id: string;
  title: string;
  introduction: string;
  mainImage?: { // Make image optional
    asset?: {
      url: string;
    };
    alt?: string; // Include alt text if defined in schema
  };
  ourMissionTitle?: string;
  ourMission: string;
  foodPhilosophyTitle?: string;
  foodPhilosophy?: string;
  communityProjectTitle?: string;
  communityProject: string;
  founderStoryTitle?: string;
  founderStory?: string;
  callToAction?: string;
}

export default function AboutPage() {
  // State for data, loading, and errors
  const [aboutData, setAboutData] = useState<AboutPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Define the GROQ query to fetch the first document of type 'aboutPage'
    // Fetch all fields (...), and specifically expand the image asset URL and alt text
    const query = `*[_type == "about"][0]{
        ...,
        mainImage {
          alt,
          asset->{
            url
          }
        }
      }`;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const data = await client.fetch<AboutPageData>(query);
        setAboutData(data);
      } catch (err) {
        console.error("Failed to fetch About page data:", err);
        setError("Failed to load content. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []); // Empty dependency array means fetch only once on mount

  // --- Render Loading State ---
  if (loading) {
    return (
      <div className={styles.loadingContainer}> {/* Use consistent loading styles */}
        <div className={styles.spinner}></div>
        <p>Loading About Us...</p>
      </div>
    );
  }

  // --- Render Error State ---
  if (error) {
    return <div className={styles.errorContainer}>{error}</div>; // Use consistent error styles
  }

  // --- Render Not Found State ---
  if (!aboutData) {
    return <div className={styles.notFound}>About page content not found.</div>;
  }

  // --- Render Content ---
  return (
    <div className={`${styles.container} ${styles.aboutPage}`}> {/* Add specific class */}
      <h1>{aboutData.title}</h1>

      {/* Optional Main Image */}
      {aboutData.mainImage?.asset?.url && (
        <div className={styles.mainImageContainer}>
          <Image
            src={aboutData.mainImage.asset.url}
            alt={aboutData.mainImage.alt || aboutData.title} // Use alt text or fallback to title
            fill // Use fill layout for responsiveness
            style={{ objectFit: 'cover' }} // Control how image covers the container
            priority // Prioritize loading if above the fold
          />
        </div>
      )}

      <p className={styles.introduction}>{aboutData.introduction}</p>

      {/* Mission Section */}
      <section className={styles.section}>
        {aboutData.ourMissionTitle && <h2>{aboutData.ourMissionTitle}</h2>}
        <p>{aboutData.ourMission}</p>
      </section>

      {/* Food Philosophy Section */}
      {aboutData.foodPhilosophy && ( // Conditionally render if field has content
        <section className={styles.section}>
          {aboutData.foodPhilosophyTitle && <h2>{aboutData.foodPhilosophyTitle}</h2>}
          <p>{aboutData.foodPhilosophy}</p>
        </section>
      )}

      {/* Community Project Section */}
      <section className={styles.section}>
        {aboutData.communityProjectTitle && <h2>{aboutData.communityProjectTitle}</h2>}
        <p>{aboutData.communityProject}</p>
      </section>

       {/* Founder Story Section */}
       {aboutData.founderStory && ( // Conditionally render if field has content
        <section className={styles.section}>
          {aboutData.founderStoryTitle && <h2>{aboutData.founderStoryTitle}</h2>}
          <p>{aboutData.founderStory}</p>
        </section>
      )}

      {/* Call to Action */}
      {aboutData.callToAction && (
          <p className={styles.callToAction}>{aboutData.callToAction}</p>
      )}

    </div>
  );
}