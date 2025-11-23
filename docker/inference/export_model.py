"""
Script to export trained model and class names for inference service.
Run this in your Google Colab notebook after training your model.
"""

import tensorflow as tf
import os
import json

def export_model(model, class_names, output_dir="./models"):
    """
    Export trained model and class names for inference service.
    
    Args:
        model: Trained TensorFlow/Keras model
        class_names: List of class names (in order of model output)
        output_dir: Directory to save model and class names
    """
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Save model
    model_path = os.path.join(output_dir, "plant_disease_model.keras")
    print(f"Saving model to {model_path}...")
    model.save(model_path)
    print("Model saved successfully!")
    
    # Save class names
    class_names_path = os.path.join(output_dir, "class_names.txt")
    print(f"Saving class names to {class_names_path}...")
    with open(class_names_path, "w") as f:
        for class_name in class_names:
            f.write(f"{class_name}\n")
    print(f"Saved {len(class_names)} class names!")
    
    # Also save as JSON for reference
    json_path = os.path.join(output_dir, "class_names.json")
    with open(json_path, "w") as f:
        json.dump(class_names, f, indent=2)
    
    print(f"\nExport complete! Files saved to {output_dir}:")
    print(f"  - {model_path}")
    print(f"  - {class_names_path}")
    print(f"  - {json_path}")
    
    return model_path, class_names_path


# Example usage in Colab:
"""
# After training your model, run:

# Get class names from your dataset
class_names = train_dataset.class_names  # or validation_dataset.class_names

# Export model
export_model(model, class_names, output_dir="./models")

# Download the models folder
from google.colab import files
import shutil

# Create zip file
shutil.make_archive("plant_disease_model", "zip", "./models")

# Download
files.download("plant_disease_model.zip")
"""

