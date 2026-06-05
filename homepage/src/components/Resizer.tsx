import React, { useRef, useCallback } from 'react';
import ResizeIcon from '../assets/resize.svg?react';

interface Props {
  children: React.ReactNode;
  minWidth?: number;
  minHeight?: number;
  widthFactor?: number;
  heightFactor?: number;
  initialWidth?: number | string;
  initialHeight?: number | string;
  buttonBottom?: number | string;
  buttonRight?: number | string;
  buttonSize?: number | string;
  className?: string;
}

const Resizer: React.FC<Props> = ({
  children,
  minWidth = 120,
  minHeight = 80,
  widthFactor = 1,
  heightFactor = 1,
  initialWidth = 400,
  initialHeight = 300,
  buttonBottom = 0,
  buttonRight = 0,
  buttonSize = 32,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragOrigin = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const container = containerRef.current;
    if (!container) return;

    e.preventDefault();
    (e.target as HTMLButtonElement).setPointerCapture(e.pointerId);

    const rect = container.getBoundingClientRect();
    dragOrigin.current = {
      x: e.clientX,
      y: e.clientY,
      w: rect.width,
      h: rect.height,
    };
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const origin = dragOrigin.current;
    const container = containerRef.current;
    if (!origin || !container) return;

    const newW = Math.max(minWidth, origin.w + (e.clientX - origin.x) * widthFactor);
    const newH = Math.max(minHeight, origin.h + (e.clientY - origin.y) * heightFactor);

    container.style.width = `${newW}px`;
    container.style.height = `${newH}px`;
  }, [minWidth, minHeight]);

  const onPointerUp = useCallback(() => {
    dragOrigin.current = null;
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: initialWidth,
        height: initialHeight,
        boxSizing: 'border-box',
      }}
      className={className}
    >
      {children}
      <button
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          position: 'absolute',
          bottom: buttonBottom,
          right: buttonRight,
          width: buttonSize,
          height: buttonSize,
          padding: 0,
          // border: 'none',
          // background: 'transparent',
          cursor: 'nwse-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          touchAction: 'none',
          userSelect: 'none',
        }}
        aria-label="Resize"
      >
        <ResizeIcon />
      </button>
    </div>
  );
};

export default Resizer;