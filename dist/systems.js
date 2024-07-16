import { System } from './ecs.js';
import { CoinsComponent, ClickPowerComponent, EnergyComponent, ViewComponent, InputComponent, PassiveIncomeComponent } from './components.js';

export class ClickSystem extends System {
    update(deltaTime) {
        if (this.entity.hasComponent(InputComponent) &&
            this.entity.hasComponent(ClickPowerComponent) &&
            this.entity.hasComponent(CoinsComponent) &&
            this.entity.hasComponent(EnergyComponent)) {

            const inputComponent = this.entity.getComponent(InputComponent);
            while (inputComponent.hasInput('tap')) {
                const tapInput = inputComponent.getAndRemoveInput('tap');
                if (tapInput) {
                    const clickPower = this.entity.getComponent(ClickPowerComponent).power;
                    const coinsComponent = this.entity.getComponent(CoinsComponent);
                    const energyComponent = this.entity.getComponent(EnergyComponent);
                    if (energyComponent.energy >= 1) {
                        coinsComponent.amount += clickPower;
                        energyComponent.energy--;
                    }
                }
            }
        }
    }
}

export class PassiveIncomeSystem extends System {
    update(deltaTime) {
        if (this.entity.hasComponent(CoinsComponent) && this.entity.hasComponent(PassiveIncomeComponent)) {
            let coins = this.entity.getComponent(CoinsComponent);
            let passiveIncome = this.entity.getComponent(PassiveIncomeComponent);
            coins.amount += passiveIncome.incomePerSecond * deltaTime;
        }
    }
}

export class EnergySystem extends System {
    update(deltaTime) {
        if (this.entity.hasComponent(EnergyComponent)) {
            let energyComponent = this.entity.getComponent(EnergyComponent);
            energyComponent.energy = Math.min(
                energyComponent.maxEnergy,
                energyComponent.energy + energyComponent.energyRestore * deltaTime
            );
        }
    }
}

export class UpgradeSystem extends System {
    update(deltaTime) {
        if (this.entity.hasComponent(InputComponent) &&
            this.entity.hasComponent(CoinsComponent)) {

            const inputComponent = this.entity.getComponent(InputComponent);

            while (inputComponent.hasInput('upgrade')) {
                const upgradeInput = inputComponent.getAndRemoveInput('upgrade');
                if (upgradeInput) {
                    this.processUpgrade(entity, upgradeInput);
                }
            }
        }
    }

    processUpgrade(entity, input) {
        // Implement upgrade logic here
        console.log(`Processing upgrade at ${input.timestamp}`);
        // Example: Upgrade click power
        const clickPowerComponent = entity.getComponent(ClickPowerComponent);
        const coinsComponent = entity.getComponent(CoinsComponent);

        const upgradeCost = 10 * (clickPowerComponent.power + 1);
        if (coinsComponent.amount >= upgradeCost) {
            coinsComponent.amount -= upgradeCost;
            clickPowerComponent.power += 1;
            console.log(`Upgraded click power to ${clickPowerComponent.power}`);
        } else {
            console.log('Not enough coins for upgrade');
        }
    }
}

export class TelegramSystem extends System {
    constructor() {
        super();
        this.user = null;
        this.initTelegram();
    }

    initTelegram() {
        if (window.Telegram && window.Telegram.WebApp) {
            this.user = window.Telegram.WebApp.initDataUnsafe.user || { id: 1, first_name: 'Test', last_name: 'User', username: 'test' };

            // Listen for viewport changes, which include app closure
            window.Telegram.WebApp.onEvent('viewportChanged', async () => {
                if (window.Telegram.WebApp.isExpanded === false) {
                    // The app is being closed
                    await updateDataBeforeClose();
                }
            });
            console.log('Telegram user initialized:', this.user);
        } else {
            console.error('Telegram WebApp is not available');
        }
    }

    getUser() {
        return this.user;
    }

    getUserId() {
        return this.user ? this.user.id : null;
    }
}

export class StorageSystem extends System {
    constructor(tgUser) {
        super(null);
        this.tgUser = tgUser;
        this.state = null;
        this.config = null;
        this.user = null;
        this.timeToSave = 5;
        this.timer = 0;
    }

    setEntity(entity) {
        this.entity = entity;
    }

    setState(state) {
        this.state = state;
    }

    async getState() {
        if (!this.state) {
            await this.loadState();
        }
        return this.state;
    }

    async getConfig() {
        if (!this.config) {
            await this.loadState();
        }
        return this.config;
    }

    async getUser() {
        if (!this.user) {
            await this.loadState();
        }
        return this.user;
    }

    async getMonsters() {
        try {
            const response = await fetch('api/monsters', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to save state');
            }
            return response.json();
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }

    async saveState() {
        if (!this.entity) {
            console.error('No entity provided to save state');
            return;
        }

        const coinsComponent = this.entity.getComponent(CoinsComponent);
        const clickPowerComponent = this.entity.getComponent(ClickPowerComponent);
        const energyComponent = this.entity.getComponent(EnergyComponent);

        if (!coinsComponent || !clickPowerComponent || !energyComponent) {
            console.error('Entity is missing required components for saving state');
            return;
        }


        this.state.coins = Math.floor(coinsComponent.amount);
        this.state.energy = Math.floor(energyComponent.energy);
        this.state.passive_income = energyComponent.passiveIncome;

        try {
            const response = await fetch('api/state', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.state),
            });

            if (!response.ok) {
                throw new Error('Failed to save state');
            }

            console.log('State saved successfully');
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }

    async loadState() {
        try {
            console.log("Load with user: ", this.tgUser);
            const response = await fetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.tgUser),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.state = data.state;
            this.user = data.user;
            this.config = data.config;
        } catch (error) {
            console.error('Error loading state:', error);
        }
    }

    update(deltaTime) {
        this.timer += deltaTime;
        if (this.timer >= this.timeToSave) {
            this.timer = 0;
            this.saveState();
        }
        // If you need any periodic state saving, you can implement it here
    }

}

export class UISystem extends System {
    constructor(entity) {
        super(entity);
        this.views = {};
        this.currentView = null;
    }

    async loadView(viewName) {
        if (!this.views[viewName]) {
            const view = new ViewComponent(viewName);
            await view.load();
            this.views[viewName] = view;
        }
        return this.views[viewName];
    }

    async setView(viewName) {
        try {
            const view = await this.loadView(viewName);
            console.log("View is loaded: ", view);
            this.currentView = view;
            document.getElementById('content').innerHTML = view.template;
            view.init(this.entity);
        } catch (error) {
            console.error(`Error setting view ${viewName}:`, error);
        }
    }

    update() {
        if (this.currentView) {
            this.currentView.render(this.entity);
        }
    }
}