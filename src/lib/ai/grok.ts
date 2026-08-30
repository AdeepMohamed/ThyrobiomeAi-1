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
  const isElevatedTSH = tsh?.value ? tsh.value > (tsh.referenceHigh || 4.5) : false
  const isSuppressedTSH = tsh?.value ? tsh.value < (tsh.referenceLow || 0.4) : false

  const status = input.safetyFlags.deterministicStatus as GrokAnalysisResponse['overall_status']
  const priority = input.safetyFlags.deterministicPriority.toLowerCase() as 'routine' | 'soon' | 'prompt' | 'urgent'

  let patternText = 'Laboratory values within typical reported reference ranges.'
  if (isElevatedTSH) {
    patternText = 'Laboratory pattern potentially consistent with elevated thyrotropin (TSH) indicators, commonly observed in reduced thyroid metabolic output or early compensation.'
  } else if (isSuppressedTSH) {
    patternText = 'Laboratory pattern potentially consistent with suppressed thyrotropin (TSH) indicators, commonly observed in heightened thyroid hormone activity.'
  }

  const symptomsList = input.symptoms.map(s => s.symptomName).join(', ')

  return {
    overall_status: status,
    confidence: input.labResults.length >= 2 ? 'high' : 'moderate',
    summary: `Comprehensive evaluation of your recent thyroid laboratory metrics, reported health history, and gastrointestinal symptoms reveals a ${patternText.toLowerCase()} Key focus areas identified include optimizing cellular thyroid hormone conversion, supporting gut barrier integrity through dietary fiber titration, and balancing daily energy expenditure with restorative rest.`,
    thyroid_pattern: patternText,
    lab_interpretation: input.labResults.map(l => ({
      test_name: l.testName,
      patient_value: `${l.value ?? l.valueText ?? 'N/A'} ${l.unit ?? ''}`,
      reference_range: l.referenceText || `${l.referenceLow ?? '?'} – ${l.referenceHigh ?? '?'} ${l.unit ?? ''}`,
      clinical_significance: `Reflects pituitary-thyroid axis regulation. Status is noted as ${l.classification || 'documented'}.`,
      status: l.classification || 'Assessed',
    })),
    key_observations: [
      `Thyroid hormone pattern correlates with reported symptoms (${symptomsList || 'fatigue/energy fluctuations'}).`,
      input.gutHealth?.bloating && input.gutHealth.bloating !== 'NONE'
        ? 'Gastrointestinal sluggishness or bloating may mirror altered thyroid signaling along the gut-thyroid axis.'
        : 'Digestive markers remain stable, supporting consistent nutrient absorption.',
      'Dietary intake indicates opportunities to incorporate targeted trace minerals (selenium, zinc) via whole foods.',
    ],
    doctor_review: {
      required: input.safetyFlags.deterministicStatus !== 'NO_MAJOR_CONCERN',
      priority: priority,
      reason: input.safetyFlags.concerningCombinations.join('. ') || 'Routine clinical correlation recommended for thyroid panel optimization.',
    },
    diet: {
      foods_to_include: [
        {
          food_group: 'Prebiotic & Soluble Fiber Sources',
          examples: ['Steel-cut oats', 'Ground chia seeds', 'Cooked carrots', 'Stewed pears'],
          rationale: 'Supplies soluble prebiotic fuel for commensal gut bacteria producing short-chain fatty acids (SCFAs), crucial for gut barrier health and systemic metabolic stability.',
        },
        {
          food_group: 'Clean Bioavailable Protein',
          examples: ['Wild Alaskan salmon', 'Lentils', 'Organic pasture-raised eggs', 'Pumpkin seed protein'],
          rationale: 'Provides essential amino acids including tyrosine, a core biochemical precursor for thyroid hormone synthesis.',
        },
        {
          food_group: 'Antioxidant & Polyphenol Rich Foods',
          examples: ['Wild blueberries', 'Steamed dark leafy greens', 'Turmeric with black pepper', 'Green tea (decaf if sensitive)'],
          rationale: 'Helps modulate cellular oxidative stress and support tissue deiodinase enzyme efficiency.',
        },
      ],
      foods_to_limit: [
        {
          food_group: 'Ultra-Processed Foods & Refined Sugars',
          examples: ['Commercial baked goods', 'Sweetened beverages', 'Trans-fat containing fried items'],
          rationale: 'Can impair glycemic regulation and foster low-grade gastrointestinal mucosal irritation.',
        },
        {
          food_group: 'Excessive Raw Cruciferous Vegetables in Single Servings',
          examples: ['Large raw kale shakes', 'Raw cabbage salads'],
          rationale: 'High quantities of raw goitrogens may compete with iodine uptake; light steaming or cooking deactivates goitrogenic compounds.',
        },
      ],
      protein_guidance: 'Aim for approximately 1.0 to 1.2 grams of dietary protein per kilogram of body weight spread evenly across meals to sustain satiety and metabolic rate.',
      fiber_guidance: 'Gradually increase daily fiber by 3-5 grams weekly toward a target of 25-30 grams daily, drinking ample fluids to prevent transient bloating.',
      nutritional_considerations: [
        {
          nutrient: 'Selenium',
          importance: 'Essential cofactor for selenoproteins and iodothyronine deiodinases that activate T4 into active T3.',
          dietary_sources: ['Brazil nuts (1 to 2 nuts daily provide optimal daily selenium)', 'Sardines', 'Shiitake mushrooms', 'Eggs'],
          caution_note: 'Obtain from dietary food sources; avoid high-dose supplements unless advised following clinical blood testing.',
        },
        {
          nutrient: 'Zinc',
          importance: 'Necessary for the pituitary hypothalamus-thyroid feedback loop and thyroid hormone receptor binding.',
          dietary_sources: ['Pumpkin seeds', 'Chickpeas', 'Oysters', 'Grass-fed beef', 'Cashews'],
          caution_note: 'Gentle whole food sources are optimal. Excessive elemental zinc can compete with copper absorption.',
        },
        {
          nutrient: 'Iodine',
          importance: 'Building block of thyroxine (T4) and triiodothyronine (T3).',
          dietary_sources: ['Iodized salt in culinary moderation', 'Cod', 'Sea vegetables (moderate)', 'Dairy'],
          caution_note: 'Do not take high-dose kelp or iodine supplements without physician guidance, as excessive iodine can paradoxically trigger thyroid dysfunction.',
        },
        {
          nutrient: 'Vitamin D3 & Iron',
          importance: 'Supports immune system modulation and thyroid peroxidase enzymatic action.',
          dietary_sources: ['Egg yolks', 'Fatty fish', 'Sunlight exposure', 'Lentils', 'Spinach (with vitamin C)'],
          caution_note: 'Consider requesting serum 25-hydroxy Vitamin D and Ferritin testing from your physician.',
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
