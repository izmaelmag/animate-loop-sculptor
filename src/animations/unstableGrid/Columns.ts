import p5 from "p5"; // Import p5 if needed
import { createNoise2D } from "simplex-noise";
import { Cell } from "./Cell";
// Removed import { columnsCount } from "./unstableGrid"; // Removed dependency

// Interface for Column configuration (subset of UnstableGridConfig)
interface ColumnConfig {
  cellAmplitudeY: number;
  noiseOffsetY: number;
  cellNoiseFrequencyY: number;
  cellNoiseSpeedY: number;
  minCellHeightPixels: number;
  cellAmplitudeXFactor: number; 
  cellNoiseOffsetX: number; 
  cellNoiseFrequencyX: number;
  cellNoiseSpeedX: number;
  cellPaddingXPixels: number; 
  totalHeight: number; // Explicitly require total height
  baseColumnWidth: number; // Require base width for ratio calculation
}

export class Column {
  private p: p5; // Store p5 instance if needed for p.max/min
  public cells: Cell[] = [];
  private originalCellPositions: number[] = [];
  private originalCellCenterX: number = 0;
  private config: ColumnConfig; // Store config

  // --- Removed separate noise parameters (now in config) ---
  // private cellAmplitudeY: number = 40;
  // ... etc ...

  private noiseY = createNoise2D();
  private noiseX = createNoise2D();

  constructor(
    p: p5, // Accept p5 instance
    public leftX: number,
    public rightX: number,
    public cellsCount: number,
    public columnIndex: number,
    public globalProgress: number,
    config: ColumnConfig // Accept config object
  ) {
    this.p = p; // Store p5
    this.config = config; // Store config
    this.originalCellCenterX = this.leftX + (this.rightX - this.leftX) / 2;
    this._createCells();
  }

  get width(): number {
    return this.rightX - this.leftX;
  }

  public setBounds(leftX: number, rightX: number) {
    this.leftX = leftX;
    this.rightX = rightX;
    this.originalCellCenterX = this.leftX + (this.rightX - this.leftX) / 2;
    for (const cell of this.cells) {
      cell.resize(this.leftX, this.rightX, cell.topY, cell.bottomY);
    }
  }

  public setGlobalProgress(globalProgress: number) {
    this.globalProgress = globalProgress;
  }

  // --- Removed Setters (config passed in constructor) ---
  // public setCellAmplitudeY(...) { ... }
  // ... etc ...

  private _createCells() {
    this.cells = [];
    this.originalCellPositions = [];

    // Use config.totalHeight
    const cellHeight = this.config.totalHeight / this.cellsCount;

    for (let i = 0; i < this.cellsCount; i++) {
      const topY = i * cellHeight;
      const bottomY = topY + cellHeight;
      const cell = new Cell(this.leftX, this.rightX, topY, bottomY);
      this.cells.push(cell);
      this.originalCellPositions.push(topY);
      this.originalCellPositions.push(bottomY);
    }
  }

  public update() {
    const isActive = this.globalProgress > 0.001;
    const currentColumnWidth = this.rightX - this.leftX;
    // Use config.baseColumnWidth
    const baseColumnWidth = this.config.baseColumnWidth; 

    const boundaryYPositions: number[] = [0];
    for (let i = 0; i < this.cells.length; i++) {
      let boundaryY = this.originalCellPositions[i * 2 + 1];
      if (isActive && i < this.cells.length - 1) {
        const noiseValueY =
          this.noiseY(
            // Use config values for noise calculation
            i * this.config.cellNoiseFrequencyY + this.config.noiseOffsetY * this.columnIndex,
            this.globalProgress * this.config.cellNoiseSpeedY
          ) * 2 - 1;
        boundaryY += noiseValueY * this.config.cellAmplitudeY;
      }
      boundaryYPositions.push(boundaryY);
    }
    // Use config.totalHeight
    boundaryYPositions[this.cells.length] = this.config.totalHeight; 

    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];
      let topY = boundaryYPositions[i];
      let bottomY = boundaryYPositions[i + 1];

      // Use config.minCellHeightPixels
      const MIN_CELL_HEIGHT = this.config.minCellHeightPixels;
      if (bottomY - topY < MIN_CELL_HEIGHT) {
        const midY = (topY + bottomY) / 2;
        topY = midY - MIN_CELL_HEIGHT / 2;
        bottomY = midY + MIN_CELL_HEIGHT / 2;
        if (i > 0) boundaryYPositions[i] = topY;
        boundaryYPositions[i + 1] = bottomY;
      }
      // Use config.totalHeight
      topY = this.p.max(0, this.p.min(this.config.totalHeight - MIN_CELL_HEIGHT, topY));
      bottomY = this.p.max(MIN_CELL_HEIGHT, this.p.min(this.config.totalHeight, bottomY));
      if (bottomY <= topY) bottomY = topY + MIN_CELL_HEIGHT;

      cell.resize(this.leftX, this.rightX, topY, bottomY);

      let newCenterX = this.originalCellCenterX;
      if (isActive) {
        const noiseValueX =
          this.noiseX(
            // Use config values for noise calculation
            i * this.config.cellNoiseFrequencyX + this.config.cellNoiseOffsetX * this.columnIndex,
            this.globalProgress * this.config.cellNoiseSpeedX + 100 
          ) * 2 - 1;

        const widthRatio = baseColumnWidth > 0 ? currentColumnWidth / baseColumnWidth : 1;
        // Calculate amplitude based on factor and cell height
        const cellHeight = bottomY - topY;
        const amplitudeX = cellHeight * this.config.cellAmplitudeXFactor; 
        const displacementX = noiseValueX * amplitudeX * widthRatio;
        newCenterX += displacementX;

        // Use config.cellPaddingXPixels
        const paddingX = this.config.cellPaddingXPixels; 
        newCenterX = this.p.max(this.leftX + paddingX, this.p.min(this.rightX - paddingX, newCenterX));
      }
      cell.center.x = newCenterX;
      cell.center.y = cell.topY + (cell.bottomY - cell.topY) / 2;
    }
  }
}
