# -*- coding: utf-8 -*-

# PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
# https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

from ccxt.base.exchange import Exchange
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import DDoSProtection


class complex(Exchange):

    def describe(self):
        return self.deep_extend(super(complex, self).describe(), {
            'id': 'complex',
            'name': 'complex',
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
                'fetchMarkets': True,
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
                'logo': 'https://user-images.githubusercontent.com/1294454/67288762-2f04a600-f4e6-11e9-9fd6-c60641919491.jpg',
                'api': {
                    'public': 'http://52.79.140.119:8000/complex',
                },
                'www': 'https://complex.mn',
                'doc': 'https://complex.mn',
            },
            'api': {
                'public': {
                    'get': [
                        'tickers',
                    ],
                },
                'market': {
                    'get': [
                        'tickers',
                    ],
                },
            },
        })

    def fetch_markets(self, params={}):
        response = self.publicGetTickers(params)
        # {
        #     "status": "success",
        #     "data": [
        #         {
        #             "symbol": "AAVE-USDT",
        #             "high": "211.82600000",
        #             "low": "193.55300000",
        #             "volume": "367.11047577",
        #             "quoteVolume": "73326.58397790",
        #             "percentChange": "7.16",
        #             "updatedAt": "2022-01-11T16:17:40.403Z",
        #             "lastTradeRate": "211.82600000",
        #             "bidRate": "212.00100000",
        #             "askRate": "212.37300000",
        #             "_id": "60d5675465c8d98e910b2ef8",
        #             "name": "AAVE-USDT"
        #         }
        #     ]
        # }
        markets = response['data']
        result = []
        for i in range(0, len(markets)):
            market = markets[i]
            id = self.safe_string(market, 'symbol')
            baseId = id.split('-')[0]
            quoteId = id.split('-')[1]
            base = baseId.upper()
            quote = quoteId.upper()
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
        response = self.publicGetTickers(params)
        # {
        #     "status": "success",
        #     "data": [
        #         {
        #             "symbol": "AAVE-USDT",
        #             "high": "211.82600000",
        #             "low": "193.55300000",
        #             "volume": "367.11047577",
        #             "quoteVolume": "73326.58397790",
        #             "percentChange": "7.16",
        #             "updatedAt": "2022-01-11T16:17:40.403Z",
        #             "lastTradeRate": "211.82600000",
        #             "bidRate": "212.00100000",
        #             "askRate": "212.37300000",
        #             "_id": "60d5675465c8d98e910b2ef8",
        #             "name": "AAVE-USDT"
        #         }
        #     ]
        # }
        return self.parse_tickers(response['data'], symbols)

    def parse_ticker(self, ticker, market=None):
        # {
        #     "symbol": "AAVE-USDT",
        #     "high": "211.82600000",
        #     "low": "193.55300000",
        #     "volume": "367.11047577",
        #     "quoteVolume": "73326.58397790",
        #     "percentChange": "7.16",
        #     "updatedAt": "2022-01-11T16:17:40.403Z",
        #     "lastTradeRate": "211.82600000",
        #     "bidRate": "212.00100000",
        #     "askRate": "212.37300000",
        #     "_id": "60d5675465c8d98e910b2ef8",
        #     "name": "AAVE-USDT"
        # }
        marketId = self.safe_string(ticker, 'symbol')
        symbol = self.safe_symbol(marketId, market)
        return {
            'symbol': symbol,
            'timestamp': None,
            'datetime': None,
            'high': ticker['high'],
            'low': ticker['low'],
            'bid': ticker['bidRate'],
            'bidVolume': None,
            'ask': ticker['askRate'],
            'askVolume': None,
            'vwap': None,
            'open': None,
            'close': ticker['lastTradeRate'],
            'last': ticker['lastTradeRate'],
            'previousClose': None,
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': ticker['volume'],
            'quoteVolume': ticker['quoteVolume'],
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
