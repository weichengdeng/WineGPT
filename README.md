# WineGPT Catalog Recommender

WineGPT is a small catalog-grounded wine recommendation app. It ranks wines from the included CSV/JSON product catalog with local rules, then can optionally ask an AI model to explain the recommendation.

## Features

- Product recommendations constrained to the local catalog
- Budget, wine type, beginner-friendly, and wine-only filters
- Multilingual UI data for Chinese, English, and Japanese
- Optional DeepSeek-compatible chat completion explanation endpoint
- Local fallback explanations when no API key is configured

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

## Optional AI Explanation

Set `DEEPSEEK_API_KEY` before starting the server:

```bash
DEEPSEEK_API_KEY=your_api_key npm start
```

Optional environment variables:

- `PORT`: server port, defaults to `5173`
- `DEEPSEEK_MODEL`: model name, defaults to `deepseek-v4-pro`
- `DEEPSEEK_BASE_URL`: API base URL, defaults to `https://api.deepseek.com`

## License

MIT
