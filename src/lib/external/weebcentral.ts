import * as cheerio from "cheerio";

const BASE_URL = "https://weebcentral.com";

export interface SearchResult {
  title: string;
  url: string;
  cover: string;
}

export interface LatestResult extends SearchResult {
  update: string;
}

export interface Chapter {
  name: string;
  url: string;
}

export interface MangaDetail {
  title: string;
  cover: string;
  desc: string;
  episodes: {
    title: string;
    urls: Chapter[];
  }[];
}

export interface MangaPages {
  urls: string[];
}

export class WeebCentral {
  readonly baseUrl = BASE_URL;

  private async request(
    path: string,
    options: RequestInit = {},
  ): Promise<string> {
    const url = path.startsWith("http")
      ? path
      : new URL(path, this.baseUrl).toString();

    const response = await fetch(url, {
      ...options,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      throw new Error(
        `WeebCentral request failed: ${response.status} ${response.statusText} (${url})`,
      );
    }

    return response.text();
  }

  async latest(page = 1): Promise<LatestResult[]> {
    const html = await this.request(`/latest-updates/${page}`);
    const $ = cheerio.load(html);

    const results: LatestResult[] = [];

    $("article").each((_, article) => {
      const element = $(article);

      const anchor = element.find("a").first();
      const image = element.find("img").first();

      const url = anchor.attr("href") || "";
      const title = image.attr("alt")?.trim() || "";
      const cover = image.attr("src") || "";
      const update = element.find("span").first().text().trim();

      if (!url || !title) return;

      results.push({
        title,
        url: this.absoluteUrl(url),
        cover: this.absoluteUrl(cover),
        update,
      });
    });

    return results;
  }

  async search(query: string, _page = 1): Promise<SearchResult[]> {
    const body = new URLSearchParams({
      text: query,
    });

    const html = await this.request("/search/simple", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const $ = cheerio.load(html);

    const results: SearchResult[] = [];

    $("section div > a").each((_, anchor) => {
      const element = $(anchor);

      const url = element.attr("href") || "";
      const image = element.find("img").first();

      const title = image.attr("alt")?.trim() || "";
      const cover = image.attr("src") || "";

      if (!url || !title) return;

      results.push({
        title,
        url: this.absoluteUrl(url),
        cover: this.absoluteUrl(cover),
      });
    });

    return results;
  }

  async detail(url: string): Promise<MangaDetail> {
    const html = await this.request(url);
    const $ = cheerio.load(html);

    const top = $("div#top section").first();

    const title = top.find("h1").first().text().trim();
    const cover = top.find("img").first().attr("src") || "";
    const desc = top.find("p").first().text().trim();

    let chapterHtml = "";

    const fullChapsUrl =
      $("#chapter-list > button").first().attr("hx-get") || "";

    if (fullChapsUrl) {
      chapterHtml = await this.request(fullChapsUrl);
    } else {
      chapterHtml = $("#chapter-list").html() || "";
    }

    const $chapters = cheerio.load(chapterHtml);

    const chapters: Chapter[] = [];

    $chapters("div a").each((_, anchor) => {
      const element = $chapters(anchor);

      const name = element
        .find("span.grow > span:first-child")
        .first()
        .text()
        .trim();

      const chapterUrl = element.attr("href") || "";

      if (!chapterUrl) return;

      chapters.push({
        name: name || element.text().trim(),
        url: this.absoluteUrl(chapterUrl),
      });
    });

    return {
      title,
      cover: this.absoluteUrl(cover),
      desc,
      episodes: [
        {
          title: "Chapters",
          urls: chapters,
        },
      ],
    };
  }

  async watch(url: string): Promise<MangaPages> {
    const chapterUrl = new URL(url);

    chapterUrl.pathname = `${chapterUrl.pathname.replace(/\/$/, "")}/images`;

    chapterUrl.search = new URLSearchParams({
      is_prev: "False",
      current_page: "1",
      reading_style: "long_strip",
    }).toString();

    const html = await this.request(chapterUrl.toString());
    const $ = cheerio.load(html);

    const urls: string[] = [];

    $("section > img").each((_, image) => {
      const src = $(image).attr("src");

      if (src) {
        urls.push(this.absoluteUrl(src));
      }
    });

    return {
      urls,
    };
  }

  async getManga(url: string) {
    const detail = await this.detail(url);

    return {
      ...detail,
      chapters: detail.episodes.flatMap((episode) => episode.urls),
    };
  }

  async getPages(chapterUrl: string): Promise<string[]> {
    const result = await this.watch(chapterUrl);

    return result.urls;
  }

  private absoluteUrl(url: string): string {
    if (!url) return "";

    try {
      return new URL(url, this.baseUrl).toString();
    } catch {
      return url;
    }
  }
}

export const weebcentral = new WeebCentral();

export default weebcentral;
