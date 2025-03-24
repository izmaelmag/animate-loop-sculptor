import { easeInOutCubic } from "../easing";

/**
 * Represents a 2D point as [x, y] coordinates
 */
export type Point = [number, number];

/**
 * Animation state enum representing the current animation status
 */
enum AnimationState {
  Disconnected = "disconnected",
  Connecting = "connecting",
  Connected = "connected",
  Disconnecting = "disconnecting",
}

/**
 * Interface for animation timing configuration
 */
interface AnimationTiming {
  startFrame: number;
  endFrame: number;
}

/**
 * Line class for animated line rendering between two points
 * Supports smooth connection and disconnection animations with customizable easing
 */
export class Line {
  /** Start point of the line */
  public a: Point;

  /** End point of the line */
  public b: Point;

  /** Current animated point on the line */
  public current: Point;

  /** Flag indicating if the line is currently animating a connection */
  public isConnecting: boolean = false;

  /** Flag indicating if the line is currently animating a disconnection */
  public isDisconnecting: boolean = false;

  /** Flag indicating if the line is fully connected */
  public isConnected: boolean = false;

  /** Flag indicating if the line is fully disconnected */
  public isDisconnected: boolean = true;

  /** Current animation progress (0 to 1) */
  public animationProgress: number = 0;

  /** Easing function for animations */
  private _easing: (t: number) => number = easeInOutCubic;

  /** Connection animation timing configuration */
  private _connectionTiming: AnimationTiming | null = null;

  /** Disconnection animation timing configuration */
  private _disconnectionTiming: AnimationTiming | null = null;

  /** Current animation state */
  private _state: AnimationState = AnimationState.Disconnected;

  /**
   * Creates a new Line instance
   * @param a Starting point [x, y]
   * @param b Ending point [x, y]
   */
  constructor(a: Point, b: Point) {
    // Create copies to avoid reference issues
    this.a = [...a];
    this.b = [...b];
    this.current = [...a];
  }

  /**
   * Updates the line's start and end points
   * @param a New starting point
   * @param b New ending point
   */
  public setPoints(a: Point, b: Point): void {
    this.a = [...a];
    this.b = [...b];

    // If in disconnected state, update current point to match a
    if (this.isDisconnected) {
      this.current = [...a];
    } else if (this.isConnected) {
      this.current = [...b];
    } else {
      // If animating, update current point based on progress
      this._updateCurrentPoint();
    }
  }

  /**
   * Checks if the line is currently animating (connecting or disconnecting)
   */
  public get isAnimated(): boolean {
    return this.isConnecting || this.isDisconnecting;
  }

  /**
   * Sets a custom easing function for animations
   * @param easing The easing function to use (takes and returns a value from 0 to 1)
   */
  public setEasing(easing: (t: number) => number): void {
    this._easing = easing;
  }

  /**
   * Configures a connection animation
   * @param startFrame Frame number when the connection should start
   * @param duration Duration of the connection animation in frames
   */
  public connection(startFrame: number, duration: number): void {
    if (duration <= 0) {
      console.warn("Line: Animation duration must be positive");
      duration = 1;
    }

    this._connectionTiming = {
      startFrame,
      endFrame: startFrame + duration,
    };
  }

  /**
   * Configures a disconnection animation
   * @param startFrame Frame number when the disconnection should start
   * @param duration Duration of the disconnection animation in frames
   */
  public disconnection(startFrame: number, duration: number): void {
    if (duration <= 0) {
      console.warn("Line: Animation duration must be positive");
      duration = 1;
    }

    this._disconnectionTiming = {
      startFrame,
      endFrame: startFrame + duration,
    };
  }

  /**
   * Updates the line's animation state for the given frame
   * @param frame Current animation frame number
   */
  public step(frame: number): void {
    // Reset to initial state at frame 0
    if (frame === 0) {
      this.animationProgress = 0;
      this.current = [...this.a];
      this._updateAnimationState(AnimationState.Disconnected);
      return;
    }

    // Update animation state based on timings
    const newState = this._calculateState(frame);
    this._updateAnimationState(newState);

    // Calculate animation progress
    this._updateAnimationProgress(frame);

    // Update the current point position
    this._updateCurrentPoint();
  }

