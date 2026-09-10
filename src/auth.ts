import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const authConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
);

// Who may enter. Override with ALLOWED_EMAILS="a@x.com,b@y.com" in the environment.
const DEFAULT_ALLOWED = ["kartik.iit96@gmail.com", "urvashi96vijay@gmail.com"];

export const allowedEmails: string[] = (
  process.env.ALLOWED_EMAILS ?? DEFAULT_ALLOWED.join(",")
)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAllowed(email?: string | null): boolean {
  return !!email && allowedEmails.includes(email.toLowerCase());
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  // Secret is read from AUTH_SECRET automatically.
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    // Reject anyone not on the list before a session is ever created.
    signIn({ profile }) {
      return isAllowed(profile?.email) ? true : "/not-invited";
    },
  },
});
