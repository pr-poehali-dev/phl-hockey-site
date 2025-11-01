
UPDATE teams SET division = 'Второй' WHERE division = 'Первый';
UPDATE regulations SET content = '' WHERE id > 0;

ALTER TABLE league_info ADD COLUMN IF NOT EXISTS logo_url TEXT;
