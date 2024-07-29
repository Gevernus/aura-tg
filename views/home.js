const animationPool = [];
const poolSize = 15; 
let animationContainer;

export function init(entity) {
    const inputComponent = entity.getComponent('InputComponent');
    let tapButton = document.getElementById('tap-button');
    let tapButtonContainer = document.querySelector('.tap-button-container');
    const configComponent = entity.getComponent('ConfigComponent');
    const levelComponent = entity.getComponent('LevelComponent');
    const clickPowerComponent = entity.getComponent('ClickPowerComponent');
    const config = configComponent.config;
    initializeAnimationPool();
    if (tapButtonContainer && tapButton) {
        tapButtonContainer.addEventListener('pointerdown', (event) => {
            event.preventDefault();
            inputComponent.addInput("tap");
            animateButton(tapButton);
            showClickAnimation(event.clientX, event.clientY, clickPowerComponent.power);
        });
    } else {
        console.error('Tap button or container not found');
    }
    document.body.style.backgroundImage = `url(/images/${config.images[levelComponent.level - 1]})`;
};

function animateButton(button) {
    button.style.transform = 'scale(1.03)';
    button.style.filter = 'brightness(1.2) drop-shadow(0 0 10px rgba(255, 255, 255, 0.7))';

    setTimeout(() => {
        button.style.transform = '';
        button.style.filter = '';
    }, 100); // Duration of the animation
}

function initializeAnimationPool() {
    animationContainer = document.createElement('div');
    animationContainer.className = 'animation-container';
    animationContainer.style.position = 'absolute';
    animationContainer.style.top = '0';
    animationContainer.style.left = '0';
    animationContainer.style.pointerEvents = 'none'; // Ensure it doesn't interfere with clicks
    document.body.appendChild(animationContainer);

    for (let i = 0; i < poolSize; i++) {
        const animationElement = document.createElement('div');
        animationElement.className = 'click-animation';
        animationElement.style.display = 'none';
        animationContainer.appendChild(animationElement);
        animationPool.push(animationElement);
    }
}

function showClickAnimation(x, y, count) {
    if (!animationContainer) {
        initializeAnimationPool();
    }

    let animationElement = animationPool.find(el => el.style.display === 'none');
    if (!animationElement) {
        // If all elements are in use, reuse the oldest one
        animationElement = animationPool.shift();
        animationPool.push(animationElement);
    }

    animationElement.textContent = `+${count}`;
    animationElement.style.left = `${x}px`;
    animationElement.style.top = `${y}px`;
    animationElement.style.display = 'block';

    // Reset the animation
    animationElement.style.animation = 'none';
    animationElement.offsetHeight; // Trigger reflow
    animationElement.style.animation = null;

    animationElement.addEventListener('animationend', function onAnimationEnd() {
        animationElement.style.display = 'none';
        animationElement.removeEventListener('animationend', onAnimationEnd);
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