const referralElementMap = new Map();

export function init(entity) {
    addClaimListeners(entity);
    referralElementMap.clear();
};

export function render(entity) {
    const coinsComponent = entity.getComponent('CoinsComponent');
    const passiveIncomeComponent = entity.getComponent('PassiveIncomeComponent');
    const clickPowerComponent = entity.getComponent("ClickPowerComponent");
    document.getElementById('coins').textContent = Math.floor(coinsComponent.amount);
    document.getElementById('passiveIncome').textContent = passiveIncomeComponent.incomePerHour.toFixed(1);
    document.getElementById('tapPower').textContent = clickPowerComponent.power;

    const referralsComponent = entity.getComponent('ReferralsComponent');
    const referralList = document.getElementById('referral-list');

    if (!referralsComponent.items || referralsComponent.items.length === 0) {
        referralList.innerHTML = '<p>No referrals yet.</p>';
        referralElementMap.clear();
        return;
    }

    const currentReferralIds = new Set();

    referralsComponent.items.forEach(referral => {
        currentReferralIds.add(referral.id);
        let li = referralElementMap.get(referral.id);

        if (!li) {
            // Create new element if it doesn't exist
            li = document.createElement('li');
            li.dataset.referralId = referral.id;
            li.className = 'referral-item';
            referralList.appendChild(li);
            referralElementMap.set(referral.id, li);
        }

        // Update the content of the element
        updateReferralElement(li, referral);
    });

    // Remove elements for referrals that no longer exist
    for (let [id, element] of referralElementMap) {
        if (!currentReferralIds.has(id)) {
            console.log('remove element', element);
            element.remove();
            referralElementMap.delete(id);
        }
    }

}

function updateReferralElement(li, referral) {
    // Ensure all necessary elements exist
    if (!li.querySelector('.referral-info')) {
        li.innerHTML = `
            <div class="referral-info">
                <span class="referral-name"></span>
                <span class="referral-status"></span>
            </div>
            <div class="referral-bonus">
                <span>Income Bonus: <strong></strong></span>
            </div>
        `;
    }

    // Update username
    const nameElement = li.querySelector('.referral-name');
    nameElement.textContent = referral.username;

    // Update status
    const statusElement = li.querySelector('.referral-status');
    statusElement.textContent = getStatusText(referral.status);
    statusElement.className = `referral-status ${referral.status}`;

    // Update bonus
    const bonusElement = li.querySelector('.referral-bonus strong');
    bonusElement.textContent = referral.bonus;

    // Update claim button
    const bonusDiv = li.querySelector('.referral-bonus');
    let claimBtn = bonusDiv.querySelector('.claim-btn');

    if (referral.status === 'accepted') {
        if (!claimBtn) {
            claimBtn = document.createElement('button');
            claimBtn.className = 'claim-btn';
            claimBtn.textContent = 'Claim';
            bonusDiv.appendChild(claimBtn);
        }
    } else if (claimBtn) {
        claimBtn.remove();
    }
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Waiting',
        'accepted': 'Accepted',
        'claimed': 'Claimed',
        'active': 'Active',
        'lost': 'Lost'
    };
    return statusMap[status] || status;
}
function addClaimListeners(entity) {
    document.getElementById('referral-list').addEventListener('click', (e) => {
        handleClaimClick(e, entity);
    });
    document.getElementById('invite-btn').addEventListener('click', (e) => {
        shareInviteLink(entity);
    });
}

function handleClaimClick(event, entity) {
    const claimBtn = event.target.closest('.claim-btn');
    if (claimBtn) {
        const li = claimBtn.closest('.referral-item');
        if (li) {
            const referralId = li.dataset.referralId;
            claimBtn.disabled = true;
            handleClaim(entity, referralId);
        } else {
            console.error('Referral item not found');
        }
    }
}

async function handleClaim(entity, referralId) {
    try {
        console.log('Handling claim for referral ID:', referralId);
        const referralsComponent = entity.getComponent('ReferralsComponent');
        const userComponent = entity.getComponent('UserComponent');
        const referral = referralsComponent.items.find(r => r.id == referralId);
        if (referral && referral.status == 'accepted') {
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
            passiveIncomeComponent.calculate(monstersComponent.items, inventoryComponent.items, referralsComponent.items);
        }
    } catch (error) {
        console.error(error);
    }
}

function generateInviteLink(userId, appURL) {
    const params = `${userId}`;
    return `${appURL}?startapp=${encodeURIComponent(params)}`;
}

function shareInviteLink(entity) {
    const userComponent = entity.getComponent('UserComponent');
    const inputComponent = entity.getComponent('InputComponent');
    const configComponent = entity.getComponent('ConfigComponent');
    const userId = userComponent.user.id;
    let inviteLink = generateInviteLink(userId, configComponent.config.appURL);
    inputComponent.addInput("openLink", {
        url: inviteLink
    });
}