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

function displayQuests() {
    const questContainer = document.querySelector('.quest-container');
    questContainer.innerHTML = '';
    Quests.forEach((quest) => {
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
                            <div class="checkbox-box checkbox-checked">
                                <i class="fa-solid fa-check" style="color: var(--accent-color); font-size: 0.8rem;"></i>
                            </div>
                            <span class="objective-text objective-done">${objective}</span>
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
displayQuests()
function addQuest() {

}

statsSelector = ["Health", "Mana", "Stamina", "Strength", "Agility", "Intelligence"];

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
            Mana: 0,
            Stamina: 0,
            Strength: 0,
            Agility: 0,
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
                Mana: 0,
                Stamina: 0,
                Strength: 0,
                Agility: 0,
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
    "Mana",
    "Stamina",
    "Strength",
    "Agility",
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
    if (abandonBtn) {
        Quests = Quests.filter(q => q.id !== questId);
        showPopup("Quest abandoned.");
    } 
    else if (completeBtn) {
        Quests = Quests.filter(q => q.id !== questId);
        showPopup("Quest completed! Rewards granted.");
        // Add logic here to actually give the player the XP/Stats
    }
    saveQuests();
    displayQuests(); 
});



