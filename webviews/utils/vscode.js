let vscodeApi;

export function getVsCodeApi() {
    if (!vscodeApi) {
        try {
            if (window.ext_vscode) {
                vscodeApi = window.ext_vscode;
            } else {
                vscodeApi = acquireVsCodeApi();
            }
        } catch (error) {
            console.warn('Failed to acquire VS Code API');
            return null;
        }
    }
    return vscodeApi;
}
