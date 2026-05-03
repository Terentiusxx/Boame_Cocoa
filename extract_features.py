# extract_features.py
import os
import joblib
import numpy as np
from tensorflow.keras.models import load_model, Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

# ================================
# 1. SETTINGS
# ================================
DATASET_DIR = "app/ai/datasets"
H5_MODEL_PATH = "app/ai/models/cocoa_image_model.h5"
PKL_MODEL_PATH = "app/ai/models/cocoa_disease_model.pkl"
ENCODER_PATH = "app/ai/models/disease_encoder.pkl"

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 16

# Ensure models folder exists
os.makedirs("app/ai/models", exist_ok=True)

# ================================
# 2. LOAD H5 MODEL & FEATURE EXTRACTION
# ================================
print("Loading .h5 model...")
h5_model = load_model(H5_MODEL_PATH)

# Remove final classification layer for feature extraction
feature_model = Model(inputs=h5_model.input, outputs=h5_model.layers[-2].output)

# ================================
# 3. PREPARE DATA
# ================================
datagen = ImageDataGenerator(rescale=1./255)
data_flow = datagen.flow_from_directory(
    DATASET_DIR,
    target_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    shuffle=False
)

# ================================
# 4. EXTRACT FEATURES
# ================================
print("Extracting features from images...")
features = feature_model.predict(data_flow, verbose=1)
labels = data_flow.classes  # numeric labels

print(f"Features shape: {features.shape}")
print(f"Labels shape: {labels.shape}")

# ================================
# 5. ENCODE LABELS
# ================================
le = LabelEncoder()
labels_encoded = le.fit_transform(labels)
joblib.dump(le, ENCODER_PATH)
print(f"Disease encoder saved at: {ENCODER_PATH}")

# ================================
# 6. TRAIN RANDOM FOREST
# ================================
rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
rf_model.fit(features, labels_encoded)

# ================================
# 7. SAVE MODEL
# ================================
joblib.dump(rf_model, PKL_MODEL_PATH)
print(f"Traditional ML model saved at: {PKL_MODEL_PATH}")

print("All done! Both .pkl files are ready for FastAPI.")