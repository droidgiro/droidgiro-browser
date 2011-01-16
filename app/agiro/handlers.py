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
import md5
from django.utils import simplejson
from agiro.models import Invoice

class MainPage(webapp.RequestHandler):
    def get(self):
        template_values = {}

        path = os.path.join(os.path.dirname(__file__), '../templates/index.html')
        self.response.out.write(template.render(path, template_values))

class InvoiceHandler(webapp.RequestHandler):
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

class RegisterHandler(webapp.RequestHandler):
    def get(self):
        # TODO: Generate pin and channel name and verify that it's available
        identifier = random.randint(1000, 9999)
        token = channel.create_channel(str(identifier))

        self.response.headers.add_header("Content-Type", 'application/json; charset=utf-8')
        self.response.out.write(simplejson.dumps({
            'token': token,
            'identifier': identifier,
        }))

    def post(self):
        # TODO: Verify pin and channel.
        pin = self.request.get('pin')
        m = md5.new()
        m.update(str(random.randint(1000, 99999)))
        channel = m.hexdigest()

        self.response.headers.add_header("Content-Type", 'application/json; charset=utf-8')
        self.response.out.write(simplejson.dumps({
            'channel': channel,
        }))


