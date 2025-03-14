// Direct imports from template files to avoid reexport issues
import { animation as basicAnimation } from './animations/basic-template.js';
import { animation as gsapAnimation } from './animations/gsap-sequence.js';

/**
 * Main animation function - edit this to customize your animation
 * 
 * You can:
 * 1. Write your animation code directly here
 * 2. Use one of the templates (basicAnimation or gsapAnimation)
 * 3. Mix and match different parts from templates
 */
export function animation(p, t, frame, totalFrames) {
  // Using the basic template
  return basicAnimation(p, t, frame, totalFrames);
  
  /* 
  // To use the GSAP template instead, comment out the line above and uncomment:
  // return gsapAnimation(p, t, frame, totalFrames);
  
  // For even more flexibility, you can write your own animation here:
  // Delete everything above and use this code as a starting point
  
  p.background(0);
  
  const centerX = p.width / 2;
  const centerY = p.height / 2;
  
  p.fill(255);
  p.noStroke();
  p.textSize(50);
  p.textAlign(p.CENTER, p.CENTER);
  p.text(`Frame ${frame} of ${totalFrames}`, centerX, centerY - 300);
  
  // Add your custom animation code here
  */
} 