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

    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];
      let currentTopY = cell.topY;
      let currentBottomY = cell.bottomY;

      // --- Vertical Noise Calculation (Boundaries) ---
      // Only update boundaries for cells before the last one
      if (i < this.cells.length - 1) {
        const nextCell = this.cells[i+1];
        if (isActive) {
          const noiseValueY =
            this.noiseY(
              i * this.cellNoiseFrequencyY + this.noiseOffsetY * this.columnIndex,
              this.globalProgress * this.cellNoiseSpeedY
            ) * 2 - 1;
          
          const originalBottomY = this.originalCellPositions[i * 2 + 1];
          let newBottomY = originalBottomY + noiseValueY * this.cellAmplitudeY;

          // Reduce minimum cell height constraint significantly
          const MIN_CELL_HEIGHT = 5; 
          const minBottomY = cell.topY + MIN_CELL_HEIGHT; 
          const maxBottomY = 
            i < this.cells.length - 2 
            ? this.originalCellPositions[(i + 1) * 2 + 1] - MIN_CELL_HEIGHT // Ensure next cell min height
            : 1920 - MIN_CELL_HEIGHT;
          
          newBottomY = Math.max(minBottomY, Math.min(maxBottomY, newBottomY));
          currentBottomY = newBottomY; // Use calculated bottom Y
          // Update next cell's top to match
          nextCell.resize(this.leftX, this.rightX, currentBottomY, nextCell.bottomY); 
        } else {
           // Reset to original positions at start
           currentTopY = this.originalCellPositions[i*2];
           currentBottomY = this.originalCellPositions[i*2+1];
        }
      } else {
         // Ensure last cell goes to the bottom
         currentBottomY = 1920;
      }
       // Apply vertical bounds update
       cell.resize(this.leftX, this.rightX, currentTopY, currentBottomY);

      // --- Horizontal Noise Calculation (Center X) ---
      if (isActive) {
        const noiseValueX =
          this.noiseX(
            i * this.cellNoiseFrequencyX + this.noiseOffsetX * this.columnIndex,
            this.globalProgress * this.cellNoiseSpeedX + 100 // Add offset to time/seed
          ) * 2 - 1;

        // Normalize displacement based on current width relative to base width
        const widthRatio = baseColumnWidth > 0 ? currentColumnWidth / baseColumnWidth : 1; // Avoid division by zero
        const displacementX = noiseValueX * this.cellAmplitudeX * widthRatio;
        
        // Apply noise to the original center X
        let newCenterX = this.originalCellCenterX + displacementX;

        // Clamp newCenterX 
        const paddingX = 10; 
        newCenterX = Math.max(this.leftX + paddingX, Math.min(this.rightX - paddingX, newCenterX));

        cell.center.x = newCenterX; 
      } else {
        cell.center.x = this.originalCellCenterX;
      }
      
      cell.center.y = cell.topY + (cell.bottomY - cell.topY) / 2;
    }
  }
}
