import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';

import { Conversation } from './database/conversation.entity';
import { Message } from './database/message.entity';
import { User } from '../auth/database/user.entity';
// 👇 Import Enrollment
import { Enrollment } from '../classes/database/enrollment.entity';

@Module({
  imports: [
    // 👇 Thêm Enrollment vào danh sách
    TypeOrmModule.forFeature([Conversation, Message, User, Enrollment]),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
