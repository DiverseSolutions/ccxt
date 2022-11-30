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
                    'proxy': 'https://service-api.krypto.mn/exchange-proxy',
                },
                'www': 'https://trade.mn',
                'doc': 'https://trade.mn',
            },
            'api': {
                'proxy': {
                    'get': [
                        'trademn/tickers',
                    ],
                },
            },
        });
    }

    async fetchTickers (symbols = undefined, params = {}) {
        const response = await this.proxyGetTrademnTickers (params);
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
