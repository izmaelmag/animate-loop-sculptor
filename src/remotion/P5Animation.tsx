import React, { useEffect, useRef } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import p5 from 'p5';

interface P5AnimationProps {
  sketch?: string;
}

export const P5Animation: React.FC<P5AnimationProps> = ({ sketch = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<p5>();
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  useEffect(() => {
    if (!containerRef.current) return;

    // Проверяем, не был ли уже создан экземпляр p5
    if (p5Ref.current) {
      p5Ref.current.remove();
    }

    // Рассчитываем переменные для скетча
    const t = frame / durationInFrames;
    const frameNumber = frame;
    const totalFrames = durationInFrames;

    // Функция скетча, которая будет передана в p5
    const sketchFunc = (p: p5) => {
      p.setup = () => {
        const { width, height } = containerRef.current!.getBoundingClientRect();
        p.createCanvas(width, height);
      };

      p.draw = () => {
        try {
          // Выполняем код, переданный как строка, с передачей необходимых переменных
          const sketchFunction = new Function('p', 'frame', 'frameNumber', 'totalFrames', 't', sketch);
          sketchFunction(p, frame, frameNumber, totalFrames, t);
        } catch (error) {
          console.error('Ошибка выполнения скетча:', error);
          p.background(0);
          p.fill(255, 0, 0);
          p.textSize(20);
          p.text('Ошибка скетча: ' + error, 20, 50);
        }
      };
    };

    // Создаем новый экземпляр p5
    p5Ref.current = new p5(sketchFunc, containerRef.current);

    return () => {
      // Удаляем p5 при размонтировании компонента
      if (p5Ref.current) {
        p5Ref.current.remove();
      }
    };
  }, [frame, sketch, durationInFrames]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
      }}
    />
  );
}; 