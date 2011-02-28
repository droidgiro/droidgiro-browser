var onMessage = function(invoice) {
	if(window.closed) { postMessage({ name: "closed" }); return; }

	if(invoice.type == "PG") { try { document.getElementById("ctl00_SPWebPartManager1_g_3d9ec7a0_5765_4aaa_a9f4_2a505ae21b4e_RadBtnPostGiroID").checked = "checked"; } catch(e) {} }
   if(invoice.type == "BG") { try { document.getElementById("ctl00_SPWebPartManager1_g_3d9ec7a0_5765_4aaa_a9f4_2a505ae21b4e_RadBtnBankGiroID").checked = "checked"; } catch(e) {} }

	if(invoice.account != "") { try { document.getElementById("ctl00_SPWebPartManager1_g_3d9ec7a0_5765_4aaa_a9f4_2a505ae21b4e_txtBoxGiroNoID").value = invoice.account; } catch(e) {} }
	if(invoice.referenc != "") { try { document.getElementById("ctl00_SPWebPartManager1_g_3d9ec7a0_5765_4aaa_a9f4_2a505ae21b4e_txtBoxReferenceNoID").value = invoice.reference; } catch(e) {} }
	if(invoice.amount != "") { try { document.getElementById("ctl00_SPWebPartManager1_g_3d9ec7a0_5765_4aaa_a9f4_2a505ae21b4e_txtBoxAmountID").value = invoice.amount; } catch(e) {} }
};
