# Sekai Terminal // LifeOS

**System Access Point:** [Insert GitHub Pages Link Here]

## System Overview

Sekai Terminal is a high-fidelity productivity architecture designed to gamify the human experience. It functions as a personal "Operating System" (LifeOS), abstracting the mundane complexities of daily task management into a visual, interactive Role-Playing Game (RPG) interface.

Unlike traditional productivity tools which offer static lists, Sekai Terminal provides a reactive environment where actions have tangible visual consequences. Completing a task is not just a checkbox; it is an event that propagates through a neural network of skills, upgrading your character stats in real-time.

## System Architecture

The application is engineered as a Single Page Application (SPA) utilizing vanilla web technologies to maintain zero-dependency portability and maximum performance.

### 1. The Neural Skill Network (Visualization Engine)
At the core of the system lies the Skill Tree, a dynamic directed graph that visualizes knowledge acquisition.

*   **Rendering Protocol**: We employ the `vis.Network` library to render the graph. The system utilizes the **Barnes-Hut** physics solver to handle node repulsion and edge spring mechanisms. This results in a self-organizing layout where heavily connected knowledge clusters naturally group together, visually representing "areas of expertise."
*   **Node Architecture (OOP)**: The graph is built upon a strict Object-Oriented principle. The `SkillNode` class serves as the fundamental data unit, encapsulating:
    *   **Identity**: Unique IDs and Labels.
    *   **Heuristics**: Rarity Rank (Normal -> Mythic), Shape, and Color.
    *   **Topology**: A recursive list of `Child` IDs, allowing the node to be aware of its own dependencies.
*   **Interaction Model**: Users can dynamically manipulate the graph structure—adding nodes, modifying relationships, and deleting obsolete skills—with changes reflected instantly in the physics simulation.

### 2. The Quest Kernel (Task Logic)
The Quest Board acts as the input terminal for the user's daily output.

*   **Attribute Injection**: Every quest is assigned specific attributes (e.g., Knowledge, Dexterity, Strength). Upon completion, the "CheckLevel" algorithm interrupts the process to calculate total XP gains and inject them into the Global State.
*   **State Persistence Layer**: To operate without a backend server, the system implements a custom serialization protocol for `localStorage`.
    *   **Serialization**: On every state change (Quest Complete, Node Added), the system serializes the complex Object graphs into JSON strings.
    *   **Hydration**: On load, the system "hydrates" these JSON strings back into functional Objects, ensuring that no complex relationships (like Skill Tree edges) are lost between sessions.

### 3. Recursive Progression Algorithm
The "Inventory" module is the system's output display, calculating the user's "Level".

*   **Algorithms in Motion**: The level calculation is not linear. It employs a **Reverse Propagation** algorithm.
    *   The system iterates through every node in the graph.
    *   It identifies "Leaf Nodes" (skills) and traces their lineage back to "Base Nodes" (classes).
    *   **XP Scaling**: It applies a value function based on the node's Rarity Rank (e.g., `Mythic = 30XP`).
*   **Iterative Leveling**: The system calculates the user's level using a custom delta curve: `NextLevel_Requirement = 100 + (CurrentLevel * 10)`. This ensures that early progress is rapid, while mastery requires exponential effort, mirroring real-world skill acquisition curves.

## Visual Design Language

The interface is constructed using a "Glassmorphism" design language to evoke a futuristic, HUD-like feel.

*   **CSS Architecture**: The styling relies heavily on CSS Custom Properties (Variables) to define a reactive theming engine. Colors, spacing, and glass-blur effects are tokenized, allowing for global theme switches (e.g., Dark Mode) with zero layout thrashing.
*   **Responsive Grid**: The Inventory dashboard utilizes CSS Grid with `minmax()` functions, ensuring the interface creates a panoramic, widescreen dashboard on desktop displays while gracefully collapsing on smaller viewports.

## Deployment & Usage

**Status**: Active
**Environment**: Client-Side Only (Browser)

1.  **Initialize**: Navigate to the provided URL. No installation required.
2.  **Persistence**: Your data lives in your browser's Local Storage. Clearing your cache will reset your progress.

---
