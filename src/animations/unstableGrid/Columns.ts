import { createNoise2D } from "simplex-noise";
import { Cell } from "./Cell";
import { columnsCount } from "./unstableGrid";

export class Column {
  public cells: Cell[] = [];
  // Store original Y positions and X centers of cells
  private originalCellPositions: number[] = []; // Stores topY, bottomY pairs
  private originalCellCenterX: number = 0; // Store original center X

  // --- Vertical Noise Parameters ---
  private cellAmplitudeY: number = 40;
  private noiseOffsetY: number = 0;
  private cellNoiseFrequencyY: number = 0.5;
  private cellNoiseSpeedY: number = 20;

  // --- Horizontal Noise Parameters ---
  private cellAmplitudeX: number = 20; // Default horizontal amplitude
  private noiseOffsetX: number = 0.5; // Offset for horizontal noise (can be different from vertical)
  private cellNoiseFrequencyX: number = 0.4;
  private cellNoiseSpeedX: number = 15;

  private noiseY = createNoise2D(); // Noise generator for Y
  private noiseX = createNoise2D(); // Separate noise generator for X

  constructor(
    public leftX: number,
    public rightX: number,
    public cellsCount: number,
    public columnIndex: number,
    public globalProgress: number
  ) {
    // Store original center X based on initial column bounds
    this.originalCellCenterX = this.leftX + (this.rightX - this.leftX) / 2;
    this._createCells();
  }

  get width(): number {
    return this.rightX - this.leftX;
  }

  public setBounds(leftX: number, rightX: number) {
    this.leftX = leftX;
    this.rightX = rightX;

    // Update original center X when bounds change
    this.originalCellCenterX = this.leftX + (this.rightX - this.leftX) / 2;

    // Update X coordinates for all cells via resize (which should update centerX)
    for (const cell of this.cells) {
      // Assuming resize updates the internal bounds used for centerX calculation
      cell.resize(this.leftX, this.rightX, cell.topY, cell.bottomY);
      // We will apply noise *in addition* to this base centerX in update()
    }
  }

  public setGlobalProgress(globalProgress: number) {
    this.globalProgress = globalProgress;
  }

  // --- Setters for Vertical Noise ---
  public setCellAmplitudeY(amplitude: number) {
    this.cellAmplitudeY = amplitude;
  }
  public setNoiseOffsetY(offset: number) {
    this.noiseOffsetY = offset;
  }
  public setCellNoiseFrequencyY(frequency: number) {
    this.cellNoiseFrequencyY = frequency;
  }
  public setCellNoiseSpeedY(speed: number) {
    this.cellNoiseSpeedY = speed;
  }

  // --- Setters for Horizontal Noise ---
  public setCellAmplitudeX(amplitude: number) {
    this.cellAmplitudeX = amplitude;
  }
  public setNoiseOffsetX(offset: number) {
    this.noiseOffsetX = offset;
  }
  public setCellNoiseFrequencyX(frequency: number) {
    this.cellNoiseFrequencyX = frequency;
  }
  public setCellNoiseSpeedX(speed: number) {
    this.cellNoiseSpeedX = speed;
  }


  private _createCells() {
    this.cells = [];
    this.originalCellPositions = [];

    const totalHeight = 1920; // TODO: Get this from settings?
    const cellHeight = totalHeight / this.cellsCount;

    for (let i = 0; i < this.cellsCount; i++) {
      const topY = i * cellHeight;
      const bottomY = topY + cellHeight;

      const cell = new Cell(this.leftX, this.rightX, topY, bottomY);
      this.cells.push(cell);

      // Store original vertical positions
      this.originalCellPositions.push(topY);
      this.originalCellPositions.push(bottomY);
    }
  }

  public update() {
    const isActive = this.globalProgress > 0.001;
    const currentColumnWidth = this.rightX - this.leftX;
    const baseColumnWidth = 1080 / columnsCount;

    // Calculate all noisy boundary Y positions first
    const boundaryYPositions: number[] = [0]; // Start with top boundary at 0
    for (let i = 0; i < this.cells.length; i++) {
      let boundaryY = this.originalCellPositions[i * 2 + 1]; // Original bottom boundary
      if (isActive && i < this.cells.length - 1) { // No noise for the very last boundary
        const noiseValueY =
          this.noiseY(
            i * this.cellNoiseFrequencyY + this.noiseOffsetY * this.columnIndex,
            this.globalProgress * this.cellNoiseSpeedY
          ) * 2 - 1;
        
        boundaryY += noiseValueY * this.cellAmplitudeY;
      }
      boundaryYPositions.push(boundaryY); 
    }
    // Ensure last boundary is at the bottom edge
    boundaryYPositions[this.cells.length] = 1920; 

    // Now update cells using the calculated boundaries
    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];
      let topY = boundaryYPositions[i];
      let bottomY = boundaryYPositions[i+1];

      // Apply minimum height constraint (adjust both boundaries if needed)
      const MIN_CELL_HEIGHT = 5; 
      if (bottomY - topY < MIN_CELL_HEIGHT) {
          const midY = (topY + bottomY) / 2;
          topY = midY - MIN_CELL_HEIGHT / 2;
          bottomY = midY + MIN_CELL_HEIGHT / 2;
          // Re-clamp adjacent boundaries (this could get complex, simplify for now)
          if (i > 0) boundaryYPositions[i] = topY;
          boundaryYPositions[i+1] = bottomY;
      }
      // Clamp boundaries to screen edges (just in case)
      topY = Math.max(0, Math.min(1920 - MIN_CELL_HEIGHT, topY));
      bottomY = Math.max(MIN_CELL_HEIGHT, Math.min(1920, bottomY));
      if (bottomY <= topY) bottomY = topY + MIN_CELL_HEIGHT; // Final safety

      // Apply vertical bounds update
      cell.resize(this.leftX, this.rightX, topY, bottomY);

      // --- Horizontal Noise Calculation (Center X) ---
      let newCenterX = this.originalCellCenterX;
      if (isActive) {
        const noiseValueX =
          this.noiseX(
            i * this.cellNoiseFrequencyX + this.noiseOffsetX * this.columnIndex,
            this.globalProgress * this.cellNoiseSpeedX + 100 // Add offset to time/seed
          ) * 2 - 1;

        const widthRatio = baseColumnWidth > 0 ? currentColumnWidth / baseColumnWidth : 1;
        const displacementX = noiseValueX * this.cellAmplitudeX * widthRatio;
        newCenterX += displacementX;

        const paddingX = 10; 
        newCenterX = Math.max(this.leftX + paddingX, Math.min(this.rightX - paddingX, newCenterX));
      } 
      cell.center.x = newCenterX;
      cell.center.y = cell.topY + (cell.bottomY - cell.topY) / 2;
    }
  }
}
