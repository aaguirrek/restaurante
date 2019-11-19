/*frappe.realtime.on('list_update', data => {
	const { doctype, name } = data;
    return alert("doctype: "+doctype+" , name: "+ name);
	if (doctype !== this.doctype) return;

	// filters to get only the doc with this name
	const call_args = this.get_call_args();
	call_args.args.filters.push([this.doctype, 'name', '=', name]);
	call_args.args.start = 0;

	frappe.call(call_args)
		.then(({ message }) => {
			if (!message) return;
			const data = frappe.utils.dict(message.keys, message.values);
			if (!(data && data.length)) {
				// this doc was changed and should not be visible
				// in the listview according to filters applied
				// let's remove it manually
				this.data = this.data.filter(d => d.name !== name);
				this.render();
				return;
			}

			const datum = data[0];
			const index = this.data.findIndex(d => d.name === datum.name);

			if (index === -1) {
				// append new data
				this.data.push(datum);
			} else {
				// update this data in place
				this.data[index] = datum;
			}

			this.data.sort((a, b) => {
				const a_value = a[this.sort_by] || '';
				const b_value = b[this.sort_by] || '';

				let return_value = 0;
				if (a_value > b_value) {
					return_value = 1;
				}

				if (b_value > a_value) {
					return_value = -1;
				}

				if (this.sort_order === 'desc') {
					return_value = -return_value;
				}
				return return_value;
			});
			this.toggle_result_area();
			this.render();
		});
});*/

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
    			restaurant_table: $('select[data-fieldname="mesarestaurant"]').val(),
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
    	exportar_pdf();
    	
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


  function exportar_pdf(){ 
  	$("#menu_items").prepend('\
		<div id="hora_fecha_oculta" style="\
		    width: 100%;\
		    text-align: center;\
		">19/10/12 03:05:03\
		</div>');
  	$(".vdel").hide();
  	$(".vminus").hide();
  	$(".layout:not(.printable)").hide();
  	$(".vplus").hide();
  	$(".vlito").hide();
  	$(".vrate").hide();
    $(".vtotal").hide();
    $(".title.col-md-1").hide();
    $(".title.col-md-5").addClass("col-md-10");
    $("#menu_items").addClass("paperSize");
    $(".title.col-md-5").removeClass("col-md-5");
      
    kendo.drawing.drawDOM("#menu_items",{ 
          paperSize: ["74mm","120mm"],
          margin: { top: "2mm", bottom: "2mm" },
          scale: 0.7,
          height: "auto"
    })
    .then(function(group){
        kendo.drawing.pdf.saveAs(group, "comanda.pdf");
        $(".title.col-md-10").addClass("col-md-5");
    	$(".title.col-md-10").removeClass("col-md-10");
        $("#menu_items").removeClass("paperSize");
        $(".title.col-md-1").show();
      	$(".vdel").show();
      	$(".vminus").show();
      	$(".vplus").show();
      	$(".layout:not(.printable)").show();
      	$(".vlito").show();
      	$(".vrate").show();
        $(".vtotal").show();
        $("#hora_fecha_oculta").remove();
        myFunctionAfterPrint();
    });
}