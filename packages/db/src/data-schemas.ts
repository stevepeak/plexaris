import { z } from 'zod'

// ─── Shared / Reusable Schemas ─────────────────────────────────────────────

/** Contact person with name, communication details, and optional role */
const contactPersonSchema = z.object({
  name: z.string().min(1).describe('Full name of the contact person'),
  email: z.string().email().describe('Email address'),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-().]+$/)
    .optional()
    .describe('Landline phone number'),
  mobile: z
    .string()
    .regex(/^\+?[\d\s\-().]+$/)
    .optional()
    .describe('Mobile phone number'),
  fax: z
    .string()
    .regex(/^\+?[\d\s\-().]+$/)
    .optional()
    .describe('Fax number'),
  role: z
    .string()
    .optional()
    .describe("Job title or function (e.g. 'Chef', 'Manager')"),
})

/** Physical address */
const addressSchema = z.object({
  street: z.string().min(1).describe('Street name and house number'),
  postalCode: z.string().min(1).describe("Postal / ZIP code (e.g. '2718 RJ')"),
  city: z.string().min(1).describe('City or place name'),
  country: z
    .string()
    .min(1)
    .default('NL')
    .describe('ISO 3166-1 alpha-2 country code'),
})

/** 3D dimensions in a given unit */
const dimensionsSchema = (unit: string) =>
  z.object({
    height: z.number().positive().describe(`Height in ${unit}`),
    width: z.number().positive().describe(`Width in ${unit}`),
    depth: z.number().positive().describe(`Depth in ${unit}`),
  })

/** Gross / net weight pair in a given unit */
const weightSchema = (unit: string) =>
  z.object({
    gross: z.number().nonnegative().describe(`Gross weight in ${unit}`),
    net: z.number().nonnegative().describe(`Net weight in ${unit}`),
  })

/** GTIN / EAN barcode — 8, 12, 13, or 14 digits */
const gtinSchema = z
  .string()
  .regex(/^\d{8}$|^\d{12,14}$/)
  .describe('GTIN / EAN barcode (8, 12, 13, or 14 digits)')

/** HH:MM time string */
const timeSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/)
  .describe('Time in HH:MM format')

/** A single time window (from–to) */
const timeWindowSchema = z.object({
  from: timeSchema,
  to: timeSchema,
})

/** Numeric range with min and max */
const rangeSchema = (unit: string) =>
  z.object({
    min: z.number().describe(`Minimum value in ${unit}`),
    max: z.number().describe(`Maximum value in ${unit}`),
  })

// EU allergen list per Regulation (EU) No 1169/2011
const allergenEnum = z.enum([
  'milk',
  'fish',
  'crustaceans',
  'gluten',
  'eggs',
  'peanuts',
  'nuts',
  'sesame',
  'soy',
  'celery',
  'mustard',
  'sulfites',
  'lupin',
  'molluscs',
])

/** Allergen presence: contains, may_contain, or absent */
const allergenStatusEnum = z.enum(['contains', 'may_contain', 'absent'])

const dayOfWeekEnum = z.enum([
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
])

// ─── Horeca (Restaurant / HoReCa Establishment) ────────────────────────────

/** Delivery location for a HoReCa customer */
const horecaDeliveryInfoSchema = z.object({
  storeNumber: z
    .string()
    .min(1)
    .describe('Unique store/location identifier (storenummer)'),
  locationName: z
    .string()
    .min(1)
    .describe('Location display name (locatienaam)'),
  address: addressSchema.describe('Delivery address'),
  remarks: z
    .string()
    .optional()
    .describe('Free-text delivery remarks (opmerkingen)'),
})

/** Administrative / billing details */
const horecaAdministrationSchema = z.object({
  tradeName: z
    .string()
    .min(1)
    .describe('Official trade name as registered at KvK (handelsnaam)'),
  invoiceAddress: addressSchema.describe(
    'Billing / invoice address (factuuradres)',
  ),
  financeContact: contactPersonSchema.describe(
    'Primary contact for finance / accounts payable',
  ),
  vatNumber: z
    .string()
    .regex(/^NL\d{9}B\d{2}$/)
    .describe('Dutch BTW / VAT number (e.g. NL123456789B01)'),
  cocNumber: z
    .string()
    .regex(/^\d{8}$/)
    .describe('KvK (Chamber of Commerce) registration number — 8 digits'),
  iban: z
    .string()
    .regex(/^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/)
    .describe('IBAN bank account number'),
  remarks: z.string().optional().describe('Administrative remarks'),
})

