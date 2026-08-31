import NextAuth, { DefaultSession } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import { loginSchema } from '@/lib/validation/schemas'
import { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
      patientProfileId?: string
      adminProfileId?: string
    } & DefaultSession['user']
  }

  interface User {
    role: UserRole
    patientProfileId?: string
    adminProfileId?: string
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const validated = loginSchema.safeParse(credentials)
        if (!validated.success) {
          return null
        }

        const { email, password } = validated.data

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          include: {
            patientProfile: true,
            adminProfile: true,
          },
        })

        if (!user || !user.hashedPassword || !user.isActive) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(password, user.hashedPassword)
        if (!isPasswordValid) {
          return null
        }

        // Log audit
        try {
          await prisma.auditLog.create({
            data: {
              userId: user.id,
              action: 'LOGIN',
              details: `User logged in with role ${user.role}`,
            },
          })
        } catch (e) {
          console.warn('[Audit Log Warning]:', e)
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          patientProfileId: user.patientProfile?.id,
          adminProfileId: user.adminProfile?.id,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.patientProfileId = user.patientProfileId
        token.adminProfileId = user.adminProfileId
      }
      if (trigger === 'update' && session) {
        token.name = session.name
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.patientProfileId = token.patientProfileId as string | undefined
        session.user.adminProfileId = token.adminProfileId as string | undefined
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
})
