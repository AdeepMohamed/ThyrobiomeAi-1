export const GROK_SYSTEM_PROMPT = `
You are the AI clinical reasoning engine for THYROBIOMEAI, an advanced, evidence-based thyroid and gut-health educational platform.

YOUR PRIMARY DIRECTIVES & SAFETY CONSTRAINTS:
1. YOU ARE NOT A DIAGNOSTIC SYSTEM. You must NEVER state that the patient definitely has a medical condition (e.g. NEVER say "You have hypothyroidism" or "You have Hashimoto's disease").
2. ALWAYS USE SUPPORTIVE, HYPOTHETICAL, AND PATTERN-BASED LANGUAGE:
   - Use: "Laboratory pattern potentially consistent with...", "Findings show patterns frequently associated with...", "Features that may suggest...", "Consider discussing with your physician...".
3. NEVER PRESCRIBE MEDICATION, ADJUST DOSAGES, OR ADVISE STOPPING PRESCRIBED MEDICATIONS:
   - Explicitly remind the patient to follow their prescribing physician's guidance.
4. NEVER PROMISE CURES OR PRESENT PROBIOTICS/SUPPLEMENTS AS TREATMENTS:
   - Probiotic, prebiotic, and synbiotic items are CANDIDATES for exploration and clinician review only.
5. NEVER FABRICATE LAB VALUES, REFERENCE RANGES, OR MICROBIOME DATA:
   - If microbiome or reference range data is absent, state clearly that it is not available and reason cautiously.
6. NUTRITIONAL CONSIDERATIONS:
   - Do NOT tell patients to take high-dose supplements. Suggest food-based sources (iodine, selenium, zinc, iron, vitamin D, vitamin B12) and suggest: "Consider discussing targeted testing with your healthcare professional before supplementing."
7. RESPECT DETERMINISTIC SAFETY FLAGS:
   - If the deterministic safety engine has flagged critical or doctor-review items, honor and amplify that safety recommendation.
8. RETURN STRICT JSON:
   - You must output ONLY a valid JSON object conforming exactly to the requested JSON schema. No markdown backticks around the json, no preamble, no postamble.
`

export interface GrokAnalysisPromptInput {
  patientProfile: {
    age?: number | null
    sex?: string | null
    height?: number | null
    weight?: number | null
    bmi?: number | null
  }
  labResults: Array<{
    testName: string
    value?: number | null
    valueText?: string | null
    unit?: string | null
    referenceLow?: number | null
    referenceHigh?: number | null
    referenceText?: string | null
    classification?: string | null
  }>
  medicalHistory?: {
    thyroidCondition?: string | null
    previousThyroidSurgery?: boolean | null
    familyHistory?: boolean | null
    otherConditions?: string | null
  } | null
  medications?: Array<{
    name: string
    dosage?: string | null
    frequency?: string | null
  }>
  symptoms: Array<{
    symptomName: string
    severity: string
    frequency?: string | null
  }>
  lifestyle?: {
    dietType?: string | null
    fiberIntake?: string | null
    fermentedFoodIntake?: string | null
    probioticSupplement?: boolean | null
    activityLevel?: string | null
    sleepHours?: number | null
    sleepQuality?: string | null
    stressLevel?: string | null
    waterIntake?: number | null
  } | null
  gutHealth?: {
    bloating?: string | null
    constipation?: string | null
    diarrhea?: string | null
    abdominalDiscomfort?: string | null
    recentAntibiotics?: boolean | null
    probioticUse?: boolean | null
    previousGIDisorder?: boolean | null
    stoolSampleAvailable?: boolean | null
    microbiomeData?: string | null
  } | null
  safetyFlags: {
    hasLabCriticalAnnotation: boolean
    hasOutOfRangeLabs: boolean
    hasSevereSymptoms: boolean
    concerningCombinations: string[]
    deterministicStatus: string
    deterministicPriority: string
  }
}

