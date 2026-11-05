from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

print('WALL PANEL disponible en http://localhost:3000')
ThreadingHTTPServer(('localhost', 3000), SimpleHTTPRequestHandler).serve_forever()
