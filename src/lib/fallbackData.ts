import {
  Anime,
  AnimeEpisode,
  Genre,
  AnimeCharacterRole,
  AnimeStaffMember,
  AnimeThemeSongs,
  AnimeRelation,
  AnimeExternalLink,
} from '../types';

export const FALLBACK_GENRES: Genre[] = [
  { mal_id: 1, name: 'Action', count: 4800 },
  { mal_id: 2, name: 'Adventure', count: 3900 },
  { mal_id: 4, name: 'Comedy', count: 6200 },
  { mal_id: 8, name: 'Drama', count: 3100 },
  { mal_id: 10, name: 'Fantasy', count: 4100 },
  { mal_id: 7, name: 'Mystery', count: 1800 },
  { mal_id: 22, name: 'Romance', count: 2500 },
  { mal_id: 24, name: 'Sci-Fi', count: 2900 },
  { mal_id: 36, name: 'Slice of Life', count: 2100 },
  { mal_id: 30, name: 'Sports', count: 1100 },
  { mal_id: 37, name: 'Supernatural', count: 2400 },
  { mal_id: 41, name: 'Suspense', count: 950 },
  { mal_id: 46, name: 'Award Winning', count: 500 },
  { mal_id: 62, name: 'Isekai', count: 1200 },
];

