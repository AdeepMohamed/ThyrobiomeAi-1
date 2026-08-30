import { LabClassification } from '@prisma/client'

export interface StandardLabTest {
  id: string
  name: string
  fullName: string
  aliases: string[]
  defaultUnit: string
  standardRefLow?: number
  standardRefHigh?: number
  description: string
  category: 'thyroid' | 'antibody' | 'metabolic' | 'other'
}

export const SUPPORTED_LAB_TESTS: StandardLabTest[] = [
  {
    id: 'TSH',
    name: 'TSH',
    fullName: 'Thyroid Stimulating Hormone (Thyrotropin)',
    aliases: [
      'tsh',
      'thyroid stimulating hormone',
      'thyrotropin',
      's-tsh',
      'serum tsh',
      'ultra sensitive tsh',
      '3rd gen tsh',
      'thyroid-stimulating hormone',
    ],
    defaultUnit: 'µIU/mL',
    standardRefLow: 0.4,
    standardRefHigh: 4.5,
    description: 'Pituitary hormone that regulates thyroid hormone production',
    category: 'thyroid',
  },
  {
    id: 'FT4',
    name: 'Free T4',
    fullName: 'Free Thyroxine',
    aliases: [
      'ft4',
      'free t4',
      'free thyroxine',
      's-ft4',
      'serum free t4',
      'free thyroxin',
    ],
    defaultUnit: 'ng/dL',
    standardRefLow: 0.8,
    standardRefHigh: 1.8,
    description: 'Active unbound thyroxine available to body tissues',
    category: 'thyroid',
  },
  {
    id: 'FT3',
    name: 'Free T3',
    fullName: 'Free Triiodothyronine',
    aliases: [
      'ft3',
      'free t3',
      'free triiodothyronine',
      's-ft3',
      'serum free t3',
    ],
    defaultUnit: 'pg/mL',
    standardRefLow: 2.3,
    standardRefHigh: 4.2,
    description: 'Active unbound triiodothyronine driving cellular metabolism',
    category: 'thyroid',
  },
  {
    id: 'T4',
    name: 'Total T4',
    fullName: 'Total Thyroxine',
    aliases: [
      't4',
      'total t4',
      'total thyroxine',
      's-t4',
      'serum t4',
      'thyroxine total',
    ],
    defaultUnit: 'µg/dL',
    standardRefLow: 4.5,
    standardRefHigh: 12.0,
    description: 'Total thyroxine including protein-bound fraction',
    category: 'thyroid',
  },
  {
    id: 'T3',
    name: 'Total T3',
    fullName: 'Total Triiodothyronine',
    aliases: [
      't3',
      'total t3',
      'total triiodothyronine',
      's-t3',
      'serum t3',
      'triiodothyronine total',
    ],
    defaultUnit: 'ng/dL',
    standardRefLow: 80.0,
    standardRefHigh: 200.0,
    description: 'Total triiodothyronine circulating in bloodstream',
    category: 'thyroid',
  },
  {
    id: 'ANTI_TPO',
    name: 'Anti-TPO',
    fullName: 'Thyroid Peroxidase Antibodies',
    aliases: [
      'anti-tpo',
      'tpoab',
      'tpo antibodies',
      'anti tpo',
      'thyroid peroxidase antibody',
      'thyroid peroxidase antibodies',
      'anti-thyroid peroxidase',
      'tpo-ab',
    ],
    defaultUnit: 'IU/mL',
    standardRefLow: 0,
    standardRefHigh: 34,
    description: 'Autoantibodies targeted against thyroid peroxidase enzyme',
    category: 'antibody',
  },
  {
    id: 'ANTI_TG',
    name: 'Anti-TG',
    fullName: 'Thyroglobulin Antibodies',
    aliases: [
      'anti-tg',
      'tgab',
      'tg antibodies',
      'anti thyroglobulin',
      'thyroglobulin antibody',
      'thyroglobulin antibodies',
      'anti-thyroglobulin',
      'tg-ab',
    ],
    defaultUnit: 'IU/mL',
    standardRefLow: 0,
    standardRefHigh: 115,
    description: 'Autoantibodies directed against thyroglobulin protein',
    category: 'antibody',
  },
]

/**
 * Normalizes test name string to standardized test identifier
 */
export function normalizeTestName(rawName: string): StandardLabTest | null {
  if (!rawName) return null
  const cleaned = rawName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim()

  for (const test of SUPPORTED_LAB_TESTS) {
    if (test.name.toLowerCase() === cleaned || test.id.toLowerCase() === cleaned) {
      return test
    }
    if (test.fullName.toLowerCase() === cleaned || test.fullName.toLowerCase().includes(cleaned) || cleaned.includes(test.fullName.toLowerCase())) {
      return test
    }
    for (const alias of test.aliases) {
      if (cleaned === alias || cleaned.includes(alias) || alias.includes(cleaned)) {
        return test
      }
    }
  }
  return null
}

/**
 * Classifies a lab value against provided report reference ranges
 * Follows Rule: Do NOT rely on universal hardcoded range if patient report range exists
 */
export function classifyLabValue(
  value: number | null | undefined,
  refLow?: number | null,
  refHigh?: number | null,
  criticalFlag?: boolean
): LabClassification {
  if (criticalFlag) {
    return LabClassification.CRITICAL_REVIEW
  }

  if (value === null || value === undefined || isNaN(value)) {
    return LabClassification.UNKNOWN
  }

  const hasLow = refLow !== null && refLow !== undefined && !isNaN(refLow)
  const hasHigh = refHigh !== null && refHigh !== undefined && !isNaN(refHigh)

  if (!hasLow && !hasHigh) {
    return LabClassification.UNKNOWN
  }

  if (hasLow && hasHigh) {
    if (value < refLow!) return LabClassification.LOW
    if (value > refHigh!) return LabClassification.HIGH
    return LabClassification.NORMAL
  }

  if (hasLow && !hasHigh) {
    return value < refLow! ? LabClassification.LOW : LabClassification.NORMAL
  }

  if (!hasLow && hasHigh) {
    return value > refHigh! ? LabClassification.HIGH : LabClassification.NORMAL
  }

  return LabClassification.UNKNOWN
}

/**
 * Formats a lab value with unit and reference range for UI display
 */
export function formatLabDisplay(result: {
  testName: string
  value?: number | null
  valueText?: string | null
  unit?: string | null
  referenceLow?: number | null
  referenceHigh?: number | null
  referenceText?: string | null
  classification?: LabClassification | string
}) {
  const displayVal = result.value !== null && result.value !== undefined
    ? result.value.toString()
    : result.valueText || 'N/A'

  let displayRange = 'Reference range unavailable'
  if (result.referenceText) {
    displayRange = result.referenceText
  } else if (result.referenceLow !== null && result.referenceLow !== undefined && result.referenceHigh !== null && result.referenceHigh !== undefined) {
    displayRange = `${result.referenceLow} – ${result.referenceHigh}`
  } else if (result.referenceLow !== null && result.referenceLow !== undefined) {
    displayRange = `> ${result.referenceLow}`
  } else if (result.referenceHigh !== null && result.referenceHigh !== undefined) {
    displayRange = `< ${result.referenceHigh}`
  }

  return {
    testName: result.testName,
    value: displayVal,
    unit: result.unit || '',
    referenceRange: displayRange,
    classification: result.classification || LabClassification.UNKNOWN,
  }
}
