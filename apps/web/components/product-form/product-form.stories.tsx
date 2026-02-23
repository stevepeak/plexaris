import { type Meta, type StoryObj } from '@storybook/react'

import { ProductForm } from './product-form'

const meta: Meta<typeof ProductForm> = {
  title: 'Product / ProductForm',
  component: ProductForm,
  decorators: [
    (story) => <div className="mx-auto max-w-4xl p-4">{story()}</div>,
  ],
}
export default meta
type Story = StoryObj<typeof ProductForm>

export const AddProduct: Story = {
  args: {
    onSubmit: async () => ({}),
    onCancel: () => undefined,
  },
}

export const EditProduct: Story = {
  args: {
    product: {
      id: '1',
      name: 'Sourdough Bread',
      description: null,
      price: null,
      unit: null,
      category: 'Bread',
      status: 'active',
    },
    onSubmit: async () => ({}),
    onCancel: () => undefined,
  },
}

export const EditWithFullData: Story = {
  args: {
    product: {
      id: '2',
      name: 'Organic Orange Juice',
      description: null,
      price: null,
      unit: null,
      category: 'Beverages',
      status: 'active',
      data: {
        sections: {
          general: true,
          photos: true,
          unit: true,
          case: true,
          pallet: true,
          ingredients: true,
          nutrition: true,
          allergens: true,
          dietary: true,
          storage: true,
          pricing: true,
          label: false,
        },
        general: {
          brand: 'BioFresh',
          variant: 'Original',
          description: 'Premium cold-pressed orange juice',
          articleNumber: 'BF-OJ-001',
          intrastatCode: '20091100',
          countryOfOrigin: 'NL',
        },
        photos: {
          images: [],
        },
        unit: {
          gtin: '8712345678901',
          dimensions: { height: 250, width: 80, depth: 80 },
          weight: { gross: 1050, net: 1000 },
          netContent: { milliliters: 1000 },
          packagingType: 'pet_bottle',
        },
        case: {
          gtin: '8712345678918',
          dimensions: { height: 260, width: 330, depth: 250 },
          weight: { gross: 6500, net: 6000 },
          unitsPerCase: 6,
          packagingType: 'tray',
        },
        pallet: {
          palletType: 'euro',
          load: {
            layersPerPallet: 5,
            casesPerLayer: 8,
            casesPerPallet: 40,
          },
          dimensions: {
            heightWithProduct: 120,
            heightWithoutProduct: 15,
            width: 80,
            depth: 120,
          },
          weight: { gross: 280, net: 240 },
        },
        ingredients: {
          ingredients: 'Orange juice (100%), from concentrate.',
          warningStatements: 'Shake well before use.',
        },
        nutrition: {
          energyKj: 188,
          energyKcal: 45,
          fatG: 0.1,
          saturatedFatG: 0,
          carbohydratesG: 10.4,
          sugarsG: 8.4,
          proteinG: 0.7,
          saltG: 0,
          fiberG: 0.2,
        },
        allergens: {
          allergens: {
            milk: 'absent',
            gluten: 'absent',
            nuts: 'absent',
            soy: 'absent',
          },
        },
        dietary: {
          kosher: true,
          halal: true,
          vegetarian: true,
          vegan: true,
        },
        storage: {
          temperatureRange: { min: 2, max: 7 },
          storageType: 'chilled',
          shelfLifeFromProductionDays: 90,
          shelfLifeFromDeliveryDays: 30,
        },
        pricing: {
          currency: 'EUR',
          exWorksPerUnit: 2.1,
          deliveredPerUnit: 2.5,
        },
      },
    },
    onSubmit: async () => ({}),
    onCancel: () => undefined,
  },
}

export const EditWithPartialData: Story = {
  args: {
    product: {
      id: '3',
      name: 'Croissant',
      description: null,
      price: null,
      unit: null,
      category: 'Pastry',
      status: 'active',
      data: {
        sections: {
          general: true,
          nutrition: true,
          allergens: true,
        },
        general: {
          brand: 'Bakkerij van Dam',
          variant: 'Butter',
        },
        nutrition: {
          energyKcal: 406,
          fatG: 21,
          carbohydratesG: 45,
          proteinG: 8,
        },
        allergens: {
          allergens: {
            gluten: 'contains',
            milk: 'contains',
            eggs: 'contains',
          },
        },
      },
    },
    onSubmit: async () => ({}),
    onCancel: () => undefined,
  },
}

export const EditMinimalProduct: Story = {
  args: {
    product: {
      id: '4',
      name: 'Seasonal Special',
      description: null,
      price: null,
      unit: null,
      category: null,
      status: 'draft',
    },
    onSubmit: async () => ({}),
    onCancel: () => undefined,
  },
}

export const Loading: Story = {
  args: {
    isPending: true,
  },
}

export const WithError: Story = {
  args: {
    onSubmit: async () => ({ error: 'Failed to create product' }),
    onCancel: () => undefined,
  },
}

export const NoCancel: Story = {
  args: {
    onSubmit: async () => ({}),
  },
}
