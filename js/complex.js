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
                    'public': 'http://52.79.140.119:8000/complex',
                },
                'www': 'https://complex.mn',
                'doc': 'https://complex.mn',
            },
            'api': {
                'public': {
                    'get': [
                        'tickers',
                    ],
                },
                'market': {
                    'get': [
                        'tickers',
                    ],
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetTickers (params);
        // {
        //     "status": "success",
        //     "data": [
        //         {
        //             "symbol": "AAVE-USDT",
        //             "high": "211.82600000",
        //             "low": "193.55300000",
        //             "volume": "367.11047577",
        //             "quoteVolume": "73326.58397790",
        //             "percentChange": "7.16",
        //             "updatedAt": "2022-01-11T16:17:40.403Z",
        //             "lastTradeRate": "211.82600000",
        //             "bidRate": "212.00100000",
        //             "askRate": "212.37300000",
        //             "_id": "60d5675465c8d98e910b2ef8",
        //             "name": "AAVE-USDT"
        //         }
        //     ]
        // }
        const markets = response['data'];
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
        // {
        //     "status": "success",
        //     "data": [
        //         {
        //             "symbol": "AAVE-USDT",
        //             "high": "211.82600000",
        //             "low": "193.55300000",
        //             "volume": "367.11047577",
        //             "quoteVolume": "73326.58397790",
        //             "percentChange": "7.16",
        //             "updatedAt": "2022-01-11T16:17:40.403Z",
        //             "lastTradeRate": "211.82600000",
        //             "bidRate": "212.00100000",
        //             "askRate": "212.37300000",
        //             "_id": "60d5675465c8d98e910b2ef8",
        //             "name": "AAVE-USDT"
        //         }
        //     ]
        // }
        return this.parseTickers (response['data'], symbols);
    }

    parseTicker (ticker, market = undefined) {
        // {
        //     "symbol": "AAVE-USDT",
        //     "high": "211.82600000",
        //     "low": "193.55300000",
        //     "volume": "367.11047577",
        //     "quoteVolume": "73326.58397790",
        //     "percentChange": "7.16",
        //     "updatedAt": "2022-01-11T16:17:40.403Z",
        //     "lastTradeRate": "211.82600000",
        //     "bidRate": "212.00100000",
        //     "askRate": "212.37300000",
        //     "_id": "60d5675465c8d98e910b2ef8",
        //     "name": "AAVE-USDT"
        // }
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        return {
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': ticker['high'],
            'low': ticker['low'],
            'bid': ticker['bidRate'],
            'bidVolume': undefined,
            'ask': ticker['askRate'],
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': ticker['lastTradeRate'],
            'last': ticker['lastTradeRate'],
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': ticker['volume'],
            'quoteVolume': ticker['quoteVolume'],
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
