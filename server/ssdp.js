var Browser = require("ssdp-js");
var devices = {};

function findDevices(name, cb) {
  var browser = new Browser();
  browser.onDevice(function(device) {
    console.log("DLNA device ", device);
    devices[device.name] = device;
    if (device.name === name && cb) {
      cb(device);
      cb = null;
    }
  });

  browser.start(); // by default, ssdp-js would poll ssdp every 5 seconds 
  setTimeout(() => {
    browser.destroy();
  }, 3000);
}


module.exports = function(name, cb) {
  device = devices[name];
  if (!device) {
     findDevices(name, cb)
  } else {
     cb(device);
  }
  return device;
}

