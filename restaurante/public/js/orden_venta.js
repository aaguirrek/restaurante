frappe.ui.form.on('Restaurant Order Entry', {
    refresh:function(frm){
            
            frm.add_custom_button('Pre-Cuenta', () => {
               
                frappe.db.get_doc('Sales Invoice', null, { restaurant_table: frm.doc.restaurant_table , docstatus:0 })
                .then(doc => {
                    window.open('/VentaTicket?c='+doc.name,'_blank');
                }) 
				
            })
    }
})
