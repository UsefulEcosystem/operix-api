import dotenv from 'dotenv';

dotenv.config();

const defaultOrigins = ['http://localhost:3000', 'http://localhost:5173'];
const defaultJwtSecret = 'change-this-secret-in-production';
const minJwtSecretLength = 32;
const validDeploymentModes = ['LOCAL', 'SAAS'] as const;

type DeploymentMode = typeof validDeploymentModes[number];

function parseOrigins(value?: string) {
  if (!value) {
    return defaultOrigins;
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function parsePositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parseTrustProxy(value: string | undefined) {
  if (!value) {
    return false;
  }

  if (value === 'true') {
    return true;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : false;
}

export const env = {
  appName: process.env.APP_NAME || 'opeflow',
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parsePositiveInteger(process.env.PORT, 3333),
  trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
  origins: parseOrigins(process.env.ORIGIN),
  deploymentMode: (validDeploymentModes.includes(process.env.DEPLOYMENT_MODE as DeploymentMode)
    ? process.env.DEPLOYMENT_MODE
    : 'LOCAL') as DeploymentMode,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://admin:admin@localhost:5432/opeflow',
  jwtSecret: process.env.JWT_SECRET || defaultJwtSecret,
  jwtIssuer: process.env.JWT_ISSUER || 'opeflow-api',
  jwtAudience: process.env.JWT_AUDIENCE || 'opeflow-app',
  accessTokenTtlSeconds: parsePositiveInteger(process.env.ACCESS_TOKEN_TTL_SECONDS, 900),
  refreshTokenTtlDays: parsePositiveInteger(process.env.REFRESH_TOKEN_TTL_DAYS, 30),
  refreshCookieName: process.env.REFRESH_COOKIE_NAME || 'opeflow_refresh_token',
  emailDeliveryWebhookUrl: process.env.EMAIL_DELIVERY_WEBHOOK_URL || '',
  emailFrom: process.env.EMAIL_FROM || 'no-reply@opeflow.local',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleAuthUrl: process.env.GOOGLE_AUTH_URL || 'https://accounts.google.com/o/oauth2/v2/auth',
  googleTokenUrl: process.env.GOOGLE_TOKEN_URL || 'https://oauth2.googleapis.com/token',
  googleJwksUri: process.env.GOOGLE_JWKS_URI || 'https://www.googleapis.com/oauth2/v3/certs',
};

export function isLocalDeployment() {
  return env.deploymentMode === 'LOCAL';
}

export function assertSecurityEnv() {
  if (env.nodeEnv !== 'production') {
    return;
  }

  const secretWasProvided = Boolean(process.env.JWT_SECRET?.trim());
  const weakJwtSecret = !secretWasProvided
    || env.jwtSecret === defaultJwtSecret
    || env.jwtSecret.length < minJwtSecretLength;

  if (weakJwtSecret) {
    throw new Error(`JWT_SECRET deve ser definido em produção com pelo menos ${minJwtSecretLength} caracteres.`);
  }

  if (env.origins.includes('*')) {
    throw new Error('ORIGIN não pode usar wildcard em produção quando CORS com credenciais está habilitado.');
  }

  if (!env.emailDeliveryWebhookUrl) {
    throw new Error('EMAIL_DELIVERY_WEBHOOK_URL deve ser definido em produção para validação de e-mail e recuperação de senha.');
  }
}
