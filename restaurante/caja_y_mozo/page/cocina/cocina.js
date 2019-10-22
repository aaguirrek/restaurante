frappe.provide('frappe.form_dict');
frappe.provide('frappe.pages');
frappe.provide('frappe.views');
frappe.provide('sample_register');


var page=null;
var items_demo = null;

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


var StrSlug = (function() {
  var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç ", 
      to   = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc_",
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
frappe.pages['cocina'].on_page_load = function(wrapper) {
	w = wrapper;
	 page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Cocina',
		single_column: true
	});
  $(".layout-main").append(frappe.render_template("cssbase", {} ));
	frappe.call({
		method:"frappe.client.get_list",
		args:{"doctype": "Restaurant Table Temp","order_by":"modified asc"},
		async: true,
		callback: function(r) {
		  all_tables = r.message 
		  for( var a in all_tables ){
		    doc = all_tables[a];
		    	frappe.call({
        		method: "frappe.client.get",
        		args: {
        			doctype: "Restaurant Table Temp",
        			name: doc.name
        		},
        		async: true,
        		callback:page_cocina.add.mesa
        	});
		  }
		  
		}
	});
}


