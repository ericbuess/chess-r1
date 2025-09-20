# RabbitOS Plugin Deployment Fix Guide

## Common Issue: 404 Errors After Deployment

### Problem
Creation agent places built files at wrong directory level.

### Correct Structure Required
```
chess-r1-plugin/
├── index.html                    # Redirects to apps/app/dist/index.html
└── apps/
    └── app/
        └── dist/                 # ← ALL GAME FILES MUST BE HERE
            ├── index.html        # The actual game HTML
            ├── assets/           # CSS and JS bundles
            │   ├── main-*.js
            │   └── main-*.css
            ├── woodenSoundData.js
            ├── icon.png
            └── screenshot.jpg
```

### If You Get 404 Errors
Tell the creation agent:
```
The built files are in the wrong directory level.
Move everything from /apps/app/ to /apps/app/dist/:
- index.html → dist/index.html
- assets/ → dist/assets/
- woodenSoundData.js → dist/woodenSoundData.js
```

### For Future Deployments
1. Emphasize that ALL game files go in `apps/app/dist/`
2. The root index.html ONLY redirects
3. Source files in `apps/app/src/` are backup only
4. Build output MUST be in `apps/app/dist/`

### Updated Instructions for Creation Agent
```
IMPORTANT: Deploy all game files to apps/app/dist/ directory.
The structure is:
- Root index.html redirects to apps/app/dist/index.html
- ALL game files (HTML, JS, CSS, assets) go in apps/app/dist/
- Do NOT put game files directly in apps/app/
```