import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Import các Module chức năng của bạn
import { AuthModule } from './modules/auth/auth.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { CoursesModule } from './modules/courses/course.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { UploadModule } from './modules/upload/upload.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { LessonVideoModule } from './modules/lesson-video/lesson-video.module';
import { PostsModule } from './modules/posts/posts.module';
import { StudentModule } from './modules/student/student.module';
import { SubmissionModule } from './modules/submission/submission.module';
import { ClassesModule } from './modules/temp_classes/classes.module';
import { ChatModule } from './modules/chat/chat.module';
import { ProgressModule } from './modules/progress/progress.module';
import { AiChatModule } from './modules/ai-chat/ai-chat.module';
import { KanjiModule } from './modules/kanji/kanji.module';
import { TopicModule } from './modules/topic/topic.module';
import { VocabularyModule } from './modules/vocabulary/vocabulary.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 10916,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE || 'defaultdb',
      autoLoadEntities: true,
      synchronize: true, // Tự động tạo bảng dựa trên Entity
      
      // ✅ Cấu hình SSL bắt buộc cho Cloud DB (Aiven)
      ssl: {
        rejectUnauthorized: false,
      },
      // ✅ Hỗ trợ lưu trữ Kanji/Tiếng Nhật không bị lỗi
      charset: 'utf8mb4',
    }),

    AuthModule,
    QuizzesModule,
    ClassesModule,
    CoursesModule,
    SessionsModule,
    LessonsModule,
    CloudinaryModule,
    UploadModule,
    QuestionsModule,
    LessonVideoModule,
    PostsModule,
    StudentModule,
    SubmissionModule,
    ProgressModule,
    ChatModule,
    AiChatModule,
    KanjiModule,
    TopicModule,
    VocabularyModule,
  ],
})
export class AppModule {}