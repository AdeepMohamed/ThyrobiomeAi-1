import { z } from 'zod'

// ============================================================
// Auth Schemas
// ============================================================

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// ============================================================
// Patient Profile Schema
// ============================================================

export const patientProfileSchema = z.object({
  age: z.coerce.number().min(1).max(150).optional(),
  sex: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  height: z.coerce.number().min(30).max(300).optional(), // cm
  weight: z.coerce.number().min(1).max(500).optional(), // kg
  phone: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
})

// ============================================================
// Medical History Schema
// ============================================================

export const medicalHistorySchema = z.object({
  thyroidCondition: z.enum([
    'NONE', 'HYPOTHYROIDISM', 'HYPERTHYROIDISM', 'THYROIDITIS',
    'GOITRE_NODULES', 'THYROID_SURGERY', 'OTHER'
  ]).default('NONE'),
  thyroidConditionOther: z.string().optional(),
  previousThyroidSurgery: z.boolean().default(false),
  surgeryDetails: z.string().optional(),
  familyHistory: z.boolean().default(false),
  familyHistoryDetails: z.string().optional(),
  otherConditions: z.string().optional(),
  notes: z.string().optional(),
})

// ============================================================
// Medication Schema
// ============================================================

export const medicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  startDate: z.string().optional(),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
})

// ============================================================
// Symptoms Schema
// ============================================================

export const symptomSchema = z.object({
  symptomName: z.string().min(1),
  severity: z.enum(['NONE', 'MILD', 'MODERATE', 'SEVERE']).default('NONE'),
  frequency: z.enum(['NEVER', 'RARELY', 'SOMETIMES', 'OFTEN', 'ALWAYS']).default('NEVER'),
  notes: z.string().optional(),
})

export const symptomsFormSchema = z.object({
  symptoms: z.array(symptomSchema),
})

// ============================================================
// Lifestyle Schema
// ============================================================

export const lifestyleSchema = z.object({
  dietType: z.enum(['VEGETARIAN', 'NON_VEGETARIAN', 'VEGAN', 'MIXED', 'OTHER']).default('MIXED'),
  fiberIntake: z.enum(['NEVER', 'RARELY', 'SOMETIMES', 'OFTEN', 'ALWAYS']).default('SOMETIMES'),
  fermentedFoodIntake: z.enum(['NEVER', 'RARELY', 'SOMETIMES', 'OFTEN', 'ALWAYS']).default('RARELY'),
  probioticSupplement: z.boolean().default(false),
  activityLevel: z.enum(['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE']).default('SEDENTARY'),
  exerciseType: z.string().optional(),
  exerciseFrequency: z.string().optional(),
  sleepHours: z.coerce.number().min(0).max(24).optional(),
  sleepQuality: z.enum(['POOR', 'FAIR', 'GOOD', 'EXCELLENT']).default('FAIR'),
  stressLevel: z.enum(['LOW', 'MODERATE', 'HIGH', 'VERY_HIGH']).default('MODERATE'),
  waterIntake: z.coerce.number().min(0).max(20).optional(), // liters
  smokingStatus: z.string().optional(),
  alcoholUse: z.string().optional(),
  notes: z.string().optional(),
})

// ============================================================
// Gut Health Schema
// ============================================================

export const gutHealthSchema = z.object({
  bloating: z.enum(['NONE', 'MILD', 'MODERATE', 'SEVERE']).default('NONE'),
  constipation: z.enum(['NONE', 'MILD', 'MODERATE', 'SEVERE']).default('NONE'),
  diarrhea: z.enum(['NONE', 'MILD', 'MODERATE', 'SEVERE']).default('NONE'),
  abdominalDiscomfort: z.enum(['NONE', 'MILD', 'MODERATE', 'SEVERE']).default('NONE'),
  recentAntibiotics: z.boolean().default(false),
  antibioticDetails: z.string().optional(),
  probioticUse: z.boolean().default(false),
  probioticDetails: z.string().optional(),
  previousGIDisorder: z.boolean().default(false),
  giDisorderDetails: z.string().optional(),
  stoolSampleAvailable: z.boolean().default(false),
  microbiomeData: z.string().optional(),
  notes: z.string().optional(),
})

// ============================================================
// Lab Result Schema
// ============================================================

export const labResultSchema = z.object({
  testName: z.string().min(1, 'Test name is required'),
  value: z.coerce.number().optional(),
  valueText: z.string().optional(),
  unit: z.string().optional(),
  referenceLow: z.coerce.number().optional(),
  referenceHigh: z.coerce.number().optional(),
  referenceText: z.string().optional(),
  extractedByAI: z.boolean().default(false),
  patientVerified: z.boolean().default(false),
  criticalFlag: z.boolean().default(false),
})

export const labResultsFormSchema = z.object({
  results: z.array(labResultSchema),
})

// ============================================================
// Type Exports
// ============================================================

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type PatientProfileInput = z.infer<typeof patientProfileSchema>
export type MedicalHistoryInput = z.infer<typeof medicalHistorySchema>
export type MedicationInput = z.infer<typeof medicationSchema>
export type SymptomInput = z.infer<typeof symptomSchema>
export type SymptomsFormInput = z.infer<typeof symptomsFormSchema>
export type LifestyleInput = z.infer<typeof lifestyleSchema>
export type GutHealthInput = z.infer<typeof gutHealthSchema>
export type LabResultInput = z.infer<typeof labResultSchema>
export type LabResultsFormInput = z.infer<typeof labResultsFormSchema>
