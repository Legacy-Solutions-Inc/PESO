import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { NewsFeedCard } from "@/components/public/news-feed-card";
import { JobRow } from "@/components/public/job-row";
import {
  getActiveJobs,
  getLatestNewsPosts,
  getPinnedNewsPost,
} from "./_data/queries";

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
      {/* —— Hero —— */}
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-3xl px-6 py-20 md:py-28">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            DOLE · National Skills Registration Program
          </p>
          <h1 className="mt-5 font-serif text-[clamp(2.5rem,5.2vw,4rem)] font-medium leading-[1.02] tracking-[-0.025em] text-foreground">
            PESO Lambunao.
          </h1>
          <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-foreground/85">
            The Public Employment Service Office of the Municipality of
            Lambunao publishes job openings and department announcements
            here, sourced and verified by PESO staff.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-[14px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Browse jobs
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/news"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-[14px] font-medium text-foreground transition-colors hover:bg-foreground/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              Read latest announcements
            </Link>
          </div>
        </div>
      </section>

      {/* —— Pinned post —— */}
      {pinned ? (
        <section className="border-b border-border">
          <div className="mx-auto w-full max-w-3xl px-6 py-12">
            <NewsFeedCard
              id={pinned.id}
              caption={pinned.caption}
              photos={pinned.photos}
              publishedAt={pinned.published_at}
              variant="pinned"
            />
          </div>
        </section>
      ) : null}

      {/* —— Latest news feed —— */}
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-3xl px-6 py-12">
          <header className="flex flex-wrap items-end justify-between gap-3 pb-8">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Updates
              </p>
              <h2 className="mt-2 font-serif text-[clamp(1.5rem,2.6vw,2rem)] font-medium tracking-tight text-foreground">
                Latest announcements
              </h2>
            </div>
            <Link
              href="/news"
              className="text-[13px] font-medium text-foreground/80 underline-offset-4 hover:underline"
            >
              See all news →
            </Link>
          </header>

          {feed.length === 0 ? (
            <p className="text-[14px] text-muted-foreground">
              No announcements yet — check back soon.
            </p>
          ) : (
            <ul className="space-y-6">
              {feed.map((post) => (
                <li key={post.id}>
                  <NewsFeedCard
                    id={post.id}
                    caption={post.caption}
                    photos={post.photos}
                    publishedAt={post.published_at}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* —— Active jobs —— */}
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-3xl px-6 py-12">
          <header className="flex flex-wrap items-end justify-between gap-3 pb-6">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Hiring now
              </p>
              <h2 className="mt-2 font-serif text-[clamp(1.5rem,2.6vw,2rem)] font-medium tracking-tight text-foreground">
                Active openings
              </h2>
            </div>
            <Link
              href="/jobs"
              className="text-[13px] font-medium text-foreground/80 underline-offset-4 hover:underline"
            >
              See all openings →
            </Link>
          </header>

          {jobs.length === 0 ? (
            <p className="text-[14px] text-muted-foreground">
              No active openings at the moment — please check again soon.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <ul className="divide-y divide-border">
                {jobs.map((job) => (
                  <li key={job.id}>
                    <JobRow
                      id={job.id}
                      title={job.title}
                      employer={job.employer_name}
                      location={job.location}
                      employmentType={job.employment_type}
                      applicationDeadline={job.application_deadline}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* —— How to apply —— */}
      <section>
        <div className="mx-auto w-full max-w-3xl px-6 py-12">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            How to apply
          </p>
          <h2 className="mt-2 font-serif text-[clamp(1.5rem,2.6vw,2rem)] font-medium tracking-tight text-foreground">
            Visit us in person.
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-foreground/85">
            Submit applications at the PESO office during regular office
            hours. Bring a valid government ID, your résumé, and any
            supporting documents listed in the posting.
          </p>
          <address className="mt-6 not-italic text-[14px] leading-relaxed text-foreground">
            {/* TODO: replace with the verified office address once provided. */}
            PESO Lambunao Municipal Hall
            <br />
            Lambunao, Iloilo
          </address>
        </div>
      </section>
    </>
  );
}
