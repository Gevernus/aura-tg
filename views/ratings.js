import { ClickPowerComponent, CoinsComponent, InputComponent, PassiveIncomeComponent, RatingsComponent } from '../dist/components.js';

const FIELD_LABELS = {
    passive_income: 'Passive Income',
    // friendspassiveincome: 'Friends Passive Income',
    coins: 'Coins',
    friendscount: 'Number of Friends',
    // friendsaveragelevel: 'Friends Soul Level'
};

export function init(entity) {
    populateSortOptions();
    const filterSelect = document.getElementById("filter-select");
    filterSelect.addEventListener("change", (event) => {
        sortUsers(entity);
    });

    const inputComponent = entity.getComponent(InputComponent);
    inputComponent.addInput("updateRating");

    // Initially sort by passive income per hour
    sortUsers(entity);
};

function populateSortOptions() {
    const sortSelect = document.getElementById('filter-select');
    sortSelect.innerHTML = ''; // Clear existing options

    Object.entries(FIELD_LABELS).forEach(([field, label]) => {
        const option = document.createElement('option');
        option.value = field;
        option.textContent = label;
        sortSelect.appendChild(option);
    });
}

function sortUsers(entity) {
    const ratingsComponent = entity.getComponent(RatingsComponent);
    const sortField = document.getElementById('filter-select').value;
    ratingsComponent.items.sort((a, b) => {
        if (a[sortField] === undefined || b[sortField] === undefined) return 0;
        return b[sortField] - a[sortField]; // Descending order
    });
}

export function render(entity) {
    const ratingsComponent = entity.getComponent(RatingsComponent);
    const ratingsContainer = document.getElementById("ratings-container");
    ratingsContainer.innerHTML = "";
    sortUsers(entity);
    ratingsComponent.items.forEach((user, index) => {
        const card = document.createElement("div");
        card.className = "rating-card";
        card.innerHTML = `
            <div class="rating-main">
                <div class="rating-rank">#${index + 1}</div>
                <div class="rating-username">${user.user_username || 'N/A'}</div>
            </div>
            <div class="rating-stats">
                <div class="rating-stat">
                    <span class="stat-label">Passive Income:</span>
                    <span class="stat-value">${user.passive_income.toFixed(1)}</span>
                </div>
                <div class="rating-stat">
                    <span class="stat-label">Coins:</span>
                    <span class="stat-value">${Math.floor(user.coins)}</span>
                </div>
                <div class="rating-stat">
                    <span class="stat-label">Friends:</span>
                    <span class="stat-value">${user.friendscount}</span>
                </div>
            </div>
        `;
        ratingsContainer.appendChild(card);
    });

    const coinsComponent = entity.getComponent(CoinsComponent);
    const passiveIncomeComponent = entity.getComponent(PassiveIncomeComponent);
    const clickPowerComponent = entity.getComponent(ClickPowerComponent);
    document.getElementById('coins').textContent = Math.floor(coinsComponent.amount);
    document.getElementById('passiveIncome').textContent = passiveIncomeComponent.incomePerHour.toFixed(1);
    document.getElementById('tapPower').textContent = clickPowerComponent.power;
}