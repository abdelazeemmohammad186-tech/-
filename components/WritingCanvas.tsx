
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
    
    // Retrieve the current scale (Device Pixel Ratio) from the context transform
    const dpr = context.getTransform().a || 1;
    
    // Use logical dimensions (CSS pixels) for layout calculations
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    // Clear and set background
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#ffffff'; // White paper background
    context.fillRect(0, 0, width, height);
    
    // --- 1. Draw Notebook Guidelines ---
    const margin = height * 0.15;
    const drawingAreaHeight = height - (margin * 2);
    
    // Standard 3-line layout
    const baseLineY = height - margin * 1.8; 
    const topLineY = baseLineY - (drawingAreaHeight * 0.55); 
    const midLineY = (baseLineY + topLineY) / 2; 
    const descenderY = baseLineY + (drawingAreaHeight * 0.25); 

    context.lineWidth = 2;
    
    // Top Line (Sky)
    context.beginPath();
    context.strokeStyle = '#93c5fd'; // Light blue
    context.setLineDash([]);
    context.moveTo(20, topLineY);
    context.lineTo(width - 20, topLineY);
    context.stroke();

    // Middle Line (Fence) - Dashed
    context.beginPath();
    context.strokeStyle = '#93c5fd';
    context.setLineDash([10, 10]);
    context.moveTo(20, midLineY);
    context.lineTo(width - 20, midLineY);
    context.stroke();

    // Base Line (Grass)
    context.beginPath();
    context.strokeStyle = '#ef4444'; // Red for base line
    context.setLineDash([]);
    context.moveTo(20, baseLineY);
    context.lineTo(width - 20, baseLineY);
    context.stroke();

    // Descender Line (Earth)
    context.beginPath();
    context.strokeStyle = '#e2e8f0'; 
    context.setLineDash([5, 5]);
    context.moveTo(20, descenderY);
    context.lineTo(width - 20, descenderY);
    context.stroke();


    // --- 2. Draw Letters (Capital & Small) ---
    const fontSize = (baseLineY - topLineY) * 1.15; 
    context.font = `bold ${fontSize}px sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'alphabetic'; 
    
    // Capital Letter (Left)
    const capX = width * 0.35;
    const charCap = letter.toUpperCase();

    // Fill
    context.fillStyle = '#f3f4f6'; 
    context.fillText(charCap, capX, baseLineY);

    // Stroke
    context.strokeStyle = '#94a3b8'; 
    context.lineWidth = 3;
    context.setLineDash([8, 8]); 
    context.strokeText(charCap, capX, baseLineY);

    // Small Letter (Right)
    const smallX = width * 0.65;
    const charSmall = letter.toLowerCase();

    // Fill
    context.fillStyle = '#f3f4f6';
    context.setLineDash([]); 
    context.fillText(charSmall, smallX, baseLineY);

    // Stroke
    context.strokeStyle = '#94a3b8';
    context.lineWidth = 3;
    context.setLineDash([8, 8]);
    context.strokeText(charSmall, smallX, baseLineY);

    // Reset settings for user drawing
    context.setLineDash([]);

  }, [letter]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle High DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set physical dimensions
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Scale coordinate system to match logical pixels
    context.scale(dpr, dpr);
    setCtx(context);
    
    // Draw initial state
    drawLetterBackground(context);

  }, [drawLetterBackground]);

  // Robust coordinate calculation for both Mouse and Touch events
  const getCoords = (event: React.MouseEvent | React.TouchEvent): { x: number, y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in event.nativeEvent) {
      // Touch event
      clientX = event.nativeEvent.touches[0].clientX;
      clientY = event.nativeEvent.touches[0].clientY;
    } else {
      // Mouse event
      clientX = (event as React.MouseEvent).clientX;
      clientY = (event as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    // Prevent scrolling when touching canvas
    if (event.type === 'touchstart') {
       // Only prevent default if it's not a multi-touch gesture (optional safeguard)
       // event.preventDefault(); // Note: might need passive: false listener for full prevention
    }

    if (!ctx) return;
    
    const { x, y } = getCoords(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 12; 
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0284c7'; 
    setIsDrawing(true);
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !ctx) return;
    // Prevent scrolling while drawing
    // if (event.type === 'touchmove') event.preventDefault(); 
    
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
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full rounded-lg overflow-hidden shadow-inner border-4 border-blue-100 bg-white">
        <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-64 sm:h-80 cursor-crosshair touch-none"
        />
        <div className="absolute top-2 right-2 pointer-events-none opacity-50 text-blue-300 text-xs font-arabic">
            تتبع النقاط
        </div>
      </div>
      <button 
        onClick={handleClear}
        className="mt-4 px-8 py-2 bg-red-500 text-white font-bold rounded-full hover:bg-red-600 transition-transform hover:scale-105 shadow-md flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        مسح الرسم
      </button>
    </div>
  );
};

export default WritingCanvas;
