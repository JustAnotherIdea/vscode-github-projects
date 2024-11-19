/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./webviews/**/*.{html,js,svelte}'],
  theme: {
    extend: {
      colors: {
        'vscode-button': 'var(--vscode-button-background)',
        'vscode-button-hover': 'var(--vscode-button-hoverBackground)',
        'vscode-button-foreground': 'var(--vscode-button-foreground)',
        'vscode-foreground': 'var(--vscode-editor-foreground)',
        'vscode-background': 'var(--vscode-editor-background)',
        'vscode-input-background': 'var(--vscode-input-background)',
        'vscode-input-foreground': 'var(--vscode-input-foreground)',
        'vscode-input-border': 'var(--vscode-input-border)',
        'vscode-error': 'var(--vscode-errorForeground)',
        'vscode-link': 'var(--vscode-textLink-foreground)',
        'vscode-description': 'var(--vscode-descriptionForeground)',
      }
    },
  },
  plugins: [],
}
