
import { registerRoot } from 'remotion';
import { RemotionVideo } from './RemotionVideo';

// Register the root component for Remotion
registerRoot(RemotionVideo);

// Add a console log to verify the bundle is loading correctly
console.log('Remotion bundle initialized');