export const FALLBACK_ANIME_LIST: Anime[] = [
  {
    mal_id: 52991,
    title: 'Sousou no Frieren',
    title_english: 'Frieren: Beyond Journey\'s End',
    title_japanese: '葬送のフリーレン',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1015/138006.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1015/138006.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1015/138006l.webp',
      },
    },
    synopsis: 'During their decade-long quest, the hero Party—Himmel, Eisen, Heiter, and the elven mage Frieren—defeated the Demon King and brought peace to the realm. As an elf with a lifespan of over a thousand years, Frieren promises to visit her mortal companions again before departing on a journey to understand humanity and the fleeting nature of life.',
    type: 'TV',
    episodes: 28,
    status: 'Finished Airing',
    score: 9.38,
    scored_by: 450000,
    rank: 1,
    popularity: 42,
    rating: 'PG-13 - Teens 13 or older',
    year: 2023,
    season: 'fall',
    duration: '24 min per ep',
    genres: [
      { mal_id: 2, name: 'Adventure' },
      { mal_id: 8, name: 'Drama' },
      { mal_id: 10, name: 'Fantasy' },
    ],
    studios: [{ mal_id: 11, name: 'Madhouse' }],
    broadcast: { day: 'Fridays', time: '23:00', timezone: 'Asia/Tokyo', string: 'Fridays at 23:00 (JST)' },
  },
  {
    mal_id: 5114,
    title: 'Fullmetal Alchemist: Brotherhood',
    title_english: 'Fullmetal Alchemist: Brotherhood',
    title_japanese: '鋼の錬金術師 FULLMETAL ALCHEMIST',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1223/96541.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1223/96541l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1223/96541.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1223/96541l.webp',
      },
    },
    synopsis: 'After a horrific alchemy experiment goes wrong in the Elric household, brothers Edward and Alphonse are left in a catastrophic new reality. Disregarding the alchemical taboo of human transmutation, the boys attempted to bring their recently deceased mother back to life, losing limbs and bodies in the process.',
    type: 'TV',
    episodes: 64,
    status: 'Finished Airing',
    score: 9.10,
    scored_by: 2100000,
    rank: 2,
    popularity: 3,
    rating: 'R - 17+ (violence & profanity)',
    year: 2009,
    season: 'spring',
    duration: '24 min per ep',
    genres: [
      { mal_id: 1, name: 'Action' },
      { mal_id: 2, name: 'Adventure' },
      { mal_id: 8, name: 'Drama' },
      { mal_id: 10, name: 'Fantasy' },
    ],
    studios: [{ mal_id: 4, name: 'Bones' }],
    broadcast: { day: 'Sundays', time: '17:00', timezone: 'Asia/Tokyo', string: 'Sundays at 17:00 (JST)' },
  },
  {
    mal_id: 52299,
    title: 'Ore dake Level Up na Ken',
    title_english: 'Solo Leveling',
    title_japanese: '俺だけレベルアップな件',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1598/147170.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1598/147170l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1598/147170.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1598/147170l.webp',
      },
    },
    synopsis: 'A decade ago, "the Gate" appeared and connected the real world with the realm of magic and monsters. To combat these vile beasts, ordinary people were bestowed with superhuman powers and became known as "Hunters." Twenty-year-old Sung Jin-Woo is one such Hunter, but he is known as the "World\'s Weakest," risking his life in low-level dungeons.',
    type: 'TV',
    episodes: 12,
    status: 'Finished Airing',
    score: 8.35,
    scored_by: 680000,
    rank: 205,
    popularity: 76,
    rating: 'R - 17+ (violence & profanity)',
    year: 2024,
    season: 'winter',
    duration: '24 min per ep',
    genres: [
      { mal_id: 1, name: 'Action' },
      { mal_id: 10, name: 'Fantasy' },
      { mal_id: 2, name: 'Adventure' },
    ],
    studios: [{ mal_id: 56, name: 'A-1 Pictures' }],
    broadcast: { day: 'Sundays', time: '00:00', timezone: 'Asia/Tokyo', string: 'Sundays at 00:00 (JST)' },
  },
  {
    mal_id: 40748,
    title: 'Jujutsu Kaisen',
    title_english: 'Jujutsu Kaisen',
    title_japanese: '呪術廻戦',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1171/109222.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1171/109222l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1171/109222.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1171/109222l.webp',
      },
    },
    synopsis: 'Idly indulging in paranormal activities with the Occult Club, high schooler Yuuji Itadori spends his days at either the clubroom or the hospital visiting his bedridden grandfather. However, his leisurely lifestyle takes a sudden turn when he unknowingly swallows a cursed object—the severed finger of the demon king Ryomen Sukuna.',
    type: 'TV',
    episodes: 24,
    status: 'Finished Airing',
    score: 8.60,
    scored_by: 1700000,
    rank: 75,
    popularity: 18,
    rating: 'R - 17+ (violence & profanity)',
    year: 2020,
    season: 'fall',
    duration: '23 min per ep',
    genres: [
      { mal_id: 1, name: 'Action' },
      { mal_id: 10, name: 'Fantasy' },
      { mal_id: 37, name: 'Supernatural' },
    ],
    studios: [{ mal_id: 569, name: 'MAPPA' }],
    broadcast: { day: 'Saturdays', time: '01:25', timezone: 'Asia/Tokyo', string: 'Saturdays at 01:25 (JST)' },
  },
  {
    mal_id: 38000,
    title: 'Kimetsu no Yaiba',
    title_english: 'Demon Slayer: Kimetsu no Yaiba',
    title_japanese: '鬼滅の刃',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1286/99889l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1286/99889.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1286/99889l.webp',
      },
    },
    synopsis: 'Ever since the death of his father, the burden of supporting the family has fallen upon Tanjirou Kamado\'s shoulders. Though living impoverished on a remote mountain, the Kamado family are able to enjoy a relatively peaceful and happy life. One day, Tanjirou returns home to find his entire family slaughtered by a demon.',
    type: 'TV',
    episodes: 26,
    status: 'Finished Airing',
    score: 8.47,
    scored_by: 2200000,
    rank: 135,
    popularity: 7,
    rating: 'R - 17+ (violence & profanity)',
    year: 2019,
    season: 'spring',
    duration: '23 min per ep',
    genres: [
      { mal_id: 1, name: 'Action' },
      { mal_id: 10, name: 'Fantasy' },
      { mal_id: 37, name: 'Supernatural' },
    ],
    studios: [{ mal_id: 43, name: 'ufotable' }],
    broadcast: { day: 'Saturdays', time: '23:30', timezone: 'Asia/Tokyo', string: 'Saturdays at 23:30 (JST)' },
  },
  {
    mal_id: 16498,
    title: 'Shingeki no Kyojin',
    title_english: 'Attack on Titan',
    title_japanese: '進撃の巨人',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/10/47347l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/10/47347.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/10/47347l.webp',
      },
    },
    synopsis: 'Centuries ago, mankind was slaughtered to near extinction by monstrous humanoid creatures called Titans, forcing humans to hide in fear behind enormous concentric walls. What makes these giants truly terrifying is that their taste for human flesh is not born out of hunger but what appears to be out of pleasure.',
    type: 'TV',
    episodes: 25,
    status: 'Finished Airing',
    score: 8.55,
    scored_by: 2900000,
    rank: 98,
    popularity: 1,
    rating: 'R - 17+ (violence & profanity)',
    year: 2013,
    season: 'spring',
    duration: '24 min per ep',
    genres: [
      { mal_id: 1, name: 'Action' },
      { mal_id: 8, name: 'Drama' },
      { mal_id: 41, name: 'Suspense' },
    ],
    studios: [{ mal_id: 858, name: 'Wit Studio' }],
    broadcast: { day: 'Sundays', time: '01:58', timezone: 'Asia/Tokyo', string: 'Sundays at 01:58 (JST)' },
  },
  {
    mal_id: 21,
    title: 'One Piece',
    title_english: 'One Piece',
    title_japanese: 'ONE PIECE',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1244/138851.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1244/138851l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1244/138851.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1244/138851l.webp',
      },
    },
    synopsis: 'Barely surviving in a barrel after passing through a terrible whirlpool at sea, carefree Monkey D. Luffy ends up aboard a ship under attack by pirates. Despite being a naive-looking teenager, he is not to be underestimated: Luffy possesses the powers of the Gum-Gum Fruit and dreams of finding Gol D. Roger\'s greatest treasure, the One Piece.',
    type: 'TV',
    episodes: 1120,
    status: 'Currently Airing',
    score: 8.73,
    scored_by: 1400000,
    rank: 45,
    popularity: 20,
    rating: 'PG-13 - Teens 13 or older',
    year: 1999,
    season: 'fall',
    duration: '24 min per ep',
    genres: [
      { mal_id: 1, name: 'Action' },
      { mal_id: 2, name: 'Adventure' },
      { mal_id: 10, name: 'Fantasy' },
    ],
    studios: [{ mal_id: 18, name: 'Toei Animation' }],
    broadcast: { day: 'Sundays', time: '09:30', timezone: 'Asia/Tokyo', string: 'Sundays at 09:30 (JST)' },
  },
  {
    mal_id: 54900,
    title: 'Dandadan',
    title_english: 'Dandadan',
    title_japanese: 'ダンダダン',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1908/145890.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1908/145890l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1908/145890.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1908/145890l.webp',
      },
    },
    synopsis: 'Momo Ayase is a high school girl who believes in ghosts but denies aliens, while her classmate Ken Takakura (nicknamed Okarun) believes in extraterrestrials but denies ghosts. To settle their argument, the two agree to separate visits to paranormal hotspots, uncovering wild cosmic secrets.',
    type: 'TV',
    episodes: 12,
    status: 'Currently Airing',
    score: 8.52,
    scored_by: 320000,
    rank: 110,
    popularity: 145,
    rating: 'R - 17+ (violence & profanity)',
    year: 2024,
    season: 'fall',
    duration: '24 min per ep',
    genres: [
      { mal_id: 1, name: 'Action' },
      { mal_id: 4, name: 'Comedy' },
      { mal_id: 37, name: 'Supernatural' },
    ],
    studios: [{ mal_id: 1591, name: 'Science SARU' }],
    broadcast: { day: 'Thursdays', time: '00:26', timezone: 'Asia/Tokyo', string: 'Thursdays at 00:26 (JST)' },
  },
  {
    mal_id: 54595,
    title: 'Kusuriya no Hitorigoto',
    title_english: 'The Apothecary Diaries',
    title_japanese: '薬屋のひとりごと',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1708/138033.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1708/138033l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1708/138033.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1708/138033l.webp',
      },
    },
    synopsis: 'Maomao, an apothecary\'s daughter, has been snatched from her peaceful life and sold to the lowest echelons of the imperial palace. Though she plans to keep a low profile, her sharp intellect and keen curiosity lead her into uncovering complex palace conspiracies and imperial medical mysteries.',
    type: 'TV',
    episodes: 24,
    status: 'Finished Airing',
    score: 8.87,
    scored_by: 340000,
    rank: 24,
    popularity: 92,
    rating: 'PG-13 - Teens 13 or older',
    year: 2023,
    season: 'fall',
    duration: '22 min per ep',
    genres: [
      { mal_id: 8, name: 'Drama' },
      { mal_id: 7, name: 'Mystery' },
    ],
    studios: [{ mal_id: 28, name: 'OLM' }, { mal_id: 1087, name: 'TOHO animation STUDIO' }],
    broadcast: { day: 'Sundays', time: '01:05', timezone: 'Asia/Tokyo', string: 'Sundays at 01:05 (JST)' },
  },
  {
    mal_id: 50709,
    title: 'Chainsaw Man',
    title_english: 'Chainsaw Man',
    title_japanese: 'チェンソーマン',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1806/126216.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1806/126216l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1806/126216.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1806/126216l.webp',
      },
    },
    synopsis: 'Denji is robbed of a normal teenage life, left with nothing but his deceased father\'s overwhelming debt to the yakuza. His only companion is his pet, the chainsaw devil Pochita, with whom he slays devils for money that inevitably ends up in the gangsters\' pockets.',
    type: 'TV',
    episodes: 12,
    status: 'Finished Airing',
    score: 8.49,
    scored_by: 1200000,
    rank: 128,
    popularity: 35,
    rating: 'R - 17+ (violence & profanity)',
    year: 2022,
    season: 'fall',
    duration: '24 min per ep',
    genres: [
      { mal_id: 1, name: 'Action' },
      { mal_id: 37, name: 'Supernatural' },
    ],
    studios: [{ mal_id: 569, name: 'MAPPA' }],
    broadcast: { day: 'Wednesdays', time: '00:00', timezone: 'Asia/Tokyo', string: 'Wednesdays at 00:00 (JST)' },
  },
  {
    mal_id: 1535,
    title: 'Death Note',
    title_english: 'Death Note',
    title_japanese: 'DEATH NOTE',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/9/9453.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/9/9453l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/9/9453.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/9/9453l.webp',
      },
    },
    synopsis: 'A shinigami, as a god of death, can kill any person—provided they see their victim\'s face and write their victim\'s name in a notebook called a Death Note. One day, Ryuk drops his Death Note into the human realm, where prodigy high school student Light Yagami stumbles upon it.',
    type: 'TV',
    episodes: 37,
    status: 'Finished Airing',
    score: 8.62,
    scored_by: 2700000,
    rank: 72,
    popularity: 2,
    rating: 'R - 17+ (violence & profanity)',
    year: 2006,
    season: 'fall',
    duration: '23 min per ep',
    genres: [
      { mal_id: 37, name: 'Supernatural' },
      { mal_id: 41, name: 'Suspense' },
      { mal_id: 7, name: 'Mystery' },
    ],
    studios: [{ mal_id: 11, name: 'Madhouse' }],
    broadcast: { day: 'Wednesdays', time: '00:56', timezone: 'Asia/Tokyo', string: 'Wednesdays at 00:56 (JST)' },
  },
  {
    mal_id: 50172,
    title: 'Spy x Family',
    title_english: 'Spy x Family',
    title_japanese: 'SPY×FAMILY',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1441/122795.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1441/122795l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1441/122795.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1441/122795l.webp',
      },
    },
    synopsis: 'Master spy Twilight is unmatched when it comes to undercover missions on dangerous assignments. However, his latest mission "Operation Strix" requires him to marry and create a fake family in just seven days to infiltrate an elite private academy.',
    type: 'TV',
    episodes: 12,
    status: 'Finished Airing',
    score: 8.50,
    scored_by: 1400000,
    rank: 120,
    popularity: 38,
    rating: 'PG-13 - Teens 13 or older',
    year: 2022,
    season: 'spring',
    duration: '24 min per ep',
    genres: [
      { mal_id: 1, name: 'Action' },
      { mal_id: 4, name: 'Comedy' },
      { mal_id: 36, name: 'Slice of Life' },
    ],
    studios: [{ mal_id: 858, name: 'Wit Studio' }, { mal_id: 1835, name: 'CloverWorks' }],
    broadcast: { day: 'Saturdays', time: '23:00', timezone: 'Asia/Tokyo', string: 'Saturdays at 23:00 (JST)' },
  },
  {
    mal_id: 52034,
    title: 'Oshi no Ko',
    title_english: 'Oshi no Ko',
    title_japanese: '【推しの子】',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1812/134736.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1812/134736l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1812/134736.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1812/134736l.webp',
      },
    },
    synopsis: 'Sixteen-year-old Ai Hoshino is a talented and beautiful idol who is adored by her fans. She is the personification of a pure, young maiden. But all that glitters is not gold, and behind the spotlight lies a dark, unforgiving entertainment industry.',
    type: 'TV',
    episodes: 11,
    status: 'Finished Airing',
    score: 8.65,
    scored_by: 620000,
    rank: 65,
    popularity: 88,
    rating: 'PG-13 - Teens 13 or older',
    year: 2023,
    season: 'spring',
    duration: '24 min per ep',
    genres: [
      { mal_id: 8, name: 'Drama' },
      { mal_id: 37, name: 'Supernatural' },
    ],
    studios: [{ mal_id: 95, name: 'Doga Kobo' }],
    broadcast: { day: 'Wednesdays', time: '23:00', timezone: 'Asia/Tokyo', string: 'Wednesdays at 23:00 (JST)' },
  },
  {
    mal_id: 9253,
    title: 'Steins;Gate',
    title_english: 'Steins;Gate',
    title_japanese: 'STEINS;GATE',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1935/127974.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1935/127974l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1935/127974.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1935/127974l.webp',
      },
    },
    synopsis: 'Eccentric scientist Rintarou Okabe has an unending thirst for scientific exploration. Together with his quirky friend Mayuri and tech otaku Daru, Okabe operates the "Future Gadget Laboratory," accidentally creating a microwave that can send text messages into the past.',
    type: 'TV',
    episodes: 24,
    status: 'Finished Airing',
    score: 9.07,
    scored_by: 1450000,
    rank: 3,
    popularity: 13,
    rating: 'PG-13 - Teens 13 or older',
    year: 2011,
    season: 'spring',
    duration: '24 min per ep',
    genres: [
      { mal_id: 8, name: 'Drama' },
      { mal_id: 24, name: 'Sci-Fi' },
      { mal_id: 41, name: 'Suspense' },
    ],
    studios: [{ mal_id: 314, name: 'White Fox' }],
    broadcast: { day: 'Wednesdays', time: '02:05', timezone: 'Asia/Tokyo', string: 'Wednesdays at 02:05 (JST)' },
  },
  {
    mal_id: 11061,
    title: 'Hunter x Hunter (2011)',
    title_english: 'Hunter x Hunter (2011)',
    title_japanese: 'HUNTER×HUNTER（ハンター×ハンター）',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1337/99013.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1337/99013l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1337/99013.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1337/99013l.webp',
      },
    },
    synopsis: 'Hunters devote themselves to accomplishing hazardous tasks, all from traversing the world\'s uncharted territories to locating rare items and monsters. Twelve-year-old Gon Freecss determines to become a Hunter to find his father Ging, an accomplished legendary Hunter.',
    type: 'TV',
    episodes: 148,
    status: 'Finished Airing',
    score: 9.04,
    scored_by: 1750000,
    rank: 6,
    popularity: 10,
    rating: 'PG-13 - Teens 13 or older',
    year: 2011,
    season: 'fall',
    duration: '23 min per ep',
    genres: [
      { mal_id: 1, name: 'Action' },
      { mal_id: 2, name: 'Adventure' },
      { mal_id: 10, name: 'Fantasy' },
    ],
    studios: [{ mal_id: 11, name: 'Madhouse' }],
    broadcast: { day: 'Sundays', time: '10:55', timezone: 'Asia/Tokyo', string: 'Sundays at 10:55 (JST)' },
  },
  {
    mal_id: 37521,
    title: 'Vinland Saga',
    title_english: 'Vinland Saga',
    title_japanese: 'ヴィンランド・サガ',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1500/103005.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1500/103005l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1500/103005.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1500/103005l.webp',
      },
    },
    synopsis: 'Young Thorfinn grew up listening to the stories of old sailors who had traveled the ocean and reached the place of legend, Vinland. It is said to be warm and fertile, a place where there would be no need for fighting. However, war engulfs the realm and leads him into a quest for vengeance.',
    type: 'TV',
    episodes: 24,
    status: 'Finished Airing',
    score: 8.74,
    scored_by: 860000,
    rank: 42,
    popularity: 49,
    rating: 'R - 17+ (violence & profanity)',
    year: 2019,
    season: 'summer',
    duration: '24 min per ep',
    genres: [
      { mal_id: 1, name: 'Action' },
      { mal_id: 2, name: 'Adventure' },
      { mal_id: 8, name: 'Drama' },
    ],
    studios: [{ mal_id: 858, name: 'Wit Studio' }],
    broadcast: { day: 'Mondays', time: '00:10', timezone: 'Asia/Tokyo', string: 'Mondays at 00:10 (JST)' },
    trailer: {
      youtube_id: 'l_98K4_6UQ0',
      url: 'https://www.youtube.com/watch?v=l_98K4_6UQ0',
      embed_url: 'https://www.youtube-nocookie.com/embed/l_98K4_6UQ0',
    },
  },
  {
    mal_id: 20,
    title: 'Naruto',
    title_english: 'Naruto',
    title_japanese: 'ナルト',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/13/17405.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/13/17405l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/13/17405.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/13/17405l.webp',
      },
    },
    synopsis: 'Moments prior to Naruto Uzumaki\'s birth, a huge demon known as the Nine-Tailed Fox attacked the Hidden Leaf Village. Naruto grows up an outcast, but dreams of becoming the village leader and Hokage.',
    type: 'TV',
    episodes: 220,
    status: 'Finished Airing',
    score: 8.01,
    scored_by: 2800000,
    rank: 600,
    popularity: 8,
    rating: 'PG-13 - Teens 13 or older',
    year: 2002,
    season: 'fall',
    duration: '23 min per ep',
    genres: [
      { mal_id: 1, name: 'Action' },
      { mal_id: 2, name: 'Adventure' },
      { mal_id: 10, name: 'Fantasy' },
    ],
    studios: [{ mal_id: 1, name: 'Pierrot' }],
  },
  {
    mal_id: 1735,
    title: 'Naruto: Shippuuden',
    title_english: 'Naruto: Shippuden',
    title_japanese: 'NARUTO -ナルト- 疾風伝',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1565/111305.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1565/111305l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1565/111305.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1565/111305l.webp',
      },
    },
    synopsis: 'Two and a half years have passed since Naruto Uzumaki left the Hidden Leaf Village for intense training with Jiraiya. Now returned, Naruto and his friends face the growing threat of the Akatsuki organization.',
    type: 'TV',
    episodes: 500,
    status: 'Finished Airing',
    score: 8.27,
    scored_by: 2400000,
    rank: 300,
    popularity: 15,
    rating: 'PG-13 - Teens 13 or older',
    year: 2007,
    season: 'winter',
    duration: '23 min per ep',
    genres: [
      { mal_id: 1, name: 'Action' },
      { mal_id: 2, name: 'Adventure' },
      { mal_id: 10, name: 'Fantasy' },
    ],
    studios: [{ mal_id: 1, name: 'Pierrot' }],
  },
  {
    mal_id: 269,
    title: 'Bleach',
    title_english: 'Bleach',
    title_japanese: 'BLEACH - ブリーチ -',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/3/40451.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/3/40451l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/3/40451.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/3/40451l.webp',
      },
    },
    synopsis: 'Ichigo Kurosaki is an ordinary high schooler until his family is attacked by a Hollow, a corrupt spirit that seeks to devour human souls. He meets a Soul Reaper named Rukia Kuchiki, acquiring her powers to protect his loved ones.',
    type: 'TV',
    episodes: 366,
    status: 'Finished Airing',
    score: 7.93,
    scored_by: 1900000,
    rank: 700,
    popularity: 45,
    rating: 'PG-13 - Teens 13 or older',
    year: 2004,
    season: 'fall',
    duration: '24 min per ep',
    genres: [
      { mal_id: 1, name: 'Action' },
      { mal_id: 2, name: 'Adventure' },
      { mal_id: 37, name: 'Supernatural' },
    ],
    studios: [{ mal_id: 1, name: 'Pierrot' }],
  },
  {
    mal_id: 41467,
    title: 'Bleach: Sennen Kessen-hen',
    title_english: 'Bleach: Thousand-Year Blood War',
    title_japanese: 'BLEACH 千年血戦篇',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1764/126627.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1764/126627l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1764/126627.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1764/126627l.webp',
      },
    },
    synopsis: 'The Soul Society is suddenly assaulted by the Quincy army, the Wandenreich, led by their ancient emperor Yhwach. Ichigo Kurosaki must rise once again to defend the balance of the worlds.',
    type: 'TV',
    episodes: 13,
    status: 'Finished Airing',
    score: 9.01,
    scored_by: 510000,
    rank: 9,
    popularity: 110,
    rating: 'R - 17+ (violence & profanity)',
    year: 2022,
    season: 'fall',
    duration: '24 min per ep',
    genres: [
      { mal_id: 1, name: 'Action' },
      { mal_id: 2, name: 'Adventure' },
      { mal_id: 37, name: 'Supernatural' },
    ],
    studios: [{ mal_id: 1, name: 'Pierrot' }],
  },
  {
    mal_id: 31964,
    title: 'Boku no Hero Academia',
    title_english: 'My Hero Academia',
    title_japanese: '僕のヒーローアカデミア',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/10/78745.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/10/78745l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/10/78745.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/10/78745l.webp',
      },
    },
    synopsis: 'In a world where 80 percent of mankind possesses superpowers called "Quirks," Izuku Midoriya was born powerless. Yet he inherits the legendary Quirk One For All from All Might and enters UA High School.',
    type: 'TV',
    episodes: 13,
    status: 'Finished Airing',
    score: 7.87,
    scored_by: 2900000,
    rank: 850,
    popularity: 5,
    rating: 'PG-13 - Teens 13 or older',
    year: 2016,
    season: 'spring',
    duration: '24 min per ep',
    genres: [
      { mal_id: 1, name: 'Action' },
      { mal_id: 27, name: 'Shounen' },
    ],
    studios: [{ mal_id: 4, name: 'Bones' }],
  },
  {
    mal_id: 49596,
    title: 'Blue Lock',
    title_english: 'Blue Lock',
    title_japanese: 'ブルーロック',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1258/126929.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1258/126929l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1258/126929.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1258/126929l.webp',
      },
    },
    synopsis: 'After a disastrous defeat at the 2018 World Cup, Japan\'s team struggles to regroup. The enigmatic coach Jinpachi Ego creates Blue Lock, a prison-like facility where 300 strikers compete to become the greatest egotist forward.',
    type: 'TV',
    episodes: 24,
    status: 'Finished Airing',
    score: 8.23,
    scored_by: 580000,
    rank: 310,
    popularity: 95,
    rating: 'PG-13 - Teens 13 or older',
    year: 2022,
    season: 'fall',
    duration: '24 min per ep',
    genres: [
      { mal_id: 30, name: 'Sports' },
      { mal_id: 1, name: 'Action' },
    ],
    studios: [{ mal_id: 44, name: '8bit' }],
  },
  {
    mal_id: 52588,
    title: 'Kaijuu 8-gou',
    title_english: 'Kaiju No. 8',
    title_japanese: '怪獣8号',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1429/142490.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1429/142490l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1429/142490.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1429/142490l.webp',
      },
    },
    synopsis: 'In a monster-ravaged Japan, Kafka Hibino works cleaning up the corpses of slain Kaiju. After an encounter with a parasite kaiju, Kafka transforms into a powerful humanoid monster, while pursuing his dream of joining the Defense Force.',
    type: 'TV',
    episodes: 12,
    status: 'Finished Airing',
    score: 8.35,
    scored_by: 380000,
    rank: 215,
    popularity: 130,
    rating: 'PG-13 - Teens 13 or older',
    year: 2024,
    season: 'spring',
    duration: '23 min per ep',
    genres: [
      { mal_id: 1, name: 'Action' },
      { mal_id: 24, name: 'Sci-Fi' },
    ],
    studios: [{ mal_id: 10, name: 'Production I.G' }],
  },
  {
    mal_id: 813,
    title: 'Dragon Ball Z',
    title_english: 'Dragon Ball Z',
    title_japanese: 'ドラゴンボールZ',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1607/117271.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1607/117271l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1607/117271.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1607/117271l.webp',
      },
    },
    synopsis: 'Five years after winning the World Martial Arts tournament, Gokuu is now living a peaceful life with his wife and son. However, the arrival of a mysterious visitor named Raditz shatters the peace and reveals Gokuu\'s Saiyan heritage.',
    type: 'TV',
    episodes: 291,
    status: 'Finished Airing',
    score: 8.16,
    scored_by: 1500000,
    rank: 410,
    popularity: 50,
    rating: 'PG-13 - Teens 13 or older',
    year: 1989,
    season: 'spring',
    duration: '24 min per ep',
    genres: [
      { mal_id: 1, name: 'Action' },
      { mal_id: 2, name: 'Adventure' },
      { mal_id: 10, name: 'Fantasy' },
    ],
    studios: [{ mal_id: 18, name: 'Toei Animation' }],
  },
  {
    mal_id: 22319,
    title: 'Tokyo Ghoul',
    title_english: 'Tokyo Ghoul',
    title_japanese: '東京喰種トーキョーグール',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1498/134443.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1498/134443l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1498/134443.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1498/134443l.webp',
      },
    },
    synopsis: 'Ken Kaneki is a bookish college student who meets a girl named Rize at the cafe. Following an accident and emergency surgery, Kaneki receives organ transplants from Rize, transforming him into a half-ghoul who craves human flesh.',
    type: 'TV',
    episodes: 12,
    status: 'Finished Airing',
    score: 7.79,
    scored_by: 2800000,
    rank: 1050,
    popularity: 6,
    rating: 'R - 17+ (violence & profanity)',
    year: 2014,
    season: 'summer',
    duration: '24 min per ep',
    genres: [
      { mal_id: 1, name: 'Action' },
      { mal_id: 37, name: 'Supernatural' },
      { mal_id: 41, name: 'Suspense' },
    ],
    studios: [{ mal_id: 1, name: 'Pierrot' }],
  },
  {
    mal_id: 32182,
    title: 'Mob Psycho 100',
    title_english: 'Mob Psycho 100',
    title_japanese: 'モブサイコ100',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/8/80356.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/8/80356l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/8/80356.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/8/80356l.webp',
      },
    },
    synopsis: 'Eighth-grader Shigeo "Mob" Kageyama has tapped into his inner psychic powers at a young age. To prevent his powers from spiraling out of control, Mob lives under an emotional shackle under the guidance of his con-artist master Reigen Arataka.',
    type: 'TV',
    episodes: 12,
    status: 'Finished Airing',
    score: 8.49,
    scored_by: 2100000,
    rank: 130,
    popularity: 25,
    rating: 'PG-13 - Teens 13 or older',
    year: 2016,
    season: 'summer',
    duration: '24 min per ep',
    genres: [
      { mal_id: 1, name: 'Action' },
      { mal_id: 4, name: 'Comedy' },
      { mal_id: 37, name: 'Supernatural' },
    ],
    studios: [{ mal_id: 4, name: 'Bones' }],
  },
  {
    mal_id: 34572,
    title: 'Black Clover',
    title_english: 'Black Clover',
    title_japanese: 'ブラッククローバー',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/2/88336.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/2/88336l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/2/88336.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/2/88336l.webp',
      },
    },
    synopsis: 'Asta and Yuno are orphans raised in the outskirts of the Clover Kingdom. While Yuno is a magic prodigy, Asta has zero magic power. However, Asta receives a rare five-leaf clover grimoire wielding anti-magic swords.',
    type: 'TV',
    episodes: 170,
    status: 'Finished Airing',
    score: 7.96,
    scored_by: 1600000,
    rank: 640,
    popularity: 30,
    rating: 'PG-13 - Teens 13 or older',
    year: 2017,
    season: 'fall',
    duration: '23 min per ep',
    genres: [
      { mal_id: 1, name: 'Action' },
      { mal_id: 4, name: 'Comedy' },
      { mal_id: 10, name: 'Fantasy' },
    ],
    studios: [{ mal_id: 1, name: 'Pierrot' }],
  },
  {
    mal_id: 20583,
    title: 'Haikyuu!!',
    title_english: 'Haikyu!!',
    title_japanese: 'ハイキュー!!',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/7/76014.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/7/76014l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/7/76014.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/7/76014l.webp',
      },
    },
    synopsis: 'Inspired by watching a volleyball ace nicknamed the "Little Giant," short-statured Shouyou Hinata revives the volleyball club at his middle school and enters Karasuno High School.',
    type: 'TV',
    episodes: 25,
    status: 'Finished Airing',
    score: 8.44,
    scored_by: 1800000,
    rank: 160,
    popularity: 22,
    rating: 'PG-13 - Teens 13 or older',
    year: 2014,
    season: 'spring',
    duration: '24 min per ep',
    genres: [
      { mal_id: 30, name: 'Sports' },
      { mal_id: 8, name: 'Drama' },
    ],
    studios: [{ mal_id: 10, name: 'Production I.G' }],
  },
  {
    mal_id: 11757,
    title: 'Sword Art Online',
    title_english: 'Sword Art Online',
    title_japanese: 'ソードアート・オンライン',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/11/39717.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/11/39717l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/11/39717.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/11/39717l.webp',
      },
    },
    synopsis: 'In the year 2022, ten thousand gamers log into Sword Art Online, a cutting-edge virtual reality MMORPG. However, the creator traps them inside the game where dying in-game means dying in real life.',
    type: 'TV',
    episodes: 25,
    status: 'Finished Airing',
    score: 7.20,
    scored_by: 3100000,
    rank: 2900,
    popularity: 4,
    rating: 'PG-13 - Teens 13 or older',
    year: 2012,
    season: 'summer',
    duration: '23 min per ep',
    genres: [
      { mal_id: 1, name: 'Action' },
      { mal_id: 2, name: 'Adventure' },
      { mal_id: 10, name: 'Fantasy' },
      { mal_id: 22, name: 'Romance' },
    ],
    studios: [{ mal_id: 56, name: 'A-1 Pictures' }],
  },
  {
    mal_id: 1575,
    title: 'Code Geass: Hangyaku no Lelouch',
    title_english: 'Code Geass: Lelouch of the Rebellion',
    title_japanese: 'コードギアス 反逆のルルーシュ',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1032/135088.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1032/135088l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1032/135088.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1032/135088l.webp',
      },
    },
    synopsis: 'Exiled Britannian prince Lelouch vi Britannia gains the power of absolute obedience known as "Geass" from the mysterious C.C., embarking on a ruthless revolution as the masked vigilante Zero.',
    type: 'TV',
    episodes: 25,
    status: 'Finished Airing',
    score: 8.70,
    scored_by: 2200000,
    rank: 55,
    popularity: 16,
    rating: 'R - 17+ (violence & profanity)',
    year: 2006,
    season: 'fall',
    duration: '24 min per ep',
    genres: [
      { mal_id: 1, name: 'Action' },
      { mal_id: 8, name: 'Drama' },
      { mal_id: 24, name: 'Sci-Fi' },
    ],
    studios: [{ mal_id: 14, name: 'Sunrise' }],
  },
  {
    mal_id: 31240,
    title: 'Re:Zero kara Hajimeru Isekai Seikatsu',
    title_english: 'Re:ZERO -Starting Life in Another World-',
    title_japanese: 'Re:ゼロから始める異世界生活',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/11/79410.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/11/79410l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/11/79410.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/11/79410l.webp',
      },
    },
    synopsis: 'Subaru Natsuki is suddenly summoned to a fantasy world. When he and a half-elf maiden are brutally killed, Subaru discovers he has the terrifying ability to "Return by Death," rewinding time to a prior checkpoint upon demise.',
    type: 'TV',
    episodes: 25,
    status: 'Finished Airing',
    score: 8.24,
    scored_by: 2100000,
    rank: 305,
    popularity: 19,
    rating: 'R - 17+ (violence & profanity)',
    year: 2016,
    season: 'spring',
    duration: '25 min per ep',
    genres: [
      { mal_id: 8, name: 'Drama' },
      { mal_id: 10, name: 'Fantasy' },
      { mal_id: 41, name: 'Suspense' },
    ],
    studios: [{ mal_id: 314, name: 'White Fox' }],
  },
  {
    mal_id: 37999,
    title: 'Kaguya-sama wa Kokurasetai: Tensai-tachi no Renai Zunousen',
    title_english: 'Kaguya-sama: Love is War',
    title_japanese: 'かぐや様は告らせたい～天才たちの恋愛頭脳戦～',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/3/90538.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/3/90538l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/3/90538.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/3/90538l.webp',
      },
    },
    synopsis: 'At the prestigious Shuchiin Academy, student council president Miyuki Shirogane and vice-president Kaguya Shinomiya appear to be the perfect couple. Both are too proud to confess their feelings, turning romance into an elaborate war of wits.',
    type: 'TV',
    episodes: 12,
    status: 'Finished Airing',
    score: 8.41,
    scored_by: 1700000,
    rank: 180,
    popularity: 28,
    rating: 'PG-13 - Teens 13 or older',
    year: 2019,
    season: 'winter',
    duration: '25 min per ep',
    genres: [
      { mal_id: 4, name: 'Comedy' },
      { mal_id: 22, name: 'Romance' },
    ],
    studios: [{ mal_id: 56, name: 'A-1 Pictures' }],
  },
  {
    mal_id: 39535,
    title: 'Mushoku Tensei: Isekai Ittara Honki Dasu',
    title_english: 'Mushoku Tensei: Jobless Reincarnation',
    title_japanese: '無職転生 ～異世界行ったら本気だす～',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1545/110796.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1545/110796l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1545/110796.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1545/110796l.webp',
      },
    },
    synopsis: 'A 34-year-old shut-in dies saving others and reincarnates in a magical world as Rudeus Greyrat. Keeping his memories, Rudeus resolves to live his new life to the fullest without regrets.',
    type: 'TV',
    episodes: 11,
    status: 'Finished Airing',
    score: 8.36,
    scored_by: 1100000,
    rank: 210,
    popularity: 58,
    rating: 'R - 17+ (violence & profanity)',
    year: 2021,
    season: 'winter',
    duration: '23 min per ep',
    genres: [
      { mal_id: 8, name: 'Drama' },
      { mal_id: 10, name: 'Fantasy' },
      { mal_id: 2, name: 'Adventure' },
    ],
    studios: [{ mal_id: 1993, name: 'Studio Bind' }],
  },
  {
    mal_id: 1,
    title: 'Cowboy Bebop',
    title_english: 'Cowboy Bebop',
    title_japanese: 'カウボーイビバップ',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/4/19644.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/4/19644l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/4/19644.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/4/19644l.webp',
      },
    },
    synopsis: 'In the year 2071, humanity has colonized several of the planets and moons of the solar system. Spike Spiegel and Jet Black hunt criminals as bounty hunters aboard their spaceship, the Bebop.',
    type: 'TV',
    episodes: 26,
    status: 'Finished Airing',
    score: 8.75,
    scored_by: 1800000,
    rank: 41,
    popularity: 43,
    rating: 'R - 17+ (violence & profanity)',
    year: 1998,
    season: 'spring',
    duration: '24 min per ep',
    genres: [
      { mal_id: 1, name: 'Action' },
      { mal_id: 24, name: 'Sci-Fi' },
    ],
    studios: [{ mal_id: 14, name: 'Sunrise' }],
  },
  {
    mal_id: 30,
    title: 'Neon Genesis Evangelion',
    title_english: 'Neon Genesis Evangelion',
    title_japanese: '新世紀エヴァンゲリオン',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1314/108941.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1314/108941l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1314/108941.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1314/108941l.webp',
      },
    },
    synopsis: 'Fifteen years after a cataclysmic event known as the Second Impact, the world faces a new threat: monstrous celestial beings called "Angels." Fourteen-year-old Shinji Ikari is coerced into piloting the biomechanical Evangelion Unit-01.',
    type: 'TV',
    episodes: 26,
    status: 'Finished Airing',
    score: 8.36,
    scored_by: 1850000,
    rank: 212,
    popularity: 47,
    rating: 'R - 17+ (violence & profanity)',
    year: 1995,
    season: 'fall',
    duration: '24 min per ep',
    genres: [
      { mal_id: 1, name: 'Action' },
      { mal_id: 8, name: 'Drama' },
      { mal_id: 24, name: 'Sci-Fi' },
      { mal_id: 41, name: 'Suspense' },
    ],
    studios: [{ mal_id: 6, name: 'Gainax' }, { mal_id: 103, name: 'Tatsunoko Production' }],
  },
  {
    mal_id: 47917,
    title: 'Bocchi the Rock!',
    title_english: 'Bocchi the Rock!',
    title_japanese: 'ぼっち・ざ・ろっく！',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1448/127956.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1448/127956l.jpg',
      },
      webp: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1448/127956.webp',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1448/127956l.webp',
      },
    },
    synopsis: 'Hitori "Bocchi" Gotou is an introverted high school girl who yearns to make friends and play in a band. One day, drummer Nijika Ijichi invites her to join Kessoku Band.',
    type: 'TV',
    episodes: 12,
    status: 'Finished Airing',
    score: 8.81,
    scored_by: 520000,
    rank: 30,
    popularity: 140,
    rating: 'PG-13 - Teens 13 or older',
    year: 2022,
    season: 'fall',
    duration: '23 min per ep',
    genres: [
      { mal_id: 4, name: 'Comedy' },
      { mal_id: 36, name: 'Slice of Life' },
    ],
    studios: [{ mal_id: 1835, name: 'CloverWorks' }],
  },
];

