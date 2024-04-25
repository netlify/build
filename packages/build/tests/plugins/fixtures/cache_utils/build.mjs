import { mkdir, readdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';


if (existsSync('dist/.dot')) {
  console.log('content inside dist/.dot:');
  console.log((await readdir('dist/.dot')).join('\n'));
}
if (existsSync('dist/other')) {
  console.log('content inside dist/other:');
  console.log((await readdir('dist/other')).join('\n'));
}

console.log('Generate files');
await mkdir('dist/.dot', { recursive: true });
await mkdir('dist/other', { recursive: true });

await Promise.all([
  writeFile('dist/.dot/hello.txt', ''),
  writeFile('dist/other/index.html', '<h1>hello world</h1>'),
]);
