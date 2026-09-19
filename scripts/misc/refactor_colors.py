import os
import re

replacements = [
    (r'text-\[#111827\](\s+dark:text-white)?', 'text-main'),
    (r'text-\[#0F172A\](\s+dark:text-white)?', 'text-main'),
    (r'text-\[#475569\]', 'text-secondary'),
    (r'text-\[#94A3B8\]', 'text-muted'),
    (r'text-\[#9CA3AF\]', 'text-muted'),
    (r'text-slate-400', 'text-muted'),
    (r'text-\[#1E67FC\]', 'text-primary'),
    (r'text-\[#6366F1\]', 'text-primary'),
    (r'bg-\[#1E67FC\]', 'bg-primary'),
    (r'bg-\[#6366F1\]', 'bg-primary'),
    (r'border-\[#E2E8F0\]', 'border-standard'),
    (r'border-\[#F1F5F9\]', 'border-standard'),
    (r'border-\[#F3F4F6\]', 'border-standard'),
    (r'border-black/5', 'border-standard'),
    (r'bg-white(\s+dark:bg-\[#0F172A\])?', 'bg-card'),
    (r'bg-slate-50', 'bg-bg-main'), # Based on my tailwind config
]

def refactor_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    for pattern, replacement in replacements:
        new_content = re.sub(pattern, replacement, new_content)

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def main():
    target_dirs = ['src/app', 'src/components']
    modified_count = 0
    for target_dir in target_dirs:
        for root, dirs, files in os.walk(target_dir):
            for file in files:
                if file.endswith('.tsx'):
                    file_path = os.path.join(root, file)
                    if refactor_file(file_path):
                        print(f"Refactored: {file_path}")
                        modified_count += 1
    print(f"Total modified: {modified_count}")

if __name__ == "__main__":
    main()
