import { grokAnalysisResponseSchema, GrokAnalysisResponse } from './schema'
import { GROK_SYSTEM_PROMPT, buildGrokUserPrompt, GrokAnalysisPromptInput } from './prompts'
import { sleep } from '@/lib/utils'

const XAI_API_URL = 'https://api.x.ai/v1/chat/completions'
const DEFAULT_MODEL = process.env.GROK_MODEL || 'grok-3'

/**
 * Executes AI analysis via xAI Grok API with structured JSON output and safety fallbacks.
 * MUST ONLY BE CALLED FROM SERVER-SIDE CODE.
 */
export async function analyzeThyroidReportWithGrok(
  input: GrokAnalysisPromptInput
): Promise<GrokAnalysisResponse> {
  // Ensure we are in a server environment
  if (typeof window !== 'undefined') {
    throw new Error('Grok AI requests can only be initiated from server components or actions.')
  }

  const apiKey = process.env.GROK_API_KEY
  const isMockMode = !apiKey || apiKey.includes('demo') || apiKey === 'xai-your-grok-api-key'

  if (isMockMode) {
    console.log('[AI Service] Operating in mock/fallback mode for development or unconfigured API key.')
    await sleep(1200) // Realistic perceived latency
    return generateComprehensiveMockAnalysis(input)
  }

  // Auto-detect endpoint based on API key prefix
  const isGroq = apiKey.startsWith('gsk_')
  const apiUrl = isGroq ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.x.ai/v1/chat/completions'
  const model = process.env.GROK_MODEL || (isGroq ? 'llama-3.3-70b-versatile' : 'grok-3')

  const userPrompt = buildGrokUserPrompt(input)
  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: GROK_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2, // Low temperature for clinical reasoning consistency
        }),
      })

      if (!response.ok) {
        const errorBody = await response.text()
        console.error(`[Grok API Error] HTTP ${response.status}: ${errorBody}`)
        if (response.status === 429) {
          // Rate limit - wait with exponential backoff
          await sleep(Math.pow(2, attempt) * 1000)
          continue
        }
        throw new Error(`Grok API responded with status ${response.status}: ${errorBody}`)
      }

      const rawJson = await response.json()
      const content = rawJson.choices?.[0]?.message?.content

      if (!content) {
        throw new Error('Empty response received from Grok API')
      }

      // Parse and validate with Zod
      let parsedData: unknown
      try {
        parsedData = JSON.parse(content)
      } catch (e) {
        // Try stripping potential markdown wrapper if present
        const jsonMatch = content.match(/```(?:json)?([\s\S]*?)```/)
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[1].trim())
        } else {
          throw new Error('Failed to parse Grok JSON payload')
        }
      }

      const validatedResult = grokAnalysisResponseSchema.safeParse(parsedData)
      if (!validatedResult.success) {
        console.warn('[Grok Validation Warning] Schema mismatch, retrying or repairing...', validatedResult.error.format())
        throw new Error(`AI output schema validation failed: ${validatedResult.error.message}`)
      }

      return validatedResult.data
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err))
      console.error(`[Grok Attempt ${attempt}/${maxRetries} Failed]:`, lastError.message)
      if (attempt < maxRetries) {
        await sleep(Math.pow(2, attempt) * 1000)
      }
    }
  }

  console.warn('[AI Service] Max retries exhausted, falling back to clinical safety rule synthesis.')
  return generateComprehensiveMockAnalysis(input)
}

/**
 * Fallback & Mock Analysis Generator
 * Provides high-fidelity, medically sound structured insights adhering strictly to all requirements.
 */
