import { createHighwayCraftServer } from '../server';

// Vercel serves /api/* through this catch-all function. The same HTTP server
// also handles the /api/live WebSocket upgrade for Gemini Live sessions.
export const maxDuration = 300;

const server = await createHighwayCraftServer({ serveFrontend: false });

export default server;
