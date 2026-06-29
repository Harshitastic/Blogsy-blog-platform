const { Client } = require('pg');
const { execSync } = require('child_process');

async function main() {
  const directUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!directUrl) {
    console.error('No database connection string found');
    process.exit(1);
  }

  if (directUrl.startsWith('postgres://') || directUrl.startsWith('postgresql://')) {
    const client = new Client({ connectionString: directUrl });
    try {
      await client.connect();
      console.log("Checking if database 'blogsy' exists...");
      const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'blogsy'");
      if (res.rowCount === 0) {
        console.log("Database 'blogsy' does not exist. Creating database 'blogsy'...");
        await client.query("CREATE DATABASE blogsy");
        console.log("Database 'blogsy' created successfully.");
      } else {
        console.log("Database 'blogsy' already exists.");
      }
    } catch (err) {
      console.error('Error during database check/creation:', err);
    } finally {
      await client.end();
    }
  }

  // Modify the database URL in the environment to point to /blogsy instead of /neondb
  let databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl && (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://'))) {
    databaseUrl = databaseUrl.replace(/\/neondb(\?|$)/, '/blogsy$1');
  }

  console.log('Running prisma db push on target database (blogsy)...');
  execSync('npx prisma db push', {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'inherit'
  });
}

main();