/** Ordering contact and first delivery date */
const horecaOrderInfoSchema = z.object({
  firstDeliveryDate: z
    .string()
    .date()
    .describe('Requested date of first delivery (YYYY-MM-DD)'),
  contact: contactPersonSchema.describe('Contact person for orders'),
  remarks: z.string().optional().describe('Order-related remarks'),
})

/** Vehicle size / weight restrictions at the delivery location */
const vehicleRestrictionsSchema = z.object({
  maxHeightMm: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Maximum vehicle height in millimeters'),
  maxLengthMm: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Maximum vehicle length in millimeters'),
  maxWeightKg: z
    .number()
    .positive()
    .optional()
    .describe('Maximum vehicle weight in kilograms'),
})

/** Delivery constraints at the location */
const deliveryRestrictionsSchema = z.object({
  windowTimes: z
    .array(timeWindowSchema)
    .optional()
    .describe('Permitted delivery time windows (venstertijden)'),
  environmentalZone: z
    .boolean()
    .default(false)
    .describe(
      'Whether the location is inside an environmental / low-emission zone (milieuzone)',
    ),
})

/** Opening hours for a single day — up to two shifts */
const dailyHoursSchema = z.object({
  day: dayOfWeekEnum,
  shifts: z
    .array(timeWindowSchema)
    .min(1)
    .max(2)
    .describe('One or two open/available shifts per day'),
})

const horecaDeliverySchema = z.object({
  vehicleRestrictions: vehicleRestrictionsSchema.optional(),
  deliveryRestrictions: deliveryRestrictionsSchema.optional(),
  openingHours: z
    .array(dailyHoursSchema)
    .max(7)
    .describe('Opening / presence hours per day of the week'),
  remarks: z.string().optional().describe('General delivery remarks'),
})

export const horecaSchema = z
  .object({
    delivery: horecaDeliveryInfoSchema.describe(
      'Klantgegevens — delivery location info',
    ),
    administration: horecaAdministrationSchema.describe(
      'Administratiegegevens — billing and legal details',
    ),
    contacts: z
      .array(contactPersonSchema)
      .min(1)
      .max(10)
      .describe('Contact persons at this location'),
    orderInfo: horecaOrderInfoSchema.describe(
      'Bestelgegevens — ordering details',
    ),
    deliveryConfig: horecaDeliverySchema.describe(
      'Levering — vehicle restrictions, time windows, and opening hours',
    ),
  })
  .describe('HoReCa establishment (restaurant, hotel, café) as a customer')

// ─── Product ────────────────────────────────────────────────────────────────

const unitPackagingTypeEnum = z.enum([
  'bottle_glass',
  'pet_bottle',
  'bag',
  'bucket',
])
const casePackagingTypeEnum = z.enum(['tray', 'box', 'bucket'])
const palletTypeEnum = z.enum(['euro', 'chep'])

/** Net content expressed in volume and/or weight */
const netContentSchema = z
  .object({
    milliliters: z
      .number()
      .nonnegative()
      .optional()
      .describe('Net content in milliliters'),
    grams: z.number().nonnegative().optional().describe('Net content in grams'),
  })
  .refine((v) => v.milliliters !== undefined || v.grams !== undefined, {
    message: 'At least one of milliliters or grams must be provided',
  })

/** Individual sellable unit (stuk) */
const productUnitSchema = z.object({
  gtin: gtinSchema.describe('GTIN / EAN code of the base unit (stuk)'),
  dimensions: dimensionsSchema('mm').describe('Unit outer dimensions in mm'),
  weight: weightSchema('grams').describe('Unit weight in grams'),
  netContent: netContentSchema.describe('Net content of the unit'),
  packagingType: unitPackagingTypeEnum.describe(
    'Packaging type of the individual unit',
  ),
  packshots: z
    .array(z.string().url())
    .optional()
    .describe('URLs to product packshot images'),
})

