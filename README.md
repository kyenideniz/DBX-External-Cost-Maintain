# Planisware CAPEX & OPEX Maintenance App

Monthly reconciliation and manual maintenance of CAPEX/OPEX external actuals in Planisware from SAP CJI3 Excel extracts.

---

## Deploying on Databricks Apps

This application is configured for native deployment on **Azure Databricks Apps** without breaking local development or Google AI Studio compatibility.

### Deployment Configuration

1. **Deploy from Branch `dbx`**:
   - In Databricks Apps, select this repository and configure the source branch to **`dbx`**.

2. **Application Manifest (`app.yaml`)**:
   - The repository root contains `app.yaml`:
     ```yaml
     command: ['npm', 'run', 'start']
     env:
       - name: 'NODE_ENV'
         value: 'production'
     ```
   - **Gemini API Secret (`gemini-api-key`)**: If you attach Gemini AI capabilities or secrets in Databricks Apps, add the secret reference to `app.yaml`:
     ```yaml
     env:
       - name: 'GEMINI_API_KEY'
         valueFrom: 'gemini-api-key'
     ```
     *(Note: The current core SAP/Planisware delta reconciliation engine operates deterministically and does not require external Gemini API calls.)*

3. **Build & Start Flow on Databricks Apps**:
   - **Install:** Databricks runs `npm install`. All build-time tools (`vite`, `esbuild`, `typescript`) are listed in `dependencies` so that installs succeed in production mode.
   - **Build:** `npm run build` executes:
     1. `vite build` to compile the React frontend into static assets in `dist/`.
     2. `esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs` to compile the Express backend into a standalone CommonJS bundle.
   - **Start:** `npm run start` runs `node dist/server.cjs` using plain Node.js.
   - **Port & Host Binding:** The server listens on `0.0.0.0` and binds dynamically to `process.env.DATABRICKS_APP_PORT` (with fallback to `PORT` or `3000`).
   - **Static Serving & SPA Routing:** In production mode (`NODE_ENV=production` or running inside Databricks), the Express server serves static assets from `dist/` and provides client-side SPA routing fallback for all non-API routes. Vite development middleware is bypassed.

4. **Persistence Note**:
   - Databricks App container filesystems are ephemeral. Local JSON database records (`data/db.json`), mappings (`src/data/wbsToProjectName.json`), and uploaded Excel files reset across redeployments. For multi-replica or persistent state, mount Unity Catalog Volumes or connect to a cloud relational database.

---

## Local Development & Testing

- **Development Mode:**
  ```bash
  npm run dev
  ```
  Runs the server with Vite middleware on `http://localhost:3000`.

- **Production Build & Start:**
  ```bash
  npm run build
  npm run start
  ```
  Compiles the frontend and backend, then launches the production server on port 3000 (or `DATABRICKS_APP_PORT` if defined).

- **Unit Tests:**
  ```bash
  npm run test
  ```
