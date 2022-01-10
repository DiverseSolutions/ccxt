<?php

namespace ccxt;

// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

use Exception; // a common import
use \ccxt\ExchangeError;
use \ccxt\DDoSProtection;

class coinhub extends Exchange {

    public function describe() {
        return $this->deep_extend(parent::describe (), array(
            'id' => 'coinhub',
            'name' => 'coinhub',
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
                'fetchTicker' => false,
                'fetchTickers' => true,
                'fetchTrades' => false,
                'fetchWithdrawals' => false,
                'withdraw' => null,
            ),
            'urls' => array(
                'test' => array(
                    'market' => 'https://sapi.coinhub.mn/v1',
                    'public' => 'https://sapi.coinhub.mn/v1',
                ),
                'logo' => 'https://user-images.githubusercontent.com/1294454/67288762-2f04a600-f4e6-11e9-9fd6-c60641919491.jpg',
                'api' => array(
                    'market' => 'https://sapi.coinhub.mn/v1/market',
                    'public' => 'https://sapi.coinhub.mn/v1',
                ),
                'www' => 'https://www.byte-trade.com',
                'doc' => 'https://docs.byte-trade.com/#description',
            ),
            'api' => array(
                'market' => array(
                    'get' => array(
                        'tickers',
                    ),
                ),
                'public' => array(
                    'get' => array(
                        'tickers',
                    ),
                ),
            ),
        ));
    }

    public function fetch_markets($params = array ()) {
        $response = $this->publicGetTickers ($params);
        $markets = $response['data'];
        $result = array();
        $keys = is_array($markets) ? array_keys($markets) : array();
        for ($i = 0; $i < count($keys); $i++) {
            $market = $markets[$keys[$i]];
            $id = $this->safe_string($market, 'market');
            $base = $this->safe_string($market, explode(strtoupper('/', 'market'))[0]);
            $quote = $this->safe_string($market, explode(strtoupper('/', 'market'))[1]);
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

    public function fetch_tickers($symbols = null, $params = array ()) {
        $response = $this->publicGetTickers ($params);
        // {
        //     "code" => 200,
        //     "message" => "success",
        //     "data" => {
        //         "IHC/MNT" => array(
        //             "volume" => 1595147755.9,
        //             "high" => 3.23997,
        //             "deal" => 5117109795.941351,
        //             "close" => 3.224,
        //             "low" => 3.13,
        //             "open" => 3.16003,
        //             "change" => 0.0202,
        //             "timestamp" => 1641522240004,
        //             "market" => "IHC/MNT"
        //         ),
        // }
        return $this->parse_tickers($response['data'], $symbols);
    }

    public function parse_ticker($ticker, $market = null) {
        $timestamp = $this->safe_integer($ticker, 'timestamp');
        // {
        //     "data" => {
        //         "IHC/MNT" => {
        //             "volume" => 1595147755.9,
        //             "high" => 3.23997,
        //             "deal" => 5117109795.941351,
        //             "close" => 3.224,
        //             "low" => 3.13,
        //             "open" => 3.16003,
        //             "change" => 0.0202,
        //             "timestamp" => 1641522240004,
        //             "market" => "IHC/MNT"
        //         }
        //     }
        // }
        $marketId = $this->safe_string($ticker, 'market');
        // if (is_array($this->markets_by_id) && array_key_exists($marketId, $this->markets_by_id)) {
        //     $market = $this->markets_by_id[$marketId];
        // } else {
        //     $baseId = $this->safe_string($ticker, 'base');
        //     $quoteId = $this->safe_string($ticker, 'quote');
        //     if (($baseId !== null) && ($quoteId !== null)) {
        //         $base = $this->safe_currency_code($baseId);
        //         $quote = $this->safe_currency_code($quoteId);
        //         symbol = $base . '/' . $quote;
        //     }
        // }
        // if ((symbol === null) && ($market !== null)) {
        //     symbol = $market['symbol'];
        // }
        return array(
            'symbol' => $marketId,
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
            'close' => $this->safe_number($ticker, 'close'),
            'last' => $this->safe_number($ticker, 'close'),
            'previousClose' => null,
            'change' => $this->safe_number($ticker, 'change'),
            'percentage' => null,
            'average' => null,
            'baseVolume' => $this->safe_number($ticker, 'volume'),
            'quoteVolume' => null,
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
