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
		if( $('input[data-fieldname="customer"]').val() != ""){
			cliente = $('input[data-fieldname="customer"]').val();
		}
		frappe.call({
			method: "restaurante.caja.sync",
			args: {
				customer:cliente,
				restaurant_table: $('select[data-fieldname="mesarestaurant"]').val(),
				items:elementos
			},
			async: true,
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
		if( $('input[data-fieldname="customer"]').val() != ""){
			cliente = $('input[data-fieldname="customer"]').val();
		}
		frappe.call({
			method: "restaurante.caja.sync",
			args: {
				customer:cliente,
				restaurant_table: $('select[data-fieldname="mesarestaurant"]').val(),
				items:elementos
			},
			async: false,
			callback: function(r) {
				if(r.message == "no encontrado"){
					$("#"+values.id+"_href").hide()
				}
			},
		});
	}
}