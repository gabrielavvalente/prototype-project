// Loads the common theme for the launcher page.
import '../shared/theme.css';

const search = document.querySelector('#app-search');
const apps = [...document.querySelectorAll('[data-app-name]')];

search?.addEventListener('input', () => {
  const query = search.value.trim().toLowerCase();
  apps.forEach((app) => {
    app.hidden = !app.dataset.appName.toLowerCase().includes(query);
  });
});
