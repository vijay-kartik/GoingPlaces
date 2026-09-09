import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const authConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  // Secret is read from AUTH_SECRET automatically.
  session: { strategy: "jwt" },
  trustHost: true,
});
