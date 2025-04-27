import { createNoise2D } from "simplex-noise";
import { Cell } from "./Cell";
import { UnstableGridConfig } from "./config"; // Import config type

export class Column {
  public cells: Cell[] = [];
  // Store original Y positions and X centers of cells
  private originalCellPositions: number[] = []; // Stores topY, bottomY pairs
  private originalCellCenterX: number = 0; // Store original center X

  // Noise parameters are now set via setters from unstableGrid.ts
  private cellAmplitudeY!: number; // Use definite assignment assertion or initialize in constructor
  private noiseOffsetY!: number;
  private cellNoiseFrequencyY!: number;
  private cellNoiseSpeedY!: number;
  private cellAmplitudeX!: number;
  private noiseOffsetX!: number;
  private cellNoiseFrequencyX!: number;
  private cellNoiseSpeedX!: number;

  private noiseY = createNoise2D();
  private noiseX = createNoise2D();
  private config: UnstableGridConfig; // Store config

  constructor(
    public leftX: number,
    public rightX: number,
    public cellsCount: number,
    public columnIndex: number,
    public globalProgress: number,
    config: UnstableGridConfig // Receive config object
  ) {
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

    // Use config height
    const totalHeight = this.config.height; 
    const cellHeight = totalHeight / this.cellsCount;

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
    // Use config columnsCount
    const baseColumnWidth = this.config.width / this.config.columnsCount; 

    const boundaryYPositions: number[] = [0];
    for (let i = 0; i < this.cells.length; i++) {
      let boundaryY = this.originalCellPositions[i * 2 + 1]; 
      if (isActive && i < this.cells.length - 1) {
        const noiseValueY =
          this.noiseY(
            i * this.cellNoiseFrequencyY + this.noiseOffsetY * this.columnIndex,
            this.globalProgress * this.cellNoiseSpeedY
          ) * 2 - 1;
        boundaryY += noiseValueY * this.cellAmplitudeY;
      }
      boundaryYPositions.push(boundaryY); 
    }
    boundaryYPositions[this.cells.length] = this.config.height; // Use config height

    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];
      let topY = boundaryYPositions[i];
      let bottomY = boundaryYPositions[i+1];

      // Use config minCellHeight
      const MIN_CELL_HEIGHT = this.config.minCellHeight; 
      if (bottomY - topY < MIN_CELL_HEIGHT) {
          const midY = (topY + bottomY) / 2;
          topY = midY - MIN_CELL_HEIGHT / 2;
          bottomY = midY + MIN_CELL_HEIGHT / 2;
          if (i > 0) boundaryYPositions[i] = topY;
          boundaryYPositions[i+1] = bottomY;
      }
      // Use config height
      topY = Math.max(0, Math.min(this.config.height - MIN_CELL_HEIGHT, topY));
      bottomY = Math.max(MIN_CELL_HEIGHT, Math.min(this.config.height, bottomY));
      if (bottomY <= topY) bottomY = topY + MIN_CELL_HEIGHT;

      cell.resize(this.leftX, this.rightX, topY, bottomY);

      let newCenterX = this.originalCellCenterX;
      if (isActive) {
        const noiseValueX =
          this.noiseX(
            i * this.cellNoiseFrequencyX + this.noiseOffsetX * this.columnIndex,
            this.globalProgress * this.cellNoiseSpeedX + 100
          ) * 2 - 1;
        const widthRatio = baseColumnWidth > 0 ? currentColumnWidth / baseColumnWidth : 1;
        const displacementX = noiseValueX * this.cellAmplitudeX * widthRatio;
        newCenterX += displacementX;

        // Use config cellPaddingX
        const paddingX = this.config.cellPaddingX; 
        newCenterX = Math.max(this.leftX + paddingX, Math.min(this.rightX - paddingX, newCenterX));
      } 
      cell.center.x = newCenterX;
      cell.center.y = cell.topY + (cell.bottomY - cell.topY) / 2;
    }
  }
}
