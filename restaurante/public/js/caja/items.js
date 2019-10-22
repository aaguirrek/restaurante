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
		frappe.call({
			method: "restaurante.caja.sync",
			args: {
				customer:$('input[data-fieldname="customer"]').val(),
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
	}
}