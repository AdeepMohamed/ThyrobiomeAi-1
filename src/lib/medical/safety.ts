import {
  OverallStatus,
  ReviewPriority,
  LabClassification,
  AlertType,
  Severity,
} from '@prisma/client'

export interface PatientSafetyInput {
  age?: number | null
  sex?: string | null
  bmi?: number | null
  labResults: Array<{
    testName: string
    value?: number | null
    valueText?: string | null
    unit?: string | null
    referenceLow?: number | null
    referenceHigh?: number | null
    referenceText?: string | null
    classification?: LabClassification | string
    criticalFlag?: boolean
    extractedByAI?: boolean
  }>
  symptoms: Array<{
    symptomName: string
    severity: Severity | string
    frequency?: string | null
  }>
  medicalHistory?: {
    thyroidCondition?: string | null
    previousThyroidSurgery?: boolean | null
    familyHistory?: boolean | null
  } | null
  medications?: Array<{
    name: string
    dosage?: string | null
    isActive?: boolean | null
  }>
  rawExtractedText?: string | null
}

export interface SafetyEvaluationResult {
  overallStatus: OverallStatus
  doctorReviewRequired: boolean
  reviewPriority: ReviewPriority
  reviewReason: string
  alerts: Array<{
    alertType: AlertType
    reason: string
    details: Record<string, unknown>
  }>
  flags: {
    hasLabCriticalAnnotation: boolean
    hasOutOfRangeLabs: boolean
    hasSevereSymptoms: boolean
    hasMissingReferenceRanges: boolean
    concerningCombinations: string[]
  }
  safetyDisclaimer: string
}

// Critical keyword patterns in lab reports
const LAB_CRITICAL_PATTERNS = [
  /\bcritical\b/i,
  /\bpanic\s*value\b/i,
  /\burgent\s*attention\b/i,
  /\bimmediate\s*attention\b/i,
  /\bstat\s*call\b/i,
  /\balert\s*value\b/i,
  /\*critical\*/i,
  /\bseverely\s*abnormal\b/i,
]

// High risk / acute symptoms requiring elevated attention
const URGENT_SYMPTOMS = [
  'severe palpitations',
  'chest pain',
  'shortness of breath',
  'severe dizziness',
  'rapid irregular heartbeat',
  'extreme muscle weakness',
  'syncope',
  'high fever with agitation',
]

/**
 * Deterministic Safety Engine
 * Analyzes report and patient input to establish baseline clinical safety flags
 * This executes independently of the AI model to guarantee deterministic safety guardrails.
 */
