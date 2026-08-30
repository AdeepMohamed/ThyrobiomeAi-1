import { describe, it, expect } from 'vitest'
import { evaluateMedicalSafety } from '../src/lib/medical/safety'
import { LabClassification, Severity, OverallStatus, ReviewPriority } from '@prisma/client'

describe('Deterministic Safety Engine', () => {
  it('Scenario 1: Evaluates normal thyroid panel as NO_MAJOR_CONCERN', () => {
    const result = evaluateMedicalSafety({
      age: 35,
      sex: 'FEMALE',
      bmi: 22.5,
      labResults: [
        {
          testName: 'TSH',
          value: 2.1,
          referenceLow: 0.4,
          referenceHigh: 4.5,
          classification: LabClassification.NORMAL,
        },
        {
          testName: 'Free T4',
          value: 1.2,
          referenceLow: 0.8,
          referenceHigh: 1.8,
          classification: LabClassification.NORMAL,
        },
      ],
      symptoms: [
        { symptomName: 'Fatigue', severity: Severity.NONE },
      ],
    })

    expect(result.overallStatus).toBe(OverallStatus.NO_MAJOR_CONCERN)
    expect(result.doctorReviewRequired).toBe(false)
    expect(result.reviewPriority).toBe(ReviewPriority.ROUTINE)
  })

  it('Scenario 2: Evaluates abnormal TSH (9.89) as MEDICAL_REVIEW_RECOMMENDED', () => {
    const result = evaluateMedicalSafety({
      age: 43,
      sex: 'FEMALE',
      bmi: 26.6,
      labResults: [
        {
          testName: 'TSH',
          value: 9.89,
          referenceLow: 0.33,
          referenceHigh: 6.30,
          classification: LabClassification.HIGH,
        },
        {
          testName: 'Free T4',
          value: 1.10,
          referenceLow: 0.80,
          referenceHigh: 1.80,
          classification: LabClassification.NORMAL,
        },
      ],
      symptoms: [
        { symptomName: 'Fatigue', severity: Severity.MODERATE },
        { symptomName: 'Weight Gain', severity: Severity.MODERATE },
      ],
    })

    expect(result.doctorReviewRequired).toBe(true)
    expect([OverallStatus.NEEDS_ATTENTION, OverallStatus.MEDICAL_REVIEW_RECOMMENDED]).toContain(result.overallStatus)
  })

  it('Scenario 3: Report marked critical by laboratory flags CRITICAL_REVIEW and URGENT priority', () => {
    const result = evaluateMedicalSafety({
      age: 50,
      labResults: [
        {
          testName: 'TSH',
          value: 45.0,
          criticalFlag: true,
          classification: LabClassification.CRITICAL_REVIEW,
        },
      ],
      symptoms: [],
      rawExtractedText: 'QUEST DIAGNOSTICS: *CRITICAL PANIC VALUE ALERT* CONTACT ATTENDING PHYSICIAN IMMEDIATELY',
    })

    expect(result.overallStatus).toBe(OverallStatus.CRITICAL_REVIEW)
    expect(result.doctorReviewRequired).toBe(true)
    expect(result.reviewPriority).toBe(ReviewPriority.URGENT)
    expect(result.flags.hasLabCriticalAnnotation).toBe(true)
  })

  it('Scenario 4: Handles missing reference range with cautious flag', () => {
    const result = evaluateMedicalSafety({
      labResults: [
        {
          testName: 'TSH',
          value: 5.5,
          referenceLow: null,
          referenceHigh: null,
          classification: LabClassification.UNKNOWN,
        },
      ],
      symptoms: [],
    })

    expect(result.flags.hasMissingReferenceRanges).toBe(true)
    expect(result.reviewReason).toContain('cautious interpretation')
  })

  it('Scenario 5: High TSH + Low FT4 triggers overt hypothyroid pattern concern', () => {
    const result = evaluateMedicalSafety({
      labResults: [
        {
          testName: 'TSH',
          value: 15.2,
          referenceLow: 0.4,
          referenceHigh: 4.5,
          classification: LabClassification.HIGH,
        },
        {
          testName: 'Free T4',
          value: 0.5,
          referenceLow: 0.8,
          referenceHigh: 1.8,
          classification: LabClassification.LOW,
        },
      ],
      symptoms: [],
    })

    expect(result.overallStatus).toBe(OverallStatus.MEDICAL_REVIEW_RECOMMENDED)
    expect(result.doctorReviewRequired).toBe(true)
    expect(result.flags.concerningCombinations.length).toBeGreaterThan(0)
  })
})
