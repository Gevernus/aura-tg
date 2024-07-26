export function init(entity) {
    const inventory = entity.getComponent('InventoryComponent');
    populateInventory(inventory.items);
};

function populateInventory(items) {
    const container = document.getElementById('item-container');
    container.innerHTML = ''; // Clear existing content

    if (items.length === 0) {
        container.innerHTML = '<p>Your inventory is empty.</p>';
        return;
    }

    items.forEach(item => {
        const itemElement = createInventoryItemElement(item);
        container.appendChild(itemElement);
    });
}

function createInventoryItemElement(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'inventory-item';
    const rarityClass = `rarity-${item.rarity == "Very Rare" ? "very-rare" : item.rarity.toLowerCase()}`;
    itemDiv.innerHTML = `
        <img src="images/items/${item.image}" alt="${item.name}" class="item-image">
        <h2 class="item-name">${item.name}</h2>
        <p class="item-rarity ${rarityClass}">${item.rarity}</p>
        <p class="item-bonus">Passive Bonus: ${item.passive_bonus}</p>
        <p class="item-bonus">Tap Bonus: ${item.tap_bonus}</p>
        <p class="item-bonus">Energy Bonus: ${item.energy_bonus}</p>
    `;
    return itemDiv;
}

export function render(entity) {
    const coinsComponent = entity.getComponent("CoinsComponent");
    const passiveIncomeComponent = entity.getComponent("PassiveIncomeComponent");
    const clickPowerComponent = entity.getComponent("ClickPowerComponent");
    document.getElementById('coins').textContent = Math.floor(coinsComponent.amount);
    document.getElementById('passiveIncome').textContent = passiveIncomeComponent.incomePerHour.toFixed(1);
    document.getElementById('tapPower').textContent = clickPowerComponent.power;
}