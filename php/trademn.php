<?php

namespace ccxt;

// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

use Exception; // a common import
use \ccxt\ExchangeError;

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
                    'public' => 'https://trade.mn:116/api/v2',
                    'proxy' => 'https://service-api.krypto.mn/exchange-proxy/trademn',
                ),
                'www' => 'https://trade.mn',
                'doc' => 'https://trade.mn',
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
                '5m' => '5',
                '15m' => '15',
                '30m' => '30',
                '1h' => '60',
                '4h' => '240',
                '8h' => '480',
                '1d' => '1440',
            ),
        ));
    }

    public function fetch_tickers($symbols = null, $params = array ()) {
        $response = $this->proxyGetTickers ($params);
        // {
        //     "data" => {
        //         "DOT/MNT" => array(
        //           "change" => 0,
        //           "lastPrice" => 19000,
        //           "volume" => 0
        //         }
        //     ),
        //     "timestamp" => 1659353716
        // }
        $data = $response['data'];
        $keys = is_array($data) ? array_keys($data) : array();
        for ($i = 0; $i < count($keys); $i++) {
            $data[$keys[$i]]['symbol'] = $keys[$i];
        }
        return $this->parse_tickers($response['data'], $symbols);
    }

    public function parse_ticker($ticker, $market = null) {
        $timestamp = null;
        // {
        //     "change" => 0,
        //     "lastPrice" => 19000,
        //     "volume" => 0,
        //     "symbol" => "ARDX/MNT",
        //     "timestamp" => 1659353716
        // }
        $marketId = $this->safe_string($ticker, 'symbol');
        $symbol = $marketId;
        $price = $this->safe_number($ticker, 'lastPrice');
        $baseVol = $this->safe_number($ticker, 'volume');
        $quoteVol = $price * $baseVol;
        return array(
            'symbol' => $symbol,
            'timestamp' => $timestamp,
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

    public function fetch_ohlcv($symbol, $timeframe = '1d', $since = null, $limit = null, $params = array ()) {
        $request = array(
            'symbol' => $symbol,
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
        // array(
        //     {
        //         "time" => 1673951700000,
        //         "open" => 0.167,
        //         "high" => 0.167,
        //         "low" => 0.167,
        //         "close" => 0.167,
        //         "volume" => 1000
        //     }
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
