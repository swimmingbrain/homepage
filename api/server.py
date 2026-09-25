#!/usr/bin/env python3
"""wo gsi leaderboard.

one process, one sqlite file, no dependencies. runs behind the cloudflared
tunnel as wogsi.swimmingbrain.dev, see docker-compose.yml next to this file.

GET  /scores   every entry, best first
POST /scores   {name, score, bestGuess, time, rounds}, keeps the better run per name
GET  /health   ok
"""
import json
import os
import re
import sqlite3
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

DB = os.environ.get('WOGSI_DB', '/data/scores.db')
SEED = os.environ.get('WOGSI_SEED', '/data/seed.json')
PORT = int(os.environ.get('PORT', '8787'))
ORIGINS = {'https://swimmingbrain.dev', 'https://www.swimmingbrain.dev'}
LOCAL = re.compile(r'^https?://(localhost|127\.0\.0\.1)(:\d+)?$')
ROUNDS = 5
MAX_SCORE = ROUNDS * 5000
POSTS_PER_10_MIN = 12

lock = threading.Lock()
recent = {}


def connect():
    c = sqlite3.connect(DB)
    c.row_factory = sqlite3.Row
    return c


def init():
    os.makedirs(os.path.dirname(DB), exist_ok=True)
    c = connect()
    try:
        c.execute('''create table if not exists scores (
            name   text primary key collate nocase,
            score  integer not null,
            best   real,
            time   integer,
            rounds integer,
            date   text not null)''')
        c.commit()
        if c.execute('select count(*) from scores').fetchone()[0] == 0 and os.path.exists(SEED):
            with open(SEED, encoding='utf-8') as f:
                seed = json.load(f)
            for e in seed:
                upsert(c, e['name'][:20], int(e['score']), e.get('bestGuess'), e.get('time'), e.get('rounds', ROUNDS), e.get('date') or now())
            c.commit()
            print(f'seeded {len(seed)} entries from {SEED}', flush=True)
    finally:
        c.close()


def now():
    return time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())


def upsert(c, name, score, best, took, rounds, date):
    """true when the run was stored, false when the old one was better."""
    row = c.execute('select score from scores where name = ?', (name,)).fetchone()
    if row and row['score'] >= score:
        return False
    c.execute('''insert into scores (name, score, best, time, rounds, date) values (?, ?, ?, ?, ?, ?)
                 on conflict(name) do update set score = excluded.score, best = excluded.best,
                 time = excluded.time, rounds = excluded.rounds, date = excluded.date''',
              (name, score, best, took, rounds, date))
    return True


def listing(c):
    rows = c.execute('select * from scores order by score desc, date asc').fetchall()
    return [{'name': r['name'], 'score': r['score'], 'bestGuess': r['best'],
             'time': r['time'], 'rounds': r['rounds'], 'date': r['date']} for r in rows]


def clean(body):
    if not isinstance(body, dict):
        raise ValueError('body')
    name = re.sub(r'[\x00-\x1f\x7f]', '', str(body.get('name', ''))).strip()[:20]
    score = body.get('score')
    best = body.get('bestGuess')
    took = body.get('time')
    rounds = body.get('rounds', ROUNDS)
    if not name:
        raise ValueError('name')
    if isinstance(score, bool) or not isinstance(score, int) or not 0 <= score <= MAX_SCORE:
        raise ValueError('score')
    if best is not None and (isinstance(best, bool) or not isinstance(best, (int, float)) or not 0 <= best <= 1000):
        raise ValueError('bestGuess')
    if took is not None and (isinstance(took, bool) or not isinstance(took, (int, float)) or not 0 <= took <= 3600):
        raise ValueError('time')
    if rounds != ROUNDS:
        raise ValueError('rounds')
    return name, score, None if best is None else round(float(best), 3), None if took is None else int(took), rounds


def limited(ip):
    cutoff = time.time() - 600
    hits = [t for t in recent.get(ip, []) if t > cutoff]
    hits.append(time.time())
    recent[ip] = hits
    if len(recent) > 5000:
        recent.clear()
    return len(hits) > POSTS_PER_10_MIN


class Handler(BaseHTTPRequestHandler):
    server_version = 'wogsi/1'

    def cors(self):
        origin = self.headers.get('Origin', '')
        if origin in ORIGINS or LOCAL.match(origin):
            self.send_header('Access-Control-Allow-Origin', origin)
            self.send_header('Vary', 'Origin')

    def reply(self, code, payload):
        body = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.cors()
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.cors()
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Max-Age', '86400')
        self.end_headers()

    def do_GET(self):
        path = urlparse(self.path).path
        if path == '/health':
            return self.reply(200, {'ok': True})
        if path == '/scores':
            c = connect()
            try:
                return self.reply(200, {'scores': listing(c)})
            finally:
                c.close()
        self.reply(404, {'error': 'not found'})

    def do_POST(self):
        if urlparse(self.path).path != '/scores':
            return self.reply(404, {'error': 'not found'})
        ip = (self.headers.get('CF-Connecting-IP')
              or self.headers.get('X-Forwarded-For', '').split(',')[0].strip()
              or self.client_address[0])
        if limited(ip):
            return self.reply(429, {'error': 'too many runs, wait a bit'})
        try:
            length = int(self.headers.get('Content-Length', 0))
            if not 0 < length <= 2048:
                raise ValueError('length')
            name, score, best, took, rounds = clean(json.loads(self.rfile.read(length)))
        except (ValueError, TypeError, json.JSONDecodeError):
            return self.reply(400, {'error': 'bad request'})
        with lock:
            c = connect()
            try:
                saved = upsert(c, name, score, best, took, rounds, now())
                c.commit()
                scores = listing(c)
            finally:
                c.close()
        rank = next((i + 1 for i, e in enumerate(scores) if e['name'].lower() == name.lower()), None)
        print(f'{ip} {name!r} {score} {"saved" if saved else "kept old"}', flush=True)
        self.reply(200, {'saved': saved, 'rank': rank, 'scores': scores})

    def log_message(self, fmt, *args):
        pass


if __name__ == '__main__':
    init()
    print(f'wogsi leaderboard on :{PORT}, db {DB}', flush=True)
    ThreadingHTTPServer(('0.0.0.0', PORT), Handler).serve_forever()
