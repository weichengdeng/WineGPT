# WineGPT Catalog Recommender

WineGPT is a small catalog-grounded wine recommendation app. It asks an AI model to choose wines from the included CSV/JSON product catalog, with local rules as a fallback when no API key is configured.

## Features

- Product recommendations constrained to the local catalog
- Budget, wine type, beginner-friendly, and wine-only filters
- Multilingual UI data for Chinese, English, and Japanese
- Optional DeepSeek-compatible chat completion recommendation endpoint
- Local fallback recommendations when no API key is configured

## Requirements

- Node.js 18 or newer

## Run Locally

```bash
npm start
```

Then open:

```text
http://localhost:5173
```

## Optional AI Recommendation

Create a local `.env` file:

```bash
cp .env.example .env
```

Then set your API key in `.env`:

```text
DEEPSEEK_API_KEY=your_api_key
```

Optional environment variables:

- `PORT`: server port, defaults to `5173`
- `DEEPSEEK_MODEL`: model name, defaults to `deepseek-v4-flash`
- `DEEPSEEK_BASE_URL`: API base URL, defaults to `https://api.deepseek.com`

`.env` is ignored by Git so API keys are not committed.

## License

MIT
