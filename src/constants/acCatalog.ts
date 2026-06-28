/** Популярні бренди та базові моделі для швидкого вибору в заявці. */
export const AC_BRANDS = [
  'Gree',
  'Daikin',
  'Mitsubishi Electric',
  'Cooper&Hunter',
  'LG',
  'Samsung',
  'Midea',
  'Ballu',
  'Hisense',
  'Toshiba',
  'Panasonic',
  'Haier',
  'Electrolux',
] as const

export type AcBrand = (typeof AC_BRANDS)[number]

export const AC_MODELS_BY_BRAND: Record<AcBrand, readonly string[]> = {
  Gree: [
    'GWH09AAA-K6DNA1A/I',
    'GWH12AAA-K6DNA1A/I',
    'GWH09ACB-K3DNA1A/I',
    'GWH12ACB-K3DNA1A/I',
    'Bora GWH09AAB-K3NDB1A/I',
    'Bora GWH12AAB-K3NDB1A/I',
    'Pular GWH09AGA-K3NDB1A/I',
    'Pular GWH12AGA-K3NDB1A/I',
    'Lomo GWH09AAA-K6NDB1A/I',
    'Lomo GWH12AAA-K6NDB1A/I',
  ],
  Daikin: [
    'FTXS25G/RXS25G',
    'FTXS35G/RXS35G',
    'FTXS50G/RXS50G',
    'FTXM25/RXM25',
    'FTXM35/RXM35',
    'FTXM50/RXM50',
    'FTXB25C/RXB25C',
    'FTXB35C/RXB35C',
    'FTXB50C/RXB50C',
    'FTXZ25N/RXZ25N',
  ],
  'Mitsubishi Electric': [
    'MSZ-AP25VGK/MUZ-AP25VG',
    'MSZ-AP35VGK/MUZ-AP35VG',
    'MSZ-AP50VGK/MUZ-AP50VG',
    'MSZ-HR25VF/MUZ-HR25VF',
    'MSZ-HR35VF/MUZ-HR35VF',
    'MSZ-HR50VF/MUZ-HR50VF',
    'MSZ-AP60VGK/MUZ-AP60VG',
    'MSZ-AP71VGK/MUZ-AP71VG',
  ],
  'Cooper&Hunter': [
    'CH-S09FTXAL2-GD',
    'CH-S12FTXAL2-GD',
    'CH-S18FTXAL2-GD',
    'CH-S09FTXLA2-WK',
    'CH-S12FTXLA2-WK',
    'CH-S18FTXLA2-WK',
    'CH-S09FTXAL2-SC',
    'CH-S12FTXAL2-SC',
  ],
  LG: [
    'PC09SQ.NSJ',
    'PC12SQ.NSJ',
    'PC18SQ.NSJ',
    'PC09SR.NSJ',
    'PC12SR.NSJ',
    'PC09SQ.UB3',
    'PC12SQ.UB3',
    'PC09SQ.UB2',
  ],
  Samsung: [
    'AR09TXHQASINUA',
    'AR12TXHQASINUA',
    'AR18TXHQASINUA',
    'AR09TXHZASINUA',
    'AR12TXHZASINUA',
    'AR09BHQASINUA',
    'AR12BHQASINUA',
  ],
  Midea: [
    'MSG-09HRN1/MOB-09HRN1',
    'MSG-12HRN1/MOB-12HRN1',
    'MSG-18HRN1/MOB-18HRN1',
    'Midea Blanc MSAG1-09HRN1/MOAG1-09HRN1',
    'Midea Blanc MSAG1-12HRN1/MOAG1-12HRN1',
    'Mission MSFT-09HRN1/MOFT-09HRN1',
    'Mission MSFT-12HRN1/MOFT-12HRN1',
  ],
  Ballu: [
    'BSPI-09HN1/BLCI-09HN1',
    'BSPI-12HN1/BLCI-12HN1',
    'BSPI-18HN1/BLCI-18HN1',
    'BSPI-24HN1/BLCI-24HN1',
    'BSPI-09HN8/BLCI-09HN8',
    'BSPI-12HN8/BLCI-12HN8',
  ],
  Hisense: [
    'AS-09UR4SYDDC02',
    'AS-12UR4SYDDC02',
    'AS-18UR4SYDDC02',
    'AS-09UW4RYDDC02',
    'AS-12UW4RYDDC02',
    'AS-09UW4RYDDC05',
  ],
  Toshiba: [
    'RAS-B09E2KVG-E/RAS-09E2AVG-E',
    'RAS-B12E2KVG-E/RAS-12E2AVG-E',
    'RAS-B18E2KVG-E/RAS-18E2AVG-E',
    'RAS-B09PKVSG-E/RAS-09PAVSG-E',
    'RAS-B12PKVSG-E/RAS-12PAVSG-E',
  ],
  Panasonic: [
    'CS/CU-BZ25WKE',
    'CS/CU-BZ35WKE',
    'CS/CU-BZ50WKE',
    'CS/CU-TZ25WKE',
    'CS/CU-TZ35WKE',
    'CS/CU-TZ50WKE',
  ],
  Haier: [
    'AS25S2SF1FA-G/1U25S2SM1FA',
    'AS35S2SF1FA-G/1U35S2SM1FA',
    'AS50S2SF1FA-G/1U50S2SM1FA',
    'AS25S2SF2FA-G/1U25S2SM2FA',
    'AS35S2SF2FA-G/1U35S2SM2FA',
  ],
  Electrolux: [
    'EACS/I-09HAT/N3',
    'EACS/I-12HAT/N3',
    'EACS/I-18HAT/N3',
    'EACS/I-09HAR/N3',
    'EACS/I-12HAR/N3',
  ],
}

export const AC_BRAND_OTHER = '__other__'
export const AC_MODEL_OTHER = '__other__'

export function getModelsForBrand(brand: string): readonly string[] {
  if (brand in AC_MODELS_BY_BRAND) {
    return AC_MODELS_BY_BRAND[brand as AcBrand]
  }
  return []
}

export function isCatalogBrand(brand: string): brand is AcBrand {
  return (AC_BRANDS as readonly string[]).includes(brand)
}
