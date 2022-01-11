# -*- coding: utf-8 -*-

# PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
# https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

from ccxt.base.exchange import Exchange
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import DDoSProtection


class corex(Exchange):

    def describe(self):
        return self.deep_extend(super(corex, self).describe(), {
            'id': 'corex',
            'name': 'corex',
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
                'logo': 'https://user-images.githubusercontent.com/1294454/67288762-2f04a600-f4e6-11e9-9fd6-c60641919491.jpg',
                'api': {
                    'public': 'https://www.corex.mn/api/v2/peatio/public',
                    'market': 'http://52.79.140.119:8000/corex',
                },
                'www': 'https://dax.mn',
                'doc': 'https://dax.mn',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
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
        response = self.publicGetMarkets(params)
        # [
        #     {
        #         "id": "crxmnt",
        #         "name": "CRX/MNT",
        #         "base_unit": "crx",
        #         "quote_unit": "mnt",
        #         "min_price": "10.0",
        #         "max_price": "500.0",
        #         "min_amount": "3000.0",
        #         "amount_precision": 1,
        #         "price_precision": 2,
        #         "state": "enabled"
        #     }
        # ]
        markets = response
        result = []
        for i in range(0, len(markets)):
            market = markets[i]
            id = self.safe_string(market, 'id')
            baseId = self.safe_string(market, 'base_unit')
            quoteId = self.safe_string(market, 'quote_unit')
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
        response = self.marketGetTickers(params)
        # {
        #     "crxmnt": {
        #         "at": "1641916282",
        #         "ticker": {
        #             "low": "13.13",
        #             "high": "13.3",
        #             "open": "13.23",
        #             "last": "13.2",
        #             "volume": "43054233.526",
        #             "amount": "3263026.8",
        #             "avg_price": "13.1945693875392",
        #             "price_change_percent": "-0.23%",
        #             "vol": "43054233.526"
        #         }
        #     }
        # }
        keys = list(response.keys())
        for i in range(0, len(keys)):
            response[keys[i]]['id'] = keys[i]
        return self.parse_tickers(response, symbols)

    def parse_ticker(self, tickerData, market_=None):
        market = self.market(tickerData['id'])
        timestamp = self.safe_timestamp(tickerData, 'at')
        ticker = tickerData['ticker']
        # {
        #     "at": "1641916282",
        #     "ticker": {
        #         "low": "13.13",
        #         "high": "13.3",
        #         "open": "13.23",
        #         "last": "13.2",
        #         "volume": "43054233.526",
        #         "amount": "3263026.8",
        #         "avg_price": "13.1945693875392",
        #         "price_change_percent": "-0.23%",
        #         "vol": "43054233.526"
        #     }
        # }
        marketId = self.safe_string(ticker, 'trading_pairs')
        symbol = self.safe_symbol(marketId, market)
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': ticker['high'],
            'low': ticker['low'],
            'bid': None,
            'bidVolume': None,
            'ask': None,
            'askVolume': None,
            'vwap': None,
            'open': ticker['open'],
            'close': ticker['last'],
            'last': ticker['last'],
            'previousClose': None,
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': ticker['vol'],
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
