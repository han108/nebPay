"use strict";

var BigNumber = require("bignumber.js");

var Utils = require("./Utils");
var QRCode = require("./qrcode");

var openExtension = require("./extensionHandler");
var openApp = require("./appHandler");
var config = require("./config");

var Pay = function (appKey, appSecret) {
	// TODO: currently not use
	this.appKey = appKey;
	this.appSecret = appSecret;
};

Pay.prototype = {
	/*jshint maxcomplexity:6 */
	submit: function (currency, to, value, payload, options) {
		options.serialNumber = Utils.randomCode(32);
		value = value || "0";
		var amount = new BigNumber(value).times("1000000000000000000");//10^18
		var params = {
			serialNumber: options.serialNumber,
			goods:options.goods,
			pay: {
				currency: currency,
				to: to,
				value: amount.toString(10),
				payload: payload,
				gasLimit: options.gasLimit,
				gasPrice: options.gasPrice
			},
            callback: options.callback || config.payUrl(options.debug),
            listener: options.listener,
			nrc20: options.nrc20
		};

		if (Utils.isChrome() && !Utils.isMobile() && options.extension.openExtension) {
			openExtension(params);
		}

		var appParams = {
			category: "jump",
			des: "confirmTransfer",
			pageParams: params
		};

		if (Utils.isMobile()) {
			openApp(appParams, options);
		}

		if (options.qrcode.showQRCode && !Utils.isNano()) {
			QRCode.showQRCode(JSON.stringify(appParams), options);
		}
		
		return options.serialNumber;
	}
};

module.exports = Pay;