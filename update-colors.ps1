# Color Theme Update Script
# Replaces purple/pink theme with professional blue/cyan theme

$files = @(
    "D:\Practice\upsc\app\(app)\layout.tsx",
    "D:\Practice\upsc\app\(app)\admin\page.tsx",
    "D:\Practice\upsc\app\(app)\dashboard\page.tsx",
    "D:\Practice\upsc\app\(app)\evaluation\[id]\page.tsx",
    "D:\Practice\upsc\app\(app)\history\page.tsx",
    "D:\Practice\upsc\app\(app)\upload\page.tsx",
    "D:\Practice\upsc\app\(auth)\login\page.tsx",
    "D:\Practice\upsc\components\ImageUpload.tsx",
    "D:\Practice\upsc\components\Navbar.tsx"
)

$replacements = @{
    'from-purple-600' = 'from-blue-600'
    'to-pink-600' = 'to-cyan-600'
    'from-purple-700' = 'from-blue-700'
    'to-pink-700' = 'to-cyan-700'
    'purple-400' = 'cyan-400'
    'purple-300' = 'cyan-300'
    'via-purple-900' = 'via-blue-900'
    'purple-900' = 'blue-900'
    'pink-900' = 'cyan-900'
    'from-purple-800' = 'from-blue-800'
    'to-purple-800' = 'to-blue-800'
    'from-pink-800' = 'from-cyan-800'
    'to-pink-800' = 'to-cyan-800'
    'purple-600' = 'blue-600'
    'pink-600' = 'cyan-600'
    'purple-500' = 'blue-500'
    'pink-500' = 'cyan-500'
    'purple-200' = 'blue-200'
    'pink-200' = 'cyan-200'
    'from-slate-900 via-purple-900 to-slate-900' = 'from-slate-900 via-blue-900 to-slate-800'
}

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        foreach ($key in $replacements.Keys) {
            $content = $content -replace $key, $replacements[$key]
        }
        Set-Content $file -Value $content -NoNewline
        Write-Host "Updated: $file" -ForegroundColor Green
    }
}

Write-Host "`nColor theme updated successfully!" -ForegroundColor Cyan
