import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsString } from 'class-validator';

export class InitConversationDto {
  @ApiProperty({
    description: 'ID của người dùng mục tiêu',
    example: 'uuid-user-id',
  })
  @IsNotEmpty()
  @IsUUID()
  targetUserId: string;
}

export class SendMessageDto {
  @ApiProperty({ description: 'ID cuộc hội thoại' })
  @IsNotEmpty()
  @IsUUID()
  conversationId: string;

  @ApiProperty({ description: 'Nội dung tin nhắn' })
  @IsNotEmpty()
  @IsString()
  content: string;
}

// 👇 Thêm DTO này
export class MarkReadDto {
  @ApiProperty({ description: 'ID cuộc hội thoại cần đánh dấu đã đọc' })
  @IsNotEmpty()
  @IsUUID()
  conversationId: string;
}
