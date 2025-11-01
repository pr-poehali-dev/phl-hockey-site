import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get and update league data (info, teams, matches, champions, regulations)
    Args: event - dict with httpMethod, body, queryStringParameters
          context - object with attributes: request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    if method == 'GET':
        data_type = event.get('queryStringParameters', {}).get('type', 'all')
        
        result = {}
        
        if data_type in ['all', 'info']:
            cur.execute('SELECT id, title, description, telegram, discord, twitch, logo_url FROM league_info LIMIT 1')
            info_row = cur.fetchone()
            if info_row:
                result['info'] = {
                    'id': info_row[0],
                    'title': info_row[1],
                    'description': info_row[2],
                    'telegram': info_row[3],
                    'discord': info_row[4],
                    'twitch': info_row[5],
                    'logo_url': info_row[6]
                }
        
        if data_type in ['all', 'teams']:
            cur.execute('SELECT * FROM teams ORDER BY division, points DESC, goals_for - goals_against DESC')
            teams_rows = cur.fetchall()
            result['teams'] = [{
                'id': row[0],
                'name': row[1],
                'logo_url': row[2],
                'played': row[3],
                'wins': row[4],
                'wins_ot': row[5],
                'losses_ot': row[6],
                'losses': row[7],
                'goals_for': row[8],
                'goals_against': row[9],
                'points': row[10],
                'position': row[11],
                'division': row[12] if len(row) > 12 else 'Первый'
            } for row in teams_rows]
        
        if data_type in ['all', 'matches']:
            cur.execute('''
                SELECT m.id, m.home_team_id, m.away_team_id, m.home_score, m.away_score, 
                       m.match_date::text, m.status, m.result_type,
                       ht.name as home_team_name, at.name as away_team_name,
                       ht.logo_url as home_logo, at.logo_url as away_logo
                FROM matches m
                JOIN teams ht ON m.home_team_id = ht.id
                JOIN teams at ON m.away_team_id = at.id
                ORDER BY m.match_date DESC
            ''')
            matches_rows = cur.fetchall()
            result['matches'] = [{
                'id': row[0],
                'home_team_id': row[1],
                'away_team_id': row[2],
                'home_score': row[3],
                'away_score': row[4],
                'match_date': row[5],
                'status': row[6],
                'result_type': row[7],
                'home_team_name': row[8],
                'away_team_name': row[9],
                'home_logo': row[10],
                'away_logo': row[11]
            } for row in matches_rows]
        
        if data_type in ['all', 'champions']:
            cur.execute('SELECT * FROM champions ORDER BY year DESC')
            champions_rows = cur.fetchall()
            result['champions'] = [{
                'id': row[0],
                'season': row[1],
                'team_name': row[2],
                'description': row[3],
                'year': row[4]
            } for row in champions_rows]
        
        if data_type in ['all', 'regulations']:
            cur.execute('SELECT * FROM regulations ORDER BY position')
            regulations_rows = cur.fetchall()
            result['regulations'] = [{
                'id': row[0],
                'title': row[1],
                'content': row[2],
                'position': row[3]
            } for row in regulations_rows]
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps(result)
        }
    
    if method == 'PUT':
        headers = {k.lower(): v for k, v in event.get('headers', {}).items()}
        password = headers.get('x-admin-password', '')
        if password != 'phldyez':
            cur.close()
            conn.close()
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Invalid password'})
            }
        
        body_data = json.loads(event.get('body', '{}'))
        update_type = body_data.get('type')
        
        if update_type == 'info':
            cur.execute('''
                UPDATE league_info SET 
                title = %s, description = %s, telegram = %s, discord = %s, twitch = %s, logo_url = %s
                WHERE id = 1
            ''', (
                body_data.get('title'),
                body_data.get('description'),
                body_data.get('telegram'),
                body_data.get('discord'),
                body_data.get('twitch'),
                body_data.get('logo_url')
            ))
        
        elif update_type == 'team_logo':
            cur.execute('UPDATE teams SET logo_url = %s WHERE id = %s', 
                       (body_data.get('logo_url'), body_data.get('team_id')))
        
        elif update_type == 'team':
            if body_data.get('id'):
                cur.execute('UPDATE teams SET name = %s, division = %s, logo_url = %s WHERE id = %s',
                           (body_data.get('name'), body_data.get('division'), body_data.get('logo_url'), body_data.get('id')))
            else:
                cur.execute('INSERT INTO teams (name, division, logo_url) VALUES (%s, %s, %s)',
                           (body_data.get('name'), body_data.get('division', 'Первый'), body_data.get('logo_url')))
        
        elif update_type == 'team_stats':
            cur.execute('''
                UPDATE teams SET 
                played = %s, wins = %s, wins_ot = %s, losses_ot = %s, losses = %s,
                goals_for = %s, goals_against = %s, points = %s
                WHERE id = %s
            ''', (
                body_data.get('played', 0),
                body_data.get('wins', 0),
                body_data.get('wins_ot', 0),
                body_data.get('losses_ot', 0),
                body_data.get('losses', 0),
                body_data.get('goals_for', 0),
                body_data.get('goals_against', 0),
                body_data.get('points', 0),
                body_data.get('id')
            ))
        
        elif update_type == 'regulation':
            if body_data.get('id'):
                cur.execute('UPDATE regulations SET title = %s, content = %s WHERE id = %s',
                           (body_data.get('title'), body_data.get('content'), body_data.get('id')))
            else:
                cur.execute('INSERT INTO regulations (title, content, position) VALUES (%s, %s, %s)',
                           (body_data.get('title'), body_data.get('content'), body_data.get('position', 999)))
        
        elif update_type == 'champion':
            if body_data.get('id'):
                cur.execute('UPDATE champions SET season = %s, team_name = %s, description = %s, year = %s WHERE id = %s',
                           (body_data.get('season'), body_data.get('team_name'), body_data.get('description'), 
                            body_data.get('year'), body_data.get('id')))
            else:
                cur.execute('INSERT INTO champions (season, team_name, description, year) VALUES (%s, %s, %s, %s)',
                           (body_data.get('season'), body_data.get('team_name'), 
                            body_data.get('description'), body_data.get('year')))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': True})
        }
    
    cur.close()
    conn.close()
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }