
import { registerRoot } from 'remotion';
import { RemotionVideo } from './RemotionVideo';
import React from 'react';

// Detect if we're in a Node.js environment (server-side rendering)
const isNode = typeof window === 'undefined';

// Try to provide some debug information
try {
  console.log('Remotion environment:', process.env.NODE_ENV);
  console.log('Running in:', isNode ? 'Node.js' : 'Browser');
  console.log('React version:', React.version);
  console.log('Initializing Remotion bundle...');
  
  // Register the root component for Remotion
  registerRoot(RemotionVideo);
  
  // Additional React initialization for server-side rendering
  if (isNode) {
    console.log('Setting up server-side rendering environment');
    // Any server-specific setup can go here
  }
  
  console.log('Remotion bundle initialized successfully');
} catch (error) {
  console.error('Failed to initialize Remotion bundle:', error);
  
  // Detailed error reporting
  if (error instanceof Error) {
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  }
}
