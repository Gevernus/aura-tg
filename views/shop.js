import { CoinsComponent, MonstersComponent, InputComponent, PacksComponent, UserComponent, StarsComponent, InventoryComponent, EnergyComponent, PassiveIncomeComponent, ClickPowerComponent } from '../dist/components.js';
export function init(entity) {
    // Populate monsters tab
    populateMonsters(entity);

    populatePacks(entity);

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

    document.querySelectorAll('.buy-monster').forEach(button => {
        button.addEventListener('click', (e) => {
            const monsterId = e.target.getAttribute('data-id');
            const price = monstersComponent.getMonsterById(monsterId).price;
            inputComponent.addInput("upgrade", { monsterId, price });
            console.log(`Buying monster with ID: ${monsterId}`);
        });
    });
};

function populateMonsters(entity) {
    const monstersComponent = entity.getComponent('MonstersComponent');
    const container = document.getElementById('monsters-container');
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
                <button class="buy-button buy-monster" data-id="${monster.id}">${monster.price}</button>
            </div>
        </div>
    `;
}

function populatePacks(entity) {
    const packsComponent = entity.getComponent(PacksComponent);
    const container = document.getElementById('cards-container');
    if (!packsComponent.items || packsComponent.items.length === 0) {
        container.innerHTML = '<p>No packs available.</p>';
        return;
    }

    const packItems = packsComponent.items.map(renderPackItem).join('');
    container.innerHTML = packItems;
    addPackEventListeners(entity);
}

function renderPackItem(pack) {
    return `
        <div class="pack">
            <img src="images/packs/${pack.image}" alt="${pack.name}">
            <button class="buy-button open-pack" data-id="${pack.id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="telegram-stars">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2">
                    </polygon>
                </svg>
                <span class="price">${pack.price}</span>
            </button>
        </div>
    `;
}

function addPackEventListeners(entity) {
    const userComponent = entity.getComponent(UserComponent);
    const stars = entity.getComponent(StarsComponent);
    const openPackButtons = document.querySelectorAll('.open-pack');
    const modal = document.getElementById('packModal');
    const closeButton = modal.querySelector('.close-btn');
    const packItems = document.getElementById('packItems');

    openPackButtons.forEach(button => {
        button.addEventListener('click', async function () {
            const packId = this.getAttribute('data-id');
            const state = await openPack(entity, userComponent.user.id, packId, packItems, modal);
            stars.amount = state.stars;
        });
    });

    closeButton.addEventListener('click', function () {
        modal.style.display = 'none';
    });
}

async function openPack(entity, userId, packId, packItems, modal) {
    const response = await fetch(`/api/${userId}/purchase/${packId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to purchase pack');
    }

    const data = await response.json();

    // Clear previous items
    packItems.innerHTML = '';

    const inventoryComponent = entity.getComponent(InventoryComponent);
    const monstersComponent = entity.getComponent(MonstersComponent);
    const energyComponent = entity.getComponent(EnergyComponent);
    const passiveIncomeComponent = entity.getComponent(PassiveIncomeComponent);
    const clickPowerComponent = entity.getComponent(ClickPowerComponent);

    inventoryComponent.addItems(data.items);
    energyComponent.calculate(inventoryComponent.items);
    passiveIncomeComponent.calculate(monstersComponent.items, inventoryComponent.items);
    clickPowerComponent.calculate(inventoryComponent.items);

    // Add new items
    data.items.forEach((item, index) => {
        console.log(item);
        const itemElement = document.createElement('div');
        itemElement.className = 'card-wrapper';
        itemElement.innerHTML = `
            <div class="card-item" id="card${index + 1}">
                <div class="front"></div>
                <div class="back" style="background-image: url('images/items/${item.item.image}');"></div>
            </div>
            <div class="description" id="desc${index + 1}">${item.item.name}</div>
        `;
        const cardItem = itemElement.querySelector('.card-item');
        cardItem.addEventListener('click', () => {
            if (!cardItem.classList.contains('flipped')) {
                cardItem.classList.add('flipped');
                itemElement.classList.add('flipped');
                // Optional: Disable further clicks
                cardItem.style.pointerEvents = 'none';
            }
        });
        // Add rarity class to the card-wrapper
        itemElement.classList.add(item.rarity);

        packItems.appendChild(itemElement);
    });

    // Show the modal
    modal.style.display = 'block';
    return data.state;
}

export function render(entity) {
    const monstersContainer = document.getElementById('monsters-container');
    const monsters = entity.getComponent(MonstersComponent);
    const coins = entity.getComponent(CoinsComponent);

    // Update monster items
    monsters.items.forEach(monster => {
        const monsterElement = monstersContainer.querySelector(`.shop-item.monster-item:has([data-id="${monster.id}"])`);

        if (monsterElement) {
            if (monsterElement.querySelector('.monster-level').textContent != `lvl ${monster.level}`) {
                console.log(`Update ${monsterElement.querySelector('.monster-level').textContent} with ${`lvl ${monster.level}`}`);
                monsterElement.querySelector('.monster-level').textContent = `lvl ${monster.level}`;
            }

            monsterElement.querySelector('p.monster-income').textContent = `Profit per hour: ${monster.incomePerHour}`;
            const buyButton = monsterElement.querySelector('.buy-button');
            buyButton.textContent = monster.price;
            buyButton.disabled = coins.amount < monster.price;
        }
    });

    // Update coins and passive income display
    const coinsComponent = entity.getComponent('CoinsComponent');
    const starsComponent = entity.getComponent('StarsComponent');
    const passiveIncomeComponent = entity.getComponent('PassiveIncomeComponent');
    document.getElementById('coins').textContent = Math.floor(coinsComponent.amount);
    document.getElementById('passiveIncome').textContent = passiveIncomeComponent.incomePerHour;
    document.querySelector('.stars-amount').textContent = starsComponent.amount;
}