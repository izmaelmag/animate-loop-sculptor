/**
 * PlaybackEngine manages the requestAnimationFrame loop and time-based
 * frame calculation. It reads/writes playback state from the Zustand store.
 *
 * This is a plain class (not a React component) so it can be used in both
 * the interactive viewer and headless rendering contexts.
 */
export class PlaybackEngine {
  private rafId: number | null = null;
  private startTime: number = 0;
  private fps: number = 60;
  private totalFrames: number = 120;
  private onFrame: ((frame: number) => void) | null = null;

  configure(fps: number, totalFrames: number) {
    this.fps = fps;
    this.totalFrames = totalFrames;
  }

  start(onFrame: (frame: number) => void) {
    this.stop();
    this.onFrame = onFrame;
    this.startTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.onFrame = null;
  }

  private tick = () => {
    if (!this.onFrame) return;

    const elapsed = performance.now() - this.startTime;
    let targetFrame = Math.floor((elapsed / 1000) * this.fps);

    if (this.totalFrames > 0) {
      targetFrame = targetFrame % this.totalFrames;
    }

    this.onFrame(targetFrame);
    this.rafId = requestAnimationFrame(this.tick);
  };
}
