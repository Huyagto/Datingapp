// src/cloudinary/cloudinary.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(file: UploadedFile): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'dating_app' },
        (error, result: UploadApiResponse | undefined) => {
          if (error) reject(error);
          else if (!result) reject(new Error('Upload failed'));
          else resolve(result.secure_url);
        }
      );
      
      uploadStream.end(file.buffer);
    });
  }

  async uploadFiles(files: UploadedFile[]): Promise<string[]> {
    return Promise.all(files.map(file => this.uploadFile(file)));
  }
}