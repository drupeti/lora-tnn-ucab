'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var mqtt = require('mqtt');
var util = require('util');
var EventEmitter = require('events');

var Client = function (_EventEmitter) {
  _inherits(Client, _EventEmitter);

  function Client(broker, appEUI, appAccessKey) {
    _classCallCheck(this, Client);

    var _this = _possibleConstructorReturn(this, (Client.__proto__ || Object.getPrototypeOf(Client)).call(this));

    _this.appEUI = appEUI;

    _this.client = mqtt.connect(util.format('mqtt://%s', broker), {
      username: appEUI,
      password: appAccessKey
    });
    _this.client.on('connect', _this._connected.bind(_this));
    _this.client.on('message', _this._handleMessage.bind(_this));
    _this.client.on('error', _this._error.bind(_this));
    return _this;
  }

  _createClass(Client, [{
    key: 'end',
    value: function end() {
      this.client.end();
    }
  }, {
    key: 'downlink',
    value: function downlink(devEUI, payload, ttl, port) {
      var topic = util.format('%s/devices/%s/down', this.appEUI, devEUI);
      var message = JSON.stringify({
        payload: payload.toString('base64'),
        ttl: ttl || '1h',
        port: port || 1
      });
      this.client.publish(topic, message);
    }
  }, {
    key: '_connected',
    value: function _connected() {
      _get(Client.prototype.__proto__ || Object.getPrototypeOf(Client.prototype), 'emit', this).call(this, 'connect');
      this.client.subscribe(['+/devices/+/activations', '+/devices/+/up']);
    }
  }, {
    key: '_handleMessage',
    value: function _handleMessage(topic, message) {
      var parts = topic.split('/');
      var payload = JSON.parse(message.toString());
      switch (parts[3]) {
        case 'activations':
          _get(Client.prototype.__proto__ || Object.getPrototypeOf(Client.prototype), 'emit', this).call(this, 'activation', {
            devEUI: parts[2]
          });
          break;
        case 'up':
          _get(Client.prototype.__proto__ || Object.getPrototypeOf(Client.prototype), 'emit', this).call(this, 'uplink', {
            devEUI: parts[2],
            fields: payload.fields || { raw: payload.payload },
            counter: payload.counter,
            port: payload.port,
            metadata: payload.metadata[0]
          });
          break;

          case 'eui-70b3d57ed004d890':
          case 'eui-70b3d57ed00503b0':
          _get(Client.prototype.__proto__ || Object.getPrototypeOf(Client.prototype), 'emit', this).call(this, 'uplink_1', {
            payload: payload
            //devEUI: parts[2],
            //fields: payload.fields || { raw: payload.payload },
            //counter: payload.counter,
            //port: payload.port,
            //metadata: payload.metadata[0]
          });
          break;

          //case 'eui-70b3d57ed00503b0':
          //_get(Client.prototype.__proto__ || Object.getPrototypeOf(Client.prototype), 'emit', this).call(this, 'uplink_2', {
            payload: payload
            //devEUI: parts[2],
            //fields: payload.fields || { raw: payload.payload },
            //counter: payload.counter,
            //port: payload.port,
            //metadata: payload.metadata[0]
          //});
         // break;
      }
    }
  }, {
    key: '_error',
    value: function _error(err) {
      _get(Client.prototype.__proto__ || Object.getPrototypeOf(Client.prototype), 'emit', this).call(this, 'error', err);
    }
  }]);

  return Client;
}(EventEmitter);

module.exports = Client;