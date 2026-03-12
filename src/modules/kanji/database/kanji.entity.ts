// src/modules/kanji/entity/kanji.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Vocabulary } from '../../vocabulary/entity/vocabulary.entity';

@Entity('kanji')
export class Kanji {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  kanji: string;

  // 🔹 Cho phép null vì có chữ có Onyomi, có chữ không
  @Column({ nullable: true })
  onyomi: string;

  // 🔹 Cho phép null
  @Column({ nullable: true })
  kunyomi: string;

  @Column('simple-array')
  meanings: string[];

  // 🔹 Thêm cột Mnemonic (Dùng type 'text' vì mẹo nhớ có thể dài)
  @Column({ type: 'text', nullable: true })
  mnemonic: string;

  // 🔹 JSON không có JLPT, nên để nullable hoặc set default 'Unknown'
  @Column({ default: 'Unknown' })
  jlpt: string;

  @ManyToMany(() => Vocabulary, (vocabulary) => vocabulary.kanjiList)
  vocabularies: Vocabulary[];
}
