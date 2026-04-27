import React, { useRef, useEffect, useState } from 'react';
import clsx from 'clsx';
import { useStore } from '../../store/useStore';

interface ResizerProps {
  target: 'editor' | 'config';
  minWidth: number;
  maxWidth: number;
}

export function Resizer({ target, minWidth, maxWidth }: ResizerProps) {
  const { setWidths, widths } = useStore();
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = widths[target];
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const dx = target === 'editor' 
        ? e.clientX - startXRef.current 
        : startXRef.current - e.clientX;
        
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + dx));
      setWidths({ [target]: newWidth });
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        document.body.style.userSelect = '';
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, target, minWidth, maxWidth, setWidths]);

  return (
    <div 
      className={clsx(
        "flex-none w-1.5 bg-gray-200 cursor-col-resize flex items-center justify-center relative z-10 transition-colors",
        isResizing ? "bg-blue-500" : "hover:bg-blue-400"
      )}
      onMouseDown={handleMouseDown}
    >
      <div className={clsx(
        "w-0.5 h-7 rounded-sm transition-colors",
        isResizing ? "bg-white" : "bg-gray-400"
      )} />
    </div>
  );
}
