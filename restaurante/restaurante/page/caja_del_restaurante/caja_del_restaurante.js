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
function sendItem (name){
	let topp=null
	let complementos=[];
	for (let i in toppings.complemento )
	{
		topp = { label: toppings.complemento[i].nombre,filters : {"item_group":toppings.complemento[i].item}, fieldname: "item"+i, fieldtype: 'Link', options: "Item" }
		complementos.push(topp)
	}
	complementos.push({
		label:"Comentario",
		fieldname:"comentario",
		fieldtype:"Text"
	})
	
	let d = new frappe.ui.Dialog({
		title: name,
		fields: complementos,
		primary_action_label: 'Enviar',
		primary_action(values) {
			console.log(values);
			d.hide();
		}
	});
	
	d.show();
}