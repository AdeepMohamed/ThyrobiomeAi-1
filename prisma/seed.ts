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
        summary: 'Evaluation of the uploaded thyroid panel indicates elevated thyrotropin (TSH: 9.89 µIU/mL) with preserved peripheral thyroid hormone levels (FT4: 1.10 ng/dL, FT3: 2.80 pg/mL).',
        thyroid_pattern: 'Laboratory pattern potentially consistent with elevated thyrotropin (TSH) with normal circulating Free T4/Free T3.',
        confidence: 'high',
        doctor_review: {
          required: true,
          priority: 'prompt',
          reason: 'TSH elevation above report reference range requires clinical follow-up for medication titration assessment.',
        },
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
