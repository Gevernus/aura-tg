export function init(entity) {
    const inputComponent = entity.getComponent('InputComponent');
    let tapButton = document.getElementById('tap-button');
    const configComponent = entity.getComponent('ConfigComponent');
    const levelComponent = entity.getComponent('LevelComponent');
    const config = configComponent.config;
    // const clone = tapButton.cloneNode(true)
    // tapButton.replaceWith(clone);
    // tapButton = clone;
    tapButton.addEventListener('click', () => {
        inputComponent.addInput("tap");
    });
    document.body.style.backgroundImage = `url(/images/${config.images[levelComponent.level - 1]})`;
    // document.body.style.backgroundSize = 'cover';  // equivalent to object-fit: cover;
    // document.body.style.backgroundPosition = 'center';  // centers the image
    // document.body.style.width = '100%';
    // document.body.style.height = '100vh';
};

export function render(entity) {
    const levelComponent = entity.getComponent("LevelComponent");
    const energyComponent = entity.getComponent("EnergyComponent");
    const coinsComponent = entity.getComponent("CoinsComponent");
    const passiveIncomeComponent = entity.getComponent("PassiveIncomeComponent");
    const configComponent = entity.getComponent("ConfigComponent");
    const clickPowerComponent = entity.getComponent("ClickPowerComponent");
    const config = configComponent.config;

    document.getElementById('levelName').textContent = config.levels[levelComponent.level - 1];
    document.getElementById('level').textContent = levelComponent.level;
    document.getElementById('levelProgress').style.width = `${(coinsComponent.amount / config.levelRequirements[levelComponent.level]) * 100}%`;

    document.getElementById('energy').textContent = `${Math.floor(energyComponent.energy)}/${Math.floor(energyComponent.maxEnergy)}`;
    document.getElementById('energyProgress').style.width = `${(energyComponent.energy / (500 * Math.pow(2, levelComponent.level - 1))) * 100}%`;

    document.getElementById('coins').textContent = Math.floor(coinsComponent.amount);
    document.getElementById('tapPower').textContent = clickPowerComponent.power;
    document.getElementById('passiveIncome').textContent = passiveIncomeComponent.incomePerHour.toFixed(1);

    document.body.style.backgroundImage = `url(/images/${config.images[levelComponent.level - 1]})`;
};