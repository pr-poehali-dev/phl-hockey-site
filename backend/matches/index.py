import json
import os
import psycopg2
from typing import Dict, Any
from datetime import datetime

def recalculate_standings(cur, conn):
    cur.execute('UPDATE teams SET played = 0, wins = 0, wins_ot = 0, losses_ot = 0, losses = 0, goals_for = 0, goals_against = 0, points = 0')
    
    cur.execute('''
        SELECT home_team_id, away_team_id, home_score, away_score, result_type
        FROM matches WHERE status = 'finished'
    ''')
    
    for match in cur.fetchall():
        home_id, away_id, home_score, away_score, result_type = match
        
        cur.execute('UPDATE teams SET played = played + 1, goals_for = goals_for + %s, goals_against = goals_against + %s WHERE id = %s',
                   (home_score, away_score, home_id))
        cur.execute('UPDATE teams SET played = played + 1, goals_for = goals_for + %s, goals_against = goals_against + %s WHERE id = %s',
                   (away_score, home_score, away_id))
        
        if home_score > away_score:
            if result_type == 'regulation':
                cur.execute('UPDATE teams SET wins = wins + 1, points = points + 2 WHERE id = %s', (home_id,))
                cur.execute('UPDATE teams SET losses = losses + 1 WHERE id = %s', (away_id,))
            else:
                cur.execute('UPDATE teams SET wins_ot = wins_ot + 1, points = points + 2 WHERE id = %s', (home_id,))
                cur.execute('UPDATE teams SET losses_ot = losses_ot + 1, points = points + 1 WHERE id = %s', (away_id,))
        else:
            if result_type == 'regulation':
                cur.execute('UPDATE teams SET wins = wins + 1, points = points + 2 WHERE id = %s', (away_id,))
                cur.execute('UPDATE teams SET losses = losses + 1 WHERE id = %s', (home_id,))
            else:
                cur.execute('UPDATE teams SET wins_ot = wins_ot + 1, points = points + 2 WHERE id = %s', (away_id,))
                cur.execute('UPDATE teams SET losses_ot = losses_ot + 1, points = points + 1 WHERE id = %s', (home_id,))
    
    conn.commit()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage matches and auto-calculate standings based on hockey rules
    Args: event - dict with httpMethod, body, queryStringParameters
          context - object with request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    if method == 'POST':
        headers = {k.lower(): v for k, v in event.get('headers', {}).items()}
        password = headers.get('x-admin-password', '')
        if password != 'phldyez':
            cur.close()
            conn.close()
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid password'})
            }
        
        body_data = json.loads(event.get('body', '{}'))
        
        cur.execute('''
            INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, status, result_type)
            VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id
        ''', (
            body_data.get('home_team_id'),
            body_data.get('away_team_id'),
            body_data.get('home_score', 0),
            body_data.get('away_score', 0),
            body_data.get('match_date'),
            body_data.get('status', 'scheduled'),
            body_data.get('result_type')
        ))
        
        match_id = cur.fetchone()[0]
        conn.commit()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'id': match_id, 'success': True})
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
                'body': json.dumps({'error': 'Invalid password'})
            }
        
        body_data = json.loads(event.get('body', '{}'))
        match_id = body_data.get('id')
        
        cur.execute('''
            UPDATE matches SET 
            home_score = %s, away_score = %s, status = %s, result_type = %s, match_date = %s
            WHERE id = %s
        ''', (
            body_data.get('home_score'),
            body_data.get('away_score'),
            body_data.get('status'),
            body_data.get('result_type'),
            body_data.get('match_date'),
            match_id
        ))
        
        conn.commit()
        recalculate_standings(cur, conn)
        
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