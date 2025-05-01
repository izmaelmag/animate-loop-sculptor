import p5 from "p5";
import { Cell } from "./Cell";
import { UnstableGridConfig } from "./config"; // Import config type only

interface CellBoundaries {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export class Column {
  cells: Cell[] = [];
  leftBoundary: number;  // Current interpolated boundary
  rightBoundary: number; // Current interpolated boundary
  cellsCount: number;
  originalWidth: number;
  originalCellHeight: number;
  originalCellCenterX: number;
  originalBoundaryYPositions: number[] = []; // Keep originals for target calculation
  
  // --- State for Direct Cell Boundary Interpolation ---
  private previousCellBoundaries: CellBoundaries[] = [];
  private targetCellBoundaries: CellBoundaries[] = [];
  private currentCellBoundaries: CellBoundaries[] = []; // Interpolated values used for resize

  // --- Amplitude/Config (passed in constructor) ---
  private cellAmplitudeYFactor: number = 0;
  private cellAmplitudeXFactor: number = 0;
  private config: UnstableGridConfig;
  private minCellHeight: number;
  private cellPaddingX: number;
  private minColumnWidth: number; // Added this for clarity

  private p: p5; // Store p5 instance

  constructor(
    leftX: number,
    rightX: number,
    cellsCount: number,
    _columnIndex: number,
    _noiseSeed: number, 
    config: UnstableGridConfig,
    p: p5 
  ) {
    this.leftBoundary = leftX;
    this.rightBoundary = rightX;
    this.cellsCount = cellsCount;
    this.config = config;
    this.p = p; 

    this.originalWidth = rightX - leftX;
    this.originalCellHeight = this.config.height / this.cellsCount;
    this.minCellHeight = this.config.minCellHeight;
    this.minColumnWidth = this.config.minColumnWidth; // Store min width
    this.cellPaddingX = this.config.cellPaddingX;
    this.originalCellCenterX = leftX + this.originalWidth / 2;

    // Calculate original Y boundaries
    const spacing = this.config.height / this.cellsCount;
    for (let i = 0; i <= this.cellsCount; i++) {
      this.originalBoundaryYPositions.push(i * spacing);
    }

    this._createCellsAndInitBoundaries();
  }

  // Combines cell creation and boundary state initialization
  private _createCellsAndInitBoundaries(): void {
    this.cells = [];
    this.previousCellBoundaries = [];
    this.targetCellBoundaries = [];
    this.currentCellBoundaries = [];

    for (let i = 0; i < this.cellsCount; i++) {
      const initialBounds: CellBoundaries = {
          left: this.leftBoundary,
          right: this.rightBoundary,
          top: this.originalBoundaryYPositions[i],
          bottom: this.originalBoundaryYPositions[i+1]
      };
      
      const cell = new Cell(
          initialBounds.left,
          initialBounds.right,
          initialBounds.top,
          initialBounds.bottom
      );
      this.cells.push(cell);

      // Initialize all states with initial boundaries
      this.previousCellBoundaries.push({...initialBounds});
      this.targetCellBoundaries.push({...initialBounds});
      this.currentCellBoundaries.push({...initialBounds});
    }
  }

