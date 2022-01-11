# -*- coding: utf-8 -*-

# PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
# https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

from ccxt.base.exchange import Exchange
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import DDoSProtection


class coinhub(Exchange):

    def describe(self):
        return self.deep_extend(super(coinhub, self).describe(), {
            'id': 'coinhub',
            'name': 'coinhub',
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
                'test': {
                    'market': 'https://sapi.coinhub.mn/v1',
                    'public': 'https://sapi.coinhub.mn/v1',
                },
                'logo': 'https://user-images.githubusercontent.com/1294454/67288762-2f04a600-f4e6-11e9-9fd6-c60641919491.jpg',
                'api': {
                    'market': 'https://sapi.coinhub.mn/v1/market',
                    'public': 'https://sapi.coinhub.mn/v1',
                },
                'www': 'https://www.byte-trade.com',
                'doc': 'https://docs.byte-trade.com/#description',
            },
            'api': {
                'market': {
                    'get': [
                        'tickers',
                    ],
                },
                'public': {
                    'get': [
                        'tickers',
                    ],
                },
            },
        })

    def fetch_markets(self, params={}):
        response = self.publicGetTickers(params)
        markets = response['data']
        result = []
        keys = list(markets.keys())
        for i in range(0, len(keys)):
            market = markets[keys[i]]
            id = self.safe_string(market, 'market')
            base = self.safe_string(market, 'market').split('/')[0].upper()
            quote = self.safe_string(market, 'market').split('/')[1].upper()
            baseId = base
            quoteId = quote
            if baseId in self.commonCurrencies:
                base = self.commonCurrencies[baseId]
            if quoteId in self.commonCurrencies:
                quote = self.commonCurrencies[quoteId]
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
        #     "code": 200,
        #     "message": "success",
        #     "data": {
        #         "IHC/MNT": {
        #             "volume": 1595147755.9,
        #             "high": 3.23997,
        #             "deal": 5117109795.941351,
        #             "close": 3.224,
        #             "low": 3.13,
        #             "open": 3.16003,
        #             "change": 0.0202,
        #             "timestamp": 1641522240004,
        #             "market": "IHC/MNT"
        #         },
        # }
        return self.parse_tickers(response['data'], symbols)

    def parse_ticker(self, ticker, market=None):
        timestamp = self.safe_integer(ticker, 'timestamp')
        # {
        #     "data": {
        #         "IHC/MNT": {
        #             "volume": 1595147755.9,
        #             "high": 3.23997,
        #             "deal": 5117109795.941351,
        #             "close": 3.224,
        #             "low": 3.13,
        #             "open": 3.16003,
        #             "change": 0.0202,
        #             "timestamp": 1641522240004,
        #             "market": "IHC/MNT"
        #         }
        #     }
        # }
        marketId = self.safe_string(ticker, 'market')
        symbol = self.safe_symbol(marketId, market)
        # if marketId in self.markets_by_id:
        #     market = self.markets_by_id[marketId]
        # else:
        #     baseId = self.safe_string(ticker, 'base')
        #     quoteId = self.safe_string(ticker, 'quote')
        #     if (baseId is not None) and (quoteId is not None):
        #         base = self.safe_currency_code(baseId)
        #         quote = self.safe_currency_code(quoteId)
        #         symbol = base + '/' + quote
        #     }
        # }
        # if (symbol is None) and (market is not None):
        #     symbol = market['symbol']
        # }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': self.safe_number(ticker, 'high'),
            'low': self.safe_number(ticker, 'low'),
            'bid': None,
            'bidVolume': None,
            'ask': None,
            'askVolume': None,
            'vwap': None,
            'open': self.safe_number(ticker, 'open'),
            'close': self.safe_number(ticker, 'close'),
            'last': self.safe_number(ticker, 'close'),
            'previousClose': None,
            'change': self.safe_number(ticker, 'change'),
            'percentage': None,
            'average': None,
            'baseVolume': self.safe_number(ticker, 'volume'),
            'quoteVolume': None,
            'info': ticker,
        }

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'][api]
        url += '/' + path
        if params:
            url += '?' + self.urlencode(params)
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
