import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum LogType {
  ACCESS = 'access',
  VISITOR = 'visitor',
  VEHICLE = 'vehicle',
  INCIDENT = 'incident',
  SYSTEM = 'system',
}

export enum LogAction {
  // Access logs
  CHECK_IN = 'check_in',
  CHECK_OUT = 'check_out',
  ACCESS_DENIED = 'access_denied',
  ACCESS_GRANTED = 'access_granted',
  
  // Visitor logs
  VISITOR_REGISTERED = 'visitor_registered',
  VISITOR_APPROVED = 'visitor_approved',
  VISITOR_REJECTED = 'visitor_rejected',
  INVITATION_CREATED = 'invitation_created',
  INVITATION_USED = 'invitation_used',
  INVITATION_CANCELLED = 'invitation_cancelled',
  
  // Vehicle logs
  VEHICLE_REGISTERED = 'vehicle_registered',
  VEHICLE_UPDATED = 'vehicle_updated',
  VEHICLE_DELETED = 'vehicle_deleted',
  VEHICLE_ACTIVATED = 'vehicle_activated',
  
  // Incident logs
  INCIDENT_REPORTED = 'incident_reported',
  INCIDENT_RESOLVED = 'incident_resolved',
  
  // System logs
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  SYSTEM_ERROR = 'system_error',
  CONFIG_CHANGED = 'config_changed',
}

@Entity('logs')
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: LogType,
  })
  type: LogType;

  @Column({
    type: 'enum',
    enum: LogAction,
  })
  action: LogAction;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 100, nullable: true })
  entityType: string; // 'visitor', 'vehicle', 'invitation', etc.

  @Column({ type: 'uuid', nullable: true })
  entityId: string; // ID del registro relacionado

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>; // Detalles adicionales del evento

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Metadata adicional (IP, dispositivo, etc.)

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ type: 'varchar', length: 20, default: 'info' })
  severity: string; // 'info', 'warning', 'error', 'critical'
}
