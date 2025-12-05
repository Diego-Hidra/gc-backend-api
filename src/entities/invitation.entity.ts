import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Resident } from './resident.entity';
import { Visitor } from './visitor.entity';

export enum InvitationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  USED = 'USED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

@Entity('invitations')
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  rut: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'timestamp' })
  scheduledDate: Date;

  @Column({ type: 'timestamp' })
  expirationDate: Date;

  @Column({ nullable: true })
  qrCode: string;

  @Column({ type: 'text', nullable: true })
  qrSignature: string;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @Column({ nullable: true })
  notes: string;

  @Column({ default: false })
  hasVehicle: boolean;

  @Column({ type: 'jsonb', nullable: true })
  vehicleInfo: {
    licensePlate: string;
    brand: string;
    model: string;
    color?: string;
  };

  @Column({ type: 'timestamp', nullable: true })
  checkInTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  checkOutTime: Date;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  cancellationReason: string;

  @ManyToOne(() => Resident, { eager: true })
  @JoinColumn({ name: 'residentId' })
  resident: Resident;

  @Column()
  residentId: string;

  @ManyToOne(() => Visitor, { nullable: true, eager: true })
  @JoinColumn({ name: 'visitorId' })
  visitor?: Visitor;

  @Column({ nullable: true })
  visitorId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
