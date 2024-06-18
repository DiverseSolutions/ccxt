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
            'rateLimit': 1000,
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
        const markets = response;
        const result = [];
        const keys = Object.keys (markets);
        for (let i = 0; i < keys.length; i++) {
            const market = markets[keys[i]]['ticker'];
            const id = keys[i];
            let base = this.safeString (market, 'base_unit').toUpperCase ();
            let quote = this.safeString (market, 'quote_unit').toUpperCase ();
            const baseId = this.safeString (market, 'base_unit');
            const quoteId = this.safeString (market, 'quote_unit');
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
        //     "usdtmnt": {
        //         "at": 1718588758,
        //         "ticker": {
        //         "buy": "3436.0",
        //         "sell": "3440.0",
        //         "low": "3423.8",
        //         "high": "3450.0",
        //         "open": 3425,
        //         "last": "3436.0",
        //         "volume": "56497.0",
        //         "avg_price": "3441.075476927978476733277873161",
        //         "price_change_percent": "+0.32%",
        //         "total_volume": "194410441.22",
        //         "total_volume_base_currency": "56762.17261897810218978102189781",
        //         "vol": "56497.0",
        //         "base_unit": "usdt",
        //         "quote_unit": "mnt"
        //         }
        //     },
        // }
        const tickers = [];
        const marketKeys = Object.keys (this.markets);
        for (let i = 0; i < marketKeys.length; i++) {
            const marketKey = marketKeys[i];
            const market = this.markets[marketKey];
            const ticker = response[market['id']]['ticker'];
            const baseId = ticker['base_unit'];
            const quoteId = ticker['quote_unit'];
            const base = baseId.toUpperCase ();
            const quote = quoteId.toUpperCase ();
            const symbol = base + "/" + quote;
            const id = base + quote;
            ticker['symbol'] = symbol;
            ticker['id'] = id;
            ticker['timestamp'] = response[market['id']]['at'] * 1000;
            tickers.push (ticker)
        }
        return this.parseTickers (tickers, symbols);
    }

    parseTicker (ticker, market = undefined) {
        // {
        //     "at": 1718588758,
        //     "ticker": {
        //       "buy": "3436.0",
        //       "sell": "3440.0",
        //       "low": "3423.8",
        //       "high": "3450.0",
        //       "open": 3425,
        //       "last": "3436.0",
        //       "volume": "56497.0",
        //       "avg_price": "3441.075476927978476733277873161",
        //       "price_change_percent": "+0.32%",
        //       "total_volume": "194410441.22",
        //       "total_volume_base_currency": "56762.17261897810218978102189781",
        //       "vol": "56497.0",
        //       "base_unit": "usdt",
        //       "quote_unit": "mnt"
        //     }
        //   }
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const symbol = ticker['symbol'];
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
            'bid': this.safeNumber (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeNumber (ticker, 'open'),
            'close': this.safeNumber (ticker, 'last'),
            'last': this.safeNumber (ticker, 'last'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeNumber (ticker, 'vol'),
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
            request['start'] = parseInt (since / 1000);
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
