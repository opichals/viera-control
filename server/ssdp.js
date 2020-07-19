var Browser = require("ssdp-js");
var browser = new Browser();
var devices = {};

// patch to destroy completely
browser.destroy = ((destroy) => () => {
  browser._chromecastSSDP.destroy();
  destroy();
})(browser.destroy);

browser.onDevice(function(device) {
  console.log("DLNA device ", device.name);
  devices[device.name] = device;
});

browser.start();

function findDevices(name, cb) {
  var find = function () {
    if (devices[name] && cb) {
      cb(devices[name]);
      cb = null;
    }
  };

  find();

  if (cb) {
    // check every 100ms
    var id = setInterval(() => (cb && find()), 100);

    // keep checking for up-to 1 second
    setTimeout(() => {
      clearInterval(id);
      cb && cb(null);
    }, 3000);
  }
}


function ssdp(name, cb) {
  device = devices[name];
  if (!device) {
     findDevices(name, cb)
  } else {
     cb(device);
  }
  return device;
}

ssdp.flushCache = function() {
  devices = {};
};

module.exports = ssdp;
