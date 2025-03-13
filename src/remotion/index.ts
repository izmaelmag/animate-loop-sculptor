
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
  
  // Log successful registration
  console.log('Root component registered successfully');
  
  // Additional React initialization for server-side rendering
  if (isNode) {
    console.log('Setting up server-side rendering environment');
    
    // Check if React is properly configured
    if (React.version) {
      console.log('React is correctly initialized');
    } else {
      console.warn('React version is undefined, may cause issues');
    }
    
    // Check if remotion is properly configured
    if (typeof registerRoot !== 'function') {
      console.error('registerRoot is not a function, Remotion may not be properly initialized');
    }
  }
  
  console.log('Remotion bundle initialized successfully');
} catch (error) {
  console.error('Failed to initialize Remotion bundle:', error);
  
  // Detailed error reporting
  if (error instanceof Error) {
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Attempt recovery if possible
    if (error.message.includes('React')) {
      console.warn('React error detected. Ensure React is properly configured for Remotion.');
    }
  }
  
  // Rethrow in development for better debugging
  if (process.env.NODE_ENV === 'development') {
    throw error;
  }
}
