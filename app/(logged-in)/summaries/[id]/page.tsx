import { getSummaryById } from "@/lib/summaries";
import { formatDistanceToNow } from "date-fns";
import { currentUser } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";

export default async function SummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await currentUser();
  if (!user?.id) return redirect("/sign-in");

  const { id } = await params;
  const summary = await getSummaryById(user.id, id);
  if (!summary) return notFound();

  return (
    <main className="min-h-screen">
      <div className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <Button variant="ghost" asChild className="mb-6 -ml-2">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-600">
            <ArrowLeft className="w-4 h-4" />
            Your summaries
          </Link>
        </Button>

        <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-3 sm:gap-4">
            <FileText className="w-8 h-8 shrink-0 text-rose-400" />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                {summary.title || summary.file_name || "Untitled"}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {formatDistanceToNow(new Date(summary.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-6">
            <div className="prose prose-gray max-w-none text-gray-700 prose-p:leading-relaxed">
              <div
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: summary.summary_text.replace(/\n/g, "<br />"),
                }}
              />
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
