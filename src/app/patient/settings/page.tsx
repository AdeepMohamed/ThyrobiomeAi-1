'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, ShieldCheck, Lock, Check, AlertCircle, Trash2 } from 'lucide-react'

export default function PatientSettingsPage() {
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.next !== passwordForm.confirm) {
      setMessage({ type: 'error', text: 'New passwords do not match.' })
      return
    }
    setMessage({ type: 'success', text: 'Password preferences updated successfully.' })
    setPasswordForm({ current: '', next: '', confirm: '' })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <Settings className="h-6 w-6 text-teal-600" />
          Account & Privacy Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your login credentials, medical privacy authorizations, and platform preferences
        </p>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 rounded-xl p-3.5 text-xs font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="h-4 w-4 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Security & Password Card */}
      <Card className="shadow-xs">
        <form onSubmit={handlePasswordChange}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-4 w-4 text-teal-600" />
              Security & Password
            </CardTitle>
            <CardDescription>
              Ensure your health records remain protected with a strong credentials passphrase
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="current">Current Password</Label>
              <Input
                id="current"
                type="password"
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                placeholder="••••••••••••"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="next">New Password</Label>
                <Input
                  id="next"
                  type="password"
                  value={passwordForm.next}
                  onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                  placeholder="••••••••••••"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm New Password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  placeholder="••••••••••••"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
            <Button type="submit" variant="default" size="sm">
              Update Password
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Privacy & Health Data Governance */}
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-teal-600" />
            Medical Privacy & AI Safeguards
          </CardTitle>
          <CardDescription>
            Your health information is never shared with third-party advertising platforms
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 dark:border-slate-800 dark:bg-slate-900">
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              Data Encryption & Storage Policy:
            </p>
            <p className="leading-relaxed">
              Thyroid laboratory documents, biometric values, and symptoms are stored in encrypted databases. During Grok AI analysis, personal identifiers are sanitized before pattern synthesis.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
