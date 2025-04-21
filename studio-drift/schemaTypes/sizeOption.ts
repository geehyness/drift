import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'sizeOption',
  title: 'Size Option',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Size Label',
      type: 'string',
      description: 'e.g. Small, Medium, Large',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: Rule => Rule.required().positive()
    })
  ]
})