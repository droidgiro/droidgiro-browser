var baseUrl = 'http://cloud.droidgiro.se';
var registerUrl = baseUrl + '/register';

var socket = null;

function initializeBrowserChannel() {
	console.log('initializeBrowserChannel');

	if(socket != null) {
		console.log('Closing socket.');
		//socket.close();
		// This is a workaround since socket.close() does not work from a extension.
		sendRequest('reload', 'Reloading...');
		location.reload(true);

		return;
	}

	var req = new XMLHttpRequest();
	req.open("GET", registerUrl, true);
	req.onreadystatechange = function() {
		if(this.readyState == 4) {
			if(req.status == 200) {
				channelData = JSON.parse(req.responseText);
				console.log("token: " + channelData.token);
				console.log("pin: " + channelData.pin);

				postMessage({ action: 'pin', data: channelData.pin });

				channel = new goog.appengine.Channel(channelData.token);
				console.log('next');
				try { socket = channel.open(); } catch(e) { console.log(e); }
				console.log('done');
				socket.onopen = function() {
					console.log('Browser channel initialized');
				}
				socket.onclose = function() {
					console.log('Browser channel closed');
				}
				socket.onerror = function(error) {
					if (error.code == 401) {  // token expiry
						console.log('Browser channel token expired - reconnecting');
					} else {
						console.log('Browser channel error');
						// Automatically reconnects
					}
				}
				socket.onmessage = onChannelMessage;
			} else {
				console.log('registered returned: ' + req.status);
			}
		} else {
			console.log('this.readyState = ' + this.readyState);
		}
	}
	req.send(null);
}

function onChannelMessage(evt) {
	console.log(evt);
	var o = JSON.parse(evt.data);
	console.log(o);

	postMessage({ action: o.type, data: o.payload });
}

var onMessage = function(message) {
	switch(message.action) {
		case "generate_pin":
			initializeBrowserChannel();
		break;
	}
};
