import os, time, http.server

from flask import Flask, request, abort, jsonify, make_response
import argparse

import browser, search

app = Flask(__name__)

mime_types = {
    '.css': 'text/css',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip',
}

def get_mime_type(path): return next((v for k, v in mime_types.items() if k in path), 'text/html')

@app.route('/close', methods=['GET'])
def close_browser():
    backgrond_browser.close()
    return "<h1>Browser had been closed.</h1>"

@app.route('/<path:path>', methods=['GET'])
def index(path):
    try: return open(os.path.join('.\\', path.lstrip('/').split('?')[0]), 'rb').read().decode(), 200, {'Content-Type': get_mime_type(path) + '; charset=utf-8'}
    except: abort(404)

@app.route('/search', methods=['GET'])
def Search_html(): return index('/search/search.html')

@app.route('/search', methods=['POST'])
def Search(): 
    if backgrond_browser.browser_state == False:
        backgrond_browser.reboot()
        time.sleep(8)
    return jsonify(search.get_info(backgrond_browser, request.args['keyword'], request.args['pages'], request.args['restricted_domains']))

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("-b", "--ban", action="store_true", help="Disable local browser")
    parser.add_argument("-c", "--clean", action="store_true", help="Clean Local Temp File")
    parser.add_argument("-d", "--debug", action="store_true", help="Enable debug mode")
    args = parser.parse_args()
    if args.clean:
        os.system('del /s /q "%AppData%\\..\\Local\\Temp\\*.*" &')
    backgrond_browser = browser.Browser(debug=args.debug)
    if not args.ban:
        client = browser.Browser(debug=True)
        client.driver.execute_script('window.open("http://localhost:114/search")')
        client.driver.switch_to.window(client.driver.window_handles[0])
        client.driver.close()
        client.driver.switch_to.window(client.driver.window_handles[0])
    app.run(host='localhost', port=114)
