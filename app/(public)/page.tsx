import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarClock,
  ChevronRight,
  Compass,
  MapPin,
  Newspaper,
  Pin,
} from "lucide-react";
import { AmbientMesh } from "@/components/vanguard/ambient-mesh";
import { BezelSurface } from "@/components/vanguard/bezel-surface";
import { EyebrowTag } from "@/components/vanguard/eyebrow-tag";
import { HairlineIcon } from "@/components/vanguard/hairline-icon";
import { PillLink } from "@/components/vanguard/pill-cta";
import { Reveal } from "@/components/vanguard/reveal";
import { SafeText } from "@/components/public/safe-text";
import { FeedGallery } from "@/components/public/photo-gallery";
import { publicMediaUrl } from "@/lib/storage/public-url";
import {
  getActiveJobs,
  getLatestNewsPosts,
  getPinnedNewsPost,
  type PublicJobPosting,
  type PublicNewsPost,
} from "./_data/queries";
import type { PhotoEntry } from "@/lib/validations/news-post";
import type { EmploymentType } from "@/lib/validations/job-posting";

export const metadata: Metadata = {
  title: "PESO Lambunao — Public Employment Service Office",
  description:
    "Department announcements and active job postings curated by PESO Lambunao under the Department of Labor and Employment.",
  openGraph: {
    title: "PESO Lambunao",
    description:
      "Official information from the Public Employment Service Office of the Municipality of Lambunao.",
    images: ["/peso-logo.jpg"],
  },
};

const FEED_SIZE = 4;
const JOB_LIMIT = 5;
const TRUNCATE_LARGE = 360;
const TRUNCATE_SMALL = 180;

const EMPLOYMENT_TYPE_LABEL: Record<EmploymentType, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  TEMPORARY: "Temporary",
  INTERNSHIP: "Internship",
};

function smartTruncate(
  text: string,
  max: number,
): { display: string; truncated: boolean } {
  const trimmed = text.replace(/\s+\n/g, "\n").trim();
  if (trimmed.length <= max) return { display: trimmed, truncated: false };
  const slice = trimmed.slice(0, max);
  const lastBreak = Math.max(slice.lastIndexOf(" "), slice.lastIndexOf("\n"));
  const cut = lastBreak > max * 0.6 ? slice.slice(0, lastBreak) : slice;
  return { display: `${cut.trimEnd()}…`, truncated: true };
}

