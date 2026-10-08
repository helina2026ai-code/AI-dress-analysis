import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Download,
  Eye,
  Sliders,
  Sparkles,
  Layers,
  Palette,
  Maximize2,
  Minimize2,
  Check,
  RefreshCw,
} from 'lucide-react';
import { StylistAnalysis, ClothingItem } from '../types/stylist';

interface FashionCanvasDashboardProps {
  imageSrc: string;
  analysis: StylistAnalysis;
  activeItemIndex?: number | null;
  onSelectItem?: (index: number | null) => void;
}

type CanvasTheme = 'dark' | 'ivory' | 'neon';
type PhotoFilter = 'normal' | 'editorial' | 'warm' | 'noir';

export const FashionCanvasDashboard: React.FC<FashionCanvasDashboardProps> = ({
  imageSrc,
  analysis,
  activeItemIndex,
  onSelectItem,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [theme, setTheme] = useState<CanvasTheme>('dark');
  const [photoFilter, setPhotoFilter] = useState<PhotoFilter>('editorial');
  const [showPins, setShowPins] = useState(true);
  const [showRadar, setShowRadar] = useState(true);
  const [showPalette, setShowPalette] = useState(true);
  const [showTypography, setShowTypography] = useState(true);
  const [hoveredPin, setHoveredPin] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Loaded outfit image cache
  const imgElementRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Preload Image
  useEffect(() => {
    setImageLoaded(false);
    const img = new Image();
    if (imageSrc.startsWith('http')) {
      img.crossOrigin = 'anonymous';
    }
    img.src = imageSrc;
    img.onload = () => {
      imgElementRef.current = img;
      setImageLoaded(true);
    };
    img.onerror = () => {
      // If CORS or local image error, fallback to non-crossorigin
      const fallback = new Image();
      fallback.src = imageSrc;
      fallback.onload = () => {
        imgElementRef.current = fallback;
        setImageLoaded(true);
      };
    };
  }, [imageSrc]);

  // Main Canvas Render Loop
  const renderCanvas = useCallback(
    (exportMode = false) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Base canvas size for magazine layout
      const W = 1200;
      const H = 1500;
      canvas.width = W;
      canvas.height = H;

      // Color Palette Schemes
      const colors = {
        dark: {
          bg: '#0c0a09',
          cardBg: '#1c1917',
          cardBorder: '#44403c',
          textMain: '#fafaf9',
          textMuted: '#a8a29e',
          accentGold: '#eab308',
          accentLight: '#fef08a',
          radarFill: 'rgba(234, 179, 8, 0.25)',
          radarStroke: '#eab308',
          radarGrid: 'rgba(214, 211, 209, 0.15)',
          pinBg: 'rgba(12, 10, 9, 0.85)',
        },
        ivory: {
          bg: '#fbfaf8',
          cardBg: '#ffffff',
          cardBorder: '#e7e5e4',
          textMain: '#1c1917',
          textMuted: '#78716c',
          accentGold: '#b45309',
          accentLight: '#d97706',
          radarFill: 'rgba(180, 83, 9, 0.2)',
          radarStroke: '#b45309',
          radarGrid: 'rgba(120, 113, 108, 0.2)',
          pinBg: 'rgba(255, 255, 255, 0.9)',
        },
        neon: {
          bg: '#09090b',
          cardBg: '#18181b',
          cardBorder: '#27272a',
          textMain: '#fafafa',
          textMuted: '#a1a1aa',
          accentGold: '#06b6d4',
          accentLight: '#67e8f9',
          radarFill: 'rgba(6, 182, 212, 0.25)',
          radarStroke: '#06b6d4',
          radarGrid: 'rgba(6, 182, 212, 0.15)',
          pinBg: 'rgba(9, 9, 11, 0.88)',
        },
      }[theme];

      // 1. Draw Background
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, W, H);

      // Subtle Background Texture / Luxury Border
      ctx.strokeStyle = colors.cardBorder;
      ctx.lineWidth = 1;
      ctx.strokeRect(30, 30, W - 60, H - 60);

      // Inner hairline double border
      ctx.strokeStyle = colors.radarGrid;
      ctx.lineWidth = 1;
      ctx.strokeRect(36, 36, W - 72, H - 72);

      // 2. Editorial Header
      if (showTypography) {
        ctx.save();
        // Top Tag
        ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = colors.accentGold;
        ctx.letterSpacing = '6px';
        ctx.fillText('VOGUE EDITORIAL AI DOSSIER • ISSUE 2026', 50, 70);

        // Magazine Title
        ctx.font = '900 36px "Cinzel", serif';
        ctx.fillStyle = colors.textMain;
        ctx.letterSpacing = '4px';
        ctx.fillText('HAUTE COUTURE REPORT', 50, 114);

        // Date & Stylist Archetype subhead
        ctx.font = '500 14px "Noto Sans TC", sans-serif';
        ctx.fillStyle = colors.textMuted;
        ctx.letterSpacing = '1px';
        ctx.fillText(`美學定位：${analysis.styleArchetype || '高階時裝風格'}`, 50, 140);

        // Right side stamp
        ctx.textAlign = 'right';
        ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = colors.accentGold;
        ctx.fillText('CONFIDENTIAL STYLING AUDIT', W - 50, 80);
        ctx.font = '400 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = colors.textMuted;
        ctx.fillText(new Date().toLocaleDateString('zh-TW'), W - 50, 102);
        ctx.restore();
      }

      // 3. Draw Main Outfit Photo (Left half: x: 50, y: 160, w: 540, h: 820)
      const photoX = 50;
      const photoY = 160;
      const photoW = 540;
      const photoH = 820;

      // Draw photo container shadow and frame
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 12;

      ctx.fillStyle = colors.cardBg;
      roundRect(ctx, photoX, photoY, photoW, photoH, 16);
      ctx.fill();
      ctx.restore();

      // Clip image inside rounded frame
      ctx.save();
      roundRect(ctx, photoX, photoY, photoW, photoH, 16);
      ctx.clip();

      if (imgElementRef.current && imageLoaded) {
        const img = imgElementRef.current;
        // Cover aspect ratio
        const imgRatio = img.width / img.height;
        const targetRatio = photoW / photoH;
        let sWidth, sHeight, sx, sy;

        if (imgRatio > targetRatio) {
          sHeight = img.height;
          sWidth = img.height * targetRatio;
          sx = (img.width - sWidth) / 2;
          sy = 0;
        } else {
          sWidth = img.width;
          sHeight = img.width / targetRatio;
          sx = 0;
          sy = (img.height - sHeight) / 2;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, photoX, photoY, photoW, photoH);

        // Apply Photo Filter Overlay
        if (photoFilter === 'editorial') {
          const grad = ctx.createLinearGradient(photoX, photoY, photoX, photoY + photoH);
          grad.addColorStop(0, 'rgba(0,0,0,0.05)');
          grad.addColorStop(0.7, 'rgba(0,0,0,0.15)');
          grad.addColorStop(1, 'rgba(0,0,0,0.55)');
          ctx.fillStyle = grad;
          ctx.fillRect(photoX, photoY, photoW, photoH);
        } else if (photoFilter === 'warm') {
          ctx.fillStyle = 'rgba(234, 179, 8, 0.12)';
          ctx.fillRect(photoX, photoY, photoW, photoH);
        } else if (photoFilter === 'noir') {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.fillRect(photoX, photoY, photoW, photoH);
        }
      } else {
        // Fallback loading placeholder
        ctx.fillStyle = '#292524';
        ctx.fillRect(photoX, photoY, photoW, photoH);
        ctx.fillStyle = '#78716c';
        ctx.font = '16px "Noto Sans TC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('照片載入中...', photoX + photoW / 2, photoY + photoH / 2);
      }
      ctx.restore();

      // Border around photo
      ctx.strokeStyle = colors.cardBorder;
      ctx.lineWidth = 2;
      roundRect(ctx, photoX, photoY, photoW, photoH, 16);
      ctx.stroke();

      // 4. Draw Interactive Callout Pins & Leader Lines on Photo
      if (showPins && analysis.clothingItems && analysis.clothingItems.length > 0) {
        analysis.clothingItems.forEach((item, idx) => {
          // Normalize coordinates into the photo frame
          // Default clamps
          const normX = Math.max(10, Math.min(90, item.x || 50));
          const normY = Math.max(10, Math.min(90, item.y || 20 + idx * 15));

          const pinX = photoX + (normX / 100) * photoW;
          const pinY = photoY + (normY / 100) * photoH;

          const isHovered = hoveredPin === idx || activeItemIndex === idx;

          // Draw Glowing Anchor Dot on Item
          ctx.save();
          if (isHovered) {
            ctx.shadowColor = colors.accentGold;
            ctx.shadowBlur = 18;
          }

          // Outer pulse ring
          ctx.beginPath();
          ctx.arc(pinX, pinY, isHovered ? 11 : 7, 0, Math.PI * 2);
          ctx.fillStyle = isHovered ? colors.accentGold : 'rgba(255, 255, 255, 0.9)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(pinX, pinY, isHovered ? 5 : 3.5, 0, Math.PI * 2);
          ctx.fillStyle = colors.bg;
          ctx.fill();

          // Leader line towards right or left
          const goesRight = normX < 60;
          const lineLength = 40;
          const targetX = goesRight ? pinX + lineLength : pinX - lineLength;
          const targetY = pinY - 12;

          ctx.strokeStyle = isHovered ? colors.accentGold : 'rgba(255, 255, 255, 0.7)';
          ctx.lineWidth = isHovered ? 2 : 1.2;
          ctx.beginPath();
          ctx.moveTo(pinX, pinY);
          ctx.lineTo(targetX, targetY);
          ctx.stroke();

          // Label Pill
          const labelText = item.item;
          const statusText =
            item.status === 'great' ? '✦ 絕佳' : item.status === 'good' ? '● 良好' : '▲ 建議微調';

          ctx.font = '600 12px "Noto Sans TC", sans-serif';
          const textWidth = ctx.measureText(labelText).width;
          const pillW = Math.max(110, textWidth + 50);
          const pillH = 28;
          const pillX = goesRight ? targetX : targetX - pillW;
          const pillY = targetY - pillH / 2;

          ctx.fillStyle = isHovered ? colors.accentGold : colors.pinBg;
          ctx.strokeStyle = isHovered ? '#ffffff' : colors.cardBorder;
          ctx.lineWidth = 1;
          roundRect(ctx, pillX, pillY, pillW, pillH, 14);
          ctx.fill();
          ctx.stroke();

          // Pill Text
          ctx.fillStyle = isHovered ? '#000000' : colors.textMain;
          ctx.textAlign = 'left';
          ctx.font = '700 11px "Noto Sans TC", sans-serif';
          ctx.fillText(labelText, pillX + 10, pillY + 18);

          // Status Badge
          ctx.textAlign = 'right';
          ctx.font = '600 10px "Noto Sans TC", sans-serif';
          ctx.fillStyle = isHovered
            ? '#000000'
            : item.status === 'great'
            ? '#4ade80'
            : item.status === 'good'
            ? '#38bdf8'
            : '#fbbf24';
          ctx.fillText(statusText, pillX + pillW - 8, pillY + 18);

          ctx.restore();
        });
      }

      // 5. Right Top Section: Overall Score & Haute-Couture Seal (x: 620, y: 160, w: 530, h: 230)
      const scoreCardX = 620;
      const scoreCardY = 160;
      const scoreCardW = 530;
      const scoreCardH = 230;

      ctx.save();
      ctx.fillStyle = colors.cardBg;
      ctx.strokeStyle = colors.cardBorder;
      ctx.lineWidth = 1.5;
      roundRect(ctx, scoreCardX, scoreCardY, scoreCardW, scoreCardH, 16);
      ctx.fill();
      ctx.stroke();

      // Circular Radial Score Gauge
      const gaugeCenterX = scoreCardX + 110;
      const gaugeCenterY = scoreCardY + 115;
      const gaugeRadius = 75;

      // Background Track
      ctx.beginPath();
      ctx.arc(gaugeCenterX, gaugeCenterY, gaugeRadius, 0, Math.PI * 2);
      ctx.strokeStyle = colors.radarGrid;
      ctx.lineWidth = 10;
      ctx.stroke();

      // Progress Arc
      const scorePct = Math.min(100, Math.max(0, analysis.overallScore || 85)) / 100;
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + Math.PI * 2 * scorePct;

      ctx.beginPath();
      ctx.arc(gaugeCenterX, gaugeCenterY, gaugeRadius, startAngle, endAngle);
      ctx.strokeStyle = colors.accentGold;
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Number in Center
      ctx.textAlign = 'center';
      ctx.font = '900 48px "Cinzel", serif';
      ctx.fillStyle = colors.textMain;
      ctx.fillText(String(analysis.overallScore || 88), gaugeCenterX, gaugeCenterY + 14);

      ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = colors.textMuted;
      ctx.letterSpacing = '1px';
      ctx.fillText('OVERALL SCORE', gaugeCenterX, gaugeCenterY + 36);

      // Grade Letter Stamp Pill on top right of gauge
      ctx.font = '800 18px "Cinzel", serif';
      ctx.fillStyle = colors.accentGold;
      ctx.fillText(`GRADE [ ${analysis.gradeLetter || 'S'} ]`, gaugeCenterX, gaugeCenterY - 48);

      // Score Right Side Text (Archetype & Summary)
      ctx.textAlign = 'left';
      ctx.font = '800 24px "Noto Sans TC", sans-serif';
      ctx.fillStyle = colors.textMain;
      ctx.fillText(analysis.styleArchetype || '高階時裝風格', scoreCardX + 220, scoreCardY + 60);

      ctx.font = '600 13px "Noto Sans TC", sans-serif';
      ctx.fillStyle = colors.accentGold;
      ctx.fillText('時裝美學總覽評語', scoreCardX + 220, scoreCardY + 92);

      // Wrapped summary text
      ctx.font = '400 13px "Noto Sans TC", sans-serif';
      ctx.fillStyle = colors.textMuted;
      wrapText(
        ctx,
        analysis.summaryVibe || '造型整體具備鮮明俐落感，色彩比例精確調和。',
        scoreCardX + 220,
        scoreCardY + 118,
        280,
        22
      );

      ctx.restore();

      // 6. Right Middle Section: 6-Axis Radar Spider Chart (x: 620, y: 410, w: 530, h: 400)
      if (showRadar) {
        const radarCardX = 620;
        const radarCardY = 410;
        const radarCardW = 530;
        const radarCardH = 400;

        ctx.save();
        ctx.fillStyle = colors.cardBg;
        ctx.strokeStyle = colors.cardBorder;
        ctx.lineWidth = 1.5;
        roundRect(ctx, radarCardX, radarCardY, radarCardW, radarCardH, 16);
        ctx.fill();
        ctx.stroke();

        // Title
        ctx.textAlign = 'left';
        ctx.font = '700 14px "Noto Sans TC", sans-serif';
        ctx.fillStyle = colors.accentGold;
        ctx.letterSpacing = '1px';
        ctx.fillText('✦ 六大維度美學雷達圖 (STYLE RADAR)', radarCardX + 30, radarCardY + 36);

        // Radar center
        const rCenterX = radarCardX + radarCardW / 2;
        const rCenterY = radarCardY + 225;
        const rRadius = 120;

        const axes = [
          { key: 'colorHarmony', label: '色彩調和', score: analysis.metrics?.colorHarmony?.score || 85 },
          { key: 'silhouetteProportions', label: '比例剪裁', score: analysis.metrics?.silhouetteProportions?.score || 88 },
          { key: 'occasionFit', label: '場合適配', score: analysis.metrics?.occasionFit?.score || 92 },
          { key: 'trendiness', label: '潮流時髦', score: analysis.metrics?.trendiness?.score || 80 },
          { key: 'detailAccessories', label: '細節配飾', score: analysis.metrics?.detailAccessories?.score || 78 },
          { key: 'versatility', label: '實穿百搭', score: analysis.metrics?.versatility?.score || 84 },
        ];

        const totalAxes = axes.length;
        const angleStep = (Math.PI * 2) / totalAxes;

        // Draw Web Grids (Levels: 20%, 40%, 60%, 80%, 100%)
        const levels = [0.25, 0.5, 0.75, 1.0];
        levels.forEach((lvl) => {
          ctx.beginPath();
          for (let i = 0; i < totalAxes; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const x = rCenterX + Math.cos(angle) * rRadius * lvl;
            const y = rCenterY + Math.sin(angle) * rRadius * lvl;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.strokeStyle = colors.radarGrid;
          ctx.lineWidth = 1;
          ctx.stroke();
        });

        // Draw Spoke Lines & Labels
        axes.forEach((axis, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const endX = rCenterX + Math.cos(angle) * rRadius;
          const endY = rCenterY + Math.sin(angle) * rRadius;

          ctx.beginPath();
          ctx.moveTo(rCenterX, rCenterY);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = colors.radarGrid;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Axis Label & Score
          const labelDist = rRadius + 26;
          const labelX = rCenterX + Math.cos(angle) * labelDist;
          const labelY = rCenterY + Math.sin(angle) * labelDist;

          ctx.textAlign = 'center';
          ctx.font = '600 12px "Noto Sans TC", sans-serif';
          ctx.fillStyle = colors.textMain;
          ctx.fillText(axis.label, labelX, labelY);

          ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = colors.accentGold;
          ctx.fillText(`${axis.score}`, labelX, labelY + 14);
        });

        // Draw Score Polygon
        ctx.beginPath();
        axes.forEach((axis, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const dist = (Math.min(100, Math.max(0, axis.score)) / 100) * rRadius;
          const px = rCenterX + Math.cos(angle) * dist;
          const py = rCenterY + Math.sin(angle) * dist;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();

        ctx.fillStyle = colors.radarFill;
        ctx.fill();
        ctx.strokeStyle = colors.radarStroke;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Glowing dots on vertices
        axes.forEach((axis, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const dist = (Math.min(100, Math.max(0, axis.score)) / 100) * rRadius;
          const px = rCenterX + Math.cos(angle) * dist;
          const py = rCenterY + Math.sin(angle) * dist;

          ctx.beginPath();
          ctx.arc(px, py, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = colors.accentGold;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });

        ctx.restore();
      }

      // 7. Right Bottom Section: Color Palette Swatches (x: 620, y: 830, w: 530, h: 150)
      if (showPalette) {
        const palCardX = 620;
        const palCardY = 830;
        const palCardW = 530;
        const palCardH = 150;

        ctx.save();
        ctx.fillStyle = colors.cardBg;
        ctx.strokeStyle = colors.cardBorder;
        ctx.lineWidth = 1.5;
        roundRect(ctx, palCardX, palCardY, palCardW, palCardH, 16);
        ctx.fill();
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.font = '700 13px "Noto Sans TC", sans-serif';
        ctx.fillStyle = colors.accentGold;
        ctx.letterSpacing = '1px';
        ctx.fillText('✦ 造型核心萃取色票 (COLOR PALETTE)', palCardX + 24, palCardY + 30);

        const palette = analysis.colorPalette || [];
        const count = Math.min(5, Math.max(1, palette.length));
        const chipGap = 12;
        const totalW = palCardW - 48;
        const chipW = (totalW - (count - 1) * chipGap) / count;
        const chipH = 54;
        const startY = palCardY + 48;

        palette.slice(0, 5).forEach((color, i) => {
          const cx = palCardX + 24 + i * (chipW + chipGap);

          // Color swatch rect
          ctx.save();
          ctx.fillStyle = color.hex || '#888888';
          roundRect(ctx, cx, startY, chipW, chipH, 8);
          ctx.fill();
          ctx.strokeStyle = colors.cardBorder;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();

          // Color name & hex
          ctx.textAlign = 'center';
          ctx.font = '600 11px "Noto Sans TC", sans-serif';
          ctx.fillStyle = colors.textMain;
          ctx.fillText(color.name || '色調', cx + chipW / 2, startY + chipH + 18);

          ctx.font = '500 10px "Plus Jakarta Sans", monospace';
          ctx.fillStyle = colors.textMuted;
          ctx.fillText((color.hex || '').toUpperCase(), cx + chipW / 2, startY + chipH + 32);

          // Role tag
          if (color.role) {
            ctx.font = '500 9px "Plus Jakarta Sans", sans-serif';
            ctx.fillStyle = colors.accentGold;
            ctx.fillText(color.role, cx + chipW / 2, startY + chipH + 44);
          }
        });

        ctx.restore();
      }

      // 8. Bottom Full Width Banner: Stylist Advice & Golden Quote (x: 50, y: 1000, w: 1100, h: 420)
      const adviceX = 50;
      const adviceY = 1000;
      const adviceW = 1100;
      const adviceH = 430;

      ctx.save();
      ctx.fillStyle = colors.cardBg;
      ctx.strokeStyle = colors.cardBorder;
      ctx.lineWidth = 1.5;
      roundRect(ctx, adviceX, adviceY, adviceW, adviceH, 16);
      ctx.fill();
      ctx.stroke();

      // Left Column: 穿搭亮點 (Highlights)
      ctx.textAlign = 'left';
      ctx.font = '700 16px "Noto Sans TC", sans-serif';
      ctx.fillStyle = '#4ade80';
      ctx.fillText('★ 造型精華亮點 (KEY HIGHLIGHTS)', adviceX + 30, adviceY + 42);

      const highlights = analysis.highlights || ['整體色系配合協調', '剪裁修飾身型比例良好'];
      highlights.slice(0, 3).forEach((hl, i) => {
        const itemY = adviceY + 80 + i * 48;
        ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = colors.accentGold;
        ctx.fillText(`0${i + 1}`, adviceX + 30, itemY);

        ctx.font = '400 13px "Noto Sans TC", sans-serif';
        ctx.fillStyle = colors.textMain;
        wrapText(ctx, hl, adviceX + 60, itemY, 440, 20);
      });

      // Divider vertical line
      ctx.strokeStyle = colors.radarGrid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(adviceX + 530, adviceY + 30);
      ctx.lineTo(adviceX + 530, adviceY + adviceH - 30);
      ctx.stroke();

      // Right Column: 造型師升級建議 (Stylist Tuning Advice)
      ctx.textAlign = 'left';
      ctx.font = '700 16px "Noto Sans TC", sans-serif';
      ctx.fillStyle = colors.accentGold;
      ctx.fillText('▲ 升級處方指南 (STYLING PRESCRIPTION)', adviceX + 560, adviceY + 42);

      const tuningAdvice = analysis.tuningAdvice || ['可加入質感金屬配件點綴', '調整褲管或袖長能讓視覺更輕盈'];
      tuningAdvice.slice(0, 3).forEach((adv, i) => {
        const itemY = adviceY + 80 + i * 48;
        ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = colors.accentGold;
        ctx.fillText(`+${i + 1}`, adviceX + 560, itemY);

        ctx.font = '400 13px "Noto Sans TC", sans-serif';
        ctx.fillStyle = colors.textMain;
        wrapText(ctx, adv, adviceX + 590, itemY, 450, 20);
      });

      // Bottom Quote & Stylist Signature Footer
      const quoteY = adviceY + 280;
      ctx.fillStyle = colors.radarGrid;
      ctx.fillRect(adviceX + 30, quoteY - 20, adviceW - 60, 1);

      ctx.font = 'italic 500 14px "Noto Sans TC", serif';
      ctx.fillStyle = colors.accentLight;
      ctx.textAlign = 'left';
      const quoteText = `「${analysis.fashionQuote || '風格是無需言語就能向世界展現自我的一種方式。'}」`;
      ctx.fillText(quoteText, adviceX + 30, quoteY + 16);

      // Spoken critique reminder
      ctx.font = '400 12px "Noto Sans TC", sans-serif';
      ctx.fillStyle = colors.textMuted;
      ctx.fillText(
        `語音精華：${(analysis.spokenCritique || '').slice(0, 48)}...`,
        adviceX + 30,
        quoteY + 46
      );

      // Signature & Stamp
      ctx.textAlign = 'right';
      ctx.font = '700 13px "Cinzel", serif';
      ctx.fillStyle = colors.accentGold;
      ctx.letterSpacing = '2px';
      ctx.fillText('HAUTE COUTURE CERTIFIED', adviceX + adviceW - 30, quoteY + 16);

      ctx.font = '400 10px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = colors.textMuted;
      ctx.letterSpacing = '1px';
      ctx.fillText('VOGUE AI STYLIST ENGINE 2026', adviceX + adviceW - 30, quoteY + 36);

      ctx.restore();
    },
    [
      imageLoaded,
      theme,
      photoFilter,
      showPins,
      showRadar,
      showPalette,
      showTypography,
      hoveredPin,
      activeItemIndex,
      analysis,
    ]
  );

  // Helper: Rounded Rectangle
  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // Helper: Wrap Text
  function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) {
    const chars = text.split('');
    let line = '';
    let currentY = y;

    for (let n = 0; n < chars.length; n++) {
      const testLine = line + chars[n];
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = chars[n];
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }

  // Trigger render when dependencies change
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Handle Canvas Mouse Move to Detect Pin Hover
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !showPins || !analysis.clothingItems) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = (e.clientX - rect.left) * scaleX;
    const clientY = (e.clientY - rect.top) * scaleY;

    const photoX = 50;
    const photoY = 160;
    const photoW = 540;
    const photoH = 820;

    let foundIdx: number | null = null;
    analysis.clothingItems.forEach((item, idx) => {
      const normX = Math.max(10, Math.min(90, item.x || 50));
      const normY = Math.max(10, Math.min(90, item.y || 20 + idx * 15));
      const pinX = photoX + (normX / 100) * photoW;
      const pinY = photoY + (normY / 100) * photoH;

      const dist = Math.hypot(clientX - pinX, clientY - pinY);
      if (dist < 30) {
        foundIdx = idx;
      }
    });

    if (foundIdx !== hoveredPin) {
      setHoveredPin(foundIdx);
      if (foundIdx !== null && onSelectItem) {
        onSelectItem(foundIdx);
      }
    }
  };

  const handleCanvasMouseLeave = () => {
    if (hoveredPin !== null) {
      setHoveredPin(null);
    }
  };

  // Export High-Resolution PNG from Canvas
  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsExporting(true);
    try {
      renderCanvas(true);
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `Vogue_AI_Stylist_Report_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col bg-stone-900/80 border border-stone-800 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 overflow-y-auto max-h-[96vh]' : 'w-full'
      }`}
    >
      {/* Top Bar with Toolbar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-stone-950/80 border-b border-stone-800/80 text-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-serif font-bold tracking-wider text-amber-200">
            CANVAS 雜誌風動態儀表板
          </span>
          <span className="text-xs text-stone-400 hidden sm:inline">
            (可直接在圖中懸停單品或自訂圖層)
          </span>
        </div>

        {/* Theme, Layer Toggles and Export Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Theme Selector */}
          <div className="flex items-center bg-stone-900 rounded-lg p-0.5 border border-stone-800 text-xs">
            <button
              onClick={() => setTheme('dark')}
              className={`px-2.5 py-1 rounded-md transition ${
                theme === 'dark' ? 'bg-stone-800 text-amber-300 font-semibold' : 'text-stone-400 hover:text-stone-200'
              }`}
              title="深黑奢華"
            >
              黑曜
            </button>
            <button
              onClick={() => setTheme('ivory')}
              className={`px-2.5 py-1 rounded-md transition ${
                theme === 'ivory' ? 'bg-amber-100 text-stone-900 font-semibold' : 'text-stone-400 hover:text-stone-200'
              }`}
              title="米蘭純白"
            >
              純白
            </button>
            <button
              onClick={() => setTheme('neon')}
              className={`px-2.5 py-1 rounded-md transition ${
                theme === 'neon' ? 'bg-cyan-950 text-cyan-300 font-semibold border border-cyan-800' : 'text-stone-400 hover:text-stone-200'
              }`}
              title="賽博前衛"
            >
              霓虹
            </button>
          </div>

          {/* Photo Filter */}
          <div className="flex items-center bg-stone-900 rounded-lg p-0.5 border border-stone-800 text-xs">
            <span className="text-stone-500 pl-1.5 pr-1">濾鏡:</span>
            <button
              onClick={() => setPhotoFilter('editorial')}
              className={`px-2 py-1 rounded transition ${photoFilter === 'editorial' ? 'bg-stone-800 text-amber-300' : 'text-stone-400'}`}
            >
              雜誌
            </button>
            <button
              onClick={() => setPhotoFilter('warm')}
              className={`px-2 py-1 rounded transition ${photoFilter === 'warm' ? 'bg-stone-800 text-amber-300' : 'text-stone-400'}`}
            >
              暖調
            </button>
            <button
              onClick={() => setPhotoFilter('noir')}
              className={`px-2 py-1 rounded transition ${photoFilter === 'noir' ? 'bg-stone-800 text-amber-300' : 'text-stone-400'}`}
            >
              膠片
            </button>
            <button
              onClick={() => setPhotoFilter('normal')}
              className={`px-2 py-1 rounded transition ${photoFilter === 'normal' ? 'bg-stone-800 text-amber-300' : 'text-stone-400'}`}
            >
              原圖
            </button>
          </div>

          {/* Overlays Switch */}
          <div className="flex items-center gap-1 bg-stone-900 rounded-lg p-1 border border-stone-800 text-xs">
            <button
              onClick={() => setShowPins((prev) => !prev)}
              className={`px-2 py-1 rounded flex items-center gap-1 transition ${
                showPins ? 'bg-amber-500/20 text-amber-300' : 'text-stone-500'
              }`}
              title="穿搭單品圖標"
            >
              <Eye className="w-3 h-3" />
              <span>單品</span>
            </button>
            <button
              onClick={() => setShowRadar((prev) => !prev)}
              className={`px-2 py-1 rounded flex items-center gap-1 transition ${
                showRadar ? 'bg-amber-500/20 text-amber-300' : 'text-stone-500'
              }`}
              title="美學雷達圖"
            >
              <Sliders className="w-3 h-3" />
              <span>雷達</span>
            </button>
            <button
              onClick={() => setShowPalette((prev) => !prev)}
              className={`px-2 py-1 rounded flex items-center gap-1 transition ${
                showPalette ? 'bg-amber-500/20 text-amber-300' : 'text-stone-500'
              }`}
              title="色票條"
            >
              <Palette className="w-3 h-3" />
              <span>色票</span>
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200 transition"
            title={isFullscreen ? '退出全螢幕' : '全螢幕檢視'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Export PNG */}
          <button
            onClick={handleExportPNG}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold text-xs transition shadow-md disabled:opacity-50 cursor-pointer"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-stone-950" />
                <span>已下載！</span>
              </>
            ) : isExporting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>處理中...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>下載雜誌卡片</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Display */}
      <div className="relative w-full flex justify-center items-center p-3 sm:p-6 bg-gradient-to-b from-stone-950 to-stone-900/90 overflow-hidden">
        <div className="relative max-w-full w-full max-h-[82vh] flex justify-center items-center">
          <canvas
            ref={canvasRef}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={handleCanvasMouseLeave}
            className="max-h-[80vh] w-auto h-auto max-w-full rounded-xl shadow-2xl border border-stone-800/80 cursor-crosshair transition-transform"
            style={{
              aspectRatio: '1200 / 1500',
              objectFit: 'contain',
            }}
          />
        </div>

        {/* Hover Tooltip Overlay when cursor is over an item pin */}
        {hoveredPin !== null && analysis.clothingItems?.[hoveredPin] && (
          <div className="absolute bottom-6 left-6 max-w-sm p-3 rounded-xl bg-stone-950/95 border border-amber-500/60 text-stone-200 text-xs shadow-2xl backdrop-blur-md animate-fade-in pointer-events-none z-20">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-bold text-amber-300">
                {analysis.clothingItems[hoveredPin].item}
              </span>
              <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                {analysis.clothingItems[hoveredPin].category}
              </span>
            </div>
            <p className="text-stone-300 mb-1">{analysis.clothingItems[hoveredPin].feedback}</p>
            <p className="text-amber-200 font-medium">
              💡 {analysis.clothingItems[hoveredPin].upgradeTip}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Hint Strip */}
      <div className="px-4 py-2 bg-stone-950/60 border-t border-stone-800/60 flex items-center justify-between text-xs text-stone-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>動態 Canvas 已整合：六角雷達圖、穿搭單品診斷連線標籤、專屬四季色票與時裝總監點評</span>
        </div>
        <div className="hidden sm:block text-stone-500">
          高解析度 1200x1500 Magazine Layout
        </div>
      </div>
    </div>
  );
};
