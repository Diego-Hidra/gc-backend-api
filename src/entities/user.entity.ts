import { Entity, TableInheritance, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('users')
@TableInheritance({
    column: {
        name: 'user_type',
        type: 'varchar'
    }
})
export class User{

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    rut: string;

    @Column()
    name: string;

    @Column()
    lastname: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column({
        name: 'user_type',
        type: 'varchar',
        default: 'user'
    })
    user_type: string; 

    
}