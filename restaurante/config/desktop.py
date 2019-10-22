# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
			"module_name": "Caja Y Mozo",
			"color": "#388e3c",
			"icon": "🍔",
			"type": "module",
			"label": _("Caja y Mozo")
		},
		{
			"module_name": "caja-del-restaurante",
			"color": "#388e3c",
			"icon": "🍔",
			"type": "page",
			"link": "caja-del-restaurante",
			"label": _("Nueva venta")
		},
		{
			"module_name": "cocina",
			"color": "#388e3c",
			"icon": "🍔",
			"type": "page",
			"link": "cocina",
			"label": _("Cocina")
		}
	]
