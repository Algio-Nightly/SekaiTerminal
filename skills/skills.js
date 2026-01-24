document.addEventListener('DOMContentLoaded', () => {
    class SkillTree extends vis.Network {
        constructor(nodes, edges, container, options) {
            super(container, { nodes, edges }, options);
        }
    }
    class SkillNode {
        constructor(id, label, shape, size, color, font) {
            this.id = id;
            this.label = label;
            this.shape = shape;
            this.size = size;
            this.color = color;
            this.font = font;
        }
    }

    const SKILL_NODE_COLOR = {
        background: 'rgba(240, 240, 240, 0.18)',
        border: '#94a3b8',
        highlight: { background: 'rgba(240, 240, 240, 0.1)', border: '#ffffffff' }
    };
    const BASE_SKILL_NODE_COLOR = {
        background: 'rgba(240, 240, 240, 0.18)',
        border: '#94a3b8',
        highlight: { background: 'rgba(240, 240, 240, 0.1)', border: '#ff0000ff' }
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
    const nodes = new vis.DataSet([
        new SkillNode(1, 'Skill 1', 'circle', 20, SKILL_NODE_COLOR, { color: 'white', borderColor: SKILL_NODE_COLOR }),
        new SkillNode(2, 'Skill 2', 'circle', 20, BASE_SKILL_NODE_COLOR, { color: 'white', borderColor: BASE_SKILL_NODE_COLOR }),
        new SkillNode(3, 'Skill 3', 'circle', 20, SKILL_NODE_COLOR, { color: 'white', borderColor: SKILL_NODE_COLOR }),
    ]);

    const edges = new vis.DataSet([
        { from: 1, to: 2 },
        { from: 2, to: 3 }
    ]);

    const container = document.getElementById('mynetwork');
    if (container) {
        const options = {
            nodes: {
                shape: 'circle',
                size: 20,
                color: SKILL_NODE_COLOR,
                font: { color: 'white' },
            },
            edges: {
                width: 2,
                color: 'gray',
            },
        };

        const skillTree = new SkillTree(nodes, edges, container, options);
    }

    const addSkillBtn = document.querySelector('#addSkillBtn');
    if (addSkillBtn) {
        addSkillBtn.addEventListener('click', () => {
            const addSkillPanel = document.querySelector('#add-skill-panel');
            if (addSkillPanel) {
                if (addSkillPanel.classList.contains('hidden')) {
                    addSkillPanel.classList.remove('hidden');
                } else {
                    addSkillPanel.classList.add('hidden');
                }
            }
        });
    }
    let selectedSkill = null;
    skillTree.on('click', function (params) {
        if (params.nodes.length > 0) {
            selectedSkill = params.nodes[0];
            document.querySelector('#selected-skill').textContent = selectedSkill;
            console.log(selectedSkill);
        }
    });
    
    
    
    const addSkillPanelOpen = document.querySelector('#add-skill-panel-open');
    if (addSkillPanelOpen) {
        addSkillPanelOpen.addEventListener('click', () => {
            openAddSkillPanel();
        });
    }
    
    function openAddSkillPanel() {
        const skillPanel = document.querySelector('#skill-panel-1');
        const toggleBtn = document.querySelector('#add-skill-panel-open');
    
        if (skillPanel && toggleBtn) {
            if (skillPanel.classList.contains('hidden')) {
                skillPanel.classList.remove('hidden');
                toggleBtn.innerHTML = "<i class='fa-solid fa-times'></i>"; // Changed to times for close
            } else {
                skillPanel.classList.add('hidden');
                toggleBtn.innerHTML = "<i class='fa-solid fa-plus'></i>";
            }
        }
    }
});
