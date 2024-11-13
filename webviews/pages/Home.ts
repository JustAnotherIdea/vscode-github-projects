import App from '../components/Home.svelte';

let app: any;

document.addEventListener('DOMContentLoaded', () => {
  app = new App({
    target: document.body,
  });
});

export default app;