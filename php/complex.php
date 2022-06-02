<?php

namespace ccxt;

// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

use Exception; // a common import
use \ccxt\ExchangeError;
use \ccxt\DDoSProtection;

class complex extends Exchange {

    public function describe() {
        return $this->deep_extend(parent::describe (), array(
            'id' => 'complex',
            'name' => 'complex',
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
                'logo' => 'https://user-images.githubusercontent.com/1294454/67288762-2f04a600-f4e6-11e9-9fd6-c60641919491.jpg',
                'api' => array(
                    'public' => 'https://exchange-proxy.krypto.mn/complex',
                ),
                'www' => 'https://complex.mn',
                'doc' => 'https://complex.mn',
            ),
            'api' => array(
                'public' => array(
                    'get' => array(
                        'tickers',
                    ),
                ),
                'market' => array(
                    'get' => array(
                        'tickers',
                    ),
                ),
            ),
        ));
    }

    public function fetch_markets($params = array ()) {
        $response = $this->publicGetTickers ($params);
        // array(
        //     {
        //     "symbol" => "MNFT-MNT",
        //     "volume" => "15614833.13",
        //     "percentChange" => "5.15",
        //     "name" => "MNFT-MNT",
        //     "lastTradeRate" => "0.07349"
        //     }
        // )
        $markets = $response;
        $result = array();
        for ($i = 0; $i < count($markets); $i++) {
            $market = $markets[$i];
            $id = $this->safe_string($market, 'symbol');
            $baseId = explode('-', $id)[0];
            $quoteId = explode('-', $id)[1];
            $base = strtoupper($baseId);
            $quote = strtoupper($quoteId);
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
        $this->load_markets();
        $response = $this->publicGetTickers ($params);
        // array(
        //     {
        //     "symbol" => "MNFT-MNT",
        //     "volume" => "15614833.13",
        //     "percentChange" => "5.15",
        //     "name" => "MNFT-MNT",
        //     "lastTradeRate" => "0.07349"
        //     }
        // )
        return $this->parse_tickers($response, $symbols);
    }

    public function parse_ticker($ticker, $market = null) {
        // {
        //     "symbol" => "MNFT-MNT",
        //     "volume" => "15614833.13",
        //     "percentChange" => "5.15",
        //     "name" => "MNFT-MNT",
        //     "lastTradeRate" => "0.07349"
        // }
        $marketId = $this->safe_string($ticker, 'symbol');
        $symbol = $this->safe_symbol($marketId, $market);
        $price = $this->safe_number($ticker, 'lastTradeRate');
        $baseVol = $this->safe_number($ticker, 'volume');
        $quoteVol = $baseVol * $price;
        return array(
            'symbol' => $symbol,
            'timestamp' => null,
            'datetime' => null,
            'high' => null,
            'low' => null,
            'bid' => null,
            'bidVolume' => null,
            'ask' => null,
            'askVolume' => null,
            'vwap' => null,
            'open' => null,
            'close' => $price,
            'last' => $price,
            'previousClose' => null,
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => $baseVol,
            'quoteVolume' => $quoteVol,
            'info' => $ticker,
        );
    }

    public function sign($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$api];
        $url .= '/' . $path;
        if ($method === 'GET' && $params) {
            $url .= '?' . $this->urlencode($params);
        }
        if ($method === 'GET') {
            return array(
                'url' => $url,
                'method' => $method,
                'headers' => $headers,
                'params' => array(),
                'body' => $body,
            );
        }
        $body = $params;
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
