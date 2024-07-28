import { ClickSystem, PassiveIncomeSystem, LevelUpSystem, StorageSystem, TelegramSystem, UISystem, EnergySystem, PopupSystem, SoulLevelSystem } from './systems.js';
import { SystemManager } from './systemManager.js';
import { Entity } from './ecs.js';
import { CoinsComponent, ClickPowerComponent, EnergyComponent, ConfigComponent, LevelComponent, PassiveIncomeComponent, InputComponent, InventoryComponent, ReferralsComponent, MonstersComponent, UserComponent, PacksComponent, RatingsComponent } from './components.js';

let lastTime = 0;
const targetFPS = 5;
const timeStep = 1000 / targetFPS;

const systemManager = new SystemManager();

async function initApp() {
    eruda.init();
    console.log('Trying to init app')
    const gameEntity = new Entity();
    const telegramSystem = new TelegramSystem(gameEntity);
    const storageSystem = new StorageSystem(gameEntity, telegramSystem.getUser(), telegramSystem.getInviter());
    const state = await storageSystem.getState();
    const config = await storageSystem.getConfig();
    const user = await storageSystem.getUser();
    const monsters = await storageSystem.getMonsters();
    const packs = await storageSystem.getPacks();
    const inventory = await storageSystem.getInventory();
    const referrals = await storageSystem.getReferrals();
    const ratings = await storageSystem.getRatings();
    const monsterComponent = new MonstersComponent(monsters, config);
    const inventoryComponent = new InventoryComponent(inventory);
    const referralsComponent = new ReferralsComponent(referrals);
    const ratingsComponent = new RatingsComponent(ratings);

    systemManager.addSystem(telegramSystem);
    systemManager.addSystem(storageSystem)

    gameEntity.addComponent(new CoinsComponent(state.coins));
    gameEntity.addComponent(new ClickPowerComponent(inventoryComponent.items));
    gameEntity.addComponent(inventoryComponent);
    gameEntity.addComponent(new EnergyComponent(state.energy, state.max_energy, state.energy_restore, inventoryComponent.items));
    gameEntity.addComponent(new PassiveIncomeComponent(monsterComponent.items, inventoryComponent.items, referralsComponent.items));
    gameEntity.addComponent(new ConfigComponent(config));
    gameEntity.addComponent(new UserComponent(user));
    gameEntity.addComponent(new LevelComponent(state.level));
    gameEntity.addComponent(new InputComponent());
    gameEntity.addComponent(referralsComponent);
    gameEntity.addComponent(monsterComponent);
    gameEntity.addComponent(ratingsComponent);
    gameEntity.addComponent(new PacksComponent(packs));

    storageSystem.setEntity(gameEntity);
    const uiSystem = new UISystem(gameEntity);
    systemManager.addSystem(uiSystem);

    // Initialize systems
    systemManager.addSystem(new ClickSystem(gameEntity));
    systemManager.addSystem(new PassiveIncomeSystem(gameEntity));
    systemManager.addSystem(new LevelUpSystem(gameEntity));
    systemManager.addSystem(new SoulLevelSystem(gameEntity));
    systemManager.addSystem(new EnergySystem(gameEntity));
    systemManager.addSystem(new PopupSystem(gameEntity));
    // systemManager.addSystem(new RenderSystem());

    systemManager.initAll();

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
        lastTime = currentTime;
        systemManager.updateAll(deltaTime / 1000);
    }
}

window.addEventListener('load', initApp);