import p5 from "p5";
import { Point } from "../Point";
import { Color } from "../Color";
import { easeInOutCubic } from "../easing";

/**
 * Text change configuration
 */
interface TextChangeConfig {
  targetText: string;
  startFrame: number;
  endFrame: number;
}

/**
 * Custom type for vertical alignment to handle p5's inconsistent naming
 */
type VerticalAlign = "top" | "center" | "bottom" | "baseline" | "alphabetic";

/**
 * Size animation configuration
 */
interface SizeAnimationConfig {
  startValue: number;
  targetValue: number;
  startFrame: number;
  endFrame: number;
  isActive: boolean;
}

/**
 * Text properties configuration
 */
interface TextConfig {
  text: string;
  center?: [number, number];
  size?: number;
  color?: string | p5.Color | Color | [number, number, number, number];
  font?: string;
  alignH?: p5.HORIZ_ALIGN;
  alignV?: VerticalAlign;
  p5Instance?: p5;
}

/**
 * Text class for animated text with p5.js integration
 */
export class Text {
  /** Current text content */
  private _text: string;

  /** Target text content during transition */
  private _targetText: string = "";

  /** Position point for animation */
  private _position: Point;

  /** Text color */
  private _color: Color;

  /** Font size */
  private _size: number;

  /** Font family */
  private _font: string;

  /** Horizontal alignment */
  private _alignH: p5.HORIZ_ALIGN;

  /** Vertical alignment */
  private _alignV: VerticalAlign;

  /** Fade transition progress (0-1) */
  private _fadeProgress: number = 1;

  /** Queued text changes */
  private _textChanges: TextChangeConfig[] = [];

  /** Current text change in progress */
  private _currentTextChange: TextChangeConfig | null = null;

  /** Size animation configuration */
  private _sizeAnimation: SizeAnimationConfig | null = null;

  /** Graphics buffer for rendering */
  private _graphics: p5.Graphics | null = null;

  /** p5 instance */
  private _p5Instance: p5 | null = null;

  /** Easing function for animations */
  private _easing: (t: number) => number = easeInOutCubic;

  /**
   * Creates a new Text instance
   * @param config Text configuration
   */
  constructor(config: TextConfig) {
    this._text = config.text;
    this._targetText = config.text;
    this._position = new Point(
      config.center?.[0] || 0,
      config.center?.[1] || 0
    );
    this._size = config.size || 32;
    this._font = config.font || "sans-serif";
    this._alignH = config.alignH || "center";
    this._alignV = config.alignV || "center";

    // Initialize color
    if (config.color instanceof Color) {
      this._color = config.color;
    } else {
      this._color = new Color(config.color || "#ffffff");
    }

    // Store p5 instance if provided
    if (config.p5Instance) {
      this._p5Instance = config.p5Instance;
      this._createGraphics();
    }
  }

  /**
   * Get current text content
   */
  get text(): string {
    return this._text;
  }

  /**
   * Get current position as [x, y]
   */
  get position(): [number, number] {
    return [this._position.x, this._position.y];
  }

  /**
   * Get current font size
   */
  get size(): number {
    return this._size;
  }

  /**
   * Get current color
   */
  get color(): Color {
    return this._color;
  }

  /**
   * Get the graphics object for this text
   * You must call step() before accessing this to ensure it's updated
   */
  get image(): p5.Graphics | null {
    return this._graphics;
  }

  /**
   * Schedule text content change with fade transition
   * @param newText New text content
   * @param startFrame Frame when change should start
   * @param duration Duration of change in frames
   */
  public change(newText: string, startFrame: number, duration: number): void {
    if (duration <= 0) {
      console.warn("Text: Animation duration must be positive");
      duration = 1;
    }

    const changeConfig: TextChangeConfig = {
      targetText: newText,
      startFrame,
      endFrame: startFrame + duration,
    };

    this._textChanges.push(changeConfig);
  }

  /**
   * Schedule position change animation
   * @param newPosition New position coordinates [x, y]
   * @param startFrame Frame when change should start
   * @param duration Duration of change in frames
   */
  public move(
    newPosition: [number, number],
    startFrame: number,
    duration: number
  ): void {
    this._position.moveTo(newPosition, startFrame, duration);
  }

  /**
   * Schedule font size change animation
   * @param newSize New font size
   * @param startFrame Frame when change should start
   * @param duration Duration of change in frames
   */
  public resize(newSize: number, startFrame: number, duration: number): void {
    if (duration <= 0) {
      console.warn("Text: Resize duration must be positive");
      duration = 1;
    }

    // Store the animation parameters for use in step method
    this._sizeAnimation = {
      startValue: this._size,
      targetValue: newSize,
      startFrame: startFrame,
      endFrame: startFrame + duration,
      isActive: false
    };
  }

