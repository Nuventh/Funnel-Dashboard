'use strict';

const createApp = require('./app');
const settings = require('./config/settings');

const app = createApp();

app.listen(settings.port, () => {
  console.log(`Funnel dashboard API listening on http://localhost:${settings.port}`);
  console.log(`Swagger UI:  http://localhost:${settings.port}/api-docs`);
});
