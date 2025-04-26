import { createNoise2D } from "simplex-noise";
import { Cell } from "./Cell";

export class Column {
  public cells: Cell[] = [];
  // Store original Y positions of cells
  private originalCellPositions: number[] = [];
  // Control the amplitude of Y-axis movement
  private cellAmplitude: number = 40;
  // Offset for the noise function to make columns move differently
  private noiseOffset: number = 0;
  private noise = createNoise2D();

  constructor(
    public leftX: number,
    public rightX: number,
    public cellsCount: number,
    public columnIndex: number,
    public globalProgress: number
  ) {
    this._createCells();
  }

  get width(): number {
    return this.rightX - this.leftX;
  }

  public setBounds(leftX: number, rightX: number) {
    this.leftX = leftX;
    this.rightX = rightX;

    // Update X coordinates for all cells
    for (const cell of this.cells) {
      cell.resize(this.leftX, this.rightX, cell.topY, cell.bottomY);
    }
  }

  public setGlobalProgress(globalProgress: number) {
    this.globalProgress = globalProgress;
  }

  // Setter for cell amplitude
  public setCellAmplitude(amplitude: number) {
    this.cellAmplitude = amplitude;
  }

  // Setter for noise offset
  public setNoiseOffset(offset: number) {
    this.noiseOffset = offset;
  }

  private _createCells() {
    this.cells = [];
    this.originalCellPositions = [];

    const totalHeight = 1920; // Same as HEIGHT from main file
    const cellHeight = totalHeight / this.cellsCount;

    // Create cells with evenly spaced heights initially
    for (let i = 0; i < this.cellsCount; i++) {
      const topY = i * cellHeight;
      const bottomY = topY + cellHeight;

      const cell = new Cell(this.leftX, this.rightX, topY, bottomY);
      this.cells.push(cell);

      // Store original positions for noise-based movement
      this.originalCellPositions.push(topY);
      this.originalCellPositions.push(bottomY);
    }
  }

  public update() {
    // A small delay to start with even grid
    const isActive = this.globalProgress > 0.001;

    // For each cell except the last one, update its bottom boundary
    // The last cell's bottom boundary remains at the bottom of the screen
    for (let i = 0; i < this.cells.length - 1; i++) {
      const cell = this.cells[i];
      const nextCell = this.cells[i + 1];

      // Update X coordinates based on column bounds
      cell.resize(this.leftX, this.rightX, cell.topY, cell.bottomY);

      if (isActive) {
        // Calculate noise value for this cell's position
        // Use column index to create different patterns across columns
        const noiseValue =
          this.noise(
            i * 0.5 + this.noiseOffset * this.columnIndex,
            this.globalProgress * 20
          ) *
            2 -
          1; // Range -1 to 1

        // Get original position
        const originalBottomY = this.originalCellPositions[i * 2 + 1];

        // Apply noise to bottom Y position
        const newBottomY = originalBottomY + noiseValue * this.cellAmplitude;

        // Update this cell's bottom and next cell's top
        cell.resize(this.leftX, this.rightX, cell.topY, newBottomY);
        nextCell.resize(this.leftX, this.rightX, newBottomY, nextCell.bottomY);
      } else {
        // Reset to original positions at start
        const originalTopY = this.originalCellPositions[i * 2];
        const originalBottomY = this.originalCellPositions[i * 2 + 1];
        cell.resize(this.leftX, this.rightX, originalTopY, originalBottomY);
      }
    }

    // Make sure last cell extends to bottom
    if (this.cells.length > 0) {
      const lastCell = this.cells[this.cells.length - 1];
      lastCell.resize(this.leftX, this.rightX, lastCell.topY, 1920); // Match HEIGHT
    }
  }
}
