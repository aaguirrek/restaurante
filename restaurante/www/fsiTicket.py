# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# MIT License. See license.txt

from __future__ import unicode_literals

import frappe
import json
from frappe import _
from frappe.twofactor import get_qr_svg_code
from frappe.utils.response import build_response
from six.moves.urllib.parse import urlparse, urlencode
from frappe import utils
from frappe.utils import pdf


no_cache = 1
no_sitemap = 1


MONEDA_SINGULAR = 'sol'
MONEDA_PLURAL = 'soles'

CENTIMOS_SINGULAR = 'centimo'
CENTIMOS_PLURAL = 'centimos'

MAX_NUMERO = 999999999999

UNIDADES = (
    'cero',
    'uno',
    'dos',
    'tres',
    'cuatro',
    'cinco',
    'seis',
    'siete',
    'ocho',
    'nueve'
)

DECENAS = (
    'diez',
    'once',
    'doce',
    'trece',
    'catorce',
    'quince',
    'dieciseis',
    'diecisiete',
    'dieciocho',
    'diecinueve'
)

DIEZ_DIEZ = (
    'cero',
    'diez',
    'veinte',
    'treinta',
    'cuarenta',
    'cincuenta',
    'sesenta',
    'setenta',
    'ochenta',
    'noventa'
)

CIENTOS = (
    '_',
    'ciento',
    'doscientos',
    'trescientos',
    'cuatroscientos',
    'quinientos',
    'seiscientos',
    'setecientos',
    'ochocientos',
    'novecientos'
)

def get_context(context):
  tipo =  "B"
  globales = frappe.get_doc("Global Defaults")
  company = frappe.get_doc("Company",globales.default_company)
  sunat = frappe.get_doc("Setup")
  itemsa = []
  cliente = ""
  cliente_ruc = ""
  cliente_direccion = ""
  logo = "None"
  filename=""
  tip = "B"
  sales_invoice = {}
  url = frappe.local.form_dict["c"]

  if company.company_logo is not None :
    logo = company.company_logo


  if url.startswith("BOLETA") :
    tip = "B"
    tipo =  "B"
    comprobante = frappe.get_doc("Boleta", url )
    if comprobante is None:
      frappe.throw(_('Not Found'), frappe.NotFound)
    name = comprobante.serie_documento + "-"+ comprobante.numero_documento
    cliente = comprobante.cliente_denominacion
    total = comprobante.total
    igv = comprobante.total_igv
    subtotal = comprobante.total_gravada
    tipo = "Boleta Electrónica"
    qr = comprobante.qr
    hashe = ""
    

    cliente_ruc = comprobante.cliente_numero_de_documento
    if comprobante.address is not None:
        cliente_direccion = comprobante.address
    if comprobante.filename is not None:
        filename = comprobante.filename
        hashe = comprobante.hash
    
    for item in comprobante.items:
        itemsa.append({
            "idx":item.idx,
            "item_code": item.codigo_interno,
            "item_name": item.codigo_interno,
            "qty":item.cantidad,
            "rate":item.precio_unitario,
            "amount":item.total
        })
  else :
    if url.startswith('FACTURA') :
        tipo =  "F"
        tip = "F"
        comprobante = frappe.get_doc("Factura", url )
        if comprobante is None:
            frappe.throw(_('Not Found'), frappe.NotFound)
        name = comprobante.serie_documento + "-"+ comprobante.numero_documento
        cliente = comprobante.cliente_denominacion
        total = comprobante.total
        igv = comprobante.total_igv
        subtotal = comprobante.total_gravada
        tipo = "Factura de Venta"
        qr = comprobante.qr
        cliente_ruc = comprobante.cliente_numero_de_documento
        if comprobante.address is not None:
            cliente_direccion = comprobante.address
        if comprobante.filename is not None:
            filename = comprobante.filename
            hashe = comprobante.hash
        
        for item in comprobante.items:
            itemsa.append({
                "idx":item.idx,
                "item_code": item.codigo_interno,
                "item_name": item.codigo_interno,
                "qty":item.cantidad,
                "rate":item.precio_unitario,
                "amount":item.total
            })
        else:
            frappe.throw(_('Not Found'), frappe.NotFound)

  if comprobante is None:
      frappe.throw(_('Not Found'), frappe.NotFound)
  domain = frappe.request.url
  domain = domain.split("//")[-1].split("/")[0]
  context.domain = domain
  context.tip = tip
  context.compro = comprobante.name
  context.cliente_ruc = cliente_ruc
  context.cliente_direccion = cliente_direccion
  context.logo = logo
  context.qr = qr
  context.filename = filename
  context.hashe = hashe
  context.company = company
  context.company_name = sunat.razon_social
  context.no_cache = 1
  context.globales = globales
  context.name = name
  context.tipo = tipo
  context.direccion = sunat.direccion
  context.cliente = cliente
  context.items = itemsa
  context.porcentaje_igv = sunat.igv
  context.igv = igv
  context.subtotal = subtotal
  context.total = total
  context.sunat = sunat
  context.letras = numero_a_moneda(float(total))

