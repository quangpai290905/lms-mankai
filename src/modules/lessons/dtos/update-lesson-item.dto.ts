import { PartialType } from '@nestjs/swagger'; // Dùng swagger để kế thừa cả ApiProperty
import { CreateLessonItemDto } from './create-lesson-item.dto';

export class UpdateLessonItemDto extends PartialType(CreateLessonItemDto) {}
