const self = require("self");
const widgets = require("widget");
const panels = require("panel");
const tabs = require("tabs");
const pageWorkers = require("page-worker");
const notifications = require("notifications");

const bankWorker = require("bank-worker");

var panelVisible = false;

var pageWorker = pageWorkers.Page({
	contentURL: self.data.url("blank.html"), // Needed to make channel.js happy
	contentScriptFile: [
		self.data.url("libs/channel.js"),
		self.data.url("background.js")
	],
	contentScriptWhen: "ready",
	onMessage: function(message) {
		switch(message.action) {
			case "pin":
				widget.panel.postMessage(message);
			break;
			case "register":
				if(panelVisible) {
					widget.panel.postMessage(message);
				} else {
					notifications.notify({
						title: "DroidGiro",
						text: "Redo att skanna",
						iconURL: self.data.url("images/icon.png")
					});
				}
			break;
			case "invoice":
				var found = bankWorker.postMessage(message.data);

				if(found < 1) {
					notifications.notify({
						title: "OCR",
						text: message.data.reference
					});
				}
			break;
			default:
				console.log('worker: ' + JSON.stringify(message));
			break;
		}
	}
});

var widget = widgets.Widget({
	label: "Activate DroidGiro",
	contentURL: self.data.url("images/icon.png"),
	panel: panels.Panel({
		contentURL: self.data.url("popup.html"),
		contentScriptFile: [
			self.data.url("libs/jquery-1.5.1.min.js"),
			self.data.url("libs/ICanHaz.min.js"),
			self.data.url("popup.js")
		],
		contentScriptWhen: "ready",
		onShow: function() { panelVisible = true; },
		onHide: function() { panelVisible = false; },
		onMessage: function(message) {
			switch(message.action) {
				case "generate_pin":
					pageWorker.postMessage(message);
				break;
				default:
					console.log('panel: ' + JSON.stringify(message));
				break;
			}
		}
	})
});
