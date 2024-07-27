import { CoinsComponent, MonstersComponent, InputComponent, PacksComponent, UserComponent, InventoryComponent, EnergyComponent, PassiveIncomeComponent, ClickPowerComponent } from '../dist/components.js';
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
            <div class="monster-income">
                <span class="profit-label">Profit per hour:</span>
                <span class="profit-value">${monster.incomePerHour.toFixed(1)}</span>
                <span class="income-increase">(+${monster.incomePerHourNext.toFixed(1)})</span>
            </div>
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
                <svg width="19" height="18.75" viewBox="0 0 84 81" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-190.000000, -73.000000)" fill="#fff"><defs>gradientPlaceholder</defs><path d="M217.584175 95.7198452l10.102137-20.1302773C228.851735 73.2672578 231.669488 72.3342655 233.979937 73.5056713 234.886993 73.9655512 235.620771 74.7092927 236.070698 75.6248193l9.540513 19.41335C246.390574 96.6240434 247.914247 97.7068442 249.661599 97.9165844L269.640156 100.314675C272.352386 100.640233 274.288515 103.114133 273.96462 105.840286 273.831224 106.963049 273.321003 108.006556 272.518147 108.798619l-15.7911 15.578821C256.089452 125.006464 255.780497 125.898568 255.89167 126.789576L258.515919 147.821772C258.891602 150.832711 256.767771 153.579675 253.772209 153.957287 252.636962 154.100393 251.485656 153.881854 250.480518 153.332463L233.796907 144.21349C232.589892 143.553757 231.136827 143.534799 229.913183 144.162822l-17.2854 8.871545C210.195073 154.282929 207.215982 153.312865 205.973797 150.867667 205.509027 149.952785 205.337643 148.915649 205.483212 147.898872L206.864713 138.249309C207.540411 133.529666 210.458736 129.435705 214.68762 127.274973L233.885915 117.465678C234.398537 117.203755 234.602854 116.57373 234.342269 116.058476 234.140381 115.659283 233.708181 115.433429 233.267119 115.496635l-23.479483 3.364749C206.198378 119.375746 202.558336 118.361996 199.744254 116.064306L191.92377 109.678904C189.692048 107.856709 189.352516 104.561073 191.165405 102.317895 192.008458 101.274743 193.218498 100.597614 194.544752 100.426837L214.594132 97.8451554C215.880032 97.679575 217.000319 96.8832795 217.584175 95.7198452z"/></g></g>
                </svg>
                <span class="price">${pack.price}</span>
            </button>
        </div>
    `;
}

function addPackEventListeners(entity) {
    const userComponent = entity.getComponent(UserComponent);
    const openPackButtons = document.querySelectorAll('.open-pack');
    const modal = document.getElementById('packModal');
    const closeButton = modal.querySelector('.close-btn');
    const packItems = document.getElementById('packItems');

    openPackButtons.forEach(button => {
        button.addEventListener('click', async function () {
            const packId = this.getAttribute('data-id');
            await openPack(entity, userComponent.user.id, packId, packItems);
        });
    });

    closeButton.addEventListener('click', function () {
        modal.style.display = 'none';
    });
}

async function openPack(entity, userId, packId, packItems) {
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

    if (data) {
        const inputComponent = entity.getComponent(InputComponent);


        inputComponent.addInput("openLink", {
            url: data.invoiceLink, callback: (status) => {
                try {
                    console.log(`Status of payment is ${status}`);
                    if (status == "paid") {
                        console.log(`Container of items`, packItems);
                        addItems(data.items, packItems);

                        const modal = document.getElementById('packModal');
                        console.log(`Items added, trying to change modal style`, modal);
                        modal.style.display = 'block';
                        const inventoryComponent = entity.getComponent(InventoryComponent);
                        const monstersComponent = entity.getComponent(MonstersComponent);
                        const energyComponent = entity.getComponent(EnergyComponent);
                        const passiveIncomeComponent = entity.getComponent(PassiveIncomeComponent);
                        const clickPowerComponent = entity.getComponent(ClickPowerComponent);
                        inventoryComponent.addItems(data.items);
                        energyComponent.calculate(inventoryComponent.items);
                        clickPowerComponent.calculate(inventoryComponent.items);
                        passiveIncomeComponent.calculate(monstersComponent.items, inventoryComponent.items);

                    }
                } catch (error) {
                    console.error("An error occurred in the openLink callback:", error);
                    // You can add additional error handling here if needed
                }
            }
        });
        return;
    }


    return data.state;
}

function addItems(items, container) {
    container.innerHTML = '';
    items.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'card-wrapper';
        itemElement.innerHTML = `
            <div class="card-item" id="card${index + 1}">
                <div class="front"></div>
                <div class="back" style="background-image: url('images/items/${item.image}');"></div>
            </div>
            <div class="description" id="desc${index + 1}">${item.name}</div>
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
        const className = item.rarity == "Very Rare" ? "very-rare" : item.rarity.toLowerCase();
        itemElement.classList.add(className);

        container.appendChild(itemElement);
    });
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

            const incomeElement = monsterElement.querySelector('.monster-income');
            incomeElement.innerHTML = `
                <span class="profit-label">Profit per hour:</span>
                <span class="profit-value">${monster.incomePerHour.toFixed(1)}</span>
                <span class="income-increase">(+${monster.incomePerHourNext.toFixed(1)})</span>
            `;
            const buyButton = monsterElement.querySelector('.buy-button');
            buyButton.textContent = monster.price;
            buyButton.disabled = coins.amount < monster.price;
        }
    });

    // Update coins and passive income display
    const coinsComponent = entity.getComponent('CoinsComponent');
    const passiveIncomeComponent = entity.getComponent('PassiveIncomeComponent');
    const clickPowerComponent = entity.getComponent(ClickPowerComponent);
    document.getElementById('coins').textContent = Math.floor(coinsComponent.amount);
    document.getElementById('passiveIncome').textContent = passiveIncomeComponent.incomePerHour.toFixed(1);
    document.getElementById('tapPower').textContent = clickPowerComponent.power;
}