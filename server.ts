import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';

if (!process.env.GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not set. Set it in the environment before running AI analysis.');
}

// Body parser with high limit for image uploads
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API: Analyze Outfit from Photo
app.post('/api/stylist/analyze', async (req, res) => {
  try {
    const { imageBase64, occasion, goal, genderVibe } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: '請提供穿搭照片。' });
    }

    // Handle both data URI / raw base64 and remote HTTP/HTTPS image URLs
    let cleanBase64 = '';
    let mimeType = 'image/jpeg';

    if (imageBase64.startsWith('http://') || imageBase64.startsWith('https://')) {
      const imgRes = await fetch(imageBase64);
      if (!imgRes.ok) {
        return res.status(400).json({ error: '無法讀取穿搭照片網址，請確認連線或使用相機拍照/檔案上傳。' });
      }
      const contentType = imgRes.headers.get('content-type');
      if (contentType && contentType.startsWith('image/')) {
        mimeType = contentType.split(';')[0];
      }
      const arrayBuffer = await imgRes.arrayBuffer();
      cleanBase64 = Buffer.from(arrayBuffer).toString('base64');
    } else {
      cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
      mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    }

    const promptText = `
你是一位擁有 20 年時裝週秀場經驗的國際頂級造型總監與高級時裝顧問（Vogue & Haute Couture Stylist）。
請對這張用戶上傳的全身或半身穿搭照片進行深入、專業且富含美學洞見的穿搭診斷與造型評分。

用戶設定的穿搭目標：
- 目標場合: ${occasion || '日常精緻 / Casual Chic'}
- 期望風格/剪裁目標: ${goal || '顯瘦修身、提升整體質感氣場'}
- 偏好氣質: ${genderVibe || '時髦俐落'}

請從以下維度進行嚴謹而具體的診斷：
1. 整體評分 (0-100分) 與 等級 (S+, S, A+, A, B+, B, C)
2. 風格標籤與美學原型 (例如: 巴黎鬆弛感 (Parisian Chic), 安靜奢華 (Quiet Luxury), 韓系 Clean Fit, 摩登復古 (Retro Tailored) 等)
3. 簡短語音講評腳本 (spokenCritique)：30~60字繁體中文。口吻自信、優雅、專業，一語中的點出這套穿搭的最大魅力與一項神級改造建議，適合以語音流暢唸出。
4. 六大維度雷達評分 (0-100) 與各維度簡評：
   - 色彩調和 (colorHarmony)
   - 比例與剪裁 (silhouetteProportions)
   - 場合適配度 (occasionFit)
   - 潮流時髦度 (trendiness)
   - 細節配飾 (detailAccessories)
   - 實穿百搭性 (versatility)
5. 萃取 3~5 種核心色票 (Dominant/Secondary/Accent)，給予十六進位色碼 (hex) 及雅致名稱 (如 燕麥奶白、勃艮第紅、焦糖棕等)，並給出四季色彩型人適配度 (季節季型)。
6. 逐項單品偵測診斷 (clothingItems)：標記其在照片上的大約相對位置 (x: 0~100%, y: 0~100%)、單品名稱、類別 (top/bottom/shoes/accessory/hair_makeup/outerwear/bag)、表現評級 (great/good/needs_tuning)、點評與一招升級技巧。
7. 三大穿搭亮點 (highlights) 與 三項具體改造建議 (tuningAdvice)。
8. 一衣多穿/情境切換方案 (alternativePairing)：例如只需微調某件單品或配件，就能轉換成約會或晚宴模式。
9. 造型師名言 (fashionQuote)：一句充滿時裝美學哲理的金句。

請務必以繁體中文 (Traditional Chinese) 提供專業、敏銳、實用且鼓舞人心的回應。
`;

    const generateOutfitAnalysis = () =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType,
              },
            },
            {
              text: promptText,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: { type: Type.INTEGER, description: '整體總評分 (0-100)' },
              gradeLetter: { type: Type.STRING, description: 'S+, S, A+, A, B+, B, C' },
              styleArchetype: { type: Type.STRING, description: '風格定位美學原型名稱' },
              summaryVibe: { type: Type.STRING, description: '一針見血的風格摘要' },
              spokenCritique: { type: Type.STRING, description: '30-60字專屬語音講評文案 (繁體中文)' },
              metrics: {
                type: Type.OBJECT,
                properties: {
                  colorHarmony: {
                    type: Type.OBJECT,
                    properties: {
                      score: { type: Type.INTEGER },
                      critique: { type: Type.STRING },
                    },
                    required: ['score', 'critique'],
                  },
                  silhouetteProportions: {
                    type: Type.OBJECT,
                    properties: {
                      score: { type: Type.INTEGER },
                      critique: { type: Type.STRING },
                    },
                    required: ['score', 'critique'],
                  },
                  occasionFit: {
                    type: Type.OBJECT,
                    properties: {
                      score: { type: Type.INTEGER },
                      critique: { type: Type.STRING },
                    },
                    required: ['score', 'critique'],
                  },
                  trendiness: {
                    type: Type.OBJECT,
                    properties: {
                      score: { type: Type.INTEGER },
                      critique: { type: Type.STRING },
                    },
                    required: ['score', 'critique'],
                  },
                  detailAccessories: {
                    type: Type.OBJECT,
                    properties: {
                      score: { type: Type.INTEGER },
                      critique: { type: Type.STRING },
                    },
                    required: ['score', 'critique'],
                  },
                  versatility: {
                    type: Type.OBJECT,
                    properties: {
                      score: { type: Type.INTEGER },
                      critique: { type: Type.STRING },
                    },
                    required: ['score', 'critique'],
                  },
                },
                required: [
                  'colorHarmony',
                  'silhouetteProportions',
                  'occasionFit',
                  'trendiness',
                  'detailAccessories',
                  'versatility',
                ],
              },
              colorPalette: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    hex: { type: Type.STRING, description: '#RRGGBB' },
                    name: { type: Type.STRING, description: '優雅色系名稱' },
                    role: { type: Type.STRING, description: 'Dominant, Secondary, Accent, Neutral' },
                    seasonSeason: { type: Type.STRING, description: '如 柔秋型, 冷冬型, 暖春型, 淺夏型' },
                  },
                  required: ['hex', 'name', 'role'],
                },
              },
              clothingItems: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    item: { type: Type.STRING, description: '單品名稱' },
                    category: {
                      type: Type.STRING,
                      description: 'top, bottom, shoes, accessory, hair_makeup, outerwear, bag',
                    },
                    x: { type: Type.NUMBER, description: '在圖片上的X軸百分比 (0-100)' },
                    y: { type: Type.NUMBER, description: '在圖片上的Y軸百分比 (0-100)' },
                    status: { type: Type.STRING, description: 'great, good, needs_tuning' },
                    feedback: { type: Type.STRING, description: '此單品表現點評' },
                    upgradeTip: { type: Type.STRING, description: '微調建議' },
                  },
                  required: ['item', 'category', 'x', 'y', 'status', 'feedback', 'upgradeTip'],
                },
              },
              highlights: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3項穿搭亮點',
              },
              tuningAdvice: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3項升級改進建議',
              },
              alternativePairing: {
                type: Type.STRING,
                description: '場景轉換或一衣多穿方案',
              },
              fashionQuote: {
                type: Type.STRING,
                description: '時裝設計名言',
              },
            },
            required: [
              'overallScore',
              'gradeLetter',
              'styleArchetype',
              'summaryVibe',
              'spokenCritique',
              'metrics',
              'colorPalette',
              'clothingItems',
              'highlights',
              'tuningAdvice',
              'alternativePairing',
              'fashionQuote',
            ],
          },
        },
      });

    let response;
    try {
      response = await generateOutfitAnalysis();
    } catch (apiErr: any) {
      if (
        apiErr.message?.includes('503') ||
        apiErr.message?.includes('high demand') ||
        apiErr.status === 503
      ) {
        console.warn('Temporary model demand spike, retrying once after 1.5s...');
        await new Promise((resolve) => setTimeout(resolve, 1500));
        response = await generateOutfitAnalysis();
      } else {
        throw apiErr;
      }
    }

    const parsed = JSON.parse(response.text || '{}');
    if (cleanBase64) {
      parsed.processedImage = `data:${mimeType};base64,${cleanBase64}`;
    }
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error analyzing outfit:', error);
    let userMessage = '分析穿搭時發生錯誤，請稍後再試。';
    if (error.message?.includes('high demand') || error.message?.includes('503')) {
      userMessage = '造型總監目前分析需求較高，請稍候 3 秒後再次點擊分析。';
    } else if (error.message) {
      userMessage = error.message;
    }
    return res.status(500).json({ error: userMessage });
  }
});

// API: Generate Speech for Stylist Critique using Gemini TTS
app.post('/api/stylist/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Kore' } = req.body;
    if (!text) {
      return res.status(400).json({ error: '缺少朗讀文字。' });
    }

    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text,
              speechMetadata: {
                style: 'Elegant, charismatic fashion director, smooth and articulate cadence',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const base64Audio =
      ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (base64Audio) {
      return res.json({
        audioData: `data:audio/wav;base64,${base64Audio}`,
        format: 'audio/wav',
      });
    }

    return res.status(500).json({ error: '無法生成語音' });
  } catch (err: any) {
    console.warn('Gemini TTS generation note:', err.message);
    // Return graceful notice so frontend can use Web Speech API fallback smoothly
    return res.status(500).json({
      error: err.message || 'TTS 服務暫時不可用',
      fallback: true,
    });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, host, () => {
    console.log(`Stylist App running on ${host}:${port} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer();
