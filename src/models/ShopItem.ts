import { Entity, Column, BaseEntity, PrimaryColumn, ManyToMany } from "typeorm"
import { State } from "./State";

@Entity()
export class ShopItem extends BaseEntity {
    @PrimaryColumn()
    id!: string;

    @Column()
    type!: string

    @Column()
    name!: string

    @Column()
    description!: string

    @Column({ default: 0 })
    price!: number

    @Column({ default: 1 })
    tap_power!: number

    @ManyToMany(() => State, state => state.shopItems)
    states!: State[];
}

