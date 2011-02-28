var onMessage = function(invoice) {
	if(window.closed) { postMessage({ name: "closed" }); return; }

	if(invoice.account != "") {
		if(invoice.type == "BG") {
			try { document.getElementById("IKPMaster_MainPlaceHolder_A3").value = invoice.account; } catch(e) {}
			try { document.getElementById("IKPMaster_MainPlaceHolder_BG").checked="checked"; } catch(e) {}
		}
		if(invoice.type == "PG") {
			try { document.getElementById("IKPMaster_MainPlaceHolder_A11").value = invoice.account; } catch(e) {}
			try { document.getElementById("IKPMaster_MainPlaceHolder_PG").checked="checked"; } catch(e) {}
		}
	}

	if(invoice.referenc != "") { try { document.getElementById("IKPMaster_MainPlaceHolder_A7").value = invoice.reference; } catch(e) {} }
	if(invoice.amount != "") { try { document.getElementById("IKPMaster_MainPlaceHolder_A4").value = invoice.amount; } catch(e) {} }
};
