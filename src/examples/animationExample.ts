import { KF } from '../utils/kf';
import { easeInOutSine, easeOutSine } from '../utils/easing';

// Example of how to use the KF class in an animation loop

// 1. Define the object we want to animate
const circle = {
  x: 0,
  y: 0,
  radius: 30,
  color: '#3498db'
};

// 2. Create KF instances for each property we want to animate
const xAnimator = new KF(circle, 'x');
const yAnimator = new KF(circle, 'y');
const radiusAnimator = new KF(circle, 'radius');

// 3. Define animation sequences
const xSequence = xAnimator
  .startAt(0)
  .next(300, easeInOutSine, { delay: 30, length: 120 })
  .next(100, easeInOutSine, { delay: 10, length: 60 })
  .next(200, easeOutSine, { delay: 0, length: 90 });

const ySequence = yAnimator
  .startAt(30) // Offset the y animation for interest
  .next(200, easeInOutSine, { length: 100 })
  .next(50, easeOutSine, { delay: 20, length: 80 });
  
const radiusSequence = radiusAnimator
  .startAt(60)
  .next(50, easeInOutSine, { length: 40 })
  .next(20, easeOutSine, { delay: 100, length: 60 })
  .next(60, easeInOutSine, { length: 120 });

// 4. Animation loop
let currentFrame = 0;

function update() {
  // Animate all properties for the current frame
  xAnimator.animate(xSequence, currentFrame);
  yAnimator.animate(ySequence, currentFrame);
  radiusAnimator.animate(radiusSequence, currentFrame);
  
  // In a real application, we would draw the circle here
  // For this example, we'll just log the current state
  console.log(`Frame ${currentFrame}: x=${circle.x.toFixed(1)}, y=${circle.y.toFixed(1)}, radius=${circle.radius.toFixed(1)}`);
  
  // Increment frame counter
  currentFrame++;
  
  // Continue animation loop (in browser this would use requestAnimationFrame)
  if (currentFrame < 400) {
    // For demo: slower than real animation
    setTimeout(update, 16);  // ~60fps
  }
}

// 5. Start the animation
update(); 