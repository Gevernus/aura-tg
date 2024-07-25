import { CoinsComponent, InputComponent, PassiveIncomeComponent } from '../dist/components.js';
export function init(entity) {
    const inputComponent = entity.getComponent(InputComponent);
    const profile = document.querySelector('.profile-navigate');
    profile.querySelectorAll('.navigate').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            inputComponent.addInput("setView", { view: e.currentTarget.dataset.page })
        });
    });
};

export function render(entity) {
    const coinsComponent = entity.getComponent(CoinsComponent);
    const passiveIncomeComponent = entity.getComponent(PassiveIncomeComponent);
    document.getElementById('coins').textContent = Math.floor(coinsComponent.amount);
    document.getElementById('passiveIncome').textContent = passiveIncomeComponent.incomePerHour;
}