// Enrich top items with trailers
FALLBACK_ANIME_LIST[0].trailer = {
  youtube_id: 'qgQunxD0qMo',
  url: 'https://www.youtube.com/watch?v=qgQunxD0qMo',
  embed_url: 'https://www.youtube-nocookie.com/embed/qgQunxD0qMo',
};
FALLBACK_ANIME_LIST[1].trailer = {
  youtube_id: '--IcmZkvL0Q',
  url: 'https://www.youtube.com/watch?v=--IcmZkvL0Q',
  embed_url: 'https://www.youtube-nocookie.com/embed/--IcmZkvL0Q',
};
FALLBACK_ANIME_LIST[2].trailer = {
  youtube_id: 'mZ0L_PzQkpk',
  url: 'https://www.youtube.com/watch?v=mZ0L_PzQkpk',
  embed_url: 'https://www.youtube-nocookie.com/embed/mZ0L_PzQkpk',
};
FALLBACK_ANIME_LIST[3].trailer = {
  youtube_id: 'pkKu9hLT-t8',
  url: 'https://www.youtube.com/watch?v=pkKu9hLT-t8',
  embed_url: 'https://www.youtube-nocookie.com/embed/pkKu9hLT-t8',
};
FALLBACK_ANIME_LIST[4].trailer = {
  youtube_id: 'VQGCKyvzIM4',
  url: 'https://www.youtube.com/watch?v=VQGCKyvzIM4',
  embed_url: 'https://www.youtube-nocookie.com/embed/VQGCKyvzIM4',
};
FALLBACK_ANIME_LIST[5].trailer = {
  youtube_id: 'MGRm4IzK1SQ',
  url: 'https://www.youtube.com/watch?v=MGRm4IzK1SQ',
  embed_url: 'https://www.youtube-nocookie.com/embed/MGRm4IzK1SQ',
};
FALLBACK_ANIME_LIST[7].trailer = {
  youtube_id: '7pL4e6zLw6Y',
  url: 'https://www.youtube.com/watch?v=7pL4e6zLw6Y',
  embed_url: 'https://www.youtube-nocookie.com/embed/7pL4e6zLw6Y',
};
FALLBACK_ANIME_LIST[8].trailer = {
  youtube_id: 'zY5k_q_U4_I',
  url: 'https://www.youtube.com/watch?v=zY5k_q_U4_I',
  embed_url: 'https://www.youtube-nocookie.com/embed/zY5k_q_U4_I',
};

