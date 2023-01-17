'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, DDoSProtection } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class capex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'capex',
            'name': 'capex',
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
                    'proxy': 'https://exchange-proxy.krypto.mn/capex',
                },
                'www': 'https://dax.mn',
                'doc': 'https://dax.mn',
            },
            'api': {
                'proxy': {
                    'get': [
                        'tickers',
                        'ohlcv',
                    ],
                },
            },
        });
    }

    async fetchTickers (symbols = undefined, params = {}) {
        const response = await this.proxyGetTickers (params);
        // {
        //     "method": "stream",
        //     "event": "MK",
        //     "data": [
        //       {
        //         "base": "USDT",
        //         "quote": "CPX",
        //         "price": 30000,
        //         "change_in_price": 92.30769231,
        //         "prev_price": 15600,
        //         "base_volume": 3015245.3306,
        //         "quote_volume": 101.81,
        //         "low_24hr": 15600,
        //         "high_24hr": 30000,
        //         "maker_fee": 0.25,
        //         "taker_fee": 0.25,
        //         "maker_fee_pro": 0.25,
        //         "taker_fee_pro": 0.25,
        //         "min_trade_amount": 0.0100001,
        //         "min_tick_size": 0.01,
        //         "min_order_value": 200,
        //         "max_size": 0,
        //         "max_order_value": 0,
        //         "max_size_market_order": 0
        //       }
        //     ]
        // }
        return this.parseTickers (response['data'], symbols);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = undefined;
        // {
        //     "base": "USDT",
        //     "quote": "CPX",
        //     "price": 30000,
        //     "change_in_price": 92.30769231,
        //     "prev_price": 15600,
        //     "base_volume": 3015245.3306,
        //     "quote_volume": 101.81,
        //     "low_24hr": 15600,
        //     "high_24hr": 30000,
        //     "maker_fee": 0.25,
        //     "taker_fee": 0.25,
        //     "maker_fee_pro": 0.25,
        //     "taker_fee_pro": 0.25,
        //     "min_trade_amount": 0.0100001,
        //     "min_tick_size": 0.01,
        //     "min_order_value": 200,
        //     "max_size": 0,
        //     "max_order_value": 0,
        //     "max_size_market_order": 0
        // }
        const base = this.safeString (ticker, 'base');
        const quote = this.safeString (ticker, 'quote');
        const symbol = base + '/' + quote;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': undefined,
            'high': ticker['high_24hr'],
            'low': ticker['low_24hr'],
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': ticker['price'],
            'last': ticker['price'],
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': ticker['quote_volume'],
            'quoteVolume': ticker['base_volume'],
            'info': ticker,
        };
    }

    async fetchOHLCV (symbol, timeframe = '1d', since = undefined, limit = undefined, params = {}) {
        const pairs = symbol.split ('/');
        const base = pairs[0];
        const quote = pairs[1];
        const response = await this.proxyGetOhlcv ({
            'base_currency': base,
            'quote_currency': quote,
        });
        // {
        //     "status": "Success",
        //     "errorMessage": null,
        //     "data": [
        //       {
        //         "time": 1663113600000,
        //         "open": 0.025,
        //         "close": 0.025,
        //         "high": 0.025,
        //         "low": 0.025,
        //         "volume": 0
        //       },
        //     ]
        // }
        return this.parseOHLCVs (response['data'], symbol, timeframe, since, limit);
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
        r.push (parseFloat (ohlcv['open']));
        r.push (parseFloat (ohlcv['high']));
        r.push (parseFloat (ohlcv['low']));
        r.push (parseFloat (ohlcv['close']));
        r.push (parseFloat (ohlcv['volume']));
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