  /**
   * Schedule color change animation
   * @param newColor New color (string, Color, RGB array)
   * @param startFrame Frame when change should start
   * @param duration Duration of change in frames
   */
  public recolor(
    newColor: string | p5.Color | Color | [number, number, number, number],
    startFrame: number,
    duration: number
  ): void {
    this._color.change(newColor, startFrame, duration);
  }

  /**
   * Set font family
   * @param font Font family name
   */
  public setFont(font: string): void {
    this._font = font;
  }

  /**
   * Set text alignment
   * @param horizontal Horizontal alignment ('left', 'center', 'right')
   * @param vertical Vertical alignment ('top', 'center', 'bottom', 'baseline', 'alphabetic')
   */
  public setAlignment(
    horizontal: p5.HORIZ_ALIGN,
    vertical: VerticalAlign
  ): void {
    this._alignH = horizontal;
    this._alignV = vertical;
  }

  /**
   * Updates the text based on the current frame
   * @param frame Current animation frame
   */
  public step(frame: number): void {
    // Reset for frame 0
    if (frame === 0) {
      // Reset fade state
      this._fadeProgress = 1;
      this._currentTextChange = null;
      
      // Reset size animation to initial state if needed
      if (this._sizeAnimation) {
        this._sizeAnimation.isActive = false;
      }
    }
    
    // Update position and color
    this._position.step(frame);
    this._color.step(frame);

    // Handle size animation if active
    if (this._sizeAnimation) {
      const { startValue, targetValue, startFrame, endFrame, isActive } = this._sizeAnimation;
      
      // If before animation start
      if (frame < startFrame) {
        // Do nothing
      }
      // If after animation end
      else if (frame >= endFrame) {
        this._size = targetValue;
        this._sizeAnimation.isActive = false;
      }
      // During animation
      else {
        // If animation just started, store the current size as start value
        if (!isActive || frame === startFrame) {
          this._sizeAnimation.startValue = this._size;
          this._sizeAnimation.isActive = true;
        }
        
        // Calculate progress
        const progress = (frame - startFrame) / (endFrame - startFrame);
        const easedProgress = this._easing(progress);
        
        // Update size
        this._size = startValue + (targetValue - startValue) * easedProgress;
      }
    }

    // Handle text transitions with fade effect
    this._updateTextTransition(frame);

    // Update graphics
    if (this._p5Instance && (!this._graphics || this._fadeProgress < 1)) {
      this._updateGraphics();
    }
  }

  /**
   * Draw the text on the given p5 instance
   * @param p5Instance p5 instance to draw on
   */
  public draw(p5Instance: p5): void {
    // Store p5 instance if not already set
    if (!this._p5Instance) {
      this._p5Instance = p5Instance;
      this._createGraphics();
    }

    // If we need to update graphics, do it
    if (!this._graphics) {
      this._updateGraphics();
    }

    // Draw the graphics buffer
    if (this._graphics) {
      // Get position
      const x = this._position.x;
      const y = this._position.y;

      // Calculate offset based on alignment
      const halfWidth = this._graphics.width / 2;
      const halfHeight = this._graphics.height / 2;

      let xOffset = -halfWidth; // Default for center alignment
      let yOffset = -halfHeight; // Default for center alignment

      if (this._alignH === "left") xOffset = 0;
      else if (this._alignH === "right") xOffset = -this._graphics.width;

      if (this._alignV === "top") yOffset = 0;
      else if (this._alignV === "bottom") yOffset = -this._graphics.height;
      else if (this._alignV === "baseline" || this._alignV === "alphabetic")
        yOffset = -this._graphics.height * 0.7;

      // Apply fade transition
      const alpha = this._fadeProgress * 255;
      p5Instance.tint(255, alpha);

      // Draw the graphics buffer
      p5Instance.image(this._graphics, x + xOffset, y + yOffset);

      // Reset tint
      p5Instance.noTint();
    }
  }

  /**
   * Sets a custom easing function for animations
   * @param easing The easing function to use (takes and returns a value from 0 to 1)
   */
  public setEasing(easing: (t: number) => number): void {
    this._easing = easing;
    this._position.setEasing(easing);
    this._color.setEasing(easing);
  }

