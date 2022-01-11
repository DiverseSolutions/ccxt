'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, DDoSProtection } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class dax extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'dax',
            'name': 'dax',
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
                'fetchMarkets': false,
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
                'test': {
                    'public': 'https://api.dax.mn/v1',
                    'tv': 'https://pairstats.dax.mn/tv',
                },
                'logo': 'https://user-images.githubusercontent.com/1294454/67288762-2f04a600-f4e6-11e9-9fd6-c60641919491.jpg',
                'api': {
                    'public': 'https://api.dax.mn/v1',
                    'tv': 'https://pairstats.dax.mn/tv',
                },
                'www': 'https://dax.mn',
                'doc': 'https://dax.mn',
            },
            'api': {
                'public': {
                    'post': [
                        'graphql',
                    ],
                },
                'tv': {
                    'get': [
                        'symbols',
                    ],
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.tvGetSymbols (params);
        const markets = response;
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const base = this.safeString (market, 'base-currency').toUpperCase ();
            const quote = this.safeString (market, 'quote-currency').toUpperCase ();
            const baseId = base;
            const quoteId = quote;
            const symbol = base + '/' + quote;
            const entry = {
                'id': id,
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
        return result;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'operationName': 'Pairs',
            'variables': {
                'sysPairWhere': {
                    'is_active': {
                        '_eq': true,
                    },
                },
            },
            'query': 'query Pairs($sysPairWhere: sys_pair_bool_exp) {\n  sys_pair(where: $sysPairWhere) {\n    id\n    baseAsset {\n      code\n      name\n      scale\n      total_market_cap\n      __typename\n    }\n    price {\n      last_price\n      __typename\n    }\n    quoteAsset {\n      code\n      name\n      scale\n      __typename\n    }\n    symbol\n    is_active\n    stats24 {\n      change24h\n      __typename\n    }\n    base_tick_size\n    quote_tick_size\n    __typename\n  }\n  ex_pair_stats_24h {\n    b24h_price\n    change24h\n    symbol\n    pair_id\n    last_price\n    updated_dt\n    vol\n    __typename\n  }\n}\n',
        };
        const response = await this.publicPostGraphql (this.json (this.extend (request, params)));
        // {
        //     "data": {
        //         "sys_pair": [
        //             {
        //                 "id": 23,
        //                 "baseAsset": {
        //                     "code": "MONT",
        //                     "name": "MONT",
        //                     "scale": 18,
        //                     "total_market_cap": null,
        //                     "__typename": "sys_asset"
        //                 },
        //                 "price": {
        //                     "last_price": 99,
        //                     "__typename": "ex_pair_price"
        //                 },
        //                 "quoteAsset": {
        //                     "code": "MNT",
        //                     "name": "Төгрөг",
        //                     "scale": 2,
        //                     "__typename": "sys_asset"
        //                 },
        //                 "symbol": "MONTMNT",
        //                 "is_active": true,
        //                 "stats24": {
        //                     "change24h": 0.00000000,
        //                     "__typename": "ex_pair_stats_24h"
        //                 },
        //                 "base_tick_size": 1000000000000000000,
        //                 "quote_tick_size": 1,
        //                 "__typename": "sys_pair"
        //             },
        //         ],
        //         "ex_pair_stats_24h": [
        //             {
        //                 "b24h_price": null,
        //                 "change24h": 0.00000000,
        //                 "symbol": "14MNT",
        //                 "pair_id": 9,
        //                 "last_price": null,
        //                 "updated_dt": "2021-01-29T01:20:20",
        //                 "vol": null,
        //                 "__typename": "ex_pair_stats_24h"
        //             },
        //         ]
        //     }
        // }
        // merge volume from ex_pair_stats_24h
        for (let i = 0; i < response['data']['sys_pair'].length; i++) {
            const pair = response['data']['sys_pair'][i];
            pair['vol'] = 0;
            for (let j = 0; j < response['data']['ex_pair_stats_24h'].length; j++) {
                const pairStats = response['data']['ex_pair_stats_24h'][j];
                if (pair['symbol'] === pairStats['symbol'] && pairStats['vol']) {
                    pair['vol'] = pairStats['vol'];
                }
            }
        }
        return this.parseTickers (response['data']['sys_pair'], symbols);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = undefined;
        // {
        //     id: '24',
        //     baseAsset: {
        //       code: 'URG',
        //       name: 'URG',
        //       scale: '18',
        //       total_market_cap: null,
        //       __typename: 'sys_asset'
        //     },
        //     price: { last_price: '540000000000000000', __typename: 'ex_pair_price' },
        //     quoteAsset: { code: 'MONT', name: 'MONT', scale: '18', __typename: 'sys_asset' },
        //     symbol: 'URGMONT',
        //     is_active: true,
        //     stats24: { change24h: '20.00000000', __typename: 'ex_pair_stats_24h' },
        //     base_tick_size: '10000000000000000',
        //     quote_tick_size: '10000000000000000',
        //     __typename: 'sys_pair'
        // }
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const baseScale = this.safeNumber (ticker['baseAsset'], 'scale');
        const quoteScale = this.safeNumber (ticker['quoteAsset'], 'scale');
        const price = this.safeNumber (ticker['price'], 'last_price') / Math.pow (10, quoteScale);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': undefined,
            'high': undefined,
            'low': undefined,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': price,
            'last': price,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeNumber (ticker, 'vol') / Math.pow (10, baseScale),
            'quoteVolume': undefined,
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
