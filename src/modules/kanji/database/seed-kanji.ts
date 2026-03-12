// src/database/seed-kanji.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { KanjiService } from '../kanji.service';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const kanjiService = app.get(KanjiService);

  const filePath = path.join(process.cwd(), 'joyokanji_full_complete.json');
  if (!fs.existsSync(filePath)) {
    console.error('❌ File không tồn tại!');
    return;
  }

  const rawData = fs.readFileSync(filePath, 'utf8');
  const kanjiList = JSON.parse(rawData);

  console.log(`🚀 Bắt đầu import ${kanjiList.length} từ...`);

  for (const item of kanjiList) {
    try {
      // 1. Xử lý Readings (Tách dòng \n)
      // Ví dụ JSON: "イチ, イツ\nひと, ひと-つ"
      // Dòng 1 là Onyomi (Katakana), Dòng 2 là Kunyomi (Hiragana)
      let onyomi = '';
      let kunyomi = '';

      if (item.readings) {
        const parts = item.readings.split('\n');
        onyomi = parts[0] || ''; // Lấy dòng đầu
        kunyomi = parts[1] || ''; // Lấy dòng thứ 2 (nếu có)
      }

      // 2. Xử lý Meanings (Tách dấu chấm phẩy ;)
      // Ví dụ JSON: "ONE; "one" radical"
      const meanings = item.meanings
        ? item.meanings.split(';').map((m) => m.trim()) // Tách và xóa khoảng trắng thừa
        : [];

      // 3. Tạo DTO chuẩn
      const kanjiDto = {
        kanji: item.kanji,
        onyomi: onyomi,
        kunyomi: kunyomi,
        meanings: meanings,
        mnemonic: item.mnemonic, // ✅ Lấy thêm trường này
        jlpt: 'Unknown', // Vì file JSON không có, tạm để Unknown hoặc N/A
      };

      // 4. Gọi service lưu (Nếu trùng kanji thì bỏ qua hoặc update tùy logic của bạn)
      // Bạn nên sửa service create để dùng upsert (nếu có rồi thì update) sẽ hay hơn
      await kanjiService.create(kanjiDto);
    } catch (error) {
      console.error(`❌ Lỗi nhập chữ ${item.kanji}:`, error.message);
    }
  }

  console.log('🎉 Import hoàn tất!');
  await app.close();
}

bootstrap();