/** Case / tray / box containing multiple units */
const productCaseSchema = z.object({
  gtin: gtinSchema.describe('GTIN / EAN code of the case or tray'),
  dimensions: dimensionsSchema('mm').describe('Case outer dimensions in mm'),
  weight: weightSchema('grams').describe('Case weight in grams'),
  unitsPerCase: z
    .number()
    .int()
    .positive()
    .describe('Number of individual units per case/tray'),
  netContent: netContentSchema.describe('Total net content of the case'),
  packagingType: casePackagingTypeEnum.describe('Case packaging type'),
})

/** Pallet configuration for logistics */
const productPalletSchema = z.object({
  gtin: gtinSchema
    .optional()
    .describe('GTIN / EAN code of the pallet (if assigned)'),
  palletType: palletTypeEnum.describe('Pallet standard (EURO or CHEP)'),
  load: z.object({
    layersPerPallet: z
      .number()
      .int()
      .positive()
      .describe('Number of layers on the pallet'),
    casesPerLayer: z
      .number()
      .int()
      .positive()
      .describe('Cases/trays per layer'),
    casesPerPallet: z
      .number()
      .int()
      .positive()
      .describe('Total cases per full pallet'),
  }),
  dimensions: z
    .object({
      heightWithProduct: z
        .number()
        .positive()
        .describe('Pallet height including product in cm'),
      heightWithoutProduct: z
        .number()
        .positive()
        .describe('Pallet height excluding product (wood only) in cm'),
      width: z.number().positive().describe('Pallet width in cm'),
      depth: z.number().positive().describe('Pallet depth in cm'),
    })
    .describe('Pallet dimensions in centimeters'),
  weight: weightSchema('kg').describe('Pallet weight in kilograms'),
})

/** Macronutrient values per 100g or 100ml */
const nutritionSchema = z.object({
  energyKj: z
    .number()
    .nonnegative()
    .describe('Energy in kilojoules per 100g/ml'),
  energyKcal: z
    .number()
    .nonnegative()
    .describe('Energy in kilocalories per 100g/ml'),
  fatG: z.number().nonnegative().describe('Total fat in grams per 100g/ml'),
  saturatedFatG: z
    .number()
    .nonnegative()
    .describe('Saturated fat in grams per 100g/ml'),
  carbohydratesG: z
    .number()
    .nonnegative()
    .describe('Carbohydrates in grams per 100g/ml'),
  sugarsG: z
    .number()
    .nonnegative()
    .describe('Of which sugars in grams per 100g/ml'),
  proteinG: z.number().nonnegative().describe('Protein in grams per 100g/ml'),
  saltG: z.number().nonnegative().describe('Salt in grams per 100g/ml'),
  fiberG: z
    .number()
    .nonnegative()
    .optional()
    .describe('Dietary fiber (vezels) in grams per 100g/ml'),
  others: z
    .array(
      z.object({
        name: z.string().min(1).describe('Nutrient name'),
        valueG: z.number().nonnegative().describe('Value in grams per 100g/ml'),
      }),
    )
    .optional()
    .describe('Additional nutrients not covered above'),
})

/** Product information: ingredients, nutrition, and allergens */
const productInfoSchema = z.object({
  ingredients: z
    .string()
    .min(1)
    .describe('Full ingredient list as shown on label'),
  nutrition: nutritionSchema.describe('Nutritional values per 100g or 100ml'),
  allergens: z
    .string()
    .optional()
    .describe('Free-text allergen information statement'),
})

export const productSchema = z
  .object({
    brand: z.string().min(1).describe('Product brand name'),
    variant: z.string().min(1).describe('Product variant or flavour'),
    intrastatCode: z
      .string()
      .regex(/^\d{8}$/)
      .describe('8-digit Intrastat / CN commodity code'),
    articleNumber: z.string().min(1).describe('Distributor article number'),
    countryOfOrigin: z
      .string()
      .length(2)
      .describe('ISO 3166-1 alpha-2 country of origin'),
    description: z.string().min(1).describe('Product description'),
    unit: productUnitSchema.describe('Individual sellable unit'),
    case: productCaseSchema.describe('Case / tray / box packaging'),
    pallet: productPalletSchema.describe('Pallet logistics configuration'),
    productInfo: productInfoSchema.describe(
      'Ingredients, nutrition, and allergen info',
    ),
  })
  .describe('A product in the supply chain (food/beverage item)')

