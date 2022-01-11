<?php

namespace ccxt;

// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

use Exception; // a common import
use \ccxt\ExchangeError;
use \ccxt\NotSupported;

class trademn extends Exchange {

    public function describe() {
        return $this->deep_extend(parent::describe (), array(
            'id' => 'trademn',
            'name' => 'trademn',
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
                'fetchMarkets' => true,
                'fetchMyTrades' => false,
                'fetchOHLCV' => false,
                'fetchOpenOrders' => false,
                'fetchOrder' => false,
                'fetchOrderBook' => false,
                'fetchOrders' => false,
                'fetchTicker' => true,
                'fetchTickers' => true,
                'fetchTrades' => false,
                'fetchWithdrawals' => false,
                'withdraw' => null,
            ),
            'urls' => array(
                'logo' => 'https://user-images.githubusercontent.com/1294454/67288762-2f04a600-f4e6-11e9-9fd6-c60641919491.jpg',
                'api' => array(
                    'public' => 'https://trade.mn:116/api/v2',
                ),
                'www' => 'https://trade.mn',
                'doc' => 'https://trade.mn',
            ),
            'api' => array(
                'public' => array(
                    'get' => array(
                        'exchange/checkpair',
                    ),
                ),
            ),
        ));
    }

    public function fetch_markets($params = array ()) {
        $response = $this->publicGetExchangeCheckpair ($params);
        // {
        //     "status" => true,
        //     "code" => "100/1",
        //     "pairName" => array(
        //         {
        //             "name" => "TRD/MNT",
        //             "id" => 323,
        //             "code" => "TRD",
        //             "fromCurrencyId" => "203",
        //             "toCurrencyId" => "1",
        //             "lastPrice" => 1.11,
        //             "isFiat" => "1",
        //             "nameC" => "Digital Exchange Coin",
        //             "price24H" => "1.14",
        //             "diff" => "-0.89",
        //             "createDate" => "2021-08-18 10:50:54.0"
        //         }
        //     ),
        // }
        $markets = $response['pairName'];
        $result = array();
        for ($i = 0; $i < count($markets); $i++) {
            $market = $markets[$i];
            $id = $this->safe_string($market, 'name');
            $symbols = explode('/', $id);
            $base = strtoupper($symbols[0]);
            $quote = strtoupper($symbols[1]);
            $baseId = $base;
            $quoteId = $quote;
            if (is_array($this->commonCurrencies) && array_key_exists($baseId, $this->commonCurrencies)) {
                $base = $this->commonCurrencies[$baseId];
            }
            if (is_array($this->commonCurrencies) && array_key_exists($quoteId, $this->commonCurrencies)) {
                $quote = $this->commonCurrencies[$quoteId];
            }
            $symbol = $base . '/' . $quote;
            $entry = array(
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'baseId' => $baseId,
                'quoteId' => $quoteId,
                'active' => true,
                'taker' => null,
                'maker' => null,
                'type' => 'spot',
                'linear' => false,
                'inverse' => false,
                'contractSize' => 1,
                'spot' => true,
                'margin' => false,
                'future' => false,
                'swap' => false,
                'option' => false,
                'contract' => false,
                'settleId' => null,
                'settle' => null,
                'expiry' => null,
                'expiryDatetime' => null,
                'percentage' => false,
                'tierBased' => false,
                'feeSide' => 'get',
                'precision' => array(
                    'price' => null,
                    'amount' => null,
                    'cost' => null,
                ),
                'limits' => array(
                    'amount' => array(
                        'min' => null,
                        'max' => null,
                    ),
                    'price' => null,
                    'cost' => null,
                ),
                'info' => null,
            );
            $result[] = $entry;
        }
        return $result;
    }

    public function fetch_ticker($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market($symbol);
        $request = array(
            'pair' => $market['id'],
        );
        $response = $this->publicGetExchangeCheckpair (array_merge($request, $params));
        // {
        //     "status" => true,
        //     "code" => "100/1",
        //     "pairName" => array(
        //         {
        //             "name" => "TRD/MNT",
        //             "id" => 323,
        //             "code" => "TRD",
        //             "fromCurrencyId" => "203",
        //             "toCurrencyId" => "1",
        //             "lastPrice" => 1.11,
        //             "isFiat" => "1",
        //             "nameC" => "Digital Exchange Coin",
        //             "price24H" => "1.14",
        //             "diff" => "-0.89",
        //             "createDate" => "2021-08-18 10:50:54.0"
        //         }
        //     ),
        //     "minMax" => array(
        //         {
        //             "currencyId" => "100",
        //             "max24" => 122000000,
        //             "min24" => 118008000,
        //             "toCurrencyId" => "1",
        //             "minTradePrice" => 0.0001,
        //             "q" => 0.48042547000000013,
        //             "p" => 58001875.40842133
        //         }
        //     )
        // }
        $foundTickers = $this->filter_by_array($response['pairName'], 'name', $market['id']);
        $ticker = $foundTickers[$market['id']];
        if (!$ticker) {
            throw new NotSupported($market['id'] . ' not supported');
        }
        $ticker['minMax'] = $response['minMax'];
        return $this->parse_ticker($ticker, $market);
    }

    public function fetch_tickers($symbols = null, $params = array ()) {
        $markets = $this->load_markets();
        $result = array();
        $keys = is_array($markets) ? array_keys($markets) : array();
        for ($i = 0; $i < count($keys); $i++) {
            $marketId = $markets[$keys[$i]]['id'];
            $ticker = $this->fetch_ticker($marketId);
            $result[] = $ticker;
        }
        return $this->filter_by_array($result, 'symbol', $symbols);
    }

    public function parse_ticker($ticker, $market = null) {
        $timestamp = null;
        // {
        //     "name" => "TRD/MNT",
        //     "id" => 323,
        //     "code" => "TRD",
        //     "fromCurrencyId" => "203",
        //     "toCurrencyId" => "1",
        //     "lastPrice" => 1.11,
        //     "isFiat" => "1",
        //     "nameC" => "Digital Exchange Coin",
        //     "price24H" => "1.14",
        //     "diff" => "-0.89",
        //     "createDate" => "2021-08-18 10:50:54.0",
        //     "minMax" => array(
        //         {
        //             "currencyId" => "100",
        //             "max24" => 122000000,
        //             "min24" => 118008000,
        //             "toCurrencyId" => "1",
        //             "minTradePrice" => 0.0001,
        //             "q" => 0.48042547000000013,
        //             "p" => 58001875.40842133
        //         }
        //     )
        // }
        $marketId = $this->safe_string($ticker, 'symbol');
        $symbol = $this->safe_symbol($marketId, $market);
        $stats = $ticker['minMax'][0];
        return array(
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => null,
            'high' => $this->safe_number($stats, 'max24'),
            'low' => $this->safe_number($stats, 'min24'),
            'bid' => null,
            'bidVolume' => null,
            'ask' => null,
            'askVolume' => null,
            'vwap' => null,
            'open' => null,
            'close' => $this->safe_number($ticker, 'lastPrice'),
            'last' => $this->safe_number($ticker, 'lastPrice'),
            'previousClose' => null,
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => $this->safe_number($stats, 'q'),
            'quoteVolume' => $this->safe_number($stats, 'p'),
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