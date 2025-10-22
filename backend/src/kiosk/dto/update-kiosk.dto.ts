import { PartialType } from '@nestjs/swagger';
import { CreateKioskDto } from './create-kiosk.dto';

export class UpdateKioskDto extends PartialType(CreateKioskDto) {}
