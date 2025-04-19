import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'order',
  title: 'Order',
  type: 'document',
  fields: [
    defineField({
      name: 'orderNumber',
      title: 'Order Number',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'customer',
      title: 'Customer Information',
      type: 'object',
      fields: [
        defineField({
          name: 'name',
          title: 'Full Name',
          type: 'string',
        }),
        defineField({
          name: 'phone',
          title: 'Phone Number',
          type: 'string',
          validation: (Rule) => Rule.required()
        }),
        defineField({
          name: 'email',
          title: 'Email',
          type: 'string'
        }),
        defineField({
          name: 'whatsapp',
          title: 'WhatsApp Number',
          type: 'string',
        })
      ]
    }),
    defineField({
      name: 'items',
      title: 'Order Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'product',
              title: 'Product',
              type: 'reference',
              to: [{ type: 'meal' }, { type: 'combo' }],
              validation: (Rule) => Rule.required()
            }),
            defineField({
              name: 'quantity',
              title: 'Quantity',
              type: 'number',
              initialValue: 1,
              validation: (Rule) => Rule.required().min(1)
            }),
            defineField({
              name: 'priceAtPurchase',
              title: 'Price at Purchase',
              type: 'number',
              description: 'Price at time of ordering',
              validation: (Rule) => Rule.required().positive()
            }),
            defineField({
              name: 'nameAtPurchase',
              title: 'Name at Purchase',
              type: 'string',
              description: 'Name of the product at the time of ordering',
              readOnly: true,
            }),
            defineField({
              name: 'selectedExtras',
              title: 'Selected Extras',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'extra',
                      title: 'Extra Item',
                      type: 'reference',
                      to: [{ type: 'extra' }]
                    }),
                    defineField({
                      name: 'name',
                      title: 'Name',
                      type: 'string',
                      readOnly: true
                    }),
                    defineField({
                      name: 'price',
                      title: 'Price',
                      type: 'number',
                      readOnly: true
                    }),
                    defineField({
                      name: 'quantityIndex',
                      title: 'For Quantity #',
                      type: 'number',
                      description: 'Which quantity this extra applies to (1st, 2nd, etc.)',
                      initialValue: 0
                    })
                  ]
                }
              ]
            }),
            defineField({
              name: 'image',
              title: 'Product Image',
              type: 'image',
              options: {
                hotspot: true
              }
            })
          ]
        }
      ],
      validation: (Rule) => Rule.required().min(1)
    }),
    defineField({
      name: 'status',
      title: 'Order Status',
      type: 'string',
      options: {
        list: [
          {title: 'Received', value: 'received'},
          {title: 'Preparing', value: 'preparing'},
          {title: 'Ready for Pickup', value: 'ready'},
          {title: 'Completed', value: 'completed'},
          {title: 'Cancelled', value: 'cancelled'}
        ]
      },
      initialValue: 'received',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'paymentMethod',
      title: 'Payment Method',
      type: 'string',
      options: {
        list: [
          {title: 'eWallet', value: 'ewallet'},
          {title: 'MoMo', value: 'momo'},
          {title: 'Cash on Collection', value: 'cash'}
        ],
        layout: 'radio'
      },
      initialValue: 'cash',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'paymentStatus',
      title: 'Payment Status',
      type: 'string',
      options: {
        list: [
          {title: 'Pending', value: 'pending'},
          {title: 'Paid', value: 'paid'},
          {title: 'Refunded', value: 'refunded'}
        ]
      },
      initialValue: 'pending',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'totalAmount',
      title: 'Total Amount',
      type: 'number',
      validation: (Rule) => Rule.required().positive()
    }),
    defineField({
      name: 'notes',
      title: 'Special Instructions',
      type: 'text'
    }),
    defineField({
      name: 'orderDate',
      title: 'Order Date & Time',
      type: 'datetime',
      initialValue: (new Date()).toISOString(),
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'estimatedReady',
      title: 'Estimated Ready Time',
      type: 'datetime'
    }),
    defineField({
      name: 'paymentProof',
      title: 'Payment Proof',
      type: 'image',
      options: {
        hotspot: true
      }
    })
  ],
  initialValue: {
    orderDate: (new Date()).toISOString()
  },
  preview: {
    select: {
      customer: 'customer.name',
      items: 'items.length',
      total: 'totalAmount',
      status: 'status',
      payment: 'paymentMethod',
      orderNumber: 'orderNumber',
    },
    prepare(selection) {
      const { customer, items, total, status, payment, orderNumber } = selection
      const paymentMethods = {
        ewallet: 'eWallet',
        momo: 'MoMo',
        cash: 'Cash on Collection'
      }
      return {
        title: `${customer}'s Order (${orderNumber})`,
        subtitle: `${items} item(s) • R${total} • ${status} • ${paymentMethods[payment as keyof typeof paymentMethods] || payment}`
      }
    }
  }
})