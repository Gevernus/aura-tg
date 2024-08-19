import { ClickPowerComponent, CoinsComponent, InputComponent, PassiveIncomeComponent } from '../dist/components.js';
export function init(entity) {
    const inputComponent = entity.getComponent(InputComponent);
    const profile = document.querySelector('.profile-navigate');
    const tgChannelButton = document.getElementById('telegramNewsButton');
    let currentLink = null;
    profile.querySelectorAll('.navigate').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentLink) {
                currentLink.classList.remove('active');
            }
            e.currentTarget.classList.add('active');
            inputComponent.addInput("vibrate");
            inputComponent.addInput("setView", { view: e.currentTarget.dataset.page });
        });
    });
    tgChannelButton.addEventListener('click', function(e) {
        e.preventDefault()
        Telegram.WebApp.openTelegramLink('https://t.me/aura_tg_news');
    });
};

export function render(entity) {
    const coinsComponent = entity.getComponent(CoinsComponent);
    const passiveIncomeComponent = entity.getComponent(PassiveIncomeComponent);
    const clickPowerComponent = entity.getComponent(ClickPowerComponent);
    document.getElementById('coins').textContent = Math.floor(coinsComponent.amount);
    document.getElementById('passiveIncome').textContent = passiveIncomeComponent.incomePerHour.toFixed(1);
    document.getElementById('tapPower').textContent = clickPowerComponent.power;
}