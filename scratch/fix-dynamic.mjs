import fs from 'fs';
import path from 'path';

const files = [
  'src/app/api/admin/metrics/route.js',
  'src/app/api/admin/setup-db/route.js',
  'src/app/api/admin/staff/block/route.js',
  'src/app/api/admin/stylists/route.js',
  'src/app/api/admin/vacations/route.js',
  'src/app/api/availability/route.js',
  'src/app/api/cron/reminders/route.js'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes("export const dynamic = 'force-dynamic';")) {
      const parts = content.split('\n');
      let lastImportIndex = -1;
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].startsWith('import ')) {
          lastImportIndex = i;
        }
      }
      parts.splice(lastImportIndex + 1, 0, `\nexport const dynamic = 'force-dynamic';`);
      fs.writeFileSync(file, parts.join('\n'));
      console.log(`Updated ${file}`);
    } else {
      console.log(`Skipped ${file}`);
    }
  } else {
    console.log(`File not found: ${file}`);
  }
}
