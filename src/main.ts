import * as cheerio from "cheerio";

import {
  fetchNews,
  createHash,
  extractData,
  loadHashFromFile,
  storeHash,
  sendToDiscord
} from "./lib.js";

const main = async () => {

  const response = await fetchNews();

  const $ = cheerio.load(response.data);

  const news = extractData($);

  const lastSent = loadHashFromFile();
  const freshNews = [];

  for (const n of news) {
    if (createHash(n) === lastSent) {
      console.log("No unsent news found");
      break;
    }

    freshNews.push(n);

    if (freshNews.length >= 10) {
      console.log("Didn't find last sent new, limiting to 10");
      break;
    }
  }

  if (freshNews.length)
    storeHash(createHash(freshNews[0]));
    sendToDiscord(freshNews);

  return freshNews;
}

console.log(await main());
