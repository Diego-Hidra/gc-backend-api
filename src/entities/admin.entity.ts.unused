import { ChildEntity, Column } from 'typeorm';
import { User } from './user.entity';


@ChildEntity('ADMIN')
export class Admin extends User {

    @Column()
    phone_number: string;

    @Column({ type: 'simple-array' })
    roles: string[];

}