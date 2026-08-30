'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db/prisma'
import { UserRole, AlertStatus, OverallStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'

async function requireAdminSession() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Authentication required.')
  }
  if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.SUPER_ADMIN) {
    throw new Error('Admin privileges required.')
  }
  return session
}

/**
 * Retrieves aggregate KPI metrics for Admin Dashboard
 */
export async function getAdminDashboardKPIs() {
  await requireAdminSession()

  const [
    totalPatients,
    totalReports,
    analyzedReports,
    pendingReports,
    doctorReviewRequiredCount,
    criticalAlertsCount,
    recentAlerts,
    recentActivity,
  ] = await Promise.all([
    prisma.patientProfile.count(),
    prisma.medicalReport.count(),
    prisma.medicalReport.count({ where: { analysisStatus: 'COMPLETED' } }),
    prisma.medicalReport.count({ where: { analysisStatus: 'PENDING' } }),
    prisma.aIAnalysis.count({ where: { doctorReviewRequired: true } }),
    prisma.safetyAlert.count({ where: { alertStatus: 'NEW' } }),
    prisma.safetyAlert.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        patientProfile: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    }),
    prisma.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
    }),
  ])

  // Status breakdown
  const [normalCount, attentionCount, medicalReviewCount, criticalCount] = await Promise.all([
    prisma.aIAnalysis.count({ where: { overallStatus: OverallStatus.NO_MAJOR_CONCERN } }),
    prisma.aIAnalysis.count({ where: { overallStatus: OverallStatus.NEEDS_ATTENTION } }),
    prisma.aIAnalysis.count({ where: { overallStatus: OverallStatus.MEDICAL_REVIEW_RECOMMENDED } }),
    prisma.aIAnalysis.count({ where: { overallStatus: OverallStatus.CRITICAL_REVIEW } }),
  ])

  return {
    totalPatients,
    totalReports,
    analyzedReports,
    pendingReports,
    doctorReviewRequiredCount,
    criticalAlertsCount,
    statusBreakdown: {
      normal: normalCount,
      attention: attentionCount,
      medicalReview: medicalReviewCount,
      critical: criticalCount,
    },
    recentAlerts,
    recentActivity,
  }
}

/**
 * Retrieves list of all registered patients with search, sort, and filters
 */
export async function getAllPatients(search?: string) {
  await requireAdminSession()

  return await prisma.patientProfile.findMany({
    where: search
      ? {
          OR: [
            { user: { name: { contains: search, mode: 'insensitive' } } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : undefined,
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      },
      medicalReports: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { aiAnalysis: true },
      },
      safetyAlerts: {
        where: { alertStatus: 'NEW' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Retrieves detailed health and report profile for a specific patient
 */
export async function getAdminPatientDetail(patientId: string) {
  await requireAdminSession()

  return await prisma.patientProfile.findUnique({
    where: { id: patientId },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      },
      medicalHistory: true,
      medications: true,
      patientSymptoms: true,
      lifestyleProfile: true,
      gutHealthProfile: true,
      medicalReports: {
        orderBy: { createdAt: 'desc' },
        include: {
          labResults: true,
          aiAnalysis: {
            include: { recommendations: true },
          },
        },
      },
      safetyAlerts: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

/**
 * Retrieves all medical reports across patients for admin review
 */
export async function getAllAdminReports() {
  await requireAdminSession()

  return await prisma.medicalReport.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      labResults: true,
      aiAnalysis: true,
      patientProfile: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
  })
}

/**
 * Retrieves safety alerts queue
 */
export async function getAdminAlerts(statusFilter?: AlertStatus) {
  await requireAdminSession()

  return await prisma.safetyAlert.findMany({
    where: statusFilter ? { alertStatus: statusFilter } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      patientProfile: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
  })
}

/**
 * Updates a safety alert status (New -> Reviewed -> Resolved)
 */
export async function updateAlertStatus(alertId: string, status: AlertStatus) {
  const session = await requireAdminSession()

  const updated = await prisma.safetyAlert.update({
    where: { id: alertId },
    data: {
      alertStatus: status,
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
      resolvedAt: status === AlertStatus.RESOLVED ? new Date() : undefined,
    },
  })

  revalidatePath('/admin/alerts')
  revalidatePath('/admin/dashboard')
  return { success: true, alert: updated }
}
