import { ClickSystem, PassiveIncomeSystem, UpgradeSystem, StorageSystem, TelegramSystem, UISystem, EnergySystem } from './systems.js';
import { SystemManager } from './systemManager.js';
import { Entity } from './ecs.js';
import { CoinsComponent, ClickPowerComponent, EnergyComponent, ConfigComponent, LevelComponent, PassiveIncomeComponent, InputComponent, InventoryComponent, ReferralsComponent, ShopComponent } from './components.js';

let lastTime = 0;
const targetFPS = 60;
const timeStep = 1000 / targetFPS;

const systemManager = new SystemManager();

async function initApp() {
    console.log('Trying to init app')
    const telegramSystem = new TelegramSystem();
    const storageSystem = new StorageSystem(telegramSystem.getUser());
    const state = await storageSystem.getState();
    const config = await storageSystem.getConfig();
    const user = await storageSystem.getUser();
    systemManager.addSystem(telegramSystem);
    systemManager.addSystem(storageSystem)

    // Create main game entity
    const gameEntity = new Entity();
    gameEntity.addComponent(new CoinsComponent(state.coins));
    gameEntity.addComponent(new ClickPowerComponent(state.tap_power));
    gameEntity.addComponent(new EnergyComponent(state.energy, state.max_energy, state.energy_restore));
    gameEntity.addComponent(new PassiveIncomeComponent(state.passive_income));
    gameEntity.addComponent(new ConfigComponent(config));
    gameEntity.addComponent(new LevelComponent(state.level));
    gameEntity.addComponent(new InputComponent());
    gameEntity.addComponent(new InventoryComponent(state.inventory));
    gameEntity.addComponent(new ReferralsComponent(user.referrals));
    gameEntity.addComponent(new ShopComponent(state.shopItems));

    storageSystem.setEntity(gameEntity);
    const uiSystem = new UISystem(gameEntity);
    systemManager.addSystem(uiSystem);

    // Initialize systems
    systemManager.addSystem(new ClickSystem(gameEntity));
    systemManager.addSystem(new PassiveIncomeSystem(gameEntity));
    systemManager.addSystem(new UpgradeSystem(gameEntity));
    systemManager.addSystem(new EnergySystem(gameEntity));
    // systemManager.addSystem(new RenderSystem());

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Nav link clicked');
            uiSystem.setView(e.currentTarget.dataset.page || 'home');
        });
    });
    console.log('App inited')
    await uiSystem.setView('home');
    requestAnimationFrame((currentTime) => {
        lastTime = currentTime;
        tick(currentTime);
    });
    console.log('Frame requested')
}

function tick(currentTime) {
    requestAnimationFrame(tick);

    // Calculate elapsed time
    const deltaTime = currentTime - lastTime;

    // If enough time has passed, update the game
    if (deltaTime >= timeStep) {
        systemManager.updateAll(deltaTime / 1000);
        lastTime = currentTime;
    }
}

window.addEventListener('load', initApp);