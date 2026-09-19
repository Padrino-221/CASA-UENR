import { readFileSync, writeFileSync } from 'fs';
import pkg from 'glob';
const { sync: globSync } = pkg;

const LUCIDE_PKG = 'lucide-react';
const PHOSPHOR_PKG = '@phosphor-icons/react';

// Map lucide icon names to phosphor equivalents
const iconMap = {
  Activity: 'ChartLineUp',
  AlertCircle: 'WarningCircle',
  ArrowRight: 'ArrowRight',
  ArrowUpRight: 'ArrowUpRight',
  Bell: 'Bell',
  BookOpen: 'BookOpen',
  Building: 'Building',
  Building2: 'Buildings',
  Calendar: 'CalendarBlank',
  CalendarCheck: 'CalendarCheck',
  CalendarIcon: 'CalendarBlank',
  Check: 'Check',
  CheckCircle2: 'CheckCircle',
  ChevronDown: 'CaretDown',
  ChevronLeft: 'CaretLeft',
  ChevronRight: 'CaretRight',
  Clock: 'Clock',
  Command: 'Command',
  Database: 'Database',
  DollarSign: 'CurrencyDollarSimple',
  Download: 'DownloadSimple',
  Edit2: 'Pencil',
  Eye: 'Eye',
  EyeOff: 'EyeSlash',
  FileText: 'FileText',
  FileUp: 'FileArrowUp',
  Globe: 'Globe',
  HelpCircle: 'Question',
  History: 'ClockCounterClockwise',
  Key: 'Key',
  Layers: 'StackSimple',
  LayoutDashboard: 'Layout',
  LifeBuoy: 'Lifebuoy',
  Loader2: 'SpinnerGap',
  Lock: 'Lock',
  LogOut: 'SignOut',
  Mail: 'Envelope',
  Map: 'MapTrifold',
  MapIcon: 'MapTrifold',
  MapPin: 'MapPin',
  Menu: 'List',
  Pencil: 'Pencil',
  Play: 'Play',
  Plus: 'Plus',
  RefreshCw: 'ArrowsClockwise',
  Search: 'MagnifyingGlass',
  Share2: 'ShareNetwork',
  Shield: 'Shield',
  ShieldAlert: 'ShieldWarning',
  ShieldCheck: 'ShieldCheck',
  Tag: 'Tag',
  Trash2: 'Trash',
  TrendingUp: 'TrendUp',
  User: 'User',
  UserCheck: 'UserCheck',
  UserPlus: 'UserPlus',
  Users: 'Users',
  Wallet: 'Wallet',
  X: 'X',
  XCircle: 'XCircle',
};

// All phosphor icons (both existing and new) that need weight="duotone"
const allPhosphorIcons = new Set([
  ...Object.values(iconMap),
  // Already-used phosphor icons from existing files
  'Article', 'BookOpen', 'Building', 'Buildings', 'CalendarBlank',
  'CaretDown', 'CaretLeft', 'CaretRight', 'ChatCenteredText', 'Check',
  'CheckCircle', 'CheckSquare', 'Clock', 'ClockCounterClockwise', 'Crown',
  'DownloadSimple', 'FileText', 'FloppyDisk', 'GenderFemale', 'GenderMale',
  'Image', 'Info', 'Lightning', 'MapTrifold', 'MicrophoneStage',
  'ShieldCheck', 'SignOut', 'Smiley', 'SquaresFour', 'Target', 'Trash',
  'TrendUp', 'Users', 'UsersFour', 'UsersThree', 'Wallet', 'Warning',
  'WarningCircle', 'X', 'XCircle',
]);

// Sort by length descending to match longer names first
const sortedPhosphorNames = [...allPhosphorIcons].sort((a, b) => b.length - a.length);

const PATTERN_SELF_CLOSE = /<(\w+)\s+([^>]*?)\s*\/\s*>/gs;
const PATTERN_OPEN_CLOSE = /<(\w+)([^>]*)>([\s\S]*?)<\/\1>/gs;

/**
 * Add weight="duotone" to a JSX tag for a known phosphor icon
 */
function addWeightToTag(fullMatch, tagName, attrs, isSelfClose, innerContent) {
  if (!allPhosphorIcons.has(tagName)) return fullMatch;

  // Skip if used as a JSX member expression (e.g., Icons.SpinnerGap)
  // Skip if already has weight prop
  if (attrs.includes('weight=')) return fullMatch;

  const weightAttr = ' weight="duotone"';
  if (isSelfClose) {
    if (attrs.trim()) {
      return `<${tagName} ${attrs.trim()}${weightAttr} />`;
    }
    return `<${tagName}${weightAttr} />`;
  }
  // Open-close tag
  if (attrs.trim()) {
    return `<${tagName} ${attrs.trim()}${weightAttr}>${innerContent}</${tagName}>`;
  }
  return `<${tagName}${weightAttr}>${innerContent}</${tagName}>`;
}

function processFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  const original = content;

  // Check if file imports from lucide-react
  const hasLucide = content.includes(`from '${LUCIDE_PKG}'`);

  if (hasLucide) {
    // Step 1: Replace the import line
    // Match: import { ... } from 'lucide-react';
    const importRegex = /import\s+\{([^}]+)\}\s+from\s+'lucide-react'\s*;?/g;
    content = content.replace(importRegex, (match, iconList) => {
      const icons = iconList.split(',').map(s => s.trim()).filter(Boolean);

      // Map icon names
      const mappedIcons = icons.map(icon => {
        const name = icon.trim();
        const mapped = iconMap[name] || name;
        return mapped;
      });

      // Deduplicate
      const unique = [...new Set(mappedIcons)];
      const importStr = unique.join(',\n  ');
      return `import {\n  ${importStr}\n} from '${PHOSPHOR_PKG}';\n`;
    });

    // Step 2: Remove duplicate blank lines that might have been introduced
    content = content.replace(/\n{3,}/g, '\n\n');

    // Step 3: Replace icon component names in JSX (lucide → phosphor)
    for (const [lucideName, phosphorName] of Object.entries(iconMap)) {
      if (lucideName !== phosphorName) {
        // Replace JSX identifier references - be careful not to replace within strings
        // Match: <LucideName ... /> or <LucideName>...</LucideName>
        const selfCloseRegex = new RegExp(`<${lucideName}(\\s[^>]*?/\\s*>)`, 'g');
        content = content.replace(selfCloseRegex, `<${phosphorName}$1`);

        const openCloseRegex = new RegExp(`<${lucideName}([^>]*)>([\\s\\S]*?)<\\/${lucideName}>`, 'g');
        content = content.replace(openCloseRegex, `<${phosphorName}$1>$2</${phosphorName}>`);
      }
    }
  }

  // Step 4: Add weight="duotone" to all phosphor icon JSX usages
  // Process self-closing tags
  content = content.replace(PATTERN_SELF_CLOSE, (match, tagName, attrs) => {
    return addWeightToTag(match, tagName, attrs, true, '');
  });

  // Process open-close tags (but don't double-process if already handled)
  // We need to be careful not to reprocess the same tags
  // A simpler approach: just add weight to self-closing tags and open tags
  content = content.replace(/<(\w+)([^>]*?)(\s*\/\s*>)/g, (match, tagName, attrs, closing) => {
    if (!allPhosphorIcons.has(tagName)) return match;
    if (attrs.includes('weight=')) return match;
    const weightAttr = ' weight="duotone"';
    if (attrs.trim()) {
      return `<${tagName} ${attrs.trim()}${weightAttr}${closing}`;
    }
    return `<${tagName}${weightAttr}${closing}`;
  });

  // Handle non-self-closing tags
  content = content.replace(/<(\w+)([^>]*)>(?!(?:[\s\S]*?<\/\1>))/g, (match, tagName, attrs) => {
    return match; // Don't process opening tags without closing (not likely for icons)
  });

  // Simpler: handle <IconName>...</IconName> pairs
  content = content.replace(/<(\w+)([^>]*)>([\s\S]*?)<\/\1>/g, (match, tagName, attrs, inner) => {
    if (!allPhosphorIcons.has(tagName)) return match;
    if (attrs.includes('weight=')) return match;
    const weightAttr = ' weight="duotone"';
    if (attrs.trim()) {
      return `<${tagName} ${attrs.trim()}${weightAttr}>${inner}</${tagName}>`;
    }
    return `<${tagName}${weightAttr}>${inner}</${tagName}>`;
  });

  if (content !== original) {
    writeFileSync(filePath, content, 'utf-8');
    console.log(`  ✓ ${filePath}`);
    return true;
  }
  return false;
}

// Find all TSX/TS files in src
const files = globSync('src/**/*.{tsx,ts}', { ignore: ['src/**/*.d.ts'] });
let changed = 0;

for (const file of files) {
  try {
    if (processFile(file)) changed++;
  } catch (err) {
    console.error(`  ✗ ${file}: ${err.message}`);
  }
}

console.log(`\nDone. ${changed} files modified.`);
