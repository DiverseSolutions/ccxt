<?php

namespace ccxt\async;

// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

use Exception; // a common import
use \ccxt\ExchangeError;
use \ccxt\DDoSProtection;

class corex extends Exchange {

    public function describe() {
        return $this->deep_extend(parent::describe (), array(
            'id' => 'corex',
            'name' => 'corex',
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
                    'public' => 'https://www.corex.mn/api/v2/peatio/public',
                    'proxy' => 'https://www.corex.mn/api/v2/peatio/public',
                    'market' => 'http://52.79.140.119:8000/corex',
                ),
                'www' => 'https://www.corex.mn',
                'doc' => 'https://www.corex.mn',
            ),
            'api' => array(
                'public' => array(
                    'get' => array(
                        'markets',
                        'ohlcv',
                    ),
                ),
                'proxy' => array(
                    'get' => array(
                        'ohlcv',
                    ),
                ),
                'market' => array(
                    'get' => array(
                        'tickers',
                    ),
                ),
            ),
            'timeframes' => array(
                '1m' => '60',
                '5m' => '300',
                '15m' => '900',
                '30m' => '1800',
                '1h' => '3600',
                '4h' => '14400',
                '1d' => '86400',
            ),
        ));
    }

    public function fetch_markets($params = array ()) {
        $response = yield $this->publicGetMarkets ($params);
        // array(
        //     {
        //         "id" => "crxmnt",
        //         "name" => "CRX/MNT",
        //         "base_unit" => "crx",
        //         "quote_unit" => "mnt",
        //         "min_price" => "10.0",
        //         "max_price" => "500.0",
        //         "min_amount" => "3000.0",
        //         "amount_precision" => 1,
        //         "price_precision" => 2,
        //         "state" => "enabled"
        //     }
        // )
        $markets = $response;
        $result = array();
        for ($i = 0; $i < count($markets); $i++) {
            $market = $markets[$i];
            $id = $this->safe_string($market, 'id');
            $baseId = $this->safe_string($market, 'base_unit');
            $quoteId = $this->safe_string($market, 'quote_unit');
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
        yield $this->load_markets();
        $response = yield $this->marketGetTickers ($params);
        // {
        //     "crxmnt" => {
        //         "at" => "1641916282",
        //         "ticker" => {
        //             "low" => "13.13",
        //             "high" => "13.3",
        //             "open" => "13.23",
        //             "last" => "13.2",
        //             "volume" => "43054233.526",
        //             "amount" => "3263026.8",
        //             "avg_price" => "13.1945693875392",
        //             "price_change_percent" => "-0.23%",
        //             "vol" => "43054233.526"
        //         }
        //     }
        // }
        $keys = is_array($response) ? array_keys($response) : array();
        for ($i = 0; $i < count($keys); $i++) {
            $response[$keys[$i]]['id'] = $keys[$i];
        }
        return $this->parse_tickers($response, $symbols);
    }

    public function parse_ticker($tickerData, $market_ = null) {
        $market = $this->market($tickerData['id']);
        $timestamp = $this->safe_timestamp($tickerData, 'at');
        $ticker = $tickerData['ticker'];
        // {
        //     "at" => "1641916282",
        //     "ticker" => {
        //         "low" => "13.13",
        //         "high" => "13.3",
        //         "open" => "13.23",
        //         "last" => "13.2",
        //         "volume" => "43054233.526",
        //         "amount" => "3263026.8",
        //         "avg_price" => "13.1945693875392",
        //         "price_change_percent" => "-0.23%",
        //         "vol" => "43054233.526"
        //     }
        // }
        $marketId = $this->safe_string($ticker, 'trading_pairs');
        $symbol = $this->safe_symbol($marketId, $market);
        $baseVolume = floatval($ticker['last']) && floatval($ticker['vol']) ? floatval($ticker['vol']) / floatval($ticker['last']) : 0;
        return array(
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601($timestamp),
            'high' => $ticker['high'],
            'low' => $ticker['low'],
            'bid' => null,
            'bidVolume' => null,
            'ask' => null,
            'askVolume' => null,
            'vwap' => null,
            'open' => $ticker['open'],
            'close' => $ticker['last'],
            'last' => $ticker['last'],
            'previousClose' => null,
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => $baseVolume,
            'quoteVolume' => $ticker['vol'],
            'info' => $ticker,
        );
    }

    public function fetch_ohlcv($symbol, $timeframe = '1d', $since = null, $limit = null, $params = array ()) {
        yield $this->load_markets();
        $market = $this->market($symbol);
        $request = array(
            'market_id' => $market['id'],
            'period' => $this->timeframes[$timeframe],
        );
        if ($since === null) {
            $request['time_from'] = intval($this->milliseconds() / 1000 - 48 * 60 * 60);
        } else {
            $request['time_from'] = $since;
        }
        if ($limit === null) {
            $request['time_to'] = intval($this->milliseconds() / 1000);
        } else {
            $duration = $this->parse_timeframe($timeframe);
            $request['time_to'] = intval($this->sum($request['time_from'], $limit * $duration));
        }
        $response = yield $this->publicGetOhlcv ($request);
        // array(
        //     array(
        //       1663257600,
        //       19736.5,
        //       19945.7,
        //       19446.6,
        //       19662.1,
        //       5243.97705169
        //     ),
        // )
        return $this->parse_ohlcvs($response, $symbol, $timeframe, $since, $limit);
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
        $ohlcv[0] = intval($ohlcv[0]) * 1000;
        $ohlcv[1] = floatval($ohlcv[1]);
        $ohlcv[2] = floatval($ohlcv[2]);
        $ohlcv[3] = floatval($ohlcv[3]);
        $ohlcv[4] = floatval($ohlcv[4]);
        $ohlcv[5] = floatval($ohlcv[5]);
        return $ohlcv;
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
