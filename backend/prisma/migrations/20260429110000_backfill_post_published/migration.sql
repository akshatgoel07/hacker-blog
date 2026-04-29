-- One-time backfill: every existing post predates the drafts feature,
-- so mark them all as published. Future posts get `published` set
-- explicitly by the API.
UPDATE "Post" SET "published" = true WHERE "published" = false;
