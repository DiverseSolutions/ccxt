# -*- coding: utf-8 -*-

# PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
# https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

from ccxt.async_support.base.exchange import Exchange
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
                'fetchOHLCV': True,
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
                    'public': 'https://exchange-proxy.krypto.mn/complex',
                },
                'www': 'https://complex.mn',
                'doc': 'https://complex.mn',
            },
            'api': {
                'public': {
                    'get': [
                        'tickers',
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
                '1m': '1',
                '3m': None,
                '5m': '5',
                '15m': None,
                '30m': None,
                '1h': None,
                '2h': None,
                '4h': None,
                '6h': None,
                '8h': None,
                '12h': None,
                '1d': '1D',
                '3d': None,
                '1w': None,
                '1M': None,
            },
        })

    async def fetch_markets(self, params={}):
        response = await self.publicGetTickers(params)
        # [
        #     {
        #     "symbol": "MNFT-MNT",
        #     "volume": "15614833.13",
        #     "percentChange": "5.15",
        #     "name": "MNFT-MNT",
        #     "lastTradeRate": "0.07349"
        #     }
        # ]
        markets = response
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

    async def fetch_tickers(self, symbols=None, params={}):
        await self.load_markets()
        response = await self.publicGetTickers(params)
        # [
        #     {
        #     "symbol": "MNFT-MNT",
        #     "volume": "15614833.13",
        #     "percentChange": "5.15",
        #     "name": "MNFT-MNT",
        #     "lastTradeRate": "0.07349"
        #     }
        # ]
        return self.parse_tickers(response, symbols)

    def parse_ticker(self, ticker, market=None):
        # {
        #     "symbol": "MNFT-MNT",
        #     "volume": "15614833.13",
        #     "percentChange": "5.15",
        #     "name": "MNFT-MNT",
        #     "lastTradeRate": "0.07349"
        # }
        marketId = self.safe_string(ticker, 'symbol')
        symbol = self.safe_symbol(marketId, market)
        price = self.safe_number(ticker, 'lastTradeRate')
        quoteVol = self.safe_number(ticker, 'volume')
        baseVol = quoteVol / price
        return {
            'symbol': symbol,
            'timestamp': None,
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
            'baseVolume': baseVol,
            'quoteVolume': quoteVol,
            'info': ticker,
        }

    async def fetch_ohlcv(self, symbol, timeframe='1d', since=None, limit=None, params={}):
        pairs = symbol.split('/')
        base = pairs[0].upper()
        quote = pairs[1].upper()
        id = base + '-' + quote
        request = {
            'market': id,
            'resolution': self.timeframes[timeframe]
        }
        if since is None:
            request['from'] = int(self.milliseconds() / 1000 - 48 * 60 * 60)
        else:
            request['from'] = since
        if limit is None:
            request['to'] = int(self.milliseconds() / 1000)
        else:
            duration = self.parse_timeframe(timeframe)
            request['to'] = int(self.sum(request['from'], limit * duration))
        response = await self.publicGetOhlcv(request)
        # {
        #     "s": "ok",
        #     "errmsg": null,
        #     "t": [
        #       1663286400,
        #     ],
        #     "o": [
        #         1663286400,
        #       ],
        #     "h": [
        #       1663286400,
        #     ],
        #     "l": [
        #         1663286400,
        #       ],
        #     "c": [
        #       1663286400,
        #     ],
        #     "v": [
        #         1663286400,
        #       ],
        # }
        return self.parse_ohlcvs(response, symbol, timeframe, since, limit)

    def parse_ohlcvs(self, ohlcvs, market=None, timeframe='1d', since=None, limit=None):
        result = []
        for i in range(0, len(ohlcvs['c'])):
            ohlcv = []
            ohlcv.append(int(ohlcvs['t'][i]) * 1000)
            ohlcv.append(float(ohlcvs['o'][i]))
            ohlcv.append(float(ohlcvs['h'][i]))
            ohlcv.append(float(ohlcvs['l'][i]))
            ohlcv.append(float(ohlcvs['c'][i]))
            ohlcv.append(float(ohlcvs['v'][i]))
            result.append(ohlcv)
        sorted = self.sort_by(result, 0)
        return sorted

    def parse_ohlcv(self, ohlcv, market=None):
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
