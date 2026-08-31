'use client'

import React, { useState, useTransition } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  Apple,
  Camera,
  CheckCircle2,
  Clock,
  Sparkles,
  Calendar,
  Flame,
  Droplets,
  HeartPulse,
  UploadCloud,
  Eye,
  Check,
  AlertCircle,
  Pill,
  Activity,
  Image as ImageIcon,
} from 'lucide-react'
import { uploadMealPhotoAndLog, toggleMealCompletion } from '@/lib/actions/diet'
import { MealType } from '@prisma/client'

interface MealEntry {
  id: string
  dayNumber: number
  mealType: MealType
  mealTitle: string
  recipeSummary: string
  targetCofactors: string | null
  photoUrl: string | null
  notes: string | null
  isCompleted: boolean
  completedAt: Date | null
}

interface DietPlanData {
  id: string
  title: string
  summary: string
  targetBiomarkers: any
  mealEntries: MealEntry[]
}

export function DietTrackerView({ dietPlan }: { dietPlan: DietPlanData }) {
  const [selectedDay, setSelectedDay] = useState<number>(1)
  const [entries, setEntries] = useState<MealEntry[]>(dietPlan.mealEntries || [])
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Adherence calculation
  const totalMeals = entries.length || 20
  const completedMeals = entries.filter((e) => e.isCompleted).length
  const progressPercent = Math.round((completedMeals / totalMeals) * 100)

  // Current day meals
  const dayMeals = entries.filter((e) => e.dayNumber === selectedDay)

  const handleToggleComplete = (entryId: string, currentStatus: boolean) => {
    startTransition(async () => {
      const res = await toggleMealCompletion(entryId, !currentStatus)
      if (res.success && res.entry) {
        setEntries((prev) =>
          prev.map((e) => (e.id === entryId ? { ...e, isCompleted: !currentStatus } : e))
        )
      }
    })
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Banner: Protocol Summary & 5-Day Adherence */}
      <Card className="border-teal-200/80 bg-gradient-to-r from-teal-50/90 via-emerald-50/40 to-white dark:border-teal-900/60 dark:from-teal-950/40 dark:to-slate-900 overflow-hidden shadow-xs">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-teal-600 hover:bg-teal-700 text-[10px] sm:text-xs">
                  5-Day Active Protocol
                </Badge>
                <span className="text-[11px] sm:text-xs text-slate-500 font-semibold">
                  Personalized from Verified Report
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {dietPlan.title}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
                {dietPlan.summary}
              </p>
            </div>

            <div className="rounded-2xl border border-teal-200 bg-white/90 p-3.5 sm:p-4 text-center dark:border-teal-900/60 dark:bg-slate-900 shrink-0 w-full sm:w-auto sm:min-w-[160px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                5-Day Meal Adherence
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-teal-600 dark:text-teal-400 mt-0.5">
                {completedMeals} / {totalMeals}
              </p>
              <Progress value={progressPercent} className="h-2 mt-2 bg-teal-100 dark:bg-teal-950" />
              <span className="text-[10px] text-slate-500 mt-1 block">{progressPercent}% Completed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Selector Tabs (Day 1 -> Day 5) */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 no-scrollbar">
        {[1, 2, 3, 4, 5].map((day) => {
          const dayEntries = entries.filter((e) => e.dayNumber === day)
          const dayCompleted = dayEntries.filter((e) => e.isCompleted).length
          const isSelected = selectedDay === day

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex-1 min-w-[105px] sm:min-w-[120px] rounded-xl sm:rounded-2xl border p-2.5 sm:p-3 text-left transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'border-teal-600 bg-teal-600 text-white shadow-md'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold mb-0.5 sm:mb-1">
                <span>Day {day}</span>
                {dayCompleted === 4 ? (
                  <CheckCircle2 className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
                ) : (
                  <span className={`text-[10px] ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                    {dayCompleted}/4
                  </span>
                )}
              </div>
              <p className={`text-[10px] sm:text-[11px] truncate ${isSelected ? 'text-teal-100' : 'text-slate-500'}`}>
                {day === 1 ? 'Conversion Launch' : day === 2 ? 'Prebiotic Motility' : day === 3 ? 'Mineral Fortify' : day === 4 ? 'Antioxidants' : 'Gut Barrier'}
              </p>
            </button>
          )
        })}
      </div>

      {/* Daily Routine Focus Banner */}
      <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4 text-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4">
        <div className="flex items-start sm:items-center gap-2">
          <Pill className="h-4 w-4 text-teal-600 shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">Thyroid Hormone Timing: </span>
            <span className="text-slate-600 dark:text-slate-400">Take on empty stomach 4h away from calcium, iron, coffee.</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1"><Droplets className="h-3.5 w-3.5 text-sky-500" /> 2.0-2.5L Water</span>
          <span className="flex items-center gap-1"><Activity className="h-3.5 w-3.5 text-emerald-500" /> 30m Walking</span>
        </div>
      </div>

      {/* Meal Cards for Selected Day */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {dayMeals.map((meal) => (
          <MealCardItem
            key={meal.id}
            meal={meal}
            onUpdate={(updated) => {
              setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
            }}
            onViewPhoto={(url) => setActivePhotoModal(url)}
          />
        ))}
      </div>

      {/* Full-Screen Photo Modal */}
      {activePhotoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4"
          onClick={() => setActivePhotoModal(null)}
        >
          <div className="relative max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl bg-slate-950 p-2 border border-slate-800">
            <img
              src={activePhotoModal}
              alt="Tracked Meal"
              className="max-h-[80vh] w-auto rounded-2xl object-contain mx-auto"
            />
            <button
              onClick={() => setActivePhotoModal(null)}
              className="absolute top-4 right-4 rounded-full bg-slate-900/80 p-2 text-white hover:bg-slate-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MealCardItem({
  meal,
  onUpdate,
  onViewPhoto,
}: {
  meal: MealEntry
  onUpdate: (updated: MealEntry) => void
  onViewPhoto: (url: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [notes, setNotes] = useState(meal.notes || '')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(meal.photoUrl)
  const [isSaving, setIsSaving] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setIsEditing(true)
    }
  }

  const handleSave = async (markComplete = false) => {
    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append('entryId', meal.id)
      formData.append('notes', notes)
      formData.append('isCompleted', String(markComplete ? true : meal.isCompleted))
      if (selectedFile) {
        formData.append('photo', selectedFile)
      }

      const res = await uploadMealPhotoAndLog(formData)
      if (res.success && res.entry) {
        onUpdate(res.entry as MealEntry)
        setIsEditing(false)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const mealColor =
    meal.mealType === MealType.BREAKFAST
      ? 'border-amber-200 bg-amber-50/30 dark:border-amber-950 dark:bg-amber-950/20'
      : meal.mealType === MealType.LUNCH
      ? 'border-sky-200 bg-sky-50/30 dark:border-sky-950 dark:bg-sky-950/20'
      : meal.mealType === MealType.DINNER
      ? 'border-indigo-200 bg-indigo-50/30 dark:border-indigo-950 dark:bg-indigo-950/20'
      : 'border-emerald-200 bg-emerald-50/30 dark:border-emerald-950 dark:bg-emerald-950/20'

  return (
    <Card className={`overflow-hidden shadow-xs border transition-all ${meal.isCompleted ? 'border-emerald-300 dark:border-emerald-900/60' : 'border-slate-200 dark:border-slate-800'}`}>
      <CardHeader className={`pb-3 ${mealColor}`}>
        <div className="flex items-center justify-between">
          <Badge
            variant={
              meal.mealType === MealType.BREAKFAST
                ? 'warning'
                : meal.mealType === MealType.LUNCH
                ? 'info'
                : meal.mealType === MealType.DINNER
                ? 'default'
                : 'success'
            }
            className="text-[10px] font-bold uppercase tracking-wider"
          >
            {meal.mealType}
          </Badge>

          <Button
            size="sm"
            variant={meal.isCompleted ? 'default' : 'outline'}
            onClick={() => handleSave(!meal.isCompleted)}
            disabled={isSaving}
            className={`h-7 px-2.5 text-xs font-semibold gap-1 ${
              meal.isCompleted
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'border-slate-300 dark:border-slate-700'
            }`}
          >
            <Check className="h-3.5 w-3.5" />
            {meal.isCompleted ? 'Completed' : 'Mark Eaten'}
          </Button>
        </div>

        <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 mt-2">
          {meal.mealTitle}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5 space-y-4 text-xs">
        {/* Recipe and Instructions */}
        <div className="space-y-1">
          <span className="font-bold text-slate-500 uppercase text-[10px]">Recipe & Preparation:</span>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            {meal.recipeSummary}
          </p>
        </div>

        {/* Target Thyroid & Gut Cofactors */}
        {meal.targetCofactors && (
          <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-2.5 dark:border-teal-900/40 dark:bg-teal-950/30">
            <span className="font-bold text-teal-900 dark:text-teal-200 text-[10px] uppercase">
              Target Biochemical Cofactors:
            </span>
            <p className="text-teal-800 dark:text-teal-300 mt-0.5 font-medium">
              {meal.targetCofactors}
            </p>
          </div>
        )}

        {/* Photo Upload & Tracking Section */}
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="font-bold text-slate-500 uppercase text-[10px] flex items-center justify-between">
            <span>Meal Photo Verification</span>
            {previewUrl && <span className="text-emerald-600 font-semibold">Photo Attached</span>}
          </span>

          {previewUrl ? (
            <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 h-36 flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Meal photo"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onViewPhoto(previewUrl)}
                  className="h-8 text-xs font-semibold gap-1"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </Button>
                <label className="cursor-pointer">
                  <span className="inline-flex h-8 items-center rounded-lg bg-white/90 px-3 text-xs font-semibold text-slate-900 hover:bg-white">
                    Replace
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-28 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 transition-colors cursor-pointer dark:border-slate-800 dark:bg-slate-900/40">
              <Camera className="h-6 w-6 text-slate-400 mb-1" />
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Take or Upload Meal Photo
              </span>
              <span className="text-[10px] text-slate-400">JPG, PNG, or WebP</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Patient Notes Input */}
        <div className="space-y-1.5">
          <span className="font-bold text-slate-500 uppercase text-[10px]">Digestion & Energy Notes:</span>
          <Textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value)
              setIsEditing(true)
            }}
            placeholder="e.g., Felt energized, warm digestion, no bloating after eating..."
            rows={2}
            className="text-xs resize-none bg-slate-50 dark:bg-slate-900"
          />
        </div>
      </CardContent>

      {isEditing && (
        <CardFooter className="border-t border-slate-100 p-3 flex justify-end gap-2 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsEditing(false)
              setNotes(meal.notes || '')
              setPreviewUrl(meal.photoUrl)
            }}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="text-xs bg-teal-600 hover:bg-teal-700 text-white"
          >
            {isSaving ? 'Saving...' : 'Save & Mark Complete'}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
