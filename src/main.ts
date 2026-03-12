import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Giới hạn dung lượng body (phù hợp khi upload ảnh/file dự án LMS)
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // ==========================
  // ✅ CORS (Đã sửa để chạy trên Host)
  // ==========================
  app.enableCors({
    // Cho phép tất cả các nguồn hoặc bạn có thể điền link Vercel sau này vào đây
    origin: true, 
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ==========================
  // ✅ GLOBAL VALIDATION
  // ==========================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ==========================
  // ✅ SWAGGER (Tự động nhận diện host)
  // ==========================
  const swaggerConfig = new DocumentBuilder()
    .setTitle('LMS E-Learning API')
    .setDescription(
      'API cho hệ thống học tiếng Nhật – Topic, Vocabulary, Kanji, JLPT',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  // ==========================
  // ✅ SEED DATABASE (Chỉ chạy khi có biến SEED=true)
  // ==========================
  if (process.env.SEED === 'true') {
    try {
      const dataSource = app.get(DataSource);
      if (!dataSource.isInitialized) {
        await dataSource.initialize();
      }

      logger.log('🌱 Seeding database starting...');

      // Import động để tối ưu bộ nhớ khi build
      const { seedKanji } = await import('./database/seed/kanji.seed');
      const { seedAll } = await import('./database/seed/full.seed');

      await seedKanji(dataSource);
      await seedAll(dataSource);

      logger.log('✅ Seed completed successfully');
    } catch (error) {
      logger.error('❌ Seed failed:', error);
    }
  }

  // ==========================
  // ✅ START SERVER
  // ==========================
  // Render sẽ tự cấp cổng qua biến PORT, nếu không có thì mặc định 3000
  const PORT = process.env.PORT || 3000;
  await app.listen(PORT, '0.0.0.0'); // Thêm '0.0.0.0' để Render dễ dàng nhận diện host

  logger.log(`🚀 Server is running on port: ${PORT}`);
  logger.log(`📘 Swagger docs available at: /api-docs`);
}

bootstrap();