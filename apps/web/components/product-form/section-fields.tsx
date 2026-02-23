import { AllergensFields } from './sections/allergens-fields'
import { DietaryFields } from './sections/dietary-fields'
import { GeneralFields } from './sections/general-fields'
import { IngredientsFields } from './sections/ingredients-fields'
import { LabelFields } from './sections/label-fields'
import { NutritionFields } from './sections/nutrition-fields'
import { PackagingFields } from './sections/packaging-fields'
import { PalletFields } from './sections/pallet-fields'
import { PhotosFields } from './sections/photos-fields'
import { PricingFields } from './sections/pricing-fields'
import { StorageFields } from './sections/storage-fields'
import { type SectionFieldsProps } from './types'

export function SectionFields({
  sectionKey,
  getFieldString,
  getFieldNumber,
  updateField,
  data,
  fc,
  onUndo,
}: SectionFieldsProps) {
  switch (sectionKey) {
    case 'general':
      return (
        <GeneralFields
          g={getFieldString}
          u={updateField}
          fc={fc}
          undo={onUndo}
        />
      )
    case 'photos':
      return <PhotosFields data={data} u={updateField} />
    case 'unit':
      return (
        <PackagingFields
          section="unit"
          g={getFieldString}
          gn={getFieldNumber}
          u={updateField}
          weightUnit="grams"
          dimUnit="mm"
          showUnitsPerCase={false}
          fc={fc}
          undo={onUndo}
        />
      )
    case 'case':
      return (
        <PackagingFields
          section="case"
          g={getFieldString}
          gn={getFieldNumber}
          u={updateField}
          weightUnit="grams"
          dimUnit="mm"
          showUnitsPerCase
          fc={fc}
          undo={onUndo}
        />
      )
    case 'pallet':
      return (
        <PalletFields
          gn={getFieldNumber}
          g={getFieldString}
          u={updateField}
          fc={fc}
          undo={onUndo}
        />
      )
    case 'ingredients':
      return (
        <IngredientsFields
          g={getFieldString}
          gn={getFieldNumber}
          u={updateField}
          fc={fc}
          undo={onUndo}
        />
      )
    case 'nutrition':
      return (
        <NutritionFields
          gn={getFieldNumber}
          u={updateField}
          fc={fc}
          undo={onUndo}
        />
      )
    case 'allergens':
      return (
        <AllergensFields data={data} u={updateField} fc={fc} undo={onUndo} />
      )
    case 'dietary':
      return <DietaryFields data={data} u={updateField} fc={fc} undo={onUndo} />
    case 'storage':
      return (
        <StorageFields
          g={getFieldString}
          gn={getFieldNumber}
          u={updateField}
          fc={fc}
          undo={onUndo}
        />
      )
    case 'pricing':
      return (
        <PricingFields
          gn={getFieldNumber}
          u={updateField}
          fc={fc}
          undo={onUndo}
        />
      )
    case 'label':
      return (
        <LabelFields
          g={getFieldString}
          u={updateField}
          data={data}
          fc={fc}
          undo={onUndo}
        />
      )
    default:
      return null
  }
}
