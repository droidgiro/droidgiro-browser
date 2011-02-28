var onMessage = function(invoice) {
	if(window.closed) { postMessage({ name: "closed" }); return; }

	if(invoice.account != "") { try { document.getElementById("KTONR_BETMOTT").value = invoice.account; } catch(e) {} }
	if(invoice.referenc != "") { try { document.getElementsByName("FRI_TEXT0")[0].value = invoice.reference; } catch(e) {} }
	if(invoice.amount != "") { try { document.getElementById("TRANSAKTIONSBELOPP").value = invoice.amount; } catch(e) {} }
};
