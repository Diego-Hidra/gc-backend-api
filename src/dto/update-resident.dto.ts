import { PartialType } from '@nestjs/mapped-types'
import { CreateResidentDTO } from './create-resident.dto'


export class UpdateResidentDTO extends PartialType(CreateResidentDTO) {}
