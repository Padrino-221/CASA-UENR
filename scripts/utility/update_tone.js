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
    } catch { }
  });
  return filelist;
};

const files = walkSync(path.join(__dirname, 'src')).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

const replacements = [
  [/Strategic Hub/g, 'Ministry Operations Center'],
  [/National Oversight System/g, 'National Ministry Network'],
  [/Jurisdictional Density/g, 'Campus Growth Analytics'],
  [/Financial Telemetry/g, 'Financial Stewardship'],
  [/Registry Audit/g, 'Records Review'],
  [/Territorial Command/g, 'Regional Secretariat'],
  [/Institutional Hub/g, 'Campus Ministry Hub'],
  [/Operational oversight/g, 'Chaplaincy Administration'],
  [/Secure Audit Trail/g, 'Verified Financial Ledger'],
  [/Enroll Institution/g, 'Register Campus Branch'],
  [/Territorial Flow/g, 'Ministry Resource Flow'],
  [/Institutional Outreach/g, 'Campus Ministry Outreach'],
  [/Growth Telemetry/g, 'Growth Analytics'],
  [/National Update/g, 'Ministry Update'],
  [/Synchronized governance/g, 'Coordinated ministry support'],
  [/Workspace/g, 'Chaplaincy Admin'],
  [/Jurisdictional Access/g, 'Ministry Clearance'],
  [/Strategic oversight/g, 'Pastoral oversight'],
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  replacements.forEach(([regex, replacement]) => {
    content = content.replace(regex, replacement);
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated tone in: ${file}`);
  }
});
