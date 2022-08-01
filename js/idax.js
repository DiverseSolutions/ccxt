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
                    ],
                },
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
