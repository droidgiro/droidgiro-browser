const self = require("self");
const pageMods = require("page-mod");
const tabs = require("tabs");

var workers = new Array();

function watchBank(name, url) {
	pageMods.PageMod({
		include: url,
		contentScriptWhen: 'ready',
		contentScriptFile: self.data.url("banks/" + name + ".js"),
		onAttach: function onAttach(worker) {
			worker.on("message", function(error) {
				if(error.name == "closed") {
					var index = workers.indexOf(this);
					if(index > -1) {
						workers.splice(index, 1);
					}
				}
			});
			workers.push(worker)
		}
	});
}

exports.postMessage = function(message) {
	for(index in workers) {
		workers[index].postMessage(message);
	}
	return workers.length;
};

watchBank("handelsbanken", "https://secure.handelsbanken.se/*");
/**/watchBank("lansforsakringar", "*.lansforsakringar.se");
/**/watchBank("nordea", "*.nordea.se");
/**/watchBank("nordnet", "*.nordnet.se");
watchBank("seb", "*.vv.sebank.se");
/**/watchBank("skandiabanken", "*.skandiabanken.se");
/**/watchBank("sparbanken_oresund", "https://internetbanken.sparbankenoresund.se/*");
watchBank("swedbank", "https://internetbank.swedbank.se/*");
