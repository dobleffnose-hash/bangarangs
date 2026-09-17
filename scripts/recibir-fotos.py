"""Servidor local mínimo que recibe imágenes por POST y las guarda en fotos-ia/.
Uso: python scripts/recibir-fotos.py   (escucha en http://127.0.0.1:8766)
POST con el cuerpo crudo de la imagen y la cabecera X-Nombre (ej. musc-terracota/ia-1-v1.png).
"""
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent / 'fotos-ia'


class H(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', '*')

    def do_OPTIONS(self):
        self.send_response(204); self._cors(); self.end_headers()

    def do_POST(self):
        nombre = self.headers.get('X-Nombre') or self.path.lstrip('/')
        datos = self.rfile.read(int(self.headers['Content-Length']))
        destino = RAIZ / nombre
        destino.parent.mkdir(parents=True, exist_ok=True)
        destino.write_bytes(datos)
        print('guardado', destino, len(datos) // 1024, 'KB', flush=True)
        self.send_response(200); self._cors(); self.end_headers(); self.wfile.write(b'ok')

    def log_message(self, *a): pass


HTTPServer(('127.0.0.1', 8766), H).serve_forever()
