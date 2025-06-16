// src/upload/upload.controller.ts
import { Controller, Post, UploadedFile, UseInterceptors, InternalServerErrorException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { error: 'No file uploaded.' };
    }
    try {
      const result = await this.uploadService.uploadImage(file);
      return { imageUrls: result.secure_url }; 
    } catch (error) {
      throw new InternalServerErrorException('Image upload failed.');
    }
  }
}