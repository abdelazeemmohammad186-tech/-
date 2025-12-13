
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface WritingCanvasProps {
  letter: string;
}

const WritingCanvas: React.FC<WritingCanvasProps> = ({ letter }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  const drawLetterBackground = useCallback((context: CanvasRenderingContext2D) => {
    const canvas = context.canvas;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#e0f2fe';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.font = 'bold 200px sans-serif';
    context.fillStyle = 'rgba(180, 210, 240, 0.8)';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    const fullLetter = `${letter}${letter.toLowerCase()}`;
    context.fillText(fullLetter, canvas.width / 2, canvas.height / 2);
  }, [letter]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // For high-dpi displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.scale(dpr, dpr);
    setCtx(context);
    drawLetterBackground(context);

  }, [drawLetterBackground]);

  const getCoords = (event: React.MouseEvent | React.TouchEvent): { x: number, y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in event.nativeEvent) {
      return {
        x: event.nativeEvent.touches[0].clientX - rect.left,
        y: event.nativeEvent.touches[0].clientY - rect.top,
      };
    }
    return {
      x: event.nativeEvent.offsetX,
      y: event.nativeEvent.offsetY,
    };
  };

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    if (!ctx) return;
    const { x, y } = getCoords(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0284c7';
    setIsDrawing(true);
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !ctx) return;
    const { x, y } = getCoords(event);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!ctx) return;
    ctx.closePath();
    setIsDrawing(false);
  };
  
  const handleClear = () => {
    if (ctx) {
        drawLetterBackground(ctx);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="w-full h-64 rounded-lg cursor-crosshair"
        style={{ touchAction: 'none' }}
      />
      <button 
        onClick={handleClear}
        className="mt-4 px-8 py-2 bg-red-500 text-white font-bold rounded-full hover:bg-red-600 transition-transform hover:scale-105 shadow-md"
      >
        مسح
      </button>
    </div>
  );
};

export default WritingCanvas;
