# utils/logging_config.py
import logging
from logging.handlers import RotatingFileHandler
import os
import sys

def setup_logger(name: str, log_file: str = "app.log", level=logging.INFO) -> logging.Logger:
    os.makedirs("logs", exist_ok=True)
    log_path = os.path.join("logs", log_file)

    file_handler = RotatingFileHandler(log_path, maxBytes=5 * 1024 * 1024, backupCount=3, encoding="utf-8")

    console_handler = logging.StreamHandler(sys.stdout)

    formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] %(name)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)

    logger = logging.getLogger(name)
    logger.setLevel(level)
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    logger.propagate = False

    return logger
