export class CoinsComponent {
    constructor(amount = 0) {
        this.amount = amount;
    }
}

export class ClickPowerComponent {
    constructor(power = 1) {
        this.power = power;
    }
}

export class LevelComponent {
    constructor(level = 1) {
        this.level = level;
    }
}

export class EnergyComponent {
    constructor(energy = 500, maxEnergy = 500, energyRestore = 1) {
        this.energy = energy;
        this.maxEnergy = maxEnergy;
        this.energyRestore = energyRestore;
    }
}

export class PassiveIncomeComponent {
    constructor(incomePerSecond = 0) {
        this.incomePerSecond = incomePerSecond;
    }
}

export class InventoryComponent {
    constructor(inventoryData = []) {
        this.inventoryData = inventoryData;
    }
}

export class ShopComponent {
    constructor(shopData = []) {
        this.shopData = shopData;
    }
}

export class MonstersComponent {
    constructor(items = []) {
        this.items = items;
    }
}

export class ReferralsComponent {
    constructor(referrals = []) {
        this.referrals = referrals;
    }
}

export class UpgradeComponent {
    constructor(name, cost, type, value) {
        this.name = name;
        this.cost = cost;
        this.type = type; // 'click' or 'passive'
        this.value = value;
    }
}

export class ConfigComponent {
    constructor(config) {
        this.config = config;
    }
}

export class InputComponent {
    constructor() {
        this.inputQueue = [];
    }

    addInput(inputType) {
        this.inputQueue.push({
            type: inputType,
            timestamp: Date.now()
        });
        console.log("Input added:", inputType);
    }

    getAndRemoveInput(inputType) {
        const index = this.inputQueue.findIndex(input => input.type === inputType);
        if (index !== -1) {
            const result = this.inputQueue.splice(index, 1)[0];
            return result;
        }
        return null;
    }

    hasInput(inputType) {
        return this.inputQueue.some(input => input.type === inputType);
    }
}

export class ViewComponent {
    constructor(name) {
        this.name = name;
        this.template = '';
        this.logic = null;
    }

    async load() {
        try {
            // Load HTML template
            const htmlResponse = await fetch(`/views/${this.name}.html`);
            if (!htmlResponse.ok) {
                throw new Error(`Failed to load HTML for ${this.name}. Status: ${htmlResponse.status}`);
            }
            this.template = await htmlResponse.text();

            // Load JavaScript logic
            const jsResponse = await fetch(`/views/${this.name}.js`);
            if (jsResponse.ok) {
                const jsCode = await jsResponse.text();

                // Using Function to evaluate the code in a controlled scope
                this.logic = new Function('return ' + jsCode)();

                if (typeof this.logic.init !== 'function' || typeof this.logic.render !== 'function') {
                    throw new Error(`View ${this.name} must export init and render functions`);
                }
            }
        } catch (error) {
            console.error(`Error loading view ${this.name}:`, error);
        }
    }

    init(systemManager, entity) {
        if (this.logic && typeof this.logic.init === 'function') {
            this.logic.init(systemManager, entity);
        }
    }

    render(entity) {
        if (this.logic && typeof this.logic.render === 'function') {
            this.logic.render(entity);
        }
    }
}