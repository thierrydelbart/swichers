export function buildDbConnection(env: NodeJS.ProcessEnv) {
  const isProd = env.NODE_ENV === 'production';
  const url = env.DATABASE_URL;
  const connection = url
    ? { url, ssl: isProd ? { rejectUnauthorized: false } : false }
    : {
        host: env.DATABASE_HOST ?? 'localhost',
        port: parseInt(env.DATABASE_PORT ?? '5432'),
        username: env.DATABASE_USER ?? 'postgres',
        password: env.DATABASE_PASSWORD ?? 'postgres',
        database: env.DATABASE_NAME ?? 'swichers',
      };
  return { isProd, connection };
}