// ─── Supplier ───────────────────────────────────────────────────────────────

const storageTypeEnum = z.enum(['ambient', 'chilled', 'frozen'])
const currencyEnum = z
  .string()
  .length(3)
  .regex(/^[A-Z]{3}$/)
  .describe('ISO 4217 currency code (e.g. EUR, USD)')

/** Pricing: per-kg and/or per-unit, at two Incoterms levels */
const pricingSchema = z.object({
  exWorksPerKg: z
    .number()
    .nonnegative()
    .optional()
    .describe('Ex Works price per kilogram'),
  exWorksPerUnit: z
    .number()
    .nonnegative()
    .optional()
    .describe('Ex Works price per unit of measure'),
  deliveredPerKg: z
    .number()
    .nonnegative()
    .optional()
    .describe('Delivered-free price per kilogram'),
  deliveredPerUnit: z
    .number()
    .nonnegative()
    .optional()
    .describe('Delivered-free price per unit of measure'),
})

/** Sheet 1: Delivery specification for a single product from a supplier */
const deliverySpecSchema = z.object({
  productName: z
    .string()
    .min(1)
    .describe('Product name as known by the supplier'),
  itemNumberSupplier: z
    .string()
    .min(1)
    .describe("Supplier's internal item/article number"),
  eanCodeCase: gtinSchema.describe('EAN barcode of the case/outer'),
  tariffNumber: z
    .string()
    .regex(/^\d{6,10}$/)
    .describe('Customs / HS tariff number (6–10 digits)'),
  countryOfOrigin: z
    .string()
    .length(2)
    .describe('ISO 3166-1 alpha-2 country code'),
  supplierName: z.string().min(1).describe('Supplier company name'),
  contact: z.string().min(1).describe('Contact person name'),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-().]+$/)
    .describe('Contact phone number'),

  // Unit of measure details
  unitOfMeasure: z.object({
    type: z
      .string()
      .min(1)
      .describe(
        "Unit of measure shipped to restaurants (e.g. 'cases', 'buckets')",
      ),
    dimensions: dimensionsSchema('mm').describe(
      'Outer dimensions of one unit of measure (L x W x H)',
    ),
    netWeightKg: z
      .number()
      .positive()
      .describe('Net weight per unit of measure in kg'),
    grossWeightKg: z
      .number()
      .positive()
      .describe('Gross weight per unit of measure in kg'),
    innerPackagesPerUnit: z
      .number()
      .int()
      .nonnegative()
      .describe('Number of inner packages per unit of measure (e.g. 5 bags)'),
    contentPerInnerPackage: z
      .string()
      .min(1)
      .describe("Content per inner package (e.g. '200 pieces/bag')"),
    piecesPerUnit: z
      .number()
      .int()
      .positive()
      .describe('Total pieces per unit of measure'),
    tolerance: rangeSchema('pieces')
      .optional()
      .describe('Acceptable piece-count tolerance range per unit'),
    minOrderQuantity: z
      .number()
      .int()
      .positive()
      .describe('Minimum order quantity in units of measure'),
    leadtimeDays: z
      .number()
      .int()
      .nonnegative()
      .describe('Lead time in days from order at DC'),
    currency: currencyEnum,
    pricing: pricingSchema.describe('Pricing at Ex Works and Delivered levels'),
  }),

  // Pallet configuration
  pallet: z.object({
    usesChep: z.boolean().describe('Whether CHEP pallets are used'),
    dimensions: z
      .object({
        lengthMm: z.number().positive().describe('Pallet length in mm'),
        widthMm: z.number().positive().describe('Pallet width in mm'),
        heightMm: z
          .number()
          .positive()
          .describe('Pallet height including wood in mm'),
      })
      .describe('Pallet dimensions'),
    unitsPerPallet: z
      .number()
      .int()
      .positive()
      .describe('Units of measure per Euro pallet'),
    boxesPerLayer: z
      .number()
      .int()
      .positive()
      .describe('Boxes/cases per pallet layer'),
    layersPerPallet: z
      .number()
      .int()
      .positive()
      .describe('Layers per Euro pallet'),
  }),

  // Storage requirements
  storage: z.object({
    temperatureRange: rangeSchema('°C').describe(
      'Recommended storage temperature range in degrees Celsius',
    ),
    storageType: storageTypeEnum.describe(
      'Storage condition: ambient, chilled, or frozen',
    ),
    minShelfLifeFromProductionDays: z
      .number()
      .int()
      .positive()
      .describe('Minimum shelf life from production date in days'),
    minShelfLifeFromDeliveryDays: z
      .number()
      .int()
      .positive()
      .describe('Minimum remaining shelf life upon delivery at DC in days'),
  }),

  // Validity period
  validity: z.object({
    specValidFrom: z
      .string()
      .date()
      .describe('Date this specification becomes valid (YYYY-MM-DD)'),
    priceValidFrom: z
      .string()
      .date()
      .describe('Start date of price validity (YYYY-MM-DD)'),
    priceValidTo: z
      .string()
      .date()
      .describe('End date of price validity (YYYY-MM-DD)'),
  }),
})

