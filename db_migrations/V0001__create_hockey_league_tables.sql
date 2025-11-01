
CREATE TABLE IF NOT EXISTS league_info (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT 'PHL - Первая хоккейная лига',
  description TEXT,
  telegram VARCHAR(255),
  discord VARCHAR(255),
  twitch VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  played INT DEFAULT 0,
  wins INT DEFAULT 0,
  wins_ot INT DEFAULT 0,
  losses_ot INT DEFAULT 0,
  losses INT DEFAULT 0,
  goals_for INT DEFAULT 0,
  goals_against INT DEFAULT 0,
  points INT DEFAULT 0,
  position INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  home_team_id INT REFERENCES teams(id),
  away_team_id INT REFERENCES teams(id),
  home_score INT DEFAULT 0,
  away_score INT DEFAULT 0,
  match_date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'scheduled',
  result_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS champions (
  id SERIAL PRIMARY KEY,
  season VARCHAR(100) NOT NULL,
  team_name VARCHAR(255) NOT NULL,
  description TEXT,
  year INT
);

CREATE TABLE IF NOT EXISTS regulations (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  position INT DEFAULT 0
);

INSERT INTO league_info (title, description, telegram, discord, twitch) 
VALUES (
  'PHL - Первая хоккейная лига',
  'Добро пожаловать в PHL! Мы создаём самые захватывающие хоккейные матчи.',
  'https://t.me/phl_hockey',
  'https://discord.gg/phl',
  'https://twitch.tv/phl_hockey'
);

INSERT INTO teams (name, logo_url) VALUES
  ('Спартак', null),
  ('Динамо', null),
  ('ЦСКА', null),
  ('Локомотив', null);

INSERT INTO regulations (title, content, position) VALUES
  ('Общие положения', 'Лига PHL проводит регулярные матчи по правилам IIHF', 1),
  ('Система подсчёта очков', 'Победа в основное время: 3 очка. Победа в овертайме/буллитах: 2 очка. Поражение в овертайме/буллитах: 1 очко. Поражение в основное время: 0 очков.', 2),
  ('Формат соревнований', 'Регулярный сезон проводится по системе каждый с каждым', 3);
