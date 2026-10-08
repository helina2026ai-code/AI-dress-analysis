<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# AI 造型設計師 - Vogue Canvas Stylist

這是一個基於 React + Express + Gemini API 的 AI 穿搭診斷應用，支援照片分析、穿搭評分、語音講評與動態時尚風格儀表板。

## 本地執行

**Prerequisites:** Node.js

1. 安裝依賴：
   `npm install`
2. 建立 `.env` 或 `.env.local`，並加入 `GEMINI_API_KEY`
3. 啟動：
   `npm run dev`

## GitHub Pages 展示網站

網站網址：[AI Dress Analysis](https://helina2026ai-code.github.io/AI-dress-analysis/)。

`.github/workflows/deploy-pages.yml` 會在推送至 `main` 後，自動安裝套件、檢查 TypeScript、建置並發布網站。也可以在 GitHub 的 Actions 頁面手動執行。儲存庫的 Settings → Pages → Source 必須設為 **GitHub Actions**。

GitHub Pages 是靜態託管，無法執行本專案的 Express 後端。Pages 版本會標示「展示模式」，提供預先設定的診斷範例、Canvas 儀表板與瀏覽器朗讀，停用照片分析與 Gemini 語音選擇。本地執行與 Docker 部署仍使用原本的 AI 後端。

部署工作流程設定 `VITE_BASE_PATH` 為儲存庫子路徑，並設定 `VITE_STATIC_DEMO=true`。這些是公開的前端建置設定；請勿將 `GEMINI_API_KEY` 加入任何 `VITE_` 變數或靜態網頁。若要使用完整的 AI 照片分析，需另行部署 Express 後端並在後端設定 `GEMINI_API_KEY`。

## Hugging Face Space

前往現有的 [AI Dress Analysis Hugging Face Space](https://huggingface.co/spaces/HelinaChang/AI_Dress_analysis)。

此 Space 目前是 `static` 類型，與本專案的 React + Express + Gemini 架構分開運作；本專案尚未部署或同步到該 Space。若要將本專案部署至該 Space，需先將 Space 改為 Docker，並設定 `GEMINI_API_KEY` Secret。

本專案已包含 Docker 部署設定：服務會監聽 `0.0.0.0`，讀取 `PORT`（預設使用 7860），並於生產模式提供 `dist` 靜態檔案。

## 重要環境變數

```bash
GEMINI_API_KEY=your_gemini_api_key
PORT=7860
```

## 可用腳本

```bash
npm install
npm run dev
npm run build
npm run start
```
