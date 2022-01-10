# -*- coding: utf-8 -*-

# PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
# https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

from ccxt.async_support.base.exchange import Exchange
import hashlib
import math
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import InsufficientFunds
from ccxt.base.errors import InvalidOrder
from ccxt.base.precise import Precise


class btcturk(Exchange):

    def describe(self):
        return self.deep_extend(super(btcturk, self).describe(), {
            'id': 'btcturk',
            'name': 'BTCTurk',
            'countries': ['TR'],  # Turkey
            'rateLimit': 100,
            'has': {
                'cancelOrder': True,
                'CORS': True,
                'createOrder': True,
                'fetchBalance': True,
                'fetchMarkets': True,
                'fetchMyTrades': True,
                'fetchOHLCV': True,
                'fetchOpenOrders': True,
                'fetchOrderBook': True,
                'fetchOrders': True,
                'fetchTicker': True,
                'fetchTickers': True,
                'fetchTrades': True,
            },
            'timeframes': {
                '1d': '1d',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87153926-efbef500-c2c0-11ea-9842-05b63612c4b9.jpg',
                'api': {
                    'public': 'https://api.btcturk.com/api/v2',
                    'private': 'https://api.btcturk.com/api/v1',
                    'graph': 'https://graph-api.btcturk.com/v1',
                },
                'www': 'https://www.btcturk.com',
                'doc': 'https://github.com/BTCTrader/broker-api-docs',
            },
            'api': {
                'public': {
                    'get': {
                        'orderbook': 1,
                        'ticker': 0.1,
                        'trades': 1,   # ?last=COUNT(max 50)
                        'server/exchangeinfo': 1,
                    },
                },
                'private': {
                    'get': {
                        'users/balances': 1,
                        'openOrders': 1,
                        'allOrders': 1,
                        'users/transactions/trade': 1,
                    },
                    'post': {
                        'order': 1,
                        'cancelOrder': 1,
                    },
                    'delete': {
                        'order': 1,
                    },
                },
                'graph': {
                    'get': {
                        'ohlcs': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'maker': self.parse_number('0.0005'),
                    'taker': self.parse_number('0.0009'),
                },
            },
            'exceptions': {
                'exact': {
                    'FAILED_ORDER_WITH_OPEN_ORDERS': InsufficientFunds,
                    'FAILED_LIMIT_ORDER': InvalidOrder,
                    'FAILED_MARKET_ORDER': InvalidOrder,
                },
            },
        })

    async def fetch_markets(self, params={}):
        response = await self.publicGetServerExchangeinfo(params)
        #
        #     {
        #       "data": {
        #         "timeZone": "UTC",
        #         "serverTime": "1618826678404",
        #         "symbols": [
        #           {
        #             "id": "1",
        #             "name": "BTCTRY",
        #             "nameNormalized": "BTC_TRY",
        #             "status": "TRADING",
        #             "numerator": "BTC",
        #             "denominator": "TRY",
        #             "numeratorScale": "8",
        #             "denominatorScale": "2",
        #             "hasFraction": False,
        #             "filters": [
        #               {
        #                 "filterType": "PRICE_FILTER",
        #                 "minPrice": "0.0000000000001",
        #                 "maxPrice": "10000000",
        #                 "tickSize": "10",
        #                 "minExchangeValue": "99.91",
        #                 "minAmount": null,
        #                 "maxAmount": null
        #               }
        #             ],
        #             "orderMethods": [
        #               "MARKET",
        #               "LIMIT",
        #               "STOP_MARKET",
        #               "STOP_LIMIT"
        #             ],
        #             "displayFormat": "#,###",
        #             "commissionFromNumerator": False,
        #             "order": "1000",
        #             "priceRounding": False
        #           },
        #         },
        #       ],
        #     }
        #
        data = self.safe_value(response, 'data')
        markets = self.safe_value(data, 'symbols', [])
        result = []
        for i in range(0, len(markets)):
            entry = markets[i]
            id = self.safe_string(entry, 'name')
            baseId = self.safe_string(entry, 'numerator')
            quoteId = self.safe_string(entry, 'denominator')
            base = self.safe_currency_code(baseId)
            quote = self.safe_currency_code(quoteId)
            symbol = base + '/' + quote
            filters = self.safe_value(entry, 'filters')
            minPrice = None
            maxPrice = None
            minAmount = None
            maxAmount = None
            minCost = None
            for j in range(0, len(filters)):
                filter = filters[j]
                filterType = self.safe_string(filter, 'filterType')
                if filterType == 'PRICE_FILTER':
                    minPrice = self.safe_number(filter, 'minPrice')
                    maxPrice = self.safe_number(filter, 'maxPrice')
                    minAmount = self.safe_number(filter, 'minAmount')
                    maxAmount = self.safe_number(filter, 'maxAmount')
                    minCost = self.safe_number(filter, 'minExchangeValue')
            status = self.safe_string(entry, 'status')
            active = status == 'TRADING'
            limits = {
                'price': {
                    'min': minPrice,
                    'max': maxPrice,
                },
                'amount': {
                    'min': minAmount,
                    'max': maxAmount,
                },
                'cost': {
                    'min': minCost,
                    'max': None,
                },
            }
            precision = {
                'price': self.safe_integer(entry, 'denominatorScale'),
                'amount': self.safe_integer(entry, 'numeratorScale'),
            }
            result.append({
                'info': entry,
                'symbol': symbol,
                'id': id,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'limits': limits,
                'precision': precision,
                'type': 'spot',
                'spot': True,
                'active': active,
            })
        return result

    def parse_balance(self, response):
        data = self.safe_value(response, 'data', [])
        result = {
            'info': response,
            'timestamp': None,
            'datetime': None,
        }
        for i in range(0, len(data)):
            entry = data[i]
            currencyId = self.safe_string(entry, 'asset')
            code = self.safe_currency_code(currencyId)
            account = self.account()
            account['total'] = self.safe_string(entry, 'balance')
            account['free'] = self.safe_string(entry, 'free')
            account['used'] = self.safe_string(entry, 'locked')
            result[code] = account
        return self.safe_balance(result)

    async def fetch_balance(self, params={}):
        await self.load_markets()
        response = await self.privateGetUsersBalances(params)
        #
        #     {
        #       "data": [
        #         {
        #           "asset": "TRY",
        #           "assetname": "Türk Lirası",
        #           "balance": "0",
        #           "locked": "0",
        #           "free": "0",
        #           "orderFund": "0",
        #           "requestFund": "0",
        #           "precision": 2
        #         }
        #       ]
        #     }
        #
        return self.parse_balance(response)

    async def fetch_order_book(self, symbol, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        request = {
            'pairSymbol': market['id'],
        }
        response = await self.publicGetOrderbook(self.extend(request, params))
        #     {
        #       "data": {
        #         "timestamp": 1618827901241,
        #         "bids": [
        #           [
        #             "460263.00",
        #             "0.04244000"
        #           ]
        #         ]
        #       }
        #     }
        data = self.safe_value(response, 'data')
        timestamp = self.safe_integer(data, 'timestamp')
        return self.parse_order_book(data, symbol, timestamp, 'bids', 'asks', 0, 1)

    def parse_ticker(self, ticker, market=None):
        #
        #   {
        #     "pair": "BTCTRY",
        #     "pairNormalized": "BTC_TRY",
        #     "timestamp": 1618826361234,
        #     "last": 462485,
        #     "high": 473976,
        #     "low": 444201,
        #     "bid": 461928,
        #     "ask": 462485,
        #     "open": 456915,
        #     "volume": 917.41368645,
        #     "average": 462868.29574589,
        #     "daily": 5570,
        #     "dailyPercent": 1.22,
        #     "denominatorSymbol": "TRY",
        #     "numeratorSymbol": "BTC",
        #     "order": 1000
        #   }
        #
        marketId = self.safe_string(ticker, 'pair')
        symbol = self.safe_symbol(marketId, market)
        timestamp = self.safe_integer(ticker, 'timestamp')
        last = self.safe_number(ticker, 'last')
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': self.safe_number(ticker, 'high'),
            'low': self.safe_number(ticker, 'low'),
            'bid': self.safe_number(ticker, 'bid'),
            'bidVolume': None,
            'ask': self.safe_number(ticker, 'ask'),
            'askVolume': None,
            'vwap': None,
            'open': self.safe_number(ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': None,
            'change': self.safe_number(ticker, 'daily'),
            'percentage': self.safe_number(ticker, 'dailyPercent'),
            'average': self.safe_number(ticker, 'average'),
            'baseVolume': self.safe_number(ticker, 'volume'),
            'quoteVolume': None,
            'info': ticker,
        }

    async def fetch_tickers(self, symbols=None, params={}):
        await self.load_markets()
        response = await self.publicGetTicker(params)
        tickers = self.safe_value(response, 'data')
        return self.parse_tickers(tickers, symbols)

    async def fetch_ticker(self, symbol, params={}):
        await self.load_markets()
        tickers = await self.fetch_tickers([symbol], params)
        return self.safe_value(tickers, symbol)

    def parse_trade(self, trade, market=None):
        #
        # fetchTrades
        #     {
        #       "pair": "BTCUSDT",
        #       "pairNormalized": "BTC_USDT",
        #       "numerator": "BTC",
        #       "denominator": "USDT",
        #       "date": "1618916879083",
        #       "tid": "637545136790672520",
        #       "price": "55774",
        #       "amount": "0.27917100",
        #       "side": "buy"
        #     }
        #
        # fetchMyTrades
        #     {
        #       "price": "56000",
        #       "numeratorSymbol": "BTC",
        #       "denominatorSymbol": "USDT",
        #       "orderType": "buy",
        #       "orderId": "2606935102",
        #       "id": "320874372",
        #       "timestamp": "1618916479593",
        #       "amount": "0.00020000",
        #       "fee": "0",
        #       "tax": "0"
        #     }
        #
        timestamp = self.safe_integer_2(trade, 'date', 'timestamp')
        id = self.safe_string_2(trade, 'tid', 'id')
        order = self.safe_string(trade, 'orderId')
        priceString = self.safe_string(trade, 'price')
        amountString = Precise.string_abs(self.safe_string(trade, 'amount'))
        marketId = self.safe_string(trade, 'pair')
        symbol = self.safe_symbol(marketId, market)
        side = self.safe_string_2(trade, 'side', 'orderType')
        fee = None
        feeAmountString = self.safe_string(trade, 'fee')
        if feeAmountString is not None:
            feeCurrency = self.safe_string(trade, 'denominatorSymbol')
            fee = {
                'cost': Precise.string_abs(feeAmountString),
                'currency': self.safe_currency_code(feeCurrency),
            }
        return self.safe_trade({
            'info': trade,
            'id': id,
            'order': order,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': symbol,
            'type': None,
            'side': side,
            'takerOrMaker': None,
            'price': priceString,
            'amount': amountString,
            'cost': None,
            'fee': fee,
        }, market)

    async def fetch_trades(self, symbol, since=None, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        # maxCount = 50
        request = {
            'pairSymbol': market['id'],
        }
        if limit is not None:
            request['last'] = limit
        response = await self.publicGetTrades(self.extend(request, params))
        #
        #     {
        #       "data": [
        #         {
        #           "pair": "BTCTRY",
        #           "pairNormalized": "BTC_TRY",
        #           "numerator": "BTC",
        #           "denominator": "TRY",
        #           "date": 1618828421497,
        #           "tid": "637544252214980918",
        #           "price": "462585.00",
        #           "amount": "0.01618411",
        #           "side": "sell"
        #         }
        #       ]
        #     }
        #
        data = self.safe_value(response, 'data')
        return self.parse_trades(data, market, since, limit)

    def parse_ohlcv(self, ohlcv, market=None):
        #     {
        #        "pair": "BTCTRY",
        #        "time": 1508284800,
        #        "open": 20873.689453125,
        #        "high": 20925.0,
        #        "low": 19310.0,
        #        "close": 20679.55078125,
        #        "volume": 402.216101626982,
        #        "total": 8103096.44443274,
        #        "average": 20146.13,
        #        "dailyChangeAmount": -194.14,
        #        "dailyChangePercentage": -0.93
        #      },
        return [
            self.safe_timestamp(ohlcv, 'time'),
            self.safe_number(ohlcv, 'open'),
            self.safe_number(ohlcv, 'high'),
            self.safe_number(ohlcv, 'low'),
            self.safe_number(ohlcv, 'close'),
            self.safe_number(ohlcv, 'volume'),
        ]

    async def fetch_ohlcv(self, symbol, timeframe='1d', since=None, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        request = {
            'pair': market['id'],
        }
        if limit is not None:
            request['last'] = limit
        response = await self.graphGetOhlcs(self.extend(request, params))
        return self.parse_ohlcvs(response, market, timeframe, since, limit)

    async def create_order(self, symbol, type, side, amount, price=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        request = {
            'orderType': side,
            'orderMethod': type,
            'pairSymbol': market['id'],
            'quantity': self.amount_to_precision(symbol, amount),
        }
        if type != 'market':
            request['price'] = self.price_to_precision(symbol, price)
        if 'clientOrderId' in params:
            request['newClientOrderId'] = params['clientOrderId']
        elif not ('newClientOrderId' in params):
            request['newClientOrderId'] = self.uuid()
        response = await self.privatePostOrder(self.extend(request, params))
        data = self.safe_value(response, 'data')
        return self.parse_order(data, market)

    async def cancel_order(self, id, symbol=None, params={}):
        request = {
            'id': id,
        }
        return await self.privateDeleteOrder(self.extend(request, params))

    async def fetch_open_orders(self, symbol=None, since=None, limit=None, params={}):
        await self.load_markets()
        request = {}
        market = None
        if symbol is not None:
            market = self.market(symbol)
            request['pairSymbol'] = market['id']
        response = await self.privateGetOpenOrders(self.extend(request, params))
        data = self.safe_value(response, 'data')
        bids = self.safe_value(data, 'bids', [])
        asks = self.safe_value(data, 'asks', [])
        return self.parse_orders(self.array_concat(bids, asks), market, since, limit)

    async def fetch_orders(self, symbol=None, since=None, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        request = {
            'pairSymbol': market['id'],
        }
        if limit is not None:
            # default 100 max 1000
            request['last'] = limit
        if since is not None:
            request['startTime'] = int(math.floor(since / 1000))
        response = await self.privateGetAllOrders(self.extend(request, params))
        # {
        #   "data": [
        #     {
        #       "id": "2606012912",
        #       "price": "55000",
        #       "amount": "0.0003",
        #       "quantity": "0.0003",
        #       "stopPrice": "0",
        #       "pairSymbol": "BTCUSDT",
        #       "pairSymbolNormalized": "BTC_USDT",
        #       "type": "buy",
        #       "method": "limit",
        #       "orderClientId": "2ed187bd-59a8-4875-a212-1b793963b85c",
        #       "time": "1618913189253",
        #       "updateTime": "1618913189253",
        #       "status": "Untouched",
        #       "leftAmount": "0.0003000000000000"
        #     }
        #   ]
        # }
        data = self.safe_value(response, 'data')
        return self.parse_orders(data, market, since, limit)

    def parse_order_status(self, status):
        statuses = {
            'Untouched': 'open',
            'Partial': 'open',
            'Canceled': 'canceled',
            'Closed': 'closed',
        }
        return self.safe_string(statuses, status, status)

    def parse_order(self, order, market):
        #
        # fetchOrders / fetchOpenOrders
        #     {
        #       "id": 2605984008,
        #       "price": "55000",
        #       "amount": "0.00050000",
        #       "quantity": "0.00050000",
        #       "stopPrice": "0",
        #       "pairSymbol": "BTCUSDT",
        #       "pairSymbolNormalized": "BTC_USDT",
        #       "type": "buy",
        #       "method": "limit",
        #       "orderClientId": "f479bdb6-0965-4f03-95b5-daeb7aa5a3a5",
        #       "time": 0,
        #       "updateTime": 1618913083543,
        #       "status": "Untouched",
        #       "leftAmount": "0.00050000"
        #     }
        #
        # createOrder
        #     {
        #       "id": "2606935102",
        #       "quantity": "0.0002",
        #       "price": "56000",
        #       "stopPrice": null,
        #       "newOrderClientId": "98e5c491-7ed9-462b-9666-93553180fb28",
        #       "type": "buy",
        #       "method": "limit",
        #       "pairSymbol": "BTCUSDT",
        #       "pairSymbolNormalized": "BTC_USDT",
        #       "datetime": "1618916479523"
        #     }
        #
        id = self.safe_string(order, 'id')
        price = self.safe_string(order, 'price')
        amountString = self.safe_string_2(order, 'amount', 'quantity')
        amount = Precise.string_abs(amountString)
        remaining = self.safe_string(order, 'leftAmount')
        marketId = self.safe_number(order, 'pairSymbol')
        symbol = self.safe_symbol(marketId, market)
        side = self.safe_string(order, 'type')
        type = self.safe_string(order, 'method')
        clientOrderId = self.safe_string(order, 'orderClientId')
        timestamp = self.safe_integer_2(order, 'updateTime', 'datetime')
        rawStatus = self.safe_string(order, 'status')
        status = self.parse_order_status(rawStatus)
        return self.safe_order({
            'info': order,
            'id': id,
            'price': price,
            'amount': amount,
            'remaining': remaining,
            'filled': None,
            'cost': None,
            'average': None,
            'status': status,
            'side': side,
            'type': type,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': symbol,
            'fee': None,
        }, market)

    async def fetch_my_trades(self, symbol=None, since=None, limit=None, params={}):
        await self.load_markets()
        market = None
        if symbol is not None:
            market = self.market(symbol)
        response = await self.privateGetUsersTransactionsTrade()
        #
        #     {
        #       "data": [
        #         {
        #           "price": "56000",
        #           "numeratorSymbol": "BTC",
        #           "denominatorSymbol": "USDT",
        #           "orderType": "buy",
        #           "orderId": "2606935102",
        #           "id": "320874372",
        #           "timestamp": "1618916479593",
        #           "amount": "0.00020000",
        #           "fee": "0",
        #           "tax": "0"
        #         }
        #       ],
        #       "success": True,
        #       "message": "SUCCESS",
        #       "code": "0"
        #     }
        #
        data = self.safe_value(response, 'data')
        return self.parse_trades(data, market, since, limit)

    def nonce(self):
        return self.milliseconds()

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        if self.id == 'btctrader':
            raise ExchangeError(self.id + ' is an abstract base API for BTCExchange, BTCTurk')
        url = self.urls['api'][api] + '/' + path
        if (method == 'GET') or (method == 'DELETE'):
            if params:
                url += '?' + self.urlencode(params)
        else:
            body = self.json(params)
        if api == 'private':
            self.check_required_credentials()
            nonce = str(self.nonce())
            secret = self.base64_to_binary(self.secret)
            auth = self.apiKey + nonce
            headers = {
                'X-PCK': self.apiKey,
                'X-Stamp': nonce,
                'X-Signature': self.hmac(self.encode(auth), secret, hashlib.sha256, 'base64'),
                'Content-Type': 'application/json',
            }
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    def handle_errors(self, code, reason, url, method, headers, body, response, requestHeaders, requestBody):
        errorCode = self.safe_string(response, 'code', '0')
        message = self.safe_string(response, 'message')
        output = body if (message is None) else message
        self.throw_exactly_matched_exception(self.exceptions['exact'], message, self.id + ' ' + output)
        if errorCode != '0':
            raise ExchangeError(self.id + ' ' + output)