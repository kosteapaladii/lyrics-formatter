import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/lyrics-formatter/'
})
```

### /d:/lyrics-formatter/lyrics-formatter/.github/workflows/deploy.yml
Create this new file:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Install Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install Dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

Now, follow these terminal commands to deploy:

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit"

# Add your GitHub repository as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/lyrics-formatter.git

# Push to GitHub
git push -u origin main

```

After pushing to GitHub:

1. Go to your GitHub repository settings
2. Navigate to "Pages" section
3. Under "Source", select "gh-pages" branch
4. Wait a few minutes for the deployment

Your site will be available at: `https://YOUR_USERNAME.github.io/lyrics-formatter/`

Remember to:
1. Replace `YOUR_USERNAME` in the package.json homepage URL with your actual GitHub username
2. Make sure your repository is public
3. Give GitHub Actions necessary permissions in your repository settings

Let me know if you need help with any of these steps!