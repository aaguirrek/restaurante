var cur_doc ={
	sync: () => {
		var elementos=[];
		for (var o in platos){
	      elementos.push({
	      	"name": platos[o].itemname,
		      "qty": platos[o].qty,
		      "uom": "Números",
		      "rate": platos[o].rate
	      });
		}
		let cliente="Anonimo";
		if( fg.get_value() != ""){
			cliente = fg.get_value();
		}
		frappe.call({
			method: "restaurante.caja.sync",
			args: {
				customer:cliente,
				restaurant_table:fmesa.get_value(),
				items:elementos
			},
			async: false,
			callback: function(r) {
				if(r.message == "no encontrado"){
					$("#"+values.id+"_href").hide()
				}
			},
		});
	},
	synced: () => {
		var elementos=[];
		for (var o in platos){
	      elementos.push({
	      	"name": platos[o].itemname,
		      "qty": platos[o].qty,
		      "uom": "Números",
		      "rate": platos[o].rate
	      });
		}
		let cliente="Anonimo";
		if( fg.get_value() !== ""){
			cliente = fg.get_value();
		}
		frappe.call({
			method: "restaurante.caja.sync",
			args: {
				customer:cliente,
				restaurant_table:fmesa.get_value(),
				items:elementos
			},
			async: false,
			callback: function(r) {
				if(r.message == "no encontrado"){
					$("#"+values.id+"_href").hide()
				}
			},
		});
	},
	pendientes: () => {
		var pagado=0;
		var total=parseFloat( $("#total_total").text().replace("S/.", ""));
		var pendiente = 0;
		
		for (var i in modosPagos.items ){
			pagado += cur_dialog.get_value(modosPagos.items[i].metodo_de_pago);
		}
		pendiente = total - pagado - cur_dialog.get_value("descuento");
		cur_dialog.set_value("pendiente",pendiente);
		return pendiente;
	}
}