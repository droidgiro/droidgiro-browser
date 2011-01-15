# coding=UTF-8

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from agiro.handlers import MainPage, InvoiceHandler, RegisterHandler, InvoiceV2Handler

def main():
    application = webapp.WSGIApplication([
            ('/', MainPage),
            ('/invoices(?:/(\d+))?', InvoiceHandler),
            ('/v2/invoices(?:/(\d+))?', InvoiceV2Handler),
            ('/register', RegisterHandler)
        ],
        debug=True)
    util.run_wsgi_app(application)

if __name__ == '__main__':
    main()
