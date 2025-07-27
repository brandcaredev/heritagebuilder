#!/usr/bin/env node

const { execSync } = require('child_process');

// Check if we're in production environment
const isProduction = process.env.VERCEL_ENV === 'production';

console.log(`Building for environment: ${process.env.VERCEL_ENV || 'development'}`);

if (isProduction) {
  console.log('Running production build with migrations...');
  execSync('npm run migrate:prod && next build', { stdio: 'inherit' });
} else {
  console.log('Running preview/development build...');
  execSync('next build', { stdio: 'inherit' });
}