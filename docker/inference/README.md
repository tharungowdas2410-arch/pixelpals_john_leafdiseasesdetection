# Plant Disease Inference Service

This service loads your trained TensorFlow model and makes predictions on uploaded plant leaf images.

## Setup Instructions

### 1. Export Your Trained Model from Google Colab

After training your model in Colab, run this code to export it:

```python
import tensorflow as tf
import os
import shutil
from google.colab import files

# Get class names from your dataset
class_names = train_dataset.class_names  # or validation_dataset.class_names

# Create models directory
os.makedirs("models", exist_ok=True)

# Save model
model_path = "models/plant_disease_model.keras"
model.save(model_path)
print(f"Model saved to {model_path}")

# Save class names
class_names_path = "models/class_names.txt"
with open(class_names_path, "w") as f:
    for class_name in class_names:
        f.write(f"{class_name}\n")
print(f"Class names saved to {class_names_path}")

# Create zip file for download
shutil.make_archive("plant_disease_model", "zip", "models")

# Download
files.download("plant_disease_model.zip")
```

### 2. Place Model Files in Your Project

1. Extract the downloaded `plant_disease_model.zip`
2. Copy the `models` folder to `backend/models/` in your project:
   ```
   backend/
   ├── models/
   │   ├── plant_disease_model.keras
   │   └── class_names.txt
   └── docker/
       └── inference/
   ```

### 3. Verify Model Format

Your model should:
- Be saved in Keras format (`.keras` or `.h5`)
- Accept input shape: `(160, 160, 3)` (RGB images)
- Output shape: `(num_classes,)` with softmax activation
- Class names should match the order of model outputs

### 4. Start the Services

```bash
cd backend
docker-compose up --build
```

The inference service will automatically load your model on startup.

## API Endpoints

### Health Check
```bash
GET http://localhost:5000/health
```

Response:
```json
{
  "status": "ok",
  "model_loaded": true,
  "num_classes": 39
}
```

### Prediction
```bash
POST http://localhost:5000/predict
Content-Type: multipart/form-data

Form data:
  image: <image file>
```

Response:
```json
{
  "species": "Tomato",
  "disease": "Early Blight",
  "confidence": 0.9234,
  "severity": "high",
  "quality_index": 87.66
}
```

## Model Requirements

- **Input**: RGB image, 160x160 pixels
- **Output**: Probability distribution over 39 classes
- **Format**: Keras/TensorFlow SavedModel or H5

## Troubleshooting

### Model Not Loading

1. Check that `backend/models/plant_disease_model.keras` exists
2. Verify the model file is not corrupted
3. Check Docker logs: `docker-compose logs inference`

### Wrong Predictions

1. Verify class names match your training data order
2. Check that `class_names.txt` has the same number of classes as your model
3. Ensure image preprocessing matches training (160x160, RGB, normalized)

### Performance Issues

- The model loads on first request (may take 10-30 seconds)
- Subsequent predictions are faster
- Consider using GPU-enabled Docker image for faster inference

## Customization

### Change Model Path

Set environment variable in `docker-compose.yml`:
```yaml
inference:
  environment:
    - MODEL_PATH=/app/models/your_model.keras
    - CLASS_NAMES_PATH=/app/models/your_class_names.txt
```

### Different Image Size

Update `IMG_SIZE` in `app.py` to match your model's input size.

