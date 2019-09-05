frappe.provide('frappe.form_dict');
frappe.provide('frappe.pages');
frappe.provide('frappe.views');
frappe.provide('sample_register');

var page=null;

let w=null;
frappe.pages['caja-del-restaurante'].on_page_load = function(wrapper) {	
	w = wrapper;
	 page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Caja del Restaurante',
		single_column: false
	})

	console.log(page)
	
	
	page.wrapperTemplate = page.wrapper.html(frappe.render_template("caja_del_restaurante","" ) )
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
	/*
	//temp1.page_form.html("<h1>hola mundo</h1>"+temp1.page_form.html())
	page.add_field({
		fieldname: 'item_name',
		label: 'Producto',
		fieldtype:'Link',
		options:'Item'
	})/*/
	
}
frappe.pages['caja-del-restaurante'].on_page_show = function(wrapper) {

};