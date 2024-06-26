<?php

namespace ccxt;

// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

use Exception; // a common import
use \ccxt\ExchangeError;
use \ccxt\DDoSProtection;

class capex extends Exchange {

    public function describe() {
        return $this->deep_extend(parent::describe (), array(
            'id' => 'capex',
            'name' => 'capex',
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
                'logo' => 'https://user-images.githubusercontent.com/1294454/67288762-2f04a600-f4e6-11e9-9fd6-c60641919491.jpg',
                'api' => array(
                    'proxy' => 'https://exchange-proxy.krypto.mn/capex',
                ),
                'www' => 'https://dax.mn',
                'doc' => 'https://dax.mn',
            ),
            'api' => array(
                'proxy' => array(
                    'get' => array(
                        'tickers',
                        'ohlcv',
                    ),
                ),
            ),
            'timeframes' => array(
                '1m' => '1',
                '5m' => '5',
                '15m' => '15',
                '1h' => '60',
                '4h' => '240',
                '1d' => '1440',
            ),
        ));
    }

    public function fetch_tickers($symbols = null, $params = array ()) {
        $response = $this->proxyGetTickers ($params);
        // {
        //     "method" => "stream",
        //     "event" => "MK",
        //     "data" => array(
        //       {
        //         "base" => "USDT",
        //         "quote" => "CPX",
        //         "price" => 30000,
        //         "change_in_price" => 92.30769231,
        //         "prev_price" => 15600,
        //         "base_volume" => 3015245.3306,
        //         "quote_volume" => 101.81,
        //         "low_24hr" => 15600,
        //         "high_24hr" => 30000,
        //         "maker_fee" => 0.25,
        //         "taker_fee" => 0.25,
        //         "maker_fee_pro" => 0.25,
        //         "taker_fee_pro" => 0.25,
        //         "min_trade_amount" => 0.0100001,
        //         "min_tick_size" => 0.01,
        //         "min_order_value" => 200,
        //         "max_size" => 0,
        //         "max_order_value" => 0,
        //         "max_size_market_order" => 0
        //       }
        //     )
        // }
        return $this->parse_tickers($response['data'], $symbols);
    }

    public function parse_ticker($ticker, $market = null) {
        $timestamp = null;
        // {
        //     "base" => "USDT",
        //     "quote" => "CPX",
        //     "price" => 30000,
        //     "change_in_price" => 92.30769231,
        //     "prev_price" => 15600,
        //     "base_volume" => 3015245.3306,
        //     "quote_volume" => 101.81,
        //     "low_24hr" => 15600,
        //     "high_24hr" => 30000,
        //     "maker_fee" => 0.25,
        //     "taker_fee" => 0.25,
        //     "maker_fee_pro" => 0.25,
        //     "taker_fee_pro" => 0.25,
        //     "min_trade_amount" => 0.0100001,
        //     "min_tick_size" => 0.01,
        //     "min_order_value" => 200,
        //     "max_size" => 0,
        //     "max_order_value" => 0,
        //     "max_size_market_order" => 0
        // }
        $base = $this->safe_string($ticker, 'base');
        $quote = $this->safe_string($ticker, 'quote');
        $symbol = $base . '/' . $quote;
        return array(
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => null,
            'high' => $ticker['high_24hr'],
            'low' => $ticker['low_24hr'],
            'bid' => null,
            'bidVolume' => null,
            'ask' => null,
            'askVolume' => null,
            'vwap' => null,
            'open' => null,
            'close' => $ticker['price'],
            'last' => $ticker['price'],
            'previousClose' => null,
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => $ticker['quote_volume'],
            'quoteVolume' => $ticker['base_volume'],
            'info' => $ticker,
        );
    }

    public function fetch_ohlcv($symbol, $timeframe = '1d', $since = null, $limit = null, $params = array ()) {
        $pairs = explode('/', $symbol);
        $base = $pairs[0];
        $quote = $pairs[1];
        $request = array(
            'base_currency' => $base,
            'quote_currency' => $quote,
            'interval' => $this->timeframes[$timeframe],
        );
        if ($since === null) {
            $request['start'] = intval($this->milliseconds() / 1000 - 48 * 60 * 60);
        } else {
            $request['start'] = intval($since / 1000);
        }
        if ($limit === null) {
            $request['end'] = intval($this->milliseconds() / 1000);
        } else {
            $duration = $this->parse_timeframe($timeframe);
            $request['end'] = intval($this->sum($request['start'], $limit * $duration));
        }
        $response = $this->proxyGetOhlcv ($request);
        // {
        //     "status" => "Success",
        //     "errorMessage" => null,
        //     "data" => array(
        //       array(
        //         "time" => 1663113600000,
        //         "open" => 0.025,
        //         "close" => 0.025,
        //         "high" => 0.025,
        //         "low" => 0.025,
        //         "volume" => 0
        //       ),
        //     )
        // }
        return $this->parse_ohlcvs($response['data'], $symbol, $timeframe, $since, $limit);
    }

    public function parse_ohlc_vs($ohlcvs, $market = null, $timeframe = '1m', $since = null, $limit = null) {
        $result = array();
        for ($i = 0; $i < count($ohlcvs); $i++) {
            $result[] = $this->parse_ohlcv($ohlcvs[$i], $market);
        }
        $sorted = $this->sort_by($result, 0);
        return $sorted;
    }

    public function parse_ohlcv($ohlcv, $market = null) {
        $r = array();
        $r[] = intval($ohlcv['time']);
        $r[] = floatval($ohlcv['open']);
        $r[] = floatval($ohlcv['high']);
        $r[] = floatval($ohlcv['low']);
        $r[] = floatval($ohlcv['close']);
        $r[] = floatval($ohlcv['volume']);
        return $r;
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
