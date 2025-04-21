import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'meal',
  title: 'Meal',
  type: 'document',
  icon: () => '🍔',
  fields: [
    defineField({
      name: 'name',
      title: 'Meal Name',
      type: 'string',
      validation: (Rule: { required: () => any; }) => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text'
    }),
    defineField({
      name: 'sizes',
      title: 'Size Variations',
      type: 'array',
      of: [{ type: 'sizeOption' }],
      validation: (Rule: { required: () => { (): any; new(): any; min: { (arg0: number): any; new(): any } } }) => Rule.required().min(1),
      description: 'One or more size/price pairs for this meal'
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true }
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (Rule: { required: () => any }) => Rule.required()
    }),
    defineField({
      name: 'isAvailable',
      title: 'Is Available',
      type: 'boolean',
      initialValue: true
    }),
    defineField({
      name: 'extras',
      title: 'Available Extras',
      type: 'array',
      of: [{
        type: 'reference',
        to: [{ type: 'extra' }],
        options: { filter: 'isAvailable == true' }
      }]
    }),
    defineField({
      name: 'choices',
      title: 'Choice Groups',
      type: 'array',
      of: [{
        type: 'reference',
        to: [{ type: 'choice' }],
        options: { filter: 'isRequired == true' }
      }],
      description: 'Mandatory selections for this meal'
    }),
    defineField({
      name: 'notes',
      title: 'Notes',
      type: 'text',
      description: 'Optional notes or comments for kitchen or display'
    })
  ]
})