  /**
   * Calculates a point on the line based on progress (0 to 1)
   * @param progress Progress from start to end (0 = start point, 1 = end point)
   * @returns The calculated point coordinates
   */
  public getPointOnLine(progress: number): Point {
    const clampedProgress = this._clamp(progress, 0, 1);
    return [
      this._lerp(this.a[0], this.b[0], clampedProgress),
      this._lerp(this.a[1], this.b[1], clampedProgress),
    ];
  }

  /**
   * Updates the animation state flags based on new state
   * @param newState The new animation state
   */
  private _updateAnimationState(newState: AnimationState): void {
    // Reset all state flags
    this.isConnecting = false;
    this.isDisconnecting = false;
    this.isConnected = false;
    this.isDisconnected = false;

    // Set appropriate flag based on new state
    switch (newState) {
      case AnimationState.Connecting:
        this.isConnecting = true;
        break;
      case AnimationState.Disconnecting:
        this.isDisconnecting = true;
        break;
      case AnimationState.Connected:
        this.isConnected = true;
        break;
      case AnimationState.Disconnected:
        this.isDisconnected = true;
        break;
    }

    this._state = newState;
  }

  /**
   * Determines the animation state for the given frame
   * @param frame Current animation frame
   * @returns The appropriate animation state
   */
  private _calculateState(frame: number): AnimationState {
    // Priority 1: Check if we're in a disconnection animation
    // This should take precedence over connection animations
    if (
      this._disconnectionTiming &&
      frame >= this._disconnectionTiming.startFrame &&
      frame < this._disconnectionTiming.endFrame
    ) {
      return AnimationState.Disconnecting;
    }

    // Check if disconnection just completed
    if (
      this._disconnectionTiming &&
      frame >= this._disconnectionTiming.endFrame
    ) {
      return AnimationState.Disconnected;
    }

    // Priority 2: Check if we're in a connection animation
    if (
      this._connectionTiming &&
      frame >= this._connectionTiming.startFrame &&
      frame < this._connectionTiming.endFrame
    ) {
      return AnimationState.Connecting;
    }

    // Check if connection just completed
    if (
      this._connectionTiming &&
      frame >= this._connectionTiming.endFrame &&
      (!this._disconnectionTiming ||
        frame < this._disconnectionTiming.startFrame)
    ) {
      return AnimationState.Connected;
    }

    // Maintain current state if not in an animation
    return this._state;
  }

  /**
   * Updates the animation progress based on the current frame
   * @param frame Current animation frame
   */
  private _updateAnimationProgress(frame: number): void {
    if (this.isConnecting && this._connectionTiming) {
      const { startFrame, endFrame } = this._connectionTiming;
      const rawProgress = (frame - startFrame) / (endFrame - startFrame);
      const progress = this._clamp(rawProgress, 0, 1);
      this.animationProgress = this._easing(progress);
    } else if (this.isDisconnecting && this._disconnectionTiming) {
      const { startFrame, endFrame } = this._disconnectionTiming;
      const rawProgress = (frame - startFrame) / (endFrame - startFrame);
      // Reverse progress for disconnection (1 -> 0)
      const progress = 1 - this._clamp(rawProgress, 0, 1);
      this.animationProgress = this._easing(progress);
    } else if (this.isConnected) {
      this.animationProgress = 1;
    } else if (this.isDisconnected) {
      this.animationProgress = 0;
    }
  }

  /**
   * Updates the current point based on animation progress
   */
  private _updateCurrentPoint(): void {
    const point = this.getPointOnLine(this.animationProgress);
    this.current = point;
  }

  /**
   * Linear interpolation between two values
   * @param a Start value
   * @param b End value
   * @param t Progress (0 to 1)
   * @returns Interpolated value
   */
  private _lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  /**
   * Clamps a value between min and max
   * @param value Value to clamp
   * @param min Minimum value
   * @param max Maximum value
   * @returns Clamped value
   */
  private _clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(value, max));
  }
}
