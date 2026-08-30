'use server'

import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import { registerSchema, RegisterInput } from '@/lib/validation/schemas'
import { UserRole } from '@prisma/client'

export async function registerUser(input: RegisterInput) {
  try {
    const validated = registerSchema.safeParse(input)
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || 'Invalid input data',
      }
    }

    const { name, email, password } = validated.data
    const normalizedEmail = email.toLowerCase().trim()

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existing) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please log in.',
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user and empty patient profile
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        hashedPassword,
        role: UserRole.PATIENT,
        patientProfile: {
          create: {
            medicalHistory: {
              create: {},
            },
            lifestyleProfile: {
              create: {},
            },
            gutHealthProfile: {
              create: {},
            },
          },
        },
      },
      include: {
        patientProfile: true,
      },
    })

    // Create Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'REGISTER',
          details: `New patient account created for ${normalizedEmail}`,
        },
      })
    } catch (e) {
      console.warn('[Audit Warning]:', e)
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    }
  } catch (error) {
    console.error('[Register Error]:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while creating your account. Please try again.',
    }
  }
}
