import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { constructMetadata, generateChapterJsonLd, generateBreadcrumbJsonLd } from '@/lib/metadata';
import weebcentral from '@/lib/external/weebcentral';
import { MangaReaderPage } from '@/views/MangaReaderPage';

const WEEBCENTRAL_BASE = 'https://weebcentral.com';

type Props = {
  params: Promise<{ path: string[] }>;
  searchParams: Promise<{ series?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { path } = await params;
  const { series } = await searchParams;

  if (!path || path.length === 0) {
    return constructMetadata({ title: 'Chapter Not Found', noIndex: true });
  }

  const chapterUrl = `${WEEBCENTRAL_BASE}/chapters/${path.join('/')}`;

  let title = `Chapter ${path[path.length - 1]?.replace(/[^a-zA-Z0-9]/g, '') || ''}`;
  let imageUrl = undefined;
  let description = `Read ${title} of this manga chapter online.`;

  if (series) {
    try {
      const seriesUrl = `${WEEBCENTRAL_BASE}/series/${series}`;
      const manga = await weebcentral.detail(seriesUrl);
      if (manga && manga.title) {
        title = `${manga.title} — ${title}`;
        imageUrl = manga.cover;
        description = `Read ${title} online. Chapter info and manga details.`;
      }
    } catch {}
  }

  return constructMetadata({
    title,
    description,
    image: imageUrl,
    type: 'article',
    canonicalUrl: `/manga/read/${path.join('/')}`,
  });
}

export default async function MangaReaderRoute(props: Props) {
  const { path } = await props.params;
  const searchParams = await props.searchParams;

  if (!path || path.length === 0) {
    notFound();
  }

  const chapterUrl = `${WEEBCENTRAL_BASE}/chapters/${path.join('/')}`;
  const seriesSlug = searchParams?.series || '';
  let mangaUrl = '';

  if (seriesSlug) {
    try {
      const manga = await weebcentral.detail(`${WEEBCENTRAL_BASE}/series/${seriesSlug}`);
      if (manga) {
        mangaUrl = `${WEEBCENTRAL_BASE}/series/${seriesSlug}`;
      }
    } catch {}
  }

  let jsonLd = null;
  try {
    const manga = await weebcentral.detail(`${WEEBCENTRAL_BASE}/series/${seriesSlug}`);
    if (manga && manga.title) {
      const chapterNumber = parseInt(path[path.length - 1]?.replace(/[^0-9]/g, '') || '1', 10);
      jsonLd = {
        ...generateChapterJsonLd(manga.title, chapterNumber || 1),
        ...generateBreadcrumbJsonLd([
          { name: 'Home', url: '/' },
          { name: 'Manga', url: '/manga' },
          { name: manga.title, url: `/manga/${seriesSlug}` },
          { name: `Chapter ${chapterNumber || 1}`, url: `/manga/read/${path.join('/')}` },
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
      <MangaReaderPage chapterUrl={chapterUrl} mangaUrl={mangaUrl} />
    </>
  );
}
