import { Entity, Column, OneToMany, BaseEntity } from "typeorm"
import { Referral } from "./Referral"

@Entity()
export class User extends BaseEntity {
    @Column({ primary: true })
    id!: number

    @Column()
    first_name!: string;

    @Column({ nullable: true })
    last_name!: string;

    @Column()
    username!: string;

    @Column({ nullable: true })
    language_code!: string;

    @Column({ default: 0 })
    energy!: number

    @Column({ default: 0 })
    coins!: number

    @Column({ default: 1 })
    tap_power!: number

    @OneToMany(() => Referral, referral => referral.inviter)
    referrals!: Referral[]
}