declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEWS_URL: string;
      DISCORD_WEBHOOK: string;
    }
  }
}

export {}
