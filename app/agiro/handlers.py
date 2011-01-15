# coding=UTF-8

from google.appengine.api import users
from google.appengine.api import channel
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext import db
import os
from datetime import datetime, time, date
import time
import random
from django.utils import simplejson
from agiro.models import Invoice

class MainPage(webapp.RequestHandler):
    def get(self):
        user = users.get_current_user()

        if not user:
            return self.redirect(users.create_login_url(self.request.uri))

        invoice_query = db.GqlQuery("SELECT * FROM Invoice WHERE user = :1 ORDER BY date DESC LIMIT 10", user)
        invoice_list = invoice_query.fetch(10)

        token = channel.create_channel(user.user_id())

        # Template support will probably be replaced with client side templates.
        template_values = {
            'invoice_list': invoice_list,
            'token': token,
        }

        path = os.path.join(os.path.dirname(__file__), '../templates/index.html')
        self.response.out.write(template.render(path, template_values))

class InvoiceHandler(webapp.RequestHandler):

    def get(self, invoice_id):
        #if not self.request.headers.get('"X-Same-Domain"'):
        #    self.response.set_status(400)
        #    self.response.out.write('Missing header')
        #    return

        user = users.get_current_user()
        if not user:
            self.response.set_status(401)
            self.response.headers.add_header("Content-Type", 'application/json; charset=utf-8')
            self.response.out.write(simplejson.dumps("Unauthorized"))
            return

        if invoice_id is None:
            invoice_query = db.GqlQuery("SELECT * FROM Invoice WHERE user = :1 ORDER BY date DESC LIMIT 10", user)
            invoice_list = invoice_query.fetch(10)

            response_dict = [i.to_dict() for i in invoice_list]
            json_response = simplejson.dumps(response_dict)
        else:
            json_response = simplejson.dumps("Not supported...")

        self.response.headers.add_header("Content-Type", 'application/json; charset=utf-8')
        self.response.out.write(json_response)

    def post(self, invoice_id):
        user = users.get_current_user()

        if not user:
            self.response.set_status(401)
            self.response.headers.add_header("Content-Type", 'application/json; charset=utf-8')
            self.response.out.write(simplejson.dumps("Unauthorized"))
            return

        invoice = Invoice()
        invoice.user = user
        invoice.reference = self.request.get('reference')
        document_type = self.request.get('document_type', None)
        if document_type:
            invoice.document_type = document_type
        amount = self.request.get('amount', None)
        if amount:
            invoice.amount = amount
        invoice.put()

        response = simplejson.dumps({
            'reference': invoice.reference,
            'document_type': invoice.document_type,
            'amount': invoice.amount,
        })

        token = channel.create_channel(user.user_id())
        channel.send_message(user.user_id(), response)

        self.response.headers.add_header("Content-Type", 'application/json; charset=utf-8')
        self.response.set_status(201)
        self.response.out.write(response)

class InvoiceV2Handler(webapp.RequestHandler):
    def post(self, invoice_id):
        identifier = self.request.get('identifier')

        if not identifier:
            self.response.set_status(401)
            self.response.headers.add_header("Content-Type", 'application/json; charset=utf-8')
            self.response.out.write(simplejson.dumps("Unauthorized"))
            return

        invoice = {}
        invoice.setdefault('reference', self.request.get('reference'))
        invoice.setdefault('type', self.request.get('type'))
        invoice.setdefault('amount', self.request.get('amount'))

        response = simplejson.dumps(invoice)

        channel.send_message(str(identifier), response)

        self.response.headers.add_header("Content-Type", 'application/json; charset=utf-8')
        self.response.set_status(201)
        self.response.out.write(response)

    def get(self, invoice_id):
        token = channel.create_channel(str(1000))
        
        template_values = {
            'token': token,
        }

        path = os.path.join(os.path.dirname(__file__), '../templates/invoices.html')
        self.response.out.write(template.render(path, template_values))
        

class RegisterHandler(webapp.RequestHandler):
    def get(self):
        #identifier = 1000 #random.randint(1000, 9999)
        identifier = random.randint(1000, 9999)
        token = channel.create_channel(str(identifier))

        self.response.headers.add_header("Content-Type", 'application/json; charset=utf-8')
        self.response.out.write(simplejson.dumps({
            'token': token,
            'identifier': identifier,
        }))

