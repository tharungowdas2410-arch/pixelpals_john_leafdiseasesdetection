# Model Integration Guide

This guide explains how to integrate your trained TensorFlow model with the Plant Disease Spotter backend.

## Overview

The inference service (`backend/docker/inference/`) is a Flask API that:
1. Loads your trained TensorFlow/Keras model
2. Accepts image uploads via HTTP POST
3. Preprocesses images (resize to 160x160, normalize)
4. Makes predictions using your model
5. Returns structured JSON with species, disease, confidence, severity, and quality index

## Quick Start

### Step 1: Export Your Model from Colab

1. Open your training notebook in Google Colab
2. After training, open `backend/models/EXPORT_MODEL_COLAB.md`
3. Copy the export code into a new Colab cell
4. Run it to download `plant_disease_model.zip`

### Step 2: Place Model Files

1. Extract the downloaded zip file
2. Copy the `models` folder contents to `backend/models/`:
   ```
   backend/
   └── models/
       ├── plant_disease_model.keras  ← Your trained model
       └── class_names.txt             ← Class names (one per line)
   ```

### Step 3: Start Services

```bash
cd backend
docker-compose up --build
```

The inference service will automatically load your model on startup.

## Model Requirements

Your model must meet these specifications:

- **Format**: Keras SavedModel (`.keras`) or H5 (`.h5`)
- **Input Shape**: `(None, 160, 160, 3)` - RGB images, 160x160 pixels
- **Output Shape**: `(None, num_classes)` - Softmax probabilities
- **Preprocessing**: Images are normalized to [0, 1] range (divided by 255)

## Class Names Format

The `class_names.txt` file should contain one class name per line, in the same order as your model's output.

**Expected format**: `Plant___Disease` or `Plant___Healthy`

Examples:
```
Apple___Apple_scab
Apple___Black_rot
Apple___Healthy
Tomato___Early_blight
Tomato___Late_blight
Tomato___Healthy
```

The inference service will automatically parse:
- **Species**: Everything before `___`
- **Disease**: Everything after `___` (or "Healthy" if applicable)

## API Response Format

The inference service returns:

```json
{
  "species": "Tomato",
  "disease": "Early Blight",
  "confidence": 0.9234,
  "severity": "high",
  "quality_index": 87.66
}
```

- **species**: Extracted from class name (e.g., "Tomato" from "Tomato___Early_blight")
- **disease**: Extracted from class name (e.g., "Early Blight")
- **confidence**: Model's prediction confidence (0-1)
- **severity**: "low" (<0.5), "medium" (0.5-0.8), or "high" (≥0.8)
- **quality_index**: Health percentage (higher = healthier)

## Testing

### Test the Inference Service

```bash
# Health check
curl http://localhost:5000/health

# Test prediction
curl -X POST http://localhost:5000/predict \
  -F "image=@path/to/test_image.jpg"
```

### Test from Backend

The backend automatically calls the inference service when you upload an image via:
```
POST /api/predict
```

## Troubleshooting

### Model Not Loading

**Symptoms**: Health check shows `"model_loaded": false`

**Solutions**:
1. Verify `backend/models/plant_disease_model.keras` exists
2. Check file permissions
3. View logs: `docker-compose logs inference`
4. Ensure model is saved in Keras format (not just weights)

### Wrong Predictions

**Possible causes**:
1. Class names order doesn't match model outputs
2. Image preprocessing differs from training
3. Model was trained with different input size

**Solutions**:
1. Verify `class_names.txt` matches training order
2. Check that images are preprocessed the same way (160x160, RGB, normalized)
3. Test with known images from your training set

### Performance Issues

**Model loading**: First request takes 10-30 seconds (model loads into memory)
**Subsequent requests**: Should be <1 second

**Optimization**:
- Use TensorFlow Lite for faster inference
- Enable GPU in Docker (requires nvidia-docker)
- Use model quantization for smaller file size

## Customization

### Change Model Path

Edit `docker-compose.yml`:
```yaml
inference:
  environment:
    - MODEL_PATH=/app/models/your_model.keras
    - CLASS_NAMES_PATH=/app/models/your_class_names.txt
```

### Different Image Size

If your model uses a different input size (e.g., 224x224):

1. Update `IMG_SIZE` in `backend/docker/inference/app.py`
2. Rebuild: `docker-compose build inference`

### Custom Preprocessing

Modify the `preprocess_image()` function in `app.py` to match your training preprocessing.

## Model Formats Supported

- ✅ Keras SavedModel (`.keras`) - **Recommended**
- ✅ H5 format (`.h5`)
- ❌ TensorFlow SavedModel (`.pb`) - Not directly supported, convert to Keras first
- ❌ TensorFlow Lite (`.tflite`) - Not yet supported

## Next Steps

1. ✅ Export your model from Colab
2. ✅ Place model files in `backend/models/`
3. ✅ Start services with `docker-compose up`
4. ✅ Test with a sample image
5. ✅ Verify predictions match your expectations

## Support

If you encounter issues:
1. Check Docker logs: `docker-compose logs inference`
2. Test model loading: `curl http://localhost:5000/health`
3. Verify model file integrity
4. Check class names format matches expected structure

