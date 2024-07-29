export class CoinsComponent {
    constructor(amount = 0) {
        this.amount = amount;
    }
}

export class ClickPowerComponent {
    constructor(items = []) {
        this.calculate(items);
    }

    calculate(items) {
        this.power = 1;
        for (const item of items) {
            this.power += item.tap_bonus;
        }
    }
}

export class LevelComponent {
    constructor(level = 1) {
        this.setLevel(level);
    }

    setLevel(level) {
        this.level = Math.min(Math.max(1, level), 7);
    }
}

export class EnergyComponent {
    constructor(energy = 500, maxEnergy = 500, energyRestore = 1, items = []) {
        this.energy = energy;
        this.baseMaxEnergy = maxEnergy;
        this.energyRestore = energyRestore;
        this.calculate(items);
    }
    calculate(items) {
        this.maxEnergy = this.baseMaxEnergy;
        for (const item of items) {
            this.maxEnergy += item.energy_bonus;
        }
    }
}

export class PassiveIncomeComponent {
    constructor(monsters = [], items = [], referrals = []) {
        this.incomePerHour = 0;
        this.calculate(monsters, items, referrals);
    }

    calculate(monsters, items, referrals) {
        this.incomePerHour = 0;
        for (const monster of monsters) {
            this.incomePerHour += monster.incomePerHour;
        }

        for (const item of referrals) {
            this.incomePerHour += item.bonus;
        }

        const nonItemsIncome = this.incomePerHour;

        for (const item of items) {
            this.incomePerHour += item.passive_bonus * nonItemsIncome / 100;
        }
    }
}

export class InventoryComponent {
    constructor(items = []) {
        this.items = items;
    }

    addItems(newItems) {
        this.items = [...this.items, ...newItems];
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
        this.update(level, incomePerLevel, basePrice);
    }

    update(level, incomePerLevel, basePrice) {
        this.level = level;
        this.incomePerHour = incomePerLevel * level;
        this.incomePerHourNext = (incomePerLevel * (level + 1)) - this.incomePerHour;
        this.price = Math.round(basePrice * Math.pow(1.30, level));
    }
}

export class PacksComponent {
    constructor(items) {
        this.items = items;
    }
}

export class ReferralsComponent {
    constructor(items) {
        this.items = items;
    }
}

export class RatingsComponent {
    constructor(items) {
        this.items = items;
    }
}

export class TasksComponent {
    constructor(tasks) {
        console.log(`Initialize tasks: `, tasks);
        this.tasks = tasks;
        this.items = tasks;
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
            item.userMonsters[0] ? item.userMonsters[0].level : 0,
            this.config.cardConfigs[item.rarity].incomePerLevel,
            this.config.cardConfigs[item.rarity].basePrice,
        ));
    }

    updateItem(data) {
        this.items = this.items.map(existingItem => {
            if (existingItem.id == data.monster_id) {
                existingItem.update(data.level,
                    this.config.cardConfigs[data.monster.rarity].incomePerLevel,
                    this.config.cardConfigs[data.monster.rarity].basePrice);
            }
            return existingItem;
        });
    }

    getMonsterById(id) {
        return this.items.find(monster => monster.id == id);
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
    }

    getAndRemoveInputs(inputType) {
        const removedInputs = [];
        let i = 0;
        while (i < this.inputQueue.length) {
            if (this.inputQueue[i].type === inputType) {
                removedInputs.push(...this.inputQueue.splice(i, 1));
            } else {
                i++;
            }
        }
        return removedInputs;
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