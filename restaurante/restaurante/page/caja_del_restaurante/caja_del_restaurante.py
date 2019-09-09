# -*- coding: utf-8 -*-
# Copyright (c) 2017, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe, json
from frappe.model.document import Document
from frappe import _
from erpnext.controllers.queries import item_query

@frappe.whitelist()
def get_menu(restaurante=""):
    restaurant = frappe.get_last_doc("Restaurant")
    menu = frappe.get_doc("Restaurant Menu", restaurant.active_menu)
    items = []
    for menuitem in menu.items:
        item = frappe.get_doc("Item", menuitem.item )
        res = {}
        res['item'] = item
        res['menu'] = menuitem
        items.append( res )
    return items