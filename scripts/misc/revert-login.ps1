$file = "C:\Users\scrip\Documents\University-Church-Management-System\src\app\login\page.tsx"
$content = Get-Content -LiteralPath $file -Raw

# Build reverse map
$revert = @{
    '#1A4FA0' = '#1E67FC'
    '#15418A' = '#0F53D6'
    '#1A1F36' = '#111827'
}

foreach ($old in $revert.Keys) {
    $new = $revert[$old]
    $content = $content -replace [regex]::Escape($old), $new
}

# Special cases: restore brand text
$content = $content -replace '>CASA GLOBAL<', '>U-CHMS<'

Set-Content -LiteralPath $file -Value $content -NoNewline
Write-Output "Done"
