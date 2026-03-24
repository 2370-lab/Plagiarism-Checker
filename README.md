# PlagScan — AI Plagiarism Checker

An AI-powered plagiarism detection app built with Next.js and Claude AI, deployable to Vercel.

## Features

- **Single Text Analysis** — Analyze one piece of text for signs of plagiarism
- **Compare Two Texts** — Compare a source and a submission side-by-side
- Plagiarism risk score with animated ring charts
- Suspicious segment highlighting
- Writing style consistency analysis
- Matched segment detection with EXACT / PARAPHRASED / SIMILAR_IDEA labels

## Deploy to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/your-username/plagiarism-checker.git
git push -u origin main
```

### 2. Import on Vercel
- Go to [vercel.com](https://vercel.com) → New Project
- Import your GitHub repo
- Add Environment Variable:
  - **Key:** `ANTHROPIC_API_KEY`
  - **Value:** your Anthropic API key from [console.anthropic.com](https://console.anthropic.com)
- Click **Deploy**

## Local Development

```bash
npm install
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Next.js 14** — React framework with API routes
- **Claude Sonnet 4** — AI analysis engine
- **Vercel** — Deployment platform
