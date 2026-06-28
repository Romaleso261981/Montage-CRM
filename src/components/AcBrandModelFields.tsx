import { FormField, inputClass } from './AuthShell'
import {
  AC_BRAND_OTHER,
  AC_BRANDS,
  AC_MODEL_OTHER,
  getModelsForBrand,
  isCatalogBrand,
} from '../constants/acCatalog'

type AcBrandModelFieldsProps = {
  brandSelection: string
  onBrandSelectionChange: (value: string) => void
  customBrand: string
  onCustomBrandChange: (value: string) => void
  modelSelection: string
  onModelSelectionChange: (value: string) => void
  customModel: string
  onCustomModelChange: (value: string) => void
  required?: boolean
}

export function resolveAcBrandAndModel(
  brandSelection: string,
  customBrand: string,
  modelSelection: string,
  customModel: string,
): { acName: string; acModel: string } | null {
  const acName =
    brandSelection === AC_BRAND_OTHER
      ? customBrand.trim()
      : brandSelection.trim()

  let acModel = ''
  if (brandSelection === AC_BRAND_OTHER || modelSelection === AC_MODEL_OTHER) {
    acModel = customModel.trim()
  } else {
    acModel = modelSelection.trim()
  }

  if (!acName || !acModel) return null
  return { acName, acModel }
}

export function AcBrandModelFields({
  brandSelection,
  onBrandSelectionChange,
  customBrand,
  onCustomBrandChange,
  modelSelection,
  onModelSelectionChange,
  customModel,
  onCustomModelChange,
  required = false,
}: AcBrandModelFieldsProps) {
  const catalogModels = isCatalogBrand(brandSelection)
    ? getModelsForBrand(brandSelection)
    : []
  const showModelList = isCatalogBrand(brandSelection) && catalogModels.length > 0

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Фірма (бренд) *">
          <select
            required={required}
            className={inputClass}
            value={brandSelection}
            onChange={(e) => onBrandSelectionChange(e.target.value)}
          >
            <option value="">Оберіть бренд</option>
            {AC_BRANDS.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
            <option value={AC_BRAND_OTHER}>Інший бренд…</option>
          </select>
        </FormField>

        <FormField label="Модель *">
          <select
            required={required && showModelList}
            className={inputClass}
            value={modelSelection}
            disabled={!showModelList}
            onChange={(e) => onModelSelectionChange(e.target.value)}
          >
            <option value="">
              {showModelList ? 'Оберіть модель' : 'Спочатку оберіть бренд'}
            </option>
            {catalogModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
            {showModelList && (
              <option value={AC_MODEL_OTHER}>Інша модель (вручну)…</option>
            )}
          </select>
          {showModelList && (
            <p className="mt-1 text-xs text-slate-500">
              Популярні моделі для {brandSelection}
            </p>
          )}
        </FormField>
      </div>

      {brandSelection === AC_BRAND_OTHER && (
        <FormField label="Назва бренду (вручну) *">
          <input
            required={required}
            className={inputClass}
            value={customBrand}
            onChange={(e) => onCustomBrandChange(e.target.value)}
            placeholder="Напр. Kentatsu, TCL…"
          />
        </FormField>
      )}

      {(modelSelection === AC_MODEL_OTHER ||
        brandSelection === AC_BRAND_OTHER) && (
        <FormField
          label={
            brandSelection === AC_BRAND_OTHER
              ? 'Модель (вручну) *'
              : 'Інша модель *'
          }
        >
          <input
            required={required}
            className={inputClass}
            value={customModel}
            onChange={(e) => onCustomModelChange(e.target.value)}
            placeholder="Повна назва моделі"
          />
        </FormField>
      )}
    </div>
  )
}
