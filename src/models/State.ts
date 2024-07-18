import { Entity, Column, BaseEntity, PrimaryColumn, OneToOne, ManyToMany, JoinTable } from "typeorm"
import { Inventory } from "./Inventory";
import { ShopItem } from "./ShopItem";

@Entity()
export class State extends BaseEntity {
    @PrimaryColumn()
    id!: string;

    @Column({ default: 500 })
    energy!: number

    @Column({ default: 500 })
    max_energy!: number

    @Column({ default: 1 })
    energy_restore!: number

    @Column({ default: 1 })
    level!: number

    @Column({ default: 0 })
    coins!: number

    @Column({ default: 0 })
    passive_income!: number

    @Column({ default: 0 })
    progress!: number

    @Column({ default: 1 })
    tap_power!: number

    @OneToOne(() => Inventory, state => state.state)
    inventory!: Inventory;

    @ManyToMany(() => ShopItem, shopItem => shopItem.states)
    @JoinTable()
    shopItems!: ShopItem[];
}

