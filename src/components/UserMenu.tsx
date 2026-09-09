import Image from "next/image";
import { auth, authConfigured, signIn, signOut } from "@/auth";

export default async function UserMenu() {
  if (!authConfigured) {
    return (
      <div className="glass rounded-full px-4 py-2 text-xs text-sand/80">
        Sign-in not configured
      </div>
    );
  }

  const session = await auth();

  if (!session?.user) {
    return (
      <form
        action={async () => {
          "use server";
          await signIn("google");
        }}
      >
        <button
          type="submit"
          className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground transition hover:border-gold/60"
        >
          <GoogleG />
          Sign in
        </button>
      </form>
    );
  }

  const { name, image } = session.user;
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <button
        type="submit"
        title={`Signed in as ${name ?? ""} — click to sign out`}
        className="glass flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm text-foreground transition hover:border-gold/60"
      >
        {image ? (
          <Image
            src={image}
            alt=""
            width={28}
            height={28}
            className="rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-gold text-xs font-bold text-background">
            {(name ?? "?").slice(0, 1)}
          </span>
        )}
        <span className="max-w-32 truncate">{name?.split(" ")[0]}</span>
      </button>
    </form>
  );
}

function GoogleG() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.5 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.8 6C12.3 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.4 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.8-6z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.7-4.1-13.6-9.9l-7.8 6C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}