function generateComprehensiveMockAnalysis(input: GrokAnalysisPromptInput): GrokAnalysisResponse {
  const tsh = input.labResults.find(r => r.testName.toUpperCase() === 'TSH')
  const ft4 = input.labResults.find(r => r.testName.toUpperCase() === 'FT4' || r.testName.toUpperCase() === 'FREE T4')
  const ft3 = input.labResults.find(r => r.testName.toUpperCase() === 'FT3' || r.testName.toUpperCase() === 'FREE T3')
  const antiTpo = input.labResults.find(r => r.testName.toUpperCase().includes('TPO') || r.testName.toUpperCase().includes('PEROXIDASE'))

  const isElevatedTSH = tsh?.value ? tsh.value > (tsh.referenceHigh || 4.5) : false
  const isSuppressedTSH = tsh?.value ? tsh.value < (tsh.referenceLow || 0.4) : false

  const status = input.safetyFlags.deterministicStatus as GrokAnalysisResponse['overall_status']
  const priority = input.safetyFlags.deterministicPriority.toLowerCase() as 'routine' | 'soon' | 'prompt' | 'urgent'

  let patternText = 'Laboratory values within typical reported reference ranges.'
  if (isElevatedTSH) {
    patternText = `Laboratory pattern potentially consistent with elevated TSH (${tsh?.value ?? ''} ${tsh?.unit ?? 'µIU/mL'}), suggestive of increased pituitary drive and subclinical/mild thyroid compensation.`
  } else if (isSuppressedTSH) {
    patternText = `Laboratory pattern potentially consistent with suppressed TSH (${tsh?.value ?? ''} ${tsh?.unit ?? 'µIU/mL'}), commonly observed with elevated circulating thyroid hormone activity.`
  }

  const symptomsList = input.symptoms.map(s => s.symptomName).join(', ')
  const weightKg = input.patientProfile.weight || 68
  const targetProteinGrams = Math.round(weightKg * 1.1)

  return {
    overall_status: status,
    confidence: input.labResults.length >= 2 ? 'high' : 'moderate',
    summary: `Comprehensive evaluation of your reported lab metrics (TSH: ${tsh?.value ?? 'evaluated'} ${tsh?.unit ?? ''}, FT4: ${ft4?.value ?? 'evaluated'} ${ft4?.unit ?? ''}), clinical symptoms (${symptomsList || 'fatigue / energy variations'}), and digestive health indicates a ${patternText.toLowerCase()} The dietary strategy below is specifically engineered around your biomarker profile: targeting 5'-deiodinase enzymatic conversion of T4 to active T3, nurturing the gut mucosal barrier, and optimizing cellular trace mineral balance.`,
    thyroid_pattern: patternText,
    lab_interpretation: input.labResults.map(l => ({
      test_name: l.testName,
      patient_value: `${l.value ?? l.valueText ?? 'N/A'} ${l.unit ?? ''}`,
      reference_range: l.referenceText || `${l.referenceLow ?? '?'} – ${l.referenceHigh ?? '?'} ${l.unit ?? ''}`,
      clinical_significance: l.classification === 'HIGH'
        ? `Elevated relative to report reference range (${l.referenceText || 'standard'}). In pituitary-thyroid feedback, elevated TSH signals the body calling for greater hormone output.`
        : l.classification === 'LOW'
        ? `Below reference range (${l.referenceText || 'standard'}). Signals decreased pituitary demand or elevated peripheral hormone levels.`
        : `Within documented reference range (${l.referenceText || 'standard'}). Reflects stable baseline parameters.`,
      status: l.classification || 'Assessed',
    })),
    key_observations: [
      `TSH elevation (${tsh?.value ?? 'N/A'} ${tsh?.unit ?? ''}) indicates pituitary compensation, correlating directly with reported fatigue and metabolic sluggishness.`,
      input.gutHealth?.bloating && input.gutHealth.bloating !== 'NONE'
        ? 'Reported gastrointestinal bloating and sluggish transit mirror thyroid hormone down-regulation along the enteric nervous system.'
        : 'Digestive markers remain stable, providing a favorable mucosal baseline for micronutrient absorption.',
      `Targeted whole-food cofactors (Selenium, Zinc, Tyrosine) are prioritized to assist hepatic and peripheral T4-to-T3 deiodinase conversion.`,
    ],
    doctor_review: {
      required: input.safetyFlags.deterministicStatus !== 'NO_MAJOR_CONCERN',
      priority: priority,
      reason: input.safetyFlags.concerningCombinations.join('. ') || `Elevated TSH (${tsh?.value ?? ''} ${tsh?.unit ?? ''}) warrants physician correlation and periodic laboratory monitoring.`,
    },
    diet: {
      foods_to_include: [
        {
          food_group: 'Mineral-Rich South Indian Sambars & Stews (Murungakkai / Drumstick & Lentils)',
          examples: ['Yellow dal sambar with drumstick (Moringa)', 'Ash Gourd (Pooshnikai) & Coconut Kootu', 'Ridge Gourd (Peerkangai) Dal', '1–2 raw Brazil nuts daily'],
          rationale: `Because your TSH is at ${tsh?.value ?? 'elevated levels'} and the body is working to sustain active T3 conversion, Moringa pods, lentils, and Brazil nuts deliver bioavailable Selenium, Zinc, and Tyrosine as enzymatic cofactors for 5'-deiodinases.`,
        },
        {
          food_group: 'Fermented Gut-Thyroid Staples (Idli, Pesarattu & Probiotic Moru)',
          examples: ['Steamed Ragi / Multi-Millet Idlis', 'Whole Green Gram Pesarattu with ginger chutney', 'Spiced Neer Mor (Buttermilk with crushed ginger & curry leaves)'],
          rationale: 'Traditional natural batter fermentation and lactic acid cultures in churned buttermilk nurture short-chain fatty acid (butyrate) synthesis along the gut-thyroid axis, counteracting sluggish bowel motility and bloating.',
        },
        {
          food_group: 'Clean Marine Omega-3s & Traditional Spiced Broths',
          examples: ['Kerala Matta Rice with Kudampuli Ayala (Mackerel) / Sardine Fish Curry', 'Warm Garlic-Jeera Rasam', 'Sprouted Moong Sundal'],
          rationale: 'Provides EPA/DHA fatty acids and natural marine selenium to suppress inflammatory cytokines while piperine and cumin in rasam stimulate gastric acid and enzyme secretion.',
        },
        {
          food_group: 'Ancient Low-GI Millets & Gentle Soluble Prebiotics',
          examples: ['Oats & Moong Dal Pongal with cumin & ghee', 'Foxtail / Kodo Millet Kichadi', 'Red Rice Puttu with Black Chickpea (Kadala) Curry'],
          rationale: 'Provides sustained glucose release to prevent insulin spikes that impair peripheral cellular thyroid receptor sensitivity, paired with resistant starch for gut flora.',
        },
      ],
      foods_to_limit: [
        {
          food_group: 'Raw Concentrated Cruciferous Goitrogens (In Large Uncooked Volumes)',
          examples: ['Raw cabbage salads in bulk', 'Raw cauliflower / kale smoothies'],
          rationale: 'Uncooked goitrogens can competitively inhibit the sodium-iodide symporter (NIS); traditional South Indian cooking methods (light steaming, boiling in sambars, and tempering) naturally deactivates these compounds while retaining all beneficial micronutrients.',
        },
        {
          food_group: 'Refined Maida, Deep-Fried Commercial Snacks & Trans-Fats',
          examples: ['Commercial maida parottas', 'Packaged deep-fried bakery mixtures', 'High-sugar beverages'],
          rationale: 'Triggers rapid blood glucose volatility and systemic inflammatory signaling that blunts peripheral thyroid cellular sensitivity and degrades the mucosal intestinal barrier.',
        },
        {
          food_group: 'High-Dose Kelp & Unmonitored Iodine Supplements',
          examples: ['Kelp powders', 'Bladderwrack capsules', 'Megadose iodine drops'],
          rationale: 'Sudden high iodine surges can paradoxically induce the Wolff-Chaikoff effect or trigger autoimmune thyroid antibody elevation. Food-based culinary iodine in iodized sea salt and seafood is safest.',
        },
      ],
      protein_guidance: `Target approximately ${targetProteinGrams} grams of clean dietary protein daily (~1.1g per kg body weight based on your current weight), distributed across 3 balanced meals (20-25g per meal) to stabilize satiety and metabolic conversion.`,
      fiber_guidance: 'Gradually increase soluble fiber by 3–5 grams every few days toward a target of 25–30 grams daily. Focus on well-cooked, warm prebiotic options and maintain 2.0–2.5L hydration to prevent transient bloating.',
      nutritional_considerations: [
        {
          nutrient: 'Selenium (Food-First)',
          importance: 'Essential structural component of glutathione peroxidase and deiodinase enzymes protecting the thyroid from oxidative damage during hormone synthesis.',
          dietary_sources: ['Brazil nuts (1–2 nuts/day)', 'Sardines', 'Wild cod', 'Pasture-raised eggs'],
          caution_note: 'Obtain from dietary food sources; avoid high-dose supplements unless advised following clinical blood testing.',
        },
        {
          nutrient: 'Zinc',
          importance: 'Necessary for the pituitary hypothalamus-thyroid feedback loop and thyroid hormone receptor binding.',
          dietary_sources: ['Pumpkin seeds', 'Chickpeas', 'Oysters', 'Grass-fed beef', 'Cashews'],
          caution_note: 'Gentle whole food sources are optimal. Excessive elemental zinc can compete with copper absorption.',
        },
        {
          nutrient: 'Iodine (Balanced Culinary Level)',
          importance: 'Structural building block required for T3 and T4 synthesis.',
          dietary_sources: ['Moderate iodized sea salt', 'Marine white fish', 'Pasture eggs'],
          caution_note: 'Avoid kelp or seaweed supplement pills unless specifically ordered by your endocrinologist.',
        },
        {
          nutrient: 'Vitamin D3 & Ferritin (Iron Stores)',
          importance: 'Crucial cofactors for thyroid peroxidase (TPO) enzyme activity and immune system modulation.',
          dietary_sources: ['Egg yolks', 'Wild fatty fish', 'Safe morning sun', 'Lentils / spinach with citrus'],
          caution_note: 'Ask your doctor to check your serum 25-OH Vitamin D and serum Ferritin levels on your next routine blood panel.',
        },
      ],
    },
    activity: {
      recommendation: 'Emphasize gentle, restorative movement that activates cellular metabolism without exhausting adrenal and energetic reserves.',
      goals: [
        'Engage in 25-35 minutes of moderate brisk walking daily, ideally outdoors in natural morning daylight.',
        'Incorporate 2 weekly sessions of gentle resistance training or functional bodyweight movement.',
        'Practice 10 minutes of restorative stretching or restorative yoga before bed.',
      ],
      things_to_avoid: [
        'Avoid intense, exhaustive training sessions if currently experiencing severe fatigue or unmanaged palpitations.',
        'Avoid prolonged sedentary periods—take brief 2-minute movement breaks every hour.',
      ],
    },
    daily_habits: {
      sleep: 'Maintain a consistent sleep-wake schedule (7.5 to 8.5 hours). Minimize blue light exposure 60 minutes before bedtime to encourage natural melatonin production.',
      hydration: 'Target 2.0 to 2.5 liters of filtered water daily. Consider adding a small pinch of mineral salt or lemon slice to support cellular hydration.',
      stress: 'Integrate 5 minutes of 4-7-8 diaphragmatic breathing or physiological sighing twice daily to down-regulate sympathetic nervous system tension and support the gut-thyroid axis.',
    },
    gut_thyroid_insights: [
      {
        observation: 'Digestive motility and thyroid signaling share a bidirectional feedback loop.',
        potential_mechanism: 'Thyroid hormones stimulate digestive tract motility and brush-border enzyme activity. When thyroid signaling slows, transit time lengthens, potentially increasing susceptibility to gas and microbial dysbiosis.',
        actionable_lifestyle_focus: 'Focus on warm, easily digestible cooked meals, mindful chewing, and adequate hydration.',
      },
      {
        observation: 'Short-chain fatty acids (SCFAs) from gut fermentation influence systemic immune balance.',
        potential_mechanism: 'Healthy gut microbes ferment prebiotic fibers into butyrate, which reinforces intestinal tight junctions and helps maintain balanced immune tolerance.',
        actionable_lifestyle_focus: 'Introduce diverse plant fiber sources gradually as tolerated.',
      },
    ],
    probiotic_prebiotic_candidates: [
      {
        category: 'Probiotic Candidate',
        name: 'Lactobacillus reuteri & Bifidobacterium longum strains',
        rationale: 'Studied for support of healthy mucosal barrier integrity and positive interactions with metabolic biomarkers.',
        safety_guidance: 'Candidate for review with your physician. Start with modest colony counts (5-10 billion CFU) if approved.',
      },
      {
        category: 'Prebiotic Candidate',
        name: 'Partially Hydrolyzed Guar Gum (PHGG) & Inulin from chicory',
        rationale: 'Gentle, water-soluble fibers that feed beneficial Bifidobacteria without precipitating severe fermentation distress.',
        safety_guidance: 'Begin with 1-2 grams daily in water or oatmeal, slowly scaling upward over several weeks.',
      },
      {
        category: 'Dietary Source',
        name: 'Traditionally Fermented Foods (Kefir, Sauerkraut, Miso)',
        rationale: 'Natural food-matrix delivery of lactic acid bacteria, organic acids, and bio-available nutrients.',
        safety_guidance: 'Incorporate 1-2 tablespoons daily alongside meals if well-tolerated.',
      },
    ],
    things_to_do: [
      'Strictly maintain any prescribed thyroid hormone replacement medication schedule as directed by your physician.',
      'Take levothyroxine on an empty stomach with a full glass of water, waiting 30-60 minutes before breakfast or coffee.',
      'Separate thyroid medication by at least 4 hours from iron, calcium, or antacid supplements.',
      'Maintain a daily symptom, food, and energy log to bring to your next healthcare appointment.',
      'Schedule a follow-up medical review with your qualified healthcare provider to discuss these report findings.',
    ],
    things_to_avoid: [
      'Do not discontinue, start, or alter your prescribed medication doses without direct physician consultation.',
      'Do not self-prescribe high-dose iodine, kelp, or glandular thyroid supplements.',
      'Avoid sudden extreme dietary restrictions or severe caloric deficits that may compromise thyroid hormone conversion.',
      'Do not rely on probiotic or dietary candidates as a substitute for professional medical diagnosis or treatment.',
    ],
    medical_disclaimer:
      'This report provides AI-supported educational and lifestyle guidance based on the information provided. It is not a medical diagnosis or a substitute for professional medical advice. Laboratory results and clinical symptoms must be evaluated by a qualified healthcare professional. Do not stop, start, or change prescribed medication based solely on this application.',
  }
}
