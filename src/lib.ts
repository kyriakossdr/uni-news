import crypto from "crypto";
import https from "https";
import axios from "axios";
import fs from "fs";

import dotenv from "dotenv";
dotenv.config();

import { type CheerioAPI } from "cheerio";

const HASH_FILE = "last-hash";
const NEWS_URL = new URL(process.env.NEWS_URL);

interface News {
  title: string;
  url: string;
}

export const createHash = (data: unknown) => {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(data))
    .digest("hex")
}

export const fetchNews = async () => {
  const agent = new https.Agent({ rejectUnauthorized: false });

  return await axios.get(process.env.NEWS_URL, {
    httpsAgent: agent
  });
}

export const extractData = ($: CheerioAPI) => {
  const $news = $("section > div.container div#txtHint").children();
  const news = $news.map((_, el) => {
      const $el = $(el).find("div > a");

      const title = $el.find("div > h4").text();
      const url = $el.attr("href");

      if (title && url)
        return { title, url: `${NEWS_URL.href}/${url}` };

      return null;
    })
    .get()
    .filter(Boolean)
    .sort((a, b) => a.url < b.url ? 1 : -1);

  return news
};

export const sendToDiscord = async(news: News[]) => {
  const fields = news.slice(0, 25).map(n => ({
    name: n.title,
    value: n.url,
    inline: false,
  }));

  const payload = {
    embeds: [{
      title: "Νέες Ανακοινώσεις",
      color: 3447003,
      fields: fields,
      timestamp: new Date().toISOString(),
    }]
  };

  try {
    await axios.post(process.env.DISCORD_WEBHOOK, payload);
    console.log(`Sent ${news.length} posts to Discord`);
  } catch (error) {
    console.error('Failed to send to Discord:', error);
    throw error;
  }
}

export const loadHashFromFile = () => {
  if (!fs.existsSync(HASH_FILE)) {
        console.log('Hash file does not exist yet');
        return "";
      }
  return fs.readFileSync(HASH_FILE, "utf-8");
}

export const storeHash = (hash: string) => {
  fs.writeFileSync(HASH_FILE, hash, "utf-8");
}
