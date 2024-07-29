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

    function formatBonus(value, label) {
        const numValue = parseFloat(value);
        return numValue > 0 ? `<p class="item-bonus" style="color: #4CAF50;">${label}: +${value}</p>` : `<p class="item-bonus">${label}: ${value}</p>`;
    }

    itemDiv.innerHTML = `
        <img src="images/items/${item.image}" alt="${item.name}" class="item-image">
        <h2 class="item-name">${item.name}</h2>
        <p class="item-rarity ${rarityClass}">${item.rarity}</p>
        ${formatBonus(item.passive_bonus+"%", 'Passive Bonus')}
        ${formatBonus(item.tap_bonus, 'Tap Bonus')}
        ${formatBonus(item.energy_bonus, 'Energy Bonus')}
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