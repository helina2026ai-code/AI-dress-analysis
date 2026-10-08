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
