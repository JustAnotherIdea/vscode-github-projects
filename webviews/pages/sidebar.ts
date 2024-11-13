import App from "../components/Sidebar.svelte";

let app: any;

document.addEventListener('DOMContentLoaded', () => {
  app = new App({
    target: document.body,
  });
});

export default app;
