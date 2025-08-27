const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

function buildPoolConfig() {
	if (process.env.DATABASE_URL) {
		return {
			connectionString: process.env.DATABASE_URL,
			ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false,
		};
	}
	const host = process.env.PGHOST || "localhost";
	const port = process.env.PGPORT ? Number(process.env.PGPORT) : 5432;
	const user = process.env.PGUSER;
	const password = process.env.PGPASSWORD;
	const database = process.env.PGDATABASE;

	if (!user || !database) {
		console.error(
			"Postgres env not complete. Provide DATABASE_URL or PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE"
		);
	}
	if (typeof password !== "string") {
		throw new Error(
			"Invalid PGPASSWORD; must be a string. Check your server/.env configuration."
		);
	}
	return {
		host,
		port,
		user,
		password,
		database,
		ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false,
	};
}

const pool = new Pool(buildPoolConfig());

async function initializeSchema() {
	const ddl = `
	CREATE TABLE IF NOT EXISTS admins (
		id SERIAL PRIMARY KEY,
		username TEXT UNIQUE NOT NULL,
		password_hash TEXT NOT NULL
	);

	CREATE TABLE IF NOT EXISTS posts (
		id SERIAL PRIMARY KEY,
		facebook_link TEXT NOT NULL,
		approved BOOLEAN DEFAULT FALSE,
		created_at TIMESTAMP DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS images (
		id SERIAL PRIMARY KEY,
		image_url TEXT NOT NULL,
		caption TEXT,
		created_at TIMESTAMP DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS videos (
		id SERIAL PRIMARY KEY,
		video_url TEXT NOT NULL,
		title TEXT,
		created_at TIMESTAMP DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS injured (
		id SERIAL PRIMARY KEY,
		name TEXT NOT NULL,
		details TEXT,
		picture_url TEXT,
		approved BOOLEAN DEFAULT FALSE,
		created_at TIMESTAMP DEFAULT NOW()
	);
	`;
	await pool.query(ddl);
}

initializeSchema().catch((err) => {
	console.error("Failed to initialize schema", err);
	console.error(
		"Tip: Verify DATABASE_URL or PG* env variables in server/.env. Example: PGHOST=localhost, PGPORT=5432, PGUSER=postgres, PGPASSWORD=yourpass, PGDATABASE=engrprotest"
	);
});

module.exports = pool;
