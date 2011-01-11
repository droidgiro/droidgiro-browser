# agiro server

Proposed backend for the Android OCR scanner project, [agiro](https://github.com/wulax/aGiro).

## API

### Dev server

Start the dev server.

    ./dev_appserver.py /path/to/agiro-server/app/

Get token for the user test@example.com to use in later requests to the server.

    curl http://localhost:8080/_ah/login \
        -d "email=test@example.com&action=Log+In" \
        -c -

Make request to the server with the auth token.

Replace <PLACE COOKIE HERE> with the contents of dev_appserver_login example
`test@example.com:False:185804764220139124118`. That request will then be signed
with test@example.com account token.

    curl http://localhost:8080/invoices \
        -d "reference=123456" \
        -d "document_type=bla" \
        -b "dev_appserver_login="<PLACE COOKIE HERE>"; Path=/;"
        
### Production

Obtain auth token for the user.

    curl https://www.google.com/accounts/ClientLogin \
        -d Email=<YOUR EMAIL> -d Passwd=<YOUR PASSWORD> \
        -d accountType=HOSTED_OR_GOOGLE \
        -d source=agiroapp \
        -d service=ah

This will return something like.

    SID=DQAAA...
    LSID=DQAAA...
    Auth=DQAAA..

Take the content of Auth and use in the next request.

    curl -c - \
    http://agiroapp.appspot.com/_ah/login?auth=DQAAA..&continue=http%3A%2F%2Fagiroapp.appspot.com

This will return the ACSID cookie that we will use when making request to the api.

    #HttpOnly_agiroapp.appspot.com	FALSE	/	FALSE	1294864134	ACSID	AJKiY...

Now we can add new invoices for the authenticated user.

    curl http://agiroapp.appspot.com/invoices \
        -d "reference=123456" \
        -d "document_type=bla" \
        -H "Cookie: ACSID=AJKiY..."

And list the recent added invoices.

    curl http://agiroapp.appspot.com/invoices \
        -H "Cookie: ACSID=AJKiY..."