  // Called by unstableGrid on update frames to set new random TARGET cell boundaries
  updateCellTargets(p: p5, targetColumnLeft: number, targetColumnRight: number): void {
    // Store current INTERPOLATED boundaries as previous for the next lerp cycle
    // Important: Use deep copy
    this.previousCellBoundaries = this.currentCellBoundaries.map(b => ({...b}));

    // Calculate target Y boundaries (similar logic to before)
    const targetBoundaryYPositions: number[] = [...this.originalBoundaryYPositions];
    for (let i = 1; i < this.originalBoundaryYPositions.length - 1; i++) {
        const randomValue = p.random(-1, 1);
        const distToTop = this.originalBoundaryYPositions[i] - this.originalBoundaryYPositions[i - 1];
        const distToBottom = this.originalBoundaryYPositions[i + 1] - this.originalBoundaryYPositions[i];
        const maxDispUp = distToTop - this.minCellHeight;
        const maxDispDown = distToBottom - this.minCellHeight;
        const baseAmplitude = this.originalCellHeight * this.cellAmplitudeYFactor; 
        let displacement = randomValue * baseAmplitude;
        if (displacement < 0) { displacement = Math.max(displacement, -maxDispUp); }
        else { displacement = Math.min(displacement, maxDispDown); }
        targetBoundaryYPositions[i] = this.originalBoundaryYPositions[i] + displacement;
    }

    // Calculate target X center displacement (similar logic to before)
    const randomValueX = p.random(-1, 1);
    const maxHorizontalDisp = this.originalWidth - this.cellPaddingX; 
    const baseAmplitudeX = this.originalWidth * this.cellAmplitudeXFactor;
    let displacementX = randomValueX * baseAmplitudeX;
    displacementX = Math.max(-maxHorizontalDisp, Math.min(maxHorizontalDisp, displacementX));
    const targetCellCenterX = this.originalCellCenterX + displacementX;

    // Calculate target cell width (keeping original width for now)
    const targetCellWidth = this.originalWidth;

    // Calculate and store target boundaries for each cell
    for(let i = 0; i < this.cellsCount; i++) {
        const targetTop = targetBoundaryYPositions[i];
        const targetBottom = targetBoundaryYPositions[i + 1];
        
        // Calculate target Left/Right based on target center and width
        let targetLeft = targetCellCenterX - targetCellWidth / 2;
        let targetRight = targetCellCenterX + targetCellWidth / 2;

        // Clamp target Left/Right using the TARGET column boundaries
        targetLeft = Math.max(targetColumnLeft + this.cellPaddingX, targetLeft);
        targetRight = Math.min(targetColumnRight - this.cellPaddingX, targetRight);
        // Ensure min width within target bounds
        if (targetRight - targetLeft < this.config.minColumnWidth) {
             const center = (targetLeft + targetRight) / 2;
             targetLeft = center - this.config.minColumnWidth / 2;
             targetRight = center + this.config.minColumnWidth / 2;
             // Re-clamp after ensuring min width
             targetLeft = Math.max(targetColumnLeft + this.cellPaddingX, targetLeft);
             targetRight = Math.min(targetColumnRight - this.cellPaddingX, targetRight);
        }
        
        this.targetCellBoundaries[i] = {
            left: targetLeft,
            right: targetRight,
            top: targetTop,
            bottom: targetBottom,
        };
    }
  }

  // Called every frame by unstableGrid to interpolate towards target cell boundaries
  interpolateCellBoundaries(lerpFactor: number): void {
    for (let i = 0; i < this.cellsCount; i++) {
        const prev = this.previousCellBoundaries[i];
        const target = this.targetCellBoundaries[i];
        const current = this.currentCellBoundaries[i]; // Get ref to current

        // Interpolate all boundaries
        current.left = this.p.lerp(prev.left, target.left, lerpFactor);
        current.right = this.p.lerp(prev.right, target.right, lerpFactor);
        current.top = this.p.lerp(prev.top, target.top, lerpFactor);
        current.bottom = this.p.lerp(prev.bottom, target.bottom, lerpFactor);

        // --- Apply Minimum Size Constraints --- 
        // Enforce minimum height
        const currentHeight = current.bottom - current.top;
        if (currentHeight < this.minCellHeight) {
            const deficit = this.minCellHeight - currentHeight;
            // Adjust top and bottom symmetrically around the center
            current.top -= deficit / 2;
            current.bottom += deficit / 2;
            // TODO: Add clamping to ensure top/bottom don't go beyond overall canvas bounds if needed?
        }

        // Enforce minimum width
        const currentWidth = current.right - current.left;
        if (currentWidth < this.minColumnWidth) { // Use stored minColumnWidth
            const deficit = this.minColumnWidth - currentWidth;
            // Adjust left and right symmetrically
            current.left -= deficit / 2;
            current.right += deficit / 2;
            // TODO: Add clamping to ensure left/right don't go beyond column bounds?
            // (Maybe target calculation already handles this sufficiently)
        }
        // --- End Minimum Size Constraints --- 

        // Apply the fully interpolated (and constrained) boundaries to the cell object
        this.cells[i].resize(
            current.left,
            current.right,
            current.top,
            current.bottom
        );
    }
  }

  // Update the current column boundaries (called by unstableGrid)
  setBounds(leftX: number, rightX: number): void {
    this.leftBoundary = leftX;
    this.rightBoundary = rightX;
    // No need to update cells here, interpolateCellBoundaries handles it
  }

  // Setters for Amplitudes (renamed factors for clarity)
  setCellAmplitudeYFactor(factor: number): void { this.cellAmplitudeYFactor = factor; }
  setCellAmplitudeXFactor(factor: number): void { this.cellAmplitudeXFactor = factor; }

  // REMOVED: interpolateState, _updateCellGeometry, updateTargets, previous/target BoundaryYPositions, previous/target CellCenterX etc.
}


