import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.utils.captioning_backends import mock_backend
from src.utils.narrative_backends import mock_narrative_backend
from src.utils.causal_backends import mock_causal_backend
from src.utils.verification_backends import mock_verification_backend
from evaluate_captions import compute_cider_score

class TestPipeline(unittest.TestCase):
    def test_mock_captioning(self):
        result = mock_backend({}, "dummy transcript", scene_id="scene_001")
        self.assertIn("caption", result)
        self.assertIn("action_summary", result)
        self.assertIn("detected_elements", result)
        self.assertIn("keywords", result)
        self.assertTrue(len(result["keywords"]) > 0)

    def test_mock_narrative(self):
        scenes = {
            "scene_001": {"caption": "First scene begins.", "start_time": 0.0, "end_time": 5.0},
            "scene_002": {"caption": "Second scene occurs.", "start_time": 5.0, "end_time": 10.0},
        }
        narrative = mock_narrative_backend(scenes)
        self.assertIsInstance(narrative, str)
        self.assertIn("First scene begins", narrative)
        self.assertIn("Second scene occurs", narrative)

    def test_mock_causal_reasoning(self):
        scenes = {
            "scene_001": {
                "caption": "A person walks on ice.",
                "keywords": ["person", "ice", "walk"],
                "detected_elements": {"primary_actor": "person", "objects": ["ice"]}
            },
            "scene_002": {
                "caption": "The person slips and falls.",
                "keywords": ["person", "slip", "fall"],
                "detected_elements": {"primary_actor": "person", "objects": ["ice"]}
            }
        }
        links = mock_causal_backend(scenes)
        self.assertEqual(len(links), 2)
        self.assertIsNone(links[0]["cause_scene_id"])
        self.assertEqual(links[1]["cause_scene_id"], "scene_001")
        self.assertIn("likely because", links[1]["causal_statement"])

    def test_mock_verification(self):
        scenes = {
            "scene_001": {
                "frame_files": ["non_existent_frame.jpg"],
                "caption": "Sample event"
            }
        }
        claims = [{"scene_id": "scene_001", "causal_statement": "Sample event"}]
        verdicts = mock_verification_backend(claims, scenes)
        self.assertEqual(len(verdicts), 1)
        self.assertEqual(verdicts[0]["verdict"], "unverifiable")

    def test_cider_computation(self):
        ref = "a person is walking down the street on a sunny day"
        hyp = "a person is walking down a city street on a bright day"
        score = compute_cider_score(ref, hyp)
        self.assertIsInstance(score, float)
        self.assertGreater(score, 0.0)

if __name__ == "__main__":
    unittest.main()
