document.addEventListener('DOMContentLoaded', () => {
    class SkillTree extends vis.Network {
        constructor(nodes, edges, container, options) {
            super(container, { nodes, edges }, options);
        }
    }
    class SkillNode {
        constructor(id, label, shape, size, color, font, children = [], isBaseNode = false) {
            this.id = id;
            this.label = label;
            this.shape = shape;
            this.size = size;
            this.color = color;
            this.font = font;
            this.children = children; // Array of child IDs
            this.isBaseNode = isBaseNode;
        }
    }

    const SKILL_NODE_COLOR = {
        background: 'rgba(240, 240, 240, 0.18)',
        border: '#94a3b8',
        highlight: { background: 'rgba(240, 240, 240, 0.1)', border: '#ffffffff' }
    };

    const BASE_NODE_STYLE = {
        shape: 'hexagon',
        size: 32,
        color: {
            background: 'rgba(180, 0, 255, 0.2)',
            border: '#b400ff',
            highlight: { background: 'rgba(180, 0, 255, 0.6)', border: '#d500ff' },
            hover: { background: 'rgba(180, 0, 255, 0.4)', border: '#b400ff' }
        },
        font: { color: 'white' },
        shadow: { enabled: true, color: 'rgba(180, 0, 255, 0.8)', size: 25, x: 0, y: 0 }
    };

    const COLOR_PRESETS = {
        normal: {
            background: 'rgba(240, 240, 240, 0.18)',
            border: '#94a3b8',
            highlight: { background: 'rgba(255, 255, 255, 0.4)', border: '#ffffff' },
            hover: { background: 'rgba(240, 240, 240, 0.3)', border: '#94a3b8' }
        },
        epic: {
            background: 'rgba(255, 0, 85, 0.2)',
            border: '#ff0055',
            highlight: { background: 'rgba(255, 0, 85, 0.6)', border: '#ff3377' },
            hover: { background: 'rgba(255, 0, 85, 0.4)', border: '#ff0055' }
        },
        uncommon: {
            background: 'rgba(0, 242, 255, 0.2)',
            border: '#00f2ff',
            highlight: { background: 'rgba(0, 242, 255, 0.6)', border: '#33f5ff' },
            hover: { background: 'rgba(0, 242, 255, 0.4)', border: '#00f2ff' }
        },
        rare: {
            background: 'rgba(0, 255, 136, 0.2)',
            border: '#00ff88',
            highlight: { background: 'rgba(0, 255, 136, 0.6)', border: '#33ff99' },
            hover: { background: 'rgba(0, 255, 136, 0.4)', border: '#00ff88' }
        },
        legendary: {
            background: 'rgba(255, 215, 0, 0.2)',
            border: '#ffd700',
            highlight: { background: 'rgba(255, 215, 0, 0.6)', border: '#ffe44d' },
            hover: { background: 'rgba(255, 215, 0, 0.4)', border: '#ffd700' }
        },
        mythic: {
            background: 'rgba(180, 0, 255, 0.2)',
            border: '#b400ff',
            highlight: { background: 'rgba(180, 0, 255, 0.6)', border: '#ca4dff' },
            hover: { background: 'rgba(180, 0, 255, 0.4)', border: '#b400ff' }
        }
    };

    const options = {
        nodes: {
            borderWidth: 2,
            font: { color: '#e2e8f0', face: 'Rajdhani', size: 14 },
            shadow: { enabled: true, color: 'rgba(0,0,0,0.5)', size: 10, x: 5, y: 5 }
        },
        edges: {
            color: { color: 'rgba(148, 163, 184, 0.4)', highlight: '#00f2ff', hover: '#00f2ff' },
            width: 2,
            smooth: { type: 'continuous' },
            arrows: { to: { enabled: true, scaleFactor: 0.5 } },
            shadow: { enabled: true, color: 'rgba(0,0,0,0.5)', size: 5, x: 2, y: 2 }
        },
        physics: {
            stabilization: true,
            barnesHut: {
                gravitationalConstant: -4000,
                centralGravity: 0.1,
                springLength: 150,
                springConstant: 0.04,
                damping: 0.09,
                avoidOverlap: 0.1
            }
        },
        interaction: { hover: true, tooltipDelay: 200 },
        layout: { randomSeed: 2 }
    };

    // --- Persistence Logic ---
    const STORAGE_KEY = 'seki_skill_tree_v2'; // Changed key to break old data

    function loadSkillTree() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.nodes) {
                    return {
                        nodes: new vis.DataSet(data.nodes),
                    };
                }
            } catch (e) {
                console.error("Failed to load skill tree:", e);
            }
        }
        return null; // Return null if nothing saved
    }

    const savedData = loadSkillTree();

    // Clean up stuck glows from saved data
    if (savedData && savedData.nodes) {
        const allLoadedNodes = savedData.nodes.get();
        const cleanUpdates = allLoadedNodes.map(n => {
            if (n.isBaseNode) {
                return { id: n.id, shadow: BASE_NODE_STYLE.shadow };
            } else {
                return { id: n.id, shadow: undefined };
            }
        });
        savedData.nodes.update(cleanUpdates);
    }

    const nodes = savedData ? savedData.nodes : new vis.DataSet([
        new SkillNode(1, 'System', BASE_NODE_STYLE.shape, BASE_NODE_STYLE.size, BASE_NODE_STYLE.color, BASE_NODE_STYLE.font, [], true),
    ]);

    // Apply shadow to start node if it's base (manual update for init if class didn't handle it)
    if (!savedData) {
        const root = nodes.get(1);
        root.shadow = BASE_NODE_STYLE.shadow;
        nodes.update(root);
    }

    const edges = new vis.DataSet([]);

    // --- Helper for Inventory ---
    window.getBaseSkillNodes = function () {
        return nodes.get({
            filter: function (item) {
                return item.isBaseNode === true;
            }
        });
    };

    function reconstructEdges() {
        edges.clear();
        const allNodes = nodes.get();
        const newEdges = [];

        allNodes.forEach(node => {
            if (node.children && Array.isArray(node.children)) {
                node.children.forEach(childId => {
                    newEdges.push({ from: node.id, to: childId, id: `${node.id}-${childId}` });
                });
            }
        });
        edges.add(newEdges);
    }

    // Initial Reconstruction
    reconstructEdges();

    function saveSkillTree() {
        // Only save nodes
        const data = {
            nodes: nodes.get()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    // Auto-save on node changes
    nodes.on('*', () => {
        saveSkillTree();
    });

    const container = document.getElementById('mynetwork');
    let skillTree;
    if (container) {
        skillTree = new SkillTree(nodes, edges, container, options);
    }

    // --- State Management ---
    let selectedNodeId = null;
    let selectedNodeLabel = "None";

    // Multi-Parent Selection State
    let isSelectionMode = false;
    let selectedParentIds = new Set();

    // --- Selection Logic ---
    let lastSelectedNodeId = null;

    if (skillTree) {
        skillTree.on('click', function (params) {
            // Handle Deselection / Reset Previous Glow
            if (lastSelectedNodeId !== null && (!params.nodes.length || params.nodes[0] !== lastSelectedNodeId)) {
                const prevNode = nodes.get(lastSelectedNodeId);
                if (prevNode) {
                    if (prevNode.isBaseNode) {
                        prevNode.shadow = BASE_NODE_STYLE.shadow;
                    } else {
                        // Revert to global default (by removing specific shadow property or setting to default)
                        // If we set to null, it uses options.nodes.shadow
                        prevNode.shadow = undefined;
                    }
                    nodes.update(prevNode);
                }
                lastSelectedNodeId = null;
            }

            if (params.nodes.length > 0) {
                const clickedId = params.nodes[0];
                const clickedNode = nodes.get(clickedId);
                lastSelectedNodeId = clickedId;

                if (isSelectionMode) {
                    // Toggle selection for Parent
                    if (selectedParentIds.has(clickedId)) {
                        selectedParentIds.delete(clickedId);
                    } else {
                        selectedParentIds.add(clickedId);
                    }
                    updateParentDisplay();
                } else {
                    // Normal Selection - Apply Glow
                    selectedNodeId = clickedId;
                    selectedNodeLabel = clickedNode ? clickedNode.label : "Unknown";

                    // Apply Glow Shadow
                    const glowColor = clickedNode.color.border || '#ffffff';
                    clickedNode.shadow = {
                        enabled: true,
                        color: glowColor,
                        size: 30, // Big glow
                        x: 0,
                        y: 0
                    };
                    nodes.update(clickedNode);

                    // Update Toolbar UI
                    const displayEl = document.querySelector('#selected-skill');
                    if (displayEl) displayEl.textContent = selectedNodeLabel;
                    console.log("Selected:", selectedNodeLabel, selectedNodeId);
                }
            } else {
                if (!isSelectionMode) {
                    // Deselect
                    selectedNodeId = null;
                    selectedNodeLabel = "None";
                    const displayEl = document.querySelector('#selected-skill');
                    if (displayEl) displayEl.textContent = "None";
                }
            }
        });
    }

    function updateParentDisplay() {
        const displayList = document.querySelector('#parent-list-display');
        const baseNodeOption = document.querySelector('#base-node-option');
        const isBaseCheck = document.querySelector('#is-base-node-check');

        // Logic for Base Node Toggle Visibility
        if (baseNodeOption) {
            if (selectedParentIds.size === 0) {
                baseNodeOption.classList.remove('hidden');
            } else {
                baseNodeOption.classList.add('hidden');
                if (isBaseCheck) isBaseCheck.checked = false; // Uncheck if hidden
            }
        }

        if (!displayList) return;

        if (selectedParentIds.size === 0) {
            displayList.textContent = "None";
            return;
        }

        const names = [];
        selectedParentIds.forEach(id => {
            const n = nodes.get(id);
            if (n) names.push(n.label);
        });
        displayList.textContent = names.join(", ");
    }

    // --- Add Skill Panel Logic ---
    const addSkillBtn = document.querySelector('#addSkillBtn');
    if (addSkillBtn) {
        addSkillBtn.addEventListener('click', () => {
            const addSkillPanel = document.querySelector('#add-skill-panel');

            if (addSkillPanel) {
                if (addSkillPanel.classList.contains('hidden')) {
                    addSkillPanel.classList.remove('hidden');

                    // Reset Selection Mode on Open
                    isSelectionMode = false;
                    selectedParentIds.clear();

                    // Auto-select current node if one was selected
                    if (selectedNodeId !== null) {
                        selectedParentIds.add(selectedNodeId);
                    }
                    updateParentDisplay(); // Updates toggle visibility
                    updateSelectionModeUI();

                } else {
                    addSkillPanel.classList.add('hidden');
                    isSelectionMode = false; // Turn off when closing
                    updateSelectionModeUI();
                }
            }
        });
    }

    // Toggle Selection Mode Button
    const toggleSelectBtn = document.querySelector('#toggle-parent-select-btn');
    if (toggleSelectBtn) {
        toggleSelectBtn.addEventListener('click', () => {
            isSelectionMode = !isSelectionMode;
            updateSelectionModeUI();
        });
    }

    function updateSelectionModeUI() {
        const indicator = document.querySelector('#selection-mode-indicator');
        const btn = document.querySelector('#toggle-parent-select-btn');
        if (indicator) {
            if (isSelectionMode) indicator.classList.remove('hidden');
            else indicator.classList.add('hidden');
        }
        if (btn) {
            btn.textContent = isSelectionMode ? "Done Selecting" : "Select Parents";
            btn.style.background = isSelectionMode ? "rgba(255, 215, 0, 0.3)" : "";
        }
    }

    // --- Create Skill Logic ---
    const createSkillBtn = document.querySelector('#create-skill-btn');
    if (createSkillBtn) {
        createSkillBtn.addEventListener('click', () => {
            console.log("Create Skill Button Clicked");
            const nameInput = document.querySelector('#new-skill-input');
            const shapeSelect = document.querySelector('#new-skill-shape');
            const colorSelect = document.querySelector('#new-skill-color');
            const addSkillPanel = document.querySelector('#add-skill-panel');
            const isBaseCheck = document.querySelector('#is-base-node-check');

            // Size Slider
            const sizeInput = document.querySelector('#new-skill-size');
            let size = sizeInput ? parseInt(sizeInput.value) : 20;

            if (!nameInput || !nameInput.value.trim()) {
                alert("Please enter a skill name.");
                return;
            }

            const name = nameInput.value.trim();
            const shape = shapeSelect ? shapeSelect.value : 'circle';
            const colorKey = colorSelect ? colorSelect.value : 'normal';
            let colorStyle = COLOR_PRESETS[colorKey] || COLOR_PRESETS.normal;

            // Base Node Override
            let isBase = false;
            let finalShape = shape;
            let finalSize = size;
            let finalColor = colorStyle;
            let finalShadow = options.nodes.shadow; // Default shadow

            if (isBaseCheck && isBaseCheck.checked && selectedParentIds.size === 0) {
                // Apply Base Node Styles
                isBase = true;
                finalShape = BASE_NODE_STYLE.shape;
                finalSize = BASE_NODE_STYLE.size;
                finalColor = BASE_NODE_STYLE.color;
                finalShadow = BASE_NODE_STYLE.shadow;
            }

            // Generate ID
            const allIds = nodes.getIds();
            const newId = allIds.length > 0 ? Math.max(...allIds) + 1 : 1;

            // Construct New Node Object
            const newNode = {
                id: newId,
                label: name,
                shape: finalShape,
                size: finalSize,
                color: finalColor,
                font: { color: 'white' }, // Force white font for visibility
                children: [],
                isBaseNode: isBase,
                shadow: finalShadow,
                rank: colorKey // Save the Rank ID (e.g., 'epic', 'rare')
            };

            // Add to dataset
            try {
                nodes.add(newNode);
                console.log("Node added:", newNode);

                // Update Parents
                if (selectedParentIds.size > 0) {
                    selectedParentIds.forEach(parentId => {
                        const parentNode = nodes.get(parentId);
                        if (parentNode) {
                            if (!parentNode.children) parentNode.children = [];
                            parentNode.children.push(newId);
                            nodes.update(parentNode); // Update parent to save children
                        }
                    });
                }

                // Reconstruct Edges & Save
                reconstructEdges();
                saveSkillTree();

                // Reset UI
                nameInput.value = "";
                if (isBaseCheck) isBaseCheck.checked = false;
                addSkillPanel.classList.add('hidden');
                isSelectionMode = false;
                selectedParentIds.clear();
                updateSelectionModeUI();

            } catch (err) {
                console.error("Error adding node:", err);
                alert("Error adding node. Check console.");
            }
        });
    }

    // --- Remove Skill Logic ---
    const removeSkillBtn = document.querySelector('#removeSkillBtn');
    if (removeSkillBtn) {
        removeSkillBtn.addEventListener('click', () => {
            if (selectedNodeId !== null) {
                if (confirm(`Are you sure you want to delete "${selectedNodeLabel}"?`)) {
                    const idToRemove = selectedNodeId;

                    // 1. Remove Node
                    nodes.remove(idToRemove);

                    // 2. Remove references from other nodes (parents)
                    const allNodes = nodes.get();
                    const updates = [];
                    allNodes.forEach(node => {
                        if (node.children && node.children.includes(idToRemove)) {
                            node.children = node.children.filter(id => id !== idToRemove);
                            updates.push(node);
                        }
                    });
                    if (updates.length > 0) nodes.update(updates);

                    // 3. Reconstruct Edges
                    reconstructEdges();
                    saveSkillTree();

                    // Reset selection
                    selectedNodeId = null;
                    selectedNodeLabel = "None";
                    const displayEl = document.querySelector('#selected-skill');
                    if (displayEl) displayEl.textContent = "None";

                    console.log("Deleted node and cleaned references.");
                }
            } else {
                alert("Please select a skill to remove.");
            }
        });
    }

    // --- UI Toggle for Control Panel (The + button) ---
    const addSkillPanelOpen = document.querySelector('#add-skill-panel-open');
    if (addSkillPanelOpen) {
        addSkillPanelOpen.addEventListener('click', () => {
            openAddSkillPanel();
        });
    }

    // --- Slider Value Listener ---
    const sizeInput = document.querySelector('#new-skill-size');
    const sizeValue = document.querySelector('#new-skill-size-value');
    if (sizeInput && sizeValue) {
        sizeInput.addEventListener('input', (e) => {
            sizeValue.textContent = e.target.value;
        });
    }

    function openAddSkillPanel() {
        const skillPanel = document.querySelector('#skill-panel-1');
        const toggleBtn = document.querySelector('#add-skill-panel-open');

        if (skillPanel && toggleBtn) {
            if (skillPanel.classList.contains('hidden')) {
                skillPanel.classList.remove('hidden');
                toggleBtn.innerHTML = "<i class='fa-solid fa-times'></i>";
            } else {
                skillPanel.classList.add('hidden');
                toggleBtn.innerHTML = "<i class='fa-solid fa-plus'></i>";
            }
        }
    }

});
