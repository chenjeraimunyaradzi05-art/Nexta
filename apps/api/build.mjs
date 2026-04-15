import path from 'path';
import fs from 'fs';
import { cpSync } from 'fs';

const assetsToCopy = [
  {
    from: 'prisma',
    to: path.join('dist', 'prisma'),
    filter: (source) =>
      !source.includes(`${path.sep}dev_test.db`) &&
      !source.endsWith('.db') &&
      !source.endsWith('.db-journal'),
  },
  {
    from: 'openapi.yaml',
    to: path.join('dist', 'openapi.yaml'),
  },
];

console.log('Copying runtime assets...');

try {
  for (const asset of assetsToCopy) {
    if (!fs.existsSync(asset.from)) continue;

    const stat = fs.statSync(asset.from);
    if (stat.isDirectory()) {
      cpSync(asset.from, asset.to, {
        recursive: true,
        filter: asset.filter,
      });
      continue;
    }

    const destinationDir = path.dirname(asset.to);
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
    }
    fs.copyFileSync(asset.from, asset.to);
  }

  console.log('Build assets copied successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
