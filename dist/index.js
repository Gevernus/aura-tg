import { ClickSystem, PassiveIncomeSystem, LevelUpSystem, StorageSystem, TelegramSystem, UISystem, EnergySystem, PopupSystem, SoulLevelSystem, ActionsSystem } from './systems.js';
import { SystemManager } from './systemManager.js';
import { Entity } from './ecs.js';
import { CoinsComponent, ClickPowerComponent, EnergyComponent, ConfigComponent, LevelComponent, PassiveIncomeComponent, InputComponent, InventoryComponent, ReferralsComponent, MonstersComponent, UserComponent, PacksComponent, RatingsComponent, TasksComponent } from './components.js';

let lastTime = 0;
const targetFPS = 60;
const timeStep = 1000 / targetFPS;

const systemManager = new SystemManager();

async function initApp() {
    // eruda.init();
    console.log('Trying to init app')
    const gameEntity = new Entity();
    const telegramSystem = new TelegramSystem(gameEntity);
    const uiSystem = new UISystem(gameEntity);
    const inputComponent = new InputComponent();
    gameEntity.addComponent(inputComponent);
    if (telegramSystem.getUserId() == 1) {
        console.log('Set default view');
        uiSystem.setView('default', 'main');
        hideLoadingScreen();
        return;
    }
    systemManager.addSystem(uiSystem);

    const storageSystem = new StorageSystem(gameEntity, telegramSystem.getUser(), telegramSystem.getInviter());
    const state = await storageSystem.getState();
    const config = await storageSystem.getConfig();
    const user = await storageSystem.getUser();
    const monsters = await storageSystem.getMonsters();
    const packs = await storageSystem.getPacks();
    const inventory = await storageSystem.getInventory();
    const referrals = await storageSystem.getReferrals();
    if (referrals && referrals.length > 0) {
        inputComponent.addInput("action", { name: "FriendInvited" });
    }

    const offline = await storageSystem.getOffline();
    const ratings = await storageSystem.getRatings('passive_income');
    const tasks = await storageSystem.getTasks();

    const monsterComponent = new MonstersComponent(monsters, config);
    const inventoryComponent = new InventoryComponent(inventory);
    const referralsComponent = new ReferralsComponent(referrals);
    const ratingsComponent = new RatingsComponent(ratings);
    const tasksComponent = new TasksComponent(tasks);

    systemManager.addSystem(telegramSystem);
    systemManager.addSystem(storageSystem)

    gameEntity.addComponent(new CoinsComponent(state.coins, offline.passive_income));
    gameEntity.addComponent(new ClickPowerComponent(inventoryComponent.items));
    gameEntity.addComponent(inventoryComponent);
    const energyComponent = new EnergyComponent(state.energy, state.energy_restore, inventoryComponent.items, state.level, offline.energyRestored);
    gameEntity.addComponent(energyComponent);
    gameEntity.addComponent(new PassiveIncomeComponent(monsterComponent.items, inventoryComponent.items, referralsComponent.items));
    gameEntity.addComponent(new ConfigComponent(config));
    gameEntity.addComponent(new UserComponent(user));
    gameEntity.addComponent(new LevelComponent(state.level));
    gameEntity.addComponent(referralsComponent);
    gameEntity.addComponent(monsterComponent);
    gameEntity.addComponent(ratingsComponent);
    gameEntity.addComponent(tasksComponent);
    gameEntity.addComponent(new PacksComponent(packs));

    storageSystem.setEntity(gameEntity);


    // Initialize systems
    systemManager.addSystem(new ClickSystem(gameEntity));
    systemManager.addSystem(new PassiveIncomeSystem(gameEntity));
    systemManager.addSystem(new LevelUpSystem(gameEntity));
    systemManager.addSystem(new SoulLevelSystem(gameEntity));
    systemManager.addSystem(new EnergySystem(gameEntity));
    systemManager.addSystem(new PopupSystem(gameEntity));
    systemManager.addSystem(new ActionsSystem(gameEntity));
    // systemManager.addSystem(new RenderSystem());

    systemManager.initAll();
    let currentLink = null;
    document.querySelectorAll('.navigate').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentLink) {
                currentLink.classList.remove('active');
            }

            // Add active class to the clicked link
            e.currentTarget.classList.add('active');

            // Update the currentLink
            currentLink = e.currentTarget;
            console.log('Nav link clicked');
            inputComponent.addInput("vibrate");
            uiSystem.setView(e.currentTarget.dataset.page || 'home');
        });
    });

    console.log('App inited')
    await uiSystem.setView('home');
    showOfflinePopup(offline.shouldShowPopup, offline.passive_income, energyComponent.offlineRestored, inputComponent);
    
    // Hide loading screen after initialization
    hideLoadingScreen();
    requestAnimationFrame((currentTime) => {
        lastTime = currentTime;
        tick(currentTime);
    });
    console.log('Frame requested')
}

function showOfflinePopup(shouldShowPopup, passiveIncome, offlineRestored, inputComponent) {
    if (shouldShowPopup) {
        const title = "Claim your offline rewards";
        const message = `You earned ${passiveIncome} coins and restored ${offlineRestored} energy while you were away!`;
        const primaryCTA = "Claim Rewards";
        
        inputComponent.addInput("showPopup", {
            title,
            message,
            primaryCTA,
            callback: () => { console.log("Rewards claimed!"); showChallengePopup(inputComponent); }
        });
    } else {
        console.log('Returned in less than 5 minutes, no rewards to claim.');
        showChallengePopup(inputComponent)
    }
}

function showChallengePopup(inputComponent) {
    inputComponent.addInput("showPopup", {
        title: "The Trial of Souls",
        message: "Earn as much aura as you can! The top 50 players in each rating and the top 50 aura earners this week will win truly unique, powerful items.",
        primaryCTA: "Let's go!",
        callback: () => { console.log("Primary CTA clicked!"); },
        secondaryCTA: "More Info",
        secondaryCallback: () => { Telegram.WebApp.openTelegramLink('https://t.me/aura_game_official'); },
        imageUrl: "images/challenge_icon.jpg" // Optional image
    });
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

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
}

window.addEventListener('load', initApp);