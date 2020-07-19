var UpnpSub = require("node-upnp-subscription");

/*
Subscription event example:

{
  "body": {
    "e:propertyset": {
      "$": {
        "xmlns:e": "urn:schemas-upnp-org:event-1-0"
      },
      "e:property": [
        {
          "X_InputMode": "rc-mode"
        },
        {
          "X_KeyboardType": "default"
        },
        {
          "X_ScreenState": "off"
        },
        {
          "X_AppInfo": "vc_app:1:product_id=0010000200000001:Netflix"
        }
      ]
    }
  }
}
*/

function handler(request, body, cb) {
  var subscription = new UpnpSub(request.host, request.port, request.path);

  subscription.on("message", function (message) {
    subscription.unsubscribe();

    const propertySet = message.body['e:propertyset'];
    const ns = propertySet.$['xmlns:e'];
    const propName = request.headers.SOAPACTION.replace('"'+ns+'#', '').replace('"', '');
    const propEntry = propertySet['e:property'].find(prop => propName in prop);

    cb(propEntry && propEntry[propName]);
  });

  setTimeout(subscription.unsubscribe, 1200);
}

module.exports = handler;
