import { signIn } from "@/auth";

// Shown to visitors who are not signed in. The map never renders behind it.
export default function Gate() {
  return (
    <div className="absolute inset-0 grid place-items-center overflow-hidden bg-background p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-gold/15 blur-3xl"
      />
      <div className="glass relative w-full max-w-sm rounded-3xl p-7 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">
          Honeymoon trip
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Dubai</h1>
        <p className="mt-3 text-sm leading-relaxed text-foreground/70">
          This map is private. Sign in with an invited Google account to open it.
        </p>
        <form
          className="mt-6"
          action={async () => {
            "use server";
            await signIn("google");
          }}
        >
          <button
            type="submit"
            className="w-full rounded-full bg-gold px-5 py-3 text-sm font-semibold text-background transition hover:brightness-110"
          >
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  );
}
