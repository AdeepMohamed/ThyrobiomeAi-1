'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db/prisma'
import { uploadFile } from '@/lib/storage/blob'
import { revalidatePath } from 'next/cache'
import { MealType } from '@prisma/client'
import { sleep } from '@/lib/utils'

async function getAuthenticatedPatientProfile() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Authentication required')
  }

  const profile = await prisma.patientProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!profile) {
    throw new Error('Patient profile not found')
  }

  return profile
}

/**
 * Retrieves the active 5-Day Precision Diet Plan and all tracked meal photo entries
 */
export async function getPatientDietPlan(reportId?: string) {
  try {
    const profile = await getAuthenticatedPatientProfile()

    let dietPlan = await prisma.dietPlan.findFirst({
      where: {
        patientProfileId: profile.id,
        ...(reportId ? { reportId } : { isActive: true }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        mealEntries: {
          orderBy: [{ dayNumber: 'asc' }, { mealType: 'asc' }],
        },
        medicalReport: {
          include: { labResults: true },
        },
      },
    })

    // If no diet plan exists yet, auto-create one from the latest verified report
    if (!dietPlan) {
      const latestReport = await prisma.medicalReport.findFirst({
        where: {
          patientProfileId: profile.id,
          analysisStatus: 'COMPLETED',
        },
        orderBy: { createdAt: 'desc' },
        include: {
          labResults: true,
          aiAnalysis: true,
        },
      })

      if (latestReport) {
        const generated = await createDefaultFiveDayDietPlan(profile.id, latestReport.id, latestReport.labResults)
        dietPlan = await prisma.dietPlan.findUnique({
          where: { id: generated.id },
          include: {
            mealEntries: {
              orderBy: [{ dayNumber: 'asc' }, { mealType: 'asc' }],
            },
            medicalReport: {
              include: { labResults: true },
            },
          },
        })
      }
    }

    return { success: true, dietPlan }
  } catch (err: unknown) {
    console.error('[getPatientDietPlan Error]:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load diet plan' }
  }
}

/**
 * Logs or updates a meal photo, notes, and completion status
 */
export async function uploadMealPhotoAndLog(formData: FormData) {
  try {
    const profile = await getAuthenticatedPatientProfile()
    const entryId = formData.get('entryId') as string
    const notes = formData.get('notes') as string | null
    const photoFile = formData.get('photo') as File | null
    const isCompleted = formData.get('isCompleted') === 'true'

    if (!entryId) {
      return { success: false, error: 'Meal entry ID is required' }
    }

    // Verify entry belongs to patient
    const entry = await prisma.mealTrackingEntry.findUnique({
      where: { id: entryId },
      include: { dietPlan: true },
    })

    if (!entry || entry.patientProfileId !== profile.id) {
      return { success: false, error: 'Meal entry not found or unauthorized' }
    }

    let photoUrl = entry.photoUrl
    if (photoFile && photoFile.size > 0 && photoFile.name !== 'undefined') {
      const uploadResult = await uploadFile(photoFile, `meals/${profile.id}`)
      photoUrl = uploadResult.url
    }

    const updated = await prisma.mealTrackingEntry.update({
      where: { id: entryId },
      data: {
        photoUrl,
        notes: notes !== null ? notes : entry.notes,
        isCompleted: isCompleted,
        completedAt: isCompleted ? (entry.completedAt || new Date()) : null,
      },
    })

    revalidatePath('/patient/diet-plan')
    revalidatePath('/patient/dashboard')
    return { success: true, entry: updated }
  } catch (err: unknown) {
    console.error('[uploadMealPhotoAndLog Error]:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update meal log' }
  }
}

/**
 * Toggles completion status of a meal
 */
export async function toggleMealCompletion(entryId: string, isCompleted: boolean) {
  try {
    const profile = await getAuthenticatedPatientProfile()

    const entry = await prisma.mealTrackingEntry.findUnique({
      where: { id: entryId },
    })

    if (!entry || entry.patientProfileId !== profile.id) {
      return { success: false, error: 'Entry not found' }
    }

    const updated = await prisma.mealTrackingEntry.update({
      where: { id: entryId },
      data: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    })

    revalidatePath('/patient/diet-plan')
    revalidatePath('/patient/dashboard')
    return { success: true, entry: updated }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to toggle completion' }
  }
}

/**
 * Creates a structured 5-day precision thyroid meal plan tailored to report biomarkers
 */
export async function createDefaultFiveDayDietPlan(
  patientProfileId: string,
  reportId: string,
  labResults: any[]
) {
  const tsh = labResults.find((r) => r.testName?.toUpperCase() === 'TSH')
  const ft4 = labResults.find((r) => r.testName?.toUpperCase() === 'FT4' || r.testName?.toUpperCase() === 'FREE T4')
  const isHighTSH = tsh?.value ? tsh.value > (tsh.referenceHigh || 4.5) : true

  const planSummary = isHighTSH
    ? `5-Day South Indian Precision Nutritional Protocol tailored to your TSH elevation (${tsh?.value ?? '9.89'} ${tsh?.unit ?? 'µIU/mL'}). Combines fermented digestive batters (Idli/Pesarattu), 5'-deiodinase enzyme cofactors (Selenium, Zinc), digestive rasams, moru (probiotic buttermilk), drumstick (Moringa) pods, and gentle coconut & lentil proteins for optimal thyroid conversion and enteric gut motility.`
    : `5-Day South Indian Precision Thyroid & Gut Microbiome Protocol designed to sustain metabolic balance, probiotic moru gut flora, and steady cellular energy.`

  // Deactivate any previous plans
  await prisma.dietPlan.updateMany({
    where: { patientProfileId, isActive: true },
    data: { isActive: false },
  })

  // Create new Plan
  const plan = await prisma.dietPlan.create({
    data: {
      patientProfileId,
      reportId,
      title: '5-Day South Indian Precision Thyroid & Gut-Axis Protocol',
      summary: planSummary,
      targetBiomarkers: {
        tsh: tsh ? { value: tsh.value, unit: tsh.unit, classification: tsh.classification } : null,
        ft4: ft4 ? { value: ft4.value, unit: ft4.unit, classification: ft4.classification } : null,
      },
      planJson: {
        focus: 'South Indian Cuisine: Fermentation, 5\'-Deiodinase Cofactors & Digestive Moru',
        daysCount: 5,
      },
      isActive: true,
    },
  })

  // 5 Days of structured South Indian recipes
  const fiveDayMenu = [
    // DAY 1
    {
      day: 1,
      type: MealType.BREAKFAST,
      title: 'Steamed Ragi Idli with Murungakkai (Drumstick) Sambar & 1 Brazil Nut',
      recipe: '3 soft steamed finger-millet (ragi) idlis served with home-brewed yellow dal & drumstick sambar, fresh coconut-coriander chutney, and 1 raw Brazil nut.',
      cofactors: 'Selenium (100mcg from Brazil nut), Moringa Polyphenols, Calcium, Natural Batter Fermentation',
    },
    {
      day: 1,
      type: MealType.LUNCH,
      title: 'Kerala Matta Rice with Ayala (Mackerel) Curry / Dal, Cabbage Thoran & Moru',
      recipe: 'Warm Kerala red matta rice served with omega-3 rich Mackerel/Sardine curry (or Sprouted Moong Methi Dal), steamed cabbage-coconut thoran, and ginger-curry leaf spiced buttermilk (moru).',
      cofactors: 'EPA/DHA Omega-3s, Zinc (dal), Probiotic Lactic Acid (moru), Clean Tyrosine',
    },
    {
      day: 1,
      type: MealType.SNACK,
      title: 'Sukku Kaapi (Dry Ginger & Coriander Herbal Brew) with Kondakadalai Sundal',
      recipe: 'Traditional dry ginger, crushed coriander seeds & palm jaggery hot infusion served with 1/2 cup boiled tempered black chickpea sundal with fresh grated coconut.',
      cofactors: 'Gingerols (MMC Enteric Motility), Resistant Starch, Plant Zinc & Iron',
    },
    {
      day: 1,
      type: MealType.DINNER,
      title: 'Oats & Moong Dal Pongal with Steamed Peerkangai (Ridge Gourd) Kootu',
      recipe: 'Warm light pongal prepared with rolled oats and yellow moong dal tempered in 1 tsp pure ghee, cumin & black pepper, paired with gentle ridge gourd stew and clear pepper rasam.',
      cofactors: 'L-Tyrosine (Moong Protein), Piperine (Enhances Absorption), Prebiotic Soluble Fiber',
    },

    // DAY 2
    {
      day: 2,
      type: MealType.BREAKFAST,
      title: 'Pesarattu (Whole Green Gram Moong Dosa) with Tomato-Ginger Chutney',
      recipe: '2 crisp whole green moong crepes stuffed with chopped onions & ginger, served with fresh tomato-ginger chutney and roasted flaxseed podi.',
      cofactors: 'High Bioavailable Plant Tyrosine (18g Protein), Alpha-Linolenic Acid (ALA), Gut Motility Ginger',
    },
    {
      day: 2,
      type: MealType.LUNCH,
      title: 'Brown Rice with Parangikai (Yellow Pumpkin) Sambar, Beans Poriyal & Jeera Chaas',
      recipe: 'Steamed brown rice with carotenoid-rich pumpkin sambar, lightly steamed French beans poriyal with mustard tempering, and a glass of chilled jeera moru.',
      cofactors: 'Beta-Carotene, Zinc, Soluble Inulin, Live Commensal Probiotics',
    },
    {
      day: 2,
      type: MealType.SNACK,
      title: 'Fresh Elaneer (Tender Coconut Water) with Soaked Almonds & 1 Brazil Nut',
      recipe: 'Pure tender coconut water with 5 soaked peeled almonds and 1 raw Brazil nut.',
      cofactors: 'Selenium (120mcg), Natural Potassium & Electrolytes, Vitamin E',
    },
    {
      day: 2,
      type: MealType.DINNER,
      title: 'Steamed Idiyappam with Mixed Vegetable Sodhi & Sautéed Paneer / Fish',
      recipe: 'Handmade steamed red rice string hoppers (idiyappam) served with coconut-milk vegetable stew (carrots, green peas, beans) and pan-seared turmeric paneer or fish.',
      cofactors: 'Medium Chain Triglycerides (MCTs for Cellular Energy), Iodine, Bioavailable Protein',
    },

    // DAY 3
    {
      day: 3,
      type: MealType.BREAKFAST,
      title: 'Red Rice Puttu with Steamed Kadala (Black Chickpea) Curry',
      recipe: 'Steamed layered red rice puttu served with mildly spiced black chickpea (kadala) curry cooked with shallots, curry leaves, and coconut slices.',
      cofactors: 'Resistant Prebiotic Starch, Low-Glycemic Complex Carbs, Iron & Zinc',
    },
    {
      day: 3,
      type: MealType.LUNCH,
      title: 'Chettinad Country Chicken / Paneer Roast with Brown Rice, Garlic Rasam & Pudalangai Poriyal',
      recipe: 'Black pepper-spiced country chicken or paneer roast served with steamed brown rice, hot garlic-coriander rasam, and steamed snake gourd poriyal.',
      cofactors: 'High Satiety L-Tyrosine Protein (26g), Garlic Allicin (Antimicrobial Gut Support), Black Pepper Piperine',
    },
    {
      day: 3,
      type: MealType.SNACK,
      title: 'Spiced Neer Mor (Buttermilk with Hing & Curry Leaves) with Roasted Makhana',
      recipe: 'Freshly churned light buttermilk infused with crushed ginger, green chili, asafoetida (hing), and fresh curry leaves, served with lightly toasted spiced lotus seeds.',
      cofactors: 'Carminative Spices, Gut Cooling Probiotics, Magnesium',
    },
    {
      day: 3,
      type: MealType.DINNER,
      title: 'Foxtail / Kodo Millet Kichadi with Moong Dal & Coconut Chammanthi',
      recipe: 'Warm gluten-free foxtail millet and split moong dal cooked with turmeric, cumin, diced carrots, and beans, accompanied by fresh raw coconut-shallot chammanthi.',
      cofactors: 'Ancient Millet B-Vitamins, Easy Digestibility, Gentle Enteric Fiber',
    },

    // DAY 4
    {
      day: 4,
      type: MealType.BREAKFAST,
      title: 'Samba Wheat Rava Vegetable Upma with Roasted Pumpkin Seeds & Mint Chutney',
      recipe: 'Cracked wheat / broken samba wheat upma loaded with green peas, carrots, and curry leaves, garnished with 2 tbsp toasted pumpkin seeds and fresh pudina chutney.',
      cofactors: 'Zinc (4.5mg from pumpkin seeds), Chromium, Slow-Release Complex Fiber, Menthol Cooling',
    },
    {
      day: 4,
      type: MealType.LUNCH,
      title: 'Pan-Seared Pomfret / Fish Masala with Matta Rice, Beetroot Poriyal & Kollu (Horse Gram) Rasam',
      recipe: 'Turmeric & pepper coated pan-seared fish (or organic tofu/paneer) with Matta rice, vibrant antioxidant beetroot poriyal, and warm polyphenol-rich horse gram rasam.',
      cofactors: 'Marine Organic Iodine & Selenium, Betaine for Liver Conjugation, Horse Gram Phenolics',
    },
    {
      day: 4,
      type: MealType.SNACK,
      title: 'Karuveppilai (Curry Leaf) & Mint Herbal Tea with Boiled Sprouted Moong Sundal',
      recipe: 'Fresh boiled curry leaf & mint tea sweetened with a drop of raw honey, paired with warm sprouted green gram sundal with lemon juice.',
      cofactors: 'Iron, Ascorbic Acid (Vitamin C for Iron Absorption), Commensal Prebiotic Flora',
    },
    {
      day: 4,
      type: MealType.DINNER,
      title: 'Soft Ragi Dosa with Vegetable Ishtu (Kerala Stew) & Murungai Leaf Clear Soup',
      recipe: '2 crisp finger-millet dosas with aromatic vegetable stew and a steaming bowl of fresh drumstick leaf (Moringa) soup.',
      cofactors: 'Moringa Bio-Flavonoids, Calcium (344mg/100g in Ragi), Adrenal Support',
    },

    // DAY 5
    {
      day: 5,
      type: MealType.BREAKFAST,
      title: 'Traditional Idli & Vada Plate (Steamed Idli + Baked Moong Dal Vada) with Sambar & 1 Brazil Nut',
      recipe: '3 fluffy steamed idlis, 1 baked moong dal vada, piping hot mixed vegetable sambar, tomato chutney, and 1 raw Brazil nut.',
      cofactors: 'Selenium (110mcg), Naturally Fermented Bioavailable Nutrients, Complete Protein Pairing',
    },
    {
      day: 5,
      type: MealType.LUNCH,
      title: 'Probiotic Millet Curd Rice with Pomegranate, Mustard Tempering & Seared Fish/Paneer',
      recipe: 'Warm cooked foxtail millet mixed with fresh homemade set curd, tempered with mustard seeds, curry leaves, grated ginger, and ruby pomegranate arils, served with roasted spiced zucchini & paneer.',
      cofactors: 'Bifidobacteria & Lactobacilli Live Cultures, Polyphenols, Anti-inflammatory Gut Barrier Coat',
    },
    {
      day: 5,
      type: MealType.SNACK,
      title: 'Warm Stewed Nendran Banana / Poached Pears with Cardamom & Soaked Chia',
      recipe: 'Gently steamed Kerala Nendran banana or Bartlett pear with crushed green cardamom and soaked chia gel.',
      cofactors: 'Pectin & Inulin Prebiotic Soluble Fiber, Serotonin/Melatonin Precursors',
    },
    {
      day: 5,
      type: MealType.DINNER,
      title: 'Moong Dal & Bottle Gourd (Sorakkai) Kootu with Warm Red Rice & Jeera Rasam',
      recipe: 'Yellow moong dal stewed with hydrating bottle gourd, cumin, and coconut, served with a small bowl of steamed red rice and warm digestion-boosting jeera water.',
      cofactors: 'High Osmotic Hydration, Gentle Overnight Gastric Emptying, Zinc & Glutamine',
    },
  ]

  // Insert all 20 meal entries
  await prisma.mealTrackingEntry.createMany({
    data: fiveDayMenu.map((m) => ({
      dietPlanId: plan.id,
      patientProfileId,
      dayNumber: m.day,
      mealType: m.type,
      mealTitle: m.title,
      recipeSummary: m.recipe,
      targetCofactors: m.cofactors,
      isCompleted: false,
    })),
  })

  return plan
}