/** Sheet 2: Supplier company information */
const supplierInfoSchema = z.object({
  headquarters: z
    .object({
      company: z.string().min(1).describe('Legal company name'),
      address: addressSchema,
      phone: z
        .string()
        .regex(/^\+?[\d\s\-().]+$/)
        .describe('Phone number'),
      fax: z
        .string()
        .regex(/^\+?[\d\s\-().]+$/)
        .optional()
        .describe('Fax number'),
      glnNumber: z
        .string()
        .regex(/^\d{13}$/)
        .optional()
        .describe('GLN / ILN number (13 digits)'),
      vatNumber: z.string().min(1).describe('VAT identification number'),
    })
    .describe('Company headquarters address'),

  stockLocation: z
    .object({
      address: addressSchema,
      phone: z
        .string()
        .regex(/^\+?[\d\s\-().]+$/)
        .describe('Phone number'),
      fax: z
        .string()
        .regex(/^\+?[\d\s\-().]+$/)
        .optional()
        .describe('Fax number'),
      businessHours: z
        .string()
        .optional()
        .describe(
          "Business hours description (e.g. 'Mo-Fr 08:00-17:00, Sa 08:00-12:00')",
        ),
    })
    .describe('Ex Works / stock warehouse location'),

  contacts: z.object({
    emergencyPhone: z
      .string()
      .regex(/^\+?[\d\s\-().]+$/)
      .describe('24-hour emergency contact phone number'),
    keyAccountManager: contactPersonSchema.describe('Key Account Manager'),
    customerService: contactPersonSchema.describe('Customer Service contact'),
    qualityAssurance: contactPersonSchema.describe('Quality Assurance contact'),
    ordering: contactPersonSchema.describe('Ordering department contact'),
    logistics: contactPersonSchema.describe('Logistics contact'),
    stock: contactPersonSchema.describe('Stock / warehouse contact'),
  }),

  banking: z.object({
    bankName: z.string().min(1).describe('Name of the bank'),
    bankAddress: z.string().min(1).describe('Bank branch address'),
    accountNumber: z.string().min(1).describe('Bank account number'),
    iban: z
      .string()
      .regex(/^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/)
      .describe('IBAN code'),
    bic: z
      .string()
      .regex(/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/)
      .describe('BIC / SWIFT code'),
    contactName: z.string().optional().describe('Bank contact person name'),
    phone: z
      .string()
      .regex(/^\+?[\d\s\-().]+$/)
      .optional()
      .describe('Bank contact phone'),
    fax: z
      .string()
      .regex(/^\+?[\d\s\-().]+$/)
      .optional()
      .describe('Bank contact fax'),
  }),
})

/** Sheet 3: Distribution centers and central ordering office */
const distributionSchema = z.object({
  centralOffice: z.object({
    invoiceAddress: z.string().min(1).describe('Invoice address for orders'),
    contact: z.string().min(1).describe('Contact person name'),
    phone: z
      .string()
      .regex(/^\+?[\d\s\-().]+$/)
      .describe('Phone number'),
    fax: z
      .string()
      .regex(/^\+?[\d\s\-().]+$/)
      .optional()
      .describe('Fax number'),
    email: z.string().email().describe('Email address'),
  }),
  distributionCenters: z
    .array(
      z.object({
        name: z.string().min(1).describe('DC identifier or name'),
        address: addressSchema.optional().describe('DC address'),
      }),
    )
    .describe('List of distribution centers'),
})

