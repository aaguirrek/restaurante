frappe.provide('frappe.form_dict');
frappe.provide('frappe.pages');
frappe.provide('frappe.views');
frappe.provide('sample_register');
var toppings=null;
var page=null;
var sunat_setup=null;
let w=null;
var fg=null;
var extras = {};
var extra = {};
var platos = {};
var inicial = {};
var fmesa = null;
var ffilter_item = null;
var fgroup = null;
var all_tables = {};
var tablesTotales=[];
frappe.pages['caja-del-restaurante'].on_page_load = function(wrapper) {
	w = wrapper;
	 page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Caja del Restaurante',
		single_column: false
	})
	frappe.call({
		method: "frappe.client.get",
		args: {
			doctype: "Setup"
		},
		async: true,
		callback: function(r) {
			sunat_setup = r.message;
		}
	})
	
	frappe.call({
		method:"frappe.client.get_list",
		args:{"doctype": "Restaurant Table","order_by":"name asc"},
		async: false,
		callback: function(r) {	all_tables = r.message }
	})
	tablesTotales=[];
	for(var k in all_tables ){
		tablesTotales.push(all_tables[k].name);
	}
	frappe.call({
		method: "frappe.client.get",
		args: {
			doctype: "Setup"
		},
		async: true,
		callback: function(r) {
			sunat_setup = r.message;
		}
	})
	var restaurantMenu = null;
	frappe.call({async:false,method:"restaurante.restaurante.page.caja_del_restaurante.caja_del_restaurante.get_menu", args:{restaurante:"greena" }, callback:function(res){ restaurantMenu =res.message }});
	frappe.db.get_doc("Complementos del Plato").then(doc => {
		toppings = doc
	})
	page.wrapperTemplate = page.wrapper.html(frappe.render_template("caja_del_restaurante", { restaurantMenu:restaurantMenu } ) )
	fmesa = frappe.ui.form.make_control({
		parent: page.wrapper.find(".mesa"),
		df: {
			fieldtype: "Select",
			options: tablesTotales,
			fieldname: "mesarestaurant",
			placeholder: "Mesa número"
		},
		change: function(frm){
			change_mesa( $('select[data-fieldname="mesarestaurant"]').val() );
		},
		render_input: true
	});
	fmesa.make();

	fg = frappe.ui.form.make_control({
		parent: page.wrapper.find(".customer"),
		df: {
			fieldtype: "Link",
			options: "Customer",
			fieldname: "customer",
			placeholder: "Cliente"
		},
		render_input: true
	});
	fg.make();
	

	ffilter_item = frappe.ui.form.make_control({
		parent: page.wrapper.find(".filter"),
		df: {
			fieldtype: "Link",
			options: "Item",
			fieldname: "items",
			placeholder: "Insertar Producto",
			hidden:1
		},
		render_input: true
	});
	ffilter_item.make();

	
	ffilter_item = frappe.ui.form.make_control({
		parent: page.wrapper.find(".filtrar"),
		df: {
			fieldtype: "Data",
			fieldname: "filtros",
			placeholder: "Filtrar los Productos"
		},
		change:function(frm){
			$('input[data-fieldname="filtros"]').keyup(function(){
				$(".item").show();
				$(".item > span:not(:contains("+$('input[data-fieldname="filtros"]').val()+"))").parent().hide();
			});
		},
		render_input: true
	});
	ffilter_item.make();
	fgroup = frappe.ui.form.make_control({
		parent: page.wrapper.find(".group"),
		df: {
			fieldtype: "Link",
			options: "Item Group",
			fieldname: "groups",
			placeholder: "Filtrar por",
			hidden:1
		},
		render_input: true
	});
	fgroup.make();
	
	change_mesa();

}
function change_mesa(mesa=""){
	
	$("#total_total").text("S/.0.00");
	$("#total_igv").text("S/.0.00");
	$("#total_subtotal").text("S/.0.00");
	$("#menu_items").html('');
	platos = {};
	extras = {};
	
	frappe.call({
		method: "restaurante.caja.get_init",
		args: {
			restaurant_table: mesa
		},
		async: true,
		callback: function(r) {
			inicial = r.message;
			console.log(inicial);
			$("#Titulo").html("Mesa - "+ inicial.mesa.name);
			fmesa.set_value(inicial.mesa.name).then(function(e){
				if(inicial.estado == "sucess"){
					fg.set_value( inicial.data.customer ).then(function(e){
						let item_values = {}
						for(var w in inicial.data.items){
							item_values = {};
							var ld= inicial.data.items[w];
							ld.extra = JSON.parse(ld.extra)
							item_values.itemname = ld.item;
							item_values.comentario = ld.extra.comentario;
							item_values.qty = ld.qty;
							item_values.rate = ld.rate;
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
							add_item(item_values);
						}
					});
					
	
				}else{
					fg.set_value("Anonimo");
				}
			});
			
		}
	});
}
function sendItem (name, rate){
	name = window.atob(name)
	let topp=null
	let complementos=[];
	complementos.push({
		label:"Cantidad",
		fieldname:"qty",
		fieldtype:"Int",
		default: 1
	});
	extras={};
	for (let i in toppings.complemento ){
		topp = {
			label: toppings.complemento[i].nombre,
			filters : {
				"item_group":toppings.complemento[i].item
			},
			fieldname: "item"+i,
			fieldtype: 'Link',
			options: "Item" ,
			
			default:toppings.complemento[i].default
			
		};
		complementos.push(topp);
		extras["item"+i] = {
			fieldname: "item"+i,
			fieldtype: 'Link',
			options: "Item" ,
			default:toppings.complemento[i].default
		};
	}
	complementos.push({
		label:"Nombre del producto",
		fieldname:"itemname",
		fieldtype:"Data",
		hidden:1,
		default: name
	});
	complementos.push({
		label:"Precio del Producto",
		fieldname:"rate",
		fieldtype:"Currency",
		hidden:1,
		default: rate
	});
	complementos.push({
		label:"Comentario",
		fieldname:"comentario",
		fieldtype:"Text",

	});
	extras.itemname = name;
	extras.rate = rate
	extras.comentario = "";
	
	let d = new frappe.ui.Dialog({
		title: name,
		fields: complementos,
		primary_action_label: 'Enviar',
		primary_action(values) {
			add_item(values)
			
			d.hide();
		}
	});
	
	d.show();
}
function add_item(values){
	
	let i = 0
	values.elements=[]
	let idstring = ""
	while(values["item"+i] !== undefined ){
		values.elements.push(values["item"+i]);
		idstring += values["item"+i]+"|";
		extras["item"+i].value = values["item"+i];
		i++;
	}
	if(values.comentario!== undefined){
		extras.comentario = values.comentario;
	}else{
		extras.comentario = "";
	}
	
	idstring += values.comentario
	let id = window.btoa(values.itemname+"|"+idstring);
	id = id.replace(/=/g, "_");
	values.id=id
	
	
	if( $("#"+id+"_id" ).length ){
		let qty = (parseInt( $("#"+id+"_qty").text() ) + parseInt( values.qty ) );
		$("#"+id+"_qty").text( qty );
		$("#"+id+"_rate").text( qty * parseFloat(values.rate) );
		values.qty = qty;
		
	}else{
		let template = frappe.render_template("item", { values:values } );
		$("#menu_items").append(template);
		
	}
	
	let itotal=parseFloat( $("#total_total").text().replace("S/.", "") );
	let iitem = parseFloat(values.rate);
	let iqty = parseInt(values.qty);
	itotal = itotal +  (iitem * iqty );
	let iigv = parseFloat( sunat_setup.igv );
	let itotaligv = parseFloat( parseFloat( (itotal * iigv) / (100 + iigv) ).toFixed(2) );
	$("#total_total").text( "S/." +  itotal );
	$("#total_igv").text(  "S/." + itotaligv );
	$("#total_subtotal").text(  "S/." + parseFloat(itotal - itotaligv).toFixed(2) );
	values.qty = iqty;
	platos[values.id] = values;
	extra[values.id] = extras;

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
	})
	
	
	let elementos2 = [];
	for (var o in platos){
      elementos2.push({
      	"name": platos[o].itemname,
	      "qty": platos[o].qty,
	      "rate": platos[o].rate,
		  "extras": extra[o],
		  "servido": 0,
		  "tipo": "Directo"
      })
	}
	
	frappe.call({
		method: "restaurante.caja.saveTemporal",
		args: {
			customer:$('input[data-fieldname="customer"]').val(),
			restaurant_table: $('select[data-fieldname="mesarestaurant"]').val(),
			total: parseFloat( $("#total_total").text().replace("S/.", "") ),
			items: elementos2,
			igv: parseFloat( $("#total_igv").text().replace("S/.", "") ),
			subtotal: parseFloat( $("#total_subtotal").text().replace("S/.", "") ),
			
		},
		async: false,
		callback: function(r) {},
	})
	
	
	let tipo = ""
	frappe.call({
		method: "restaurante.caja.ckeck_ingredientes_item",
		args: {
			id: "Ingredientes-"+values.itemname
		},
		async: false,
		callback: function(r) {
			//console.log(r.message)
			if(r.message == "no encontrado"){
				$("#"+values.id+"_href").hide()
			}
		},
	})
	
}
function plato_preparado(name,el){
	id = el.id
	id = id.replace("_href","")
	let element = id
	//console.log(id)
	id = id.replace(/_/g,"=")
	id = window.atob( id )
	let complementos=[];
	let ingredientes=null
	frappe.call({
		method: "frappe.client.get",
		args: {
			doctype: "Ingredientes",
			name: "Ingredientes-"+name
		},
		async: false,
		callback: function(r) {
			ingredientes = r.message
		}
	})
	for ( var i in ingredientes.items ){
		let item = ingredientes.items[i]
		complementos.push({
			label: item.item_name+" en "+item.uom,
			fieldname: item.item,
			fieldtype:"Float",
			default: item.qty
		})
	}
	
	let d = new frappe.ui.Dialog({
		title: name,
		fields: complementos,
		primary_action_label: 'Enviar',
		primary_action(values) {
			plato_servido(values , id)
			d.hide();
		}
	});
	
	d.show();
}
function plato_servido(values, iditem ){
	cliente = "Anonimo"
	let data=[]
	let antid = window.btoa(iditem)
	antid = antid.replace(/=/g, "_")
	let unique = new Date().getTime()
	let newid = iditem+"|newunique: "+unique
	newid = window.btoa(newid)
	newid = newid.replace(/=/g, "_")
	if($("input[data-fieldname=customer]").val() != ""){
		cliente = $("input[data-fieldname=customer]").val()
	}
	
	for( let i in values ){
		data.push({
			item:i,
			qty:values[i]
		})
	}
	
	//console.log(data)
	frappe.call({
		async:false,
		method:"restaurante.restaurante.page.caja_del_restaurante.caja_del_restaurante.set_plato",
		args:{
			data:data,
			customer: cliente
		},
		callback:function(r){
			res =r.message
			if(res.exc_type == "DoesNotExistError"){
				frappe.msgprint("Se ha registrado el uso de los ingredientes")
			}
			$("#"+antid+"_id").attr("id",newid+"_id")
			$("#"+antid+"_rate").attr("id",newid+"_rate")
			$("#"+antid+"_qty").attr("id",newid+"_qty")
			$("#"+antid+"_href i").attr("style","color:#dcdcdc;")
			$("#"+antid+"_href").attr("onclick","")
			$("#"+antid+"_href").attr("id",newid+"_href")
		}
	});
}
function pagarTodo(){
	let complementos = []
	let modosPagos = null
	frappe.call({
		method: "frappe.client.get",
		args: {
			doctype: "Modos de pago"
		},
		async: false,
		callback: function(r) {
			modosPagos = r.message
		}
	})
	for (var i in modosPagos.items ){
		if(i % 2 == 0 && i!= 0 ){
			complementos.push({
				label:"",
				fieldname:"pagar_section_"+i,
				fieldtype:"Section Break",
			})
		}
		if(modosPagos.items[i].metodo_de_pago == "Efectivo")
		{
			complementos.push({
				label: modosPagos.items[i].metodo_de_pago,
				fieldname:modosPagos.items[i].metodo_de_pago,
				fieldtype:"Currency",
				placeholder:"0.00",
				default: parseFloat( $("#total_total").text().replace("S/.", "") )
			})
		}else{
			complementos.push({
				label: modosPagos.items[i].metodo_de_pago,
				fieldname:modosPagos.items[i].metodo_de_pago,
				fieldtype:"Currency",
				placeholder:"0.00"
			})
		}
		
		if(i % 2 == 0 ){
			complementos.push({
				label:"",
				fieldname:"pagar_column_"+i,
				fieldtype:"Column Break",
			})
		}
	}
	complementos.push({
		label:"Desea Boleta / Factura",
		fieldname:"pagar_section_break_1",
		fieldtype:"Section Break",
	})
	complementos.push({
			label:"Tipo de Comprobante",
			fieldname:"tipo_comprobante",
			fieldtype:"Select",
			options:[
				"",
				"Factura",
				"Boleta"
			],
			default:""
		})
		
	let d = new frappe.ui.Dialog({
		title: name,
		fields: complementos,
		primary_action_label: 'Enviar',
		primary_action(values) {
			generarVenta(values)
			d.hide();
		}
	});
	
	d.show();
}
function generarVenta(values){
	var elementos=[];
	
	for (var o in platos){
      elementos.push({
      	"name": platos[o].itemname,
	      "qty": platos[o].qty,
	      "uom": "Números",
	      "rate": platos[o].rate
      });
	}
	var payments= [];
	var tipoComprobante = 0
	if("tipo_comprobante" in values){
		tipoComprobante = 1
	}
	for ( var s in values ){
		if(values[s] !== "tipo_comprobante")
		{
			if(values[s] > 0){
				payments.push({
					amount: values[s],
					mode_of_payment: s
				});
			}
		}
	}
	frappe.call({
		method: "restaurante.caja.validar",
		args: {
			
			customer:$('input[data-fieldname="customer"]').val(),
			restaurant_table: $('select[data-fieldname="mesarestaurant"]').val(),
			items:elementos,
			payments: payments,
			tipoComprobante:tipoComprobante
			
		},
		async: true,
		callback: function(r) {
			if(r.message == "no encontrado"){
				limpiar();
			}
		},
	});
}
function limpiar(){
	frappe.call({
		method: "restaurante.caja.remove_temporal",
		args: {
			restaurant_table: $('select[data-fieldname="mesarestaurant"]').val()
		},
		async: true,
		callback: function(r) {
			$("#total_total").text("S/.0.00");
			$("#total_igv").text("S/.0.00");
			$("#total_subtotal").text("S/.0.00");
			$("#menu_items").html('');
			platos = {};
			extras = {};
		}
	})
}


