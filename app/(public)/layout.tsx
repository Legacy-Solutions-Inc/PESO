import Link from "next/link";
import Image from "next/image";

interface PublicLayoutProps {
  children: React.ReactNode;
}

const NAV = [
  { href: "/", label: "Home" },
  { href: "/news", label: "News" },
  { href: "/jobs", label: "Jobs" },
] as const;

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}

function PublicHeader() {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4 md:py-5">
        <Link
          href="/"
          aria-label="PESO Lambunao home"
          className="group flex items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-card ring-1 ring-inset ring-border">
            <Image
              src="/peso-logo.jpg"
              alt=""
              width={36}
              height={36}
              className="size-full object-cover"
              priority
            />
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="font-serif text-[1.0625rem] font-medium tracking-tight text-foreground">
              PESO Lambunao
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Public Employment Service Office
            </span>
          </span>
        </Link>

        <nav aria-label="Primary">
          <ul className="flex items-center gap-1 sm:gap-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-md px-3 py-2 text-[13.5px] font-medium text-foreground/75 transition-colors hover:bg-foreground/[0.04] hover:text-foreground focus-visible:bg-foreground/[0.04] focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/login"
                className="ml-1 inline-flex items-center rounded-md border border-border bg-card px-3 py-2 text-[13.5px] font-medium text-foreground transition-colors hover:bg-foreground/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:ml-2"
              >
                Sign in
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

function PublicFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-border bg-card/40">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 md:grid-cols-3">
        <div className="space-y-3">
          <p className="font-serif text-[1rem] font-medium tracking-tight text-foreground">
            PESO Lambunao
          </p>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            A unit of the Public Employment Service Office, hosted by the
            Municipality of Lambunao under the Department of Labor and
            Employment, Region VI.
          </p>
        </div>

        <address className="space-y-2 not-italic">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Office
          </p>
          {/* TODO: replace with the verified office address once provided. */}
          <p className="text-[13px] leading-relaxed text-foreground">
            PESO Lambunao Municipal Hall
            <br />
            Lambunao, Iloilo
          </p>
        </address>

        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Information
          </p>
          <ul className="space-y-1.5 text-[13px]">
            <li>
              <Link
                href="/privacy"
                className="text-foreground/80 transition-colors hover:text-foreground"
              >
                Privacy notice
              </Link>
            </li>
            <li>
              <Link
                href="/jobs"
                className="text-foreground/80 transition-colors hover:text-foreground"
              >
                Active job postings
              </Link>
            </li>
            <li>
              <Link
                href="/news"
                className="text-foreground/80 transition-colors hover:text-foreground"
              >
                Department announcements
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <p
          data-tabular
          className="mx-auto w-full max-w-6xl px-6 py-5 text-[12px] text-muted-foreground"
        >
          &copy; {year} PESO Lambunao &middot; Department of Labor and
          Employment, Republic of the Philippines.
        </p>
      </div>
    </footer>
  );
}
