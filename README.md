# WhatsApp Clone

A React and Firebase chat application powered by Vite.

## Development

Install dependencies and start the local development server:

```bash
npm install
npm run dev
```

Vite serves the app at [http://localhost:5173](http://localhost:5173) by default.

## Production

```bash
npm run build
npm run preview
```

The production bundle is written to `dist`.

## Routing

React Router handles the home route and dynamic chat routes at `/chat/:id`. Hosting platforms must serve `index.html` for unknown paths; the included `vercel.json` configures this behavior on Vercel.
