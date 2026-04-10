import NextAuth from "next-auth";
import bcrypt from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

export const {
  auth,     
  handlers, 
} = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials || !credentials.email || !credentials.password) {
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) return null;

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;

          return user;
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),

    // 👇 ADD THESE HERE
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),

    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  pages: {
    signIn: '/auth/signin',
  },

  callbacks: {
    // ⚠️ this isn't a valid NextAuth callback (see note below)
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = auth && auth.user;
      const path = nextUrl.pathname;
      const isProtectedRoute = path.startsWith('/add-profile') || 
        (path.startsWith('/profile/') && path.endsWith('/edit'));

      if (isProtectedRoute && !isLoggedIn) {
        return false;
      }
      return true;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    }
  }
});