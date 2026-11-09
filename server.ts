import path from 'path';
import express from 'express';
import { createExpressApp } from './server/createApp.js';

async function startServer() {
  const app = createExpressApp();
  const PORT = Number(process.env.DATABRICKS_APP_PORT || process.env.PORT || 3000);

  // Determine production mode: either explicit NODE_ENV=production, running on Databricks,
  // or executing the compiled bundle in dist/
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    Boolean(process.env.DATABRICKS_APP_PORT) ||
    Boolean(process.argv[1]?.includes(path.join('dist', 'server.cjs')));

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Planisware CAPEX Maintenance server running on http://localhost:${PORT}`);
  });
}

startServer();
