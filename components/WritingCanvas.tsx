
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface WritingCanvasProps {
  letter: string;
}

const WritingCanvas: React.FC<WritingCanvasProps> = ({ letter }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  // Drawing the background guides (Notebook lines + dashed letters)
  const drawGuides = useCallback((context: CanvasRenderingContext2D, width: number, height: number) => {
    context.clearRect(0, 0, width, height);
    
    // Background
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    
    // --- 1. Guidelines ---
    const margin = height * 0.2;
    const baseLineY = height - margin;
    const topLineY = margin;
    const midLineY = (baseLineY + topLineY) / 2;

    // Top Line (Blue)
    context.beginPath();
    context.strokeStyle = '#bae6fd';
    context.lineWidth = 2;
    context.moveTo(10, topLineY);
    context.lineTo(width - 10, topLineY);
    context.stroke();

    // Middle Line (Dashed Blue)
    context.beginPath();
    context.setLineDash([10, 10]);
    context.moveTo(10, midLineY);
    context.lineTo(width - 10, midLineY);
    context.stroke();

    // Base Line (Red)
    context.beginPath();
    context.setLineDash([]);
    context.strokeStyle = '#fca5a5';
    context.lineWidth = 3;
    context.moveTo(10, baseLineY);
    context.lineTo(width - 10, baseLineY);
    context.stroke();

    // --- 2. Dashed Letters ---
    const fontSize = (baseLineY - topLineY) * 1.2;
    context.font = `bold ${fontSize}px sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'alphabetic';

    // Capital Letter
    const capX = width * 0.3;
    const charCap = letter.toUpperCase();
    context.fillStyle = '#f8fafc'; // Very faint fill
    context.fillText(charCap, capX, baseLineY);
    context.strokeStyle = '#cbd5e1'; // Dashed stroke
    context.setLineDash([8, 8]);
    context.lineWidth = 2;
    context.strokeText(charCap, capX, baseLineY);

    // Small Letter
    const smallX = width * 0.7;
    const charSmall = letter.toLowerCase();
    context.setLineDash([]);
    context.fillStyle = '#f8fafc';
    context.fillText(charSmall, smallX, baseLineY);
    context.strokeStyle = '#cbd5e1';
    context.setLineDash([8, 8]);
    context.strokeText(charSmall, smallX, baseLineY);

    // Reset for user drawing
    context.setLineDash([]);
    context.strokeStyle = '#0ea5e9'; // Nice blue for drawing
    context.lineWidth = 12;
    context.lineCap = 'round';
    context.lineJoin = 'round';
  }, [letter]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Set internal resolution
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Scale context once
    context.scale(dpr, dpr);
    setCtx(context);
    
    // Draw initial guides using logical width/height
    drawGuides(context, rect.width, rect.height);
  }, [drawGuides]);

  const getPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e.nativeEvent) {
      clientX = e.nativeEvent.touches[0].clientX;
      clientY = e.nativeEvent.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!ctx) return;
    const pos = getPosition(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !ctx) return;
    const pos = getPosition(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const endDrawing = () => {
    if (!ctx) return;
    ctx.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    drawGuides(ctx, rect.width, rect.height);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto">
      <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] bg-white rounded-2xl shadow-xl border-8 border-blue-200 overflow-hidden touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
          className="w-full h-full cursor-pencil"
        />
        <div className="absolute top-2 right-4 text-blue-300 font-bold opacity-30 select-none pointer-events-none text-sm">
            اكتب هنا
        </div>
      </div>
      
      <div className="flex gap-4 mt-6">
        <button
          onClick={clearCanvas}
          className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          مسح وإعادة
        </button>
      </div>
    </div>
  );
};

export default WritingCanvas;
