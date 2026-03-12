import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [CloudinaryModule, AuthModule],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService], // Export nếu module khác cần dùng
})
export class UploadModule {}
