import { ClickSystem, PassiveIncomeSystem, LevelUpSystem, StorageSystem, TelegramSystem, UISystem, EnergySystem } from './systems.js';
import { SystemManager } from './systemManager.js';
import { Entity } from './ecs.js';
import { CoinsComponent, ClickPowerComponent, EnergyComponent, ConfigComponent, LevelComponent, PassiveIncomeComponent, InputComponent, InventoryComponent, ReferralsComponent, MonstersComponent, UserComponent } from './components.js';

let lastTime = 0;
const targetFPS = 60;
const timeStep = 1000 / targetFPS;

const systemManager = new SystemManager();

async function initApp() {
    eruda.init();
    console.log('Trying to init app')
    const gameEntity = new Entity();
    const telegramSystem = new TelegramSystem();
    const storageSystem = new StorageSystem(gameEntity, telegramSystem.getUser());
    const state = await storageSystem.getState();
    const config = await storageSystem.getConfig();
    const user = await storageSystem.getUser();
    const monsters = await storageSystem.getMonsters();
    const monsterComponent = new MonstersComponent(monsters, config);

    systemManager.addSystem(telegramSystem);
    systemManager.addSystem(storageSystem)

    gameEntity.addComponent(new CoinsComponent(state.coins));
    gameEntity.addComponent(new ClickPowerComponent(state.tap_power));
    gameEntity.addComponent(new EnergyComponent(state.energy, state.max_energy, state.energy_restore));
    gameEntity.addComponent(new PassiveIncomeComponent(monsterComponent.items));
    gameEntity.addComponent(new ConfigComponent(config));
    gameEntity.addComponent(new UserComponent(user));
    gameEntity.addComponent(new LevelComponent(state.level));
    gameEntity.addComponent(new InputComponent());
    gameEntity.addComponent(new InventoryComponent(state.inventory));
    gameEntity.addComponent(new ReferralsComponent(user.referrals));
    gameEntity.addComponent(monsterComponent);
    // gameEntity.addComponent(new ShopComponent(state.shopItems));

    storageSystem.setEntity(gameEntity);
    const uiSystem = new UISystem(gameEntity);
    systemManager.addSystem(uiSystem);

    // Initialize systems
    systemManager.addSystem(new ClickSystem(gameEntity));
    systemManager.addSystem(new PassiveIncomeSystem(gameEntity));
    systemManager.addSystem(new LevelUpSystem(gameEntity));
    systemManager.addSystem(new EnergySystem(gameEntity));
    // systemManager.addSystem(new RenderSystem());

    document.querySelectorAll('.navigate').forEach(link => {
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