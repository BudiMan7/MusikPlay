import React, { useEffect, useRef, useState } from 'react';
import { BarChart3, Activity, Disc } from 'lucide-react';
import { audioEngine } from '../services/AudioEngine';
import { useTheme } from '../context/ThemeContext';
import { VisualizerMode } from '../types/equalizer';

interface AudioVisualizerProps {
  className?: string;
  defaultMode?: VisualizerMode;
  showControls?: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  className = '',
  defaultMode = 'bars',
  showControls = true,
}) => {
  const { effectiveAccent, isDark } = useTheme();
  const [mode, setMode] = useState<VisualizerMode>(defaultMode);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = 128;
    const freqArray = new Uint8Array(bufferLength);
    const waveArray = new Uint8Array(bufferLength);
    let animId: number;

    const render = () => {
      animId = requestAnimationFrame(render);
      audioEngine.getVisualizerData(freqArray, waveArray);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (mode === 'bars') {
        const barCount = 36;
        const barWidth = (width / barCount) * 0.75;
        const gap = (width / barCount) * 0.25;

        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor(i * (bufferLength / barCount));
          const value = freqArray[dataIndex] / 255;
          const barHeight = Math.max(value * (height * 0.85), 4);
          const x = i * (barWidth + gap);
          const y = height - barHeight;

          // Gradient bar
          const grad = ctx.createLinearGradient(0, y, 0, height);
          grad.addColorStop(0, effectiveAccent);
          grad.addColorStop(1, `${effectiveAccent}20`);

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
          ctx.fill();

          // Specular cap
          ctx.fillStyle = '#FFFFFF';
          ctx.globalAlpha = 0.8;
          ctx.fillRect(x, y, barWidth, 2);
          ctx.globalAlpha = 1.0;
        }
      } else if (mode === 'waveform') {
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = effectiveAccent;
        ctx.shadowColor = effectiveAccent;
        ctx.shadowBlur = 10;
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = waveArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (mode === 'circular') {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) * 0.45;
        const points = 48;

        ctx.strokeStyle = effectiveAccent;
        ctx.lineWidth = 2.5;

        for (let i = 0; i < points; i++) {
          const rad = (i / points) * Math.PI * 2;
          const dataIndex = Math.floor(i * (bufferLength / points));
          const val = (freqArray[dataIndex] / 255) * 35;

          const x1 = centerX + Math.cos(rad) * radius;
          const y1 = centerY + Math.sin(rad) * radius;
          const x2 = centerX + Math.cos(rad) * (radius + val);
          const y2 = centerY + Math.sin(rad) * (radius + val);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        // Inner glowing ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 2, 0, Math.PI * 2);
        ctx.strokeStyle = `${effectiveAccent}40`;
        ctx.stroke();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [mode, effectiveAccent]);

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {showControls && (
        <div className="absolute top-2 right-2 z-10 flex items-center p-1 rounded-xl bg-black/30 backdrop-blur-md border border-white/10 gap-1">
          <button
            onClick={() => setMode('bars')}
            aria-label="Spectrum Bars"
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              mode === 'bars' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setMode('waveform')}
            aria-label="Waveform"
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              mode === 'waveform' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setMode('circular')}
            aria-label="Circular Aurora"
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              mode === 'circular' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Disc className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={720}
        height={160}
        className="w-full h-36 rounded-2xl bg-black/10 dark:bg-black/25 border border-white/10"
      />
    </div>
  );
};
