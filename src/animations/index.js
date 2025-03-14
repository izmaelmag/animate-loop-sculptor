import { animation as basicAnimation } from './basic-template';
import { animation as gsapAnimation } from './gsap-sequence';

/**
 * Main animation function that selects the appropriate template
 * 
 * @param {object} p - p5 instance
 * @param {number} t - normalized time from 0 to 1
 * @param {number} frame - current frame number
 * @param {number} totalFrames - total number of frames
 * @param {string} template - which template to use ('basic' or 'gsap')
 */
export function animation(p, t, frame, totalFrames, template = 'basic') {
  switch (template) {
    case 'gsap':
      return gsapAnimation(p, t, frame, totalFrames);
    case 'basic':
    default:
      return basicAnimation(p, t, frame, totalFrames);
  }
}

// Export individual animations for direct use
export { basicAnimation, gsapAnimation }; 