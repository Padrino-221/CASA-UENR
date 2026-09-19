// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = fs.statSync(dirFile).isDirectory()
        ? walkSync(dirFile, filelist)
        : filelist.concat(dirFile);
    } catch (err) {
      if (err.code === 'OENT' || err.code === 'EPERM') {}
    }
  });
  return filelist;
};

const files = walkSync(path.join(__dirname, 'src')).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replacements for FlowMail theme
  content = content.replace(/hover:bg-\[\#0B2D72\]/g, 'hover:bg-[#4F46E5]'); // hover backgrounds
  content = content.replace(/bg-\[\#0B2D72\]/g, 'bg-[#111827]'); // other backgrounds
  content = content.replace(/text-\[\#0B2D72\]/g, 'text-[#111827]'); // dark text
  content = content.replace(/border-\[\#0B2D72\]/g, 'border-[#111827]'); // dark borders
  content = content.replace(/from-\[\#0B2D72\]/g, 'from-[#111827]'); 
  content = content.replace(/to-\[\#0B2D72\]/g, 'to-[#111827]'); 

  content = content.replace(/bg-\[\#0992C2\]/g, 'bg-[#6366F1]'); // primary bg
  content = content.replace(/text-\[\#0992C2\]/g, 'text-[#6366F1]'); // primary text
  content = content.replace(/border-\[\#0992C2\]/g, 'border-[#6366F1]'); // primary border
  content = content.replace(/focus:border-\[\#0992C2\]/g, 'focus:border-[#6366F1]'); 
  content = content.replace(/focus:ring-\[\#0992C2\]/g, 'focus:ring-[#6366F1]'); 
  content = content.replace(/hover:text-\[\#0992C2\]/g, 'hover:text-[#6366F1]'); 
  content = content.replace(/hover:border-\[\#0992C2\]/g, 'hover:border-[#6366F1]'); 
  content = content.replace(/from-\[\#0992C2\]/g, 'from-[#6366F1]'); 
  content = content.replace(/to-\[\#0992C2\]/g, 'to-[#6366F1]'); 
  content = content.replace(/shadow-\[\#0992C2\]/g, 'shadow-[#6366F1]'); 

  content = content.replace(/bg-\[\#0AC4E0\]/g, 'bg-[#8B5CF6]'); // cyan -> violet
  content = content.replace(/text-\[\#0AC4E0\]/g, 'text-[#8B5CF6]'); 
  content = content.replace(/border-\[\#0AC4E0\]/g, 'border-[#8B5CF6]'); 
  content = content.replace(/shadow-\[\#0AC4E0\]/g, 'shadow-[#8B5CF6]'); 
  content = content.replace(/from-\[\#0AC4E0\]/g, 'from-[#8B5CF6]'); 

  content = content.replace(/bg-sky-50/g, 'bg-indigo-50'); 
  content = content.replace(/text-sky-50/g, 'text-indigo-50'); 
  content = content.replace(/border-sky-50/g, 'border-indigo-50'); 
  content = content.replace(/hover:bg-sky-50/g, 'hover:bg-indigo-50'); 
  content = content.replace(/border-sky-100/g, 'border-indigo-100'); 
  
  // Specific catch-all for any remaining #0992C2 or #0B2D72
  content = content.replace(/#0992C2/g, '#6366F1');
  content = content.replace(/#0B2D72/g, '#111827');
  content = content.replace(/#0AC4E0/g, '#8B5CF6');

  // Redesign modals and pages (e.g. rounded-[48px] or rounded-[32px] -> rounded-[24px])
  content = content.replace(/rounded-\[48px\]/g, 'rounded-[24px]');
  content = content.replace(/rounded-\[32px\]/g, 'rounded-[24px]');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated: ${file}`);
  }
});
