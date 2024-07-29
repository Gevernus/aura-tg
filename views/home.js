export function init(entity) {
    const inputComponent = entity.getComponent('InputComponent');
    let tapButton = document.getElementById('tap-button');
    let tapButtonContainer = document.querySelector('.tap-button-container');
    const configComponent = entity.getComponent('ConfigComponent');
    const levelComponent = entity.getComponent('LevelComponent');
    const clickPowerComponent = entity.getComponent('ClickPowerComponent');
    const config = configComponent.config;
    // tapButton.addEventListener('click', () => {
    //     inputComponent.addInput("tap");
    //     showClickAnimation(tapButton, clickPowerComponent.power);
    // });
    // tapButtonContainer.addEventListener('click', (event) => {
    //     console.log('Tapped');
    //     inputComponent.addInput("tap");
    //     showClickAnimation(event.clientX, event.clientY, clickPowerComponent.power);
    // });
    if (tapButtonContainer && tapButton) {
        tapButtonContainer.addEventListener('pointerdown', (event) => {
            console.log('Container tapped at:', event.clientX, event.clientY);
            event.preventDefault();

            // Trigger a click on the button
            tapButton.click();

            // Custom handling for animation
            showClickAnimation(event.clientX, event.clientY, clickPowerComponent.power);
        });

        // Add a click event listener to the button for any button-specific handling
        tapButton.addEventListener('click', (event) => {
            console.log('Button clicked');
            inputComponent.addInput("tap");
        });
    } else {
        console.error('Tap button or container not found');
    }
    document.body.style.backgroundImage = `url(/images/${config.images[levelComponent.level - 1]})`;
};

// function showClickAnimation(button, count) {
//     const animationElement = document.createElement('div');

//     animationElement.textContent = `+${count}`;
//     animationElement.className = 'click-animation';

//     const buttonRect = button.getBoundingClientRect();
//     animationElement.style.left = `${buttonRect.left + buttonRect.width / 2}px`;
//     animationElement.style.top = `${buttonRect.top}px`;

//     document.body.appendChild(animationElement);

//     animationElement.addEventListener('animationend', () => {
//         animationElement.remove();
//     });
// }

function showClickAnimation(x, y, count) {
    const animationElement = document.createElement('div');

    animationElement.textContent = `+${count}`;
    animationElement.className = 'click-animation';

    animationElement.style.left = `${x}px`;
    animationElement.style.top = `${y}px`;

    document.body.appendChild(animationElement);

    animationElement.addEventListener('animationend', () => {
        animationElement.remove();
    });
}

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