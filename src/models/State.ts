import { Entity, Column, BaseEntity, PrimaryColumn, ManyToMany, JoinTable, BeforeUpdate } from "typeorm"
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

    @Column({ default: 100 })
    stars!: number

    @Column({ default: 0 })
    passive_income!: number

    @Column({ default: 0 })
    progress!: number

    @Column({ default: 1 })
    tap_power!: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    last_updated!: Date;

    @BeforeUpdate()
    updateLastUpdated() {
        this.last_updated = new Date();
    }
}

