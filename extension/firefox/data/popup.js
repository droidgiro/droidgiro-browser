$(function() {
	$('#generate_pin').click(function() {
		postMessage({ action: 'generate_pin' });

		generate_pin = ich.generate_pin({});
		$('#main').html(generate_pin);
	});
});

var onMessage = function(message) {
	switch(message.action) {
		case "pin":
			var pinList = String(message.data).split("");
			$('#content').html(ich.pin({
				'pin_code_1': pinList[0],
				'pin_code_2': pinList[1],
				'pin_code_3': pinList[2],
				'pin_code_4': pinList[3]
			}));
		break;
		case "register":
			$('#content').html(ich.connected({}));
		break;
	}
};
