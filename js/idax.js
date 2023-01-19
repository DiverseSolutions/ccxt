'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, DDoSProtection } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class idax extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'idax',
            'name': 'idax',
            'countries': ['MN'],
            'rateLimit': 500,
            'requiresWeb3': false,
            'certified': false,
            // new metainfo interface
            'has': {
                'cancelOrder': false,
                'CORS': undefined,
                'createOrder': false,
                'fetchBalance': false,
                'fetchBidsAsks': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchTicker': false,
                'fetchTickers': true,
                'fetchTrades': false,
                'fetchWithdrawals': false,
                'withdraw': undefined,
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
                        'ohlcv',
                    ],
                },
            },
            'timeframes': {
                '1m': '1min',
                '3m': undefined,
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '60min',
                '2h': undefined,
                '4h': '4h',
                '6h': undefined,
                '8h': undefined,
                '12h': undefined,
                '1d': '1day',
                '3d': undefined,
                '1w': '1week',
                '1M': '1month',
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.proxyGetMarkets (params);
        // {
        //     "code": "0",
        //     "msg": "success",
        //     "message": null,
        //     "data": {
        //         "market": {
        //             "market": {
        //                 "MONT": {
        //                     "ARDM/MONT": {
        //                         "limitVolumeMin": 0.0001000000000000,
        //                         "symbol": "ardmmont",
        //                         "showName": "ARDM/MONT",
        //                         "marketBuyMin": 1.00000000E-8,
        //                         "is_grid_open": 0,
        //                         "multiple": 0,
        //                         "fundRate": "0.1",
        //                         "marketSellMin": 0.0001000000000000,
        //                         "sort": 2,
        //                         "etfOpen": 0,
        //                         "newcoinFlag": 0,
        //                         "volume": 4,
        //                         "isOvercharge": 0,
        //                         "depth": "0.00000001,0.000001,0.0001",
        //                         "price": 8,
        //                         "name": "ARDM/MONT",
        //                         "limitPriceMin": 1.00000000E-8,
        //                         "is_open_lever": 0
        //                     },
        //                     "URGX/MONT": {
        //                         "limitVolumeMin": 0.0100000000000000,
        //                         "symbol": "urgxmont",
        //                         "showName": "URGX/MONT",
        //                         "marketBuyMin": 0.0001000000000000,
        //                         "is_grid_open": 0,
        //                         "multiple": 0,
        //                         "fundRate": "0.1",
        //                         "marketSellMin": 0.0100000000000000,
        //                         "sort": 3,
        //                         "etfOpen": 0,
        //                         "newcoinFlag": 0,
        //                         "volume": 2,
        //                         "isOvercharge": 0,
        //                         "depth": "0.0001,0.001,0.01",
        //                         "price": 4,
        //                         "name": "URGX/MONT",
        //                         "limitPriceMin": 0.0001000000000000,
        //                         "is_open_lever": 0
        //                     }
        //             },
        //             "klineScale": [
        //                 "1min",
        //                 "5min",
        //                 "15min",
        //                 "30min",
        //                 "60min",
        //                 "4h",
        //                 "1day",
        //                 "1week",
        //                 "1month"
        //             ],
        //             "marketSort": [
        //                 "MONT",
        //                 "USDT",
        //                 "BTC",
        //                 "ETH"
        //             ],
        //             "coinTagLangs": {},
        //             "home_symbol_show": {
        //                 "observed_symbol_list": null,
        //                 "recommend_symbol_list": [
        //                     "ARDX1557/MONT",
        //                     "ARDM/MONT",
        //                     "USDT/MONT",
        //                     "BTC/MONT",
        //                     "ARDM/ARDX1557",
        //                     "ARDX1557/USDT",
        //                     "BTC/USDT",
        //                     "ETH/USDT"
        //                 ]
        //             }
        //         },
        //         "localPublicInfoTimeFormat": "2022-04-05 11:15:20",
        //         "update_safe_withdraw": null,
        //         "localPublicInfoTime": 1649128520022
        //     }
        // }
        const marketsRaw = response['data']['market']['market'];
        const result = [];
        const marketKeys = Object.keys (marketsRaw);
        for (let i = 0; i < marketKeys.length; i++) {
            const k = marketKeys[i];
            const symbolKeys = Object.keys (marketsRaw[k]);
            for (let j = 0; j < symbolKeys.length; j++) {
                const id = symbolKeys[j];
                const pairs = id.split ('/');
                const base = pairs[0].toUpperCase ();
                const quote = pairs[1].toUpperCase ();
                const baseId = base.toLowerCase ();
                const quoteId = quote.toLowerCase ();
                const symbol = base + '/' + quote;
                const entry = {
                    'id': baseId + quoteId,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'active': true,
                    'taker': undefined,
                    'maker': undefined,
                    'type': 'spot',
                    'linear': false,
                    'inverse': false,
                    'contractSize': 1,
                    'spot': true,
                    'margin': false,
                    'future': false,
                    'swap': false,
                    'option': false,
                    'contract': false,
                    'settleId': undefined,
                    'settle': undefined,
                    'expiry': undefined,
                    'expiryDatetime': undefined,
                    'percentage': false,
                    'tierBased': false,
                    'feeSide': 'get',
                    'precision': {
                        'price': undefined,
                        'amount': undefined,
                        'cost': undefined,
                    },
                    'limits': {
                        'amount': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'price': undefined,
                        'cost': undefined,
                    },
                    'info': undefined,
                };
                result.push (entry);
            }
        }
        return result;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.load_markets ();
        const response = await this.proxyGetTickers (params);
        // {
        //     "data": {
        //         "100tbtc": {
        //             "amount": 0,
        //             "close": 1.658e-05,
        //             "high": 1.658e-05,
        //             "low": 1.658e-05,
        //             "open": 1.658e-05,
        //             "rose": 0,
        //             "vol": 0
        //         },
        //     },
        //     "timestamp": 1649129268000
        // }
        const tickers = [];
        const marketKeys = Object.keys (this.markets);
        for (let i = 0; i < marketKeys.length; i++) {
            const marketKey = marketKeys[i];
            const market = this.markets[marketKey];
            if (this.safeValue (response['data'], market['id'])) {
                const ticker = response['data'][market['id']];
                ticker['id'] = market['id'];
                ticker['symbol'] = market['symbol'];
                ticker['timestamp'] = response['timestamp'];
                tickers.push (ticker);
            }
        }
        return this.parseTickers (tickers, symbols);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.safeTimestamp (ticker, 'timestamp');
        // {
        //     amount: '461.5968008644',
        //     close: '0.000343',
        //     high: '0.00036',
        //     low: '0.000335',
        //     open: '0.000352',
        //     rose: '-0.02556818',
        //     vol: '1338905.4964',
        //     id: 'adaeth',
        //     symbol: 'ADA/ETH'
        // }
        const symbol = ticker['symbol'];
        let baseVol = 0;
        let quoteVol = 0;
        if (ticker['vol'] && ticker['close']) {
            baseVol = parseFloat (ticker['vol']);
            quoteVol = parseFloat (baseVol) * parseFloat (ticker['close']);
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': timestamp,
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': parseFloat (ticker['open']),
            'close': parseFloat (ticker['close']),
            'last': parseFloat (ticker['close']),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVol,
            'quoteVolume': quoteVol,
            'info': ticker,
        };
    }

    async fetchOHLCV (symbol, timeframe = '1d', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'interval': this.timeframes[timeframe],
        };
        if (since === undefined) {
            request['start'] = parseInt (this.milliseconds() / 1000 - 48 * 60 * 60);
        } else {
            request['start'] = since;
        }
        if (limit === undefined) {
            request['end'] = parseInt (this.milliseconds() / 1000);
        } else {
            const duration = this.parseTimeframe (timeframe);
            request['end'] = parseInt (this.sum(request['start'], limit * duration));
        }
        const response = await this.proxyGetOhlcv (request);
        // [
        //     {
        //         "amount": 109411355.9396824,
        //         "close": 19269.45,
        //         "ds": "2022-10-10 00:00:00",
        //         "high": 19552.87,
        //         "id": 1665331200,
        //         "low": 19130.39,
        //         "open": 19534.96,
        //         "tradeId": 0,
        //         "vol": 5645.98794634
        //     }
        // ]
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOHLCVs (ohlcvs, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        const result = [];
        if (!ohlcvs.length) {
            return [];
        }
        for (let i = 0; i < ohlcvs.length; i++) {
            result.push (this.parseOHLCV (ohlcvs[i], market));
        }
        const sorted = this.sortBy (result, 0);
        return sorted;
    }

    parseOHLCV (ohlcv, market = undefined) {
        const r = [];
        r.push (parseInt (ohlcv['id']));
        r.push (ohlcv['open']);
        r.push (ohlcv['high']);
        r.push (ohlcv['low']);
        r.push (ohlcv['close']);
        r.push (ohlcv['vol']);
        return r;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        url += '/' + path;
        if (method === 'GET' && Object.keys (params).length) {
            url += '?' + this.urlencode (params);
        }
        if (method === 'GET') {
            return {
                'url': url,
                'method': method,
                'headers': headers,
                'params': {},
                'body': body,
            };
        }
        body = params;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (code === 503) {
            throw new DDoSProtection (this.id + ' ' + code.toString () + ' ' + reason + ' ' + body);
        }
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if ('code' in response) {
            const status = this.safeString (response, 'code');
            if (status === '1') {
                const message = this.safeString (response, 'msg');
                const feedback = this.id + ' ' + body;
                this.throwExactlyMatchedException (this.exceptions, message, feedback);
                throw new ExchangeError (feedback);
            }
        }
    }
};
