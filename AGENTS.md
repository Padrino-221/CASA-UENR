<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:build-cache-rules -->
# Turbopack persistent cache

Next.js 16 uses Turbopack with aggressive persistent caching. After editing any client component, always delete `.next` entirely before building:

```powershell
Remove-Item -Path ".next" -Recurse -Force
npx next build
```

Failure to clear the cache can cause hydration mismatches where the server-rendered HTML uses stale compiled chunks while the client bundle has fresh code.
<!-- END:build-cache-rules -->
