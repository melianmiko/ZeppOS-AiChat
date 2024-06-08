import logging
from logging.handlers import RotatingFileHandler

formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')


def create_logger(tag: str):
    file_handler = RotatingFileHandler(f"data/{tag}.log",
                                       maxBytes=1048576,
                                       backupCount=10)
    file_handler.setFormatter(formatter)

    screen_handler = logging.StreamHandler()
    screen_handler.setFormatter(formatter)

    logger = logging.getLogger(tag)
    logger.setLevel(logging.DEBUG)
    logger.addHandler(file_handler)
    logger.addHandler(screen_handler)

    return logger
