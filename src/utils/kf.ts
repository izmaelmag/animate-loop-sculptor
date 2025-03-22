import { easeInOutSine } from "./easing";

type EasingFunction = (t: number) => number;

interface KeyframeStep {
  target: number;
  easing: EasingFunction;
  delay: number;
  length: number;
}

export interface Sequence {
  steps: KeyframeStep[];
  startFrame: number;
  totalFrames: number;
  next: (
    target: number,
    easing?: EasingFunction,
    options?: { delay?: number; length: number }
  ) => Sequence;
}

export class KF {
  private value: number;
  private originalRef: unknown;
  private property: string | null;

  constructor(valueOrRef: number | unknown, property?: string) {
    if (typeof valueOrRef === "number") {
      this.value = valueOrRef;
      this.originalRef = null;
      this.property = null;
    } else {
      this.originalRef = valueOrRef;
      this.property = property || null;
      this.value = property ? valueOrRef[property] : 0;
    }
  }

  startAt(frame: number): Sequence {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    const sequence: Sequence = {
      steps: [],
      startFrame: frame,
      totalFrames: 0,
      next(
        target: number,
        easing: EasingFunction = easeInOutSine,
        options: { delay?: number; length: number }
      ): Sequence {
        return self.next.call(this, target, easing, options);
      },
    };

    return sequence;
  }

  next(
    target: number,
    easing: EasingFunction = easeInOutSine,
    options: { delay?: number; length: number }
  ): Sequence {
    const sequence = this as unknown as Sequence;
    const { delay = 0, length } = options;

    sequence.steps.push({
      target,
      easing,
      delay,
      length,
    });

    sequence.totalFrames += delay + length;
    return sequence;
  }

  animate(sequence: Sequence, currentFrame: number): number {
    // If we haven't reached the start frame yet, keep the initial value
    if (currentFrame < sequence.startFrame) {
      return this.value;
    }

    // Calculate the relative frame within the sequence
    const relativeFrame = currentFrame - sequence.startFrame;

    // Keep track of accumulated frames to determine which step we're in
    let accumulatedFrames = 0;
    let currentValue = this.value;

    // Process each step in the sequence
    for (let i = 0; i < sequence.steps.length; i++) {
      const step = sequence.steps[i];
      const stepStart = accumulatedFrames;
      const animationStart = stepStart + step.delay;
      const animationEnd = animationStart + step.length;

      // If we're before this step's animation, save the current position and continue
      if (relativeFrame < stepStart) {
        break;
      }

      // If we're in the delay period before animation, keep the previous value
      if (relativeFrame < animationStart) {
        break;
      }

      // Get the previous value to animate from
      const fromValue = i === 0 ? this.value : sequence.steps[i - 1].target;

      // If we're past this animation, set value to target
      if (relativeFrame >= animationEnd) {
        currentValue = step.target;
        accumulatedFrames = animationEnd;
        continue;
      }

      // We're in the animation period - calculate progress
      const progress = (relativeFrame - animationStart) / step.length;
      const easedProgress = step.easing(Math.min(1, Math.max(0, progress)));

      // Interpolate between previous value and target
      currentValue = fromValue + (step.target - fromValue) * easedProgress;
      break;
    }

    // Update the value and return it
    this.value = currentValue;

    // If we have a reference object, update its property too
    if (this.originalRef && this.property) {
      this.originalRef[this.property] = currentValue;
    }

    return currentValue;
  }

  // Getter to access the current value
  getValue(): number {
    return this.value;
  }
}
