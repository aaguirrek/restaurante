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
def get_init(restaurant_table = ""):
  if restaurant_table == "":
    respuesta   = frappe.get_all( "Restaurant Table", order_by="name asc", limit_page_length = 1)
    estado = "sucess"
    get_datos = {}
    if  frappe.db.exists("Restaurant Table Temp", "Restemp-" + respuesta[0].name ):
      get_datos   = frappe.get_doc("Restaurant Table Temp","Restemp-" + respuesta[0].name )
    else:
      estado = "error"
    return {
      "estado": estado,
      "data": get_datos,
      "mesa": respuesta[0]
    }
  else:
    estado = "sucess"
    get_datos = {}
    if  frappe.db.exists("Restaurant Table Temp", "Restemp-" + restaurant_table ):
      get_datos   = frappe.get_doc("Restaurant Table Temp","Restemp-" + restaurant_table )
    else:
      estado = "error"
    return {
      "estado": estado,
      "data": get_datos,
      "mesa": restaurant_table
    }

@frappe.whitelist()
def ckeck_ingredientes_item(id):
  if frappe.db.exists("Ingredientes",{"name":id}):
    return "encontrado"
  else:
    return "no encontrado"
    
@frappe.whitelist()
def sync(restaurant_table, items, ct="Anonimo"):
  items      = json.loads(items)
  restaurant = frappe.get_last_doc("Restaurant")
  globales   = frappe.get_doc( "Global Defaults" )
  stock      = frappe.get_doc( "Stock Settings" )
  customer   = frappe.get_doc( "Customer", ct )
  company    = frappe.get_doc( "Company", globales.default_company )
  menu       = frappe.get_doc( "Restaurant Menu", restaurant.active_menu)
  itemList   = []
  for item in items:
    itemList.append({
      "item_code": item["name"],
      "qty": item["qty"],
      "uom": stock.stock_uom,
      "rate": item["rate"]
    })
 
    
  if not frappe.db.exists("Sales Invoice",{"restaurant_table": restaurant_table, "docstatus":0 }):
    doc = frappe.get_doc({
      "doctype":"Sales Invoice",
      "docstatus":0,
      "naming_series": restaurant.invoice_series_prefix,
      "customer": customer.name,
      "tax_id": customer.tax_id,
      "is_pos": 1,
      "company": globales.default_company,
      "posting_date": frappe.utils.nowdate(),
      "posting_time": frappe.utils.nowtime(),
      "due_date": frappe.utils.nowdate(),
      "currency": globales.default_currency,
      "conversion_rate": 1,
      "selling_price_list": menu.price_list,
      "ignore_pricing_rule": 1,
      "update_stock": 1,
      "apply_discount_on": "Grand Total",
      "set_warehouse": stock.default_warehouse,
      "restaurant_table": restaurant_table,
      "restaurant": restaurant.name,
      "party_account_currency": globales.default_currency,
      "items": itemList,
      "packed_items": [],
      "timesheets": [],
      "taxes": [],
      "advances": [],
      "payment_schedule": [],
      "payments": [],
      "sales_team": []
    })
    doc.insert()
  else:
    docname = frappe.db.get_value('Sales Invoice', {'docstatus': 0 , 'restaurant_table': restaurant_table })
    doc = frappe.get_doc('Sales Invoice',docname )
    doc.customer = customer.name
    doc.docstatus = 0
    doc.tax_id = customer.tax_id
    doc.items=[]
    for iteml in itemList:
      doc.append('items', iteml )
    doc.save()
  return doc

@frappe.whitelist()
def validar(restaurant_table, items, payments, tipoComprobante=0, customer="Anonimo"):
  
  items      = json.loads(items)
  payments   = json.loads(payments)
  customer   = frappe.get_doc( "Customer", customer )
  restaurant = frappe.get_last_doc("Restaurant")
  globales   = frappe.get_doc( "Global Defaults" )
  company    = frappe.get_doc( "Company", globales.default_company )
  stock      = frappe.get_doc( "Stock Settings" )
  sunat      = frappe.get_doc("Setup")
  itemList   = []
  
  
  docname = frappe.db.get_value('Sales Invoice', {'docstatus': 0 , 'restaurant_table': restaurant_table })
  doc = frappe.get_doc('Sales Invoice',docname )
  doc.tax_id = customer.tax_id
  doc.customer = customer.name
  
  doc.items=[]
  for item in items:
    doc.append('items',{
      "item_code": item["name"],
      "qty": item["qty"],
      "uom": stock.stock_uom,
      "rate": item["rate"]
    })
  doc.taxes_and_charges = ""
  if tipoComprobante == 1:
    doc.taxes_and_charges = restaurant.default_tax_template
    doc.append('taxes', {
      "charge_type": "On Net Total",
      "account_head": "VAT - "+str(company.abbr),
      "description": "VAT @ "+str( sunat.igv )+".0",
      "included_in_print_rate": 1,
      "rate": int(sunat.igv)
    })
  for payment in payments:
    doc.append('payments', {
      "mode_of_payment": payment["mode_of_payment"],
      "amount": float(payment["amount"])
    })
  doc.save()
  doc.submit()
  return doc
  
@frappe.whitelist()
def saveTemporal(restaurant_table, items,total,subtotal,igv, customer="Anonimo"):
  items      = json.loads(items)
  globales   = frappe.get_doc( "Global Defaults" )
  customer   = frappe.get_doc( "Customer", customer )
  itemsTemp  = []
  
  for item in items:
    servido = 0
    extras  = ""
    tipo    = "Directo"
    servido = item["servido"]
    extras  = json.dumps(item["extras"])
    tipo    = item["tipo"]
    itemsTemp.append({
      "item": item["name"],
      "qty": item["qty"],
      "rate": item["rate"],
      "extra": extras,
      "servido": servido,
      "tipo": tipo
    })
  
  if frappe.db.exists("Restaurant Table Temp","Restemp-"+restaurant_table):
    temp = frappe.get_doc("Restaurant Table Temp", "Restemp-"+restaurant_table )
    temp.mesa = restaurant_table
    temp.customer =customer.name
    temp.total = total
    temp.subtotal = subtotal
    temp.igv = igv
    temp.items=[]
    for iteml in itemsTemp:
      temp.append('items', iteml )
    
  else:
    temp = frappe.get_doc({
      "doctype":"Restaurant Table Temp",
      "mesa": restaurant_table,
      "customer":customer.name,
      "total": total,
      "subtotal": subtotal,
      "igv": igv,
      "items": itemsTemp
    })
    temp.insert()
  temp.save()
  return temp
  
@frappe.whitelist()
def remove_temporal(restaurant_table):
  
  if frappe.db.exists("Restaurant Table Temp","Restemp-"+restaurant_table):
    doc = frappe.delete_doc("Restaurant Table Temp","Restemp-"+restaurant_table)
  else:
    doc = {"exc_type":"DoesNotExistError"}
  return doc