/**
 * Confirms DATABASE_URL is the transaction pooler and DIRECT_URL is session/direct.
 * Does not print connection strings.
 */
const databaseUrl = process.env.DATABASE_URL ?? "";
const directUrl = process.env.DIRECT_URL ?? "";

const issues: string[] = [];

function hasPort(url: string, port: string) {
  return url.includes(`:${port}/`) || url.includes(`:${port}?`);
}

if (!databaseUrl) issues.push("DATABASE_URL is missing");
else {
  if (!hasPort(databaseUrl, "6543")) {
    issues.push("DATABASE_URL should use the transaction pooler on port 6543");
  }
  if (!databaseUrl.includes("pgbouncer=true")) {
    issues.push("DATABASE_URL should include pgbouncer=true");
  }
  if (!databaseUrl.includes("connection_limit=1")) {
    issues.push("DATABASE_URL should include connection_limit=1");
  }
}

if (!directUrl) issues.push("DIRECT_URL is missing");
else if (!hasPort(directUrl, "5432")) {
  issues.push("DIRECT_URL should use the session/direct connection on port 5432");
}

if (issues.length) {
  console.error("Database URL check failed:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("Database URLs look correct: pooler :6543 for runtime, direct :5432 for migrations.");
