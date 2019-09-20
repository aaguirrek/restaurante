# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# MIT License. See license.txt

from __future__ import unicode_literals

import frappe
import json
from frappe import _
from frappe.twofactor import get_qr_svg_code
from frappe.utils.response import build_response
from six.moves.urllib.parse import urlparse, urlencode


no_cache = 1
no_sitemap = 1


def get_context(context):
  tipo =  frappe.local.form_dict["t"]
  globales = frappe.get_doc("Global Defaults")
  company = frappe.get_doc("Company",globales.default_company)
  sunat = frappe.get_doc("Setup")
  logo = "None"
  formato = "fsiTicket"
  filename=""
  if company.company_logo is not None :
    logo = company.company_logo
  if tipo == "B" :
    comprobante = frappe.get_doc("Boleta", frappe.local.form_dict["c"])
  if tipo == "F" :
    comprobante = frappe.get_doc("Factura", frappe.local.form_dict["c"])
  if sunat.pdf == "A4":
    formato = "fsiA4"
  context.formato = formato
  context.tip = tipo
  context.comprobante = comprobante
  context.logo = logo
  context.nombre = sunat.razon_social
  context.company = company