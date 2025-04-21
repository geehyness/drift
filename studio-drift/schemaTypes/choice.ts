import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'choice',
  title: 'Choice Group',
  type: 'document',
  icon: () => '✅',
  fields: [
    defineField({
      name: 'name',
      title: 'Choice Group Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'e.g., "Base Selection" or "Toppings"'
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Optional helper text for users'
    }),
    defineField({
      name: 'isRequired',
      title: 'Mandatory Selection?',
      type: 'boolean',
      initialValue: true,
      description: 'Force users to make this selection'
    }),
    defineField({
      name: 'maxOptions',
      title: 'Maximum Choices',
      type: 'number',
      initialValue: 1,
      validation: (Rule) => Rule.min(1).integer(),
      description: 'How many options can be selected?'
    }),
    defineField({
      name: 'options',
      title: 'Available Options',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({
            name: 'name',
            title: 'Option Name',
            type: 'string',
            validation: (Rule) => Rule.required()
          }),
          defineField({
            name: 'price',
            title: 'Price Adjustment',
            type: 'number',
            initialValue: 0,
            description: 'Extra cost for this option'
          })
        ]
      }],
      validation: (Rule) => Rule.required().min(1)
    })
  ]
})