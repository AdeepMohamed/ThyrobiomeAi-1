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

=== CRITICAL DIRECTIVE FOR PERSONALIZED DIET GENERATION ===
The dietary guidance in "diet" MUST BE DEEPLY CUSTOMIZED to the patient's specific laboratory biomarkers, BMI, reported symptoms, gut profile, and grounded in authentic, wholesome South Indian cuisine:
1. Explicitly reference their laboratory findings in the rationales (e.g. "Because your TSH is elevated at [Value]...", "To support conversion of Free T4 to Free T3...", "Because Anti-TPO is elevated...").
2. Tailor protein, fiber, and micronutrient recommendations (Selenium, Zinc, Tyrosine, Iodine balance, Vitamin D3, Iron) to their exact hormone and digestive profile.
3. Feature authentic South Indian culinary examples:
   - Fermented gut-friendly staples (Ragi Idli, Pesarattu, Red Rice Puttu).
   - Micronutrient & mineral-dense curries and stews (Drumstick/Murungakkai Sambar, Ash Gourd Kootu, Kerala Kudampuli Fish Curry, Coconut Thoran).
   - Traditional digestive tonics (Probiotic Spiced Neer Mor / Buttermilk with ginger & curry leaves, Sukku Kaapi / dry ginger infusion, warm Garlic-Jeera Rasam).
   - Plant proteins & ancient grains (Sprouted Moong Sundal, Black Chickpea Kadala curry, Foxtail/Kodo Millets, Samba Wheat Upma).
4. If sluggish gut motility, constipation, or bloating is present, emphasize gentle soluble fibers (warm oats/pongal, stewed gourd kootu, buttermilk) and warm digestible spices (ginger, cumin, hing, black pepper).
5. If autoimmune indicators (Anti-TPO/Anti-TG) are present, emphasize mucosal gut integrity, anti-inflammatory polyphenols, and caution against excess iodine/kelp.
6. If thyroid medication (Levothyroxine, etc.) is listed, reinforce nutrient separation (separate calcium, iron, coffee, soy, and breakfast by 4 hours).

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
        "food_group": "Specific South Indian Food Group (e.g., Drumstick & Dal Sambars for Minerals, Fermented Ragi Idli & Pesarattu for Prebiotics/Tyrosine, Omega-3 Fish Curries, Probiotic Moru)",
        "examples": ["Specific traditional South Indian dishes with thyroid-supportive ingredients"],
        "rationale": "Direct biochemical mechanism connecting this South Indian food to the patient's specific lab biomarkers (TSH, FT4, FT3, etc.)."
      }
    ],
    "foods_to_limit": [
      {
        "food_group": "Specific Food Group to Limit (e.g., Raw Concentrated Brassica Goitrogens, Ultra-Processed Inflammatory Foods, Excess Iodine Supplements)",
        "examples": ["Specific food items to moderate"],
        "rationale": "Direct biochemical rationale explaining the interaction with thyroid hormone synthesis or intestinal permeability."
      }
    ],
    "protein_guidance": "Detailed protein intake target (e.g., 1.0-1.2g/kg based on BMI) and amino acid support (Tyrosine) for hormone synthesis.",
    "fiber_guidance": "Specific soluble vs insoluble fiber titration strategy suited to their reported gut transit and bloating levels.",
    "nutritional_considerations": [
      {
        "nutrient": "Selenium",
        "importance": "Essential cofactor for 5'-deiodinase enzymes that convert inactive T4 into active metabolic T3.",
        "dietary_sources": ["1-2 Brazil nuts daily", "Wild salmon", "Sardines", "Sunflower seeds"],
        "caution_note": "Obtain primarily through food sources; avoid high-dose standalone pills without serum testing."
      },
      {
        "nutrient": "Zinc",
        "importance": "Crucial for thyroid hormone receptor binding and pituitary TSH production.",
        "dietary_sources": ["Pumpkin seeds", "Lentils", "Chickpeas", "Pasture-raised poultry"],
        "caution_note": "Gentle food sources are optimal; excess elemental zinc can deplete copper."
      },
      {
        "nutrient": "Iodine (Balanced)",
        "importance": "Essential structural component of thyroid hormones (T3/T4).",
        "dietary_sources": ["Moderate iodized salt", "Marine fish", "Eggs"],
        "caution_note": "Avoid high-dose kelp/seaweed pills which can trigger autoimmune thyroid flares."
      },
      {
        "nutrient": "Vitamin D3 & Iron / Ferritin",
        "importance": "Cofactors for thyroid peroxidase enzyme function and systemic cellular energy.",
        "dietary_sources": ["Egg yolks", "Grass-fed beef or lentils with vitamin C", "Safe sunlight exposure"],
        "caution_note": "Request comprehensive serum 25-OH Vitamin D and Ferritin checks from your physician."
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
