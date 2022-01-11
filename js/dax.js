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
                'logo': 'https://user-images.githubusercontent.com/1294454/67288762-2f04a600-f4e6-11e9-9fd6-c60641919491.jpg',
                'api': {
                    'public': 'https://pairstats.dax.mn',
                    'tv': 'https://pairstats.dax.mn/tv',
                },
                'www': 'https://dax.mn',
                'doc': 'https://dax.mn',
            },
            'api': {
                'public': {
                    'get': [
                        'pair-stats',
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
        const response = await this.publicGetPairStats (this.json (this.extend (request, params)));
        // [
        //     {
        //         "type": "Crypto",
        //         "last_price": 183.0000000000000000,
        //         "trading_pairs": "ARDXURG",
        //         "lowest_ask": 182.0000000000000000,
        //         "highest_bid": 170.0000000000000000,
        //         "price_change_percent_24h": 4.57142857,
        //         "baseSymbol": "ARDX",
        //         "highest_price_24h": 183.0000000000000000,
        //         "lowest_price_24h": 172.9900000000000000,
        //         "quoteSymbol": "URG",
        //         "base_volume": 18897.700000000000,
        //         "quote_volume": 3289530.999000000000,
        //         "updatedDate": "2022-01-11T21:12:14",
        //         "trades": 10
        //     }
        // ]
        // merge volume from ex_pair_stats_24h
        return this.parseTickers (response, symbols);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.safeTimestamp (ticker['updatedDate']);
        // {
        //     "type": "Crypto",
        //     "last_price": 183.0000000000000000,
        //     "trading_pairs": "ARDXURG",
        //     "lowest_ask": 182.0000000000000000,
        //     "highest_bid": 170.0000000000000000,
        //     "price_change_percent_24h": 4.57142857,
        //     "baseSymbol": "ARDX",
        //     "highest_price_24h": 183.0000000000000000,
        //     "lowest_price_24h": 172.9900000000000000,
        //     "quoteSymbol": "URG",
        //     "base_volume": 18897.700000000000,
        //     "quote_volume": 3289530.999000000000,
        //     "updatedDate": "2022-01-11T21:12:14",
        //     "trades": 10
        // }
        const marketId = this.safeString (ticker, 'trading_pairs');
        const symbol = this.safeSymbol (marketId, market);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': ticker['updatedDate'],
            'high': ticker['highest_price_24h'],
            'low': ticker['lowest_price_24h'],
            'bid': ticker['highest_bid'],
            'bidVolume': undefined,
            'ask': ticker['lowest_ask'],
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': ticker['last_price'],
            'last': ticker['last_price'],
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': ticker['base_volume'],
            'quoteVolume': ticker['quote_volume'],
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
