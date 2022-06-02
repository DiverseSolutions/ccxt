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
                    'public': 'https://exchange-proxy.krypto.mn/complex',
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
        const baseVol = this.safeNumber (ticker, 'volume');
        const quoteVol = baseVol * price;
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
