import os
import sys
import unittest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.server.app import app

class TestServerAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_health_endpoint(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")

    def test_history_endpoint(self):
        response = self.client.get("/api/analysis/history")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)

    def test_status_404_on_unknown(self):
        response = self.client.get("/api/analysis/non_existent_id/status")
        self.assertEqual(response.status_code, 404)

    def test_analysis_details_fallback(self):
        response = self.client.get("/api/analysis/analysis_Newvideo")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("scenes", data)
        self.assertIn("trustScore", data)
        self.assertIn("verifications", data)

if __name__ == "__main__":
    unittest.main()