/**
 * Curated Characters dataset for fallback
 */
export const FALLBACK_CHARACTERS: Record<number, AnimeCharacterRole[]> = {
  // Frieren (52991)
  52991: [
    {
      character: {
        mal_id: 184064,
        name: 'Frieren',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/characters/16/521197.jpg' } },
      },
      role: 'Main',
      voice_actors: [
        { person: { mal_id: 10693, name: 'Atsumi Tanezaki', images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/voiceactors/2/67975.jpg' } } }, language: 'Japanese' },
        { person: { mal_id: 28383, name: 'Mallorie Rodak' }, language: 'English' },
      ],
    },
    {
      character: {
        mal_id: 184065,
        name: 'Fern',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/characters/8/521198.jpg' } },
      },
      role: 'Main',
      voice_actors: [
        { person: { mal_id: 47444, name: 'Kana Ichinose', images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/voiceactors/3/53342.jpg' } } }, language: 'Japanese' },
        { person: { mal_id: 30141, name: 'Jill Harris' }, language: 'English' },
      ],
    },
    {
      character: {
        mal_id: 184066,
        name: 'Stark',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/characters/6/521199.jpg' } },
      },
      role: 'Main',
      voice_actors: [
        { person: { mal_id: 46974, name: 'Chiaki Kobayashi', images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/voiceactors/1/54955.jpg' } } }, language: 'Japanese' },
        { person: { mal_id: 51226, name: 'Jordan Dash Cruz' }, language: 'English' },
      ],
    },
    {
      character: {
        mal_id: 184067,
        name: 'Himmel',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/characters/5/521200.jpg' } },
      },
      role: 'Supporting',
      voice_actors: [
        { person: { mal_id: 270, name: 'Nobuhiko Okamoto', images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/voiceactors/3/46889.jpg' } } }, language: 'Japanese' },
        { person: { mal_id: 10464, name: 'Clifford Chapin' }, language: 'English' },
      ],
    },
    {
      character: {
        mal_id: 184068,
        name: 'Heiter',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/characters/2/521201.jpg' } },
      },
      role: 'Supporting',
      voice_actors: [
        { person: { mal_id: 236, name: 'Hiroki Touchi' }, language: 'Japanese' },
        { person: { mal_id: 486, name: 'Jason Douglas' }, language: 'English' },
      ],
    },
    {
      character: {
        mal_id: 184069,
        name: 'Eisen',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/characters/11/521202.jpg' } },
      },
      role: 'Supporting',
      voice_actors: [
        { person: { mal_id: 1729, name: 'Youji Ueda' }, language: 'Japanese' },
        { person: { mal_id: 10599, name: 'Christopher Guerrero' }, language: 'English' },
      ],
    },
    {
      character: {
        mal_id: 201201,
        name: 'Serie',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/characters/15/534241.jpg' } },
      },
      role: 'Supporting',
      voice_actors: [
        { person: { mal_id: 588, name: 'Mariya Ise' }, language: 'Japanese' },
        { person: { mal_id: 10328, name: 'Anastasia Munoz' }, language: 'English' },
      ],
    },
  ],

  // Fullmetal Alchemist: Brotherhood (5114)
  5114: [
    {
      character: {
        mal_id: 11,
        name: 'Edward Elric',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/characters/9/72533.jpg' } },
      },
      role: 'Main',
      voice_actors: [
        { person: { mal_id: 82, name: 'Romi Park', images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/voiceactors/2/54898.jpg' } } }, language: 'Japanese' },
        { person: { mal_id: 67, name: 'Vic Mignogna' }, language: 'English' },
      ],
    },
    {
      character: {
        mal_id: 12,
        name: 'Alphonse Elric',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/characters/5/54265.jpg' } },
      },
      role: 'Main',
      voice_actors: [
        { person: { mal_id: 86, name: 'Rie Kugimiya', images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/voiceactors/3/54899.jpg' } } }, language: 'Japanese' },
        { person: { mal_id: 7927, name: 'Maxey Whitehead' }, language: 'English' },
      ],
    },
    {
      character: {
        mal_id: 68,
        name: 'Roy Mustang',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/characters/16/82672.jpg' } },
      },
      role: 'Supporting',
      voice_actors: [
        { person: { mal_id: 123, name: 'Shinichiro Miki' }, language: 'Japanese' },
        { person: { mal_id: 74, name: 'Travis Willingham' }, language: 'English' },
      ],
    },
    {
      character: {
        mal_id: 69,
        name: 'Riza Hawkeye',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/characters/4/72532.jpg' } },
      },
      role: 'Supporting',
      voice_actors: [
        { person: { mal_id: 147, name: 'Fumiko Orikasa' }, language: 'Japanese' },
        { person: { mal_id: 97, name: 'Colleen Clinkenbeard' }, language: 'English' },
      ],
    },
    {
      character: {
        mal_id: 70,
        name: 'Winry Rockbell',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/characters/10/72534.jpg' } },
      },
      role: 'Supporting',
      voice_actors: [
        { person: { mal_id: 260, name: 'Megumi Takamoto' }, language: 'Japanese' },
        { person: { mal_id: 84, name: 'Caitlin Glass' }, language: 'English' },
      ],
    },
  ],

  // Solo Leveling (52299)
  52299: [
    {
      character: {
        mal_id: 169622,
        name: 'Sung Jin-Woo',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/characters/11/530510.jpg' } },
      },
      role: 'Main',
      voice_actors: [
        { person: { mal_id: 48677, name: 'Taito Ban', images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/voiceactors/3/67448.jpg' } } }, language: 'Japanese' },
        { person: { mal_id: 44265, name: 'Aleks Le' }, language: 'English' },
      ],
    },
    {
      character: {
        mal_id: 172901,
        name: 'Cha Hae-In',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/characters/3/530511.jpg' } },
      },
      role: 'Supporting',
      voice_actors: [
        { person: { mal_id: 34957, name: 'Reina Ueda' }, language: 'Japanese' },
        { person: { mal_id: 30142, name: 'Michelle Rojas' }, language: 'English' },
      ],
    },
    {
      character: {
        mal_id: 172902,
        name: 'Yoo Jin-Ho',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/characters/12/530512.jpg' } },
      },
      role: 'Supporting',
      voice_actors: [
        { person: { mal_id: 54133, name: 'Genta Nakamura' }, language: 'Japanese' },
        { person: { mal_id: 38812, name: 'Justin Briner' }, language: 'English' },
      ],
    },
  ],

  // Jujutsu Kaisen (40748)
  40748: [
    {
      character: {
        mal_id: 164474,
        name: 'Yuuji Itadori',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/characters/2/424040.jpg' } },
      },
      role: 'Main',
      voice_actors: [
        { person: { mal_id: 28723, name: 'Junya Enoki' }, language: 'Japanese' },
        { person: { mal_id: 49722, name: 'Adam McArthur' }, language: 'English' },
      ],
    },
    {
      character: {
        mal_id: 164475,
        name: 'Megumi Fushiguro',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/characters/13/424042.jpg' } },
      },
      role: 'Main',
      voice_actors: [
        { person: { mal_id: 22627, name: 'Yuma Uchida' }, language: 'Japanese' },
        { person: { mal_id: 1718, name: 'Robbie Daymond' }, language: 'English' },
      ],
    },
    {
      character: {
        mal_id: 164476,
        name: 'Nobara Kugisaki',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/characters/10/424043.jpg' } },
      },
      role: 'Main',
      voice_actors: [
        { person: { mal_id: 16798, name: 'Asami Seto' }, language: 'Japanese' },
        { person: { mal_id: 51224, name: 'Anne Yatco' }, language: 'English' },
      ],
    },
    {
      character: {
        mal_id: 164477,
        name: 'Satoru Gojo',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/characters/15/422168.jpg' } },
      },
      role: 'Main',
      voice_actors: [
        { person: { mal_id: 124, name: 'Yuichi Nakamura', images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/voiceactors/3/46888.jpg' } } }, language: 'Japanese' },
        { person: { mal_id: 18985, name: 'Kaiji Tang' }, language: 'English' },
      ],
    },
    {
      character: {
        mal_id: 164478,
        name: 'Ryomen Sukuna',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/characters/7/424041.jpg' } },
      },
      role: 'Supporting',
      voice_actors: [
        { person: { mal_id: 125, name: 'Junichi Suwabe' }, language: 'Japanese' },
        { person: { mal_id: 22919, name: 'Ray Chase' }, language: 'English' },
      ],
    },
  ],

  // Demon Slayer (38000)
  38000: [
    {
      character: {
        mal_id: 146156,
        name: 'Tanjirou Kamado',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/characters/9/390974.jpg' } },
      },
      role: 'Main',
      voice_actors: [
        { person: { mal_id: 13745, name: 'Natsuki Hanae' }, language: 'Japanese' },
        { person: { mal_id: 44264, name: 'Zach Aguilar' }, language: 'English' },
      ],
    },
    {
      character: {
        mal_id: 146157,
        name: 'Nezuko Kamado',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/characters/4/390975.jpg' } },
      },
      role: 'Main',
      voice_actors: [
        { person: { mal_id: 34951, name: 'Akari Kitou' }, language: 'Japanese' },
        { person: { mal_id: 44266, name: 'Abby Trott' }, language: 'English' },
      ],
    },
    {
      character: {
        mal_id: 146158,
        name: 'Zenitsu Agatsuma',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/characters/16/390976.jpg' } },
      },
      role: 'Main',
      voice_actors: [
        { person: { mal_id: 356, name: 'Hiro Shimono' }, language: 'Japanese' },
        { person: { mal_id: 44265, name: 'Aleks Le' }, language: 'English' },
      ],
    },
    {
      character: {
        mal_id: 146159,
        name: 'Inosuke Hashibira',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/characters/11/390977.jpg' } },
      },
      role: 'Main',
      voice_actors: [
        { person: { mal_id: 933, name: 'Yoshitsugu Matsuoka' }, language: 'Japanese' },
        { person: { mal_id: 10465, name: 'Bryce Papenbrook' }, language: 'English' },
      ],
    },
  ],

  // Oshi no Ko (52034)
  52034: [
    {
      character: {
        mal_id: 184518,
        name: 'Ai Hoshino',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/characters/5/506041.jpg' } },
      },
      role: 'Main',
      voice_actors: [
        { person: { mal_id: 34951, name: 'Rie Takahashi' }, language: 'Japanese' },
        { person: { mal_id: 45781, name: 'Donna Bella Litton' }, language: 'English' },
      ],
    },
    {
      character: {
        mal_id: 184519,
        name: 'Aquamarine Hoshino',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/characters/16/506042.jpg' } },
      },
      role: 'Main',
      voice_actors: [
        { person: { mal_id: 38853, name: 'Takeo Ootsuka' }, language: 'Japanese' },
        { person: { mal_id: 54122, name: 'Jack Stansbury' }, language: 'English' },
      ],
    },
    {
      character: {
        mal_id: 184520,
        name: 'Ruby Hoshino',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/characters/8/506043.jpg' } },
      },
      role: 'Main',
      voice_actors: [
        { person: { mal_id: 55436, name: 'Yurie Igoma' }, language: 'Japanese' },
        { person: { mal_id: 49832, name: 'Alyssa Marek' }, language: 'English' },
      ],
    },
    {
      character: {
        mal_id: 184521,
        name: 'Kana Arima',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/characters/12/506044.jpg' } },
      },
      role: 'Main',
      voice_actors: [
        { person: { mal_id: 16167, name: 'Megumi Han' }, language: 'Japanese' },
        { person: { mal_id: 38813, name: 'Natalie Rial' }, language: 'English' },
      ],
    },
    {
      character: {
        mal_id: 184522,
        name: 'Akane Kurokawa',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/characters/14/506045.jpg' } },
      },
      role: 'Main',
      voice_actors: [
        { person: { mal_id: 41249, name: 'Manaka Iwami' }, language: 'Japanese' },
        { person: { mal_id: 48921, name: 'Kristen McGuire' }, language: 'English' },
      ],
    },
    {
      character: {
        mal_id: 184523,
        name: 'MEM-cho',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/characters/6/506046.jpg' } },
      },
      role: 'Supporting',
      voice_actors: [
        { person: { mal_id: 29519, name: 'Rumi Ookubo' }, language: 'Japanese' },
        { person: { mal_id: 43212, name: 'Juliet Simmons' }, language: 'English' },
      ],
    },
  ],
};

/**
 * Curated Themes (OP/ED) dataset for fallback
 */
export const FALLBACK_THEMES: Record<number, AnimeThemeSongs> = {
  // Frieren
  52991: {
    openings: [
      '1: "Yuusha" (勇者) by YOASOBI (eps 1-16)',
      '2: "Haru" (晴る) by Yorushika (eps 17-28)',
    ],
    endings: [
      '1: "Anytime Anywhere" by milet (eps 1-28)',
      '2: "bliss" by milet (ep 11)',
    ],
  },
  // FMA Brotherhood
  5114: {
    openings: [
      '1: "again" by YUI (eps 1-14)',
      '2: "Hologram" by NICO Touches the Walls (eps 15-26)',
      '3: "Golden Time Lover" by Sukima Switch (eps 27-38)',
      '4: "Period" by Chemistry (eps 39-50)',
      '5: "Rain" by SID (eps 51-64)',
    ],
    endings: [
      '1: "Uso" by SID (eps 1-14)',
      '2: "LET IT OUT" by Miho Fukuhara (eps 15-26)',
      '3: "Tsunai da Te" by Lil\'B (eps 27-38)',
      '4: "Shunkan Sentimental" by SCANDAL (eps 39-50)',
      '5: "RAY OF LIGHT" by Shoko Nakagawa (eps 51-64)',
    ],
  },
  // Solo Leveling
  52299: {
    openings: [
      '1: "LEveL" by SawanoHiroyuki[nZk]:TOMORROW X TOGETHER (eps 1-12)',
    ],
    endings: [
      '1: "request" by krage (eps 1-12)',
    ],
  },
  // Jujutsu Kaisen
  40748: {
    openings: [
      '1: "Kaikai Kitan" (廻廻奇譚) by Eve (eps 1-13)',
      '2: "VIVID VICE" by Who-ya Extended (eps 14-24)',
    ],
    endings: [
      '1: "LOST IN PARADISE" by ALI feat. AKLO (eps 1-13)',
      '2: "give it back" by Cö shu Nie (eps 14-24)',
    ],
  },
  // Demon Slayer
  38000: {
    openings: [
      '1: "Gurenge" (紅蓮華) by LiSA (eps 1-26)',
    ],
    endings: [
      '1: "from the edge" by FictionJunction feat. LiSA (eps 2-25)',
      '2: "Kamado Tanjirou no Uta" (竈門炭治郎のうた) by Go Shiina feat. Nami Nakagawa (ep 19)',
    ],
  },
  // Attack on Titan
  16498: {
    openings: [
      '1: "Guren no Yumiya" (紅蓮の弓矢) by Linked Horizon (eps 1-13.5)',
      '2: "Jiyuu no Tsubasa" (自由の翼) by Linked Horizon (eps 14-25)',
    ],
    endings: [
      '1: "Utsukushiki Zankoku na Sekai" by Yoko Hikasa (eps 1-13.5)',
      '2: "great escape" by cinema staff (eps 14-25)',
    ],
  },
  // Death Note
  1535: {
    openings: [
      '1: "the WORLD" by Nightmare (eps 1-19)',
      '2: "What\'s up, people?!" by MAXIMUM THE HORMONE (eps 20-37)',
    ],
    endings: [
      '1: "Alumina" (アルミナ) by Nightmare (eps 1-19)',
      '2: "Zetsubou Billy" (絶望ビリー) by MAXIMUM THE HORMONE (eps 20-37)',
    ],
  },
  // One Piece
  21: {
    openings: [
      '1: "We Are!" by Hiroshi Kitadani (eps 1-47)',
      '2: "Believe" by Folder5 (eps 48-115)',
      '20: "Hope" by Namie Amuro (eps 807-855)',
      '26: "UUUUUS!" by Hiroshi Kitadani (eps 1089+)',
    ],
    endings: [
      '1: "memories" by Maki Otsuki (eps 1-30)',
      '2: "RUN! RUN! RUN!" by Maki Otsuki (eps 31-63)',
      '19: "Raise" by Chilli Beans. (eps 1071+)',
    ],
  },
  // Dandadan
  54900: {
    openings: [
      '1: "Otonoke" (オトノケ) by Creepy Nuts (eps 1-12)',
    ],
    endings: [
      '1: "TAIDADA" by ZUTOMAYO (eps 1-12)',
    ],
  },
  // Apothecary Diaries
  54595: {
    openings: [
      '1: "Hana ni Natte" (花になって) by Ryokuoushoku Shakai (eps 1-12)',
      '2: "Ambivalent" by Uru (eps 13-24)',
    ],
    endings: [
      '1: "Aikotoba" (アイコトバ) by AiNA THE END (eps 1-12)',
      '2: "Ai wa Kusuri" (愛は薬) by wacci (eps 13-24)',
    ],
  },
  // Steins;Gate
  9253: {
    openings: [
      '1: "Hacking to the Gate" by Kanako Itou (eps 1-22)',
    ],
    endings: [
      '1: "Toki Tsukasadoru Juuni no Meiyaku" by Yui Sakakibara (eps 1-21)',
      '2: "Fake Verthandi" by Takeshi Abo (ep 22)',
      '3: "Skyclad no Kansokusha" by Kanako Itou (ep 23)',
    ],
  },
  // Hunter x Hunter
  11061: {
    openings: [
      '1: "departure!" by Masatoshi Ono (eps 1-148)',
    ],
    endings: [
      '1: "Just Awake" by Fear, and Loathing in Las Vegas (eps 1-26)',
      '2: "HUNTING FOR YOUR DREAM" by Galneryus (eps 27-58)',
      '3: "REASON" by Yuzu (eps 59-75, 147)',
      '5: "Hyōri Ittai" by Yuzu (eps 137-146)',
    ],
  },
  // Oshi no Ko
  52034: {
    openings: [
      '1: "Idol" (アイドル) by YOASOBI (eps 1-11)',
    ],
    endings: [
      '1: "Mephisto" (メフィスト) by QUEEN BEE (eps 1-11)',
    ],
  },
};

/**
 * Curated Staff dataset for fallback
 */
export const FALLBACK_STAFF: Record<number, AnimeStaffMember[]> = {
  // Oshi no Ko
  52034: [
    { person: { mal_id: 11848, name: 'Daisuke Hiramaki' }, positions: ['Director'] },
    { person: { mal_id: 28843, name: 'Jin Tanaka' }, positions: ['Series Composition'] },
    { person: { mal_id: 11849, name: 'Kanna Hirayama' }, positions: ['Character Design', 'Chief Animation Director'] },
    { person: { mal_id: 21849, name: 'Aka Akasaka' }, positions: ['Original Creator (Story)'] },
    { person: { mal_id: 21850, name: 'Mengo Yokoyari' }, positions: ['Original Creator (Art)'] },
  ],
  // Frieren
  52991: [
    { person: { mal_id: 48663, name: 'Keiichirou Saitou', images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/voiceactors/2/70123.jpg' } } }, positions: ['Director', 'Storyboard'] },
    { person: { mal_id: 11210, name: 'Tomohiro Suzuki' }, positions: ['Series Composition', 'Script'] },
    { person: { mal_id: 41249, name: 'Reiko Nagasawa' }, positions: ['Character Design', 'Chief Animation Director'] },
    { person: { mal_id: 40994, name: 'Evan Call' }, positions: ['Music Composer'] },
    { person: { mal_id: 52120, name: 'Kanehito Yamada' }, positions: ['Original Creator (Story)'] },
    { person: { mal_id: 52121, name: 'Tsukasa Abe' }, positions: ['Original Creator (Art)'] },
  ],
  // Solo Leveling
  52299: [
    { person: { mal_id: 39424, name: 'Shunsuke Nakashige' }, positions: ['Director'] },
    { person: { mal_id: 10848, name: 'Noboru Kimura' }, positions: ['Series Composition'] },
    { person: { mal_id: 8509, name: 'Hiroyuki Sawano' }, positions: ['Music Composer'] },
    { person: { mal_id: 48943, name: 'Chugong' }, positions: ['Original Creator'] },
  ],
  // Jujutsu Kaisen
  40748: [
    { person: { mal_id: 41243, name: 'Sunghoo Park' }, positions: ['Director'] },
    { person: { mal_id: 11214, name: 'Hiroshi Seko' }, positions: ['Series Composition', 'Script'] },
    { person: { mal_id: 4791, name: 'Tadashi Hiramatsu' }, positions: ['Character Design'] },
    { person: { mal_id: 39591, name: 'Hiroaki Tsutsumi' }, positions: ['Music'] },
    { person: { mal_id: 47843, name: 'Gege Akutami' }, positions: ['Original Creator'] },
  ],
  // Demon Slayer
  38000: [
    { person: { mal_id: 11200, name: 'Haruo Sotozaki' }, positions: ['Director'] },
    { person: { mal_id: 11201, name: 'Akira Matsushima' }, positions: ['Character Design', 'Chief Animation Director'] },
    { person: { mal_id: 5009, name: 'Yuki Kajiura' }, positions: ['Music Composer'] },
    { person: { mal_id: 7088, name: 'Go Shiina' }, positions: ['Music Composer'] },
    { person: { mal_id: 47348, name: 'Koyoharu Gotouge' }, positions: ['Original Creator'] },
  ],
};

/**
 * Curated Relations dataset for fallback
 */
export const FALLBACK_RELATIONS: Record<number, AnimeRelation[]> = {
  52034: [
    {
      relation: 'Adaptation',
      entry: [{ mal_id: 126146, type: 'manga', name: '【Oshi no Ko】(Manga)', url: 'https://myanimelist.net/manga/126146' }],
    },
    {
      relation: 'Sequel',
      entry: [{ mal_id: 55791, type: 'anime', name: '【Oshi no Ko】Season 2', url: 'https://myanimelist.net/anime/55791' }],
    },
  ],
  52991: [
    {
      relation: 'Adaptation',
      entry: [{ mal_id: 126287, type: 'manga', name: 'Sousou no Frieren', url: 'https://myanimelist.net/manga/126287' }],
    },
    {
      relation: 'Sequel',
      entry: [{ mal_id: 59791, type: 'anime', name: 'Sousou no Frieren 2nd Season', url: 'https://myanimelist.net/anime/59791' }],
    },
  ],
  5114: [
    {
      relation: 'Adaptation',
      entry: [{ mal_id: 25, type: 'manga', name: 'Fullmetal Alchemist', url: 'https://myanimelist.net/manga/25' }],
    },
    {
      relation: 'Alternative version',
      entry: [{ mal_id: 121, type: 'anime', name: 'Fullmetal Alchemist (2003)', url: 'https://myanimelist.net/anime/121' }],
    },
    {
      relation: 'Side story',
      entry: [{ mal_id: 9135, type: 'anime', name: 'Fullmetal Alchemist: The Sacred Star of Milos', url: 'https://myanimelist.net/anime/9135' }],
    },
  ],
  52299: [
    {
      relation: 'Adaptation',
      entry: [{ mal_id: 121496, type: 'manga', name: 'Solo Leveling (Manhwa)', url: 'https://myanimelist.net/manga/121496' }],
    },
    {
      relation: 'Sequel',
      entry: [{ mal_id: 58567, type: 'anime', name: 'Solo Leveling Season 2 -Arise from the Shadow-', url: 'https://myanimelist.net/anime/58567' }],
    },
  ],
  40748: [
    {
      relation: 'Adaptation',
      entry: [{ mal_id: 113138, type: 'manga', name: 'Jujutsu Kaisen', url: 'https://myanimelist.net/manga/113138' }],
    },
    {
      relation: 'Prequel',
      entry: [{ mal_id: 48561, type: 'anime', name: 'Jujutsu Kaisen 0 (Movie)', url: 'https://myanimelist.net/anime/48561' }],
    },
    {
      relation: 'Sequel',
      entry: [{ mal_id: 51019, type: 'anime', name: 'Jujutsu Kaisen 2nd Season', url: 'https://myanimelist.net/anime/51019' }],
    },
  ],
  38000: [
    {
      relation: 'Adaptation',
      entry: [{ mal_id: 96792, type: 'manga', name: 'Kimetsu no Yaiba', url: 'https://myanimelist.net/manga/96792' }],
    },
    {
      relation: 'Sequel',
      entry: [{ mal_id: 40456, type: 'anime', name: 'Kimetsu no Yaiba Movie: Mugen Ressha-hen', url: 'https://myanimelist.net/anime/40456' }],
    },
  ],
  16498: [
    {
      relation: 'Adaptation',
      entry: [{ mal_id: 23390, type: 'manga', name: 'Shingeki no Kyojin', url: 'https://myanimelist.net/manga/23390' }],
    },
    {
      relation: 'Sequel',
      entry: [{ mal_id: 25777, type: 'anime', name: 'Shingeki no Kyojin Season 2', url: 'https://myanimelist.net/anime/25777' }],
    },
  ],
};

/**
 * Helper to get anime characters with fallback
 */
export function getFallbackCharacters(malId: number): AnimeCharacterRole[] {
  const found = FALLBACK_CHARACTERS[malId];
  if (found && found.length > 0) return found;

  const anime = getFallbackAnimeById(malId);
  const title = anime ? (anime.title_english || anime.title) : `Anime #${malId}`;
  const poster = anime?.images?.jpg?.image_url;

  return [
    {
      character: {
        mal_id: malId * 10 + 1,
        name: `Protagonist (${title.split(':')[0]})`,
        images: { jpg: { image_url: poster } },
      },
      role: 'Main',
      voice_actors: [
        { person: { mal_id: 101, name: 'Lead Seiyuu (Japanese)' }, language: 'Japanese' },
        { person: { mal_id: 102, name: 'Lead Voice Actor (English)' }, language: 'English' },
      ],
    },
    {
      character: {
        mal_id: malId * 10 + 2,
        name: 'Companion / Deuteragonist',
        images: { jpg: { image_url: poster } },
      },
      role: 'Main',
      voice_actors: [
        { person: { mal_id: 201, name: 'Co-Lead Seiyuu (Japanese)' }, language: 'Japanese' },
        { person: { mal_id: 202, name: 'Co-Lead Voice Actor (English)' }, language: 'English' },
      ],
    },
    {
      character: {
        mal_id: malId * 10 + 3,
        name: 'Supporting Ally',
        images: { jpg: { image_url: poster } },
      },
      role: 'Supporting',
      voice_actors: [
        { person: { mal_id: 301, name: 'Voice Actor (Japanese)' }, language: 'Japanese' },
      ],
    },
    {
      character: {
        mal_id: malId * 10 + 4,
        name: 'Mentor / Antagonist',
        images: { jpg: { image_url: poster } },
      },
      role: 'Supporting',
      voice_actors: [
        { person: { mal_id: 401, name: 'Voice Actor (Japanese)' }, language: 'Japanese' },
      ],
    },
  ];
}

/**
 * Helper to get anime theme songs (OP / ED) with fallback
 */
export function getFallbackThemes(malId: number): AnimeThemeSongs {
  const found = FALLBACK_THEMES[malId];
  if (found) return found;

  const anime = getFallbackAnimeById(malId);
  const title = anime ? (anime.title_english || anime.title) : `Anime #${malId}`;

  return {
    openings: [
      `1: "Main Opening Theme" by Featured Artist (${title})`,
    ],
    endings: [
      `1: "Main Ending Theme" by Featured Artist (${title})`,
    ],
  };
}

/**
 * Helper to get anime staff with fallback
 */
export function getFallbackStaff(malId: number): AnimeStaffMember[] {
  const found = FALLBACK_STAFF[malId];
  if (found && found.length > 0) return found;

  const anime = getFallbackAnimeById(malId);
  const studioName = anime?.studios?.[0]?.name || 'Animation Studio';

  return [
    {
      person: { mal_id: 1, name: `${studioName} Lead Director` },
      positions: ['Director', 'Series Director'],
    },
    {
      person: { mal_id: 2, name: 'Original Author / Mangaka' },
      positions: ['Original Creator'],
    },
    {
      person: { mal_id: 3, name: 'Character Designer' },
      positions: ['Character Design', 'Chief Animation Director'],
    },
    {
      person: { mal_id: 4, name: 'Music Composer' },
      positions: ['Music Composer', 'Soundtrack Director'],
    },
  ];
}

/**
 * Helper to get anime relations with fallback
 */
export function getFallbackRelations(malId: number): AnimeRelation[] {
  const found = FALLBACK_RELATIONS[malId];
  if (found && found.length > 0) return found;

  const anime = getFallbackAnimeById(malId);
  if (!anime) return [];

  return [
    {
      relation: 'Adaptation',
      entry: [
        {
          mal_id: malId,
          type: 'manga',
          name: `${anime.title} (Original Manga)`,
          url: `https://myanimelist.net/manga/${malId}`,
        },
      ],
    },
  ];
}

/**
 * Helper to get anime external links
 */
export function getFallbackExternalLinks(malId: number): AnimeExternalLink[] {
  return [
    { name: 'MyAnimeList', url: `https://myanimelist.net/anime/${malId}` },
    { name: 'Official Website', url: `https://myanimelist.net/anime/${malId}` },
    { name: 'AniList', url: `https://anilist.co/search/anime?search=${malId}` },
  ];
}


/**
 * Generate synthetic episode list for an anime (1 to N)
 */
export function generateFallbackEpisodes(malId: number, totalCount: number = 12): AnimeEpisode[] {
  const count = Math.max(1, Math.min(totalCount || 12, 100));
  return Array.from({ length: count }, (_, i) => ({
    mal_id: i + 1,
    title: `Episode ${i + 1}`,
    episode: `Episode ${i + 1}`,
    aired: '2024',
    score: 8.5,
    filler: false,
    recap: false,
  }));
}

/**
 * Helper to get schedule by day name from fallback items
 */
export function getFallbackSchedule(dayName?: string): Anime[] {
  if (!dayName) return FALLBACK_ANIME_LIST;
  const lower = dayName.toLowerCase();
  const matched = FALLBACK_ANIME_LIST.filter(a => 
    a.broadcast?.day?.toLowerCase().includes(lower) || 
    a.broadcast?.string?.toLowerCase().includes(lower)
  );
  return matched.length > 0 ? matched : FALLBACK_ANIME_LIST.slice(0, 6);
}

/**
 * Helper to get fallback anime detail by MAL ID.
 * Returns null if the anime is not in the curated fallback dataset.
 */
export function getFallbackAnimeById(malId: number): Anime | null {
  const numId = Number(malId);
  const found = FALLBACK_ANIME_LIST.find(a => a.mal_id === numId);
  if (!found) return null;

  return {
    ...found,
    theme: found.theme || FALLBACK_THEMES[numId] || { openings: [], endings: [] },
    relations: found.relations || FALLBACK_RELATIONS[numId] || [],
    external: found.external || getFallbackExternalLinks(numId),
  };
}

/**
 * Universal tokenized and filtered search on fallback dataset
 */
export function searchFallbackAnime(
  query?: string,
  params?: {
    genres?: string | number;
    type?: string;
    status?: string;
    order_by?: string;
    sort?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }
): { data: Anime[]; pagination: { current_page: number; has_next_page: boolean; last_visible_page: number; items: { count: number; total: number; per_page: number } } } {
  let list = [...FALLBACK_ANIME_LIST];
  const q = (query || '').toLowerCase().trim();

  if (q) {
    const tokens = q.split(/\s+/).filter(Boolean);
    list = list.filter((a) => {
      const fullText = `${a.title} ${a.title_english || ''} ${a.title_japanese || ''} ${a.synopsis || ''} ${a.genres?.map((g) => g.name).join(' ') || ''} ${a.studios?.map((s) => s.name).join(' ') || ''}`.toLowerCase();
      return tokens.every((token) => fullText.includes(token));
    });
  }

  if (params?.genres) {
    const genreParts = String(params.genres).split(',').map((g: string) => g.trim()).filter(Boolean);
    list = list.filter((a) =>
     genreParts.some((part: string) => {
      const id = Number(part);
      if (!isNaN(id) && id > 0) {
       return a.genres?.some((g: any) => g.mal_id === id);
      }
      return a.genres?.some((g: any) => g.name.toLowerCase() === part.toLowerCase());
     })
    );
  }

  if (params?.type) {
    const targetType = params.type.toLowerCase();
    list = list.filter((a) => a.type?.toLowerCase() === targetType);
  }

  if (params?.status) {
    const targetStatus = params.status.toLowerCase();
    list = list.filter((a) => {
      const s = (a.status || '').toLowerCase();
      if (targetStatus === 'airing') return s.includes('airing');
      if (targetStatus === 'complete') return s.includes('finished');
      if (targetStatus === 'upcoming') return s.includes('upcoming');
      return true;
    });
  }

  // Sorting
  const sortDir = params?.sort === 'asc' ? 1 : -1;
  const orderBy = params?.order_by || (q ? 'relevance' : 'popularity');

  if (orderBy === 'score') {
    list.sort((a, b) => ((a.score || 0) - (b.score || 0)) * sortDir);
  } else if (orderBy === 'popularity') {
    list.sort((a, b) => ((a.popularity || 9999) - (b.popularity || 9999)) * (sortDir === 1 ? -1 : 1));
  } else if (orderBy === 'title') {
    list.sort((a, b) => a.title.localeCompare(b.title) * (sortDir === 1 ? -1 : 1));
  } else if (orderBy === 'episodes') {
    list.sort((a, b) => ((a.episodes || 0) - (b.episodes || 0)) * sortDir);
  } else if (orderBy === 'start_date') {
    list.sort((a, b) => ((a.year || 0) - (b.year || 0)) * sortDir);
  }

  const page = Math.max(1, params?.page || 1);
  const limit = Math.max(1, params?.limit || 24);
  const startIndex = (page - 1) * limit;
  const pagedData = list.slice(startIndex, startIndex + limit);
  const total = list.length;
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data: pagedData,
    pagination: {
      current_page: page,
      has_next_page: page < totalPages,
      last_visible_page: totalPages,
      items: {
        count: pagedData.length,
        total,
        per_page: limit,
      },
    },
  };
}

