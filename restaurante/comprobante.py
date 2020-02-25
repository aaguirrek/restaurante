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
def set(form):
    form = json.loads(form)
    serie = "FACTURA"
    if form["doctype"] == "Boleta":
        serie = "BOLETA"
    doc = frappe.get_doc({
        "doctype":form["doctype"],
        "naming_series": serie+"-.YYYY.-.MM.-.#######",
        "cliente_numero_de_documento":form["cliente"]["numero_documento"],
        "cliente_denominacion":form["cliente"]["razon_social"],
        "cliente_email":form["cliente"]["cliente_email"],
        "cliente_address":form["cliente"]["direccion"],
        "total":form["total"]["total"],
        "total_igv":form["total"]["total_igv"],
        "total_gravada":form["total"]["total_gravada"],
        "total_descuento":form["total"]["total_descuento"],
        "items":form["items"],
        "serie_documento":form["documento"]["serie_documento"],
        "numero_documento":form["documento"]["numero_documento"],
        "codigo_tipo_operacion":form["documento"]["codigo_tipo_operacion"],
        "qr":form["documento"]["qr"],
        "filename":form["documento"]["filename"],
        "hash":form["documento"]["hash"],
        "number_to_letter":form["documento"]["number_to_letter"],
        "external_id":form["documento"]["external_id"],
        "xml":form["documento"]["xml"],
        "pdf":form["documento"]["pdf"],
        "cdr":form["documento"]["cdr"],
        "fecha_de_emision":form["fecha"]["fecha_de_emision"],
        "fecha_de_vencimiento":form["fecha"]["fecha_de_vencimiento"]
    })
    doc.insert()
    doc.submit()

    return doc
