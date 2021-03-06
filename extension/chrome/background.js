var baseUrl = 'http://cloud.droidgiro.se';
var registerUrl = baseUrl + '/register';

function notify(message) {
    if (window.webkitNotifications.checkPermission() == 0) {
        window.webkitNotifications.createNotification("/icon.png", message.title, message.body).show();
    } else {
        alert(message);
    }
}

function sendRequest(type, payload) {
    chrome.extension.sendRequest({
        'type': type,
        'payload': payload,
    });
}

var socket = null;

function initializeBrowserChannel() {
    console.log('initializeBrowserChannel');

    if (socket != null) {
        console.log('Closing socket.');
        //socket.close();
        // This is a workaround since socket.close() does not work from a extension.
        sendRequest('reload', 'Reloading...');
        location.reload(true)

        return;
    }

    var req = new XMLHttpRequest();
    req.open("GET", registerUrl, true);
    req.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (req.status == 200) {
                channelData = JSON.parse(req.responseText);
                console.log("token: " + channelData.token);
                console.log("pin: " + channelData.pin);

                sendRequest('pin', channelData.pin);

                var channelId = channelData.token;
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
            } else {
                console.log('registered returned: ' + req.status);
            }
        } else {
            console.log('this.readyState = ' + this.readyState);
        }
    }
    req.send(null);
}

function onMessage(evt) {
    var o = JSON.parse(evt.data);
    console.log(o);
    if (o.type == 'invoice') {
        onInvoiceMessage(o.payload);
    } else if (o.type == 'register') {
        onRegisterMessage(o);
    }
}

function onRegisterMessage(message) {
    // TODO: Check if popup is still open, oterwise show a notification.
    sendRequest('registered', message.payload);
    /*
    var notification = new Object();
    notification.title = 'Connected'
    notification.body = 'Ready to recieve invoices.'
    notify(notification);
    */
}

