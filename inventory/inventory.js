
document.addEventListener('DOMContentLoaded', () => {
    calculateAndRenderStats();
});

function calculateAndRenderStats() {
    const savedData = JSON.parse(localStorage.getItem('seki_skill_tree_v2'));

    // Debugging: Log what we found
    console.log("Inventory: Loaded seki_skill_tree_v2", savedData);

    if (!savedData) {
        // Fallback or Empty State
        const container = document.getElementById('base-stats-container');
        if (container) {
            container.innerHTML = '<div style="color: grey; padding: 20px;">No skill tree data found. Visit the Skill Tree to initialize system.</div>';
        }
        return;
    }

    let nodes = [];
    let edges = [];

    if (Array.isArray(savedData.nodes)) {
        nodes = savedData.nodes;
    } else if (savedData.nodes && typeof savedData.nodes === 'object') {
        console.warn("Nodes is not an array, checking structure", savedData.nodes);
        nodes = Object.values(savedData.nodes); // Try to convert object to array if needed
    }

    if (Array.isArray(savedData.edges)) {
        edges = savedData.edges;
    } else if (savedData.edges && typeof savedData.edges === 'object') {
        edges = Object.values(savedData.edges);
    }

    console.log("Inventory: Processing Nodes", nodes);

    // 1. Identify Base Nodes and Initialize Stats
    const baseNodeStats = {};
    nodes.filter(n => n.isBaseNode || n.label === 'System').forEach(n => {
        baseNodeStats[n.id] = {
            id: n.id,
            label: n.label,
            totalXP: 0,
            nodeCount: 0
        };
    });

    console.log("Inventory: Base Nodes Found", baseNodeStats);

    // 2. Build Parent Map (Reverse Edges)
    // Since edges are not saved in localStorage by skills.js (only nodes), we must reconstruct them from node.children
    const parentMap = {};

    nodes.forEach(node => {
        if (node.children && Array.isArray(node.children)) {
            node.children.forEach(childId => {
                // Edge: Node (Parent) -> Child
                // ParentMap: Child -> [Parents]
                if (!parentMap[childId]) parentMap[childId] = [];
                parentMap[childId].push(node.id);
            });
        }
    });

    console.log("Inventory: Reconstructed Parent Map", parentMap);

    // 3. Propagation Logic
    nodes.forEach(node => {
        // XP Value: 20 per node (Tier 1 approx)
        const nodeBaseXP = 20;

        // Propagate this 20 XP upwards
        propagateXP(node.id, nodeBaseXP, [], edges, baseNodeStats, parentMap);
    });

    console.log("Inventory: Final Stats", baseNodeStats);

    // 4. Render
    renderBaseCards(baseNodeStats);
}

function propagateXP(currentNodeId, xpAmount, visitedPath, edges, baseNodeStats, parentMap) {
    if (visitedPath.includes(currentNodeId)) return;

    // If current node is a Base Node, collect XP
    if (baseNodeStats[currentNodeId]) {
        baseNodeStats[currentNodeId].totalXP += xpAmount;
        baseNodeStats[currentNodeId].nodeCount += 1;
        return;
    }

    const parents = parentMap[currentNodeId];

    // Warn if orphan (no parents and not base)
    if (!parents || parents.length === 0) {
        // console.warn("Orphaned Node detected (No path to Base):", currentNodeId);
        return;
    }

    const splitAmount = xpAmount / parents.length;

    parents.forEach(parentId => {
        propagateXP(parentId, splitAmount, [...visitedPath, currentNodeId], edges, baseNodeStats, parentMap);
    });
}

// --- Class Icon Mapping ---
const CLASS_ICONS = {
    'System': 'fa-dragon',
    'Magic': 'fa-hat-wizard',
    'Combat': 'fa-khanda',
    'Tech': 'fa-microchip',
    'Science': 'fa-flask',
    'Life': 'fa-leaf',
    'Stealth': 'fa-user-ninja',
    'Social': 'fa-comments'
};