def numero_a_letras(numero):
    numero_entero = int(numero)
    if numero_entero > MAX_NUMERO:
        raise OverflowError('Número demasiado alto')
    if numero_entero < 0:
        return 'menos %s' % numero_a_letras(abs(numero))
    letras_decimal = ''
    parte_decimal = int(round((abs(numero) - abs(numero_entero)) * 100))
    if parte_decimal > 9:
        letras_decimal = 'punto %s' % numero_a_letras(parte_decimal)
    elif parte_decimal > 0:
        letras_decimal = 'punto cero %s' % numero_a_letras(parte_decimal)
    if (numero_entero <= 99):
        resultado = leer_decenas(numero_entero)
    elif (numero_entero <= 999):
        resultado = leer_centenas(numero_entero)
    elif (numero_entero <= 999999):
        resultado = leer_miles(numero_entero)
    elif (numero_entero <= 999999999):
        resultado = leer_millones(numero_entero)
    else:
        resultado = leer_millardos(numero_entero)
    resultado = resultado.replace('uno mil', 'un mil')
    resultado = resultado.strip()
    resultado = resultado.replace(' _ ', ' ')
    resultado = resultado.replace('  ', ' ')
    if parte_decimal > 0:
        resultado = '%s %s' % (resultado, letras_decimal)
    return resultado


def numero_a_moneda(numero):
    numero_entero = int(numero)
    parte_decimal = int(round((abs(numero) - abs(numero_entero)) * 100))
    centimos = ''
    if parte_decimal == 1:
        centimos = CENTIMOS_SINGULAR
    else:
        centimos = CENTIMOS_PLURAL
    moneda = ''
    if numero_entero == 1:
        moneda = MONEDA_SINGULAR
    else:
        moneda = MONEDA_PLURAL
    letras = numero_a_letras(numero_entero)
    letras = letras.replace('uno', 'un')
    letras_decimal = 'con %s %s' % (numero_a_letras(parte_decimal).replace('uno', 'un'), centimos)
    letras = 'Son: %s %s %s' % (letras, moneda, letras_decimal)
    return letras
  
def leer_decenas(numero):
    if numero < 10:
        return UNIDADES[numero]
    decena, unidad = divmod(numero, 10)
    if numero <= 19:
        resultado = DECENAS[unidad]
    elif numero <= 29:
        resultado = 'veinti%s' % UNIDADES[unidad]
    else:
        resultado = DIEZ_DIEZ[decena]
        if unidad > 0:
            resultado = '%s y %s' % (resultado, UNIDADES[unidad])
    return resultado

def leer_centenas(numero):
    centena, decena = divmod(numero, 100)
    if numero == 0:
        resultado = 'cien'
    else:
        resultado = CIENTOS[centena]
        if decena > 0:
            resultado = '%s %s' % (resultado, leer_decenas(decena))
    return resultado

def leer_miles(numero):
    millar, centena = divmod(numero, 1000)
    resultado = ''
    if (millar == 1):
        resultado = ''
    if (millar >= 2) and (millar <= 9):
        resultado = UNIDADES[millar]
    elif (millar >= 10) and (millar <= 99):
        resultado = leer_decenas(millar)
    elif (millar >= 100) and (millar <= 999):
        resultado = leer_centenas(millar)
    resultado = '%s mil' % resultado
    if centena > 0:
        resultado = '%s %s' % (resultado, leer_centenas(centena))
    return resultado

def leer_millones(numero):
    millon, millar = divmod(numero, 1000000)
    resultado = ''
    if (millon == 1):
        resultado = ' un millon '
    if (millon >= 2) and (millon <= 9):
        resultado = UNIDADES[millon]
    elif (millon >= 10) and (millon <= 99):
        resultado = leer_decenas(millon)
    elif (millon >= 100) and (millon <= 999):
        resultado = leer_centenas(millon)
    if millon > 1:
        resultado = '%s millones' % resultado
    if (millar > 0) and (millar <= 999):
        resultado = '%s %s' % (resultado, leer_centenas(millar))
    elif (millar >= 1000) and (millar <= 999999):
        resultado = '%s %s' % (resultado, leer_miles(millar))
    return resultado

def leer_millardos(numero):
    millardo, millon = divmod(numero, 1000000)
    return '%s millones %s' % (leer_miles(millardo), leer_millones(millon))
