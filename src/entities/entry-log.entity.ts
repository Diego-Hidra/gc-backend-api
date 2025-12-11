import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Visitor } from './visitor.entity';
import { Resident } from './resident.entity';
import { Guard } from './guard.entity';
import { Vehicle } from './vehicle.entity';
import { Invitation } from './invitation.entity';

export enum EntryMethod {
  FACIAL = 'facial',
  LPR = 'lpr',
  QR = 'qr',
  MANUAL = 'manual',
  INVITATION = 'invitation',
}

@Entity('entry_logs')
export class EntryLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: EntryMethod,
    name: 'entryMethod',
  })
  entryMethod: EntryMethod;

  // Referencias a entidades involucradas
  @Column({ type: 'uuid', nullable: true, name: 'visitorId' })
  visitorId: string;

  @ManyToOne(() => Visitor, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'visitorId' })
  visitor: Visitor;

  @Column({ type: 'uuid', nullable: true, name: 'residentId' })
  residentId: string;

  @ManyToOne(() => Resident, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'residentId' })
  resident: Resident;

  @Column({ type: 'uuid', nullable: true, name: 'guardId' })
  guardId: string;

  @ManyToOne(() => Guard, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'guardId' })
  guard: Guard;

  @Column({ type: 'uuid', nullable: true, name: 'vehicleId' })
  vehicleId: string;

  @ManyToOne(() => Vehicle, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @Column({ type: 'uuid', nullable: true, name: 'invitationId' })
  invitationId: string;

  @ManyToOne(() => Invitation, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'invitationId' })
  invitation: Invitation;

  // Timestamps de entrada/salida
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'arrivalTime' })
  arrivalTime: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'departureTime' })
  departureTime: Date;

  // Payload con datos crudos del evento (de IA, RabbitMQ, etc.)
  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, any>;

  // Metadatos adicionales
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
