# models/registry.py
from models.handlers.ann_s0_eps10.handler import AnnS0Eps10Handler

# Registry mapping model version to handler class
model_class_registry = {
    "v1124": AnnS0Eps10Handler,
}
