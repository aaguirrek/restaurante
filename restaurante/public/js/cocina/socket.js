this.doctype = "Restaurant Table Temp";
frappe.realtime.on('list_update', data => {
	console.log(data);
	const { doctype, name } = data;
	if (doctype !== this.doctype )
	{
		return;
	}
	//Restaurant Table Temp Restemp-Litoral-480-km-02 no encontrado

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
					callback: function(r) { page_cocina.add.mesa( r.message ) }
					
				})	
      }else{
  			var id = StrSlug( name );
			  if ($('#'+id).length){
			      $('#'+id).remove();
			  }    	
      }
    	
  })
  		
});
