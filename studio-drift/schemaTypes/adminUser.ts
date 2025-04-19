import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'adminUser',
  title: 'Admin Users',
  type: 'document',
  icon: () => '🔒',
  fields: [
    defineField({
      name: 'username',
      title: 'Username',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'passwordHash',
      title: 'Password Hash',
      type: 'string',
      readOnly: true,
      hidden: true
    }),
    defineField({
      name: 'salt',
      title: 'Salt',
      type: 'string',
      readOnly: true,
      hidden: true
    })
  ]
})