import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Resident } from './resident.entity';

@Entity('frequent_visitors')
export class FrequentVisitor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  rut: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ default: 0 })
  visitCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastVisit?: Date;

  @Column({ nullable: true })
  notes?: string;

  @Column({ default: false })
  hasVehicle: boolean;

  @Column({ type: 'jsonb', nullable: true })
  vehicleInfo?: {
    licensePlate: string;
    brand: string;
    model: string;
    color?: string;
  };

  @Column({ default: true })
  isActive: boolean;

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
