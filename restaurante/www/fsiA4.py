# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# MIT License. See license.txt

from __future__ import unicode_literals

import frappe
from frappe import _
from six.moves.urllib.parse import parse_qs
from frappe.twofactor import get_qr_svg_code
from frappe.utils.response import build_response

def get_context(context):
  try:
    context.no_cache = 1
    context.ola="ola"
    contex.query = get_query_key()
  except:
    frappe.throw(_('Not Permitted'), frappe.PermissionError)
def get_query_key():
  try:
    query = frappe.local.form_dict['k']
    return query
  except:
    frappe.throw(_('Not Permitted'), frappe.PermissionError)


