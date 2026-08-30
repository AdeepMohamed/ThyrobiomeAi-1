'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db/prisma'
import {
  patientProfileSchema,
  medicalHistorySchema,
  lifestyleSchema,
  gutHealthSchema,
  symptomsFormSchema,
  medicationSchema,
} from '@/lib/validation/schemas'
import { calculateBMI } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

async function getAuthenticatedPatientProfile() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Authentication required')
  }

  const patientProfile = await prisma.patientProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!patientProfile) {
    // Auto-create if somehow missing
    return await prisma.patientProfile.create({
      data: {
        userId: session.user.id,
        medicalHistory: { create: {} },
        lifestyleProfile: { create: {} },
        gutHealthProfile: { create: {} },
      },
    })
  }

  return patientProfile
}

/**
 * Updates patient biometrics (age, sex, height, weight, auto-calculates BMI)
 */
export async function updatePatientProfile(formData: unknown) {
  try {
    const profile = await getAuthenticatedPatientProfile()
    const validated = patientProfileSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message }
    }

    const { age, sex, height, weight, phone, address, dateOfBirth } = validated.data
    let bmi: number | null = null
    if (height && weight && height > 0 && weight > 0) {
      bmi = calculateBMI(weight, height)
    }

    const updated = await prisma.patientProfile.update({
      where: { id: profile.id },
      data: {
        age: age ?? null,
        sex: sex ?? null,
        height: height ?? null,
        weight: weight ?? null,
        bmi,
        phone: phone ?? null,
        address: address ?? null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      },
    })

    revalidatePath('/patient/profile')
    revalidatePath('/patient/dashboard')
    return { success: true, profile: updated }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update profile' }
  }
}

/**
 * Updates patient medical & thyroid history
 */
export async function updateMedicalHistory(formData: unknown) {
  try {
    const profile = await getAuthenticatedPatientProfile()
    const validated = medicalHistorySchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message }
    }

    const data = validated.data
    const updated = await prisma.medicalHistory.upsert({
      where: { patientProfileId: profile.id },
      create: {
        patientProfileId: profile.id,
        ...data,
      },
      update: {
        ...data,
      },
    })

    revalidatePath('/patient/history')
    revalidatePath('/patient/dashboard')
    return { success: true, medicalHistory: updated }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update medical history' }
  }
}

/**
 * Adds a new medication
 */
export async function addMedication(formData: unknown) {
  try {
    const profile = await getAuthenticatedPatientProfile()
    const validated = medicationSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message }
    }

    const { name, dosage, frequency, startDate, isActive, notes } = validated.data
    const med = await prisma.medication.create({
      data: {
        patientProfileId: profile.id,
        name,
        dosage: dosage || null,
        frequency: frequency || null,
        startDate: startDate ? new Date(startDate) : null,
        isActive: isActive ?? true,
        notes: notes || null,
      },
    })

    revalidatePath('/patient/history')
    return { success: true, medication: med }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to add medication' }
  }
}

/**
 * Removes a medication
 */
export async function deleteMedication(medicationId: string) {
  try {
    const profile = await getAuthenticatedPatientProfile()
    await prisma.medication.deleteMany({
      where: {
        id: medicationId,
        patientProfileId: profile.id,
      },
    })

    revalidatePath('/patient/history')
    return { success: true }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete medication' }
  }
}

/**
 * Updates patient reported symptoms with severity and frequency
 */
export async function updatePatientSymptoms(formData: unknown) {
  try {
    const profile = await getAuthenticatedPatientProfile()
    const validated = symptomsFormSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message }
    }

    // Delete existing symptoms and insert updated set
    await prisma.$transaction(async (tx) => {
      await tx.patientSymptom.deleteMany({
        where: { patientProfileId: profile.id },
      })

      if (validated.data.symptoms.length > 0) {
        await tx.patientSymptom.createMany({
          data: validated.data.symptoms.map((s) => ({
            patientProfileId: profile.id,
            symptomName: s.symptomName,
            severity: s.severity,
            frequency: s.frequency,
            notes: s.notes || null,
          })),
        })
      }
    })

    revalidatePath('/patient/symptoms')
    revalidatePath('/patient/dashboard')
    return { success: true }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update symptoms' }
  }
}

/**
 * Updates patient lifestyle & dietary patterns
 */
export async function updateLifestyleProfile(formData: unknown) {
  try {
    const profile = await getAuthenticatedPatientProfile()
    const validated = lifestyleSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message }
    }

    const data = validated.data
    const updated = await prisma.lifestyleProfile.upsert({
      where: { patientProfileId: profile.id },
      create: {
        patientProfileId: profile.id,
        ...data,
      },
      update: {
        ...data,
      },
    })

    revalidatePath('/patient/lifestyle')
    revalidatePath('/patient/dashboard')
    return { success: true, lifestyle: updated }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update lifestyle' }
  }
}

/**
 * Updates patient gut-health profile
 */
export async function updateGutHealthProfile(formData: unknown) {
  try {
    const profile = await getAuthenticatedPatientProfile()
    const validated = gutHealthSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message }
    }

    const data = validated.data
    const updated = await prisma.gutHealthProfile.upsert({
      where: { patientProfileId: profile.id },
      create: {
        patientProfileId: profile.id,
        ...data,
      },
      update: {
        ...data,
      },
    })

    revalidatePath('/patient/gut-health')
    revalidatePath('/patient/dashboard')
    return { success: true, gutHealth: updated }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update gut health' }
  }
}

/**
 * Retrieves full patient health bundle for dashboard and analysis
 */
export async function getPatientFullData() {
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }

  return await prisma.patientProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      user: {
        select: { name: true, email: true },
      },
      medicalHistory: true,
      medications: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      },
      patientSymptoms: {
        orderBy: { severity: 'desc' },
      },
      lifestyleProfile: true,
      gutHealthProfile: true,
      medicalReports: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          labResults: true,
          aiAnalysis: true,
        },
      },
      aiAnalyses: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          recommendations: true,
          report: {
            include: { labResults: true },
          },
        },
      },
    },
  })
}
