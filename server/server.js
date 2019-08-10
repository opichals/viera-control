var application_root = __dirname,
  http = require('http'),
  express = require('express'),
  path = require('path');

var ssdp = require('./ssdp');

// Create server
var vieraControl = express();

// Configure server
vieraControl.configure(function() {
  vieraControl.use( express.bodyParser() );
  vieraControl.use( express.methodOverride() );
  vieraControl.use( vieraControl.router );
  vieraControl.use( express.logger());
  vieraControl.use( express.static( path.join( application_root, '../app' ) ) );
  vieraControl.use( express.errorHandler({ dumpExceptions: true, showStack: true}) );
});

// Method for sending requests
var sendRequest = function(ipAddress, type, action, command, options) {
  var url, urn;
  if(type == "command") {
    url = "/nrc/control_0";
    urn = "panasonic-com:service:p00NetworkControl:1";
  } else if (type == "render") {
    url = "/dmr/control_0";
    urn = "schemas-upnp-org:service:RenderingControl:1";
  }

   var body = "<?xml version='1.0' encoding='utf-8'?> \
   <s:Envelope xmlns:s='http://schemas.xmlsoap.org/soap/envelope/' s:encodingStyle='http://schemas.xmlsoap.org/soap/encoding/'> \
    <s:Body> \
     <u:"+action+" xmlns:u='urn:"+urn+"'> \
      "+command+" \
     </u:"+action+"> \
    </s:Body> \
   </s:Envelope>";

   var postRequest = {
    host: ipAddress,
    path: url,
    port: 55000,
    method: "POST",
    headers: {
      'Content-Length': body.length,
      'Content-Type': 'text/xml; charset="utf-8"',
      'SOAPACTION': '"urn:'+urn+'#'+action+'"'
    }
  };

  console.log(postRequest.host+":"+postRequest.port + postRequest.path + " " + action);

  var self = this;
  if(options !== undefined) {
    self.callback = options['callback'];
  } else {
    self.callback = function(data){ };
  }

  if (!ipAddress.match(/^\d/)) {
     ssdp(ipAddress, function(device) {
       postRequest.host = device.address;
       httpRequest(postRequest, body, self.callback);
     });
  } else {
       httpRequest(postRequest, body, self.callback);
  }

  return true;
}

function httpRequest(postRequest, body, cb) {
  var req = http.request(postRequest, function(res) {
    res.setEncoding('utf8');
    res.on('data', cb);
  });

  req.on('error', function(e) {
     console.log('ERROR: ' + e);
     return false;
  });

  req.write(body);
  req.end();
};

vieraControl.post('/tv/:ip/action', function(req, res) {
  if(sendRequest(req.params.ip, 'command', 'X_SendKey', '<X_KeyEvent>'+req.body.action+'</X_KeyEvent>')) {
      res.end();
  } else {
      res.send({"error": "internal error"});
  }
});

vieraControl.get('/tv/:ip/volume', function(req, res) {
  var self = this;
  sendRequest(req.params.ip, 'render', 'GetVolume', '<InstanceID>0</InstanceID><Channel>Master</Channel>',
    {
      callback: function(data){
        var match = /<CurrentVolume>(\d*)<\/CurrentVolume>/gm.exec(data);
        if(match !== null){
          res.send(match[1]);
        }
      }
    }
  );
});

// Require the API
// Comment this if you don't want to use API
require('./api')(vieraControl, sendRequest);


// Run server
const port = process.env.PORT || 8080;
vieraControl.listen(port);
console.log('Listening on port '+port);
