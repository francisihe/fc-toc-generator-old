import os
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import tensorflow as tf
import tensorflowjs as tfjs

def convert_model():
    # Create output directory if it doesn't exist
    output_dir = "../public/models/distilgpt2_tfjs"
    os.makedirs(output_dir, exist_ok=True)

    # Load model and tokenizer
    model_name = "distilgpt2"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    
    # Load the model with a simple classification head
    model = AutoModelForSequenceClassification.from_pretrained(
        model_name,
        num_labels=3  # [is_heading, heading_level, confidence]
    )

    # Convert to TensorFlow
    tf_model = convert_to_tensorflow(model)
    
    # Save the TensorFlow.js model
    tfjs.converters.save_keras_model(tf_model, output_dir)
    
    # Save tokenizer vocabulary
    tokenizer.save_pretrained(output_dir)
    
    print(f"Model and tokenizer saved to {output_dir}")

def convert_to_tensorflow(pt_model):
    # Create a simple TensorFlow model architecture
    input_shape = (None, 128)  # Max sequence length of 128
    
    inputs = tf.keras.Input(shape=input_shape[1:])
    
    # Create a simplified architecture for heading detection
    x = tf.keras.layers.Embedding(50257, 768)(inputs)  # DistilGPT-2 vocab size and hidden dim
    x = tf.keras.layers.GlobalAveragePooling1D()(x)
    x = tf.keras.layers.Dense(768, activation='relu')(x)
    x = tf.keras.layers.Dropout(0.1)(x)
    
    # Output layers
    is_heading = tf.keras.layers.Dense(1, activation='sigmoid', name='is_heading')(x)
    heading_level = tf.keras.layers.Dense(1, activation='relu', name='heading_level')(x)
    confidence = tf.keras.layers.Dense(1, activation='sigmoid', name='confidence')(x)
    
    model = tf.keras.Model(inputs=inputs, outputs=[is_heading, heading_level, confidence])
    
    return model

if __name__ == "__main__":
    convert_model()