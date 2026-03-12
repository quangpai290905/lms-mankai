import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveImageDto {
  @ApiProperty({
    description: 'Public ID của ảnh trên Cloudinary cần xóa',
    example: 'your_image_public_id',
  })
  @IsNotEmpty()
  @IsString()
  public_id: string;
}
