import { Entity, Column, BaseEntity, PrimaryColumn, OneToOne, JoinColumn } from "typeorm"
import { State } from "./State"

@Entity()
export class Inventory extends BaseEntity {
    @PrimaryColumn()
    id!: string;

    @OneToOne(() => State)
    @JoinColumn()
    state!: State;

    @Column("simple-json", { nullable: true })
    items!: { [key: string]: number };

    @Column("simple-json", { nullable: true })
    upgrades!: { [key: string]: number };
    

    // Method to add an item to the inventory
    addItem(itemName: string, quantity: number = 1) {
        if (!this.items) {
            this.items = {};
        }
        this.items[itemName] = (this.items[itemName] || 0) + quantity;
    }

    // Method to remove an item from the inventory
    removeItem(itemName: string, quantity: number = 1) {
        if (this.items && this.items[itemName]) {
            this.items[itemName] -= quantity;
            if (this.items[itemName] <= 0) {
                delete this.items[itemName];
            }
        }
    }

    // Method to check if an item exists in the inventory
    hasItem(itemName: string): boolean {
        return this.items && itemName in this.items;
    }

    // Method to get the quantity of an item
    getItemQuantity(itemName: string): number {
        return this.items && this.items[itemName] ? this.items[itemName] : 0;
    }

    // Method to add an upgrade
    addUpgrade(upgradeName: string, level: number = 1) {
        if (!this.upgrades) {
            this.upgrades = {};
        }
        this.upgrades[upgradeName] = (this.upgrades[upgradeName] || 0) + level;
    }

    // Method to get upgrade level
    getUpgradeLevel(upgradeName: string): number {
        return this.upgrades && this.upgrades[upgradeName] ? this.upgrades[upgradeName] : 0;
    }
}