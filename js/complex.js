'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, DDoSProtection } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class complex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'complex',
            'name': 'complex',
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
                'fetchOHLCV': true,
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
                '3m': undefined,
                '5m': '5',
                '15m': undefined,
                '30m': undefined,
                '1h': undefined,
                '2h': undefined,
                '4h': undefined,
                '6h': undefined,
                '8h': undefined,
                '12h': undefined,
                '1d': '1D',
                '3d': undefined,
                '1w': undefined,
                '1M': undefined,
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetTickers (params);
        // [
        //     {
        //     "symbol": "MNFT-MNT",
        //     "volume": "15614833.13",
        //     "percentChange": "5.15",
        //     "name": "MNFT-MNT",
        //     "lastTradeRate": "0.07349"
        //     }
        // ]
        const markets = response;
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const baseId = id.split ('-')[0];
            const quoteId = id.split ('-')[1];
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
        const response = await this.publicGetTickers (params);
        // [
        //     {
        //     "symbol": "MNFT-MNT",
        //     "volume": "15614833.13",
        //     "percentChange": "5.15",
        //     "name": "MNFT-MNT",
        //     "lastTradeRate": "0.07349"
        //     }
        // ]
        return this.parseTickers (response, symbols);
    }

    parseTicker (ticker, market = undefined) {
        // {
        //     "symbol": "MNFT-MNT",
        //     "volume": "15614833.13",
        //     "percentChange": "5.15",
        //     "name": "MNFT-MNT",
        //     "lastTradeRate": "0.07349"
        // }
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const price = this.safeNumber (ticker, 'lastTradeRate');
        const quoteVol = this.safeNumber (ticker, 'volume');
        const baseVol = quoteVol / price;
        return {
            'symbol': symbol,
            'timestamp': undefined,
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
            'baseVolume': baseVol,
            'quoteVolume': quoteVol,
            'info': ticker,
        };
    }

    async fetchOHLCV (symbol, timeframe = '1d', since = undefined, limit = undefined, params = {}) {
        const pairs = symbol.split ('/');
        const base = pairs[0].toUpperCase ();
        const quote = pairs[1].toUpperCase ();
        const id = base + '-' + quote;
        const request = {};
        const response = await this.publicGetOhlcv ({
            'market': id,
            'resolution': this.timeframes[timeframe]
        });
        if (since === undefined) {
            request['from'] = parseInt (this.milliseconds() / 1000 - 48 * 60 * 60);
        } else {
            request['from'] = since;
        }
        if (limit === undefined) {
            request['to'] = parseInt (this.milliseconds() / 1000);
        } else {
            const duration = this.parseTimeframe (timeframe);
            request['to'] = parseInt (this.sum(request['from'], limit * duration));
        }
        // {
        //     "s": "ok",
        //     "errmsg": null,
        //     "t": [
        //       1663286400,
        //     ],
        //     "o": [
        //         1663286400,
        //       ],
        //     "h": [
        //       1663286400,
        //     ],
        //     "l": [
        //         1663286400,
        //       ],
        //     "c": [
        //       1663286400,
        //     ],
        //     "v": [
        //         1663286400,
        //       ],
        // }
        return this.parseOHLCVS (response, symbol, timeframe, since, limit);
    }

    parseOHLCVS (ohlcvs, market = undefined, timeframe = '1d', since = undefined, limit = undefined) {
        const result = [];
        for (let i = 0; i < ohlcvs['c'].length; i++) {
            const ohlcv = [];
            ohlcv.push (parseInt (ohlcvs['t'][i]) * 1000);
            ohlcv.push (parseFloat (ohlcvs['o'][i]));
            ohlcv.push (parseFloat (ohlcvs['h'][i]));
            ohlcv.push (parseFloat (ohlcvs['l'][i]));
            ohlcv.push (parseFloat (ohlcvs['c'][i]));
            ohlcv.push (parseFloat (ohlcvs['v'][i]));
            result.push (ohlcv);
        }
        const sorted = this.sortBy (result, 0);
        return sorted;
    }

    parseOHLCV (ohlcv, market = undefined) {
        return ohlcv;
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