function formatLongDate(value: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatShortDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

function formatTodayLong(): string {
  return new Date().toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

export default async function PublicLandingPage() {
  const [pinned, jobs] = await Promise.all([
    getPinnedNewsPost(),
    getActiveJobs(JOB_LIMIT),
  ]);
  const feed = await getLatestNewsPosts(
    FEED_SIZE,
    pinned ? pinned.id : undefined,
  );

  return (
    <>
      <Hero activeJobsCount={jobs.length} />

      {pinned ? <PinnedSpotlight post={pinned} /> : null}

      <NewsBento posts={feed} />

      <ActiveJobsSection jobs={jobs} />

      <ApplyStrip />
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Hero — Editorial Split. Massive serif wordmark left, editorial fact
 * panel right (today's date + active-openings count + status).
 * ────────────────────────────────────────────────────────────────────── */

function Hero({ activeJobsCount }: { activeJobsCount: number }) {
  return (
    <section className="relative isolate overflow-hidden">
      <AmbientMesh tone="warm" position="absolute" />
      <div className="relative mx-auto grid w-full max-w-6xl gap-16 px-6 py-24 md:grid-cols-12 md:gap-12 md:px-10 md:py-32 lg:gap-20 lg:py-40">
        {/* —— Left: editorial wordmark column —— */}
        <div className="md:col-span-7">
          <Reveal delay={40}>
            <EyebrowTag tone="primary" dot>
              DOLE · National Skills Registration Program
            </EyebrowTag>
          </Reveal>
          <Reveal delay={140}>
            <h1 className="mt-7 font-serif text-[clamp(3rem,7.5vw,6.25rem)] font-medium leading-[0.95] tracking-[-0.035em] text-foreground">
              PESO
              <span className="block text-foreground/55">
                Municipality of
              </span>
              <span className="block">Lambunao.</span>
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="mt-8 max-w-xl text-[16px] leading-relaxed text-foreground/85">
              The Public Employment Service Office publishes verified job
              openings and department announcements here, curated by PESO
              staff for residents of Lambunao and Region&nbsp;VI.
            </p>
          </Reveal>
          <Reveal delay={340}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <PillLink
                href="/jobs"
                variant="primary"
                size="lg"
                icon={Compass}
              >
                Browse jobs
              </PillLink>
              <PillLink
                href="/news"
                variant="ghost"
                size="lg"
                icon={Newspaper}
              >
                Read announcements
              </PillLink>
            </div>
          </Reveal>
        </div>

        {/* —— Right: editorial fact panel —— */}
        <Reveal delay={420} className="md:col-span-5">
          <BezelSurface
            radius="3xl"
            shellPadding="2"
            glow
            innerClassName="relative overflow-hidden p-7 sm:p-8"
          >
            <div className="space-y-7">
              <div className="flex items-baseline justify-between gap-4 border-b border-foreground/[0.06] pb-5">
                <EyebrowTag tone="muted">Today</EyebrowTag>
                <span
                  data-tabular
                  className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground"
                >
                  {formatTodayLong()}
                </span>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Currently posted
                </p>
                <p
                  data-tabular
                  className="mt-3 font-serif text-[clamp(2.75rem,5vw,4rem)] font-medium leading-none tracking-[-0.03em] text-foreground"
                >
                  {String(activeJobsCount).padStart(2, "0")}
                </p>
                <p className="mt-2 text-[13.5px] text-foreground/70">
                  active job posting{activeJobsCount === 1 ? "" : "s"} on the
                  public board
                </p>
              </div>

              <ul className="space-y-3 border-t border-foreground/[0.06] pt-5 text-[13px]">
                <li className="flex items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground/[0.04] text-foreground/70 ring-1 ring-inset ring-foreground/[0.06]">
                    <HairlineIcon icon={MapPin} className="size-3.5" />
                  </span>
                  <span className="text-foreground/85">
                    Walk-in applications at PESO Lambunao Municipal Hall
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground/[0.04] text-foreground/70 ring-1 ring-inset ring-foreground/[0.06]">
                    <HairlineIcon icon={CalendarClock} className="size-3.5" />
                  </span>
                  <span className="text-foreground/85">
                    Office hours, Monday – Friday
                  </span>
                </li>
              </ul>
            </div>
          </BezelSurface>
        </Reveal>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Pinned spotlight — full-width premium BezelSurface. Photos at the
 * top, caption below, single PillLink CTA.
 * ────────────────────────────────────────────────────────────────────── */

function PinnedSpotlight({ post }: { post: PublicNewsPost }) {
  const { display, truncated } = smartTruncate(post.caption, TRUNCATE_LARGE);
  return (
    <section className="relative px-6 pb-16 md:px-10 md:pb-24">
      <Reveal>
        <div className="mx-auto w-full max-w-6xl">
          <BezelSurface
            radius="3xl"
            shellPadding="2"
            glow
            innerClassName="overflow-hidden p-7 sm:p-10"
          >
            <div className="grid gap-10 md:grid-cols-12 md:gap-12">
              <div className="md:col-span-5">
                <EyebrowTag tone="primary" dot>
                  <Pin className="size-3" aria-hidden />
                  &nbsp;Pinned announcement
                </EyebrowTag>
                <h2 className="mt-6 font-serif text-[clamp(1.75rem,3.6vw,2.75rem)] font-medium leading-[1.05] tracking-[-0.025em] text-foreground">
                  Featured by PESO Lambunao.
                </h2>
                <p
                  data-tabular
                  className="mt-3 text-[12px] uppercase tracking-[0.18em] text-muted-foreground"
                >
                  Published {formatLongDate(post.published_at)}
                </p>
                <p className="mt-7 whitespace-pre-line text-[15.5px] leading-relaxed text-foreground/90">
                  <SafeText>{display}</SafeText>
                </p>
                <div className="mt-8">
                  <PillLink
                    href={`/news/${post.id}`}
                    variant="primary"
                    size="md"
                  >
                    {truncated ? "Read the full announcement" : "Open announcement"}
                  </PillLink>
                </div>
              </div>

              <div className="md:col-span-7">
                {post.photos.length > 0 ? (
                  <PinnedGallery postId={post.id} photos={post.photos} />
                ) : (
                  <div className="flex h-full min-h-[260px] items-center justify-center rounded-[1.25rem] bg-foreground/[0.025] ring-1 ring-inset ring-foreground/[0.06]">
                    <p className="font-serif text-[1.125rem] italic text-muted-foreground">
                      Caption-only announcement
                    </p>
                  </div>
                )}
              </div>
            </div>
          </BezelSurface>
        </div>
      </Reveal>
    </section>
  );
}

function PinnedGallery({
  postId,
  photos,
}: {
  postId: number;
  photos: PhotoEntry[];
}) {
  // Reuse the existing FeedGallery primitive — it already encodes the
  // 1 / 2-up / 3-up + N pattern and links every tile to /news/[id].
  return <FeedGallery postId={postId} photos={photos} />;
}

/* ──────────────────────────────────────────────────────────────────────
 * News bento — Asymmetrical: one feature card spanning 2 rows alongside
 * three smaller stacked cards. Falls back to a single-column stack on
 * mobile per the skill's mobile-collapse mandate.
 * ────────────────────────────────────────────────────────────────────── */

function NewsBento({ posts }: { posts: PublicNewsPost[] }) {
  return (
    <section className="relative border-t border-border bg-card/30 px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <header className="flex flex-wrap items-end justify-between gap-6 pb-12">
            <div className="max-w-xl">
              <EyebrowTag>Updates</EyebrowTag>
              <h2 className="mt-5 font-serif text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.05] tracking-[-0.025em] text-foreground">
                Latest
                <span className="block text-foreground/55">
                  announcements.
                </span>
              </h2>
            </div>
            <Link
              href="/news"
              className="group inline-flex items-center gap-2 text-[13px] font-medium tracking-[-0.005em] text-foreground/80 transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-foreground"
            >
              See all news
              <span className="flex size-7 items-center justify-center rounded-full bg-foreground/[0.05] ring-1 ring-inset ring-foreground/[0.06] transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-[1px] group-hover:translate-x-[2px]">
                <HairlineIcon icon={ArrowUpRight} className="size-3.5" />
              </span>
            </Link>
          </header>
        </Reveal>

        {posts.length === 0 ? (
          <Reveal delay={60}>
            <BezelSurface
              radius="2xl"
              shellPadding="1.5"
              innerClassName="px-8 py-12 text-center"
            >
              <p className="font-serif text-[1.125rem] italic text-foreground/70">
                No announcements yet — check back soon.
              </p>
            </BezelSurface>
          </Reveal>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:auto-rows-[minmax(0,1fr)]">
            {posts.map((post, index) => {
              const isFeature = index === 0;
              const colSpan = isFeature
                ? "md:col-span-7 md:row-span-3"
                : "md:col-span-5";
              return (
                <Reveal
                  key={post.id}
                  delay={80 + index * 80}
                  className={colSpan}
                >
                  <NewsBentoCard post={post} feature={isFeature} />
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function NewsBentoCard({
  post,
  feature,
}: {
  post: PublicNewsPost;
  feature: boolean;
}) {
  const { display, truncated } = smartTruncate(
    post.caption,
    feature ? TRUNCATE_LARGE : TRUNCATE_SMALL,
  );
  const detailHref = `/news/${post.id}`;
  const ordered = [...post.photos].sort(
    (a, b) => a.display_order - b.display_order,
  );
  return (
    <BezelSurface
      radius="2xl"
      shellPadding="1.5"
      tone="card"
      innerClassName={`flex h-full flex-col overflow-hidden ${
        feature ? "p-7 sm:p-8" : "p-6"
      }`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <EyebrowTag tone={feature ? "primary" : "default"}>
          {feature ? "Feature" : "Update"}
        </EyebrowTag>
        <span
          data-tabular
          className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
        >
          {formatLongDate(post.published_at)}
        </span>
      </div>

      {feature && ordered.length > 0 ? (
        <Link
          href={detailHref}
          className="mt-5 block overflow-hidden rounded-[1.25rem] bg-muted ring-1 ring-inset ring-foreground/[0.06]"
        >
          <span className="block aspect-[16/9] w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={publicMediaUrl(ordered[0]!.path)}
              alt={ordered[0]!.alt_text || "Announcement photo"}
              className="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.025]"
              loading="lazy"
            />
          </span>
        </Link>
      ) : null}

      <div className="mt-6 flex-1">
        <p
          className={`whitespace-pre-line ${
            feature
              ? "text-[15.5px] leading-relaxed"
              : "text-[14.5px] leading-relaxed"
          } text-foreground/90`}
        >
          <SafeText>{display}</SafeText>
        </p>
      </div>

      {!feature && ordered.length > 0 ? (
        <p
          data-tabular
          className="mt-5 inline-flex items-center gap-1.5 self-start rounded-full bg-foreground/[0.04] px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.16em] text-foreground/70 ring-1 ring-inset ring-foreground/[0.06]"
        >
          {ordered.length} photo{ordered.length === 1 ? "" : "s"}
        </p>
      ) : null}

      <div className="mt-6 flex items-center justify-between border-t border-foreground/[0.06] pt-5 text-[12px] text-muted-foreground">
        <Link
          href={detailHref}
          className="group inline-flex items-center gap-1.5 font-medium tracking-[-0.005em] text-foreground/85 transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-foreground"
        >
          {truncated ? "Read more" : "View announcement"}
          <span className="flex size-5 items-center justify-center rounded-full bg-foreground/[0.05] ring-1 ring-inset ring-foreground/[0.06] transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-[1px] group-hover:translate-x-[2px]">
            <HairlineIcon icon={ChevronRight} className="size-3" />
          </span>
        </Link>
        <span data-tabular>#{post.id}</span>
      </div>
    </BezelSurface>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Active jobs — bezel-surfaced list. Each row carries internal kinetic
 * tension: title left, employment-type chip + magnetic chevron right.
 * ────────────────────────────────────────────────────────────────────── */

function ActiveJobsSection({ jobs }: { jobs: PublicJobPosting[] }) {
  return (
    <section className="border-t border-border px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <header className="flex flex-wrap items-end justify-between gap-6 pb-10">
            <div className="max-w-xl">
              <EyebrowTag tone="primary" dot>
                Hiring now
              </EyebrowTag>
              <h2 className="mt-5 font-serif text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.05] tracking-[-0.025em] text-foreground">
                Active
                <span className="block text-foreground/55">openings.</span>
              </h2>
            </div>
            <Link
              href="/jobs"
              className="group inline-flex items-center gap-2 text-[13px] font-medium tracking-[-0.005em] text-foreground/80 transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-foreground"
            >
              See all openings
              <span className="flex size-7 items-center justify-center rounded-full bg-foreground/[0.05] ring-1 ring-inset ring-foreground/[0.06] transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-[1px] group-hover:translate-x-[2px]">
                <HairlineIcon icon={ArrowUpRight} className="size-3.5" />
              </span>
            </Link>
          </header>
        </Reveal>

        <Reveal delay={60}>
          {jobs.length === 0 ? (
            <BezelSurface
              radius="2xl"
              shellPadding="1.5"
              innerClassName="px-8 py-12 text-center"
            >
              <p className="font-serif text-[1.125rem] italic text-foreground/70">
                No active openings at the moment — please check again soon.
              </p>
            </BezelSurface>
          ) : (
            <BezelSurface
              radius="2xl"
              shellPadding="1.5"
              innerClassName="overflow-hidden"
            >
              <ul className="divide-y divide-foreground/[0.06]">
                {jobs.map((job) => (
                  <li key={job.id}>
                    <JobsBentoRow job={job} />
                  </li>
                ))}
              </ul>
            </BezelSurface>
          )}
        </Reveal>
      </div>
    </section>
  );
}

function JobsBentoRow({ job }: { job: PublicJobPosting }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group grid grid-cols-1 items-center gap-4 px-6 py-5 transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-foreground/[0.025] sm:grid-cols-[1.4fr_1fr_auto_auto] sm:px-7 sm:py-6"
    >
      <div className="min-w-0">
        <p className="text-[15.5px] font-medium tracking-[-0.005em] text-foreground">
          {job.title}
        </p>
        <p className="mt-0.5 text-[12.5px] text-muted-foreground">
          {job.employer_name}
        </p>
      </div>
      <p className="flex items-center gap-2 text-[13px] text-foreground/80">
        <span className="flex size-6 items-center justify-center rounded-full bg-foreground/[0.04] text-foreground/70 ring-1 ring-inset ring-foreground/[0.06]">
          <HairlineIcon icon={MapPin} className="size-3" />
        </span>
        <span className="truncate">{job.location}</span>
      </p>
      <span className="inline-flex w-fit items-center rounded-full bg-foreground/[0.04] px-2.5 py-1 text-[11px] font-medium tracking-[-0.005em] text-foreground/85 ring-1 ring-inset ring-foreground/[0.06]">
        {EMPLOYMENT_TYPE_LABEL[job.employment_type]}
      </span>
      <div className="flex items-center justify-end gap-3">
        <span
          data-tabular
          className="text-[12px] text-muted-foreground sm:text-right"
        >
          Apply by {formatShortDate(job.application_deadline)}
        </span>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground/[0.05] text-foreground/85 ring-1 ring-inset ring-foreground/[0.08] transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-[1px] group-hover:translate-x-[2px] group-hover:scale-[1.05]">
          <HairlineIcon icon={ArrowUpRight} className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Apply strip — invert tone BezelSurface for emphasis. Editorial serif
 * headline + restrained address block + subtle ambient mesh.
 * ────────────────────────────────────────────────────────────────────── */

function ApplyStrip() {
  return (
    <section className="relative px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <BezelSurface
            tone="invert"
            radius="3xl"
            shellPadding="2"
            innerClassName="relative overflow-hidden p-10 sm:p-14 md:p-16"
          >
            {/* subtle warm spotlight inside the dark core */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full opacity-70 blur-3xl"
              style={{
                background:
                  "radial-gradient(closest-side, color-mix(in oklch, var(--primary) 35%, transparent), transparent 70%)",
              }}
            />
            <div className="relative grid gap-10 md:grid-cols-12 md:gap-12">
              <div className="md:col-span-7">
                <EyebrowTag tone="muted" className="bg-background/10 text-background/80 ring-background/15">
                  How to apply
                </EyebrowTag>
                <h2 className="mt-6 font-serif text-[clamp(2rem,4.4vw,3.25rem)] font-medium leading-[1.02] tracking-[-0.03em] text-background">
                  Visit us
                  <span className="block text-background/60">in person.</span>
                </h2>
                <p className="mt-7 max-w-xl text-[15.5px] leading-relaxed text-background/85">
                  Submit applications at the PESO office during regular
                  office hours. Bring a valid government ID, your résumé,
                  and any supporting documents listed in the posting.
                </p>
              </div>
              <div className="md:col-span-5">
                <div className="rounded-[1.5rem] bg-background/[0.06] p-6 ring-1 ring-inset ring-background/15">
                  <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-background/65">
                    Office
                  </p>
                  <address className="mt-3 not-italic text-[15px] leading-relaxed text-background">
                    {/* TODO: replace with the verified office address once provided. */}
                    PESO Lambunao
                    <br />
                    Municipal Hall, Lambunao
                    <br />
                    Iloilo, Region&nbsp;VI
                  </address>
                  <div className="mt-6 flex items-center gap-3 border-t border-background/15 pt-5 text-[12px] text-background/70">
                    <span className="flex size-7 items-center justify-center rounded-full bg-background/[0.08] text-background/85 ring-1 ring-inset ring-background/15">
                      <HairlineIcon icon={CalendarClock} className="size-3.5" />
                    </span>
                    <span>Open Monday – Friday, regular office hours</span>
                  </div>
                </div>
              </div>
            </div>
          </BezelSurface>
        </Reveal>
      </div>
    </section>
  );
}
