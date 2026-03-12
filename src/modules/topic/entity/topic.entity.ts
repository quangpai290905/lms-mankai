import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Vocabulary } from '../../vocabulary/entity/vocabulary.entity';

@Entity('topics')
export class Topic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'N5' })
  level: string;

  @OneToMany(() => Vocabulary, (vocabulary) => vocabulary.topic, {
    cascade: true,
  })
  vocabularies: Vocabulary[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
