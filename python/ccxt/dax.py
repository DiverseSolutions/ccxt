# -*- coding: utf-8 -*-

# PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
# https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

from ccxt.base.exchange import Exchange
import math
import sys
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import DDoSProtection


class dax(Exchange):

    def describe(self):
        return self.deep_extend(super(dax, self).describe(), {
            'id': 'dax',
            'name': 'dax',
            'countries': ['MN'],
            'rateLimit': 500,
            'requiresWeb3': False,
            'certified': False,
            # new metainfo interface
            'has': {
                'cancelOrder': False,
                'CORS': None,
                'createOrder': False,
                'fetchBalance': False,
                'fetchBidsAsks': False,
                'fetchClosedOrders': False,
                'fetchCurrencies': False,
                'fetchDepositAddress': False,
                'fetchDeposits': False,
                'fetchMarkets': False,
                'fetchMyTrades': False,
                'fetchOHLCV': False,
                'fetchOpenOrders': False,
                'fetchOrder': False,
                'fetchOrderBook': False,
                'fetchOrders': False,
                'fetchTicker': False,
                'fetchTickers': True,
                'fetchTrades': False,
                'fetchWithdrawals': False,
                'withdraw': None,
            },
            'urls': {
                'test': {
                    'public': 'https://api.dax.mn/v1',
                    'tv': 'https://pairstats.dax.mn/tv',
                },
                'logo': 'https://user-images.githubusercontent.com/1294454/67288762-2f04a600-f4e6-11e9-9fd6-c60641919491.jpg',
                'api': {
                    'public': 'https://api.dax.mn/v1',
                    'tv': 'https://pairstats.dax.mn/tv',
                },
                'www': 'https://dax.mn',
                'doc': 'https://dax.mn',
            },
            'api': {
                'public': {
                    'post': [
                        'graphql',
                    ],
                },
                'tv': {
                    'get': [
                        'symbols',
                    ],
                },
            },
        })

    def fetch_markets(self, params={}):
        response = self.tvGetSymbols(params)
        markets = response
        result = []
        for i in range(0, len(markets)):
            market = markets[i]
            id = self.safe_string(market, 'symbol')
            base = self.safe_string(market, 'base-currency').upper()
            quote = self.safe_string(market, 'quote-currency').upper()
            baseId = base
            quoteId = quote
            symbol = base + '/' + quote
            entry = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': True,
                'taker': None,
                'maker': None,
                'type': 'spot',
                'linear': False,
                'inverse': False,
                'contractSize': 1,
                'spot': True,
                'margin': False,
                'future': False,
                'swap': False,
                'option': False,
                'contract': False,
                'settleId': None,
                'settle': None,
                'expiry': None,
                'expiryDatetime': None,
                'percentage': False,
                'tierBased': False,
                'feeSide': 'get',
                'precision': {
                    'price': None,
                    'amount': None,
                    'cost': None,
                },
                'limits': {
                    'amount': {
                        'min': None,
                        'max': None,
                    },
                    'price': None,
                    'cost': None,
                },
                'info': None,
            }
            result.append(entry)
        return result

    def fetch_tickers(self, symbols=None, params={}):
        self.load_markets()
        request = {
            'operationName': 'Pairs',
            'variables': {
                'sysPairWhere': {
                    'is_active': {
                        '_eq': True,
                    },
                },
            },
            'query': 'query Pairs($sysPairWhere: sys_pair_bool_exp) {\n  sys_pair(where: $sysPairWhere) {\n    id\n    baseAsset {\n      code\n      name\n      scale\n      total_market_cap\n      __typename\n    }\n    price {\n      last_price\n      __typename\n    }\n    quoteAsset {\n      code\n      name\n      scale\n      __typename\n    }\n    symbol\n    is_active\n    stats24 {\n      change24h\n      __typename\n    }\n    base_tick_size\n    quote_tick_size\n    __typename\n  }\n  ex_pair_stats_24h {\n    b24h_price\n    change24h\n    symbol\n    pair_id\n    last_price\n    updated_dt\n    vol\n    __typename\n  }\n}\n',
        }
        response = self.publicPostGraphql(self.json(self.extend(request, params)))
        # {
        #     "data": {
        #         "sys_pair": [
        #             {
        #                 "id": 23,
        #                 "baseAsset": {
        #                     "code": "MONT",
        #                     "name": "MONT",
        #                     "scale": 18,
        #                     "total_market_cap": null,
        #                     "__typename": "sys_asset"
        #                 },
        #                 "price": {
        #                     "last_price": 99,
        #                     "__typename": "ex_pair_price"
        #                 },
        #                 "quoteAsset": {
        #                     "code": "MNT",
        #                     "name": "Төгрөг",
        #                     "scale": 2,
        #                     "__typename": "sys_asset"
        #                 },
        #                 "symbol": "MONTMNT",
        #                 "is_active": True,
        #                 "stats24": {
        #                     "change24h": 0.00000000,
        #                     "__typename": "ex_pair_stats_24h"
        #                 },
        #                 "base_tick_size": 1000000000000000000,
        #                 "quote_tick_size": 1,
        #                 "__typename": "sys_pair"
        #             },
        #         ],
        #         "ex_pair_stats_24h": [
        #             {
        #                 "b24h_price": null,
        #                 "change24h": 0.00000000,
        #                 "symbol": "14MNT",
        #                 "pair_id": 9,
        #                 "last_price": null,
        #                 "updated_dt": "2021-01-29T01:20:20",
        #                 "vol": null,
        #                 "__typename": "ex_pair_stats_24h"
        #             },
        #         ]
        #     }
        # }
        # merge volume from ex_pair_stats_24h
        for i in range(0, len(response['data']['sys_pair'])):
            pair = response['data']['sys_pair'][i]
            pair['vol'] = 0
            for j in range(0, len(response['data']['ex_pair_stats_24h'])):
                pairStats = response['data']['ex_pair_stats_24h'][j]
                if pair['symbol'] == pairStats['symbol'] and pairStats['vol']:
                    pair['vol'] = pairStats['vol']
        return self.parse_tickers(response['data']['sys_pair'], symbols)

    def parse_ticker(self, ticker, market=None):
        timestamp = None
        # {
        #     id: '24',
        #     baseAsset: {
        #       code: 'URG',
        #       name: 'URG',
        #       scale: '18',
        #       total_market_cap: null,
        #       __typename: 'sys_asset'
        #     },
        #     price: {last_price: '540000000000000000', __typename: 'ex_pair_price'},
        #     quoteAsset: {code: 'MONT', name: 'MONT', scale: '18', __typename: 'sys_asset'},
        #     symbol: 'URGMONT',
        #     is_active: True,
        #     stats24: {change24h: '20.00000000', __typename: 'ex_pair_stats_24h'},
        #     base_tick_size: '10000000000000000',
        #     quote_tick_size: '10000000000000000',
        #     __typename: 'sys_pair'
        # }
        marketId = self.safe_string(ticker, 'symbol')
        symbol = self.safe_symbol(marketId, market)
        baseScale = self.safe_number(ticker['baseAsset'], 'scale')
        quoteScale = self.safe_number(ticker['quoteAsset'], 'scale')
        price = self.safe_number(ticker['price'], 'last_price') / math.pow(10, quoteScale)
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': None,
            'high': None,
            'low': None,
            'bid': None,
            'bidVolume': None,
            'ask': None,
            'askVolume': None,
            'vwap': None,
            'open': None,
            'close': price,
            'last': price,
            'previousClose': None,
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': self.safe_number(ticker, 'vol') / math.pow(10, baseScale),
            'quoteVolume': None,
            'info': ticker,
        }

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'][api]
        url += '/' + path
        if method == 'GET' and params:
            url += '?' + self.urlencode(params)
        if method == 'GET':
            return {
                'url': url,
                'method': method,
                'headers': headers,
                'params': {},
                'body': body,
            }
        body = params
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    def handle_errors(self, code, reason, url, method, headers, body, response, requestHeaders, requestBody):
        if code == 503:
            raise DDoSProtection(self.id + ' ' + str(code) + ' ' + reason + ' ' + body)
        if response is None:
            return  # fallback to default error handler
        if 'code' in response:
            status = self.safe_string(response, 'code')
            if status == '1':
                message = self.safe_string(response, 'msg')
                feedback = self.id + ' ' + body
                self.throw_exactly_matched_exception(self.exceptions, message, feedback)
                raise ExchangeError(feedback)
