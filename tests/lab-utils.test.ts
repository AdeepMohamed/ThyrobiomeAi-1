import { describe, it, expect } from 'vitest'
import { normalizeTestName, classifyLabValue, formatLabDisplay } from '../src/lib/medical/lab-utils'
import { calculateBMI, getBMICategory } from '../src/lib/utils'
import { LabClassification } from '@prisma/client'

describe('Laboratory Utilities & Normalization', () => {
  it('normalizes common lab test aliases correctly', () => {
    expect(normalizeTestName('TSH')?.id).toBe('TSH')
    expect(normalizeTestName('Thyroid Stimulating Hormone')?.id).toBe('TSH')
    expect(normalizeTestName('Thyrotropin')?.id).toBe('TSH')
    expect(normalizeTestName('Free T4')?.id).toBe('FT4')
    expect(normalizeTestName('Free Thyroxine')?.id).toBe('FT4')
    expect(normalizeTestName('s-ft3')?.id).toBe('FT3')
    expect(normalizeTestName('Anti-TPO')?.id).toBe('ANTI_TPO')
    expect(normalizeTestName('Thyroid Peroxidase Antibodies')?.id).toBe('ANTI_TPO')
  })

  it('correctly classifies values against dynamic report reference ranges', () => {
    // Normal
    expect(classifyLabValue(2.5, 0.4, 4.5)).toBe(LabClassification.NORMAL)
    // High
    expect(classifyLabValue(9.89, 0.33, 6.30)).toBe(LabClassification.HIGH)
    // Low
    expect(classifyLabValue(0.1, 0.4, 4.5)).toBe(LabClassification.LOW)
    // Critical override
    expect(classifyLabValue(2.5, 0.4, 4.5, true)).toBe(LabClassification.CRITICAL_REVIEW)
    // Missing range
    expect(classifyLabValue(5.0, null, null)).toBe(LabClassification.UNKNOWN)
  })

  it('accurately calculates BMI and assigns categories', () => {
    // 68kg, 160cm -> 26.6 (Overweight)
    const bmi = calculateBMI(68, 160)
    expect(bmi).toBe(26.6)
    expect(getBMICategory(bmi)).toBe('Overweight')

    // 55kg, 165cm -> 20.2 (Normal)
    const normalBmi = calculateBMI(55, 165)
    expect(normalBmi).toBe(20.2)
    expect(getBMICategory(normalBmi)).toBe('Normal')
  })

  it('formats lab display text gracefully', () => {
    const formatted = formatLabDisplay({
      testName: 'TSH',
      value: 9.89,
      unit: 'µIU/mL',
      referenceText: '0.33 – 6.30',
      classification: LabClassification.HIGH,
    })

    expect(formatted.testName).toBe('TSH')
    expect(formatted.value).toBe('9.89')
    expect(formatted.referenceRange).toBe('0.33 – 6.30')
    expect(formatted.classification).toBe(LabClassification.HIGH)
  })
})
