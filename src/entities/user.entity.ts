import { Entity, TableInheritance, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('users')
@TableInheritance({
    column: {
        name: 'user_type',
        type: 'varchar',
        default: 'user'
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


    
}