import { StylistAnalysis } from '../types/stylist';

export const INITIAL_SAMPLE_ANALYSIS: StylistAnalysis = {
  overallScore: 92,
  gradeLetter: 'S',
  styleArchetype: '安靜奢華老錢風 (Quiet Luxury)',
  summaryVibe: '高雅內斂的燕麥羊毛層次，輪廓剪裁舒展流暢，盡顯不著痕跡的高級感。',
  spokenCritique:
    '這套造型將安靜奢華的鬆弛感發揮得淋漓盡致！大衣肩線與高領針織的比例極其完美。若能將包款換成焦糖色微光澤手提包，整體層次將達到秀場級別。',
  metrics: {
    colorHarmony: {
      score: 95,
      critique: '同色系燕麥白與駝灰完美協調，呈現頂級羊絨特有的溫潤視覺張力。',
    },
    silhouetteProportions: {
      score: 94,
      critique: '垂墜感風衣長度恰在小腿黃金分割點，垂直縱向視覺極致顯高修長。',
    },
    occasionFit: {
      score: 96,
      critique: '兼具商務辦公的威嚴感與藝廊散策的自在從容，適配度極高。',
    },
    trendiness: {
      score: 88,
      critique: '符合當前極簡老錢風潮，經典不過時。',
    },
    detailAccessories: {
      score: 84,
      critique: '飾品偏精簡內斂，若加入細微金屬光澤如耳圈或腕錶更臻完美。',
    },
    versatility: {
      score: 93,
      critique: '大衣與內搭皆為高泛用膠囊衣櫥核心單品，拆開組合潛力無限。',
    },
  },
  colorPalette: [
    {
      hex: '#EBE6DE',
      name: '燕麥奶白',
      role: 'Dominant (主色 55%)',
      seasonSeason: '柔秋型 / 淺夏型',
    },
    {
      hex: '#B8A495',
      name: '駝灰暖灰',
      role: 'Secondary (副色 30%)',
      seasonSeason: '暖秋型',
    },
    {
      hex: '#6A5F56',
      name: '焦糖暖褐',
      role: 'Accent (點綴 10%)',
      seasonSeason: '深秋型',
    },
    {
      hex: '#2B2623',
      name: '深焙黑曜',
      role: 'Neutral (輪廓 5%)',
      seasonSeason: '冷冬型',
    },
  ],
  clothingItems: [
    {
      item: '微落肩羊毛長大衣',
      category: 'outerwear',
      x: 48,
      y: 35,
      status: 'great',
      feedback: '面料垂墜度極佳，大翻領拉長頸部線條，自帶高級大女主氣場。',
      upgradeTip: '天冷時可微敞開前襟，露出內搭腰線更能優化三七分比例。',
    },
    {
      item: '米白高領羊絨針織衫',
      category: 'top',
      x: 50,
      y: 22,
      status: 'great',
      feedback: '領口高度恰到好處，貼合肌膚修飾臉型，質感極其溫潤。',
      upgradeTip: '可將項鍊微戴於高領之外，增添精緻金屬光澤亮點。',
    },
    {
      item: '垂墜感壓褶直筒長褲',
      category: 'bottom',
      x: 50,
      y: 65,
      status: 'great',
      feedback: '縱向壓褶線條筆直流暢，完美拉伸下半身視覺長度。',
      upgradeTip: '搭配尖頭或方頭短靴時，褲腳自然堆疊約半公分最顯慵懶。',
    },
    {
      item: '結構感極簡皮革手袋',
      category: 'bag',
      x: 68,
      y: 48,
      status: 'good',
      feedback: '俐落幾何線條呼應大衣俐落度，低調典雅。',
      upgradeTip: '可選擇帶有霧面金屬扣飾的款式，點亮全身中性色調。',
    },
  ],
  highlights: [
    '同色系階梯漸層層次分明，營造無懈可擊的奢華純淨感',
    '縱向延伸垂墜線條，視覺比例顯瘦拉長 5 公分以上',
    '精選高質感純天然纖維光澤，遠近皆具高級訂製感',
  ],
  tuningAdvice: [
    '配飾點綴：加入一對簡約霧面金屬耳環或一隻復古皮帶手錶，增添細節精緻度',
    '包款色彩撞擊：可換用暖焦糖或勃艮第紅皮件，為純淨色盤注入視覺重心',
    '領口空間：高領外層可疊戴細鍊硬幣項鍊，打破大面積純色的單調感',
  ],
  alternativePairing:
    '若下班後需出席重要約會或晚宴，僅需將大衣輕披在雙肩營造氣場，並換上細高跟鞋與璀璨金屬手拿包，瞬間華麗變身夜間焦點。',
  fashionQuote: '真正的優雅不是為了惹人注目，而是讓人難以忘懷。—— 喬治·亞曼尼',
};
