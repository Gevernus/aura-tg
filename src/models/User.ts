import { Entity, Column, OneToMany, BaseEntity, PrimaryColumn } from "typeorm"
import { Referral } from "./Referral"

@Entity()
export class User extends BaseEntity {
    @PrimaryColumn()
    id!: string;

    @Column()
    first_name!: string;

    @Column({ nullable: true })
    last_name!: string;

    @Column()
    username!: string;

    @Column({ nullable: true })
    language_code!: string;

    @Column({ default: 500 })
    energy!: number

    @Column({ default: 1 })
    level!: number

    @Column({ default: 0 })
    coins!: number

    @Column({ default: 10 })
    passive_income!: number

    @Column({ default: 0 })
    progress!: number

    @Column({ default: 1 })
    tap_power!: number

    @OneToMany(() => Referral, referral => referral.inviter)
    referrals!: Referral[]
}