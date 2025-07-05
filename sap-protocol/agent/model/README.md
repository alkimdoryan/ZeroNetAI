# BitNet Model Directory

This directory contains the BitNet LLM model files for the SAP Protocol Agent.

## Structure

```
model/
├── bitnet-model.bin     # Main model weights (binary format)
├── tokenizer.json       # Tokenizer configuration
├── config.json          # Model configuration
└── vocab.txt            # Vocabulary file
```

## BitNet Model Integration

BitNet is a 1-bit quantized neural network architecture that provides:

- **Extreme Efficiency**: 1-bit weights reduce memory usage by 8x
- **Fast Inference**: Optimized for integer operations
- **zkVM Compatibility**: Simplified arithmetic operations work well with zero-knowledge proofs

## Installation

To use a real BitNet model:

1. Download the model files from the appropriate source
2. Place them in this directory
3. Update the configuration in `../loader.ts`

## Current Status

- **Phase 2.3**: ✅ Model folder created
- **Phase 2.4**: 🔄 zkVM integration in progress
- **Phase 2.6**: 📋 Real forward-pass integration pending

## Files (Placeholder)

For development purposes, placeholder files are used until real BitNet models are integrated.
