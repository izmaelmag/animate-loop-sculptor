import React from 'react';
import { registerRoot, Composition } from 'remotion';
import { MyVideo } from './MyVideo';

export const RemotionVideo = () => {
  return (
    <>
      <Composition
        id="MyVideo"
        component={MyVideo}
        durationInFrames={600}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{
          sketchCode: ''
        }}
      />
    </>
  );
};

registerRoot(RemotionVideo); 