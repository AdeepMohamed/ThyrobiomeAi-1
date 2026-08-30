import { z } from 'zod'

export const grokAnalysisResponseSchema = z.object({
  overall_status: z.enum([
    'NO_MAJOR_CONCERN',
    'NEEDS_ATTENTION',
    'MEDICAL_REVIEW_RECOMMENDED',
    'CRITICAL_REVIEW',
  ]),
  confidence: z.enum(['high', 'moderate', 'low', 'provisional']),
  summary: z.string().min(1),
  thyroid_pattern: z.string().min(1),
  lab_interpretation: z.array(
    z.object({
      test_name: z.string(),
      patient_value: z.string(),
      reference_range: z.string(),
      clinical_significance: z.string(),
      status: z.string(),
    })
  ),
  key_observations: z.array(z.string()),
  doctor_review: z.object({
    required: z.boolean(),
    priority: z.enum(['routine', 'soon', 'prompt', 'urgent']),
    reason: z.string(),
  }),
  diet: z.object({
    foods_to_include: z.array(
      z.object({
        food_group: z.string(),
        examples: z.array(z.string()),
        rationale: z.string(),
      })
    ),
    foods_to_limit: z.array(
      z.object({
        food_group: z.string(),
        examples: z.array(z.string()),
        rationale: z.string(),
      })
    ),
    protein_guidance: z.string(),
    fiber_guidance: z.string(),
    nutritional_considerations: z.array(
      z.object({
        nutrient: z.string(), // e.g. "Selenium", "Zinc", "Iodine", "Iron", "Vitamin D", "Vitamin B12"
        importance: z.string(),
        dietary_sources: z.array(z.string()),
        caution_note: z.string(),
      })
    ),
  }),
  activity: z.object({
    recommendation: z.string(),
    goals: z.array(z.string()),
    things_to_avoid: z.array(z.string()),
  }),
  daily_habits: z.object({
    sleep: z.string(),
    hydration: z.string(),
    stress: z.string(),
  }),
  gut_thyroid_insights: z.array(
    z.object({
      observation: z.string(),
      potential_mechanism: z.string(),
      actionable_lifestyle_focus: z.string(),
    })
  ),
  probiotic_prebiotic_candidates: z.array(
    z.object({
      category: z.enum(['Probiotic Candidate', 'Prebiotic Candidate', 'Synbiotic Candidate', 'Dietary Source']),
      name: z.string(),
      rationale: z.string(),
      safety_guidance: z.string(),
    })
  ),
  things_to_do: z.array(z.string()),
  things_to_avoid: z.array(z.string()),
  medical_disclaimer: z.string(),
})

export type GrokAnalysisResponse = z.infer<typeof grokAnalysisResponseSchema>
