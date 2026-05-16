// Boot wrapper: runs BEFORE index.js so version checks and error handlers
// fire even if a top-level import would otherwise crash silently.

const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 5)) {
  console.error(
    `[ATLAS] Node.js ${process.versions.node} is too old. Need >= 22.5 for node:sqlite. Install from https://nodejs.org`
  );
  process.exit(1);
}

process.on('uncaughtException', (err) => {
  console.error('[ATLAS] uncaughtException:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('[ATLAS] unhandledRejection:', reason);
  process.exit(1);
});

try {
  await import('./index.js');
} catch (err) {
  console.error('[ATLAS] Failed to start server:', err);
  process.exit(1);
}
