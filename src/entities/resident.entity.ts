import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserRole } from './user.entity';

@Entity('residents')
export class Resident {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  rut: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.RESIDENT,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  block: string;

  @Column()
  lotNumber: string;

  @Column({ nullable: true })
  floor: string;

  @Column({ nullable: true })
  apartment: string;

  @Column({ type: 'uuid', nullable: true })
  buildingId: string;

  @Column({ type: 'vector', nullable: true })
  faceVector: string;

  @Column({ type: 'text', nullable: true })
  profilePicture: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}