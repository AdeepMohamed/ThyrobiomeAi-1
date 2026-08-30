import { SUPPORTED_LAB_TESTS, normalizeTestName, classifyLabValue } from '../medical/lab-utils'
import { LabClassification } from '@prisma/client'

export interface ExtractedLabItem {
  testName: string
  testAlias?: string
  value: number | null
  valueText: string
  unit: string
  referenceLow: number | null
  referenceHigh: number | null
  referenceText: string
  classification: LabClassification
  criticalFlag: boolean
  confidence: number
}

/**
 * Intelligent regex and heuristic parser for laboratory test reports
 * Extracts test name, value, unit, reference range, and critical notations.
 */
export function parseLaboratoryReportText(text: string): ExtractedLabItem[] {
  if (!text || text.trim().length === 0) return []

  const results: ExtractedLabItem[] = []
  const lines = text.split(/\r?\n/)

  // Patterns for reference ranges:
  // e.g. "0.33 - 6.30", "0.33-6.30", "0.40 - 4.50", "0.8 - 1.8", "< 0.1", "> 5.0", "0.33 to 6.30"
  const rangeRegex = /(\d+(?:\.\d+)?)\s*(?:-|–|—|to)\s*(\d+(?:\.\d+)?)/i
  const singleLimitRegex = /(?:<|>|<=|>=)\s*(\d+(?:\.\d+)?)/i

  // Units list
  const unitsRegex = /(µIU\/mL|uIU\/mL|mIU\/L|uIU\/ml|µg\/dL|ug\/dL|ng\/dL|pg\/mL|pmol\/L|nmol\/L|IU\/mL|mIU\/mL|ng\/mL)/i

  // Number pattern
  const numberRegex = /(\d+(?:\.\d+)?)/

  // Critical indicators
  const criticalRegex = /(\*|critical|panic|urgent|alert|high!|low!|\bH\b|\bL\b|\bCH\b|\bCL\b)/i

  for (const test of SUPPORTED_LAB_TESTS) {
    // Search line by line for this test or its aliases
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Check if line matches any alias for this test
      let matchedAlias: string | null = null
      for (const alias of [test.id.toLowerCase(), test.name.toLowerCase(), ...test.aliases]) {
        // Use word boundary to avoid partial matches
        const aliasRegex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
        if (aliasRegex.test(line)) {
          matchedAlias = alias
          break
        }
      }

      if (matchedAlias) {
        // We found a line mentioning this test!
        // Combine with next line if current line has no numbers
        let searchContext = line
        if (!numberRegex.test(line) && i + 1 < lines.length) {
          searchContext = `${line} ${lines[i + 1]}`
        }

        // Extract unit
        const unitMatch = searchContext.match(unitsRegex)
        const unit = unitMatch ? unitMatch[1] : test.defaultUnit

        // Extract range
        let refLow: number | null = null
        let refHigh: number | null = null
        let refText = ''

        const rangeMatch = searchContext.match(rangeRegex)
        if (rangeMatch) {
          refLow = parseFloat(rangeMatch[1])
          refHigh = parseFloat(rangeMatch[2])
          refText = `${refLow} – ${refHigh}`
        } else {
          const singleMatch = searchContext.match(singleLimitRegex)
          if (singleMatch) {
            refText = singleMatch[0]
            if (singleMatch[0].includes('<')) {
              refHigh = parseFloat(singleMatch[1])
            } else if (singleMatch[0].includes('>')) {
              refLow = parseFloat(singleMatch[1])
            }
          }
        }

        // Extract patient value
        // Look for numbers before the reference range
        let value: number | null = null
        let valueText = ''

        // Strip the matched alias and range from search context to isolate value
        let remaining = searchContext.replace(new RegExp(`\\b${matchedAlias}\\b`, 'i'), '')
        if (rangeMatch) {
          remaining = remaining.replace(rangeMatch[0], '')
        }
        if (unitMatch) {
          remaining = remaining.replace(unitMatch[0], '')
        }

        // Find remaining numbers
        const numMatches = remaining.match(/(\d+(?:\.\d+)?)/g)
        if (numMatches && numMatches.length > 0) {
          // Usually first number in remaining text is patient value
          const valNum = parseFloat(numMatches[0])
          if (!isNaN(valNum)) {
            value = valNum
            valueText = numMatches[0]
          }
        }

        // Check for critical annotations
        const isCritical = criticalRegex.test(searchContext)

        // Classify
        const classification = classifyLabValue(value, refLow, refHigh, isCritical)

        // Avoid adding duplicate test results unless none exists yet
        const existing = results.findIndex(r => r.testName === test.name)
        if (existing === -1) {
          results.push({
            testName: test.name,
            testAlias: test.id,
            value,
            valueText: valueText || (value !== null ? String(value) : 'N/A'),
            unit,
            referenceLow: refLow ?? test.standardRefLow ?? null,
            referenceHigh: refHigh ?? test.standardRefHigh ?? null,
            referenceText: refText || (test.standardRefLow && test.standardRefHigh ? `${test.standardRefLow} – ${test.standardRefHigh}` : 'Reference range unavailable'),
            classification,
            criticalFlag: isCritical,
            confidence: value !== null ? 0.95 : 0.6,
          })
        }
      }
    }
  }

  return results
}
