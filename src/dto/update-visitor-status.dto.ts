import { IsEnum, IsNotEmpty } from 'class-validator';
import { VisitorStatus } from '../entities/visitor.entity';

export class UpdateVisitorStatusDto {
  @IsEnum(VisitorStatus)
  @IsNotEmpty()
  status: VisitorStatus;
}
