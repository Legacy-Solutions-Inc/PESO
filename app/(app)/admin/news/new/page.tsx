import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminsOnlyView } from "@/components/admin/admins-only-view";
import { publicMediaUrl } from "@/lib/storage/public-url";
import { NewsComposeForm } from "../_components/news-compose-form";

export default async function NewNewsPostPage() {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) return <AdminsOnlyView reason={adminCheck.error} />;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 pb-12">
      <nav aria-label="Breadcrumb" className="pt-2">
        <ol className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <li>
            <Link href="/dashboard" className="transition-colors hover:text-foreground">
              Dashboard
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-3" />
          </li>
          <li>
            <Link href="/admin/news" className="transition-colors hover:text-foreground">
              News
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-3" />
          </li>
          <li className="font-medium text-foreground">New post</li>
        </ol>
      </nav>

      <header>
        <h1 className="font-serif text-[clamp(1.5rem,2.4vw,2rem)] font-medium tracking-tight text-foreground">
          Compose announcement
        </h1>
        <p className="mt-2 text-[14px] text-muted-foreground">
          The post starts as a draft when you save. Photos can be added after
          the first save once the post has an id assigned.
        </p>
      </header>

      <NewsComposeForm mode="new" resolveStorageUrl={publicMediaUrl} />
    </div>
  );
}
