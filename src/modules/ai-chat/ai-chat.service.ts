import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AiChatSession, AiChatMessage } from './database/ai-chat.entity';
import axios from 'axios';

@Injectable()
export class AiChatService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    @InjectRepository(AiChatSession)
    private sessionRepo: Repository<AiChatSession>,
    @InjectRepository(AiChatMessage)
    private messageRepo: Repository<AiChatMessage>,
  ) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Bạn yêu cầu giữ model mạnh nhất. Hiện tại Google mới public 'gemini-1.5-pro'
    // hoặc 'gemini-2.0-flash-exp' (bản preview).
    // 'gemini-2.5' chưa có API chính thức nên sẽ gây lỗi 404.
    // Tôi để tạm 'gemini-1.5-pro' để code chạy được, bạn có thể sửa lại string này.
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  // --- [FIXED] Nhận userId là string (UUID) ---
  async getUserHistory(userId: string) {
    if (!userId) return []; // Bỏ check isNaN vì UUID là chuỗi

    return this.sessionRepo.find({
      where: { userId: userId as any }, // Ép kiểu nếu entity cũ của bạn vẫn khai báo là number
      order: { createdAt: 'DESC' },
      select: ['id', 'topic', 'createdAt'],
    });
  }

  // [FIXED] Nhận userId là string
  async createSession(userId: string, topic: string) {
    // Lưu ý: Bạn cần chắc chắn cột userId trong bảng AiChatSession đã đổi sang kiểu varchar/uuid trong Database
    const session = this.sessionRepo.create({ userId: userId as any, topic });
    return this.sessionRepo.save(session);
  }

  async chat(sessionId: number, userText: string) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
      relations: ['messages'],
    });
    if (!session) throw new Error('Session not found');

    const userMsg = this.messageRepo.create({
      content: userText,
      role: 'user',
      session: session,
    });
    await this.messageRepo.save(userMsg);

    const history = session.messages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const systemInstruction = `
      Vai trò: Bạn là Sensei (Giáo viên tiếng Nhật) dạy cho học sinh người Việt Nam.
      Chủ đề: "${session.topic}".

      Nhiệm vụ của bạn là phân loại Input của User:

      TRƯỜNG HỢP 1: User nói Tiếng Nhật (kể cả Tiếng Nhật sai ngữ pháp hoặc viết bằng Hiragana/Katakana/Romaji):
      - Hãy đóng vai giáo viên, trả lời tiếp câu chuyện thật tự nhiên (ngắn gọn 1-2 câu).
      - Sửa lỗi sai trong phần 'correction'.

      TRƯỜNG HỢP 2: User nói Tiếng Việt, Tiếng Anh, hoặc ngôn ngữ khác:
      - Đừng trả lời hội thoại.
      - Hãy hiểu ý nghĩa câu đó và DỊCH nó sang tiếng Nhật tự nhiên.
      - Hướng dẫn họ cách nói câu đó trong phần 'correction'.

      Quy định JSON (Bắt buộc):
      {
        "reply": "Câu trả lời tiếng Nhật (hoặc câu dịch nếu rơi vào TH2)",
        "translation": "Dịch ý nghĩa câu reply sang tiếng Việt",
        "correction": "Giải thích lỗi sai HOẶC Hướng dẫn cách nói (Dùng 100% Tiếng Việt).\nĐịnh dạng xuống dòng:\n❌ Bạn nói: ...\n✅ Tiếng Nhật chuẩn: ...\n💡 Hướng dẫn: ..."
      }

      Ví dụ 1 (User nói Tiếng Anh - TH2):
      User: "I want to eat sushi"
      JSON: {
        "reply": "お寿司が食べたいです。(Osushi ga tabetai desu)",
        "translation": "Tôi muốn ăn sushi.",
        "correction": "💡 Hướng dẫn: Bạn vừa dùng Tiếng Anh. Để nói câu này bằng tiếng Nhật:\n✅ Tiếng Nhật: お寿司が食べたいです (Osushi ga tabetai desu)"
      }

      Ví dụ 2 (User nói Tiếng Nhật sai - TH1):
      User: "Tabemono samui"
      JSON: {
        "reply": "冷たい食べ物がいいですね。",
        "translation": "Đồ ăn lạnh thì được đấy nhỉ.",
        "correction": "❌ Bạn nói: samui\n✅ Nên dùng: tsumetai\n💡 Lý do: Samui chỉ dùng cho thời tiết. Đồ ăn thì dùng Tsumetai."
      }
    `;

    const chat = this.model.startChat({
      history: [...history],
    });

    const result = await chat.sendMessage(
      systemInstruction + '\nUser: ' + userText,
    );
    const responseText = result.response.text();

    const cleanJson = responseText.replace(/```json|```/g, '').trim();
    let aiData;
    try {
      // 1. Tìm vị trí dấu { đầu tiên và } cuối cùng
      const startIndex = responseText.indexOf('{');
      const endIndex = responseText.lastIndexOf('}');

      if (startIndex !== -1 && endIndex !== -1) {
        // 2. Cắt đúng đoạn JSON ra
        const jsonStr = responseText.substring(startIndex, endIndex + 1);
        aiData = JSON.parse(jsonStr);
      } else {
        throw new Error('No JSON found');
      }
    } catch (e) {
      // Fallback: Nếu không parse được JSON, cố gắng làm sạch text thô nhất có thể
      console.error('JSON Parse Error:', e);
      const cleanText = responseText.replace(/```json|```/g, '').trim();
      aiData = {
        reply: cleanText,
        correction: null,
        translation: '',
      };
    }

    const aiMsg = this.messageRepo.create({
      content: aiData.reply,
      role: 'assistant',
      correction: aiData.correction,
      vietnameseTranslation: aiData.translation,
      session: session,
    });
    await this.messageRepo.save(aiMsg);

    return aiMsg;
  }

  async getSession(id: number) {
    return this.sessionRepo.findOne({
      where: { id },
      relations: ['messages'],
      order: { messages: { id: 'ASC' } } as any,
    });
  }

  async getTextToSpeech(text: string, lang: string): Promise<any> {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
    try {
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Referer: 'http://translate.google.com/',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error('TTS Error');
    }
  }
}
