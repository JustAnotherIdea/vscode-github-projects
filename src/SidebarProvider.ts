import * as vscode from "vscode";
import { Credentials } from "./authentication";
import { getNonce } from "./getNonce";
import { HomePanel } from "./HomePanel";

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;
  ext_uri?: vscode.Uri;
  credentials: Credentials;

  public static currentView: vscode.WebviewView | undefined;
  public static session: any;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    currentContext: vscode.ExtensionContext
  ) {
    this.ext_uri = _extensionUri;
    this.credentials = new Credentials();
    this.credentials.initialize(currentContext);
  }

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    SidebarProvider.currentView = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
      enableCommandUris: true,
      retainContextWhenHidden: true
    };

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    const styleResetUri = webviewView.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const styleVSCodeUri = webviewView.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );
    const scriptUri = webviewView.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/sidebar.js")
    );
    const styleMainUri = webviewView.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/sidebar.css")
    );

    const scriptProcess = `
      <script nonce="${nonce}">
        window.process = {
          env: {
            NODE_ENV: 'production'
          }
        };
      </script>
    `;

    webviewView.webview.html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webviewView.webview.cspSource}; script-src ${webviewView.webview.cspSource} 'nonce-${nonce}'; connect-src https://api.github.com;">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="${styleResetUri}" rel="stylesheet">
          <link href="${styleVSCodeUri}" rel="stylesheet">
          <link href="${styleMainUri}" rel="stylesheet">
          ${scriptProcess}
          <script nonce="${nonce}">
            window.ext_vscode = acquireVsCodeApi();
          </script>
          <script nonce="${nonce}" src="${scriptUri}"></script>
        </head>
        <body>
          <div id="app"></div>
        </body>
      </html>`;

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "onSignIn": {
          //run on recieving "onSignIn" message
          if (!data.value) {
            return;
          }
          const session = await this.credentials.getSession();

          if (session) {
            SidebarProvider.session = session;
            
            if (data.value !== "noNotification") {
              vscode.window.showInformationMessage(
                "Signed In as: '" + session.account.label + "'"
              );
            }

            webviewView.webview.postMessage({
              command: "authComplete",
              payload: { session: session },
            });

            if (this.ext_uri) {
              HomePanel.createOrShow(this.ext_uri, { session: session }); //create a Homepanel window on sign in
            }
          } else {
            vscode.window.showErrorMessage(
              "Could not authenticate with GitHub, please try again."
            );
          }

          break;
        }
        case "onChangeFilter": {
          if (!data.value) {
            return;
          }
          HomePanel.updateFilters(data.value);
          break;
        }
        case "onInfo": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "onError": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
      }
    });
  }

  public static chooseProject(data: any | null) {
    if (SidebarProvider.currentView) {
      SidebarProvider.currentView.webview.postMessage({
        command: "projectChosen",
        payload: { project: data.project, container: data.container },
      });
    }
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/sidebar.js")
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/sidebar.css")
    );

    const scriptProcess = `
      <script nonce="${nonce}">
        window.process = {
          env: {
            NODE_ENV: 'production'
          }
        };
      </script>
    `;

    return `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src ${webview.cspSource} 'nonce-${nonce}'; connect-src https://api.github.com;">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="${styleResetUri}" rel="stylesheet">
          <link href="${styleVSCodeUri}" rel="stylesheet">
          <link href="${styleMainUri}" rel="stylesheet">
          ${scriptProcess}
          <script nonce="${nonce}">
            window.ext_vscode = acquireVsCodeApi();
          </script>
          <script nonce="${nonce}" src="${scriptUri}"></script>
        </head>
        <body>
          <div id="app"></div>
        </body>
      </html>`;
  }
}
