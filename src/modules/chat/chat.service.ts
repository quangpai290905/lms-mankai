import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { Conversation } from './database/conversation.entity';
import { Message } from './database/message.entity';
import { User } from '../auth/database/user.entity';
// 👇 1. Import đúng Enrollment và Class status từ file bạn cung cấp
import { Enrollment } from '../classes/database/enrollment.entity';
import { ClassStatus } from '../classes/database/class.entity';
@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation) private convRepo: Repository<Conversation>,
    @InjectRepository(Message) private msgRepo: Repository<Message>,
    @InjectRepository(User) private userRepo: Repository<User>,
    // 👇 2. Inject Enrollment Repository
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
  ) {}

  // ... (Giữ nguyên các hàm createOrGetConversation, saveMessage, getMessengerSidebar, markAsRead cũ)

  async createOrGetConversation(currentUserId: string, targetUserId: string) {
    // ... code cũ (giữ nguyên)
    const query = this.convRepo
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participant')
      .leftJoinAndSelect('conversation.messages', 'messages')
      .leftJoinAndSelect('messages.sender', 'sender');

    const allConversations = await query.getMany();
    const existing = allConversations.find((c) => {
      const pIds = c.participants.map((p) => p.user_id);
      return (
        pIds.includes(currentUserId) &&
        pIds.includes(targetUserId) &&
        pIds.length === 2
      );
    });

    if (existing) {
      existing.messages.sort(
        (a, b) => a.created_at.getTime() - b.created_at.getTime(),
      );
      return existing;
    }

    const user1 = await this.userRepo.findOneBy({
      user_id: currentUserId,
    } as any);
    const user2 = await this.userRepo.findOneBy({
      user_id: targetUserId,
    } as any);
    if (!user1 || !user2) throw new Error('User not found');

    const newConv = this.convRepo.create({
      type: 'private',
      participants: [user1, user2],
      last_activity: new Date(),
    });
    return this.convRepo.save(newConv);
  }

  async saveMessage(senderId: string, conversationId: string, content: string) {
    const msg = await this.msgRepo.save({
      content,
      sender: { user_id: senderId },
      conversation: { id: conversationId },
      is_read: false,
    });
    await this.convRepo.update(conversationId, { last_activity: new Date() });
    return msg;
  }

  async getMessengerSidebar(currentUserId: string) {
    // ... code cũ (giữ nguyên)
    const conversations = await this.convRepo
      .createQueryBuilder('conversation')
      .innerJoinAndSelect('conversation.participants', 'participant')
      .innerJoinAndSelect('conversation.participants', 'partner')
      .where('participant.user_id = :id', { id: currentUserId })
      .andWhere('partner.user_id != :id', { id: currentUserId })
      .orderBy('conversation.last_activity', 'DESC')
      .getMany();

    const result = await Promise.all(
      conversations.map(async (conv) => {
        const lastMsg = await this.msgRepo.findOne({
          where: { conversation: { id: conv.id } },
          order: { created_at: 'DESC' },
        });
        const partner = conv.participants.find(
          (p) => p.user_id !== currentUserId,
        );
        const unreadCount = await this.msgRepo.count({
          where: {
            conversation: { id: conv.id },
            is_read: false,
            sender: { user_id: partner.user_id },
          },
        });

        return {
          conversation_id: conv.id,
          partner_id: partner.user_id,
          full_name: partner.full_name,
          avatar: partner.avatar,
          role: partner.role,
          last_msg: lastMsg ? lastMsg.content : '',
          last_time: conv.last_activity,
          unread: unreadCount,
        };
      }),
    );
    return result;
  }

  async markAsRead(conversationId: string, currentUserId: string) {
    await this.msgRepo.update(
      {
        conversation: { id: conversationId },
        sender: { user_id: Not(currentUserId) },
        is_read: false,
      },
      { is_read: true },
    );
  }

  // 👇 3. LOGIC MỚI: TÌM GIÁO VIÊN PHỤ TRÁCH (Cập nhật theo entity của bạn)
  async findSupportHandler(studentId: string) {
    // A. Tìm lớp học ACTIVE hoặc PENDING gần nhất mà học sinh đang tham gia
    // Trong file enrollment.entity.ts của bạn, relation tên là 'class'
    const latestEnrollment = await this.enrollmentRepo.findOne({
      where: {
        student: { user_id: studentId },
        class: { status: In([ClassStatus.ACTIVE, ClassStatus.PENDING]) }, // Chỉ tìm lớp đang học
      },
      relations: ['class', 'class.teachers'], // 👉 SỬA: 'class.teachers' (số nhiều)
      order: { joined_at: 'DESC' },
    });

    // B. Nếu tìm thấy lớp và lớp đó có giáo viên
    if (
      latestEnrollment &&
      latestEnrollment.class &&
      latestEnrollment.class.teachers.length > 0
    ) {
      // Vì quan hệ là ManyToMany, lấy giáo viên đầu tiên trong danh sách
      return latestEnrollment.class.teachers[0];
    }

    // C. Fallback: Nếu không học lớp nào, tìm Admin để hỗ trợ
    const admin = await this.userRepo.findOne({
      where: { role: 'admin' as any }, // Hoặc check role UserRole.ADMIN
    });

    if (!admin) {
      throw new NotFoundException(
        'Hệ thống chưa có Admin hoặc Giáo viên hỗ trợ',
      );
    }

    return admin;
  }

  // 👇 4. API gọi hàm này
  async getSupportConversation(studentId: string) {
    const teacher = await this.findSupportHandler(studentId);
    // Tạo hội thoại với giáo viên tìm được
    return this.createOrGetConversation(studentId, teacher.user_id);
  }

  async getUnreadCount(userId: string) {
    return this.msgRepo
      .createQueryBuilder('message')
      .innerJoin('message.conversation', 'conversation')
      .innerJoin('conversation.participants', 'participant')
      .where('participant.user_id = :userId', { userId }) // Tin nhắn thuộc hội thoại mình tham gia
      .andWhere('message.sender.user_id != :userId', { userId }) // Tin nhắn KHÔNG phải do mình gửi
      .andWhere('message.is_read = :status', { status: false }) // Chưa đọc
      .getCount();
  }

  async getConversationById(conversationId: string) {
    return this.convRepo.findOne({
      where: { id: conversationId },
      relations: ['participants'], // Cần lấy participants để biết gửi cho ai
    });
  }
}
