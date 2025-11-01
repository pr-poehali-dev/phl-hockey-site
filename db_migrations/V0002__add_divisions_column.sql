
ALTER TABLE teams ADD COLUMN IF NOT EXISTS division VARCHAR(50) DEFAULT 'Первый';

UPDATE league_info SET description = '', telegram = '', discord = '', twitch = '';
UPDATE teams SET played = 0, wins = 0, wins_ot = 0, losses_ot = 0, losses = 0, goals_for = 0, goals_against = 0, points = 0;
