import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { DatabaseService } from "@/lib/database";
import { verifyPassword } from "@/lib/auth";

// ADDED EXPORT HERE
export const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
          return null;
        }
        const db = new DatabaseService();
        const user = await db.getUserForAuth(credentials.email);
        if (!user) { return null; }
        const isValid = await verifyPassword(credentials.password, user.passwordHash);
        if (!isValid) { return null; }
        return { id: user.id, email: user.email, name: user.name };
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = user.id; }
      return token;
    },
    async session({ session, token }) {
      if (session.user) { session.user.id = token.id as string; }
      return session;
    }
  },
  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
