var doc_temporal = {
    save: (antid= "Null", imprimido=0 ) => {
        let elementos2 = [];
    	for (var o in platos){
    	    var imprimi = 0;
    	    if ( platos[o].imprimido !== undefined ){
    	        imprimi = platos[o].imprimido;
    	    }
    	    if( o == antid ){
                elementos2.push({
              	    "name": platos[o].itemname,
        	        "qty": platos[o].qty,
        	        "rate": platos[o].rate,
        		    "extras": extra[o],
        		    "servido": 1,
        		    "tipo": "Directo",
                    "imprimido":imprimi
                });
		    }else{
                elementos2.push({
                  	"name": platos[o].itemname,
                    "qty": platos[o].qty,
                    "rate": platos[o].rate,
                    "extras": extra[o],
                    "servido": 0,
                    "tipo": "Directo",
        		    "imprimido":imprimi
                });
		    }
    	}
    	frappe.call({
    		method: "restaurante.caja.saveTemporal",
    		args: {
    			customer:$('input[data-fieldname="customer"]').val(),
    			restaurant_table:fmesa.get_value(),
    			total: parseFloat( $("#total_total").text().replace("S/.", "") ),
    			items: elementos2,
    			igv: parseFloat( $("#total_igv").text().replace("S/.", "") ),
    			subtotal: parseFloat( $("#total_subtotal").text().replace("S/.", "") )
    		},
    		async: true,
    		callback: function(r) {},
    	});
    },
    print: () =>{
    	exportar_pdf("Comanda");
    	
	},
	precuenta: () =>{
    	exportar_pdf("Pre Cuenta");
    	
	}
};
function myFunctionAfterPrint() {
    frappe.confirm('La Comanda se ha enviado a cocina?',
    () => {
    	for (var o in platos){
    	    platos[o].imprimido = 1;
    	}
    	doc_temporal.save();
        $(".printable").removeClass("printable");
    }, () => {})
}


function exportar_pdf(tipo){ 
	var message={}
	var rep ={};
	let total = $("#total_total").text();
	message.total = total.replace("S/.","")
	message.items = [];
	for(var it in platos){
		if(platos[it].imprimido== 0 || tipo == "Pre Cuenta"){
			message.items.push({
				item_name: platos[it].itemname,
				qty: platos[it].qty,
				extras:platos[it].elements,
				rate:platos[it].rate,
				comentario:platos[it].comentario
			});
			platos[it].imprimido = 1;
		}
	}
	if(tipo == "Pre Cuenta"){
		frappe.call({
			method: "frappe.client.get_list",
			args: {
			  doctype: "Sales Invoice",
			  filters: {"restaurant_table":fmesa.get_value(), "docstatus":0 }
			},
			async: false,
			callback: function(r) {
				if(r.message.length  > 0 ){
					message.name = r.message[0].name;
				}
			}
		});
	}
	rep.message = message;
	rep.web_seting = frappe.boot.website_settings;
	rep.sunat = sunat_setup;
	rep.tipo = tipo;
	rep.mesa =fmesa.get_value();
	console.log(rep);
	printer.emit("print-socket",JSON.stringify(rep));
	
	cur_doc.sync();
}