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
                        'ohlcv',
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
        $response = $this->publicGetTickers ($params);
        $markets = $response;
        $result = array();
        $keys = is_array($markets) ? array_keys($markets) : array();
        for ($i = 0; $i < count($keys); $i++) {
            $market = $markets[$keys[$i]]['ticker'];
            $id = $keys[$i];
            $base = strtoupper($this->safe_string($market, 'base_unit'));
            $quote = strtoupper($this->safe_string($market, 'quote_unit'));
            $baseId = $this->safe_string($market, 'base_unit');
            $quoteId = $this->safe_string($market, 'quote_unit');
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
        $this->load_markets();
        $response = $this->publicGetTickers ($params);
        // {
        //     "usdtmnt" => {
        //         "at" => 1718588758,
        //         "ticker" => array(
        //         "buy" => "3436.0",
        //         "sell" => "3440.0",
        //         "low" => "3423.8",
        //         "high" => "3450.0",
        //         "open" => 3425,
        //         "last" => "3436.0",
        //         "volume" => "56497.0",
        //         "avg_price" => "3441.075476927978476733277873161",
        //         "price_change_percent" => "+0.32%",
        //         "total_volume" => "194410441.22",
        //         "total_volume_base_currency" => "56762.17261897810218978102189781",
        //         "vol" => "56497.0",
        //         "base_unit" => "usdt",
        //         "quote_unit" => "mnt"
        //         }
        //     ),
        // }
        return $this->parse_tickers($response, $symbols);
    }

    public function parse_ticker($tickerEntry, $market = null) {
        // {
        //     "at" => 1718588758,
        //     "ticker" => {
        //       "buy" => "3436.0",
        //       "sell" => "3440.0",
        //       "low" => "3423.8",
        //       "high" => "3450.0",
        //       "open" => 3425,
        //       "last" => "3436.0",
        //       "volume" => "56497.0",
        //       "avg_price" => "3441.075476927978476733277873161",
        //       "price_change_percent" => "+0.32%",
        //       "total_volume" => "194410441.22",
        //       "total_volume_base_currency" => "56762.17261897810218978102189781",
        //       "vol" => "56497.0",
        //       "base_unit" => "usdt",
        //       "quote_unit" => "mnt"
        //     }
        //   }
        $ticker = $tickerEntry['ticker']
        $timestamp = $this->safe_integer($tickerEntry, 'at');
        $marketId = $this->array_concat([$ticker['base_unit']], [$ticker['quote_unit']]);
        $symbol = $this->safe_symbol($marketId, $market);
        // if (is_array($this->markets_by_id) && array_key_exists($marketId, $this->markets_by_id)) {
        //     $market = $this->markets_by_id[$marketId];
        // } else {
        //     $baseId = $this->safe_string($ticker, 'base');
        //     $quoteId = $this->safe_string($ticker, 'quote');
        //     if (($baseId !== null) && ($quoteId !== null)) {
        //         $base = $this->safe_currency_code($baseId);
        //         $quote = $this->safe_currency_code($quoteId);
        //         $symbol = $base . '/' . $quote;
        //     }
        // }
        // if (($symbol === null) && ($market !== null)) {
        //     $symbol = $market['symbol'];
        // }
        return array(
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601($timestamp),
            'high' => $this->safe_number($ticker, 'high'),
            'low' => $this->safe_number($ticker, 'low'),
            'bid' => $this->safe_number($ticker, 'buy'),
            'bidVolume' => null,
            'ask' => $this->safe_number($ticker, 'sell'),
            'askVolume' => null,
            'vwap' => null,
            'open' => $this->safe_number($ticker, 'open'),
            'close' => $this->safe_number($ticker, 'last'),
            'last' => $this->safe_number($ticker, 'last'),
            'previousClose' => null,
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => $this->safe_number($ticker, 'vol'),
            'quoteVolume' => null,
            'info' => $ticker,
        );
    }

    public function fetch_ohlcv($symbol, $timeframe = '1d', $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market($symbol);
        $request = array(
            'market' => $market['id'],
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
        $response = $this->publicGetOhlcv ($request);
        // {
        //     "code" => 200,
        //     "message" => null,
        //     "data" => array(
        //       [
        //         1663200000,
        //         "19.4994",
        //         "19.499",
        //         "19.677",
        //         "18.5",
        //         "408981.2652",
        //         "7732079.65670149",
        //         "CHB/MNT"
        //       ),
        // }
        return $this->parse_ohlcvs($response['data'], $market, $timeframe, $since, $limit);
    }

    public function parse_ohlc_vs($ohlcvs, $market = null, $timeframe = '1m', $since = null, $limit = null) {
        //       array(
        //         1663200000,
        //         "19.4994",
        //         "19.499",
        //         "19.677",
        //         "18.5",
        //         "408981.2652",
        //         "7732079.65670149",
        //         "CHB/MNT"
        //       ),
        $result = array();
        for ($i = 0; $i < count($ohlcvs); $i++) {
            $result[] = $this->parse_ohlcv($ohlcvs[$i], $market);
        }
        $sorted = $this->sort_by($result, 0);
        return $sorted;
    }

    public function parse_ohlcv($ohlcv, $market = null) {
        $r = array();
        $r[] = intval($ohlcv[0]) * 1000;
        $r[] = floatval($ohlcv[1]);
        $r[] = floatval($ohlcv[2]);
        $r[] = floatval($ohlcv[3]);
        $r[] = floatval($ohlcv[4]);
        $r[] = floatval($ohlcv[5]);
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
