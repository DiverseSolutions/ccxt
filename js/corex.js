'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, DDoSProtection } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class corex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'corex',
            'name': 'corex',
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
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '4h': '240',
                '6h': '360',
                '12h': '720',
                '1d': '1440',
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets (params);
        // [
        //     {
        //         "id": "crxmnt",
        //         "name": "CRX/MNT",
        //         "base_unit": "crx",
        //         "quote_unit": "mnt",
        //         "min_price": "10.0",
        //         "max_price": "500.0",
        //         "min_amount": "3000.0",
        //         "amount_precision": 1,
        //         "price_precision": 2,
        //         "state": "enabled"
        //     }
        // ]
        const markets = response;
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'id');
            const baseId = this.safeString (market, 'base_unit');
            const quoteId = this.safeString (market, 'quote_unit');
            const base = baseId.toUpperCase ();
            const quote = quoteId.toUpperCase ();
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
        const response = await this.marketGetTickers (params);
        // {
        //     "crxmnt": {
        //         "at": "1641916282",
        //         "ticker": {
        //             "low": "13.13",
        //             "high": "13.3",
        //             "open": "13.23",
        //             "last": "13.2",
        //             "volume": "43054233.526",
        //             "amount": "3263026.8",
        //             "avg_price": "13.1945693875392",
        //             "price_change_percent": "-0.23%",
        //             "vol": "43054233.526"
        //         }
        //     }
        // }
        const keys = Object.keys (response);
        for (let i = 0; i < keys.length; i++) {
            response[keys[i]]['id'] = keys[i];
        }
        return this.parseTickers (response, symbols);
    }

    parseTicker (tickerData, market_ = undefined) {
        const market = this.market (tickerData['id']);
        const timestamp = this.safeTimestamp (tickerData, 'at');
        const ticker = tickerData['ticker'];
        // {
        //     "at": "1641916282",
        //     "ticker": {
        //         "low": "13.13",
        //         "high": "13.3",
        //         "open": "13.23",
        //         "last": "13.2",
        //         "volume": "43054233.526",
        //         "amount": "3263026.8",
        //         "avg_price": "13.1945693875392",
        //         "price_change_percent": "-0.23%",
        //         "vol": "43054233.526"
        //     }
        // }
        const marketId = this.safeString (ticker, 'trading_pairs');
        const symbol = this.safeSymbol (marketId, market);
        const baseVolume = parseFloat (ticker['last']) && parseFloat (ticker['vol']) ? parseFloat (ticker['vol']) / parseFloat (ticker['last']) : 0;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': ticker['high'],
            'low': ticker['low'],
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': ticker['open'],
            'close': ticker['last'],
            'last': ticker['last'],
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': ticker['vol'],
            'info': ticker,
        };
    }

    async fetchOHLCV (symbol, timeframe = '1d', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_id': market['id'],
            'period': this.timeframes[timeframe],
        };
        if (since === undefined) {
            request['time_from'] = parseInt (this.milliseconds() / 1000 - 48 * 60 * 60);
        } else {
            request['time_from'] = parseInt (since / 1000);
        }
        if (limit === undefined) {
            request['time_to'] = parseInt (this.milliseconds() / 1000);
        } else {
            const duration = this.parseTimeframe (timeframe);
            request['time_to'] = parseInt (this.sum(request['time_from'], limit * duration));
        }
        const response = await this.publicGetOhlcv (request);
        // [
        //     [
        //       1663257600,
        //       19736.5,
        //       19945.7,
        //       19446.6,
        //       19662.1,
        //       5243.97705169
        //     ],
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
        const result = [0, 0, 0, 0, 0, 0];
        result[0] = parseInt (ohlcv[0]) * 1000;
        result[1] = parseFloat (ohlcv[1]);
        result[2] = parseFloat (ohlcv[2]);
        result[3] = parseFloat (ohlcv[3]);
        result[4] = parseFloat (ohlcv[4]);
        result[5] = parseFloat (ohlcv[5]);
        return result;
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
