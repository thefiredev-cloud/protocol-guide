-- Migration: Add waitlist_signups table for email capture
-- Created: 2026-01-26

CREATE TABLE IF NOT EXISTS "waitlist_signups" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"source" varchar(100) DEFAULT 'landing_page',
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "waitlist_signups_email_idx" ON "waitlist_signups" USING btree ("email");
CREATE INDEX IF NOT EXISTS "waitlist_signups_created_idx" ON "waitlist_signups" USING btree ("created_at");
