import os
import sys
import time
import json
import logging
import argparse
import subprocess

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

def run_step(step_name: str, cmd_args: list) -> bool:
    logging.info(f"\n========================================================")
    logging.info(f"==> STEP: {step_name}")
    logging.info(f"Command: {' '.join(cmd_args)}")
    logging.info(f"========================================================")
    start_t = time.time()
    
    res = subprocess.run(cmd_args, cwd=BASE_DIR, capture_output=True, text=True, encoding="utf-8")
    elapsed = time.time() - start_t
    
    if res.stdout:
        print(res.stdout.strip())
    if res.returncode != 0:
        logging.error(f"❌ Step failed with exit code {res.returncode}")
        if res.stderr:
            print(res.stderr.strip())
        return False
    logging.info(f"✅ STEP COMPLETED in {elapsed:.2f}s")
    return True

def orchestrate_all(dry_run: bool = True):
    logging.info("🚀 Initiating VERITAS-V Master Multi-Phase Training Pipeline...")
    overall_start = time.time()

    py = sys.executable

    steps = [
        # Phase 1: Scaled Multi-Domain Data Engine
        ("Phase 1: Multi-Domain SFT Data Generation", [py, "scripts/training/expand_multimodal_dataset.py"]),
        
        # Phase 2: DPO Preference Triplet Mining
        ("Phase 2: 4-Axis Contrastive DPO Triplet Mining", [py, "scripts/training/build_dpo_dataset.py"]),
        
        # Phase 3: Stratified Validation & Splitting
        ("Phase 3: Stratified Data Splitting & Profiling", [py, "scripts/training/validate_and_split_data.py"]),
        
        # Phase 4A: VLM Captioner SFT Training
        ("Phase 4A: Train Veritas-Captioner (QLoRA)", [py, "scripts/training/train_captioner.py"] + (["--dry-run"] if dry_run else [])),
        
        # Phase 4B: LLM Causal Verifier SFT Training
        ("Phase 4B: Train Veritas-CausalVerifier (QLoRA)", [py, "scripts/training/train_reasoner.py"] + (["--dry-run"] if dry_run else [])),
        
        # Phase 4C: Direct Preference Optimization (DPO)
        ("Phase 4C: Direct Preference Optimization (DPO)", [py, "scripts/training/train_dpo_verifier.py"] + (["--dry-run"] if dry_run else [])),
        
        # Phase 5A: Checkpoint Quality Gate Evaluation
        ("Phase 5A: Held-Out Test Evaluation Quality Gate", [py, "scripts/training/evaluate_checkpoints.py"]),
        
        # Phase 5B: LoRA Weight Fusion & Model Registry Export
        ("Phase 5B: LoRA Fusion & Model Manifest Registration", [py, "scripts/training/merge_and_export.py"]),
        
        # Phase 5C: Adversarial Red-Teaming & Calibration Certification
        ("Phase 5C: Adversarial Red-Teaming & Calibration Report", [py, "scripts/training/stress_test_and_redteam.py"]),

        # Phase 6: Local Model Pipeline Smoke Test
        ("Phase 6: End-to-End Local Inference Integration Test", [
            py, "src/pipeline/run_pipeline.py",
            "--video", "media/sample_clip.mp4",
            "--caption-backend", "veritas_local",
            "--causal-backend", "veritas_local",
            "--verification-backend", "veritas_local",
            "--explainability-backend", "veritas_local"
        ])
    ]

    for name, cmd in steps:
        success = run_step(name, cmd)
        if not success:
            logging.error(f" Pipeline halted at {name}.")
            sys.exit(1)

    total_elapsed = time.time() - overall_start
    logging.info(f"\n🎉🎉🎉 ALL 6 TRAINING PHASES EXECUTED & CERTIFIED SUCCESSFULLY in {total_elapsed:.2f}s! 🎉🎉🎉")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Master Orchestrator for VERITAS-V Dual-Model Training Pipeline")
    parser.add_argument("--dry-run", action="store_true", default=True, help="Run in dry-run/scaffold validation mode")
    parser.add_argument("--full-gpu", action="store_true", help="Execute full GPU model training loops")
    args = parser.parse_args()

    orchestrate_all(dry_run=not args.full_gpu)
