// ENSEN LAB 빌드: src 모듈을 번들 → 단일 dist/index.html (드래그앤드롭 배포용)
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const result = await build({
  entryPoints: ['src/main.js'],
  bundle: true,
  format: 'iife',
  minify: true,
  write: false,
  target: ['es2019'],
});
const js = result.outputFiles[0].text;
const css = readFileSync('src/styles.css', 'utf8');
const tpl = readFileSync('index.html', 'utf8');
const out = tpl.replace('/*STYLES*/', css).replace('/*SCRIPT*/', js);
mkdirSync('dist', { recursive: true });
writeFileSync('dist/index.html', out);
console.log('✓ dist/index.html', (out.length/1024).toFixed(1)+'KB');