  /**
   * Updates text transition state
   * @param frame Current frame
   */
  private _updateTextTransition(frame: number): void {
    // Reset handling for frame 0
    if (frame === 0) {
      this._fadeProgress = 1; // Ensure text is fully visible
      this._currentTextChange = null; // Clear any active transition
      // Don't clear the queue (_textChanges) to preserve scheduled animations
      return;
    }
    
    // Check if there's an active text change
    if (this._currentTextChange) {
      const { startFrame, endFrame, targetText } = this._currentTextChange;

      // Calculate the transition phase
      // For text transitions, we use a 2-phase approach:
      // Phase 1: Fade out the original text (0% to 50% of duration)
      // Phase 2: Fade in the new text (50% to 100% of duration)
      const totalDuration = endFrame - startFrame;
      const halfDuration = totalDuration / 2;
      const midpointFrame = startFrame + halfDuration;

      if (frame < midpointFrame) {
        // Phase 1: Fade out original text
        const progress = (frame - startFrame) / halfDuration;
        this._fadeProgress = 1 - this._easing(progress);
      } else if (frame < endFrame) {
        // Phase 2: Fade in new text
        // Switch to new text at the midpoint
        if (this._text !== targetText) {
          this._text = targetText;
        }

        const progress = (frame - midpointFrame) / halfDuration;
        this._fadeProgress = this._easing(progress);
      } else {
        // Transition complete
        this._text = targetText;
        this._fadeProgress = 1;
        this._currentTextChange = null;
      }
    }

    // Check if we need to start a new text change
    if (!this._currentTextChange && this._textChanges.length > 0) {
      const nextChange = this._textChanges[0];

      if (frame >= nextChange.startFrame) {
        this._currentTextChange = this._textChanges.shift() || null;

        // Previous buggy logic - removed the early exit when text is the same
        // We want to still animate even if the text content is the same
        // to support state changes
      }
    }
  }

  /**
   * Creates the graphics buffer for text rendering
   */
  private _createGraphics(): void {
    if (!this._p5Instance) return;

    const p = this._p5Instance;

    // Create a graphics buffer large enough for the text
    // We initially create it with an estimated size and will resize as needed
    const estimatedWidth = this._text.length * this._size * 0.7;
    const estimatedHeight = this._size * 1.5;

    this._graphics = p.createGraphics(
      Math.ceil(estimatedWidth),
      Math.ceil(estimatedHeight)
    );
  }

  /**
   * Updates the graphics buffer with current text properties
   */
  private _updateGraphics(): void {
    if (!this._p5Instance || !this._graphics) return;

    const g = this._graphics;

    // Set text properties
    g.clear();
    g.textFont(this._font);
    g.textSize(this._size);

    // Map our alignment values to p5's constants
    const hAlign =
      this._alignH === "left"
        ? g.LEFT
        : this._alignH === "right"
        ? g.RIGHT
        : g.CENTER;
    const vAlign = this._mapVerticalAlign(this._alignV);

    g.textAlign(hAlign, vAlign);

    // Get text measurements and resize canvas if needed
    const textWidth = g.textWidth(this._text);
    const textHeight = this._size * 1.5; // Approximate height

    if (textWidth > g.width || textHeight > g.height) {
      // Resize graphics buffer to fit text
      const newWidth = Math.max(g.width, Math.ceil(textWidth * 1.1));
      const newHeight = Math.max(g.height, Math.ceil(textHeight * 1.1));

      g.resizeCanvas(newWidth, newHeight);

      // Set text properties again after resize
      g.clear();
      g.textFont(this._font);
      g.textSize(this._size);
      g.textAlign(hAlign, vAlign);
    }

    // Set fill color
    if (this._p5Instance) {
      try {
        g.fill(this._color.p5Color(this._p5Instance));
      } catch (e) {
        // If p5Color fails, fall back to rgba string
        g.fill(this._color.rgbaString);
      }
    } else {
      g.fill(this._color.rgbaString);
    }

    // Draw text
    const xPos = g.width / 2;
    const yPos = g.height / 2;
    g.text(this._text, xPos, yPos);
  }

  /**
   * Maps our vertical alignment values to p5's constants
   * This helps handle the naming inconsistency between 'baseline' and 'alphabetic'
   */
  private _mapVerticalAlign(align: VerticalAlign): p5.VERT_ALIGN {
    switch (align) {
      case "top":
        return "top" as p5.VERT_ALIGN;
      case "bottom":
        return "bottom" as p5.VERT_ALIGN;
      case "baseline":
      case "alphabetic":
        return "baseline" as p5.VERT_ALIGN;
      case "center":
      default:
        return "center" as p5.VERT_ALIGN;
    }
  }
}
