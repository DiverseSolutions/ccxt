<?php

namespace ccxt;

// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

use Exception; // a common import
use \ccxt\ExchangeError;
use \ccxt\DDoSProtection;

class xmeta extends Exchange {

    public function describe() {
        return $this->deep_extend(parent::describe (), array(
            'id' => 'xmeta',
            'name' => 'xmeta',
            'countries' => ['MN'],
            'rateLimit' => 500,
            'requiresWeb3' => false,
            'certified' => false,
            // new metainfo interface
            'has' => array(
                'cancelOrder' => false,
                'CORS' => null,
                'createOrder' => false,
                'fetchBalance' => false,
                'fetchBidsAsks' => false,
                'fetchClosedOrders' => false,
                'fetchCurrencies' => false,
                'fetchDepositAddress' => false,
                'fetchDeposits' => false,
                'fetchMarkets' => false,
                'fetchMyTrades' => false,
                'fetchOHLCV' => false,
                'fetchOpenOrders' => false,
                'fetchOrder' => false,
                'fetchOrderBook' => false,
                'fetchOrders' => false,
                'fetchTicker' => false,
                'fetchTickers' => true,
                'fetchTrades' => false,
                'fetchWithdrawals' => false,
                'withdraw' => null,
            ),
            'urls' => array(
                'test' => array(
                    'market' => 'https://exchange-proxy.krypto.mn/x-meta',
                    'public' => 'https://exchange-proxy.krypto.mn/x-meta',
                ),
                'logo' => 'https://user-images.githubusercontent.com/1294454/67288762-2f04a600-f4e6-11e9-9fd6-c60641919491.jpg',
                'api' => array(
                    'proxy' => 'https://exchange-proxy.krypto.mn/x-meta',
                ),
                'www' => 'https://www.x-meta.com',
                'doc' => 'https://www.x-meta.com',
            ),
            'api' => array(
                'proxy' => array(
                    'get' => array(
                        'tickers',
                    ),
                ),
            ),
        ));
    }

    public function fetch_tickers($symbols = null, $params = array ()) {
        $response = $this->proxyGetTickers ($params);
        // {
        //     "code" => 0,
        //     "msg" => "Success",
        //     "data" => {
        //         "list" => array(
        //             array(
        //                 "symbol" => "IHC_BUSD",
        //                 "assetId" => 568,
        //                 "type" => 2,
        //                 "baseAsset" => "IHC",
        //                 "name" => "Inflation Hedging Coin",
        //                 "logoUrl" => "https://www.x-meta.com/static/bankicon/IHC_Icon.png",
        //                 "quoteAsset" => "BUSD",
        //                 "price" => "0.00072119",
        //                 "volume" => "181553667.4028889300",
        //                 "baseVolume" => "0",
        //                 "amount" => "130972.4742196600",
        //                 "quoteVolume" => "0",
        //                 "change24h" => "0.16249548",
        //                 "low" => "0.00072002",
        //                 "high" => "0.00072997",
        //                 "open" => "0.00072002",
        //                 "close" => "0.00072119",
        //                 "time" => 1645259100005,
        //                 "klineUrl" => "",
        //                 "klineImageUrl" => ""
        //             }
        //         )
        //     ),
        //     "timestamp" => 1645259150941
        // }
        return $this->parse_tickers($response['data']['list'], $symbols);
    }

    public function parse_ticker($ticker, $market = null) {
        $timestamp = $this->safe_integer($ticker, 'time');
        // {
        //     $symbol => 'IHC_BUSD',
        //     assetId => '568',
        //     type => '2',
        //     baseAsset => 'IHC',
        //     name => 'Inflation Hedging Coin',
        //     logoUrl => 'https://www.x-meta.com/static/bankicon/IHC_Icon.png',
        //     quoteAsset => 'BUSD',
        //     price => '0.00072121',
        //     volume => '182803667.4028889300',
        //     baseVolume => '0',
        //     amount => '131873.9867196500',
        //     quoteVolume => '0',
        //     change24h => '0.16527318',
        //     low => '0.00072002',
        //     high => '0.00072997',
        //     open => '0.00072002',
        //     close => '0.00072121',
        //     time => '1645259400004',
        //     klineUrl => '',
        //     klineImageUrl => ''
        // }
        $symbolsSplitted = explode('_', $ticker['symbol']);
        $symbol = implode('/', $symbolsSplitted);
        return array(
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601($timestamp),
            'high' => $this->safe_number($ticker, 'high'),
            'low' => $this->safe_number($ticker, 'low'),
            'bid' => null,
            'bidVolume' => null,
            'ask' => null,
            'askVolume' => null,
            'vwap' => null,
            'open' => $this->safe_number($ticker, 'open'),
            'close' => $this->safe_number($ticker, 'price'),
            'last' => $this->safe_number($ticker, 'price'),
            'previousClose' => null,
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => $this->safe_number($ticker, 'amount') / $this->safe_number($ticker, 'price'),
            'quoteVolume' => $this->safe_number($ticker, 'amount'),
            'info' => $ticker,
        );
    }

    public function sign($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$api];
        $url .= '/' . $path;
        if ($params) {
            $url .= '?' . $this->urlencode($params);
        }
        return array( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function handle_errors($code, $reason, $url, $method, $headers, $body, $response, $requestHeaders, $requestBody) {
        if ($code === 503) {
            throw new DDoSProtection($this->id . ' ' . (string) $code . ' ' . $reason . ' ' . $body);
        }
        if ($response === null) {
            return; // fallback to default error handler
        }
        if (is_array($response) && array_key_exists('code', $response)) {
            $status = $this->safe_string($response, 'code');
            if ($status === '1') {
                $message = $this->safe_string($response, 'msg');
                $feedback = $this->id . ' ' . $body;
                $this->throw_exactly_matched_exception($this->exceptions, $message, $feedback);
                throw new ExchangeError($feedback);
            }
        }
    }
}
