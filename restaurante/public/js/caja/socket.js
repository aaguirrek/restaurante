this.doctype = "Restaurant Table Temp";
frappe.realtime.on('list_update', data => {
	const { doctype, name } = data;
	if (doctype !== this.doctype )
	{
		return;
    }
    
    frappe.db.exists("Restaurant Table Temp", name)
    .then(exists => {
        if(exists){
            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "Restaurant Table Temp",
                    name: name
                },
                async: true,
                callback: function(r) { 
                    
                    if( $('select[data-fieldname="mesarestaurant"]').val() == r.message.mesa ){
                        let itemsL=0;
                        for(var wq in platos){
                            itemsL++;
                        }
                        /*$("#total_total").text("S/.0.00");
                        $("#total_igv").text("S/.0.00");
                        $("#total_subtotal").text("S/.0.00");
                        $("#menu_items").html('');
                        platos = {};
                        extras = {};
                        */
                       
                        fg.set_value( r.message.customer ).then(function(e){
                            let item_values = {};
                            let w = itemsL;
                            let mesi = r.message.items.length ;
                            
                            for( w ; w < mesi ; w++ ){
                               
                                item_values = {};
                                var ld= r.message.items[w];
                                ld.extra = JSON.parse(ld.extra);
                                item_values.itemname = ld.item;
                                item_values.comentario = ld.extra.comentario;
                                item_values.qty = ld.qty;
                                item_values.rate = ld.rate;
                                item_values.servido = ld.servido;
                                item_values.imprimido = ld.imprimido;
                                let q=0;
                                while(ld.extra["item"+q] !== undefined){
                                    if(extras=== undefined)
                                    {
                                        extras={};
                                    }
                                    extras["item"+q] = ld.extra["item"+q];
                                    item_values["item"+q] = ld.extra["item"+q].value;
                                    q++;
                                }
                                add_item(item_values, "si");
                            }
                        });
                    }else{
                                           
                    }
                
                }
                
            })
        }else{
            if( $('select[data-fieldname="mesarestaurant"]').val() == name.replace("Restemp-", "") ){

                platos = {};
                extras = {};
                $("#total_total").text("S/.0.00");
                $("#total_igv").text("S/.0.00");
                $("#total_subtotal").text("S/.0.00");
                $("#menu_items").html('');
    
            }
        }
        frappe.call({
            method:"frappe.client.get_list",
            args:{"doctype": "Restaurant Table Temp","order_by":"name asc", "fields":["mesa","name"] },
            async: true,
            callback: function(r) {	
                ocupada = {};
                $( ".mesa-disponible" ).removeClass('mesa-ocupada');
                for(var tab in r.message ){
                    ocupada = r.message[tab];
                    mesas[ocupada.mesa] = ocupada.name;
                    if($("#verMesasOcupadas").length){
                        if(! $( "#mesa-"+ocupada.mesa ).hasClass('mesa-ocupada')){
                            $( "#mesa-"+ocupada.mesa ).addClass('mesa-ocupada');
                        }
                    }
                    
                }
            }
        }); 
    }).catch(function(e){
        if( $('select[data-fieldname="mesarestaurant"]').val() == name.replace("Restemp-", "") ){

            platos = {};
            extras = {};
            $("#total_total").text("S/.0.00");
            $("#total_igv").text("S/.0.00");
            $("#total_subtotal").text("S/.0.00");
            $("#menu_items").html('');

        }

    })	
});


frappe.realtime.on('list_update', data => {
    
    const { doctype, name } = data;
    
	if (doctype !== "Restaurant Menu" )
	{
		return;
    }
    
    var restaurantMenu = null;
    
	frappe.call({
        method:"restaurante.caja_y_mozo.page.caja_del_restaurante.caja_del_restaurante.get_menu", 
        async:true,
        freeze:1,
        args:{restaurante:"greena" }, 
        callback:function(res){
            restaurantMenu =res.message 
            $("#carta_activa_del_menu").html( frappe.render_template("menu_item", { restaurantMenu:restaurantMenu } ) );
        }});
    
});

