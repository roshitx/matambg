import type { Metadata } from "next";
import { fetchBerita } from "@/lib/api/news";
import { deriveTopics } from "@/lib/utils/trends";
import { BeritaHeader } from "@/components/berita/BeritaHeader";
import { NewsFeed } from "@/components/berita/NewsFeed";
import { BeritaSidebar } from "@/components/berita/BeritaSidebar";

export const revalidate = 21600;

export const metadata: Metadata = {
    title: "Berita MBG",
    description:
        "Kumpulan berita, kontroversi, dan perkembangan terbaru seputar program Makan Bergizi Gratis (MBG) Indonesia — diringkas AI dari berbagai sumber.",
};

export default async function BeritaPage() {
    const articles = await fetchBerita();
    const trendingTopics = deriveTopics(articles);

    return (
        <main className="w-full">
            <BeritaHeader articleCount={articles.length} />

            {/* Mobile: horizontal topic pills — derived from real articles */}
            {trendingTopics.length > 0 && (
                <div className="border-b border-border lg:hidden">
                    <div className="mx-auto max-w-6xl px-4 py-3">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Topik Trending
                        </p>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {trendingTopics.map((topic) => (
                                <span
                                    key={topic.label}
                                    className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-sm border border-border px-2.5 py-1 text-[10px] text-muted-foreground whitespace-nowrap"
                                >
                                    <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${topic.dot}`} />
                                    {topic.label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="mx-auto max-w-6xl px-4 py-8">
                <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                    {/* Main feed — 2/3 width */}
                    <div className="lg:col-span-2">
                        <NewsFeed initialArticles={articles} />
                    </div>

                    {/* Sidebar — 1/3 width, desktop only */}
                    <aside className="hidden lg:block">
                        <BeritaSidebar articles={articles} />
                    </aside>
                </div>
            </div>
        </main>
    );
}
