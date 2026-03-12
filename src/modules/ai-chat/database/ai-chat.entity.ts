// ai-chat.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';

@Entity()
export class AiChatSession {
  @PrimaryGeneratedColumn()
  id: number;

  // 👇 SỬA Ở ĐÂY: đổi number thành string để lưu UUID
  @Column()
  userId: string;

  @Column()
  topic: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => AiChatMessage, (message) => message.session)
  messages: AiChatMessage[];
}

// ... (Phần dưới giữ nguyên)
@Entity()
export class AiChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: ['user', 'assistant'] })
  role: string;

  @Column({ type: 'text', nullable: true })
  correction: string;

  @Column({ type: 'text', nullable: true })
  vietnameseTranslation: string;

  @ManyToOne(() => AiChatSession, (session) => session.messages)
  session: AiChatSession;
}