export function buildGrokUserPrompt(data: GrokAnalysisPromptInput): string {
  return `
Analyze the following patient data for ThyroBiomeAI and return a comprehensive, structured JSON assessment:

=== PATIENT DEMOGRAPHICS & BIOMETRICS ===
Age: ${data.patientProfile.age ?? 'Not specified'}
Sex: ${data.patientProfile.sex ?? 'Not specified'}
Height: ${data.patientProfile.height ? `${data.patientProfile.height} cm` : 'Not specified'}
Weight: ${data.patientProfile.weight ? `${data.patientProfile.weight} kg` : 'Not specified'}
BMI: ${data.patientProfile.bmi ?? 'Not calculated'}

=== THYROID & BIOCHEMICAL LABS ===
${
  data.labResults.length > 0
    ? data.labResults
        .map(
          (l) =>
            `- Test: ${l.testName} | Value: ${l.value ?? l.valueText ?? 'N/A'} ${l.unit ?? ''} | Report Ref: ${l.referenceText || `${l.referenceLow ?? '?'} - ${l.referenceHigh ?? '?'}`} | Status: ${l.classification ?? 'UNKNOWN'}`
        )
        .join('\n')
    : 'No thyroid lab values provided in this report.'
}

=== MEDICAL HISTORY & MEDS ===
Thyroid Condition History: ${data.medicalHistory?.thyroidCondition ?? 'None reported'}
Previous Thyroid Surgery: ${data.medicalHistory?.previousThyroidSurgery ? 'Yes' : 'No'}
Family History of Thyroid Disorder: ${data.medicalHistory?.familyHistory ? 'Yes' : 'No'}
Other Conditions: ${data.medicalHistory?.otherConditions ?? 'None noted'}
Current Medications: ${
    data.medications && data.medications.length > 0
      ? data.medications.map((m) => `${m.name} (${m.dosage ?? 'dose unlisted'}, ${m.frequency ?? 'frequency unlisted'})`).join(', ')
      : 'None reported'
  }

=== REPORTED SYMPTOMS ===
${
  data.symptoms.length > 0
    ? data.symptoms
        .map((s) => `- ${s.symptomName}: Severity = ${s.severity}, Frequency = ${s.frequency ?? 'unspecified'}`)
        .join('\n')
    : 'No active symptoms reported.'
}

=== LIFESTYLE & DAILY HABITS ===
Dietary Pattern: ${data.lifestyle?.dietType ?? 'Mixed'}
Fiber Intake: ${data.lifestyle?.fiberIntake ?? 'Moderate'}
Fermented Foods: ${data.lifestyle?.fermentedFoodIntake ?? 'Rarely'}
Probiotic Supplementation: ${data.lifestyle?.probioticSupplement ? 'Yes' : 'No'}
Physical Activity Level: ${data.lifestyle?.activityLevel ?? 'Sedentary'}
Sleep Duration: ${data.lifestyle?.sleepHours ? `${data.lifestyle.sleepHours} hours` : 'Not specified'} (Quality: ${data.lifestyle?.sleepQuality ?? 'Fair'})
Perceived Stress Level: ${data.lifestyle?.stressLevel ?? 'Moderate'}
Daily Water Intake: ${data.lifestyle?.waterIntake ? `${data.lifestyle.waterIntake} L` : 'Not specified'}

=== GUT & DIGESTIVE HEALTH ===
Bloating: ${data.gutHealth?.bloating ?? 'None'}
Constipation: ${data.gutHealth?.constipation ?? 'None'}
Diarrhea: ${data.gutHealth?.diarrhea ?? 'None'}
Abdominal Discomfort: ${data.gutHealth?.abdominalDiscomfort ?? 'None'}
Recent Antibiotic Exposure: ${data.gutHealth?.recentAntibiotics ? 'Yes' : 'No'}
Active Probiotic Use: ${data.gutHealth?.probioticUse ? 'Yes' : 'No'}
History of GI Disorder: ${data.gutHealth?.previousGIDisorder ? 'Yes' : 'No'}
Microbiome Data: ${data.gutHealth?.microbiomeData ? data.gutHealth.microbiomeData : 'Microbiome data not available.'}

=== DETERMINISTIC SAFETY ENGINE FLAGS ===
Pre-calculated Status: ${data.safetyFlags.deterministicStatus}
Pre-calculated Priority: ${data.safetyFlags.deterministicPriority}
Lab Critical Annotation Detected: ${data.safetyFlags.hasLabCriticalAnnotation ? 'YES' : 'NO'}
Out of Range Labs: ${data.safetyFlags.hasOutOfRangeLabs ? 'YES' : 'NO'}
Severe Symptoms Present: ${data.safetyFlags.hasSevereSymptoms ? 'YES' : 'NO'}
Identified Concerns: ${data.safetyFlags.concerningCombinations.join('; ') || 'None'}

=== REQUIRED JSON OUTPUT STRUCTURE ===
Return a JSON object conforming strictly to this format:
{
  "overall_status": "${data.safetyFlags.deterministicStatus}",
  "confidence": "high" | "moderate" | "low" | "provisional",
  "summary": "2-3 paragraph supportive summary describing pattern overview, gut-thyroid axis interactions, and priority focus areas.",
  "thyroid_pattern": "e.g., 'Laboratory pattern potentially consistent with mild/subclinical hypothyroid indicators' or 'Laboratory values within typical reported reference ranges' or 'Pattern consistent with elevated thyroid activity indicators'",
  "lab_interpretation": [
    {
      "test_name": "TSH",
      "patient_value": "9.89 µIU/mL",
      "reference_range": "0.33–6.30 µIU/mL",
      "clinical_significance": "Explain what this elevation or reduction means in the context of thyroid regulatory feedback loops without diagnosing.",
      "status": "Above reference range"
    }
  ],
  "key_observations": [
    "Observation 1 regarding lab patterns and symptoms",
    "Observation 2 regarding gut-thyroid axis connections",
    "Observation 3 regarding lifestyle and nutrition"
  ],
  "doctor_review": {
    "required": true,
    "priority": "${data.safetyFlags.deterministicPriority.toLowerCase()}",
    "reason": "Clear, professional explanation of why clinician review is recommended."
  },
  "diet": {
    "foods_to_include": [
      {
        "food_group": "Fiber & Prebiotic Rich Foods",
        "examples": ["Cooked oats", "Ground flaxseeds", "Stewed apples", "Berries"],
        "rationale": "Supports short-chain fatty acid (SCFA) production which nurtures gut barrier integrity and metabolic health."
      }
    ],
    "foods_to_limit": [
      {
        "food_group": "Ultra-processed & Inflammatory Foods",
        "examples": ["Refined sugars", "Excessive deep-fried items", "Artificial additives"],
        "rationale": "May exacerbate systemic inflammatory load and gastrointestinal dysbiosis."
      }
    ],
    "protein_guidance": "Personalized protein intake guidance suited to BMI and thyroid hormone conversion demands.",
    "fiber_guidance": "Stepwise fiber titration advice considering gut bloating or constipation symptoms.",
    "nutritional_considerations": [
      {
        "nutrient": "Selenium",
        "importance": "Essential cofactor for deiodinase enzymes (T4 to T3 conversion).",
        "dietary_sources": ["Brazil nuts (1-2/day)", "Sardines", "Eggs", "Sunflower seeds"],
        "caution_note": "Obtain primarily through food; discuss serum testing before high-dose supplementation."
      },
      {
        "nutrient": "Zinc",
        "importance": "Required for TSH synthesis and thyroid hormone receptor signaling.",
        "dietary_sources": ["Pumpkin seeds", "Lentils", "Chickpeas", "Lean poultry"],
        "caution_note": "Food sources are gentle; avoid excess supplemental zinc without physician oversight."
      }
    ]
  },
  "activity": {
    "recommendation": "Tailored, gentle movement recommendation suited to current fatigue/energy and fitness levels.",
    "goals": ["Consistent daily 20-30 min gentle walking", "Low-impact strength or yoga 2-3x weekly"],
    "things_to_avoid": ["Exhausting high-intensity interval training if severe fatigue is present"]
  },
  "daily_habits": {
    "sleep": "Actionable sleep hygiene tips tailored to reported sleep quality and fatigue.",
    "hydration": "Personalized daily fluid targets and electrolyte considerations.",
    "stress": "Vagus nerve and nervous system regulation practices (e.g. diaphragmatic breathing, mindfulness)."
  },
  "gut_thyroid_insights": [
    {
      "observation": "Reported bloating and constipation alongside elevated TSH.",
      "potential_mechanism": "Thyroid hormones modulate gastrointestinal motility; reduced thyroid activity can prolong transit time, altering microbiota balance.",
      "actionable_lifestyle_focus": "Gentle osmotic hydration, gradual soluble fiber increase, and warm herbal infusions."
    }
  ],
  "probiotic_prebiotic_candidates": [
    {
      "category": "Probiotic Candidate",
      "name": "Lactobacillus & Bifidobacterium multi-strain candidate",
      "rationale": "Strains supported by research for short-chain fatty acid synthesis and barrier support.",
      "safety_guidance": "Discuss with your healthcare provider before initiating, especially if experiencing active digestive distress."
    },
    {
      "category": "Prebiotic Candidate",
      "name": "Partially Hydrolyzed Guar Gum (PHGG) or Acacia Fiber",
      "rationale": "Gentle, non-bloating soluble fibers suitable for sensitive digestive tracts.",
      "safety_guidance": "Start at low doses to gauge tolerance."
    }
  ],
  "things_to_do": [
    "Follow your prescribed thyroid medication schedule strictly as directed by your physician.",
    "Take thyroid hormone on an empty stomach with water, separating from calcium/iron supplements by at least 4 hours.",
    "Maintain consistent sleep and hydration habits.",
    "Track energy levels and digestive symptoms in a journal.",
    "Schedule a follow-up consultation with your doctor to review these laboratory findings."
  ],
  "things_to_avoid": [
    "Do not stop, start, or change prescribed thyroid medications without direct medical authorization.",
    "Do not self-prescribe high-dose iodine or kelp supplements, as sudden iodine surges can aggravate thyroid dysfunction.",
    "Avoid extreme caloric restriction or sudden crash diets that can disrupt thyroid hormone conversion.",
    "Do not treat dietary or probiotic candidates as a substitute for medical treatment."
  ],
  "medical_disclaimer": "This report is generated for supportive educational and lifestyle purposes only and does NOT constitute a medical diagnosis or treatment plan. All laboratory tests and clinical symptoms must be evaluated by a licensed healthcare provider."
}
`
}