/** Sheet 4: Food / allergen information per product */
const foodInfoSchema = z.object({
  productNumber: z.string().min(1).describe('Product number'),
  productName: z.string().min(1).describe('Product name'),
  ingredientsOnLabel: z
    .string()
    .min(1)
    .describe('Ingredients as indicated on the label'),
  warningStatements: z
    .string()
    .optional()
    .describe('Warning statements on label'),
  origin: z.string().optional().describe('Product origin'),
  palmOil: z
    .object({
      origin: z.string().optional().describe('Origin of palm oil'),
      amountPercent: z
        .number()
        .min(0)
        .max(100)
        .optional()
        .describe('Palm oil percentage of total product'),
      rspoCertificate: z
        .string()
        .optional()
        .describe('RSPO certificate reference'),
    })
    .optional()
    .describe('Palm oil details (origin, amount, RSPO certification)'),

  // EU 14 allergens — each marked as contains / may_contain / absent
  allergens: z
    .record(allergenEnum, allergenStatusEnum)
    .describe("EU-14 allergen status: 'contains', 'may_contain', or 'absent'"),

  nutrition: nutritionSchema.describe('Nutritional values per 100g'),

  dietarySuitability: z
    .object({
      kosher: z.boolean().describe('Suitable for Kosher diets'),
      halal: z.boolean().describe('Suitable for Halal diets'),
      vegetarian: z.boolean().describe('Suitable for vegetarians (Ovo-Lacto)'),
      vegan: z.boolean().describe('Suitable for vegans'),
    })
    .describe('Dietary suitability flags'),
})

/** Sheet 6: Label copy */
const labelCopySchema = z.object({
  labelImageUrl: z
    .string()
    .url()
    .optional()
    .describe('URL or path to a copy of the product label'),
  cartonPrint: z
    .string()
    .optional()
    .describe('Text/info printed on the outer carton'),
})

export const supplierSchema = z
  .object({
    deliverySpecs: z
      .array(deliverySpecSchema)
      .min(1)
      .describe('Delivery specifications — one per product supplied'),
    info: supplierInfoSchema.describe(
      'Supplier company information (headquarters, contacts, banking)',
    ),
    distribution: distributionSchema.describe(
      'Central ordering office and distribution center details',
    ),
    foodInfo: z
      .array(foodInfoSchema)
      .describe('Food safety and allergen data — one entry per product'),
    labelCopies: z
      .array(labelCopySchema)
      .optional()
      .describe('Label copies for supplied products'),
  })
  .describe(
    'Supplier — a company that provides products to the distribution network',
  )

// ─── Scrape Issues ─────────────────────────────────────────────────────────

export const scrapeIssueSchema = z.object({
  source: z.string().describe('URL or filename where the issue occurred'),
  field: z.string().describe('Schema field path (e.g. "unit.gtin")'),
  rawValue: z.unknown().describe('The value that failed validation'),
  error: z.string().describe('Human-readable reason'),
  timestamp: z.string().datetime().describe('When the issue was recorded'),
})

// ─── Combined Data Schemas (entity + scrape issues) ────────────────────────

export const horecaDataSchema = z.object({
  ...horecaSchema.shape,
  scrapeIssues: z.array(scrapeIssueSchema).default([]),
})

export const supplierDataSchema = z.object({
  ...supplierSchema.shape,
  scrapeIssues: z.array(scrapeIssueSchema).default([]),
})

export const productDataSchema = z.object({
  ...productSchema.shape,
  scrapeIssues: z.array(scrapeIssueSchema).default([]),
})

// ─── Type Exports ───────────────────────────────────────────────────────────

export type Horeca = z.infer<typeof horecaSchema>
export type Product = z.infer<typeof productSchema>
export type Supplier = z.infer<typeof supplierSchema>
export type ScrapeIssue = z.infer<typeof scrapeIssueSchema>
export type HorecaData = z.infer<typeof horecaDataSchema>
export type ProductData = z.infer<typeof productDataSchema>
export type SupplierData = z.infer<typeof supplierDataSchema>
