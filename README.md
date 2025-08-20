# Materials Property Prediction Backend

This project is a backend service built with FastAPI to support material property prediction and sample design filtering.

## Project Structure

```
.
├── app/
│   ├── api/              # API routing and version control
│   │   ├── v1/           # Versioned API endpoints
│   ├── configs/          # Configuration files
│   └── constants/        # Constant variables
│   ├── schemas/          # Pydantic models for request/response
│   │   ├── request/
│   │   └── response/
│   ├── services/         # Business logic layer
│   ├── utils/            # Utility functions
│   └── main.py           # Application entry point
├── doc/                  # Supporting documentation and test files
│   └── samples/          # Sample request and response json files
├── logs/                 # Runtime logs
├── models/               # Trained model files
│   └── handlers/         # Model handlers
│       ├── ann_s0_eps10/ # Model
│           ├── data/     # model pickle and csv files
│           └── utils/    # model utils scripts
├── sc_al_env.yml         # Conda environment definition
├── start_server.bat      # Windows script to launch the server
└── README.md             # Project introduction
```

## Environment Setup

Using conda (recommended)

```
conda env create -f environment.yml
conda activate sc_al
```

## Running the Server

In development mode:

```
chcp 65001    # Optional: for UTF-8 support on Windows terminal
python -m uvicorn app.main:app --reload
```

Or run using the script on Windows:

```
start_server.bat
```

## Notes

- Make sure to activate the environment before running the server.
- Logs and labels include Unicode characters (e.g. subscript), so UTF-8 support is recommended.
- The frontend request and response data format samples are provided in the `doc/samples` directory.