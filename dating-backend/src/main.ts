import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    app.use(json({ limit: '50mb' }));
  // app.use(urlencoded({ extended: true, limit: '50mb' }));
  //   app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true, // Loại bỏ properties không có trong DTO
  //     forbidNonWhitelisted: true, // Báo lỗi nếu có properties không xác định
  //     transform: true, // Tự động transform types
  //     disableErrorMessages: process.env.NODE_ENV === 'production', // Ẩn thông báo lỗi trong production
  //   })
  // );
  await app.listen(3000);
  console.log('🚀 Server running on http://localhost:3000/graphql');
}
bootstrap();
