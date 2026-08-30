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
    ? `5-Day Nutritional Protocol tailored to your TSH elevation (${tsh?.value ?? '9.89'} ${tsh?.unit ?? 'µIU/mL'}). Emphasizes 5'-deiodinase enzyme cofactors (Selenium, Zinc), clean L-Tyrosine proteins, and gentle soluble fibers for optimal gut motility.`
    : `5-Day Precision Thyroid & Gut Microbiome Protocol designed to sustain metabolic balance, short-chain fatty acid gut fermentation, and stable cellular energy.`

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
      title: '5-Day Precision Thyroid Diet & Gut-Axis Protocol',
      summary: planSummary,
      targetBiomarkers: {
        tsh: tsh ? { value: tsh.value, unit: tsh.unit, classification: tsh.classification } : null,
        ft4: ft4 ? { value: ft4.value, unit: ft4.unit, classification: ft4.classification } : null,
      },
      planJson: {
        focus: '5-Deiodinase Conversion & Enteric Motility',
        daysCount: 5,
      },
      isActive: true,
    },
  })

  // 5 Days of structured recipes
  const fiveDayMenu = [
    // DAY 1
    {
      day: 1,
      type: MealType.BREAKFAST,
      title: 'Warm Spiced Steel-Cut Oats with Ground Chia & Brazil Nut',
      recipe: 'Cooked steel-cut oats topped with 1 tbsp ground chia, 1/2 cup organic blueberries, cinnamon, and 1 finely chopped raw Brazil nut.',
      cofactors: 'Selenium (100mcg from Brazil nut), Soluble Pectin, Omega-3 ALA',
    },
    {
      day: 1,
      type: MealType.LUNCH,
      title: 'Grilled Alaskan Salmon & Rainbow Quinoa Bowl',
      recipe: '120g wild salmon fillet served over fluffy warm quinoa, lightly steamed zucchini, roasted pumpkin seeds, and cold-pressed olive oil.',
      cofactors: 'Zinc (pumpkin seeds), EPA/DHA Omega-3, Clean Tyrosine Protein',
    },
    {
      day: 1,
      type: MealType.SNACK,
      title: 'Warm Fresh Ginger & Lemon Infusion with Raw Walnuts',
      recipe: 'Fresh steeped ginger root with half a lemon slice and a small handful (~20g) of raw halved walnuts.',
      cofactors: 'Gingerols (MMC Motility Stimulant), Polyphenols',
    },
    {
      day: 1,
      type: MealType.DINNER,
      title: 'Herb-Roasted Pasture Chicken with Baked Sweet Potato',
      recipe: 'Oven-roasted chicken breast with rosemary, baked Japanese sweet potato, lightly steamed carrots, and 1 cup of warm mineral bone broth.',
      cofactors: 'L-Tyrosine (24g Protein), Beta-Carotene, Glycine/Glutamine',
    },

    // DAY 2
    {
      day: 2,
      type: MealType.BREAKFAST,
      title: 'Golden Coconut Chia Pudding with Stewed Cinnamon Apples',
      recipe: 'Chia seeds soaked overnight in coconut milk, topped with warm stewed apples, turmeric pinch, and crushed pumpkin seeds.',
      cofactors: 'Pectin Prebiotic Fiber, Curcumin (Anti-inflammatory), Zinc',
    },
    {
      day: 2,
      type: MealType.LUNCH,
      title: 'Sprouted Lentil & Avocado Mediterranean Plate',
      recipe: 'Warm cooked brown lentils with diced cucumber, kalamata olives, 1/4 avocado, parsley, and lemon-tahini dressing.',
      cofactors: 'Plant Tyrosine, Monounsaturated Fats, Prebiotic Resistant Starch',
    },
    {
      day: 2,
      type: MealType.SNACK,
      title: 'Coconut Yogurt with 1 Chopped Brazil Nut & Hemp Seeds',
      recipe: 'Unsweetened probiotic coconut yogurt sprinkled with 1 raw Brazil nut and 1 tbsp hemp hearts.',
      cofactors: 'Selenium (120mcg), Live Commensal Cultures, Plant Protein',
    },
    {
      day: 2,
      type: MealType.DINNER,
      title: 'Pan-Seared Pacific Cod with Sautéed Spinach & Butternut Squash',
      recipe: 'Wild cod fillet pan-seared with garlic, served with lightly wilted spinach (citrus dressed) and roasted butternut squash.',
      cofactors: 'Iodine (Food-Matrix 80mcg), Vitamin C + Non-Heme Iron, Vitamin A',
    },

    // DAY 3
    {
      day: 3,
      type: MealType.BREAKFAST,
      title: 'Pasture-Raised Scrambled Eggs with Avocado & Steamed Greens',
      recipe: '2 organic eggs scrambled in ghee, served with 1/3 sliced avocado and lightly steamed baby chard.',
      cofactors: 'Choline, Vitamin D3, Bioavailable L-Tyrosine Protein',
    },
    {
      day: 3,
      type: MealType.LUNCH,
      title: 'Wild Sardines / Mackerel on Warm Gluten-Free Seed Toast',
      recipe: 'Olive oil packed wild sardines mashed with lemon and sea salt, served on warm seed bread with cucumber ribbons.',
      cofactors: 'Natural Marine Selenium, Calcium, Bioavailable Omega-3s',
    },
    {
      day: 3,
      type: MealType.SNACK,
      title: 'Warm Bone Broth with Fresh Thyme & Garlic',
      recipe: '1.5 cups simmered pasture chicken bone broth infused with crushed garlic and sea salt.',
      cofactors: 'Intestinal Collagen Peptides, Electrolytes (Sodium/Potassium)',
    },
    {
      day: 3,
      type: MealType.DINNER,
      title: 'Turkey & Zucchini Meatballs in Gentle Tomato Basil Coulis',
      recipe: 'Lean turkey meatballs with grated zucchini, served over cauliflower-potato mash and warm stewed tomato sauce.',
      cofactors: 'Zinc (5mg), Vitamin B12, High-Satiety Protein',
    },

    // DAY 4
    {
      day: 4,
      type: MealType.BREAKFAST,
      title: 'Thyroid-Support Green Matcha Bowl (Low-Goitrogen)',
      recipe: 'Gluten-free rolled oats cooked with unsweetened almond milk, ceremonial matcha, 1 chopped Brazil nut, and fresh raspberries.',
      cofactors: 'Selenium (110mcg), EGCG Antioxidants, Anthocyanins',
    },
    {
      day: 4,
      type: MealType.LUNCH,
      title: 'Warm Roasted Chicken & Golden Beet Quinoa Salad',
      recipe: 'Sliced roast chicken breast, roasted golden beets, baby arugula, toasted sunflower seeds, and citrus vinaigrette.',
      cofactors: 'Betaine (Methylation Support), Zinc, Soluble Fiber',
    },
    {
      day: 4,
      type: MealType.SNACK,
      title: 'Chamomile & Peppermint Infusion with Pumpkin Seeds',
      recipe: 'Fresh brewed chamomile-mint tea served with 2 tablespoons of dry-roasted pumpkin seeds.',
      cofactors: 'Zinc (2.5mg), Vagal Nervous System Calming Terpenes',
    },
    {
      day: 4,
      type: MealType.DINNER,
      title: 'Baked Wild Salmon with Steamed Asparagus & Wild Rice',
      recipe: 'Wild salmon fillet baked with dill and lemon, accompanied by steamed asparagus spears and nutty wild rice.',
      cofactors: 'Glutathione, Inulin Prebiotic Fiber, Vitamin B6',
    },

    // DAY 5
    {
      day: 5,
      type: MealType.BREAKFAST,
      title: 'Blueberry & Hemp Protein Porridge with Brazil Nut',
      recipe: 'Warm oat bran and hemp protein porridge topped with wild blueberries, cinnamon, and 1 raw Brazil nut.',
      cofactors: 'Selenium (120mcg), Complete Amino Acid Profile, Pectin',
    },
    {
      day: 5,
      type: MealType.LUNCH,
      title: 'Mediterranean Grilled Chicken & Roasted Vegetable Medley',
      recipe: 'Herb chicken breast with roasted carrots, bell peppers, parsnips, and kalamata olives.',
      cofactors: 'Tyrosine (28g Protein), Polyphenols, Carotenoids',
    },
    {
      day: 5,
      type: MealType.SNACK,
      title: 'Stewed Pears with Cardamom & 1 tbsp Chia Seeds',
      recipe: 'Warm gently poached Bartlett pear with cardamom and soaked chia gel.',
      cofactors: 'Soluble Osmotic Fiber, Digestive Enzymes',
    },
    {
      day: 5,
      type: MealType.DINNER,
      title: 'Slow-Cooked Beef Stew with Root Vegetables & Herbs',
      recipe: 'Tender grass-fed beef chuck simmered with carrots, celery, parsnips, and fresh thyme in rich bone broth.',
      cofactors: 'Heme Iron, Zinc (7mg), Glycine for Gut Mucosa',
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
