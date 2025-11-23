# Export Model for Inference Service

Copy and paste this code into a new cell in your Google Colab notebook **after training your model**.

```python
import tensorflow as tf
import os
import shutil
from google.colab import files

# ============================================
# STEP 1: Get your trained model and class names
# ============================================
# Make sure you have:
# - `model`: Your trained TensorFlow/Keras model
# - `class_names`: List of class names in the same order as model outputs

# Get class names from your dataset (if you haven't already)
if 'class_names' not in locals():
    class_names = train_dataset.class_names  # or validation_dataset.class_names
    print(f"Found {len(class_names)} classes:")
    for i, name in enumerate(class_names):
        print(f"  {i}: {name}")

# ============================================
# STEP 2: Create models directory
# ============================================
models_dir = "models"
os.makedirs(models_dir, exist_ok=True)
print(f"\nCreated directory: {models_dir}")

# ============================================
# STEP 3: Save the model
# ============================================
model_path = os.path.join(models_dir, "plant_disease_model.keras")
print(f"\nSaving model to {model_path}...")
model.save(model_path)
print("✓ Model saved successfully!")

# Get model file size
model_size = os.path.getsize(model_path) / (1024 * 1024)  # MB
print(f"  Model size: {model_size:.2f} MB")

# ============================================
# STEP 4: Save class names
# ============================================
class_names_path = os.path.join(models_dir, "class_names.txt")
print(f"\nSaving class names to {class_names_path}...")
with open(class_names_path, "w") as f:
    for class_name in class_names:
        f.write(f"{class_name}\n")
print(f"✓ Saved {len(class_names)} class names!")

# ============================================
# STEP 5: Verify files
# ============================================
print("\n" + "="*50)
print("Verification:")
print("="*50)
print(f"Model file exists: {os.path.exists(model_path)}")
print(f"Class names file exists: {os.path.exists(class_names_path)}")

# Test loading the model
print("\nTesting model load...")
test_model = tf.keras.models.load_model(model_path)
print(f"✓ Model loaded successfully!")
print(f"  Input shape: {test_model.input_shape}")
print(f"  Output shape: {test_model.output_shape}")

# ============================================
# STEP 6: Create zip file and download
# ============================================
print("\n" + "="*50)
print("Creating zip file...")
zip_filename = "plant_disease_model.zip"
if os.path.exists(zip_filename):
    os.remove(zip_filename)

shutil.make_archive("plant_disease_model", "zip", models_dir)
print(f"✓ Created {zip_filename}")

# Download
print(f"\nDownloading {zip_filename}...")
files.download(zip_filename)
print("✓ Download complete!")

print("\n" + "="*50)
print("NEXT STEPS:")
print("="*50)
print("1. Extract the downloaded zip file")
print("2. Copy the 'models' folder to: backend/models/")
print("3. Make sure the structure is:")
print("   backend/models/plant_disease_model.keras")
print("   backend/models/class_names.txt")
print("4. Run: docker-compose up --build")
print("="*50)
```

## Quick Export (Minimal Version)

If you just want to quickly export without all the verification:

```python
import os
import shutil
from google.colab import files

# Save model
os.makedirs("models", exist_ok=True)
model.save("models/plant_disease_model.keras")

# Save class names
with open("models/class_names.txt", "w") as f:
    for name in train_dataset.class_names:
        f.write(f"{name}\n")

# Download
shutil.make_archive("plant_disease_model", "zip", "models")
files.download("plant_disease_model.zip")
```

