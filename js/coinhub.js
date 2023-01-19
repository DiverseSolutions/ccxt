'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, DDoSProtection } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coinhub extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinhub',
            'name': 'coinhub',
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
                        'ohlcv',
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
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetTickers (params);
        const markets = response['data'];
        const result = [];
        const keys = Object.keys (markets);
        for (let i = 0; i < keys.length; i++) {
            const market = markets[keys[i]];
            const id = this.safeString (market, 'market');
            let base = this.safeString (market, 'market').split ('/')[0].toUpperCase ();
            let quote = this.safeString (market, 'market').split ('/')[1].toUpperCase ();
            const baseId = base;
            const quoteId = quote;
            if (baseId in this.commonCurrencies) {
                base = this.commonCurrencies[baseId];
            }
            if (quoteId in this.commonCurrencies) {
                quote = this.commonCurrencies[quoteId];
            }
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
        const response = await this.publicGetTickers (params);
        // {
        //     "code": 200,
        //     "message": "success",
        //     "data": {
        //         "IHC/MNT": {
        //             "volume": 1595147755.9,
        //             "high": 3.23997,
        //             "deal": 5117109795.941351,
        //             "close": 3.224,
        //             "low": 3.13,
        //             "open": 3.16003,
        //             "change": 0.0202,
        //             "timestamp": 1641522240004,
        //             "market": "IHC/MNT"
        //         },
        // }
        return this.parseTickers (response['data'], symbols);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.safeInteger (ticker, 'timestamp');
        // {
        //     "data": {
        //         "IHC/MNT": {
        //             "volume": 1595147755.9,
        //             "high": 3.23997,
        //             "deal": 5117109795.941351,
        //             "close": 3.224,
        //             "low": 3.13,
        //             "open": 3.16003,
        //             "change": 0.0202,
        //             "timestamp": 1641522240004,
        //             "market": "IHC/MNT"
        //         }
        //     }
        // }
        const marketId = this.safeString (ticker, 'market');
        const symbol = this.safeSymbol (marketId, market);
        // if (marketId in this.markets_by_id) {
        //     market = this.markets_by_id[marketId];
        // } else {
        //     const baseId = this.safeString (ticker, 'base');
        //     const quoteId = this.safeString (ticker, 'quote');
        //     if ((baseId !== undefined) && (quoteId !== undefined)) {
        //         const base = this.safeCurrencyCode (baseId);
        //         const quote = this.safeCurrencyCode (quoteId);
        //         symbol = base + '/' + quote;
        //     }
        // }
        // if ((symbol === undefined) && (market !== undefined)) {
        //     symbol = market['symbol'];
        // }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeNumber (ticker, 'open'),
            'close': this.safeNumber (ticker, 'close'),
            'last': this.safeNumber (ticker, 'close'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeNumber (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchOHLCV (symbol, timeframe = '1d', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
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
        const response = await this.publicGetOhlcv (request);
        // {
        //     "code": 200,
        //     "message": null,
        //     "data": [
        //       [
        //         1663200000,
        //         "19.4994",
        //         "19.499",
        //         "19.677",
        //         "18.5",
        //         "408981.2652",
        //         "7732079.65670149",
        //         "CHB/MNT"
        //       ],
        // }
        return this.parseOHLCVs (response['data'], market, timeframe, since, limit);
    }

    parseOHLCVs (ohlcvs, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        //       [
        //         1663200000,
        //         "19.4994",
        //         "19.499",
        //         "19.677",
        //         "18.5",
        //         "408981.2652",
        //         "7732079.65670149",
        //         "CHB/MNT"
        //       ],
        const result = [];
        for (let i = 0; i < ohlcvs.length; i++) {
            result.push (this.parseOHLCV (ohlcvs[i], market));
        }
        const sorted = this.sortBy (result, 0);
        return sorted;
    }

    parseOHLCV (ohlcv, market = undefined) {
        const r = [];
        r.push (parseInt (ohlcv[0]) * 1000);
        r.push (parseFloat (ohlcv[1]));
        r.push (parseFloat (ohlcv[2]));
        r.push (parseFloat (ohlcv[3]));
        r.push (parseFloat (ohlcv[4]));
        r.push (parseFloat (ohlcv[5]));
        return r;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        url += '/' + path;
        if (Object.keys (params).length) {
            url += '?' + this.urlencode (params);
        }
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
