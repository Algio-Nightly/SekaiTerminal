# Skill Tree Implementation Documentation

## Overview
This document describes the technical implementation of the interactive Skill Tree in `skills.js`. The system utilizes the `vis.js` library for network graph visualization and implements a custom persistence layer using the browser's `localStorage`.

## Data Structures

### `SkillNode` Class
A standardized class for creating graph nodes.
- **Constructor**: `new SkillNode(id, label, shape, size, color, font)`
- **Usage**: Ensures consistent property structure for all nodes added to the `vis.DataSet`.

### DataSets
The graph uses two `vis.DataSet` instances which allow for dynamic manipulation:
- `nodes`: Stores all `SkillNode` objects.
- `edges`: Stores connection objects (`{ from, to }`).

## Configuration

### `COLOR_PRESETS`
A dictionary defining the visual styles for different skill types. Each preset includes `background` and `border` colors.
- **Keys**: `default`, `red`, `blue`, `green`, `gold`, `purple`.

### `options`
The configuration object passed to the `vis.Network` constructor.
- **Physics**: Uses the `barnesHut` solver for organic layout stability (`gravitationalConstant: -4000`).
- **Interaction**: Enables hover effects and tooltip delays.
- **Layout**: Uses a fixed random seed for consistent initial layouts.

## Persistence Layer

### Storage Logic
Data is persisted to `localStorage` under the key `seki_skill_tree`.

- **`loadSkillTree()`**: 
  - Retrieves the JSON string from storage.
  - Parses it and re-initializes `nodes` and `edges` as `vis.DataSet` objects.
  - Returns `null` if no data exists (triggering default initialization).

- **`saveSkillTree()`**:
  - Serializes the current state of `nodes` and `edges` using `.get()`.
  - Saves the JSON string to `localStorage`.

- **Auto-Save**:
  - Event listeners are attached to `nodes.on('*')` and `edges.on('*')`.
  - Any change (add, update, remove) triggers `saveSkillTree()`.

## Core Functionality

### Node Selection
- A `click` event listener on the `skillTree` network instance captures user interaction.
- **Logic**:
  - If a node is clicked, `selectedNodeId` and `selectedNodeLabel` are updated.
  - The UI Toolbar is updated to display the name of the selected skill.
  - If the background is clicked (no nodes), the selection is cleared.

### Adding Skills
- **UI**: Managed by `#addSkillBtn` which toggles the `#add-skill-panel`.
- **Inputs**:
  - **Name**: Text input.
  - **Shape**: Dropdown (circle, box, diamond, hexagon).
  - **Color**: Dropdown mapping to `COLOR_PRESETS`.
  - **Size**: Range slider (10-50).
- **Creation Logic (`createSkillBtn`)**:
  - Validates input (Name is required).
  - Generates a new unique ID (`max(ids) + 1`).
  - instances a new `SkillNode` with the selected properties.
  - **Linkage**: If a node is currently selected, an edge is automatically created linking the Selected Node (Parent) to the New Node.

### Removing Skills
- **Trigger**: `#removeSkillBtn`.
- **Logic**:
  1. Checks if a node is selected.
  2. Prompts user for confirmation.
  3. Identifies all edges connected to the node.
  4. Removes identified edges from the `edges` DataSet.
  5. Removes the node from the `nodes` DataSet.
  6. Clears current selection variables and UI.

### UI Interaction
- **Panel Toggling**: The floating button (`#add-skill-panel-open`) toggles the visibility of the main sidebar panel (`#skill-panel-1`) and swaps its icon between `+` and `times` (close).
- **Size Slider**: An event listener on the slider input updates a span element to show the real-time pixel value.
