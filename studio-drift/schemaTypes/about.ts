// schemaTypes/aboutPage.ts
import {defineField, defineType} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons' // Example Icon

export const about = defineType({
  name: 'about',
  title: 'About Page Content',
  type: 'document',
  icon: DocumentTextIcon, // Optional: Choose an icon for the Studio UI
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      description: 'The main title displayed on the About page (e.g., "About Drift Spaza Studio").',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'introduction',
      title: 'Introduction Paragraph',
      type: 'text', // Use text for longer paragraphs
      description: 'The opening welcome message or brief overview.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
        name: 'mainImage',
        title: 'Main Page Image',
        type: 'image',
        description: 'A prominent image for the About page.',
        options: {
          hotspot: true, // Enables hotspot positioning
        },
        fields: [
            defineField({ // Optional: Add alt text field directly to image
                name: 'alt',
                type: 'string',
                title: 'Alternative text',
                description: 'Important for SEO and accessibility.',
            })
        ]
      }),
    defineField({
      name: 'ourMissionTitle',
      title: 'Our Mission Section Title',
      type: 'string',
      description: 'Headline for the mission section (e.g., "More Than Just Meals").',
      initialValue: 'Our Mission',
    }),
    defineField({
      name: 'ourMission',
      title: 'Our Mission Description',
      type: 'text',
      description: 'Explain the core purpose combining the food service and community support.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'foodPhilosophyTitle',
      title: 'Food Philosophy Section Title',
      type: 'string',
      description: 'Headline for the section about the food itself (e.g., "Passion on a Plate").',
      initialValue: 'Our Food Philosophy',
    }),
    defineField({
      name: 'foodPhilosophy',
      title: 'Food Philosophy Description',
      type: 'text',
      description: 'Detail the approach to food - home-style, fresh, local ingredients, etc.',
    }),
    defineField({
      name: 'communityProjectTitle',
      title: 'Community Project Section Title',
      type: 'string',
      description: 'Headline for the knitting project section (e.g., "Knitting Hope, Stitch by Stitch").',
      initialValue: 'Our Community Project',
    }),
    defineField({
      name: 'communityProject',
      title: 'Community Project Description',
      type: 'text',
      description: 'Explain the details of the knitting initiative involving the elderly.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
        name: 'founderStoryTitle',
        title: 'Founder Story Section Title',
        type: 'string',
        description: 'Headline for the founder\'s story section (optional).',
        initialValue: 'Our Story',
      }),
      defineField({
        name: 'founderStory',
        title: 'Founder Story Description',
        type: 'text',
        description: 'A brief background or motivation behind starting Drift (optional).',
      }),
    defineField({
        name: 'callToAction',
        title: 'Concluding Call to Action',
        type: 'string',
        description: 'A final sentence inviting users to explore the menu or get in touch (optional).',
        initialValue: 'Explore our menu and taste the difference love makes!',
    }),
  ],
  // Optional: Customize the preview in Sanity Studio
  preview: {
    select: {
      title: 'title',
      media: 'mainImage',
    },
    prepare({title, media}) {
      return {
        title: title || 'About Page Content',
        subtitle: 'Edit the main content for the About page',
        media: media || DocumentTextIcon,
      }
    },
  },
})