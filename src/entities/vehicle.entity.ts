import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Resident } from './resident.entity';

export enum VehicleType {
  SEDAN = 'SEDAN',
  SUV = 'SUV',
  HATCHBACK = 'HATCHBACK',
  PICKUP = 'PICKUP',
  VAN = 'VAN',
  MOTORCYCLE = 'MOTORCYCLE',
  OTHER = 'OTHER',
}

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  licensePlate: string;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column()
  color: string;

  @Column({
    type: 'enum',
    enum: VehicleType,
    default: VehicleType.SEDAN,
  })
  type: VehicleType;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  deleteReason?: string;

  @Column({ nullable: true })
  deleteNotes?: string;

  @ManyToOne(() => Resident, { eager: true })
  @JoinColumn({ name: 'residentId' })
  resident: Resident;

  @Column()
  residentId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
