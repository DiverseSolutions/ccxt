'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, DDoSProtection } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class xmeta extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'xmeta',
            'name': 'xmeta',
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
                'test': {
                    'market': 'https://exchange-proxy.krypto.mn/x-meta',
                    'public': 'https://exchange-proxy.krypto.mn/x-meta',
                },
                'logo': 'https://user-images.githubusercontent.com/1294454/67288762-2f04a600-f4e6-11e9-9fd6-c60641919491.jpg',
                'api': {
                    'proxy': 'https://exchange-proxy.krypto.mn/x-meta',
                },
                'www': 'https://www.x-meta.com',
                'doc': 'https://www.x-meta.com',
            },
            'api': {
                'proxy': {
                    'get': [
                        'tickers',
                    ],
                },
            },
        });
    }

    async fetchTickers (symbols = undefined, params = {}) {
        const response = await this.proxyGetTickers (params);
        // {
        //     "code": 0,
        //     "msg": "Success",
        //     "data": {
        //         "list": [
        //             {
        //                 "symbol": "IHC_BUSD",
        //                 "assetId": 568,
        //                 "type": 2,
        //                 "baseAsset": "IHC",
        //                 "name": "Inflation Hedging Coin",
        //                 "logoUrl": "https://www.x-meta.com/static/bankicon/IHC_Icon.png",
        //                 "quoteAsset": "BUSD",
        //                 "price": "0.00072119",
        //                 "volume": "181553667.4028889300",
        //                 "baseVolume": "0",
        //                 "amount": "130972.4742196600",
        //                 "quoteVolume": "0",
        //                 "change24h": "0.16249548",
        //                 "low": "0.00072002",
        //                 "high": "0.00072997",
        //                 "open": "0.00072002",
        //                 "close": "0.00072119",
        //                 "time": 1645259100005,
        //                 "klineUrl": "",
        //                 "klineImageUrl": ""
        //             }
        //         ]
        //     },
        //     "timestamp": 1645259150941
        // }
        return this.parseTickers (response['data']['list'], symbols);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.safeInteger (ticker, 'time');
        // {
        //     symbol: 'IHC_BUSD',
        //     assetId: '568',
        //     type: '2',
        //     baseAsset: 'IHC',
        //     name: 'Inflation Hedging Coin',
        //     logoUrl: 'https://www.x-meta.com/static/bankicon/IHC_Icon.png',
        //     quoteAsset: 'BUSD',
        //     price: '0.00072121',
        //     volume: '182803667.4028889300',
        //     baseVolume: '0',
        //     amount: '131873.9867196500',
        //     quoteVolume: '0',
        //     change24h: '0.16527318',
        //     low: '0.00072002',
        //     high: '0.00072997',
        //     open: '0.00072002',
        //     close: '0.00072121',
        //     time: '1645259400004',
        //     klineUrl: '',
        //     klineImageUrl: ''
        // }
        const symbolsSplitted = ticker['symbol'].split ('_');
        const symbol = symbolsSplitted.join ('/');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeNumber (ticker, 'open'),
            'close': this.safeNumber (ticker, 'price'),
            'last': this.safeNumber (ticker, 'price'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeNumber (ticker, 'amount') / this.safeNumber (ticker, 'price'),
            'quoteVolume': this.safeNumber (ticker, 'amount'),
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