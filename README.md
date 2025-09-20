# Evgeny Tomenko - CakePHP Plugins Documentation

This repository contains the documentation for Evgeny Tomenko's CakePHP plugins, built with VitePress.

## Plugins

- **RuleFlow Plugin** - Powerful rule engine with JSON Logic support
- **Scheduling Plugin** - Advanced task scheduling system for CakePHP
- **SignalHandler Plugin** - Cross-platform signal handling for console commands

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run docs:dev
   ```

3. Build for production:
   ```bash
   npm run docs:build
   ```

4. Preview the production build:
   ```bash
   npm run docs:preview
   ```

## GitHub Pages Deployment

This site is automatically deployed to GitHub Pages when changes are pushed to the `master` branch.

### Setup Instructions

1. **Enable GitHub Pages:**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Under "Source", select "GitHub Actions"

2. **Repository Structure:**
   - The site will be deployed from the `master` branch
   - The workflow is located at `.github/workflows/deploy.yml`
   - The built site will be available at `https://yourusername.github.io/your-repo-name`

3. **Custom Domain (Optional):**
   - Add a `CNAME` file to the `docs/public/` directory with your domain
   - Configure your domain's DNS settings to point to GitHub Pages

### Workflow Details

The deployment workflow:
- Triggers on pushes to `master` branch
- Builds the VitePress site using Node.js 18
- Deploys the built site to GitHub Pages
- Provides a deployment URL in the workflow summary

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `npm run docs:dev`
5. Submit a pull request

## License

This documentation is released under the MIT License.