<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# AI 造型設計師 - Vogue Canvas Stylist

這是一個基於 React + Express + Gemini API 的 AI 穿搭診斷應用，支援照片分析、穿搭評分、語音講評與動態時尚風格儀表板。

## 本地執行

**Prerequisites:** Node.js 24

1. 安裝依賴：
   `npm install`
2. 建立 `.env` 或 `.env.local`，並加入 `GEMINI_API_KEY`
3. 啟動：
   `npm run dev`

## GitHub Pages 展示網站

網站網址：[AI Dress Analysis](https://helina2026ai-code.github.io/AI-dress-analysis/)。

`.github/workflows/deploy-pages.yml` 會在推送至 `main` 後，自動安裝套件、檢查 TypeScript、建置並發布網站。也可以在 GitHub 的 Actions 頁面手動執行。儲存庫的 Settings → Pages → Source 必須設為 **GitHub Actions**。

GitHub Pages 是靜態託管，無法執行本專案的 Express 後端。Pages 版本會標示「展示模式」，提供預先設定的診斷範例、Canvas 儀表板與瀏覽器朗讀，停用照片分析與 Gemini 語音選擇。本地執行與 Docker 部署仍使用原本的 AI 後端。

部署工作流程設定 `VITE_BASE_PATH` 為儲存庫子路徑，並設定 `VITE_STATIC_DEMO=true`。尚未設定後端網址時會保持展示模式；設定 `STYLIST_API_BASE_URL` 儲存庫變數並重新部署後，就會開啟完整的照片分析與 Gemini 語音。

這些是公開的前端建置設定；請勿將 `GEMINI_API_KEY` 加入任何 `VITE_` 變數或靜態網頁。

## 完整 AI 版部署

完整 AI 版可使用支援 Docker 的服務，同時提供 React 網站與 Express API：

1. 使用本專案的 `Dockerfile` 建置。容器使用 Node.js 24，預設監聽 `0.0.0.0:7860`；託管平台也可透過 `PORT` 指定連接埠。
2. 在託管平台的 Secrets 設定 `GEMINI_API_KEY`，不要把金鑰寫入 GitHub、Dockerfile 或前端設定。
3. 開啟服務網址。`/api/health` 會回傳 `status` 與 `aiConfigured`；後者只代表金鑰已設定，仍需實際測試照片分析與語音來驗證金鑰與模型存取權。

若要繼續使用 GitHub Pages 網址作為前端：

1. 後端設定 `ALLOWED_ORIGINS=https://helina2026ai-code.github.io`，允許該網站跨站呼叫 API。
2. 到 GitHub → Settings → Secrets and variables → Actions → Variables，建立 `STYLIST_API_BASE_URL`，值為後端 HTTPS 根網址，**不要附加 `/api`**。
3. 在 Actions 手動執行 `Deploy to GitHub Pages`，或推送新的提交。後端完成設定前，請保留此變數為空以維持展示模式。

同站 Docker 部署不需要 `VITE_API_BASE_URL`。本地測試獨立後端時，可用此變數指定公開 API 網址。模型可用後端環境變數 `GEMINI_ANALYSIS_MODEL` 與 `GEMINI_TTS_MODEL` 覆寫，預設分別為 `gemini-3.8-flash` 與 `gemini-3.8-flash-lite-tts`。

新版 Gemini TTS 使用 Interactions API，回傳 WAV 音訊，並設定 `store: false`。對應介面與格式見 [Google 官方語音文件](https://ai.google.dev/gemini-api/docs/speech-generation)。

## Hugging Face Space

前往現有的 [AI Dress Analysis Hugging Face Space](https://huggingface.co/spaces/HelinaChang/AI_Dress_analysis)。

此 Space 目前是 `static` 類型，與本專案的 React + Express + Gemini 架構分開運作；本專案尚未部署或同步到該 Space，該 Space 也尚未設定 AI 金鑰。

若選擇使用此 Space，需將本專案檔案同步到 Space，並在其 README 頂端加入以下設定，切換至 Docker。原 Space 已有的程式會被此專案取代，原版本仍保留於 Space 的 Git 提交歷史：

```yaml
---
title: AI Dress Analysis
emoji: 👗
colorFrom: yellow
colorTo: gray
sdk: docker
app_port: 7860
pinned: false
---
```

再到 Space Settings → Variables and secrets 新增 `GEMINI_API_KEY` Secret；若搭配 GitHub Pages，另設定上述 `ALLOWED_ORIGINS` Variable。規則見 [Hugging Face Docker Spaces 文件](https://huggingface.co/docs/hub/spaces-sdks-docker)。

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
npm test
```

`npm test` 會啟動正式模式的 HTTP 服務並測試跨站連線、照片分析流程、WAV 語音及缺少金鑰的處理。Gemini SDK 在測試程序中會被替換，因此不會使用真實金鑰或發出 Google API 請求。Docker 映像不包含測試檔案。
