#caja-del-restaurante
from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
      "label": _("Restaurante"),
			"items": [
				{
					"type": "page",
					"name": "caja-del-restaurante",
					"label": _("Nueva venta"),
				},
				{
					"type": "doctype",
					"name": "Restaurant Order Entry",
					"label": _("Orden de entrada del restaurant"),
					"link": "Form/Restaurant Order Entry",
				},
				{
					"type": "doctype",
					"name": "Restaurant Table",
					"label": _("Reservas"),
				},
				{
					"type": "doctype",
					"name": "Restaurant Menu",
					"label": _("Carta"),
				},
				{
					"type": "doctype",
					"name": "Restaurant Table",
					"label": _("Mesas"),
				},
				{
					"type": "doctype",
					"name": "Restaurant",
					"label": _("Ajustes y la carta activa"),
				},
			]
    },
		{
			"label": _("Customers"),
			"items": [
				{
					"type": "doctype",
					"name": "Customer",
					"description": _("Customer database."),
				},
				{
					"type": "doctype",
					"label": _("Customer Group"),
					"name": "Customer Group",
					"icon": "fa fa-sitemap",
					"link": "Tree/Customer Group",
					"description": _("Manage Customer Group Tree."),
				},
				{
					"type": "doctype",
					"name": "Contact",
					"description": _("All Contacts."),
				},
				{
					"type": "doctype",
					"name": "Address",
					"description": _("All Addresses."),
				},

			]
		},
		{
			"label": _("Compras, Ventas y Stock"),
			"items": [
				{
					"type": "doctype",
					"name": "Sales Invoice",
					"label": "Ventas",
					"description": _("Bills raised to Customers.")
				},
				{
					"type": "doctype",
					"name": "Purchase Invoice",
					"label": "Compras",
					"description": _("Bills raised by Suppliers.")
				},
				{
					"type": "doctype",
					"name": "Stock Entry",
				},
				{
					"type": "doctype",
					"name": "Delivery Note",
				},
				{
					"type": "doctype",
					"name": "Purchase Receipt",
				},
				{
					"type": "doctype",
					"name": "Material Request",
				},
			]

		},
    {
      "label": _("Productos"),
			"items": [
				{
					"type": "doctype",
					"name": "Item",
					"label": "Productos"
				},
        {
					"type": "doctype",
					"name": "Item Group",
					"label": "Grupo de productos"
				},
        {
					"type": "doctype",
					"name": "Ingredientes",
				},
        {
					"type": "doctype",
					"name": "Complementos del Plato",
				},
        {
					"type": "doctype",
					"name": "Modos de pago",
				}
			]
    },
    {
      "label": _("Sunat"),
			"items": [
				{
					"type": "doctype",
					"name": "Factura",
				},
        {
					"type": "doctype",
					"name": "Boleta",
				},
        {
					"type": "doctype",
					"name": "Anulaciones",
				},
				{
					"type": "doctype",
					"name": "Libro de ventas",
          "label": "Libro de Ventas"
				},
        {
					"type": "doctype",
					"name": "Libro Compras",
          "label": "Libro de Compras"
				}
			]
    },
		{
			"label": _("Stock Reports"),
			"items": [
				{
					"type": "report",
					"is_query_report": True,
					"name": "Stock Ledger",
					"doctype": "Stock Ledger Entry",
				},
				{
					"type": "report",
					"is_query_report": True,
					"name": "Stock Balance",
					"doctype": "Stock Ledger Entry"
				},
				{
					"type": "report",
					"is_query_report": True,
					"name": "Stock Projected Qty",
					"doctype": "Item",
				},
				{
					"type": "page",
					"name": "stock-balance",
					"label": _("Stock Summary")
				},
				{
					"type": "report",
					"is_query_report": True,
					"name": "Stock Ageing",
					"doctype": "Item",
				},
				{
					"type": "report",
					"is_query_report": True,
					"name": "Item Price Stock",
					"doctype": "Item",
				}
			]
		},
		{
			"label": _("Analytics"),
			"items": [
				{
					"type": "report",
					"name": "Gross Profit",
					"doctype": "Sales Invoice",
					"is_query_report": True
				},
				{
					"type": "report",
					"name": "Purchase Invoice Trends",
					"is_query_report": True,
					"doctype": "Purchase Invoice"
				},
				{
					"type": "report",
					"name": "Sales Invoice Trends",
					"is_query_report": True,
					"doctype": "Sales Invoice"
				},
				{
					"type": "report",
					"name": "Item-wise Sales Register",
					"is_query_report": True,
					"doctype": "Sales Invoice"
				},
				{
					"type": "report",
					"name": "Item-wise Purchase Register",
					"is_query_report": True,
					"doctype": "Purchase Invoice"
				},
				{
					"type": "report",
					"name": "Profitability Analysis",
					"doctype": "GL Entry",
					"is_query_report": True,
				},
				{
					"type": "report",
					"name": "Customer Ledger Summary",
					"doctype": "Sales Invoice",
					"is_query_report": True,
				},
				{
					"type": "report",
					"name": "Supplier Ledger Summary",
					"doctype": "Sales Invoice",
					"is_query_report": True,
				}
			]
		},
		{
			"label": _("Reportes Contables"),
			"items": [
				{
					"type": "report",
					"name": "Accounts Receivable",
					"doctype": "Sales Invoice",
					"is_query_report": True
				},
				{
					"type": "report",
					"name": "Accounts Payable",
					"doctype": "Purchase Invoice",
					"is_query_report": True
				},
				{
					"type": "report",
					"name": "Trial Balance",
					"doctype": "GL Entry",
					"is_query_report": True,
				},
				{
					"type": "report",
					"name": "Balance Sheet",
					"doctype": "GL Entry",
					"is_query_report": True
				},
				{
					"type": "report",
					"name": "Cash Flow",
					"doctype": "GL Entry",
					"is_query_report": True
				},
				{
					"type": "report",
					"name": "Profit and Loss Statement",
					"doctype": "GL Entry",
					"is_query_report": True
				},
				{
					"type": "report",
					"name": "Consolidated Financial Statement",
					"doctype": "GL Entry",
					"is_query_report": True
				},
				{
					"type": "doctype",
					"name": "Account",
					"icon": "fa fa-sitemap",
					"label": _("Chart of Accounts"),
					"route": "Tree/Account",
					"description": _("Tree of financial accounts."),
				},
				{
					"type": "report",
					"name": "General Ledger",
					"doctype": "GL Entry",
					"is_query_report": True,
				}
			]
		}
  ]