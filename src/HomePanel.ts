import * as vscode from "vscode";
import { getNonce } from "./getNonce";
import { SidebarProvider } from "./SidebarProvider";

export class HomePanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: HomePanel | undefined;

  public static readonly viewType = "home-panel";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  //create main display window
  public static createOrShow(extensionUri: vscode.Uri, data: any) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it.
    if (HomePanel.currentPanel) {
      HomePanel.currentPanel._panel.reveal(column);

      HomePanel.currentPanel._panel.webview.postMessage({
        command: "authComplete",
        payload: { session: data.session },
      });

      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      HomePanel.viewType,
      "VS-GitHub-Projects",
      column || vscode.ViewColumn.One,
      {
        // Enable javascript in the webview
        enableScripts: true,
        enableCommandUris: true,

        // And restrict the webview to only loading content from our extension's `media` directory.
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, "media"),
          vscode.Uri.joinPath(extensionUri, "out/compiled"),
          vscode.Uri.joinPath(extensionUri, "webviews/styles")
        ],
        retainContextWhenHidden: true
      }
    );

    HomePanel.currentPanel = new HomePanel(panel, extensionUri);
    HomePanel.currentPanel._panel.reveal(column);
    HomePanel.currentPanel._update();

    HomePanel.currentPanel._panel.webview.postMessage({
      command: "authComplete",
      payload: { session: data.session },
    });
  }

  public static updateFilters(filters: any) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (HomePanel.currentPanel) {
      HomePanel.currentPanel._panel.reveal(column);

      HomePanel.currentPanel._panel.webview.postMessage({
        command: "changeFilters",
        payload: { filters: filters },
      });

      return;
    }
  }

  public static kill() {
    HomePanel.currentPanel?.dispose();
    HomePanel.currentPanel = undefined;
  }

  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    HomePanel.currentPanel = new HomePanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Set the webview's initial html content
    this._update();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // // Handle messages from the webview
    // this._panel.webview.onDidReceiveMessage(
    //   (message) => {
    //     switch (message.command) {
    //       case "alert":
    //         vscode.window.showErrorMessage(message.text);
    //         return;
    //     }
    //   },
    //   null,
    //   this._disposables
    // );
  }

  public dispose() {
    HomePanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private async _update() {
    const webview = this._panel.webview;

    this._panel.webview.html = this._getHtmlForWebview(webview);
    webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "onInfo": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "onChooseProject": {
          SidebarProvider.chooseProject(data.value);
          break;
        }
        case "getSession": {
          if (HomePanel.currentPanel) {
            HomePanel.currentPanel._panel.webview.postMessage({
              command: "returnSession",
              payload: { session: SidebarProvider.session },
            });
          }
          break;
        }
        case "onError": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
        // case "tokens": {
        //   await Util.globalState.update(accessTokenKey, data.accessToken);
        //   await Util.globalState.update(refreshTokenKey, data.refreshToken);
        //   break;
        // }
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );
    const styleHomeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/home.css")
    );
    const styleTailwindUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/tailwind.css")
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/home.js")
    );
    
    const nonce = getNonce();

    const scriptProcess = `
      <script nonce="${nonce}">
        window.process = {
          env: {
            NODE_ENV: 'production'
          }
        };
      </script>
    `;

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource} 'nonce-${nonce}'; connect-src https://api.github.com;">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="${styleResetUri}" rel="stylesheet">
          <link href="${styleVSCodeUri}" rel="stylesheet">
          <link href="${styleHomeUri}" rel="stylesheet">
          <link href="${styleTailwindUri}" rel="stylesheet">
          ${scriptProcess}
          <script nonce="${nonce}">
            window.ext_vscode = acquireVsCodeApi();
          </script>
          <script nonce="${nonce}" src="${scriptUri}"></script>
        </head>
        <body>
        </body>
      </html>
    `;
  }
}
