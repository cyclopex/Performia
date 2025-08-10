import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import type { JWT } from 'next-auth/jwt'
import type { Session } from 'next-auth'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Credenziali mancanti')
          return null
        }

        try {
          console.log('🔍 Cercando utente:', credentials.email)
          
          // Cerca l'utente nel database
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { profile: true }
          })

          if (!user) {
            console.log('❌ Utente non trovato')
            return null
          }

          console.log('✅ Utente trovato:', user.name, 'Role:', user.role)

          // Verifica se l'utente è attivo e approvato
          if (!user.isActive) {
            console.log('❌ Utente non attivo')
            return null
          }

          if (!user.isApproved) {
            console.log('❌ Utente non approvato')
            return null
          }

          // Verifica la password
          if (!user.password) {
            console.log('❌ Password non impostata nel database')
            return null
          }

          console.log('🔐 Verificando password...')
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          
          if (isPasswordValid) {
            console.log('✅ Autenticazione riuscita per:', user.email)
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              isApproved: user.isApproved,
              isActive: user.isActive,
            }
          } else {
            console.log('❌ Password non valida')
          }

          return null
        } catch (error) {
          console.error('❌ Errore durante l\'autenticazione:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: { id: string; role: string; isApproved: boolean; isActive: boolean } }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.isApproved = user.isApproved
        token.isActive = user.isActive
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.isApproved = token.isApproved as boolean
        session.user.isActive = token.isActive as boolean
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
  },
  debug: true, // Abilita debug per vedere i log
}