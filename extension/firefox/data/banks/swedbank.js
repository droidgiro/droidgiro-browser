var onMessage = function(invoice) {
	if(window.closed) { postMessage({ name: "closed" }); return; }

	var hit = -1;
	var kontoIngex = document.getElementById("tillkontoIndex");
	for(var i = 1; i < kontoIngex.length; i++) {
		if(kontoIngex.options[i].text.replace(/ /g, "").indexOf(invoice.account) != -1) {
			kontoIngex.selectedIndex = i;
			hit = i;
			break;
		}
	}
	if(hit == -1) {
		try { document.getElementById("annan_mottagare").style.display = ""; } catch(e) {}
		if(invoice.type == "BG") { try { document.getElementById("BGKonto").checked = "checked"; } catch(e) {} }
		if(invoice.type == "PG") { try { document.getElementById("PGKonto").checked = "checked"; } catch(e) {} }
		try { document.getElementById("kontonummer").value = invoice.account; } catch(e) {}
	}

	if(invoice.referenc != "") { try { document.getElementById("meddelandeOCR").value = invoice.reference; } catch(e) {} }
	if(invoice.amount != "") { try { document.getElementById("beloppProcent").value = invoice.amount; } catch(e) {} }
};
