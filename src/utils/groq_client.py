import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
import os
import logging
from openai import OpenAI
import time

def get_groq_keys():
    keys = []
    # Add primary key
    key = os.getenv("GROQ_API_KEY")
    if key and key not in keys:
        keys.append(key)
    
    # Add numbered keys
    i = 1
    while True:
        key = os.getenv(f"GROQ_API_KEY_{i}")
        if not key:
            break
        if key not in keys:
            keys.append(key)
        i += 1
    
    return keys

def execute_with_groq_failover(create_func, *args, **kwargs):
    """
    Executes a function that uses the Groq API (via OpenAI client) with automatic key failover.
    `create_func` is a callable that takes a `client` as its first argument.
    """
    keys = get_groq_keys()
    if not keys:
        raise ValueError("No GROQ_API_KEY or GROQ_API_KEY_X found in environment.")

    last_error = None
    for attempt, api_key in enumerate(keys):
        client = OpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")
        try:
            return create_func(client, *args, **kwargs)
        except Exception as e:
            last_error = e
            error_str = str(e).lower()
            if "429" in error_str or "rate limit" in error_str or "connection" in error_str:
                next_key = keys[attempt + 1] if attempt + 1 < len(keys) else None
                if next_key:
                    logging.warning(f"[Groq Failover] Rate limit/error on key ending in ...{api_key[-4:]}. Automatically switching to next key...")
                    time.sleep(1)
                    continue
            # If it's not a rate limit or we're out of keys, raise it
            raise e
            
    raise last_error
