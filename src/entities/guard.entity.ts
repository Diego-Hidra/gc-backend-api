import { ChildEntity, Column } from 'typeorm'
import { User } from './user.entity'


@ChildEntity('GUARD')
export class Guard extends User {

    @Column()
    phone_number: string;

}