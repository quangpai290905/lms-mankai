// src/modules/kanji/kanji.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kanji } from './database/kanji.entity';
import { KanjiController } from './kanji.controller';
import { KanjiService } from './kanji.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Kanji]), // Đăng ký Entity
  ],
  controllers: [KanjiController],
  providers: [KanjiService],
  exports: [
    KanjiService, // Export để VocabularyService có thể gọi hàm find/create của Kanji
    TypeOrmModule, // Export để module khác dùng được repository Kanji nếu cần
  ],
})
export class KanjiModule {}
