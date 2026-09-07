import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { constructMetadata, generateAnimeJsonLd, generateBreadcrumbJsonLd } from '@/lib/metadata';
import { getUnifiedAnimeById } from '@/lib/animeApi';
import { AnimeDetailPage } from '@/views/AnimeDetailPage';

type Props = {
  params: Promise<{ malId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { malId } = await params;
  const id = parseInt(malId, 10);

  if (Number.isNaN(id)) {
    return constructMetadata({ title: 'Anime Not Found', noIndex: true });
  }

  try {
    const { data: anime } = await getUnifiedAnimeById(id);
    if (!anime) {
      return constructMetadata({ title: 'Anime Not Found', noIndex: true });
    }

    const imageUrl =
      anime.images?.webp?.large_image_url ||
      anime.images?.jpg?.large_image_url ||
      anime.images?.webp?.image_url ||
      anime.images?.jpg?.image_url ||
      '';

    return constructMetadata({
      title: anime.title_english || anime.title,
      description: anime.synopsis?.slice(0, 200) || `${anime.title} anime series details`,
      image: imageUrl,
      type: 'video.other',
      canonicalUrl: `/anime/${malId}`,
    });
  } catch {
    return constructMetadata({ title: 'Anime Details', canonicalUrl: `/anime/${malId}` });
  }
}

export default async function AnimePage(props: Props) {
  const { malId } = await props.params;
  const id = parseInt(malId, 10);

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

  const jsonLd = {
    ...generateAnimeJsonLd(anime),
    ...generateBreadcrumbJsonLd([
      { name: 'Home', url: '/' },
      { name: 'Anime', url: '/browse' },
      { name: anime.title_english || anime.title, url: `/anime/${malId}` },
    ]),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AnimeDetailPage malId={id} />
    </>
  );
}
