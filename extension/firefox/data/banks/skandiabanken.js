var onMessage = function(invoice) {
	if(window.closed) { postMessage({ name: "closed" }); return; }

	if(invoice.account != "") { try { document.getElementById("ctl00_ctl00_ctl00_cphContentWide_cphContentWide_cphMainContent_tbNewRecipient").value = invoice.account; } catch(e) {} }
	if(invoice.referenc != "") { try { document.getElementById("ctl00_ctl00_ctl00_cphContentWide_cphContentWide_cphMainContent_tbReferenceNumber").value = invoice.reference; } catch(e) {} }
	if(invoice.amount != "") { try { document.getElementById("ctl00_ctl00_ctl00_cphContentWide_cphContentWide_cphMainContent_tbAmount").value = invoice.amount; } catch(e) {} }
};
