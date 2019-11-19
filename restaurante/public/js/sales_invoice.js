frappe.ui.form.on('Sales Invoice', {
    refresh:function(frm){
            frm.add_custom_button('Imprimir Ticket Restaurant', () => {
                
				window.open('/VentaTicket?c='+frm.doc.name,'_blank');
            })
    }
})
