# -*- coding: utf-8 -*-

# PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
# https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

from ccxt.base.exchange import Exchange
from ccxt.base.errors import ExchangeError


class trademn(Exchange):

    def describe(self):
        return self.deep_extend(super(trademn, self).describe(), {
            'id': 'trademn',
            'name': 'trademn',
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
                    'public': 'https://trade.mn:116/api/v2',
                    'proxy': 'https://service-api.krypto.mn/exchange-proxy/trademn',
                },
                'www': 'https://trade.mn',
                'doc': 'https://trade.mn',
            },
            'api': {
                'proxy': {
                    'get': [
                        'tickers',
                        'ohlcv',
                    ],
                },
            },
            'timeframes': {
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '4h': '240',
                '8h': '480',
                '1d': '1440',
            },
        })

    def fetch_tickers(self, symbols=None, params={}):
        response = self.proxyGetTickers(params)
        # {
        #     "data": {
        #         "DOT/MNT": {
        #           "change": 0,
        #           "lastPrice": 19000,
        #           "volume": 0
        #         }
        #     },
        #     "timestamp": 1659353716
        # }
        data = response['data']
        keys = list(data.keys())
        for i in range(0, len(keys)):
            data[keys[i]]['symbol'] = keys[i]
        return self.parse_tickers(response['data'], symbols)

    def parse_ticker(self, ticker, market=None):
        timestamp = None
        # {
        #     "change": 0,
        #     "lastPrice": 19000,
        #     "volume": 0,
        #     "symbol": "ARDX/MNT",
        #     "timestamp": 1659353716
        # }
        marketId = self.safe_string(ticker, 'symbol')
        symbol = marketId
        price = self.safe_number(ticker, 'lastPrice')
        baseVol = self.safe_number(ticker, 'volume')
        quoteVol = price * baseVol
        return {
            'symbol': symbol,
            'timestamp': timestamp,
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
            'baseVolume': baseVol,
            'quoteVolume': quoteVol,
            'info': ticker,
        }

    def fetch_ohlcv(self, symbol, timeframe='1d', since=None, limit=None, params={}):
        request = {
            'symbol': symbol,
            'interval': self.timeframes[timeframe],
        }
        if since is None:
            request['start'] = int(self.milliseconds() / 1000 - 48 * 60 * 60)
        else:
            request['start'] = int(since / 1000)
        if limit is None:
            request['end'] = int(self.milliseconds() / 1000)
        else:
            duration = self.parse_timeframe(timeframe)
            request['end'] = int(self.sum(request['start'], limit * duration))
        response = self.proxyGetOhlcv(request)
        # [
        #     {
        #         "time": 1673951700000,
        #         "open": 0.167,
        #         "high": 0.167,
        #         "low": 0.167,
        #         "close": 0.167,
        #         "volume": 1000
        #     }
        # ]
        return self.parse_ohlcvs(response, symbol, timeframe, since, limit)

    def parse_ohlc_vs(self, ohlcvs, market=None, timeframe='1m', since=None, limit=None):
        result = []
        for i in range(0, len(ohlcvs)):
            result.append(self.parse_ohlcv(ohlcvs[i], market))
        sorted = self.sort_by(result, 0)
        return sorted

    def parse_ohlcv(self, ohlcv, market=None):
        r = []
        r.append(int(ohlcv['time']))
        r.append(ohlcv['open'])
        r.append(ohlcv['high'])
        r.append(ohlcv['low'])
        r.append(ohlcv['close'])
        r.append(ohlcv['volume'])
        return r

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'][api]
        url += '/' + path
        if params:
            url += '?' + self.urlencode(params)
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    def handle_errors(self, code, reason, url, method, headers, body, response, requestHeaders, requestBody):
        if response is None:
            return  # fallback to default error handler
        if 'code' in response:
            status = self.safe_string(response, 'code')
            if status == '1':
                message = self.safe_string(response, 'msg')
                feedback = self.id + ' ' + body
                self.throw_exactly_matched_exception(self.exceptions, message, feedback)
                raise ExchangeError(feedback)
