import json
import re
from http.server import BaseHTTPRequestHandler, HTTPServer
from routes import (
    handle_accept_request,
    handle_add_trusted,
    handle_create_journey,
    handle_create_request,
    handle_get_journeys,
    handle_get_matches,
    handle_get_trust,
    handle_get_trusted,
    handle_login,
    handle_register,
    handle_reject_request,
    handle_submit_rating,
    seed_demo_data,
)

PORT = 5000

class CoJourneyRequestHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(204)

    def _read_body(self):
        length = int(self.headers.get("Content-Length", 0))
        if length > 0:
            raw = self.rfile.read(length).decode("utf-8")
            try:
                return json.loads(raw)
            except Exception:
                return {}
        return {}

    def do_GET(self):
        path = self.path.split("?")[0]

        if path == "/journeys":
            res = handle_get_journeys()
            self._set_headers(res["status"])
            self.wfile.write(json.dumps(res["data"]).encode("utf-8"))
            return

        match = re.match(r"^/matches/([^/]+)$", path)
        if match:
            j_id = match.group(1)
            res = handle_get_matches(j_id)
            self._set_headers(res["status"])
            self.wfile.write(json.dumps(res["data"]).encode("utf-8"))
            return

        trust_match = re.match(r"^/users/([^/]+)/trust$", path)
        if trust_match:
            u_id = trust_match.group(1)
            res = handle_get_trust(u_id)
            self._set_headers(res["status"])
            self.wfile.write(json.dumps(res["data"]).encode("utf-8"))
            return

        if path == "/trusted":
            res = handle_get_trusted()
            self._set_headers(res["status"])
            self.wfile.write(json.dumps(res["data"]).encode("utf-8"))
            return

        self._set_headers(404)
        self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode("utf-8"))

    def do_POST(self):
        path = self.path
        body = self._read_body()

        if path == "/register":
            res = handle_register(body)
            self._set_headers(res["status"])
            self.wfile.write(json.dumps(res["data"]).encode("utf-8"))
            return

        if path == "/login":
            res = handle_login(body)
            self._set_headers(res["status"])
            self.wfile.write(json.dumps(res["data"]).encode("utf-8"))
            return

        if path == "/journeys":
            res = handle_create_journey(body)
            self._set_headers(res["status"])
            self.wfile.write(json.dumps(res["data"]).encode("utf-8"))
            return

        if path == "/requests":
            res = handle_create_request(body)
            self._set_headers(res["status"])
            self.wfile.write(json.dumps(res["data"]).encode("utf-8"))
            return

        if path == "/ratings":
            res = handle_submit_rating(body)
            self._set_headers(res["status"])
            self.wfile.write(json.dumps(res["data"]).encode("utf-8"))
            return

        if path == "/trusted":
            res = handle_add_trusted(body)
            self._set_headers(res["status"])
            self.wfile.write(json.dumps(res["data"]).encode("utf-8"))
            return

        self._set_headers(404)
        self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode("utf-8"))

    def do_PUT(self):
        path = self.path

        acc_match = re.match(r"^/requests/([^/]+)/accept$", path)
        if acc_match:
            req_id = acc_match.group(1)
            res = handle_accept_request(req_id)
            self._set_headers(res["status"])
            self.wfile.write(json.dumps(res["data"]).encode("utf-8"))
            return

        rej_match = re.match(r"^/requests/([^/]+)/reject$", path)
        if rej_match:
            req_id = rej_match.group(1)
            res = handle_reject_request(req_id)
            self._set_headers(res["status"])
            self.wfile.write(json.dumps(res["data"]).encode("utf-8"))
            return

        self._set_headers(404)
        self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode("utf-8"))

def run():
    seed_demo_data()
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, CoJourneyRequestHandler)
    print(f"[*] CoJourney Python Backend running on http://localhost:{PORT}")
    httpd.serve_forever()

if __name__ == "__main__":
    run()
