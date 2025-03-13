
import { registerRoot } from 'remotion';
import { RemotionVideo } from './RemotionVideo';
import React from 'react';

// Try to provide some debug information
try {
  console.log('React version:', React.version);
  console.log('Remotion environment:', process.env.NODE_ENV);
  console.log('Initializing Remotion bundle...');
  
  // Register the root component for Remotion
  registerRoot(RemotionVideo);
  
  console.log('Remotion bundle initialized successfully');
} catch (error) {
  console.error('Failed to initialize Remotion bundle:', error);
}
