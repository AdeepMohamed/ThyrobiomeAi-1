'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Sparkles, User, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { MedicalDisclaimerBanner } from '@/components/common/medical-disclaimer-banner'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password. Please try again.')
        setIsLoading(false)
        return
      }

      // Check role or default to patient/admin
      if (email.toLowerCase().includes('admin')) {
        router.push('/admin/dashboard')
      } else {
        router.push('/patient/dashboard')
      }
      router.refresh()
    } catch {
      setError('An unexpected error occurred during sign in. Please try again.')
      setIsLoading(false)
    }
  }

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail)
    setPassword(demoPass)
    setError(null)
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
          AI-Assisted Thyroid & Gut-Health Support Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="shadow-xl border-slate-200/80 dark:border-slate-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign in to your account</CardTitle>
            <CardDescription>
              Enter your credentials to access Patient or Admin dashboard
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
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="patient@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <span className="text-xs text-slate-400">Default: password123</span>
                </div>
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

              <Button
                type="submit"
                variant="gradient"
                className="w-full h-11 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            {/* Quick Demo Access Bar */}
            <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-3">
                Quick Demo Credentials
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoAccount('patient@example.com', 'password123')}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50/60 py-2 px-3 text-xs font-semibold text-teal-900 transition-colors hover:bg-teal-100/80 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-200 cursor-pointer"
                >
                  <User className="h-3.5 w-3.5 text-teal-600" />
                  Demo Patient
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('admin@example.com', 'password123')}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100/60 py-2 px-3 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-200/80 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 cursor-pointer"
                >
                  <Shield className="h-3.5 w-3.5 text-rose-500" />
                  Demo Admin
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800">
            <p className="text-center text-xs text-slate-500">
              New patient?{' '}
              <Link href="/register" className="font-semibold text-teal-600 hover:underline dark:text-teal-400">
                Create patient account
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
