# -*- coding: utf-8 -*-

# PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
# https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

from ccxt.async_support.base.exchange import Exchange
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
                    'public': 'https://www.corex.mn/api/v2/peatio/public',
                    'proxy': 'https://www.corex.mn/api/v2/peatio/public',
                    'market': 'http://52.79.140.119:8000/corex',
                },
                'www': 'https://www.corex.mn',
                'doc': 'https://www.corex.mn',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'ohlcv',
                    ],
                },
                'proxy': {
                    'get': [
                        'ohlcv',
                    ],
                },
                'market': {
                    'get': [
                        'tickers',
                    ],
                },
            },
            'timeframes': {
                '1m': '60',
                '5m': '300',
                '15m': '900',
                '30m': '1800',
                '1h': '3600',
                '4h': '14400',
                '1d': '86400',
            },
        })

    async def fetch_markets(self, params={}):
        response = await self.publicGetMarkets(params)
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

    async def fetch_tickers(self, symbols=None, params={}):
        await self.load_markets()
        response = await self.marketGetTickers(params)
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
        baseVolume = float(ticker['last']) and float(ticker['vol']) / float(ticker['last']) if float(ticker['vol']) else 0
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
            'baseVolume': baseVolume,
            'quoteVolume': ticker['vol'],
            'info': ticker,
        }

    async def fetch_ohlcv(self, symbol, timeframe='1d', since=None, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        request = {
            'market_id': market['id'],
        }
        if since is None:
            request['start'] = int(self.milliseconds() / 1000 - 48 * 60 * 60)
        else:
            request['start'] = since
        if limit is None:
            request['end'] = int(self.milliseconds() / 1000)
        else:
            duration = self.parse_timeframe(timeframe)
            request['end'] = int(self.sum(request['start'], limit * duration))
        response = await self.publicGetOhlcv(request)
        # [
        #     [
        #       1663257600,
        #       19736.5,
        #       19945.7,
        #       19446.6,
        #       19662.1,
        #       5243.97705169
        #     ],
        # ]
        return self.parse_ohlcvs(response, symbol, timeframe, since, limit)

    def parse_ohlc_vs(self, ohlcvs, market=None, timeframe='1m', since=None, limit=None):
        result = []
        for i in range(0, len(ohlcvs)):
            result.append(self.parse_ohlcv(ohlcvs[i], market))
        sorted = self.sort_by(result, 0)
        return sorted

    def parse_ohlcv(self, ohlcv, market=None):
        ohlcv[0] = int(ohlcv[0]) * 1000
        ohlcv[1] = float(ohlcv[1])
        ohlcv[2] = float(ohlcv[2])
        ohlcv[3] = float(ohlcv[3])
        ohlcv[4] = float(ohlcv[4])
        ohlcv[5] = float(ohlcv[5])
        return ohlcv

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
