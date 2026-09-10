import Link from "next/link";

export const metadata = { title: "Not invited · Honeymoon Trip" };

export default function NotInvited() {
  return (
    <main className="grid h-full place-items-center bg-background p-6">
      <div className="glass w-full max-w-sm rounded-3xl p-7 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">
          Honeymoon trip
        </p>
        <h1 className="mt-2 text-2xl font-semibold">That account isn&apos;t invited</h1>
        <p className="mt-3 text-sm leading-relaxed text-foreground/70">
          Only two Google accounts can open this map. If you used the wrong one, go back and
          pick the other.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full border border-sand/30 px-5 py-2.5 text-sm font-medium transition hover:border-gold/60"
        >
          Try again
        </Link>
      </div>
    </main>
  );
}
