-- Insert admin user
-- Email: admin@example.com
-- Password: admin123
INSERT INTO "public"."User" ("email", "password", "plainPassword", "role", "createdAt", "updatedAt")
VALUES (
  'admin@example.com',
  '$2b$10$ps.B8vyAwQV1ltUYobh5WOBeJz3KSKCUoV8KU2sj5QRbsTVyV7XrG',
  'admin123',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT ("email") DO UPDATE SET
  "password" = EXCLUDED."password",
  "plainPassword" = EXCLUDED."plainPassword",
  "role" = 'admin',
  "updatedAt" = NOW();



