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

    curl http://localhost:8080/add \
        -d "reference=123456" \
        -b "dev_appserver_login="<PLACE COOKIE HERE>"; Path=/;"
