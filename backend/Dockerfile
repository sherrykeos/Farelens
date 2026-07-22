FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir \
    fastapi uvicorn[standard] pydantic-settings httpx \
    pandas numpy scikit-learn xgboost joblib

COPY app/ app/
<<<<<<< HEAD

=======
>>>>>>> 774a9c9566743daca57b5729ecc85d82d8e981f4

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
