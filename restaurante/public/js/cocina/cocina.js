var page_cocina = {};
page_cocina.add = {};
page_cocina.add.mesa = ( req ) => {
	var numero_mesa = req.mesa ;
	numero_mesa = "01";
	if ("message" in req){
		numero_mesa = req.message.mesa ;
		numero_mesa = numero_mesa.split("-");
		numero_mesa = numero_mesa[numero_mesa.length - 1];
		req = req.message;
	}else{
		
		numero_mesa = req.mesa ;
		numero_mesa = numero_mesa.split("-");
		numero_mesa = numero_mesa[numero_mesa.length - 1];
		//frappe.msgprint("Nuevo Pedido Mesa "+numero_mesa,"Nuevo Pedido");
	}
	id = StrSlug( req.name );
  req.id = id;
  req.numero_mesa = numero_mesa;
  if ($('#'+req.id).length){
      $('#'+req.id).remove();
  }
	let item=null;
	for(let i in req.items){
	  item = req.items[i];
	  req.items[i].extra = JSON.parse(item.extra);
	  req.items[i].extraStr="";
	  for (var e in item.extra ){
		  if ( item.extra[e].value !== undefined ){
		    req.items[i].extraStr+= item.extra[e].value+" - ";
		  }  
	  }
	  
	}
	let template = frappe.render_template("mesas", req );
  $(".el-content-main").prepend(template);
};