var onMessage = function(invoice) {
	if(window.closed) { postMessage({ name: "closed" }); return; }

	if(invoice.account != "") { try { document.getElementById("payeeInput").value = invoice.account; } catch(e) {} }
	if(invoice.referenc != "") { try { document.getElementById("paymentId").value = invoice.reference; } catch(e) {} }
	if(invoice.amount != "") { try { document.getElementById("amount").value = invoice.amount; } catch(e) {} }
};
