import React from 'react';
import { P5Animation } from './P5Animation';
import { useCurrentFrame, useVideoConfig } from 'remotion';

interface MyVideoProps {
  sketchCode?: string;
}

export const MyVideo: React.FC<MyVideoProps> = ({ sketchCode = '' }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  
  return (
    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
      <P5Animation sketch={sketchCode} />
    </div>
  );
};
