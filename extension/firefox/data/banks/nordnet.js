var onMessage = function(invoice) {
	if(window.closed) { postMessage({ name: "closed" }); return; }

	if(invoice.account != "") { try { document.getElementById("kontonummer").value = invoice.account; } catch(e) {} }
	if(invoice.referenc != "") { try { document.getElementById("belopp").value = invoice.reference; } catch(e) {} }
	if(invoice.amount != "") { try { document.getElementById("paymentamount").value = invoice.amount; } catch(e) {} }
};
