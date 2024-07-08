import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity } from "typeorm"
import { User } from "./User"

@Entity()
export class Referral extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    inviterId!: number

    @ManyToOne(() => User, user => user.referrals)
    inviter!: User

    @Column({ default: 'pending' })
    status!: string
}