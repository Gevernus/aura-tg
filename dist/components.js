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
    constructor(monsters = []) {
        this.incomePerHour = 0;
        this.calculate(monsters);
    }

    calculate(monsters) {
        for (const monster of monsters) {
            this.incomePerHour += monster.incomePerHour;
        }
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

class MonsterData {
    constructor(id, name, type, description, rarity, effect, image, level, incomePerLevel, basePrice) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.description = description;
        this.rarity = rarity;
        this.effect = effect;
        this.image = image;
        update(level, incomePerLevel, basePrice);
    }

    update(level, incomePerLevel, basePrice) {
        this.level = level;
        this.incomePerHour = incomePerLevel * data.level;
        this.price = Math.round(basePrice * Math.pow(1.30, level));
    }
}

export class MonstersComponent {
    constructor(data = [], config) {
        this.config = config;
        this.updateItems(data);
    }

    updateItems(data) {
        this.items = data.map(item => new MonsterData(
            item.id,
            item.name,
            item.type,
            item.description,
            item.rarity,
            item.effect,
            item.image,
            item.userMonsters[0].level,
            this.config.cardConfigs[item.rarity].incomePerLevel,
            this.config.cardConfigs[item.rarity].basePrice,
        ));
    }

    updateItem(data) {
        this.items = this.items.map(existingItem => {
            if (existingItem.id === data.id) {
                existingItem.update(data.level,
                    this.config.cardConfigs[data.rarity].incomePerLevel,
                    this.config.cardConfigs[data.rarity].basePrice);
            }
            return existingItem;
        });
    }

    getMonsterById(id) {
        const result = this.items.find(monster => monster.id == id);
        console.log(`Result: ${result}`);
        return result;
    }
}

export class ReferralsComponent {
    constructor(referrals = []) {
        this.referrals = referrals;
    }
}

export class ConfigComponent {
    constructor(config) {
        this.config = config;
    }
}

export class UserComponent {
    constructor(user) {
        this.user = user;
    }
}

export class InputComponent {
    constructor() {
        this.inputQueue = [];
    }

    addInput(inputType, data = {}) {
        this.inputQueue.push({
            type: inputType,
            timestamp: Date.now(),
            data,
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
            // const jsResponse = await fetch(`/views/${this.name}.js`);
            this.logic = await import(`/views/${this.name}.js`);
            if (typeof this.logic.init !== 'function' || typeof this.logic.render !== 'function') {
                throw new Error(`View ${this.name} must export init and render functions`, this.logic);
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