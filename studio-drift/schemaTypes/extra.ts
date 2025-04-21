import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'extra',
  title: 'Extra',
  type: 'document',
  icon: () => '➕',
  fields: [
    defineField({
      name: 'name',
      title: 'Extra Name',
      type: 'string',
      validation: (Rule: { required: () => any }) => Rule.required()
    }),
    defineField({
      name: 'price',
      title: 'Additional Price',
      type: 'number',
      validation: (Rule: { required: () => { (): any; new(): any; min: { (arg0: number): any; new(): any } } }) => Rule.required().min(0)
    }),
    defineField({
      name: 'isAvailable',
      title: 'Is Available',
      type: 'boolean',
      initialValue: true
    }),
    defineField({
      name: 'notes',
      title: 'Notes',
      type: 'text',
      description: 'Optional notes for this extra'
    })
  ]
})