export function evaluateMedicalSafety(input: PatientSafetyInput): SafetyEvaluationResult {
  const alerts: Array<{
    alertType: AlertType
    reason: string
    details: Record<string, unknown>
  }> = []

  let overallStatus: OverallStatus = OverallStatus.NO_MAJOR_CONCERN
  let doctorReviewRequired = false
  let reviewPriority: ReviewPriority = ReviewPriority.ROUTINE
  const reasons: string[] = []
  const concerningCombinations: string[] = []

  // 1. Check for Lab Report Explicit Critical/Panic Annotations
  let hasLabCriticalAnnotation = false
  if (input.rawExtractedText) {
    for (const pattern of LAB_CRITICAL_PATTERNS) {
      if (pattern.test(input.rawExtractedText)) {
        hasLabCriticalAnnotation = true
        break
      }
    }
  }

  // Also check individual lab result critical flags
  for (const lab of input.labResults) {
    if (lab.criticalFlag) {
      hasLabCriticalAnnotation = true
    }
    if (lab.valueText) {
      for (const pattern of LAB_CRITICAL_PATTERNS) {
        if (pattern.test(lab.valueText)) {
          hasLabCriticalAnnotation = true
          break
        }
      }
    }
  }

  if (hasLabCriticalAnnotation) {
    overallStatus = OverallStatus.CRITICAL_REVIEW
    doctorReviewRequired = true
    reviewPriority = ReviewPriority.URGENT
    reasons.push('Laboratory report contains explicit critical, panic, or urgent evaluation flags.')
    alerts.push({
      alertType: AlertType.CRITICAL_REVIEW,
      reason: 'Laboratory report contains explicit critical/urgent notation requiring immediate medical review.',
      details: { trigger: 'lab_critical_flag' },
    })
  }

  // 2. Check Laboratory Values Out of Range
  let hasOutOfRangeLabs = false
  let hasMissingReferenceRanges = false
  const abnormalLabs: string[] = []

  for (const lab of input.labResults) {
    const isOutOfRange =
      lab.classification === LabClassification.HIGH ||
      lab.classification === LabClassification.LOW ||
      lab.classification === 'HIGH' ||
      lab.classification === 'LOW'

    const isUnknown =
      lab.classification === LabClassification.UNKNOWN ||
      lab.classification === 'UNKNOWN' ||
      (!lab.referenceLow && !lab.referenceHigh && !lab.referenceText)

    if (isOutOfRange) {
      hasOutOfRangeLabs = true
      abnormalLabs.push(`${lab.testName} (${lab.classification})`)
    }

    if (isUnknown && lab.value !== null && lab.value !== undefined) {
      hasMissingReferenceRanges = true
    }
  }

  if (hasOutOfRangeLabs && overallStatus !== OverallStatus.CRITICAL_REVIEW) {
    overallStatus = OverallStatus.NEEDS_ATTENTION
    doctorReviewRequired = true
    reviewPriority = ReviewPriority.SOON
    reasons.push(`Laboratory values outside reference range: ${abnormalLabs.join(', ')}.`)
    alerts.push({
      alertType: AlertType.ABNORMAL_LAB_PATTERN,
      reason: `Out-of-range laboratory values detected: ${abnormalLabs.join(', ')}`,
      details: { abnormalLabs },
    })
  }

  // 3. Check for specific critical lab combinations (e.g. Extreme TSH, High TSH + Low FT4)
  const tsh = input.labResults.find(r => r.testName.toUpperCase() === 'TSH')
  const ft4 = input.labResults.find(r => r.testName.toUpperCase() === 'FT4' || r.testName.toUpperCase() === 'FREE T4')
  const ft3 = input.labResults.find(r => r.testName.toUpperCase() === 'FT3' || r.testName.toUpperCase() === 'FREE T3')

  if (tsh?.value !== undefined && tsh?.value !== null) {
    // Significantly elevated TSH (> 10 µIU/mL or > 2x high range)
    const refHigh = tsh.referenceHigh || 4.5
    if (tsh.value > 10 || (refHigh && tsh.value > refHigh * 2)) {
      concerningCombinations.push(`TSH value (${tsh.value} ${tsh.unit || 'µIU/mL'}) is substantially elevated above reference range`)
      if (overallStatus !== OverallStatus.CRITICAL_REVIEW) {
        overallStatus = OverallStatus.MEDICAL_REVIEW_RECOMMENDED
        doctorReviewRequired = true
        reviewPriority = ReviewPriority.PROMPT
      }
    } else if (tsh.value < 0.1) {
      concerningCombinations.push(`TSH value (${tsh.value} ${tsh.unit || 'µIU/mL'}) is deeply suppressed`)
      if (overallStatus !== OverallStatus.CRITICAL_REVIEW) {
        overallStatus = OverallStatus.MEDICAL_REVIEW_RECOMMENDED
        doctorReviewRequired = true
        reviewPriority = ReviewPriority.PROMPT
      }
    }
  }

  // Marked overt hypothyroid pattern: High TSH + Low FT4
  if (
    (tsh?.classification === LabClassification.HIGH || tsh?.classification === 'HIGH') &&
    (ft4?.classification === LabClassification.LOW || ft4?.classification === 'LOW')
  ) {
    concerningCombinations.push('High TSH combined with Low Free T4 (marked hypothyroid laboratory pattern)')
    if (overallStatus !== OverallStatus.CRITICAL_REVIEW) {
      overallStatus = OverallStatus.MEDICAL_REVIEW_RECOMMENDED
      doctorReviewRequired = true
      reviewPriority = ReviewPriority.PROMPT
    }
  }

  // Marked overt hyperthyroid pattern: Low TSH + High FT4/FT3
  if (
    (tsh?.classification === LabClassification.LOW || tsh?.classification === 'LOW') &&
    (ft4?.classification === LabClassification.HIGH || ft4?.classification === 'HIGH' || ft3?.classification === LabClassification.HIGH || ft3?.classification === 'HIGH')
  ) {
    concerningCombinations.push('Suppressed TSH combined with elevated thyroid hormones (marked hyperthyroid laboratory pattern)')
    if (overallStatus !== OverallStatus.CRITICAL_REVIEW) {
      overallStatus = OverallStatus.MEDICAL_REVIEW_RECOMMENDED
      doctorReviewRequired = true
      reviewPriority = ReviewPriority.PROMPT
    }
  }

  // 4. Check Severe Symptoms
  let hasSevereSymptoms = false
  const severeSymptomList: string[] = []

  for (const symptom of input.symptoms) {
    const isSevere =
      symptom.severity === Severity.SEVERE ||
      symptom.severity === 'SEVERE' ||
      symptom.severity === 'Severe'

    if (isSevere) {
      hasSevereSymptoms = true
      severeSymptomList.push(symptom.symptomName)

      // Check if this is an acute urgent symptom
      const isUrgent = URGENT_SYMPTOMS.some(us =>
        symptom.symptomName.toLowerCase().includes(us)
      )

      if (isUrgent) {
        if (overallStatus !== OverallStatus.CRITICAL_REVIEW) {
          overallStatus = OverallStatus.MEDICAL_REVIEW_RECOMMENDED
          doctorReviewRequired = true
          reviewPriority = ReviewPriority.PROMPT
        }
      }
    }
  }

  if (hasSevereSymptoms) {
    reasons.push(`Severe symptoms reported: ${severeSymptomList.join(', ')}.`)
    if (overallStatus === OverallStatus.NO_MAJOR_CONCERN) {
      overallStatus = OverallStatus.NEEDS_ATTENTION
      doctorReviewRequired = true
      reviewPriority = ReviewPriority.SOON
    }
  }

  if (hasMissingReferenceRanges) {
    reasons.push('Some laboratory reference ranges were unavailable on the report; cautious interpretation advised.')
  }

  if (concerningCombinations.length > 0) {
    reasons.push(...concerningCombinations)
  }

  // If no issues were detected at all
  if (reasons.length === 0) {
    reasons.push('Laboratory values and reported symptoms are within typical baseline parameters.')
  }

  const reviewReason = reasons.join(' ')

  if (doctorReviewRequired && alerts.every(a => a.alertType !== AlertType.DOCTOR_REVIEW_REQUIRED && a.alertType !== AlertType.CRITICAL_REVIEW)) {
    alerts.push({
      alertType: AlertType.DOCTOR_REVIEW_REQUIRED,
      reason: reviewReason,
      details: {
        priority: reviewPriority,
        overallStatus,
        abnormalLabs,
        severeSymptomList,
      },
    })
  }

  return {
    overallStatus,
    doctorReviewRequired,
    reviewPriority,
    reviewReason,
    alerts,
    flags: {
      hasLabCriticalAnnotation,
      hasOutOfRangeLabs,
      hasSevereSymptoms,
      hasMissingReferenceRanges,
      concerningCombinations,
    },
    safetyDisclaimer:
      'AI-supported interpretation only. This does not constitute a medical diagnosis. Please consult a qualified healthcare professional for clinical interpretation.',
  }
}
