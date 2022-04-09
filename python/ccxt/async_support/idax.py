# -*- coding: utf-8 -*-

# PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
# https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

from ccxt.async_support.base.exchange import Exchange
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import DDoSProtection


class idax(Exchange):

    def describe(self):
        return self.deep_extend(super(idax, self).describe(), {
            'id': 'idax',
            'name': 'idax',
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
                   'proxy': 'https://exchange-proxy.krypto.mn/idax',
                },
                'www': 'https://idax.exchange',
                'doc': 'https://dax.exchange',
            },
            'api': {
                'proxy': {
                    'get': [
                        'tickers',
                        'markets',
                    ],
                },
            },
        })

    async def fetch_markets(self, params={}):
        response = await self.proxyGetMarkets(params)
        # {
        #     "code": "0",
        #     "msg": "success",
        #     "message": null,
        #     "data": {
        #         "market": {
        #             "market": {
        #                 "MONT": {
        #                     "ARDM/MONT": {
        #                         "limitVolumeMin": 0.0001000000000000,
        #                         "symbol": "ardmmont",
        #                         "showName": "ARDM/MONT",
        #                         "marketBuyMin": 1.00000000E-8,
        #                         "is_grid_open": 0,
        #                         "multiple": 0,
        #                         "fundRate": "0.1",
        #                         "marketSellMin": 0.0001000000000000,
        #                         "sort": 2,
        #                         "etfOpen": 0,
        #                         "newcoinFlag": 0,
        #                         "volume": 4,
        #                         "isOvercharge": 0,
        #                         "depth": "0.00000001,0.000001,0.0001",
        #                         "price": 8,
        #                         "name": "ARDM/MONT",
        #                         "limitPriceMin": 1.00000000E-8,
        #                         "is_open_lever": 0
        #                     },
        #                     "URGX/MONT": {
        #                         "limitVolumeMin": 0.0100000000000000,
        #                         "symbol": "urgxmont",
        #                         "showName": "URGX/MONT",
        #                         "marketBuyMin": 0.0001000000000000,
        #                         "is_grid_open": 0,
        #                         "multiple": 0,
        #                         "fundRate": "0.1",
        #                         "marketSellMin": 0.0100000000000000,
        #                         "sort": 3,
        #                         "etfOpen": 0,
        #                         "newcoinFlag": 0,
        #                         "volume": 2,
        #                         "isOvercharge": 0,
        #                         "depth": "0.0001,0.001,0.01",
        #                         "price": 4,
        #                         "name": "URGX/MONT",
        #                         "limitPriceMin": 0.0001000000000000,
        #                         "is_open_lever": 0
        #                     }
        #             },
        #             "klineScale": [
        #                 "1min",
        #                 "5min",
        #                 "15min",
        #                 "30min",
        #                 "60min",
        #                 "4h",
        #                 "1day",
        #                 "1week",
        #                 "1month"
        #             ],
        #             "marketSort": [
        #                 "MONT",
        #                 "USDT",
        #                 "BTC",
        #                 "ETH"
        #             ],
        #             "coinTagLangs": {},
        #             "home_symbol_show": {
        #                 "observed_symbol_list": null,
        #                 "recommend_symbol_list": [
        #                     "ARDX1557/MONT",
        #                     "ARDM/MONT",
        #                     "USDT/MONT",
        #                     "BTC/MONT",
        #                     "ARDM/ARDX1557",
        #                     "ARDX1557/USDT",
        #                     "BTC/USDT",
        #                     "ETH/USDT"
        #                 ]
        #             }
        #         },
        #         "localPublicInfoTimeFormat": "2022-04-05 11:15:20",
        #         "update_safe_withdraw": null,
        #         "localPublicInfoTime": 1649128520022
        #     }
        # }
        marketsRaw = response['data']['market']['market']
        result = []
        marketKeys = list(marketsRaw.keys())
        for i in range(0, len(marketKeys)):
            k = marketKeys[i]
            symbolKeys = list(marketsRaw[k].keys())
            for j in range(0, len(symbolKeys)):
                id = symbolKeys[j]
                pairs = id.split('/')
                base = pairs[0].upper()
                quote = pairs[1].upper()
                baseId = base.lower()
                quoteId = quote.lower()
                symbol = base + '/' + quote
                entry = {
                    'id': baseId + quoteId,
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
        response = await self.proxyGetTickers(params)
        # {
        #     "data": {
        #         "100tbtc": {
        #             "amount": 0,
        #             "close": 1.658e-05,
        #             "high": 1.658e-05,
        #             "low": 1.658e-05,
        #             "open": 1.658e-05,
        #             "rose": 0,
        #             "vol": 0
        #         },
        #     },
        #     "timestamp": 1649129268000
        # }
        tickers = []
        marketKeys = list(self.markets.keys())
        for i in range(0, len(marketKeys)):
            marketKey = marketKeys[i]
            market = self.markets[marketKey]
            if self.safe_value(response['data'], market['id']):
                ticker = response['data'][market['id']]
                ticker['id'] = market['id']
                ticker['symbol'] = market['symbol']
                ticker['timestamp'] = response['timestamp']
                tickers.append(ticker)
        return self.parse_tickers(tickers, symbols)

    def parse_ticker(self, ticker, market=None):
        timestamp = self.safe_timestamp(ticker, 'timestamp')
        # {
        #     amount: '461.5968008644',
        #     close: '0.000343',
        #     high: '0.00036',
        #     low: '0.000335',
        #     open: '0.000352',
        #     rose: '-0.02556818',
        #     vol: '1338905.4964',
        #     id: 'adaeth',
        #     symbol: 'ADA/ETH'
        # }
        symbol = ticker['symbol']
        baseVol = 0
        quoteVol = 0
        if ticker['vol'] and ticker['close']:
            baseVol = float(ticker['vol'])
            quoteVol = float(baseVol) * float(ticker['close'])
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': timestamp,
            'high': float(ticker['high']),
            'low': float(ticker['low']),
            'bid': None,
            'bidVolume': None,
            'ask': None,
            'askVolume': None,
            'vwap': None,
            'open': float(ticker['open']),
            'close': float(ticker['close']),
            'last': float(ticker['close']),
            'previousClose': None,
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': baseVol,
            'quoteVolume': quoteVol,
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
