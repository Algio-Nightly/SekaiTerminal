class Quest {
    constructor(id, title, description, objectives, stats, difficulty, rewards) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.objectives = objectives;
        this.stats = stats
        this.difficulty = difficulty;
        this.rewards = rewards;
    }
}

let Quests = [];

function saveQuests() {
    localStorage.setItem('Quests', JSON.stringify(Quests));
}

function loadQuests() {
    Quests = JSON.parse(localStorage.getItem('Quests')) || [];
}

loadQuests();


function displayQuests(filterText = "") {
    const questContainer = document.querySelector('.quest-container');
    questContainer.innerHTML = '';

    // Filter quests based on title
    const filteredQuests = Quests.filter(quest =>
        quest.title.toLowerCase().includes(filterText.toLowerCase())
    );

    filteredQuests.forEach((quest) => {
        const questBox = document.createElement('div');
        questBox.classList.add('glass-panel', 'quest-box', 'quest-card');
        questBox.dataset.id = quest.id;
        questBox.innerHTML = `
            <div class="quest-header">
                <div>
                    <div class="quest-meta">
                        <span class="quest-rank">RANK ${quest.difficulty}</span>
                        <span class="quest-type"><i class="fa-solid fa-circle-exclamation"></i> Main Scenario</span>
                    </div>
                    <h1 class="quest-title">${quest.title}</h1>
                </div>
            </div>
            <div class="quest-body">
                <div class="quest-description">
                    <p class="quest-text">
                        ${quest.description}
                    </p>
                </div>
                <div class="quest-objectives">
                    <h3 class="section-title">Current Objectives</h3>
                    ${quest.objectives.map((objective) => `
                        <div class="objective-item">
                            <input type="checkbox" name="objective" id="objective-${quest.id}-${objective.replace(/\s+/g, '')}"> 
                            <label for="objective-${quest.id}-${objective.replace(/\s+/g, '')}"><span class="objective-text objective-done">${objective}</span></label>
                        </div>
                    `).join('')}
                </div>
                <div class="quest-rewards">
                        <h3 class="section-title">Rewards</h3>
                        <div class="quest-rewards-list">
                            <div class="reward-pill reward-xp">
                                <i class="fa-solid fa-star" style="color: var(--accent-color);"></i>
                                <span class="reward-xp-text">${quest.rewards.xp} XP</span>
                            </div>
                            ${Object.entries(quest.rewards.skillPoints || {})
                .filter(([key, value]) => value > 0)
                .map(([key, value]) => `
                                <div class="reward-pill reward-skill">
                                    <i class="fa-solid fa-circle-plus" style="color: var(--accent-secondary);"></i>
                                    <span class="reward-skill-text">${value} ${key}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="quest-footer">
                        <button class="btn btn-glass btn-abandon" >Abandon</button>
                        <button class="btn btn-primary btn-complete">Complete Quest</button>
                    </div>
                </div>
            </div>
        `;
        questContainer.appendChild(questBox);
    });
}
displayQuests();

// Search Functionality
const searchInput = document.querySelector('.quest-search input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        displayQuests(e.target.value);
    });
}

// Add Quest Window Toggle
const addQuestBtn = document.querySelector('.btn-add-quest');
const closeQuestBtn = document.querySelector('.btn-close-quest');
const addQuestTerminal = document.querySelector('.quest-add-terminal');

function toggleQuestWindow() {
    if (addQuestTerminal) {
        addQuestTerminal.classList.toggle('hidden');
    }
}

if (addQuestBtn) {
    addQuestBtn.addEventListener('click', toggleQuestWindow);
}

if (closeQuestBtn) {
    closeQuestBtn.addEventListener('click', toggleQuestWindow);
}

statsSelector = ["Health", "Knowledge", "Stamina", "Strength", "Dexterity", "Intelligence"];

// --- STATE MANAGEMENT ---

let questData = {
    id: "",
    title: "",
    description: "",
    difficulty: 0,
    objectives: [],
    stats: [],
    rewards: {
        xp: 0,
        skillPoints: {
            Health: 0,
            Knowledge: 0,
            Stamina: 0,
            Strength: 0,
            Dexterity: 0,
            Intelligence: 0
        }
    }
};
function resetQuestData() {
    let defaultData = {
        id: "",
        title: "",
        description: "",
        difficulty: 0,
        objectives: [],
        stats: [],
        rewards: {
            xp: 0,
            skillPoints: {
                Health: 0,
                Knowledge: 0,
                Stamina: 0,
                Strength: 0,
                Dexterity: 0,
                Intelligence: 0
            }
        }
    };;
    return defaultData

}
const addQuestForm = document.querySelector('.quest-add-terminal-form');

addQuestForm.addEventListener('submit', (e) => {
    e.preventDefault();
    questData.id = Math.random().toString(36).substring(2, 9);
    questData.title = document.getElementById('quest-title').value;
    questData.description = document.getElementById('quest-description').value;
    questData.difficulty = parseInt(document.getElementById('quest-difficulty').value);
    questData.rewards.xp = questData.difficulty * 100;
    for (let i = 0; i < questData.stats.length; i++) {
        questData.rewards.skillPoints[questData.stats[i]] += questData.difficulty;
    }
    const quest = new Quest(questData.id, questData.title, questData.description, questData.objectives, questData.stats, questData.difficulty, questData.rewards);
    console.log(quest);
    Quests.push(quest);
    saveQuests();
    displayQuests();
    addQuestForm.reset();
    questData = resetQuestData()
    showPopup("Quest Added Successfully!");
});

function addObjective() {
    const inputField = document.getElementById('quest-objectives');
    const value = inputField.value.trim();
    if (!value) return;
    questData.objectives.push(value);
    inputField.value = '';
    renderObjectives();
}

function renderObjectives() {
    const container = document.querySelector('.objectives-select');
    const oldItems = container.querySelectorAll('.added-item');
    oldItems.forEach(item => item.remove());

    questData.objectives.forEach((text, index) => {
        const row = document.createElement('div');
        row.className = 'objective-input added-item';
        row.style.marginTop = '10px';
        row.innerHTML = `
            <input type="text" value="${text}" readonly style="opacity: 0.8">
            <button class="btn btn-glass" onclick="removeObjective(${index})">
                <i class="fa-solid fa-trash" style="color: #ff6b6b;"></i>
            </button>
        `;

        container.appendChild(row);
    });

    console.log("Current Objectives:", questData.objectives);
}

function removeObjective(index) {
    questData.objectives.splice(index, 1);
    renderObjectives();
}

const availableStats = [
    "Health",
    "Knowledge",
    "Stamina",
    "Strength",
    "Dexterity",
    "Intelligence"
];

document.addEventListener('DOMContentLoaded', () => {
    populateStatDropdown();
});

function populateStatDropdown() {
    const select = document.getElementById('quest-stats');

    availableStats.forEach(statName => {
        const option = document.createElement('option');
        option.value = statName;
        option.textContent = statName;
        select.appendChild(option);
    });
}

function addStat() {
    const select = document.getElementById('quest-stats');
    const selectedValue = select.value;

    if (!selectedValue) return showPopup("Please select a stat first.");
    if (questData.stats.includes(selectedValue)) return showPopup("Stat already added!");
    questData.stats.push(selectedValue);
    select.value = "";
    renderStats();
}

function renderStats() {
    const container = document.querySelector('.stats-select');

    // Clear old added items (Using the same class strategy)
    const oldItems = container.querySelectorAll('.added-item');
    oldItems.forEach(item => item.remove());

    questData.stats.forEach((statName, index) => {
        const row = document.createElement('div');
        row.className = 'objective-input added-item';
        row.style.marginTop = '10px';

        row.innerHTML = `
            <input type="text" value="${statName}" readonly style="opacity: 0.8; color: #ffd700;">
            
            <button class="btn btn-glass" onclick="removeStat(${index})">
                <i class="fa-solid fa-trash" style="color: #ff6b6b;"></i>
            </button>
        `;

        container.appendChild(row);
    });

    console.log("Current Stats:", questData.stats);
}

function removeStat(index) {
    questData.stats.splice(index, 1);
    renderStats();
}


document.addEventListener('click', (e) => {
    const abandonBtn = e.target.closest('.btn-abandon');
    const completeBtn = e.target.closest('.btn-complete');

    if (!abandonBtn && !completeBtn) return;
    const btn = abandonBtn || completeBtn;
    const questCard = btn.closest('.quest-card');

    if (!questCard) {
        console.error("Could not find parent quest card");
        return;
    }
    const questId = questCard.dataset.id;
    console.log("Interact Quest ID:", questId);

    // Find the actual quest object before removing it (CRITICAL FIX)
    // Use loose equality == to match string ID with potentially number ID
    const completedQuest = Quests.find(q => q.id == questId);

    if (abandonBtn) {
        Quests = Quests.filter(q => q.id != questId);
        showPopup("Quest abandoned.");
    }
    else if (completeBtn) {
        if (completedQuest) {
            try {
                // Apply rewards to the persistent user object
                console.log("Completing quest, rewards:", completedQuest.rewards);
                if (typeof user !== 'undefined') {
                    user.addQuestRewards(completedQuest.rewards);
                    if (typeof saveUser === 'function') saveUser();
                    showPopup(`Quest completed! +${completedQuest.rewards.xp} XP`);
                } else {
                    console.error("User object missing in quest.js scope");
                    showPopup("Error: User profile not found.");
                }
            } catch (err) {
                console.error("Error applying rewards:", err);
                showPopup("Error: Failed to apply rewards.");
            }
        } else {
            console.error("Quest data not found for id:", questId);
            showPopup("Error: Quest data missing.");
        }
        Quests = Quests.filter(q => q.id != questId);
    }
    saveQuests();
    displayQuests();
});

