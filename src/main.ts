import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });
  
  // Middleware de logging para todas las peticiones
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const { method, originalUrl, headers } = req;
    
    console.log('\n==================== REQUEST ====================');
    console.log(`🕐 ${timestamp}`);
    console.log(`📨 ${method} ${originalUrl}`);
    console.log(`🔑 Auth: ${headers.authorization ? 'Token presente' : 'Sin token'}`);
    
    // Log cuando se completa la respuesta
    res.on('finish', () => {
      console.log(`✅ Response: ${res.statusCode} ${res.statusMessage}`);
      console.log('=================================================\n');
    });
    
    next();
  });
  
  // Habilitar CORS para permitir conexiones desde la app móvil
  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  // Escuchar en todas las interfaces (0.0.0.0) para que la IP local funcione
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  
  console.log('\n================================================');
  console.log('🚀 Backend corriendo en http://localhost:3000');
  console.log('📱 Para móvil usar: http://192.168.1.92:3000');
  console.log('📊 Logs habilitados para todas las peticiones');
  console.log('================================================\n');
}
bootstrap();
