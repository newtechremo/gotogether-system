import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateExaminationDto } from './create-examination.dto';

export class UpdateExaminationDto extends PartialType(
  OmitType(CreateExaminationDto, ['kioskId'] as const),
) {}
