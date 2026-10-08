import React, { useState } from 'react';
import {
  Sparkles,
  Shirt,
  Palette,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Sliders,
  Copy,
  Check,
} from 'lucide-react';
import { StylistAnalysis, ClothingItem } from '../types/stylist';

interface DiagnosticTabsProps {
  analysis: StylistAnalysis;
  onHighlightItem?: (idx: number | null) => void;
  activeItemIndex?: number | null;
}

export const DiagnosticTabs: React.FC<DiagnosticTabsProps> = ({
  analysis,
  onHighlightItem,
  activeItemIndex,
}) => {
  const [activeTab, setActiveTab] = useState<'items' | 'metrics' | 'palette' | 'tips'>('items');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div className="w-full bg-stone-900/90 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Tab Navigation */}
      <div className="flex border-b border-stone-800 bg-stone-950/70 overflow-x-auto text-xs sm:text-sm">
        <button
          onClick={() => setActiveTab('items')}
          className={`flex-1 py-3.5 px-4 font-semibold flex items-center justify-center gap-2 whitespace-nowrap transition ${
            activeTab === 'items'
              ? 'text-amber-300 border-b-2 border-amber-500 bg-amber-500/10'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Shirt className="w-4 h-4 text-amber-400" />
          <span>單品微距診斷 ({analysis.clothingItems?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex-1 py-3.5 px-4 font-semibold flex items-center justify-center gap-2 whitespace-nowrap transition ${
            activeTab === 'metrics'
              ? 'text-amber-300 border-b-2 border-amber-500 bg-amber-500/10'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sliders className="w-4 h-4 text-amber-400" />
          <span>六維美學維度剖析</span>
        </button>

        <button
          onClick={() => setActiveTab('palette')}
          className={`flex-1 py-3.5 px-4 font-semibold flex items-center justify-center gap-2 whitespace-nowrap transition ${
            activeTab === 'palette'
              ? 'text-amber-300 border-b-2 border-amber-500 bg-amber-500/10'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Palette className="w-4 h-4 text-amber-400" />
          <span>色彩萃取與季型</span>
        </button>

        <button
          onClick={() => setActiveTab('tips')}
          className={`flex-1 py-3.5 px-4 font-semibold flex items-center justify-center gap-2 whitespace-nowrap transition ${
            activeTab === 'tips'
              ? 'text-amber-300 border-b-2 border-amber-500 bg-amber-500/10'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-amber-400" />
          <span>一衣多穿與升級處方</span>
        </button>
      </div>

      <div className="p-4 sm:p-6">
        {/* TAB 1: CLOTHING ITEMS BREAKDOWN */}
        {activeTab === 'items' && (
          <div className="space-y-4">
            <div className="text-xs text-stone-400 mb-2">
              懸停或點選卡片可於上方 Canvas 儀表板連動查看標記位置：
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.clothingItems?.map((item, idx) => {
                const isSelected = activeItemIndex === idx;
                const statusBadge =
                  item.status === 'great'
                    ? { bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40', text: '表現卓越' }
                    : item.status === 'good'
                    ? { bg: 'bg-sky-500/20 text-sky-400 border-sky-500/40', text: '搭配合宜' }
                    : { bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40', text: '建議微調' };

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => onHighlightItem?.(idx)}
                    onMouseLeave={() => onHighlightItem?.(null)}
                    onClick={() => onHighlightItem?.(idx)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/30 border-amber-400 ring-1 ring-amber-400/50 shadow-lg'
                        : 'bg-stone-950/80 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-stone-900 border border-stone-800 flex items-center justify-center text-xs font-bold text-amber-400">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-sm text-stone-100">{item.item}</h4>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusBadge.bg}`}
                      >
                        {statusBadge.text}
                      </span>
                    </div>

                    <p className="text-xs text-stone-300 leading-relaxed mb-3">{item.feedback}</p>

                    <div className="p-2.5 rounded-lg bg-stone-900/90 border border-stone-800/80 flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-stone-200">
                        <span className="font-semibold text-amber-300">升級秘訣：</span>
                        <span>{item.upgradeTip}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: SIX-AXIS METRICS */}
        {activeTab === 'metrics' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: '色彩調和度 (Color Harmony)',
                  data: analysis.metrics?.colorHarmony,
                  icon: '🎨',
                },
                {
                  title: '比例與剪裁 (Silhouette & Fit)',
                  data: analysis.metrics?.silhouetteProportions,
                  icon: '📐',
                },
                {
                  title: '場合適配度 (Occasion Appropriateness)',
                  data: analysis.metrics?.occasionFit,
                  icon: '🎯',
                },
                {
                  title: '潮流時髦感 (Trendiness & Edge)',
                  data: analysis.metrics?.trendiness,
                  icon: '⚡',
                },
                {
                  title: '細節與配飾 (Accessories & Details)',
                  data: analysis.metrics?.detailAccessories,
                  icon: '💍',
                },
                {
                  title: '實穿百搭性 (Versatility)',
                  data: analysis.metrics?.versatility,
                  icon: '🔄',
                },
              ].map((item, i) => {
                const score = item.data?.score || 80;
                return (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-200 flex items-center gap-1.5">
                        <span>{item.icon}</span>
                        <span>{item.title}</span>
                      </span>
                      <span className="font-mono text-sm font-bold text-amber-400">
                        {score} / 100
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                      />
                    </div>

                    <p className="text-xs text-stone-400 leading-relaxed">
                      {item.data?.critique || '搭配比例恰如其分，展現協調美學。'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: COLOR PALETTE & SEASON */}
        {activeTab === 'palette' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {analysis.colorPalette?.map((color, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-2 text-center"
                >
                  <div
                    className="w-full aspect-video rounded-lg shadow-inner border border-white/10"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div>
                    <h5 className="font-bold text-xs text-stone-100">{color.name}</h5>
                    <button
                      onClick={() => handleCopyHex(color.hex)}
                      className="mt-1 flex items-center justify-center gap-1 mx-auto text-[11px] font-mono text-stone-400 hover:text-amber-300 transition"
                      title="複製色碼"
                    >
                      <span>{color.hex}</span>
                      {copiedHex === color.hex ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-stone-900 border border-stone-800 text-amber-400">
                      {color.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-stone-950 to-stone-900 border border-stone-800">
              <h4 className="font-bold text-sm text-amber-300 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                四季色彩型人適配分析
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                本套穿搭整體色彩低飽和、高質感，對於冷冬型 (Cool Winter) 與柔秋型 (Soft Autumn)
                均具有極佳提亮氣色效果。若想進一步提升臉部立體感，可佩戴帶微光澤的金屬耳飾或輕柔真絲小絲巾做視覺聚光。
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: ADVANCED PAIRING & SCENARIO */}
        {activeTab === 'tips' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/30 to-stone-950 border border-amber-500/30">
              <h4 className="font-bold text-sm text-amber-300 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                一衣多穿 • 場景快速切換方案
              </h4>
              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                {analysis.alternativePairing ||
                  '白天上班穿著合身外套維持幹練；下班後的約會或晚宴，僅需脫下外層外套或換上一對幾何金屬耳環與精巧晚宴手拿包，即可無縫過渡至夜間時尚場域。'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                <h5 className="font-bold text-xs text-emerald-400 mb-2">✦ 秀場總監三大亮點</h5>
                <ul className="space-y-2 text-xs text-stone-300">
                  {analysis.highlights?.map((hl, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                <h5 className="font-bold text-xs text-amber-400 mb-2">▲ 進階升級處方</h5>
                <ul className="space-y-2 text-xs text-stone-300">
                  {analysis.tuningAdvice?.map((adv, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
