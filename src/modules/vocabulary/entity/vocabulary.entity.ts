import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Topic } from '../../topic/entity/topic.entity'; //
import { Kanji } from '../../kanji/database/kanji.entity'; //

@Entity('vocabularies')
export class Vocabulary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  word: string;

  @Column()
  reading: string;

  @Column()
  meaning: string;

  @ManyToOne(() => Topic, (topic) => topic.vocabularies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'topic_id' })
  topic: Topic;

  @Column()
  topic_id: string;

  @ManyToMany(() => Kanji, (kanji) => kanji.vocabularies, {
    cascade: false,
  })
  @JoinTable({
    name: 'vocabulary_kanji',
    joinColumn: {
      name: 'vocabulary_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'kanji_id',
      referencedColumnName: 'id',
    },
  })
  kanjiList: Kanji[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
