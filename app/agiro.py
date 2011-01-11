from google.appengine.api import users
from google.appengine.api import channel
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db
from google.appengine.ext.webapp import template
import os
from datetime import datetime, time, date
import time
from django.utils import simplejson

SIMPLE_TYPES = (int, long, float, bool, dict, basestring, list)

class Invoice(db.Model):
    user = db.UserProperty()
    reference = db.StringProperty()
    amount = db.StringProperty()
    document_type = db.StringProperty()
    date = db.DateTimeProperty(auto_now_add=True)

    def to_dict(self):
        model = self
        output = {}
        for key, prop in model.properties().iteritems():
            value = getattr(model, key)

            if value is None or isinstance(value, SIMPLE_TYPES):
                output[key] = value
            elif isinstance(value, date):
                # Convert date/datetime to ms-since-epoch ("new Date()").
                ms = time.mktime(value.utctimetuple()) * 1000
                ms += getattr(value, 'microseconds', 0) / 1000
                output[key] = int(ms)
            elif isinstance(value, db.Model):
                output[key] = to_dict(value)          
            #else:
                #raise ValueError('cannot encode ' + repr(prop))
        output["id"] = model.key().id()
        return output

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

        path = os.path.join(os.path.dirname(__file__), 'index.html')
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

        channel.send_message(user.user_id(), response)

        self.response.headers.add_header("Content-Type", 'application/json; charset=utf-8')
        self.response.set_status(201)
        self.response.out.write(response)

application = webapp.WSGIApplication(
                                     [('/', MainPage),
                                      ('/invoices(?:/(\d+))?', InvoiceHandler)],
                                     debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
