import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 4000;

  app.use(helmet({
    contentSecurityPolicy: false, // Turn off CSP for dev convenience with Swagger/Playground if needed
  }));
  app.use(cookieParser());
  
  app.enableCors({
    origin: true, // For development, allow all origins with credentials
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  await app.listen(port);
  console.log(`🚀 API is running on: http://localhost:${port}/api`);
}
bootstrap();
