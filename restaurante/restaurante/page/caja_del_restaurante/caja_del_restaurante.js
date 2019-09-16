frappe.provide('frappe.form_dict');
frappe.provide('frappe.pages');
frappe.provide('frappe.views');
frappe.provide('sample_register');
var toppings=null;
var page=null;

let w=null;
frappe.pages['caja-del-restaurante'].on_page_load = function(wrapper) {	
	w = wrapper;
	 page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Caja del Restaurante',
		single_column: false
	})
	var restaurantMenu = null;
	frappe.call({async:false,method:"restaurante.restaurante.page.caja_del_restaurante.caja_del_restaurante.get_menu", args:{restaurante:"greena" }, callback:function(res){ restaurantMenu =res.message }});
	frappe.db.get_doc("Complementos del Plato").then(doc => {
		console.log(doc)
		toppings = doc
	})
	console.log(restaurantMenu)
	page.wrapperTemplate = page.wrapper.html(frappe.render_template("caja_del_restaurante", { restaurantMenu:restaurantMenu } ) )
	let fg = frappe.ui.form.make_control({
		parent: page.wrapper.find(".customer"),
		df: {
			fieldtype: "Link",
			options: "Customer",
			fieldname: "customer",
			placeholder: "Clientes"
		},
		render_input: true
	});
	fg.make();
	let item = frappe.ui.form.make_control({
		parent: page.wrapper.find(".filter"),
		df: {
			fieldtype: "Link",
			options: "Item",
			fieldname: "items",
			placeholder: "Insertar Producto"
		},
		render_input: true
	});
	item.make();
	let group = frappe.ui.form.make_control({
		parent: page.wrapper.find(".group"),
		df: {
			fieldtype: "Link",
			options: "Item Group",
			fieldname: "groups",
			placeholder: "Filtrar por"
		},
		render_input: true
	});
	group.make();
	console.log(frappe);
	/*
	//temp1.page_form.html("<h1>hola mundo</h1>"+temp1.page_form.html())
	page.add_field({
		fieldname: 'item_name',
		label: 'Producto',
		fieldtype:'Link',
		options:'Item'
	})/*/
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
	})
	for (let i in toppings.complemento ){
		topp = { 
			label: toppings.complemento[i].nombre,
			filters : {
				"item_group":toppings.complemento[i].item
			}, 
			fieldname: "item"+i, 
			fieldtype: 'Link', 
			options: "Item" }
		complementos.push(topp)
	}
	complementos.push({
		label:"Nombre del producto",
		fieldname:"itemname",
		fieldtype:"Data",
		hidden:1,
		default: name
	})
	complementos.push({
		label:"Precio del Producto",
		fieldname:"rate",
		fieldtype:"Currency",
		hidden:1,
		default: rate
	})
	complementos.push({
		label:"Comentario",
		fieldname:"comentario",
		fieldtype:"Text",

	})
	
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
	console.log(values)
	
	let i = 0
	values.elements=[]
	let idstring = ""
	while(values["item"+i] !== undefined ){
		values.elements.push(values["item"+i])
		idstring += values["item"+i]+"|"
		i++
	}
	idstring += values.comentario
	let id = window.btoa(values.itemname+"|"+idstring)
	id = id.replace(/=/g, "_")
	values.id=id

	if( $("#"+id+"_id" ).length ){
		let qty = (parseInt( $("#"+id+"_qty").text() ) + parseInt( values.qty ) )
		$("#"+id+"_qty").text( qty )
		$("#"+id+"_rate").text( qty * parseFloat(values.rate) )
	}else{
		let template = frappe.render_template("item", { values:values } )
		$("#menu_items").append(template)
	}
}

function plato_preparado(name,el){
	id = el.id
	id = id.replace("_href","")
	let element = id
	console.log(id)
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
	complementos.push({
		label:"Referencia",
		fieldname:"reference",
		fieldtype:"Text",
		hidden:1,
		default: element
	})
	complementos.push({
		label:"Item Name",
		fieldname:"item_name",
		fieldtype:"Text",
		hidden:1,
		default: name
	})
	
	let d = new frappe.ui.Dialog({
		title: name,
		fields: complementos,
		primary_action_label: 'Enviar',
		primary_action(values) {
			plato_preparado(values)
			d.hide();
		}
	});
	
	d.show();
}
function plato_preparado(values){
	
}