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
    itemsel = []
    for menuitem in menu.itemsel:
        item = frappe.get_doc("Item", menuitem.item )
        res = {}
        res['item'] = itemsel
        res['menu'] = menuitem
        itemsel.append( res )
    return itemsel
    
@frappe.whitelist()
def set_plato(data, warehouse, customer="Anonimo" ):
    resta = frappe.get_last_doc("Restaurant")
    defaults = frappe.get_doc("Global Defaults")
    company = frappe.get_doc("Company", defaults.default_company)
    currency = defaults.default_currency
    menu = frappe.get_doc("Restaurant Menu", resta.active_menu)

    rate = 0
    conversion_factor = 1
    
    itemList = []

    for el in data:
        item = frappe.get_doc("Item", el["item"] )
        if item.stock_uom == "Kilogramo" and el["uom"] == "Gramo":
            conversion_factor = 1000
        for conv in item.uoms:
            if el["uom"] == conv.uom:
                conversion_factor = conv.conversion_factor
        
        for menuitem in menu.items:
            if el["item"] == menuitem.item:
                rate = menuitem.rate

        itemList.append({
            "item_code": el["item"],
            "item_name": item.item_name,
            "qty": el["qty"],
            "uom": el["uom"],
            "price_list_rate": rate,
            "base_price_list_rate": rate,
            "stock_qty":  el["qty"],
            "rate": rate,
            "amount": ( el["qty"] * rate),
            "item_tax_rate": {},
            "stock_uom": item.stock_uom,
            "conversion_factor": conversion_factor,
            "margin_type": "",
            "margin_rate_or_amount": 0.0,
            "rate_with_margin": 0.0,
            "expense_account": company.default_expense_account,
            "cost_center" : company.cost_center
        })

    doc = {
        "items":itemList,
        "customer": customer,
        "doctype": "Delivery Note",
        "company": defaults.default_company,
        "docstatus": 1,
        "status": "Closed",
        "warehouse": warehouse,
        "set_warehouse": warehouse
    }
    saved = frappe.get_doc("Delivery Note",doc)
    saved.insert()
    return saved
