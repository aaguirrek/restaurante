# -*- coding: utf-8 -*-
# Copyright (c) 2017, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe, json
import datetime
from frappe.model.document import Document
from frappe import _
from frappe import utils
from erpnext.controllers.queries import item_query

@frappe.whitelist()
def get_menu(restaurante=""):
    restaurant = frappe.get_last_doc("Restaurant")
    menu = frappe.get_doc("Restaurant Menu", restaurant.active_menu)
    itemsel = []
    for menuitem in menu.items:
        itemel = frappe.get_doc("Item", menuitem.item )
        res = {}
        res['name'] = menu.name
        res['item'] = itemel
        res['menu'] = menuitem
        itemsel.append( res )
    return itemsel
    
@frappe.whitelist()
def set_plato(data, customer="Anonimo" ):
    resta = frappe.get_last_doc("Restaurant")
    stock_settings = frappe.get_doc("Stock Settings")
    defaults = frappe.get_doc("Global Defaults")
    ventas = frappe.get_doc("Selling Settings")
    company = frappe.get_doc("Company", defaults.default_company)
    menu = frappe.get_doc("Restaurant Menu", resta.active_menu)
    data = json.loads(data)
    currency = defaults.default_currency
    warehouse = "Tiendas"
    rate = 0
    itemList = []
    total = 0
    total_qty=0

    for el in data:
        item = frappe.get_doc("Item", el["item"] )
        warehouse= item.item_defaults[0].default_warehouse
        rate = item.standard_rate
        total = total + rate
        total_qty = total_qty + el["qty"]
        itemList.append(
            {
                "parentfield": "items",
                "parenttype": "Delivery Note",
                "item_code": el["item"],
                "item_name": item.item_name,
                "description": item.description,
                "qty": el["qty"],
                "stock_uom": item.stock_uom,
                "uom": item.stock_uom,
                "conversion_factor": 1,
                "stock_qty": el["qty"],
                "price_list_rate": rate,
                "base_price_list_rate": rate
            })
    now = datetime.datetime.now()
    year =  now.year
    doc= frappe.get_doc({
        "naming_series":"MAT-DN-.YYYY.-",
        "posting_date": frappe.utils.nowdate(),
        "posting_time": frappe.utils.nowtime(),
        "currency":currency,
        "conversion_rate":1,
        "selling_price_list": ventas.selling_price_list,
        "price_list_currency": currency,
        "plc_conversion_rate": 1,
        "is_return":0,
        "customer": customer,
        "doctype": "Delivery Note",
        "company": defaults.default_company,
        "warehouse": stock_settings.default_warehouse,
        "set_warehouse": stock_settings.default_warehouse,
        "lr_date": frappe.utils.nowdate(),
        "language":"es-ES",
        "total":total,
        "rounded_tota":total,
        "base_rounded_total":total,
        "base_total":total,
        "base_net_total":total,
        "net_total":total,
        "items":itemList,
        "docstatus":1,
        "status":"Closed"
    })
    
    doc.insert(ignore_permissions = True)
    doc.submit()
    return doc
