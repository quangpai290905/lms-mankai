import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Express } from 'express';

export type CloudinaryUploadResponse = {
  secure_url: string;
  public_id: string;
};

@Injectable()
export class UploadService {
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<CloudinaryUploadResponse> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto', folder: 'news_assets' }, // Thêm folder để quản lý gọn hơn
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          }
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
  ): Promise<CloudinaryUploadResponse[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Files are required');
    }

    const uploadPromises = files.map((file) => this.uploadImage(file));
    return Promise.all(uploadPromises);
  }

  async removeImage(public_id: string): Promise<{ result: string }> {
    if (!public_id) {
      throw new BadRequestException('Public ID is required');
    }
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(public_id, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
}
