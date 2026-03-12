// src/modules/chat/database/message.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../auth/database/user.entity'; // Kiểm tra lại đường dẫn User
import { Conversation } from './conversation.entity'; // 👇 Import Conversation từ file mới

@Entity('messages')
export class Message {
  @ApiProperty({ example: 'uuid-string', description: 'ID tin nhắn' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Nội dung tin nhắn...', description: 'Nội dung' })
  @Column('text')
  content: string;

  @ApiProperty({ type: () => User, description: 'Người gửi' })
  @ManyToOne(() => User, { eager: true })
  sender: User;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  conversation: Conversation;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @Column({ default: false })
  is_read: boolean;
}
