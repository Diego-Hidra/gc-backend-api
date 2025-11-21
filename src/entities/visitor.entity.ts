import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Resident } from './resident.entity';

export enum VisitorStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_PROPERTY = 'IN_PROPERTY',
  COMPLETED = 'COMPLETED',
}

@Entity('visitors')
export class Visitor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  rut: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({
    type: 'enum',
    enum: VisitorStatus,
    default: VisitorStatus.PENDING,
  })
  status: VisitorStatus;

  @Column()
  visitPurpose: string;

  @Column({ type: 'timestamp' })
  scheduledDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  checkInTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  checkOutTime: Date;

  @Column({ default: false })
  hasVehicle: boolean;

  @Column({ type: 'jsonb', nullable: true })
  vehicleInfo: {
    licensePlate: string;
    brand: string;
    model: string;
    color?: string;
  };

  @Column({ nullable: true })
  notes: string;

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