function renderBaseCards(statsObj) {
    const container = document.getElementById('base-stats-container');
    if (!container) return;

    container.innerHTML = '';

    // Inject Styles for Animation
    const styleId = 'inventory-stat-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            @keyframes progress-stripe {
                0% { background-position: 1rem 0; }
                100% { background-position: 0 0; }
            }
            .progress-striped {
                background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
                background-size: 1rem 1rem;
                animation: progress-stripe 1s linear infinite;
            }
            .stat-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(0,0,0,0.3) !important;
                border-color: rgba(255,255,255,0.2) !important;
            }
        `;
        document.head.appendChild(style);
    }

    const statsArray = Object.values(statsObj);

    if (statsArray.length === 0) {
        container.innerHTML = '<div style="color: var(--text-muted); padding: 20px; grid-column: 1 / -1; text-align: center;">No Active Classes found. Unlock a Base Node in the Skill Tree.</div>';
        return;
    }

    statsArray.forEach(stat => {
        // --- Iterative Leveling Logic ---
        // Formula: Req for Next Level = 100 + (CurrentLevel * 10)
        let level = 1;
        let relativeXP = stat.totalXP;
        let nextLevelReq = 100 + (level * 10); // Lvl 1 -> 2 needs 110 XP

        while (relativeXP >= nextLevelReq) {
            relativeXP -= nextLevelReq;
            level++;
            nextLevelReq = 100 + (level * 10);
        }

        const percentage = Math.min((relativeXP / nextLevelReq) * 100, 100);

        // Icon Selection
        let iconClass = CLASS_ICONS[stat.label] || 'fa-layer-group';

        const card = document.createElement('div');
        card.className = 'glass-panel stat-card';
        card.style.cssText = `
            position: relative;
            overflow: hidden;
            padding: 0;
            display: flex;
            flex-direction: column;
            background: rgba(20, 20, 25, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.05);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            min-height: 140px;
        `;

        card.innerHTML = `
            <div class="card-header" style="
                padding: 15px 20px; 
                background: linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%);
                border-bottom: 1px solid rgba(255,255,255,0.05);
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="
                        width: 36px; height: 36px; 
                        background: var(--accent-color); 
                        border-radius: 8px; 
                        display: flex; align-items: center; justify-content: center;
                        color: rgba(0,0,0,0.8); font-size: 1.1rem;
                        box-shadow: 0 0 15px var(--accent-color-glow, rgba(0,255,255,0.3));
                    ">
                        <i class="fa-solid ${iconClass}"></i>
                    </div>
                    <div>
                        <div style="font-weight: 700; font-size: 0.95rem; letter-spacing: 0.5px; text-transform: uppercase; color: white;">${stat.label}</div>
                        <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">BASE CLASS</div>
                    </div>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted); opacity: 0.7;">
                    <i class="fa-solid fa-cube"></i> ${stat.nodeCount}
                </div>
            </div>
            
            <div class="card-body" style="padding: 20px; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between;">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 12px;">
                    <div style="display: flex; flex-direction: column;">
                         <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">Current Level</span>
                         <span style="font-size: 2.8rem; font-weight: 800; line-height: 0.9; color: white;">${level}</span>
                    </div>
                    <div style="text-align: right; margin-bottom: 5px;">
                         <span style="color: var(--accent-color); font-weight: bold; font-family: 'rajdhani', sans-serif; font-size: 1.1rem;">${Math.round(relativeXP)}</span>
                         <span style="color: #666; font-size: 0.9rem;">/ ${nextLevelReq} XP</span>
                    </div>
                </div>
                
                <div class="progress-track" style="
                    height: 6px; 
                    background: rgba(255,255,255,0.05); 
                    border-radius: 3px; 
                    overflow: hidden; 
                    position: relative;
                ">
                    <div class="progress-striped" style="
                        width: ${percentage}%; 
                        height: 100%; 
                        background-color: var(--accent-color);
                        box-shadow: 0 0 10px var(--accent-color);
                        border-radius: 3px;
                        transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                    "></div>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}
