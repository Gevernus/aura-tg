import { Entity, Column, BaseEntity, ManyToMany, PrimaryGeneratedColumn } from "typeorm"
import { State } from "./State";

@Entity()
export class ShopItem extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column()
    name!: string

    @Column()
    description!: string

    @Column()
    rarity!: string

    @Column({ default: 1 })
    price!: number

    @Column("decimal", { precision: 5, scale: 2, default: 0 })
    passive_bonus!: number

    @Column("int", { nullable: true, default: 0 })
    tap_bonus!: number

    @Column("int", { nullable: true, default: 0 })
    stamina_bonus!: number

    @ManyToMany(() => State, state => state.shopItems)
    states!: State[];
}

