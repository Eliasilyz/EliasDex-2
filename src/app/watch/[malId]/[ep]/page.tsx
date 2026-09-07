import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { constructMetadata, generateEpisodeJsonLd, generateBreadcrumbJsonLd } from '@/lib/metadata';
import { getUnifiedAnimeById } from '@/lib/animeApi';
import { WatchPage } from '@/views/WatchPage';

type Props = {
  params: Promise<{ malId: string; ep: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { malId, ep } = await params;
  const id = parseInt(malId, 10);
  const epNum = parseInt(ep, 10) || 1;

  if (Number.isNaN(id)) {
    return constructMetadata({ title: 'Episode Not Found', noIndex: true });
  }

  try {
    const { data: anime } = await getUnifiedAnimeById(id);
    if (!anime) {
      return constructMetadata({ title: 'Episode Not Found', noIndex: true });
    }

    const title = `Watch Episode ${epNum} — ${anime.title_english || anime.title}`;
    const description = `Watch ${anime.title_english || anime.title} Episode ${epNum} in high quality with multiple streaming servers and subtitles.`;

    const imageUrl =
      anime.images?.webp?.large_image_url ||
      anime.images?.jpg?.large_image_url ||
      '';

    return constructMetadata({
      title,
      description,
      image: imageUrl,
      type: 'video.other',
      canonicalUrl: `/watch/${malId}/${ep}`,
    });
  } catch {
    return constructMetadata({ title: `Watch Episode ${epNum}`, canonicalUrl: `/watch/${malId}/${ep}` });
  }
}

export default async function EpisodeWatchPage(props: Props) {
  const { malId, ep } = await props.params;
  const id = parseInt(malId, 10);
  const epNum = parseInt(ep, 10) || 1;

  if (Number.isNaN(id)) {
    notFound();
  }

  let anime = null;
  try {
    const res = await getUnifiedAnimeById(id);
    anime = res?.data;
  } catch {}

  if (!anime) {
    notFound();
  }

  const imageUrl =
    anime.images?.webp?.large_image_url ||
    anime.images?.jpg?.large_image_url ||
    '';

  const animeTitle = anime.title_english || anime.title;

  const jsonLd = {
    ...generateEpisodeJsonLd(animeTitle, epNum, anime.synopsis || undefined, imageUrl),
    ...generateBreadcrumbJsonLd([
      { name: 'Home', url: '/' },
      { name: 'Anime', url: '/browse' },
      { name: animeTitle, url: `/anime/${malId}` },
      { name: `Episode ${epNum}`, url: `/watch/${malId}/${ep}` },
    ]),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WatchPage malId={id} epNum={epNum} />
    </>
  );
}
