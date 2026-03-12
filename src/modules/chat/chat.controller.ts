import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import {
  InitConversationDto,
  SendMessageDto,
  MarkReadDto,
} from './dtos/chat.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('09. Chat System')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'))
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('sidebar')
  @ApiOperation({ summary: 'Lấy danh sách chat (cho Giáo viên/Admin)' })
  getSidebar(@Req() req) {
    return this.chatService.getMessengerSidebar(req.user.user_id);
  }

  // 👇 API QUAN TRỌNG: Học sinh bấm nút chat gọi cái này
  @Post('support')
  @ApiOperation({ summary: 'Kết nối hỗ trợ (Tự tìm GV phụ trách)' })
  async connectSupport(@Req() req) {
    return this.chatService.getSupportConversation(req.user.user_id);
  }

  @Post('init')
  @ApiOperation({ summary: 'Tạo chat thủ công (nếu cần)' })
  initConversation(@Body() dto: InitConversationDto, @Req() req) {
    return this.chatService.createOrGetConversation(
      req.user.user_id,
      dto.targetUserId,
    );
  }

  @Post('message')
  @ApiOperation({ summary: 'Gửi tin nhắn (REST)' })
  sendMessage(@Body() dto: SendMessageDto, @Req() req) {
    return this.chatService.saveMessage(
      req.user.user_id,
      dto.conversationId,
      dto.content,
    );
  }

  @Post('read')
  @ApiOperation({ summary: 'Đánh dấu đã đọc' })
  markRead(@Body() dto: MarkReadDto, @Req() req) {
    return this.chatService.markAsRead(dto.conversationId, req.user.user_id);
  }

  @Get('unread')
  @ApiOperation({ summary: 'Lấy tổng số tin nhắn chưa đọc' })
  async getUnreadCount(@Req() req) {
    const count = await this.chatService.getUnreadCount(req.user.user_id);
    return { count };
  }
}
