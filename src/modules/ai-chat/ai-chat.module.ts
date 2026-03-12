import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiChatService } from './ai-chat.service';
import { AiChatController } from './ai-chat.controller';
import { AiChatSession, AiChatMessage } from './database/ai-chat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiChatSession, AiChatMessage])],
  controllers: [AiChatController],
  providers: [AiChatService],
})
export class AiChatModule {}
