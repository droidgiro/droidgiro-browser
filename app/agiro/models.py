# coding=UTF-8
from google.appengine.ext import db
import os
from datetime import datetime, time, date
import time

SIMPLE_TYPES = (int, long, float, bool, dict, basestring, list)

class Invoice(db.Model):
    user = db.UserProperty()
    reference = db.StringProperty()
    amount = db.StringProperty()
    document_type = db.StringProperty()
    date = db.DateTimeProperty(auto_now_add=True)

    def to_dict(self):
        # to_dict taken from posten-mock[1] by Johan Mjönes and the stack
        # overflow[2] answer by David Wilson. Thanks to both of you.
        # [1] https://github.com/nollbit/posten-mock
        # [2] http://stackoverflow.com/questions/1531501/json-serialization-of-google-app-engine-models
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

