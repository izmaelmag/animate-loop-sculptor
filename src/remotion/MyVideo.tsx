import React, { useState, useEffect } from "react";
import { P5Animation } from "./P5Animation";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { AnimationName } from "../animations";
import { animationSettings, defaultAnimation } from "../animations";
import { config as unstableGridConfig } from "../animations/unstableGrid2/config";
import { delayRender, continueRender, staticFile } from "remotion";

interface MyVideoProps {
  templateId?: AnimationName;
}

export const MyVideo: React.FC<MyVideoProps> = ({
  templateId = defaultAnimation.id,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Get the current animation settings with fallback to default
  const currentSettings = animationSettings[templateId] || defaultAnimation;

  if (!currentSettings) {
    console.error(`Animation not found: ${templateId}, using default`);
    // This case should ideally not happen if default is always available
  }

  const [handle] = useState(() => delayRender("Loading custom font"));
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    const loadCustomFont = async () => {
      try {
        // Use values from config
        const fontFamily = unstableGridConfig.fontFamily;
        const fontUrl = staticFile(unstableGridConfig.fontUrl);
        // console.log(`Attempting to load font '${fontFamily}' from ${fontUrl} via FontFace API...`);
        const fontFace = new FontFace(fontFamily, `url(${fontUrl})`); 
        await fontFace.load(); 
        document.fonts.add(fontFace); 
        setFontLoaded(true);
        // console.log(`Font '${fontFamily}' loaded and added via FontFace API.`);
        continueRender(handle);
      } catch (err) {
        // Use config value in error message
        console.error(`Error loading font '${unstableGridConfig.fontFamily}' via FontFace API:`, err);
        continueRender(handle); 
      }
    };
    loadCustomFont();
  }, [handle]);

  if (!fontLoaded) {
    // Use config value in log message
    // console.log(`Waiting for font '${unstableGridConfig.fontFamily}' to load via FontFace API...`);
    return null; 
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
        width: "100%",
        height: "100%",
      }}
    >
      <P5Animation 
        templateId={templateId} 
        animationConfig={{ noiseSeedPhrase: unstableGridConfig.noiseSeedPhrase }}
      />
    </div>
  );
};
