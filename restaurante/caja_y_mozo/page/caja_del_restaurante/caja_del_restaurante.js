frappe.provide('frappe.form_dict');
frappe.provide('frappe.pages');
frappe.provide('frappe.views');
frappe.provide('sample_register');

var printer = io('https://frappe.cf:4103/');
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
var temptopping={};
var FiltrosTotales=[];
var all_filtros ={};
var directo=0;

var normalize = (function() {
  var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç", 
      to   = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc",
      mapping = {};
 
  for(var i = 0, j = from.length; i < j; i++ )
      mapping[ from.charAt( i ) ] = to.charAt( i );
 
  return function( str ) {
      var ret = [];
      for( var i = 0, j = str.length; i < j; i++ ) {
          var c = str.charAt( i );
          if( mapping.hasOwnProperty( str.charAt( i ) ) )
              ret.push( mapping[ c ] );
          else
              ret.push( c );
      }      
      return ret.join( '' );
  }
 
})();
$.expr[":"].contains = $.expr.createPseudo(function(arg) {
    return function( elem ) {
        return normalize($(elem).text()).toUpperCase().indexOf(normalize(arg.toUpperCase())) >= 0;
    };
});
frappe.pages['caja-del-restaurante'].on_page_load = function(wrapper) {
	w = wrapper;
	 page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Caja del Restaurante',
		single_column: false
	});
	frappe.call({
		method: "frappe.client.get",
		args: {
			doctype: "Setup"
		},
		async: true,
		callback: function(r) {
			sunat_setup = r.message;
			if(r.message.pdf == "TICKET"){
				directo = 1;
			}
		}
	});
	frappe.call({
		method:"frappe.client.get_list",
		args:{"doctype": "Restaurant Table","order_by":"name asc"},
		async: false,
		callback: function(r) {	all_tables = r.message }
	});
	tablesTotales=[];
	for(var k in all_tables ){
		tablesTotales.push(all_tables[k].name);
	}
	
	
	frappe.call({
		method:"frappe.client.get",
		args:{doctype: "Filtros del Plato"},
		async: false,
		callback: function(r) {	all_filtros = r.message.complemento }
	});
	FiltrosTotales=[];
	FiltrosTotales.push("");
	for(var a in all_filtros ){
		FiltrosTotales.push(all_filtros[a].nombre);
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
	});
	var restaurantMenu = null;
	frappe.call({async:false,method:"restaurante.caja_y_mozo.page.caja_del_restaurante.caja_del_restaurante.get_menu", args:{restaurante:"greena" }, callback:function(res){ restaurantMenu =res.message }});
	frappe.db.get_doc("Complementos del Plato").then(doc => {
		toppings = doc
	});
	page.wrapperTemplate = page.wrapper.html(frappe.render_template("caja_del_restaurante", { restaurantMenu:restaurantMenu } ) );
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
		render_input: true
	});//K8LS7fToSmk2
	ffilter_item.make();
	fgroup = frappe.ui.form.make_control({
		parent: page.wrapper.find(".group"),
		df: {
			fieldtype: "Select",
			options: FiltrosTotales,
			fieldname: "groups",
			placeholder: "Filtrar por categoría",
			
		},
		change:function(frm){
				$(".item").show();
				$(".item > span:not(:contains("+$('select[data-fieldname="groups"]').val()+"))").parent().hide();
		},
		render_input: true
	});
	fgroup.make();
	
	change_mesa();
	
    setTimeout(initFiltros,100);
}

function initFiltros(){
	if($('input[data-fieldname="filtros"]').val() !== undefined){
			$('input[data-fieldname="filtros"]').keyup(function(){
				$(".item").show();
				$(".item > span:not(:contains("+$('input[data-fieldname="filtros"]').val()+"))").parent().hide();
			});
	}else{
	    setTimeout(initFiltros,100);
	
	}
}

