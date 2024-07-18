import { CoinsComponent, MonstersComponent, InputComponent } from '../dist/components.js';
export function init(entity) {
    const monstersComponent = entity.getComponent('MonstersComponent');
    const monstersContainer = document.getElementById('monsters-container');

    // Populate monsters tab
    populateMonsters(monstersComponent, monstersContainer);

    // Add tab switching functionality
    initializeTabs();

    // Add buy button functionality
    initializeBuyButtons(entity);
};

function initializeTabs() {
    const tabs = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');

            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(`${tabName}-container`).classList.add('active');
        });
    });
};

function initializeBuyButtons(entity) {
    const inputComponent = entity.getComponent(InputComponent);
    const monstersComponent = entity.getComponent(MonstersComponent);

    document.querySelectorAll('.buy-button').forEach(button => {
        button.replaceWith(button.cloneNode(true));
        button.addEventListener('click', (e) => {
            const monsterId = e.target.getAttribute('data-id');
            const price = monstersComponent.getMonsterById(monsterId).price;
            inputComponent.addInput("upgrade", { monsterId, price });
            console.log(`Buying monster with ID: ${monsterId}`);
        });
    });
};

function populateMonsters(monstersComponent, container) {
    if (!monstersComponent.items || monstersComponent.items.length === 0) {
        container.innerHTML = '<p>No monsters available.</p>';
        return;
    }

    const monsterItems = monstersComponent.items.map(renderMonsterItem).join('');
    container.innerHTML = monsterItems;
}

function renderMonsterItem(monster) {
    return `
        <div class="shop-item monster-item">
            <img src="images/monsters/${monster.image}" alt="${monster.name}" class="monster-image">
            <h4>${monster.name}</h4>
            <p class="monster-income">Profit per hour: ${monster.incomePerHour}</p>
            <div class="level-price-container">
                <span class="monster-level">lvl ${monster.level}</span>
                <button class="buy-button" data-id="${monster.id}">${monster.price}</button>
            </div>
        </div>
    `;
}

export function render(entity) {
    const monstersContainer = document.getElementById('monsters-container');
    const monsters = entity.getComponent(MonstersComponent);
    const coins = entity.getComponent(CoinsComponent);

    // Update monster items
    monsters.items.forEach(monster => {
        const monsterElement = monstersContainer.querySelector(`.monster-item [data-id="${monster.id}"]`).closest('.monster-item');
        if (monsterElement) {
            // Update level
            const levelElement = monsterElement.querySelector('.monster-level');
            if (levelElement) {
                levelElement.textContent = `lvl ${monster.level}`;
            }

            // Update income
            const incomeElement = monsterElement.querySelector('.monster-income');
            if (incomeElement) {
                incomeElement.textContent = `Profit per hour: ${monster.incomePerHour}`;
            }

            // Update price
            const buyButton = monsterElement.querySelector('.buy-button');
            if (buyButton) {
                buyButton.textContent = monster.price;
                const canAfford = coins.amount >= monster.price;
                buyButton.disabled = !canAfford;
            }
        }
    });

    // Update coins and passive income display
    const coinsComponent = entity.getComponent('CoinsComponent');
    const passiveIncomeComponent = entity.getComponent('PassiveIncomeComponent');
    document.getElementById('coins').textContent = Math.floor(coinsComponent.amount);
    document.getElementById('passiveIncome').textContent = passiveIncomeComponent.incomePerHour;
}