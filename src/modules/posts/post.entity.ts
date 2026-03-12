import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 255, unique: true }) // Slug nên là duy nhất
  slug: string;

  @Column('text')
  content: string;

  @Column({ length: 500, nullable: true }) // Tóm tắt
  excerpt: string;

  @Column({ length: 50, default: 'news' }) // news, guide, event
  category: string;

  @Column({ length: 20, default: 'draft' }) // published, draft, scheduled
  status: string;

  @Column({ nullable: true }) // Link ảnh bìa
  coverUrl: string;

  @Column('simple-array', { nullable: true }) // Tags lưu dạng mảng string: "React,Auth"
  tags: string[];

  @Column({ length: 100, nullable: true })
  author: string;

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  readMins: number;

  @Column({ default: false })
  featured: boolean;

  @Column({ nullable: true })
  seoTitle: string;

  @Column({ nullable: true })
  seoDesc: string;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
