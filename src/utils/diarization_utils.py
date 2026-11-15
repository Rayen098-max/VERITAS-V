import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
import os
try:
    from pyannote.audio import Pipeline
except ImportError:
    Pipeline = None
import logging

def run_diarization(audio_path, token=None):
    '''Run speaker diarization on the audio file using PyAnnote and return the segments.'''
    if Pipeline is None:
        logging.warning("pyannote.audio is not available; skipping diarization.")
        return []
    if not token:
        logging.warning("HUGGINGFACE_TOKEN is missing; skipping diarization.")
        return []
    
    logging.info("Running speaker diarization...")
    try:
        pipeline = Pipeline.from_pretrained("pyannote/speaker-diarization", use_auth_token=token)
        diarization = pipeline(audio_path)

        segments = []
        for turn, _, speaker in diarization.itertracks(yield_label=True):
            segments.append({
                "start": turn.start,
                "end": turn.end,
                "speaker": speaker
            })
        return segments
    except Exception as e:
        logging.warning(f"Diarization failed: {e}")
        return []
