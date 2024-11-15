module.exports = {
  content: ['./webviews/**/*.{svelte,js}'],
  theme: {
    extend: {
      colors: {
        // Map VS Code theme variables to Tailwind classes
        'vscode': {
          'foreground': 'var(--vscode-editor-foreground)',
          'background': 'var(--vscode-editor-background)',
          'button': 'var(--vscode-button-background)',
          'button-foreground': 'var(--vscode-button-foreground)',
          'error': 'var(--vscode-errorForeground)',
        }
      }
    }
  }
}
