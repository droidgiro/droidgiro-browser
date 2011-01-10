from google.appengine.api import users
from google.appengine.api import channel
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db
from google.appengine.ext.webapp import template
import os
from django.utils import simplejson

class Ocr(db.Model):
    user = db.UserProperty()
    reference = db.StringProperty()
    date = db.DateTimeProperty(auto_now_add=True)

class MainPage(webapp.RequestHandler):
    def get(self):
        user = users.get_current_user()

        if not user:
            return self.redirect(users.create_login_url(self.request.uri))

        ocr_query = db.GqlQuery("SELECT * FROM Ocr WHERE user = :1 ORDER BY date DESC LIMIT 10", user)
        ocr_list = ocr_query.fetch(10)

        token = channel.create_channel(user.user_id())

        # Template support will probably be replaced with client side templates.
        template_values = {
            'ocr_list': ocr_list,
            'token': token,
        }

        path = os.path.join(os.path.dirname(__file__), 'index.html')
        self.response.out.write(template.render(path, template_values))

class OcrHandler(webapp.RequestHandler):
    def post(self):
        user = users.get_current_user()

        if not user:
            self.redirect(users.create_login_url(self.request.uri))
            return

        ocr = Ocr()
        ocr.user = user

        ocr.reference = self.request.get('reference')
        ocr.put()

        response = simplejson.dumps({
            'reference': ocr.reference,
        })

        channel.send_message(user.user_id(), response)

        self.response.headers.add_header("Content-Type", 'application/json; charset=utf-8')
        self.response.set_status(201)
        self.response.out.write(response)

application = webapp.WSGIApplication(
                                     [('/', MainPage),
                                      ('/add', OcrHandler)],
                                     debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
