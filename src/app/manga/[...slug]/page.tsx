import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { constructMetadata, generateMangaJsonLd, generateBreadcrumbJsonLd } from '@/lib/metadata';
import weebcentral from '@/lib/external/weebcentral';
import { MangaDetailPage } from '@/views/MangaDetailPage';

const WEEBCENTRAL_BASE = 'https://weebcentral.com/series';

type Props = {
  params: Promise<{ slug: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!slug || slug.length === 0) {
    return constructMetadata({ title: 'Manga Not Found', noIndex: true });
  }

  const seriesUrl = `${WEEBCENTRAL_BASE}/${slug.join('/')}`;

  try {
    const manga = await weebcentral.detail(seriesUrl);
    if (!manga || !manga.title) {
      return constructMetadata({ title: 'Manga Not Found', noIndex: true });
    }

    const title = `${manga.title} — Read Manga Online`;
    const description = manga.desc ? manga.desc.slice(0, 200) : `Read ${manga.title} manga chapters online in high quality.`;

    return constructMetadata({
      title,
      description,
      image: manga.cover,
      type: 'article',
      canonicalUrl: `/manga/${slug.join('/')}`,
    });
  } catch {
    const fallbackTitle = slug[slug.length - 1]?.replace(/-/g, ' ') || 'Manga';
    return constructMetadata({
      title: `${fallbackTitle} — Read Manga Online`,
      description: `Read ${fallbackTitle} manga chapters online in high quality.`,
      type: 'article',
      canonicalUrl: `/manga/${slug.join('/')}`,
    });
  }
}

export default async function MangaDetailRoute(props: Props) {
  const { slug } = await props.params;

  if (!slug || slug.length === 0) {
    notFound();
  }

  const seriesUrl = `${WEEBCENTRAL_BASE}/${slug.join('/')}`;

  let jsonLd = null;
  try {
    const manga = await weebcentral.detail(seriesUrl);
    if (manga && manga.title) {
      jsonLd = {
        ...generateMangaJsonLd({
          title: manga.title,
          description: manga.desc,
          imageUrl: manga.cover,
          chapters: manga.episodes?.[0]?.urls?.length || 0,
        }),
        ...generateBreadcrumbJsonLd([
          { name: 'Home', url: '/' },
          { name: 'Manga', url: '/manga' },
          { name: manga.title, url: `/manga/${slug.join('/')}` },
        ]),
      };
    }
  } catch {}

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <MangaDetailPage seriesUrl={seriesUrl} />
    </>
  );
}
