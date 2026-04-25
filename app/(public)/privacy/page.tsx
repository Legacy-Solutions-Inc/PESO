import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy notice — PESO Lambunao",
  description:
    "How PESO Lambunao handles personal data on this public site and on the staff side, under the Philippine Data Privacy Act (RA 10173).",
};

export default function PrivacyNoticePage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-12">
      <header className="border-b border-border pb-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          PESO Lambunao
        </p>
        <h1 className="mt-3 font-serif text-[clamp(2rem,3.6vw,2.75rem)] font-medium tracking-tight text-foreground">
          Privacy notice
        </h1>
        <p
          data-tabular
          className="mt-2 text-[12.5px] text-muted-foreground"
        >
          Effective immediately upon publication.
        </p>
      </header>

      <div className="mt-10 space-y-10 text-[15px] leading-relaxed text-foreground">
        <section>
          <h2 className="font-serif text-[1.25rem] font-medium tracking-tight text-foreground">
            1. What this site collects from visitors
          </h2>
          <p className="mt-3">
            This public site does not collect personal data from visitors.
            There are no contact forms, no newsletter sign-up, no comments,
            no reactions, and no application flow. We do not run analytics
            or tracking scripts that store identifiers, cookies, or device
            fingerprints. Browsing the site does not require an account.
          </p>
          <p className="mt-3">
            Standard server logs at the hosting layer may record an IP
            address and a request timestamp for short-term operational
            purposes such as abuse detection. Those logs are not linked to
            any registered jobseeker record.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-[1.25rem] font-medium tracking-tight text-foreground">
            2. Personal data on the staff side
          </h2>
          <p className="mt-3">
            On the staff-only side of the system, PESO Lambunao processes
            personal data of jobseekers who register through the National
            Skills Registration Program (NSRP) of the Department of Labor
            and Employment. Processing is carried out under the Data
            Privacy Act of 2012{" "}
            <span className="text-muted-foreground">(Republic Act 10173)</span>{" "}
            and the implementing rules of the National Privacy Commission.
          </p>
          <p className="mt-3">
            Personal data is collected only for the lawful purposes set out
            in the system requirements: encoding of NSRP forms, record
            management, search and filtering for employment facilitation,
            and statistical export to DOLE. Access is restricted by role
            (Admin, Encoder, Viewer) and protected by row-level security
            in the database.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-[1.25rem] font-medium tracking-tight text-foreground">
            3. Your rights as a data subject
          </h2>
          <p className="mt-3">
            Under the Data Privacy Act, you have the right to be informed,
            the right to access your personal data, the right to object to
            processing, the right to correct inaccurate information, the
            right to erasure or blocking, the right to data portability, the
            right to file a complaint with the National Privacy Commission,
            and the right to claim damages for unlawful processing.
          </p>
          <p className="mt-3">
            We respond to data-subject requests within the periods required
            by law. To exercise these rights, contact us through the
            channels in the next section.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-[1.25rem] font-medium tracking-tight text-foreground">
            4. Contacting PESO Lambunao
          </h2>
          <address className="mt-3 not-italic">
            {/* TODO: replace placeholder address with the verified PESO Lambunao office address. */}
            PESO Lambunao Municipal Hall
            <br />
            Lambunao, Iloilo
            <br />
            Philippines
          </address>
          <p className="mt-3">
            For data-privacy enquiries, write to the PESO Lambunao Data
            Protection Officer at the office above, or via email to{" "}
            {/* TODO: replace placeholder address with the verified DPO email. */}
            <span className="rounded-sm bg-foreground/[0.04] px-1.5 py-0.5 font-mono text-[13px]">
              dpo@peso-lambunao
            </span>
            .
          </p>
        </section>

        <section>
          <h2 className="font-serif text-[1.25rem] font-medium tracking-tight text-foreground">
            5. Updates to this notice
          </h2>
          <p className="mt-3">
            We may revise this notice when laws, regulations, or our
            practices change. The most current version is always available
            at this URL.
          </p>
        </section>
      </div>
    </article>
  );
}
