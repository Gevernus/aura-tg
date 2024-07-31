import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class PackItem extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column()
    name!: string;

    @Column({ default: "" })
    description!: string;

    @Column({ default: 100 })
    price!: number

    @Column()
    image!: string
}