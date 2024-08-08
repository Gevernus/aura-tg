import { ClickPowerComponent, CoinsComponent, InputComponent, PassiveIncomeComponent, RatingsComponent, UserComponent } from '../dist/components.js';

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
        const sortField = document.getElementById('filter-select').value;
        inputComponent.addInput("updateRating", {
            sortField, callback: () => {
                renderOnce(entity);
            }
        });
    });

    const inputComponent = entity.getComponent(InputComponent);
    const sortField = document.getElementById('filter-select').value;
    inputComponent.addInput("updateRating", {
        sortField, callback: () => {
            renderOnce(entity);
        }
    });

    // Initially sort by passive income per hour
    // sortUsers(entity);
    renderOnce(entity);
    checkUserCardVisibility(entity);
    const ratingsContainer = document.getElementById("ratings-container");
    ratingsContainer.addEventListener('scroll', () => checkUserCardVisibility(entity));
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

function createUserCard(user, rank, entity) {
    const card = document.createElement("div");
    const userComponent = entity.getComponent(UserComponent);
    card.className = "rating-card";
    if (user.user_id === userComponent.user.id) {
        card.classList.add('current-user-card');
    }
    card.innerHTML = `
        <div class="rating-main">
            <div class="rating-rank">#${rank}</div>
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
    return card;
}

function createStickyUserCard(entity) {
    const ratingsComponent = entity.getComponent(RatingsComponent);
    const userComponent = entity.getComponent(UserComponent);
    const currentUser = ratingsComponent.items.find(user => user.user_id === userComponent.user.id);
    const currentUserRank = ratingsComponent.items.findIndex(user => user.user_id === userComponent.user.id) + 1;

    if (!currentUser) return;

    let stickyCard = document.getElementById("sticky-user-card");

    if (stickyCard) {
        // Update existing card
        stickyCard.innerHTML = createUserCard(currentUser, currentUserRank, entity).innerHTML;
    } else {
        // Create new card
        stickyCard = document.createElement("div");
        stickyCard.id = "sticky-user-card";
        stickyCard.className = "rating-card sticky-card";
        stickyCard.style.display = "none";
        stickyCard.innerHTML = createUserCard(currentUser, currentUserRank, entity).innerHTML;

        const content = document.getElementById("page-content");
        content.appendChild(stickyCard);
    }
}

function checkUserCardVisibility(entity) {
    const ratingsContainer = document.getElementById("ratings-container");
    const stickyCard = document.getElementById("sticky-user-card");
    const currentUserCard = ratingsContainer.querySelector('.current-user-card');

    if (!currentUserCard || !stickyCard) return;
    const containerRect = ratingsContainer.getBoundingClientRect();
    const cardRect = currentUserCard.getBoundingClientRect();

    if (cardRect.bottom < containerRect.top || cardRect.top > containerRect.bottom) {
        stickyCard.style.display = "flex";
    } else {
        stickyCard.style.display = "none";
    }
}

function renderOnce(entity) {
    const ratingsComponent = entity.getComponent(RatingsComponent);
    const userComponent = entity.getComponent(UserComponent);
    const ratingsContainer = document.getElementById("ratings-container");
    ratingsContainer.innerHTML = "";
    sortUsers(entity);
    const limitedItems = ratingsComponent.items.slice(0, 100);
    limitedItems.forEach((user, index) => {
        const card = document.createElement("div");
        card.className = user.user_username == userComponent.user.username ? "rating-card current-user-card" : "rating-card";
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

    createStickyUserCard(entity);
}

export function render(entity) {

}