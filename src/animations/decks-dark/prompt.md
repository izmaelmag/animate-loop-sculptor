# Codebase Refactoring Prompt for Chain Animation Visualization

Please help refactor this generative art codebase to make it more maintainable and adaptable. The code creates a visualization with rotating chain structures that form "tentacles" with prismatic chromatic aberration effects.

## Core Components

1. **Link class**: Basic building block that represents a segment in a chain with:

   - Rotating behavior around an oscillating angle
   - Parent-child relationships forming a chain
   - Points for determining shape (center, direction, left/right sides)

2. **Chain class**: Manages collections of connected links with:

   - Time-based animation updates
   - Shape rendering with temporal color shifting
   - A "hugging shape" that traces the outline of the chain

3. **SceneController**: Orchestrates multiple chains with:
   - Layered rendering to control the order of colored elements
   - Time-based animation progression
   - Background and canvas management

## Refactoring Goals

1. Improve modularity by separating:

   - Core geometry/math
   - Rendering/visualization
   - Animation behaviors
   - Effects (chromatic aberration)

2. Add better type safety and documentation

3. Implement a more flexible and configurable effects system for:

   - Chromatic aberration with customizable colors and time offsets
   - Alternative visual styles
   - Animation parameter controls

4. Optimize performance for smoother animations

5. Preserve the current visual aesthetics but make the code easier to adapt

## Key Behaviors to Maintain

- Time-based chain movement with proper parent-child relationships
- Layered rendering approach for the RGB chromatic aberration effect
- The ability to create different formations of chains

The visualization currently implements a temporal-based chromatic aberration that shows each chain at different points in time using red, green, and white colors to create a prismatic effect.
