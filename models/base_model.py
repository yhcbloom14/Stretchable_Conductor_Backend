# models/base_model.py
from abc import ABC, abstractmethod

class BaseModelHandler(ABC):
    @abstractmethod
    def fetch_cluster(self, raw_data: dict):
        pass

    @abstractmethod
    def predict(self, processed_data):
        pass
