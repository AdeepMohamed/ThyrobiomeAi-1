'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { ShieldCheck, Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { MedicalDisclaimerBanner } from '@/components/common/medical-disclaimer-banner'
import { registerUser } from '@/lib/actions/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setIsLoading(false)
      return
    }

    try {
      const res = await registerUser({
        name,
        email,
        password,
        confirmPassword,
      })

      if (!res.success) {
        setError(res.error || 'Failed to create account.')
        setIsLoading(false)
        return
      }

      // Auto sign in after registration
      const signinRes = await signIn('credentials', {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      })

      if (signinRes?.error) {
        router.push('/login?registered=true')
      } else {
        router.push('/patient/profile?new=true')
      }
      router.refresh()
    } catch {
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-indigo-50/40 flex flex-col justify-center py-12 sm:px-6 lg:px-8 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-600 to-indigo-600 text-white shadow-lg">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Thyro<span className="text-teal-600 dark:text-teal-400">Biome</span>AI
          </span>
        </Link>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Create your confidential patient health account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="shadow-xl border-slate-200/80 dark:border-slate-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Create Patient Account</CardTitle>
            <CardDescription>
              Join to upload lab reports, analyze thyroid patterns, and receive supportive dietary insights
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-200 dark:border-rose-900">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password (min 8 chars, 1 uppercase, 1 number)</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
                <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-semibold mb-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Privacy & Medical Safety</span>
                </div>
                <p>
                  Your data is stored securely. AI interpretations are educational and strictly supportive.
                </p>
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full h-11 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Complete Registration'}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800">
            <p className="text-center text-xs text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-teal-600 hover:underline dark:text-teal-400">
                Sign in here
              </Link>
            </p>
          </CardFooter>
        </Card>

        <div className="mt-6">
          <MedicalDisclaimerBanner variant="compact" />
        </div>
      </div>
    </div>
  )
}
