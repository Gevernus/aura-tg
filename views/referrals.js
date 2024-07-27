
export function init(entity) {
    addClaimListeners(entity);
};

export function render(entity) {
    const referralsComponent = entity.getComponent('ReferralsComponent');
    const referralList = document.getElementById('referral-list');
    referralList.innerHTML = '';

    if (!referralsComponent.items || referralsComponent.items.length === 0) {
        referralList.innerHTML = '<p>No referrals yet.</p>';
        return;
    }

    referralsComponent.items.forEach(referral => {
        const li = document.createElement('li');
        li.dataset.referralId = referral.id; // Store the referral id
        li.innerHTML = `
                <span>${referral.name}</span>
                <span>${getStatusText(referral.status)}</span>
                <span>Bonus: ${referral.bonus}%</span>
                ${referral.status === 'accepted' ? '<button class="claim-btn">Claim</button>' : ''}
            `;
        referralList.appendChild(li);
    });
    const coinsComponent = entity.getComponent('CoinsComponent');
    const passiveIncomeComponent = entity.getComponent('PassiveIncomeComponent');
    const clickPowerComponent = entity.getComponent("ClickPowerComponent");
    document.getElementById('coins').textContent = Math.floor(coinsComponent.amount);
    document.getElementById('passiveIncome').textContent = passiveIncomeComponent.incomePerHour.toFixed(1);
    document.getElementById('tapPower').textContent = clickPowerComponent.power;
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Waiting',
        'accepted': 'Accepted',
        'active': 'Active',
        'lost': 'Lost'
    };
    return statusMap[status] || status;
}
function addClaimListeners(entity) {
    document.getElementById('referral-list').addEventListener('click', handleClaimClick);
    document.getElementById('invite-btn').addEventListener('click', (e) => {
        shareInviteLink(entity);
    });
}

function handleClaimClick(event) {
    if (event.target.classList.contains('claim-btn')) {
        const li = event.target.closest('li');
        const referralId = li.dataset.referralId;
        handleClaim(referralId);
    }
}

async function handleClaim(referralId) {
    const referralsComponent = entity.getComponent('ReferralsComponent');
    const userComponent = entity.getComponent('UserComponent');
    const referral = referralsComponent.items.find(r => r.id === referralId);
    if (referral && referral.status === 'accepted') {
        try {
            const response = await fetch(`api/${userComponent.user.id}/claim`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                json: { referralId: referral.id },
            });
            if (!response.ok) {
                throw new Error('Failed to save state');
            }
            referral.status = 'claimed';
        } catch (error) {
            console.error('Error saving state:', error);
        }

        const passiveIncomeComponent = entity.getComponent('PassiveIncomeComponent');
        const inventoryComponent = entity.getComponent("InventoryComponent");
        const monstersComponent = entity.getComponent("MonstersComponent");
        inventoryComponent.addItems(data.items);
        passiveIncomeComponent.calculate(monstersComponent.items, inventoryComponent.items, referralsComponent.items);
    }
}

function generateInviteLink(userId) {
    const params = `${userId}`;
    return `https://t.me/Aura_tests_bot/Aura_th?startapp=${encodeURIComponent(params)}`;
}

function shareInviteLink(entity) {
    const userComponent = entity.getComponent('UserComponent');
    const inputComponent = entity.getComponent('InputComponent');
    const userId = userComponent.user.id;
    let inviteLink = generateInviteLink(userId);
    inputComponent.addInput("openLink", {
        url: inviteLink
    });
}