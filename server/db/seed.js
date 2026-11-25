console.error('Automatic SQLite seeding has been disabled. To preserve your existing records, configure .env and run: npm run migrate:mysql');
process.exitCode = 1;
