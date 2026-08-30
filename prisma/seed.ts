import { PrismaClient, UserRole, Sex, Severity, Frequency, ActivityLevel, StressLevel, SleepQuality, DietType, LabClassification, UploadStatus, ExtractionStatus, AnalysisStatus, OverallStatus, ReviewPriority } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database with production demo data...')

  const defaultPassword = await bcrypt.hash('password123', 12)

  // 1. Create Demo Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Dr. Sarah Jenkins (Admin)',
      email: 'admin@example.com',
      hashedPassword: defaultPassword,
      role: UserRole.ADMIN,
      adminProfile: {
        create: {
          department: 'Clinical Operations & Quality Assurance',
        },
      },
    },
  })
  console.log(`Created admin user: ${adminUser.email}`)

  // 2. Create Demo Patient
  const patientUser = await prisma.user.upsert({
    where: { email: 'patient@example.com' },
    update: {},
    create: {
      name: 'Elena Rostova',
      email: 'patient@example.com',
      hashedPassword: defaultPassword,
      role: UserRole.PATIENT,
      patientProfile: {
        create: {
          age: 43,
          sex: Sex.FEMALE,
          height: 160,
          weight: 68,
          bmi: 26.6,
          phone: '+1 (555) 234-5678',
          address: '450 Health Avenue, Suite 12B, Boston, MA',
          medicalHistory: {
            create: {
              thyroidCondition: 'HYPOTHYROIDISM',
              familyHistory: true,
              familyHistoryDetails: 'Maternal grandmother had diagnosed thyroid enlargement (goitre).',
              otherConditions: 'Mild iron deficiency in past history.',
            },
          },
          lifestyleProfile: {
            create: {
              dietType: DietType.MIXED,
              fiberIntake: Frequency.RARELY,
              fermentedFoodIntake: Frequency.RARELY,
              probioticSupplement: false,
              activityLevel: ActivityLevel.SEDENTARY,
              sleepHours: 6.5,
              sleepQuality: SleepQuality.FAIR,
              stressLevel: StressLevel.MODERATE,
              waterIntake: 1.5,
            },
          },
          gutHealthProfile: {
            create: {
              bloating: Severity.MODERATE,
              constipation: Severity.MILD,
              diarrhea: Severity.NONE,
              abdominalDiscomfort: Severity.MILD,
              recentAntibiotics: false,
              probioticUse: false,
              previousGIDisorder: false,
              stoolSampleAvailable: false,
              notes: 'Experiences post-prandial sluggishness and abdominal fullness.',
            },
          },
        },
      },
    },
    include: {
      patientProfile: true,
    },
  })

  const patientProfileId = patientUser.patientProfile!.id

  // Add symptoms for demo patient
  await prisma.patientSymptom.createMany({
    data: [
      {
        patientProfileId,
        symptomName: 'Fatigue & Low Morning Energy',
        severity: Severity.MODERATE,
        frequency: Frequency.OFTEN,
      },
      {
        patientProfileId,
        symptomName: 'Unexplained Weight Gain',
        severity: Severity.MODERATE,
        frequency: Frequency.ALWAYS,
      },
      {
        patientProfileId,
        symptomName: 'Hair Thinning / Dry Hair',
        severity: Severity.MILD,
        frequency: Frequency.SOMETIMES,
      },
      {
        patientProfileId,
        symptomName: 'Cold Intolerance (Cold hands/feet)',
        severity: Severity.MILD,
        frequency: Frequency.OFTEN,
      },
    ],
  })

  // Add active medications
  await prisma.medication.create({
    data: {
      patientProfileId,
      name: 'Levothyroxine Sodium',
      dosage: '50 mcg',
      frequency: 'Once daily (morning fasting)',
      isActive: true,
      notes: 'Taken 30 min before breakfast with water',
    },
  })

  // Create Demo Uploaded Report
  const sampleReport = await prisma.medicalReport.create({
    data: {
      patientProfileId,
      fileName: 'Quest_Diagnostics_Thyroid_Panel_2026.pdf',
      fileUrl: '/uploads/sample_report.pdf',
      fileType: 'pdf',
      fileSize: 245000,
      uploadStatus: UploadStatus.UPLOADED,
      extractionStatus: ExtractionStatus.COMPLETED,
      analysisStatus: AnalysisStatus.COMPLETED,
      extractedText: `QUEST DIAGNOSTICS - CLINICAL REPORT\nPATIENT: ELENA ROSTOVA | AGE: 43 | SEX: F\nTEST: TSH, 3RD GENERATION | RESULT: 9.89 uIU/mL | REF RANGE: 0.33 - 6.30 uIU/mL | STATUS: HIGH\nTEST: FREE T4 | RESULT: 1.10 ng/dL | REF RANGE: 0.80 - 1.80 ng/dL | STATUS: NORMAL\nTEST: FREE T3 | RESULT: 2.80 pg/mL | REF RANGE: 2.30 - 4.20 pg/mL | STATUS: NORMAL`,
      verifiedAt: new Date(),
    },
  })

  // Add Lab Results
  await prisma.labResult.createMany({
    data: [
      {
        reportId: sampleReport.id,
        testName: 'TSH',
        testAlias: 'TSH',
        value: 9.89,
        valueText: '9.89',
        unit: 'µIU/mL',
        referenceLow: 0.33,
        referenceHigh: 6.30,
        referenceText: '0.33 – 6.30',
        classification: LabClassification.HIGH,
        criticalFlag: false,
        extractedByAI: true,
        patientVerified: true,
      },
      {
        reportId: sampleReport.id,
        testName: 'Free T4',
        testAlias: 'FT4',
        value: 1.10,
        valueText: '1.10',
        unit: 'ng/dL',
        referenceLow: 0.80,
        referenceHigh: 1.80,
        referenceText: '0.80 – 1.80',
        classification: LabClassification.NORMAL,
        criticalFlag: false,
        extractedByAI: true,
        patientVerified: true,
      },
      {
        reportId: sampleReport.id,
        testName: 'Free T3',
        testAlias: 'FT3',
        value: 2.80,
        valueText: '2.80',
        unit: 'pg/mL',
        referenceLow: 2.30,
        referenceHigh: 4.20,
        referenceText: '2.30 – 4.20',
        classification: LabClassification.NORMAL,
        criticalFlag: false,
        extractedByAI: true,
        patientVerified: true,
      },
    ],
  })

  // Add Pre-generated Demo AI Analysis
  const sampleAIAnalysis = await prisma.aIAnalysis.create({
    data: {
      patientProfileId,
      reportId: sampleReport.id,
      modelName: 'grok-3',
      promptVersion: '1.0',
      overallStatus: OverallStatus.MEDICAL_REVIEW_RECOMMENDED,
      doctorReviewRequired: true,
      reviewPriority: ReviewPriority.PROMPT,
      reviewReason: 'TSH value (9.89 µIU/mL) is elevated above the patient report reference range (0.33–6.30 µIU/mL) alongside reported fatigue and weight gain symptoms.',
      summary: 'Evaluation of the uploaded thyroid panel indicates elevated thyrotropin (TSH: 9.89 µIU/mL) with preserved peripheral thyroid hormone levels (FT4: 1.10 ng/dL, FT3: 2.80 pg/mL). This biochemical configuration, alongside symptoms of fatigue and weight gain, is characteristic of an early or subclinical hypothyroid pattern requiring physician correlation. Supportive gut-thyroid axis modulation via gradual fiber titration and selenium-rich whole foods is recommended.',
      thyroidPattern: 'Laboratory pattern potentially consistent with elevated thyrotropin (TSH) with normal circulating Free T4/Free T3.',
      confidence: 'high',
      analysisStatus: AnalysisStatus.COMPLETED,
      analysisJson: {
        summary: 'Evaluation of the uploaded thyroid panel indicates elevated thyrotropin (TSH: 9.89 µIU/mL) with preserved peripheral thyroid hormone levels (FT4: 1.10 ng/dL, FT3: 2.80 pg/mL). This biochemical configuration, alongside symptoms of fatigue and weight gain, is characteristic of an early or subclinical hypothyroid pattern requiring physician correlation.',
        thyroid_pattern: 'Laboratory pattern potentially consistent with elevated thyrotropin (TSH) with normal circulating Free T4/Free T3.',
        confidence: 'high',
        key_observations: [
          'TSH elevation (9.89 µIU/mL vs ref: 0.33-6.30) signals pituitary compensation and thyroid metabolic sluggishness.',
          'Preserved Free T4 (1.10 ng/dL) and Free T3 (2.80 pg/mL) indicate peripheral conversion is functional but under elevated pituitary drive.',
          'Reported moderate fatigue, weight gain, and digestive bloating correlate with metabolic and enteric down-regulation.',
        ],
        doctor_review: {
          required: true,
          priority: 'prompt',
          reason: 'TSH elevation (9.89 µIU/mL) above printed reference range (0.33–6.30) requires clinical follow-up for medication titration assessment.',
        },
        diet: {
          foods_to_include: [
            {
              food_group: 'Selenium & Zinc Rich Foods (5\'-Deiodinase Conversion)',
              examples: ['1–2 Brazil nuts daily (~100-150mcg food selenium)', 'Wild Alaskan salmon', 'Raw pumpkin seeds', 'Sunflower seeds'],
              rationale: 'Because your TSH is elevated at 9.89 µIU/mL, selenium and zinc serve as indispensable mineral cofactors for 5\'-deiodinase enzymes converting T4 to active T3.',
            },
            {
              food_group: 'Gentle Prebiotic Soluble Fibers (Gut-Thyroid Axis & Motility)',
              examples: ['Warm steel-cut oats', 'Cooked chia pudding', 'Stewed cinnamon apples (rich in pectin)', 'Cooked squashes'],
              rationale: 'Nurtures butyrate-producing commensal bacteria along the gut-thyroid axis, counteracting sluggish bowel motility and bloating without irritating sensitive digestive lining.',
            },
            {
              food_group: 'Clean Tyrosine-Dense Proteins',
              examples: ['Pasture-raised poultry', 'Lentils', 'Organic eggs', 'Tempeh / Hemp hearts'],
              rationale: 'Provides L-Tyrosine, the core amino acid backbone that binds with iodine inside thyroid follicular cells to synthesize thyroglobulin.',
            },
            {
              food_group: 'Anti-Inflammatory Polyphenols & Mucosal Tonics',
              examples: ['Wild blueberries', 'Steamed spinach with lemon', 'Turmeric and ginger tea', 'Bone broth / mineral vegetable broth'],
              rationale: 'Helps modulate cellular oxidative stress and fortify intestinal tight junctions against low-grade endotoxemia.',
            },
          ],
          foods_to_limit: [
            {
              food_group: 'Raw Concentrated Brassica Goitrogens (In Bulk Raw Form)',
              examples: ['Large raw kale smoothies', 'Raw bulk cabbage / broccoli salads'],
              rationale: 'Uncooked goitrogens can competitively inhibit the sodium-iodide symporter (NIS); light steaming or sautéing naturally deactivates goitrogenic compounds while preserving micronutrients.',
            },
            {
              food_group: 'High-Dose Kelp & Unmonitored Iodine Supplements',
              examples: ['Kelp powder pills', 'Bladderwrack capsules', 'Iodine drops'],
              rationale: 'Sudden high iodine surges can paradoxically suppress thyroid hormone synthesis (Wolff-Chaikoff effect) or trigger autoimmune flares. Food-based culinary iodine is safest.',
            },
            {
              food_group: 'Ultra-Processed Refined Sugars & Commercial Trans-Fats',
              examples: ['Commercial baked goods', 'High-fructose corn syrup beverages', 'Deep-fried commercial snacks'],
              rationale: 'Triggers rapid blood glucose swings and systemic inflammatory signaling that can blunt peripheral cellular thyroid receptor sensitivity.',
            },
          ],
          protein_guidance: 'Target approximately 75g clean dietary protein daily (~1.1g per kg body weight based on your 68kg weight), distributed across 3 balanced meals (20-25g per meal) to stabilize satiety and metabolic conversion.',
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
        probiotic_prebiotic_candidates: [
          {
            category: 'Probiotic Candidate',
            name: 'Lactobacillus reuteri & Bifidobacterium longum multi-strain',
            rationale: 'Studied for support of healthy mucosal barrier integrity and positive interactions with metabolic biomarkers along the gut-thyroid axis.',
            safety_guidance: 'Candidate for review with your physician. Start with modest colony counts (5-10 billion CFU) if approved.',
          },
          {
            category: 'Prebiotic Candidate',
            name: 'Partially Hydrolyzed Guar Gum (PHGG) & Acacia Fiber',
            rationale: 'Gentle, water-soluble prebiotic fibers that nourish butyrate-producing commensals without causing excess gas or fermentation.',
            safety_guidance: 'Introduce gradually starting with 1g daily in warm water.',
          },
          {
            category: 'Dietary Source',
            name: 'Traditionally Fermented Foods (Miso, Coconut/Dairy Kefir)',
            rationale: 'Provides organic acids and live beneficial bacteria in a whole-food matrix.',
            safety_guidance: 'Introduce 1-2 tablespoons daily alongside meals.',
          },
        ],
        things_to_do: [
          'Follow your prescribed thyroid hormone medication schedule strictly as directed by your physician.',
          'Take thyroid medication on an empty stomach with a full glass of water, waiting 30-60 minutes before food or coffee.',
          'Separate thyroid hormone replacement by at least 4 hours from iron, calcium, or high-fiber supplements.',
          'Maintain consistent sleep, osmotic hydration, and gentle daily physical activity.',
          'Schedule a follow-up appointment with your doctor to review these laboratory findings.',
        ],
        things_to_avoid: [
          'Do not stop, start, or modify prescribed thyroid medication without explicit medical advice.',
          'Do not self-adjust medication dosage based on AI output or internet advice.',
          'Avoid excessive intake of high-dose iodine or kelp supplements without clinical laboratory confirmation.',
          'Do not rely on probiotic or dietary supplements as a substitute for prescribed thyroid medical care.',
          'Avoid extreme restrictive crash diets that can disrupt peripheral T4 to T3 deiodinase conversion.',
        ],
      },
    },
  })

  // Add recommendations
  await prisma.aIRecommendation.createMany({
    data: [
      {
        analysisId: sampleAIAnalysis.id,
        category: 'diet_include',
        title: 'Selenium & Zinc Rich Whole Foods',
        description: '1-2 Brazil nuts daily, pumpkin seeds, wild salmon, and sprouted lentils to supply cofactors for 5\'-deiodinase enzymes.',
      },
      {
        analysisId: sampleAIAnalysis.id,
        category: 'diet_include',
        title: 'Soluble Prebiotic Fiber',
        description: 'Cooked steel-cut oats, stewed apples, and chia pudding to gently support short-chain fatty acid producing gut flora.',
      },
      {
        analysisId: sampleAIAnalysis.id,
        category: 'diet_limit',
        title: 'Raw Concentrated Goitrogens',
        description: 'Avoid raw cruciferous green smoothies; consume steamed or cooked broccoli, kale, and cauliflower instead.',
      },
      {
        analysisId: sampleAIAnalysis.id,
        category: 'things_to_do',
        title: 'Medication Timing Optimization',
        description: 'Take Levothyroxine with water 30-60 minutes before morning meals; avoid taking calcium or iron within 4 hours.',
      },
      {
        analysisId: sampleAIAnalysis.id,
        category: 'things_to_do',
        title: 'Schedule Doctor Review',
        description: 'Share this report and your recent symptom journal with your endocrinologist or primary care physician.',
      },
      {
        analysisId: sampleAIAnalysis.id,
        category: 'things_to_avoid',
        title: 'Medication Self-Adjustment',
        description: 'Do not alter or discontinue thyroid hormone replacement doses without direct physician guidance.',
      },
    ],
  })

  // Add Safety Alert
  await prisma.safetyAlert.create({
    data: {
      patientProfileId,
      reportId: sampleReport.id,
      alertType: 'ABNORMAL_LAB_PATTERN',
      alertStatus: 'NEW',
      reason: 'TSH value (9.89 µIU/mL) exceeds upper laboratory reference limit (6.30 µIU/mL).',
      details: {
        tshValue: 9.89,
        referenceHigh: 6.30,
        patientName: 'Elena Rostova',
      },
    },
  })

  // Add 5-Day Precision Thyroid Diet Plan & Photo Tracker Entries
  const sampleDietPlan = await prisma.dietPlan.create({
    data: {
      patientProfileId,
      reportId: sampleReport.id,
      title: '5-Day Precision Thyroid & Gut-Axis Nutritional Protocol',
      summary: 'Biomarker-formulated 5-day protocol engineered for elevated TSH (9.89 µIU/mL). Combines 5\'-deiodinase enzymatic cofactors (Selenium, Zinc), clean L-Tyrosine protein pacing, and gentle soluble prebiotic fibers to support healthy enteric motility.',
      targetBiomarkers: {
        tsh: { value: 9.89, unit: 'µIU/mL', classification: 'HIGH' },
        ft4: { value: 1.10, unit: 'ng/dL', classification: 'NORMAL' },
      },
      planJson: {
        focus: '5\'-Deiodinase Conversion & Enteric Motility',
        daysCount: 5,
      },
      isActive: true,
    },
  })

  // Create 20 structured meal tracking entries across 5 days
  await prisma.mealTrackingEntry.createMany({
    data: [
      // Day 1
      {
        dietPlanId: sampleDietPlan.id,
        patientProfileId,
        dayNumber: 1,
        mealType: 'BREAKFAST',
        mealTitle: 'Warm Spiced Steel-Cut Oats with Ground Chia & Brazil Nut',
        recipeSummary: 'Cooked steel-cut oats topped with 1 tbsp ground chia, 1/2 cup organic blueberries, cinnamon, and 1 finely chopped raw Brazil nut.',
        targetCofactors: 'Selenium (100mcg from Brazil nut), Soluble Pectin, Omega-3 ALA',
        photoUrl: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=600&auto=format&fit=crop&q=80',
        notes: 'Ate at 8:30 AM after morning Levothyroxine. Felt warm digestion and steady energy with no bloating.',
        isCompleted: true,
        completedAt: new Date(Date.now() - 86400000 * 2),
      },
      {
        dietPlanId: sampleDietPlan.id,
        patientProfileId,
        dayNumber: 1,
        mealType: 'LUNCH',
        mealTitle: 'Grilled Alaskan Salmon & Rainbow Quinoa Bowl',
        recipeSummary: '120g wild salmon fillet served over fluffy warm quinoa, lightly steamed zucchini, roasted pumpkin seeds, and cold-pressed olive oil.',
        targetCofactors: 'Zinc (pumpkin seeds), EPA/DHA Omega-3, Clean Tyrosine Protein',
        photoUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        notes: 'Delicious and very satisfying. No afternoon energy crash.',
        isCompleted: true,
        completedAt: new Date(Date.now() - 86400000 * 2 + 18000000),
      },
      {
        dietPlanId: sampleDietPlan.id,
        patientProfileId,
        dayNumber: 1,
        mealType: 'SNACK',
        mealTitle: 'Warm Fresh Ginger & Lemon Infusion with Raw Walnuts',
        recipeSummary: 'Fresh steeped ginger root with half a lemon slice and a small handful (~20g) of raw halved walnuts.',
        targetCofactors: 'Gingerols (MMC Motility Stimulant), Polyphenols',
        photoUrl: null,
        notes: 'Soothing on stomach, helped with mild afternoon sluggishness.',
        isCompleted: true,
        completedAt: new Date(Date.now() - 86400000 * 2 + 30000000),
      },
      {
        dietPlanId: sampleDietPlan.id,
        patientProfileId,
        dayNumber: 1,
        mealType: 'DINNER',
        mealTitle: 'Herb-Roasted Pasture Chicken with Baked Sweet Potato',
        recipeSummary: 'Oven-roasted chicken breast with rosemary, baked Japanese sweet potato, lightly steamed carrots, and 1 cup of warm mineral bone broth.',
        targetCofactors: 'L-Tyrosine (24g Protein), Beta-Carotene, Glycine/Glutamine',
        photoUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80',
        notes: 'Felt very comforting before bedtime. Slept 8 hours soundly.',
        isCompleted: true,
        completedAt: new Date(Date.now() - 86400000 * 2 + 40000000),
      },

      // Day 2
      {
        dietPlanId: sampleDietPlan.id,
        patientProfileId,
        dayNumber: 2,
        mealType: 'BREAKFAST',
        mealTitle: 'Golden Coconut Chia Pudding with Stewed Cinnamon Apples',
        recipeSummary: 'Chia seeds soaked overnight in coconut milk, topped with warm stewed apples, turmeric pinch, and crushed pumpkin seeds.',
        targetCofactors: 'Pectin Prebiotic Fiber, Curcumin (Anti-inflammatory), Zinc',
        photoUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&auto=format&fit=crop&q=80',
        notes: 'Stewed apples were gentle on the gut. Good morning motility.',
        isCompleted: true,
        completedAt: new Date(Date.now() - 86400000),
      },
      {
        dietPlanId: sampleDietPlan.id,
        patientProfileId,
        dayNumber: 2,
        mealType: 'LUNCH',
        mealTitle: 'Sprouted Lentil & Avocado Mediterranean Plate',
        recipeSummary: 'Warm cooked brown lentils with diced cucumber, kalamata olives, 1/4 avocado, parsley, and lemon-tahini dressing.',
        targetCofactors: 'Plant Tyrosine, Monounsaturated Fats, Prebiotic Resistant Starch',
        photoUrl: null,
        notes: null,
        isCompleted: false,
        completedAt: null,
      },
      {
        dietPlanId: sampleDietPlan.id,
        patientProfileId,
        dayNumber: 2,
        mealType: 'SNACK',
        mealTitle: 'Coconut Yogurt with 1 Chopped Brazil Nut & Hemp Seeds',
        recipeSummary: 'Unsweetened probiotic coconut yogurt sprinkled with 1 raw Brazil nut and 1 tbsp hemp hearts.',
        targetCofactors: 'Selenium (120mcg), Live Commensal Cultures, Plant Protein',
        photoUrl: null,
        notes: null,
        isCompleted: false,
        completedAt: null,
      },
      {
        dietPlanId: sampleDietPlan.id,
        patientProfileId,
        dayNumber: 2,
        mealType: 'DINNER',
        mealTitle: 'Pan-Seared Pacific Cod with Sautéed Spinach & Butternut Squash',
        recipeSummary: 'Wild cod fillet pan-seared with garlic, served with lightly wilted spinach (citrus dressed) and roasted butternut squash.',
        targetCofactors: 'Iodine (Food-Matrix 80mcg), Vitamin C + Non-Heme Iron, Vitamin A',
        photoUrl: null,
        notes: null,
        isCompleted: false,
        completedAt: null,
      },

      // Day 3
      {
        dietPlanId: sampleDietPlan.id,
        patientProfileId,
        dayNumber: 3,
        mealType: 'BREAKFAST',
        mealTitle: 'Pasture-Raised Scrambled Eggs with Avocado & Steamed Greens',
        recipeSummary: '2 organic eggs scrambled in ghee, served with 1/3 sliced avocado and lightly steamed baby chard.',
        targetCofactors: 'Choline, Vitamin D3, Bioavailable L-Tyrosine Protein',
        photoUrl: null,
        notes: null,
        isCompleted: false,
        completedAt: null,
      },
      {
        dietPlanId: sampleDietPlan.id,
        patientProfileId,
        dayNumber: 3,
        mealType: 'LUNCH',
        mealTitle: 'Wild Sardines / Mackerel on Warm Gluten-Free Seed Toast',
        recipeSummary: 'Olive oil packed wild sardines mashed with lemon and sea salt, served on warm seed bread with cucumber ribbons.',
        targetCofactors: 'Natural Marine Selenium, Calcium, Bioavailable Omega-3s',
        photoUrl: null,
        notes: null,
        isCompleted: false,
        completedAt: null,
      },
      {
        dietPlanId: sampleDietPlan.id,
        patientProfileId,
        dayNumber: 3,
        mealType: 'SNACK',
        mealTitle: 'Warm Bone Broth with Fresh Thyme & Garlic',
        recipeSummary: '1.5 cups simmered pasture chicken bone broth infused with crushed garlic and sea salt.',
        targetCofactors: 'Intestinal Collagen Peptides, Electrolytes (Sodium/Potassium)',
        photoUrl: null,
        notes: null,
        isCompleted: false,
        completedAt: null,
      },
      {
        dietPlanId: sampleDietPlan.id,
        patientProfileId,
        dayNumber: 3,
        mealType: 'DINNER',
        mealTitle: 'Turkey & Zucchini Meatballs in Gentle Tomato Basil Coulis',
        recipeSummary: 'Lean turkey meatballs with grated zucchini, served over cauliflower-potato mash and warm stewed tomato sauce.',
        targetCofactors: 'Zinc (5mg), Vitamin B12, High-Satiety Protein',
        photoUrl: null,
        notes: null,
        isCompleted: false,
        completedAt: null,
      },

      // Day 4
      {
        dietPlanId: sampleDietPlan.id,
        patientProfileId,
        dayNumber: 4,
        mealType: 'BREAKFAST',
        mealTitle: 'Thyroid-Support Green Matcha Bowl (Low-Goitrogen)',
        recipeSummary: 'Gluten-free rolled oats cooked with unsweetened almond milk, ceremonial matcha, 1 chopped Brazil nut, and fresh raspberries.',
        targetCofactors: 'Selenium (110mcg), EGCG Antioxidants, Anthocyanins',
        photoUrl: null,
        notes: null,
        isCompleted: false,
        completedAt: null,
      },
      {
        dietPlanId: sampleDietPlan.id,
        patientProfileId,
        dayNumber: 4,
        mealType: 'LUNCH',
        mealTitle: 'Warm Roasted Chicken & Golden Beet Quinoa Salad',
        recipeSummary: 'Sliced roast chicken breast, roasted golden beets, baby arugula, toasted sunflower seeds, and citrus vinaigrette.',
        targetCofactors: 'Betaine (Methylation Support), Zinc, Soluble Fiber',
        photoUrl: null,
        notes: null,
        isCompleted: false,
        completedAt: null,
      },
      {
        dietPlanId: sampleDietPlan.id,
        patientProfileId,
        dayNumber: 4,
        mealType: 'SNACK',
        mealTitle: 'Chamomile & Peppermint Infusion with Pumpkin Seeds',
        recipeSummary: 'Fresh brewed chamomile-mint tea served with 2 tablespoons of dry-roasted pumpkin seeds.',
        targetCofactors: 'Zinc (2.5mg), Vagal Nervous System Calming Terpenes',
        photoUrl: null,
        notes: null,
        isCompleted: false,
        completedAt: null,
      },
      {
        dietPlanId: sampleDietPlan.id,
        patientProfileId,
        dayNumber: 4,
        mealType: 'DINNER',
        mealTitle: 'Baked Wild Salmon with Steamed Asparagus & Wild Rice',
        recipeSummary: 'Wild salmon fillet baked with dill and lemon, accompanied by steamed asparagus spears and nutty wild rice.',
        targetCofactors: 'Glutathione, Inulin Prebiotic Fiber, Vitamin B6',
        photoUrl: null,
        notes: null,
        isCompleted: false,
        completedAt: null,
      },

      // Day 5
      {
        dietPlanId: sampleDietPlan.id,
        patientProfileId,
        dayNumber: 5,
        mealType: 'BREAKFAST',
        mealTitle: 'Blueberry & Hemp Protein Porridge with Brazil Nut',
        recipeSummary: 'Warm oat bran and hemp protein porridge topped with wild blueberries, cinnamon, and 1 raw Brazil nut.',
        targetCofactors: 'Selenium (120mcg), Complete Amino Acid Profile, Pectin',
        photoUrl: null,
        notes: null,
        isCompleted: false,
        completedAt: null,
      },
      {
        dietPlanId: sampleDietPlan.id,
        patientProfileId,
        dayNumber: 5,
        mealType: 'LUNCH',
        mealTitle: 'Mediterranean Grilled Chicken & Roasted Vegetable Medley',
        recipeSummary: 'Herb chicken breast with roasted carrots, bell peppers, parsnips, and kalamata olives.',
        targetCofactors: 'Tyrosine (28g Protein), Polyphenols, Carotenoids',
        photoUrl: null,
        notes: null,
        isCompleted: false,
        completedAt: null,
      },
      {
        dietPlanId: sampleDietPlan.id,
        patientProfileId,
        dayNumber: 5,
        mealType: 'SNACK',
        mealTitle: 'Stewed Pears with Cardamom & 1 tbsp Chia Seeds',
        recipeSummary: 'Warm gently poached Bartlett pear with cardamom and soaked chia gel.',
        targetCofactors: 'Soluble Osmotic Fiber, Digestive Enzymes',
        photoUrl: null,
        notes: null,
        isCompleted: false,
        completedAt: null,
      },
      {
        dietPlanId: sampleDietPlan.id,
        patientProfileId,
        dayNumber: 5,
        mealType: 'DINNER',
        mealTitle: 'Slow-Cooked Beef Stew with Root Vegetables & Herbs',
        recipeSummary: 'Tender grass-fed beef chuck simmered with carrots, celery, parsnips, and fresh thyme in rich bone broth.',
        targetCofactors: 'Heme Iron, Zinc (7mg), Glycine for Gut Mucosa',
        photoUrl: null,
        notes: null,
        isCompleted: false,
        completedAt: null,
      },
    ],
  })

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
