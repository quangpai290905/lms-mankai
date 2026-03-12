import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kanji } from 'src/modules/kanji/database/kanji.entity';
import { Vocabulary } from '../modules/vocabulary/entity/vocabulary.entity';
import { Topic } from '../modules/topic/entity/topic.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Kanji, Vocabulary, Topic])],
  providers: [SeedService],
})
export class SeedModule {}
