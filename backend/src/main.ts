import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { GlobalCatchHandler } from './common/filters/global-catch.filter';
import { HttpStatusInterceptor } from './common/interceptors/http-status.interceptor';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new GlobalCatchHandler());
  app.useGlobalInterceptors(new HttpStatusInterceptor());
  
  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that do not have any decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
      transformOptions: {
        enableImplicitConversion: true, // Allow implicit type conversion
      },
    }),
  );
  
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('API Title')
    .setDescription('Api Description')
    .setVersion('1.0')
    .addTag('APIS')
    .addBearerAuth()
    .addServer('http://localhost:4000')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();