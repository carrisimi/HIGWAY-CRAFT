import { createHighwayCraftServer } from '../server.ts';

// Vercel serves /api/* through this catch-all Node.js Function.
// It handles the Express JSON API and the /api/live WebSocket upgrade.
export const maxDuration = 300;

const server = await createHighwayCraftServer({ serveFrontend: false });

export default server;
