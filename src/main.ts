import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser'; // Import body-parser
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  //TODO: refactor it if needed
  // Increase JSON payload size limit
  app.use(bodyParser.json({ limit: '15mb' })); // Adjust the limit as needed

  const options = new DocumentBuilder()
    .setTitle('Green harbor backend')
    .setDescription('Green harbor API')
    .setVersion('1.0')
    // .addTag('API')
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('api/docs', app, document);

  const PORT = process.env.PORT || 3000;

  app.enableCors({ origin: '*' });

  await app.listen(PORT);
  Logger.log(`🌱 Green Harbor API is running on port ${PORT}`, `bootstrap`);
}
bootstrap();