function change_mesa(mesa=""){
	console.clear();
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
			$("#Titulo").html("Mesa - "+ inicial.mesa.name);
			fmesa.set_value(inicial.mesa.name).then(function(e){
				if(inicial.estado == "sucess"){
					fg.set_value( inicial.data.customer ).then(function(e){
						let item_values = {};
						for(var w in inicial.data.items){
							item_values = {};
							var ld= inicial.data.items[w];
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
					fg.set_value("Anonimo");
				}
			});
			
		},
		error(text){
			
		}
	});
}
function sendItem (name, rate,item_group){
	name = window.atob(name);
	item_group = window.atob(item_group);
	let topp = null ;
	let complementos=[];
	complementos.push({
		label:"Cantidad",
		fieldname:"qty",
		fieldtype:"Int",
		default: 1
	});
	extras={};
	var afectados=0;
	var item_id=0;
	let arrayComplementos=[]
	for (let i in toppings.complemento ){
		if(toppings.complemento[i].refer == item_group)
		{
			arrayComplementos = [];
			frappe.call({
				method: "frappe.client.get_list",
				args: {
					doctype: "Item",		
					filters:[["item_group","=",toppings.complemento[i].item]]

				},
				async: false,
				callback: function(r) {
				for (var oe in r.message ){
					arrayComplementos.push( r.message[oe].name ) 
				}
				}
			});
			topp = {
				label: toppings.complemento[i].nombre,
				fieldname: "item"+item_id,
				fieldtype: 'Select',
				options: arrayComplementos ,
				
				default:toppings.complemento[i].default
				
			};
			complementos.push(topp);
			extras["item"+item_id] = {
				fieldname: "item"+item_id,
				fieldtype: 'Select',
				options: arrayComplementos ,
				default:toppings.complemento[i].default
			};
			afectados++;
			item_id++;
		}
	}
	if(afectados == 0){
		complementos.push({
				label: "Complemento",
				fieldname: "item0",
				fieldtype: 'Data',
				options: "Item" ,
				default:"No tiene Complementos",
				hidden:1
		});
		extras["item0"] = {
			fieldname: "item0",
			fieldtype: 'Select',
			options: [0],
			default:0,
			hidden:1
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
function add_item(values, cambio="no"){
	//console.log(values)
	let i = 0;
	
	values.elements=[];
	let toppi=[];
	let idstring = "";
	
	
	while(values["item"+i] !== undefined ){
		values.elements.push(values["item"+i]);
		idstring += values["item"+i]+"|";
		if(extras["item"+i] === undefined){
			extras["item"+i] = {};
		}
		if(values["item"+i] !== undefined){
			extras["item"+i].value = values["item"+i];
		}
		i++;
	}
	
	
	
	if(values.comentario!== undefined){
		extras.comentario = values.comentario;
	}else{
		extras.comentario = "";
	}
	if(values.imprimido === undefined){
		values.imprimido = 0;
	}
	
	
	idstring += values.comentario;
	let isservido=0;
	
	
	if("servido" in values){
		if(values.servido == 1){
			idstring +="|newunique: "+ new Date().getTime();
			isservido=1;
		}
	}
	let id = window.btoa(values.itemname+"|"+idstring);
	id = id.replace(/=/g, "_");
	values.id=id;
	let unitqty = parseInt( values.qty  );


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
	let iqty = unitqty;
	itotal = itotal +  (iitem * iqty );
	let iigv = parseFloat( sunat_setup.igv );
	let itotaligv = parseFloat( parseFloat( (itotal * iigv) / (100 + iigv) ).toFixed(2) );
	$("#total_total").text( "S/." +  itotal );
	$("#total_igv").text(  "S/." + itotaligv );
	$("#total_subtotal").text(  "S/." + parseFloat(itotal - itotaligv).toFixed(2) );
	
	
	values.qty = iqty;
	platos[values.id] = values;
	extra[values.id] = extras;
	
	if(cambio == "no"){
		
		cur_doc.sync();
		doc_temporal.save();
	}
	
	let tipo = "";
	frappe.call({
		method: "restaurante.caja.ckeck_ingredientes_item",
		args: {
			id: "Ingredientes-"+values.itemname
		},
		async: false,
		callback: function(r) {
			if(r.message == "no encontrado"){
				$("#"+values.id+"_href").hide()
				$("#"+values.id+"_href").css("color","#cdcdcd")
			}
		},
	});
}
function plato_preparado(name,el){
	id = el.id
	id = id.replace("_href","")
	let element = id
	id = id.replace(/_/g,"=")
	id = window.atob( id )
	let complementos=[];
	let ingredientes=null
	console.log(id)
	//Coco Bowl Fresa|Topping Granola Clásica|Topping Arándanos|Topping Chía|
	var str1 = id
	str1 = str1.split("|");
	str1.pop();
	str1.shift();

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

	if( ingredientes.auto == 0){
		
		
		for ( var i in ingredientes.items ){
			let item = ingredientes.items[i]
			if (item.topping != undefined){
				for ( var i in str1 ){
					if ( item.topping == str1[i]){
						complementos.push({
							label: item.item_name+" en "+item.uom,
							fieldname: item.item,
							fieldtype:"Float",
							default: 1
						})
					}else{
						complementos.push({
							label: item.item_name+" en "+item.uom,
							fieldname: item.item,
							fieldtype:"Float",
							default: 0,
							hidden:1
						})
					}
				}
			}else{
				complementos.push({
					label: item.item_name+" en "+item.uom,
					fieldname: item.item,
					fieldtype:"Float",
					default: item.qty
				})
			}
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
	}else{
		var values = {};
		for ( var i in ingredientes.items ){
			let item = ingredientes.items[i];
			values[item.item] = item.qty;
		}
		plato_servido(values , id)
	}
	
	
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
		if(values[i] !== undefined){
			if(values[i] != 0){
				data.push({
					item:i,
					qty:values[i]
				})
			}
		}
	}
	
	doc_temporal.save(antid)
	frappe.call({
		async:false,
		method:"restaurante.caja_y_mozo.page.caja_del_restaurante.caja_del_restaurante.set_plato",
		args:{
			data:data,
			customer: cliente
		},
		callback:function(r){
			res =r.message
			frappe.msgprint("Se ha registrado el uso de los ingredientes")
			
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
	var iii=0;
	

	
	if ($(".octicon-bell").length > 0){
		$('.octicon-bell').each(function() {
			console.log(this)
			
			if( $(this).css("display") != "none"  &&  $(this).parent().css("display") != "none" ){
				if( $(this).css("color") == "#98d85b" || $(this).css("color") == "rgb(152, 216, 91)" ){
					iii++;
					console.log("suma")
				}else{}
			}
		});
	};
	if(iii > 0){
		return frappe.throw("Debes estar todos los platos servidos antes de entregar la cuenta.");
	}

	let complementos = [];
	frappe.db.get_doc('Sales Invoice', null, { restaurant_table: $('input[data-fieldname="mesarestaurant"]').val(), docstatus:0 })
    .then(doc => {
		complementos.push({
			label: 'Pre Cuenta',
			fieldname: 'Cuenta',
			fieldtype: 'Button',
			click(){
				window.open('/VentaTicket?c='+doc.name,'_blank');
			}
		})
		complementos.push({
			fieldname: 'saltos pre',
			fieldtype: 'Section Break'
		})


		let modosPagos = null;
		let cliente = null;
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
	frappe.call({
		  method: "frappe.client.get",
		  args: {
			  doctype: "Customer",
		name: $('input[data-fieldname="customer"]').val()
		  },
		  async: false,
		  callback: function(r) {
			  cliente = r.message
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
	  complementos.push({
		  label:"Desea Boleta / Factura",
		  fieldname:"pagar_section_break_2",
		  fieldtype:"Section Break",
	  })
	  complementos.push({
		  label:"Ruc/Dni",
		  fieldname:"numero_doc",
		  fieldtype:"Data",
		  default: cliente.tax_id
	  })
	  complementos.push({
		  fieldname:"Column Break",
		  fieldtype:"Column Break",
		  default:""
	  })
	  complementos.push({
		  label:"Correo Electrónico",
		  fieldname:"email",
		  fieldtype:"Data",
		  default: cliente.email_id
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
	
		
	})

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
			if(values[s] > 0 && s != "numero_doc" && s != "email"  ){
				payments.push({
					amount: values[s],
					mode_of_payment: s
				});
			}
		}
	}
	cur_doc.synced();
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
				generar_comprobante(values,r.message.name);
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
			frappe.show_alert({
				message:"mesa limpiada",
				time:5,
				indicator:'green'
				
			});



			console.clear();
			$("#total_total").text("S/.0.00");
			$("#total_igv").text("S/.0.00");
			$("#total_subtotal").text("S/.0.00");
			$("#menu_items").html('');
			platos = {};
			extras = {};
			$('button[data-dismiss="modal"]').trigger("click");
			$(".msgprint").html("")


			//location.reload();
		}
	})
	
}
function plato_delete(item_name,item){
	elid = item.id;
	elid = elid.replace("_delete","");
	let itot= parseFloat( $("#total_total").text().replace("S/.", "") );
	itot = itot - ( platos[elid].qty + platos[elid].rate );
	let iigv= parseFloat( parseFloat( ( itot * 100 )/ ( 100 + sunat_setup.igv ) ).toFixed(2) );
	let subt= itot - iigv;

	$("#total_total").text("S/." + itot );
	$("#total_subtotal").text("S/." + subt);
	$("#total_igv").text("S/." + iigv );

	delete platos[elid];
	delete extra[elid];

	$("#" + elid + "_id").remove();
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
				$("#"+values.id+"_href").hide(); $("#"+values.id+"_href").css("color","#cdcdcd");
			}
		},
	});
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
			subtotal: parseFloat( $("#total_subtotal").text().replace("S/.", "") )
		},
		async: false,
		callback: function(r) {},
	});
}
function generar_comprobante(values,nombreComp){
	
  var eltipo="V";
  var elementoUrl="Venta";
  var A4="A4";
	var settings = {
		"async": false,
		"crossDomain": true,
		"method": "GET",
		"headers": {
			"Content-Type": "application/json",
			"Authorization": "Bearer m5TX5llKHKx3WhIGBqNqX3VLozorFcz7yBxtpAWXGFojX7brWA"
		},
		"data": ""
	}
	
	var metodo="";
	if(values.tipo_comprobante === undefined){
		 
      if(sunat_setup.pdf == "A5"){
        A4="A4"
      }
      if(sunat_setup.pdf == "TICKET"){
        A4="Ticket"
      }
      
			frappe.msgprint({message: nombreComp+
      ' ha sido emitida con éxito <br/><br/> <a  \
      onclick="pdf(\''+nombreComp+'\',\'Venta\')" \
      class="btn btn btn-sm btn-primary" >Imprimir</a> <br><br> \
      <div id="el_codigoqr"> </div> \
      ',
      title: 'Venta Generada', indicator:'green'});
       setTimeout(function(e){
			$('#el_codigoqr').qrcode( frappe.urllib.get_base_url()+"/"+elementoUrl+A4+"?c="+nombreComp ); 
			  cur_dialog.onhide = function(e){
				console.clear();
				$("#total_total").text("S/.0.00");
				$("#total_igv").text("S/.0.00");
				$("#total_subtotal").text("S/.0.00");
				$("#menu_items").html('');
				platos = {};
				extras = {};

			   }
      },500)
		
		return;
	}
	if(values.tipo_comprobante == ""){
      
      if(sunat_setup.pdf == "A5"){
        A4="A4"
      }
      if(sunat_setup.pdf == "TICKET"){
        A4="Ticket"
      }
      	
	  // onclick="pdf(\''+nombreComp+'\',\'Venta\')"
			frappe.msgprint({message: nombreComp+
      ' ha sido emitida con éxito <br/><br/> <a  \
	   href="'+values.pdf+'" class="btn btn btn-sm btn-primary" >Imprimir</a> <br><br> \
      <div id="el_codigoqr"> </div> \
      ',
      title: 'Venta Generada', indicator:'green'});
       setTimeout(function(e){
			$('#el_codigoqr').qrcode( values.pdf ); 
			  cur_dialog.onhide = function(e){ 
				  
				console.clear();
				$("#total_total").text("S/.0.00");
				$("#total_igv").text("S/.0.00");
				$("#total_subtotal").text("S/.0.00");
				$("#menu_items").html('');
				platos = {};
				extras = {};
				limpiar();

			   }
      },500)
		//frappe. msgprint({message: 'Su venta ha sido generada',title: 'Venta Generada', indicator:'green'});
	
		return;
	}
	if(values.tipo_comprobante == "Boleta"){
		metodo="sunat.sunat.doctype.boleta.boleta.Nubefact";
	}
	if(values.tipo_comprobante == "Factura"){
		metodo="sunat.sunat.doctype.factura.factura.Nubefact";
	}
	var response = null;
	let address = "";
	if( values.numero_doc == undefined ){
		values.numero_doc="OTROS"
		response = {};
		response.data = {};
		response.data.name = "VARIOS";
	}
	if( (values.numero_doc).length == 11){
		settings.url = "https://lobellum.cf/api/services/ruc/"+values.numero_doc;
		response = JSON.parse( $.ajax(settings).responseText );
	}else{
		if( (values.numero_doc).length == 8 ){
			settings.url = "https://lobellum.cf/api/services/dni/"+values.numero_doc
			response = JSON.parse( $.ajax(settings).responseText );
		}else{
			values.numero_doc="OTROS"
			response = {};
			response.data = {};
			response.data.name = "VARIOS";
		}
	}
	if("address" in response.data ){
		address = response.data.address;
	}
	cliente_numero_de_documento = values.numero_doc;
	let total = {
		descuento_global: "",
		total_anticipo: "",
		total_gravada: "",
		total_inafecta: "",
		total_exonerada: "",
		total_igv: "",
		total_gratuita: "",
		total_otros_cargos: "",
		total_incluido_percepcion: "",
		total_impuestos_bolsas: "",
		total: ""
	};
	var cliente_email="";
	if( "email" in values){
		cliente_email = values.email;
	}
	total.total_gravada = ($("#total_subtotal").html()).replace("S/.","");
	total.total_igv = ($("#total_igv").html()).replace("S/.","");
	total.total = ($("#total_total").html()).replace("S/.","");
	if( "total_impuestos_bolsas" in values ){
		total.total_impuestos_bolsas = values.total_impuestos_bolsas;
	}
	var today = new Date();
	var dd = today.getDate();
	var DD = today.getDate();
	var mm = today.getMonth()+1;
	var yyyy = today.getFullYear();
	if(dd<10){
		dd='0'+dd;
	}
	if(DD<10){
		DD='0'+(DD+1);
	}
	if(mm<10){
		mm='0'+mm;
	}
	

	var itemList   = [];
	var itli	   = {};
	var unit_total = 0;
	var valor_unit = 0;
	var igv_unit   = 0;
	var valor_tot  = 0;
	
	for(var n in platos ){
		itli = platos[n];
		unit_total = itli.qty * itli.rate;
		igv_unit = parseFloat( parseFloat( itli.rate * sunat_setup.igv )/(100 + sunat_setup.igv )).toFixed(2);
		valor_unit = parseFloat(itli.rate) - parseFloat(igv_unit);
		valor_tot = parseFloat(itli.qty) * parseFloat(valor_unit);
		itemList.push({
			"unidad_de_medida": "Números",
			"codigo": itli.itemname,
			"codigo_interno": itli.itemname,
			"codigo_producto_sunat": "90101501",
			"descripcion": itli.itemname,
			"cantidad": itli.qty,
			"valor_unitario": valor_unit,
			"precio_unitario": itli.rate,
			"descuento": "",
			"subtotal": valor_tot,
			"tipo_de_igv": 1,
			"tipo_igv":1,
			"igv": unit_total - valor_tot,
			"porcentaje_igv": sunat_setup.igv,
			"total": unit_total
		});
	}
	let response2 = null;
	frappe.call({
		method:metodo,
		async:false,
		args:{
			cliente:{
				numero_documento: values.numero_doc,
				razon_social: response.data.name,
				direccion: address,
				cliente_email:cliente_email
			},
			items: itemList,
			fecha:{
				fecha_de_emision: yyyy+"-"+mm+"-"+dd,
				fecha_de_vencimiento: yyyy+"-"+mm+"-"+DD
			},
			total: total,
			documento:{
				exportacion: 0,
				tipo_de_cambio:"",
				percepcion_tipo:"",
				percepcion_base_imponible:"",
				total_percepcion:"",
				detraccion:"",
				observaciones:"",
				codigo_unico:"",
				medio_de_pago:"",
				condiciones_de_pago:"",
				name:"UN"+today.getTime()
			},
			guia:{
				placa_vehiculo:""
			}
		
		},
		callback: function(res){
			response2 = JSON.parse( res.message )
		}
	})
	if("errors" in response2 ){
		return frappe.throw( response2.errors );
	}
	frappe.call({
		"method": "frappe.client.set_value",
		"args": {
		"doctype":"Setup",
		"name":"Setup",
		"fieldname":"numero_"+ values.tipo_comprobante.toLowerCase(),
		"value": response2.numero + 1
		},
		async: false
	});
	var form_doc = {
		cliente:{
			numero_documento: values.numero_doc,
			razon_social: response.data.name,
			direccion: address,
			cliente_email:cliente_email
		},
		items: itemList,
		fecha:{
			fecha_de_emision: yyyy+"-"+mm+"-"+dd,
			fecha_de_vencimiento: yyyy+"-"+mm+"-"+DD
		},
		total: total,
		doctype: values.tipo_comprobante,
		documento:{
			exportacion: 0,
			tipo_de_cambio:"",
			percepcion_tipo:"",
			percepcion_base_imponible:"",
			total_percepcion:"",
			detraccion:"",
			observaciones:"",
			codigo_unico:"",
			medio_de_pago:"",
			condiciones_de_pago:"",
			serie_documento: response2.serie,
			numero_documento: response2.numero,
			codigo_tipo_operacion: response2.tipo_de_comprobante,
			qr: response2.cadena_para_codigo_qr,
			filename: response2.enlace,
			hash: response2.codigo_hash,
			number_to_letter: "",
			external_id: response2.key,
			xml: response2.enlace_del_xml,
			pdf: response2.enlace_del_pdf,
			cdr: response2.enlace_del_cdr
		},
		guia:{
			placa_vehiculo:""
		},
	}
	frappe.call({
		method:"restaurante.comprobante.set",
		async:false,
		args:{form:form_doc},
		callback:function(r){
      if(sunat_setup.pdf == "A5"){
        A4="A4"
      }
      if(sunat_setup.pdf == "TICKET"){
        A4="Ticket"
      }
      if(values.tipo_comprobante == "Boleta"){
        eltipo="B";
        elementoUrl="Boleta";
      }
      if(values.tipo_comprobante == "Factura"){
        eltipo="F";
        elementoUrl="Factura";
      }
      
			frappe.msgprint({message: values.tipo_comprobante+
      ' ha sido emitida con éxito <br/><br/> <a  \
      onclick="pdf(\''+r.message.name+'\',\''+values.tipo_comprobante+'\')" \
      class="btn btn btn-sm btn-primary" >Imprimir</a> <br><br> \
      <div id="el_codigoqr"> </div> \
      ',title: values.tipo_comprobante+' emitida', indicator:'green'});
      setTimeout(function(e){
			  $('#el_codigoqr').qrcode( frappe.urllib.get_base_url()+"/"+elementoUrl+A4+"?c="+r.message.name ); 
        cur_dialog.onhide = function(e){ 	
			
			console.clear();
			$("#total_total").text("S/.0.00");
			$("#total_igv").text("S/.0.00");
			$("#total_subtotal").text("S/.0.00");
			$("#menu_items").html('');
			platos = {};
			extras = {};
			limpiar();

		 }
      },500)
      
      
		}
	});
	
	
}
function qr(){
  var eltipo="V";
  var elementoUrl="Venta";
  var A4="A4";
  if(sunat_setup.pdf == "A5"){
    A4="A4"
  }
  if(sunat_setup.pdf == "TICKET"){
    A4="Ticket"
  }
  if(tipoC == "Boleta"){
    eltipo="B";
    elementoUrl="Boleta";
  }
  if(tipoC == "Factura"){
    eltipo="F";
    elementoUrl="Factura";
  }
}
function pdf(pdf, tipoC){
	
  var eltipo="V";
  var elementoUrl="Venta";
  var A4="A4";
  if(sunat_setup.pdf == "A5"){
    A4="A4"
  }
  if(sunat_setup.pdf == "TICKET"){
    A4="Ticket"
  }
  if(tipoC == "Boleta"){
    eltipo="B";
    elementoUrl="Boleta";
    frappe.call({
        method: "frappe.client.get",
        args: {
          doctype: "Boleta",
          name: pdf
        },
        async: true,
        callback: function(rep) {
			rep.web_seting = frappe.boot.website_settings;
			rep.sunat = sunat_setup;
			rep.tipo = "Boleta";
			printer.emit("print-socket",JSON.stringify(rep));
        }
    	});
    
  }else{
	  if(tipoC == "Factura"){
	    eltipo="F";
	    elementoUrl="Factura";
	    frappe.call({
        method: "frappe.client.get",
        args: {
          doctype: "Factura",
          name: pdf
        },
        async: true,
        callback: function(rep) {
			rep.web_seting = frappe.boot.website_settings;
			rep.sunat = sunat_setup;
			rep.tipo = "Factura";
			printer.emit("print-socket",JSON.stringify(rep));
        }
    	});
    	
	  }else{
	  	frappe.call({
        method: "frappe.client.get",
        args: {
          doctype: "Sales Invoice",
          name: pdf
        },
        async: true,
        callback: function(rep) {
			rep.web_seting = frappe.boot.website_settings;
			rep.sunat = sunat_setup;
			rep.tipo = "Sales Invoice";
			printer.emit("print-socket",JSON.stringify(rep));
        }
    	});
	  	
	  }
  	
  }
  window.open(frappe.urllib.get_base_url()+"/"+elementoUrl+A4+"?c="+pdf+"",'_blank');
	
	console.clear();
	$("#total_total").text("S/.0.00");
	$("#total_igv").text("S/.0.00");
	$("#total_subtotal").text("S/.0.00");
	$("#menu_items").html('');
	platos = {};
	extras = {};
	$('button[data-dismiss="modal"]').trigger("click");
	$(".msgprint").html("")
	limpiar();
	frappe.show_alert({
		message:"mesa limpiada",
		time:5,
		indicator:'green'
		
	});


}