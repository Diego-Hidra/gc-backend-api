import { ChildEntity ,Column } from 'typeorm'
import { User } from './user.entity'


@ChildEntity('RESIDENT')
export class Resident extends User {

    @Column()
    phone_number: string;

    @Column()
    floor: string;

    @Column()
    apartament: string;

}