function onInvoiceMessage(message) {
    chrome.tabs.getAllInWindow(null, function(tabs) {
        var found = 0;

        for (var i = 0; i < tabs.length; i++) {
            if (tabs[i].url.indexOf("internetbank.swedbank.se") != -1) {
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
                handleNordea(message, tabs[i]);
            } else if (tabs[i].url.indexOf("secure.handelsbanken.se") != -1) {
                found++;
                handleHandelsbanken(message, tabs[i]);
            } else if (tabs[i].url.indexOf("sebank.se") != -1) {
                found++;
                handleSeb(message, tabs[i]);
            } else if (tabs[i].url.indexOf("nordnet.se") != -1) {
                found++;
                handleNordnet(message, tabs[i]);
            } else if (tabs[i].url.indexOf("icabanken.se") != -1) {
                found++;
                handleIca(message, tabs[i]);
            } else if (tabs[i].url.indexOf("internetbanken.sparbankenoresund.se") != -1) {
                found++;
                handleSparbankenOresund(message, tabs[i]);
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

// TODO: Maybe we should move bank scripts to separate js files and inject them
// using; chrome.tabs.executeScript(null, {file: "swedbank_script.js"});
function handleSkandiabanken(invoice, tab) {
    chrome.tabs.executeScript(tab.id, {
        code: "if ('"+ invoice.reference +"' != '') document.getElementById('ctl00_ctl00_ctl00_cphBody_cphContentWide_cphContentWide_cphMainContent_tbReferenceNumber').value='" + invoice.reference +  "';" +
              "if ('"+ invoice.amount +"' != '') document.getElementById('ctl00_ctl00_ctl00_cphBody_cphContentWide_cphContentWide_cphMainContent_tbAmount').value= '"+ invoice.amount +"';" +
              "if ('"+ invoice.account +"' != '') document.getElementById('ctl00_ctl00_ctl00_cphBody_cphContentWide_cphContentWide_cphMainContent_tbNewRecipient').value= '"+ invoice.account +"'"
    });
}

function handleSwedbank(invoice, tab) {
    chrome.tabs.executeScript(tab.id, {
        code: "if ('"+ invoice.reference +"' != '') document.getElementById('meddelandeOCR').value= '"+ invoice.reference +"';" +
              "if ('"+ invoice.amount +"' != '') document.getElementById('beloppProcent').value= '"+ invoice.amount +"';" +
              "var hit = -1;"+
          "for (var i=1; i<document.getElementById('tillkontoIndex').length;i++) {"+
                  "if(document.getElementById('tillkontoIndex').options[i].text.replace(\/ \/g, '').indexOf('"+ invoice.account +"') != -1) {"+
                      "document.getElementById('tillkontoIndex').selectedIndex=i;"+
                      "hit = i;"+
                      "break;"+
                  "}"+
              "}"+
              "if (hit == -1) {"+
                  "document.getElementById('annan_mottagare').style.display = '';"+
                  "if ('"+ invoice.type +"' == 'BG') { document.getElementById('BGKonto').checked='checked'; }"+
                  "if ('"+ invoice.type +"' == 'PG') { document.getElementById('PGKonto').checked='checked'; }"+
                  "document.getElementById('kontonummer').value = '"+ invoice.account +"';"+
              "}"
    });
}

function handleLansforsakringar(invoice, tab) {
    chrome.tabs.executeScript(tab.id, {
        code: "document.getElementById('paymentId').value= '"+ invoice.reference +"';" +
              "document.getElementById('payeeInput').value= '" + invoice.account + "';" +
              "document.getElementById('amount').value= '" + invoice.amount + "';"
    });
}

function handleNordea(invoice, tab) {
    chrome.tabs.executeScript(tab.id, {
        code: "if ('"+ invoice.reference +"' != '') document.getElementById('paymentmessage').value= '"+ invoice.reference +"';" +
              "if ('"+ invoice.amount +"' != '') document.getElementById('paymentamount').value= '"+ invoice.amount +"';" +
              "if ('"+ invoice.account +"' != '') document.getElementById('paymenttoaccount').value= '"+ invoice.account +"';" +
			  "var radioValue = '0'; if ('" + invoice.type + "' == 'BG') { radioValue = '1'; }; var radios = document.getElementsByTagName('input'); for (var i=0; i<radios.length; i++) { var input = radios[i]; if (input.type == 'radio' && input.name == 'subtype_radio') { if (input.value == radioValue) { input.checked = true; } else { input.checked = false; }}};"
    });
}

function handleHandelsbanken(invoice, tab) {
    chrome.tabs.executeScript(tab.id, {
        allFrames: true,
        code: "if ('"+ invoice.amount +"' != '') document.getElementById('TRANSAKTIONSBELOPP').value= '"+ invoice.amount +"';" +
              "if ('"+ invoice.account +"' != '') document.getElementById('KTONR_BETMOTT').value= '"+ invoice.account +"';" +
              "if ('"+ invoice.reference +"' != '') document.getElementsByName('FRI_TEXT0')[0].value = '"+ invoice.reference +"';"
    });
}

function handleSeb(invoice, tab) {
    chrome.tabs.executeScript(tab.id, {
        allFrames: true,
        code: "" +
        "if ('" + invoice.account + "' != '') { if ('" + invoice.type + "' == 'BG') { document.getElementById('IKPMaster_MainPlaceHolder_A3').value='" + invoice.account + "'; document.getElementById('IKPMaster_MainPlaceHolder_BG').checked='checked'; } }" +
        "if ('" + invoice.account + "' != '') { if ('" + invoice.type + "' == 'PG') { document.getElementById('IKPMaster_MainPlaceHolder_A11').value='" + invoice.account + "'; document.getElementById('IKPMaster_MainPlaceHolder_PG').checked='checked'; } }" +
        "if ('" + invoice.amount + "' != '') document.getElementById('IKPMaster_MainPlaceHolder_A4').value='" + invoice.amount + "';" +
        "if ('" + invoice.reference + "' != '') document.getElementById('IKPMaster_MainPlaceHolder_A7').value='" + invoice.reference + "';" +
	"document.getElementById('IKPMaster_MainPlaceHolder_OCR').checked='checked';"	
    });
}

function handleNordnet(invoice, tab) {
    chrome.tabs.executeScript(tab.id, {
	code: "" +
	"if ('" + invoice.account + "' != '') document.getElementById('kontonummer').value='" + invoice.account + "';" +
	"if ('" + invoice.reference + "' != '') document.getElementById('ocr').value='" + invoice.reference + "';" +
	"if ('" + invoice.amount + "' != '') document.getElementById('belopp').value='" + invoice.amount + "';"
    });
}

function handleIca(invoice, tab) {
    chrome.tabs.executeScript(tab.id, {
	code: "" +
	"if ('" + invoice.account + "' != '' && '" + invoice.type + "' == 'BG') document.getElementById('recipientaccounttype').value='1' ;" +
	"if ('" + invoice.account + "' != '' && '" + invoice.type + "' == 'PG') document.getElementById('recipientaccounttype').value='2' ;" +
	"if ('" + invoice.account + "' != '') document.getElementById('newrecipientaccountid').value='" + invoice.account + "';" +
	"if ('" + invoice.reference + "' != '') document.getElementById('paymentreftype').value='1';" +
	"if ('" + invoice.reference + "' != '') document.getElementsByClassName('paymentref')[0].value='" + invoice.reference + "';" +
	"if ('" + invoice.amount + "' != '') document.getElementById('paymentamount').value='" + invoice.amount + "';"
    });
}

function handleSparbankenOresund(invoice, tab) {
    chrome.tabs.executeScript(tab.id, {
	code: "" +
        "if ('" + invoice.type + "' != '') { if ('" + invoice.type + "' == 'PG') {  document.getElementById('ctl00_SPWebPartManager1_g_3d9ec7a0_5765_4aaa_a9f4_2a505ae21b4e_RadBtnPostGiroID').checked='checked'; } } " +
        "if ('" + invoice.type + "' != '') { if ('" + invoice.type + "' == 'BG') {  document.getElementById('ctl00_SPWebPartManager1_g_3d9ec7a0_5765_4aaa_a9f4_2a505ae21b4e_RadBtnBankGiroID').checked='checked'; } } " +
	"if ('" + invoice.account + "' != '') document.getElementById('ctl00_SPWebPartManager1_g_3d9ec7a0_5765_4aaa_a9f4_2a505ae21b4e_txtBoxGiroNoID').value='" + invoice.account + "';" +
	"if ('" + invoice.reference + "' != '') document.getElementById('ctl00_SPWebPartManager1_g_3d9ec7a0_5765_4aaa_a9f4_2a505ae21b4e_txtBoxReferenceNoID').value = '" + invoice.reference + "';" +
	"if ('" + invoice.amount + "' != '') document.getElementById('ctl00_SPWebPartManager1_g_3d9ec7a0_5765_4aaa_a9f4_2a505ae21b4e_txtBoxAmountID').value='" + invoice.amount + "';"
    });
}

