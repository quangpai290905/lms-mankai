import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: '*' } })
// 👇 Thêm implements OnGatewayConnection
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  // 👇 1. KHI CLIENT KẾT NỐI -> JOIN VÀO ROOM RIÊNG (theo User ID)
  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      client.join(userId);
      console.log(`Client ${client.id} joined personal room: ${userId}`);
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(conversationId);
    console.log(`Client ${client.id} joined conversation: ${conversationId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    payload: {
      conversationId: string;
      senderId: string;
      content: string;
    },
  ) {
    // 1. Lưu tin nhắn vào DB
    const savedMsg = await this.chatService.saveMessage(
      payload.senderId,
      payload.conversationId,
      payload.content,
    );

    // 2. Gửi sự kiện cho những người đang mở box chat này (Realtime Chat)
    this.server.to(payload.conversationId).emit('receiveMessage', savedMsg);

    // 👇 3. GỬI THÔNG BÁO CHO NGƯỜI NHẬN (Notification)
    // Chúng ta cần tìm xem ai là người nhận trong cuộc hội thoại này để bắn thông báo
    const conversation = await this.chatService.getConversationById(
      payload.conversationId,
    );
    if (conversation) {
      conversation.participants.forEach((participant) => {
        // Nếu participant không phải là người gửi -> Bắn thông báo
        if (participant.user_id !== payload.senderId) {
          this.server.to(participant.user_id).emit('receiveMessage', savedMsg);
        }
      });
    }
  }
}
