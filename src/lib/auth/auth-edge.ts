import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

// Lightweight auth config for Edge middleware — no heavy imports (bcrypt, prisma, zod)
export const authConfig = {
  trustHost: true,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      // authorize is NOT called in edge middleware; only in server actions
      authorize: () => null,
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
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
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.patientProfileId = token.patientProfileId as string | undefined
        session.user.adminProfileId = token.adminProfileId as string | undefined
      }
      return session
    },
    async redirect({ url, baseUrl }: any) {
      if (url.startsWith('/')) return url
      try {
        const parsed = new URL(url)
        if (parsed.origin === baseUrl) return url
        return parsed.pathname + parsed.search
      } catch {
        return baseUrl || '/'
      }
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
}

export const { auth: authMiddleware } = NextAuth(authConfig)
