// src/app/contact/page.tsx
import styles from './contact.module.css';
import type { Metadata } from 'next'; // Import Metadata type

// Add metadata for the contact page
export const metadata: Metadata = {
  title: "Contact Us - Drift",
  description: 'Get in touch with Drift Spaza Studio.',
};

export default function ContactPage() {
  // IMPORTANT: Replace 'your-email@example.com' with your actual email address
  const formSubmitEndpoint = "https://formsubmit.co/godlinessdongorere@gmail.com";

  return (
      <div className={`${styles.container} ${styles.contactPage}`}>
        <h1>Contact Us</h1>
        <p className={styles.introText}>
          Have a question, feedback, or a special request? We&apos;d love to hear from you!
          Fill out the form below, and we&apos;ll get back to you as soon as possible.
        </p>

        <form
          action={formSubmitEndpoint}
          method="POST"
          className={styles.contactForm}
        >
          {/* --- FormSubmit Hidden Inputs for Configuration (Optional but Recommended) --- */}

          {/* 1. Subject Line for Emails Received */}
          <input type="hidden" name="_subject" value="New Drift Contact Form Submission!" />

          {/* 2. Redirect URL after successful submission (Create a simple /thank-you page) */}
          {/* <input type="hidden" name="_next" value="https://yourdomain.co/thank-you" /> */}
           <input type="hidden" name="_next" value={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/contact?submitted=true`} />


          {/* 3. Disable Captcha (FormSubmit uses email confirmation/reCAPTCHA by default) */}
          {/* <input type="hidden" name="_captcha" value="false" /> */}

           {/* 4. Use table template for email body */}
           <input type="hidden" name="_template" value="table" />

          {/* --- Actual Form Fields --- */}

          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>Your Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Your Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="subject" className={styles.label}>Subject:</label>
            <input
              type="text"
              id="subject"
              name="subject"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="message" className={styles.label}>Message:</label>
            <textarea
              id="message"
              name="message"
              rows={6}
              className={styles.textarea}
              required
            ></textarea>
          </div>

          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.button}>
              Send Message
            </button>
          </div>

          {/* Consider adding a message if form was submitted */}
          {/* This requires reading URL params, potentially making this a Client Component */}
          {/* Example (requires 'use client' and 'useSearchParams' hook): */}
          {/* {searchParams.get('submitted') === 'true' && <p className={styles.successMessage}>Thank you for your message!</p>} */}

        </form>
      </div>
  );
}