var baseUrl = 'http://2.latest.agiroapp.appspot.com';
var registerUrl = baseUrl + '/register';

function notify(message) {
    if (window.webkitNotifications.checkPermission() == 0) {
        window.webkitNotifications.createNotification("https://github.com/wulax/aGiro/raw/master/res/drawable-mdpi/icon.png", message.title, message.body).show();
    } else {
        alert(message);
    }
}

function initializeBrowserChannel() {
    var req = new XMLHttpRequest();
    req.open("GET", registerUrl, true);
    req.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (req.status == 200) {
                channel = JSON.parse(req.responseText);
                console.log("token: " + channel.token);
                console.log("pin: " + channel.pin);

                // TODO: Send event to popup...
                localStorage['pin'] = channel.pin

                var channelId = channel.token;
                channel = new goog.appengine.Channel(channelId);
                socket = channel.open();
                socket.onopen = function() {
                    console.log('Browser channel initialized');
                }
                socket.onclose = function() {
                    console.log('Browser channel closed');
                    //setTimeout('initializeBrowserChannel()', 0); 
                }
                socket.onerror = function(error) {
                    if (error.code == 401) {  // token expiry
                        console.log('Browser channel token expired - reconnecting');
                    } else {
                        console.log('Browser channel error');
                        // Automatically reconnects
                    }
                }
                socket.onmessage = onMessage
            }
        }
    }
    req.send(null);
}

function onMessage(evt) {
    var o = JSON.parse(evt.data);
    console.log(o);
    if (o.type == 'invoice') {
        onInvoiceMessage(o);
    } else if (o.type == 'register') {
        onRegisterMessage(o);
    }
}

function onRegisterMessage(message) {
    // TODO: Send event to popup...
    console.log(message);
}

function onInvoiceMessage(message) {
    chrome.tabs.getAllInWindow(null, function(tabs) {
        var found = 0;

        for (var i = 0; i < tabs.length; i++) {
            if (tabs[i].url.indexOf("swedbank.se") != -1) {
                found++;
                handleSwedbank(message, tabs[i]);
            } else if (tabs[i].url.indexOf("skandiabanken.se") != -1) {
                found++;
                handleSkandiabanken(message, tabs[i]);
            } else if (tabs[i].url.indexOf("lansforsakringar.se") != -1) {
                found++;
                handleLansforsakringar(message, tabs[i]);
            } else if (tabs[i].url.indexOf("nordea.se") != -1) {
                found++;
                handleNordea(o, tabs[i]);
            } else if (tabs[i].url.indexOf("handelsbanken.se") != -1) {
                found++;
                handleHandelsbanken(message, tabs[i]);
            }
        }

        if (found == 0) {
             var notification = new Object();
             notification.title = "OCR"
             notification.body = message.reference
             notify(notification);
         }
    });

}

function handleSkandiabanken(invoice, tab) {
    chrome.tabs.executeScript(tab.id, {
        code: "document.getElementById('ctl00_ctl00_ctl00_cphContentWide_cphContentWide_cphMainContent_tbReferenceNumber').value='" + invoice.reference +  "'"
    });
}

function handleSwedbank(invoice, tab) {
    chrome.tabs.executeScript(tab.id, {
        code: "document.getElementById('meddelandeOCR').value= '"+ invoice.reference +"'"
    });
}

function handleLansforsakringar(invoice, tab) {
    chrome.tabs.executeScript(tab.id, {
        code: "document.getElementById('paymentId').value= '"+ invoice.reference +"'"
    });
}

function handleNordea(invoice, tab) {
    chrome.tabs.executeScript(tab.id, {
        code: "document.getElementById('paymentmessage').value= '"+ invoice.reference +"';" +
              "document.getElementById('paymentamount').value= '"+ invoice.amount +"'"
    });
}

function handleHandelsbanken(invoice, tab) {
    chrome.tabs.executeScript(tab.id, {
        code: "document.getElementById('FRI_TEXT0').value= '"+ invoice.reference +"'"
    });
}
