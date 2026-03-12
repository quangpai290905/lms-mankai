import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vocabulary } from './entity/vocabulary.entity';
import { Topic } from '../topic/entity/topic.entity';
import { Kanji } from '../kanji/database/kanji.entity';
import { VocabularyController } from './vocabulary.controller';
import { VocabularyService } from './vocabulary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vocabulary, Topic, Kanji])],
  controllers: [VocabularyController],
  providers: [VocabularyService],
})
export class VocabularyModule {}
