'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class trademn extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'trademn',
            'name': 'trademn',
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
        });
    }

    async fetchTickers (symbols = undefined, params = {}) {
        const response = await this.proxyGetTickers (params);
        // {
        //     "data": {
        //         "DOT/MNT": {
        //           "change": 0,
        //           "lastPrice": 19000,
        //           "volume": 0
        //         }
        //     },
        //     "timestamp": 1659353716
        // }
        const data = response['data'];
        const keys = Object.keys (data);
        for (let i = 0; i < keys.length; i++) {
            data[keys[i]]['symbol'] = keys[i];
        }
        return this.parseTickers (response['data'], symbols);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = undefined;
        // {
        //     "change": 0,
        //     "lastPrice": 19000,
        //     "volume": 0,
        //     "symbol": "ARDX/MNT",
        //     "timestamp": 1659353716
        // }
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = marketId;
        const price = this.safeNumber (ticker, 'lastPrice');
        const baseVol = this.safeNumber (ticker, 'volume');
        const quoteVol = price * baseVol;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
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
            'baseVolume': baseVol,
            'quoteVolume': quoteVol,
            'info': ticker,
        };
    }

    async fetchOHLCV (symbol, timeframe = '1d', since = undefined, limit = undefined, params = {}) {
        const request = {
            'symbol': symbol,
            'interval': this.timeframes[timeframe],
        };
        if (since === undefined) {
            request['start'] = parseInt (this.milliseconds() / 1000 - 48 * 60 * 60);
        } else {
            request['start'] = parseInt (since / 1000);
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
        //         "time": 1673951700000,
        //         "open": 0.167,
        //         "high": 0.167,
        //         "low": 0.167,
        //         "close": 0.167,
        //         "volume": 1000
        //     }
        // ]
        return this.parseOHLCVs (response, symbol, timeframe, since, limit);
    }

    parseOHLCVs (ohlcvs, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        const result = [];
        for (let i = 0; i < ohlcvs.length; i++) {
            result.push (this.parseOHLCV (ohlcvs[i], market));
        }
        const sorted = this.sortBy (result, 0);
        return sorted;
    }

    parseOHLCV (ohlcv, market = undefined) {
        const r = [];
        r.push (parseInt (ohlcv['time']));
        r.push (ohlcv['open']);
        r.push (ohlcv['high']);
        r.push (ohlcv['low']);
        r.push (ohlcv['close']);
        r.push (ohlcv['volume']);
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
