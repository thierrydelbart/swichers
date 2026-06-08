import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function buildCorsOrigin(allowedOrigins: string) {
  const origins = allowedOrigins
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    const allowed = origins.some((o) =>
      o.startsWith('*.') ? origin.endsWith(o.slice(1)) : origin === o,
    );
    callback(allowed ? null : new Error('Not allowed by CORS'), allowed);
  };
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173';
  app.enableCors({ origin: buildCorsOrigin(allowedOrigins) });
  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
