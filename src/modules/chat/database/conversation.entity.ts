// src/modules/chat/database/conversation.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../auth/database/user.entity'; // Kiểm tra lại đường dẫn User của bạn
import { Message } from './message.entity'; // 👇 Import Message từ file mới

@Entity('conversations')
export class Conversation {
  @ApiProperty({ example: 'uuid-string', description: 'ID cuộc hội thoại' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'private', description: 'Loại chat' })
  @Column({ default: 'private' })
  type: string;

  @ApiProperty({ type: () => [User], description: 'Danh sách người tham gia' })
  @ManyToMany(() => User)
  @JoinTable({ name: 'conversation_participants' })
  participants: User[];

  @ApiProperty({ description: 'Danh sách tin nhắn' })
  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  last_activity: Date;
}
