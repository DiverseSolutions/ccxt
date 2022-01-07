# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

gdax = ccxt.gdax({
    'apiKey': "YOUR_API_KEY",
    'secret': "YOUR_SECRET",
    'password': "YOUR_PASSWORD",
    'verbose': True,  # switch it to False if you don't want the HTTP log
})

# move gdax to sandbox
gdax.urls['api'] = 'https://api-public.sandbox.gdax.com'

print(gdax.fetch_balance())
