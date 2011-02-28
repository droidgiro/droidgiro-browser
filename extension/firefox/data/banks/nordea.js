var onMessage = function(invoice) {
	if(window.closed) { postMessage({ name: "closed" }); return; }

	if(invoice.account != "") { try { document.getElementById("paymenttoaccount").value = invoice.account; } catch(e) {} }
	if(invoice.referenc != "") { try { document.getElementById("paymentmessage").value = invoice.reference; } catch(e) {} }
	if(invoice.amount != "") { try { document.getElementById("paymentamount").value = invoice.amount; } catch(e) {} }

	var radioValue = "0";
	if(invoice.type == "BG") { radioValue = "1"; };

	var radios = document.getElementsByTagName("input");
	for(var i=0; i<radios.length; i++) {
		var input = radios[i];
		if(input.type == "radio" && input.name == "subtype_radio") {
			if(input.value == radioValue) {
				input.checked = true;
			} else {
				input.checked = false;
			}
		}
	};
};
