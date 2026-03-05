# Maptor - React Application

A modern React-based application scaffolded with webpack and babel.

## Project Setup

This project was initialized with `npm init` and configured with:
- **React 19** - UI library
- **Webpack** - Module bundler
- **Babel** - JavaScript compiler
- **webpack-dev-server** - Development server with hot reloading

## Installation

Install project dependencies:

```bash
npm install
```

## Available Scripts

### Development Server
Start the development server at `http://localhost:3000`:

```bash
npm start
```

The application will automatically reload when you make changes.

### Production Build
Build the project for production:

```bash
npm run build
```

The optimized files will be output to the `dist/` directory.

## Project Structure

```
src/
  ├── index.js       - React root entry point
  ├── App.js         - Main App component
  └── App.css        - App styles
public/
  └── index.html     - HTML template
webpack.config.js   - Webpack configuration
.babelrc           - Babel configuration
package.json       - Project metadata and dependencies
```

## Getting Started

1. **Install dependencies**: `npm install`
2. **Start development server**: `npm start`
3. **Edit files** in the `src/` directory
4. **Browser will auto-reload** with your changes
5. **Build for production**: `npm run build`

## Features

- Fast development with hot module reloading
- Production-optimized builds
- ES6+ and JSX support with Babel
- CSS module support
- Source maps for debugging

## License

ISC
