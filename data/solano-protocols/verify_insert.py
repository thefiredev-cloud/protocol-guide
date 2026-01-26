#!/usr/bin/env python3
"""Verify Solano County chunks in database."""

import os
import requests
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(r"C:\Users\Tanner\Protocol-Guide\.env"))

url = os.getenv('SUPABASE_URL') + '/rest/v1/manus_protocol_chunks'
headers = {
    'apikey': os.getenv('SUPABASE_SERVICE_ROLE_KEY'),
    'Authorization': 'Bearer ' + os.getenv('SUPABASE_SERVICE_ROLE_KEY'),
    'Prefer': 'count=exact'
}

# Exact count for Solano County EMS Agency
params = {'agency_name': 'eq.Solano County EMS Agency', 'select': 'id', 'limit': '1'}
r = requests.get(url, headers=headers, params=params)
print('Solano County EMS Agency chunks:', r.headers.get('content-range'))

# Get recent chunks
params2 = {
    'agency_name': 'eq.Solano County EMS Agency', 
    'select': 'id,protocol_title,section,created_at',
    'order': 'created_at.desc',
    'limit': '10'
}
r2 = requests.get(url, headers=headers, params=params2)
print('\nRecent chunks:')
for item in r2.json():
    title = item['protocol_title'][:40]
    print(f"  ID {item['id']}: {title}... [{item['section']}] @ {item['created_at']}")

# Get sections breakdown
params3 = {
    'agency_name': 'eq.Solano County EMS Agency', 
    'select': 'section',
    'limit': '1000'
}
r3 = requests.get(url, headers=headers, params=params3)
from collections import Counter
sections = Counter([item['section'] for item in r3.json()])
print('\nSections breakdown:')
for section, count in sections.most_common():
    print(f"  {section}: {count}")
