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
                    'market': 'http://52.79.140.119:8000/corex',
                },
                'www': 'https://www.corex.mn',
                'doc': 'https://www.corex.mn',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
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
            'baseVolume': ticker['vol'],
            'quoteVolume': undefined,
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