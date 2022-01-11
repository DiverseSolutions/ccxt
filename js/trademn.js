'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, DDoSProtectionm, NotSupported } = require ('./base/errors');

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
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': false,
                'fetchWithdrawals': false,
                'withdraw': undefined,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/67288762-2f04a600-f4e6-11e9-9fd6-c60641919491.jpg',
                'api': {
                    'public': 'https://trade.mn:116/api/v2',
                },
                'www': 'https://trade.mn',
                'doc': 'https://trade.mn',
            },
            'api': {
                'public': {
                    'get': [
                        'exchange/checkpair',
                    ],
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetExchangeCheckpair (params);
        // {
        //     "status": true,
        //     "code": "100/1",
        //     "pairName": [
        //         {
        //             "name": "TRD/MNT",
        //             "id": 323,
        //             "code": "TRD",
        //             "fromCurrencyId": "203",
        //             "toCurrencyId": "1",
        //             "lastPrice": 1.11,
        //             "isFiat": "1",
        //             "nameC": "Digital Exchange Coin",
        //             "price24H": "1.14",
        //             "diff": "-0.89",
        //             "createDate": "2021-08-18 10:50:54.0"
        //         }
        //     ],
        // }
        const markets = response['pairName'];
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'name');
            const symbols = id.split ('/');
            let base = symbols[0].toUpperCase ();
            let quote = symbols[1].toUpperCase ();
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

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetExchangeCheckpair (this.extend (request, params));
        // {
        //     "status": true,
        //     "code": "100/1",
        //     "pairName": [
        //         {
        //             "name": "TRD/MNT",
        //             "id": 323,
        //             "code": "TRD",
        //             "fromCurrencyId": "203",
        //             "toCurrencyId": "1",
        //             "lastPrice": 1.11,
        //             "isFiat": "1",
        //             "nameC": "Digital Exchange Coin",
        //             "price24H": "1.14",
        //             "diff": "-0.89",
        //             "createDate": "2021-08-18 10:50:54.0"
        //         }
        //     ],
        //     "minMax": [
        //         {
        //             "currencyId": "100",
        //             "max24": 122000000,
        //             "min24": 118008000,
        //             "toCurrencyId": "1",
        //             "minTradePrice": 0.0001,
        //             "q": 0.48042547000000013,
        //             "p": 58001875.40842133
        //         }
        //     ]
        // }
        const foundTickers = this.filterByArray (response['pairName'], 'name', market['id']);
        const ticker = foundTickers[market['id']];
        if (!ticker) {
            throw new NotSupported (market['id'] + ' not supported');
        }
        ticker['minMax'] = response['minMax']
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        const markets = await this.loadMarkets ();
        const result = [];
        const keys = Object.keys (markets);
        for (let i = 0; i < keys.length; i++) {
            const marketId = markets[keys[i]]['id'];
            const ticker = await this.fetchTicker (marketId); 
            result.push (ticker);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = undefined;
        // {
        //     "name": "TRD/MNT",
        //     "id": 323,
        //     "code": "TRD",
        //     "fromCurrencyId": "203",
        //     "toCurrencyId": "1",
        //     "lastPrice": 1.11,
        //     "isFiat": "1",
        //     "nameC": "Digital Exchange Coin",
        //     "price24H": "1.14",
        //     "diff": "-0.89",
        //     "createDate": "2021-08-18 10:50:54.0",
        //     "minMax": [
        //         {
        //             "currencyId": "100",
        //             "max24": 122000000,
        //             "min24": 118008000,
        //             "toCurrencyId": "1",
        //             "minTradePrice": 0.0001,
        //             "q": 0.48042547000000013,
        //             "p": 58001875.40842133
        //         }
        //     ]
        // }
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const stats = ticker['minMax'][0];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': undefined,
            'high': this.safeNumber (stats, 'max24'),
            'low': this.safeNumber (stats, 'min24'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': this.safeNumber (ticker, 'lastPrice'),
            'last': this.safeNumber (ticker, 'lastPrice'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeNumber (stats, 'q'),
            'quoteVolume': this.safeNumber (stats, 'p'),
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
