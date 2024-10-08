# AI Learning Experience

An interactive application that lets you explore the basics of Convolutional Neural Networks (CNNs). Draw digits, train a CNN on your own drawings, and make predictions to see machine learning in action!

## Features

- **Drawing Interface**: Use the canvas to draw digits from 0-9.
- **Model Training**: Train a CNN on your own drawings to recognize handwritten digits.
- **Layer Visualization**: Learn about different layers in a CNN, including convolutional, pooling, and fully connected layers.
- **Prediction Mode**: Test the trained model by drawing new digits and seeing the predictions.

## Getting Started

### Prerequisites

- **Node.js**: Install [Node.js](https://nodejs.org/) (version 14 or higher recommended).
- **Rust**: Install [Rust](https://www.rust-lang.org/tools/install) and the Cargo package manager.
- **Tauri CLI**: Install the Tauri CLI globally:
  ```bash
  cargo install tauri-cli
  ```

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   cd your-repo-name
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

### Running the Application

To start the application in development mode:

```bash
npm run tauri:dev
```

### Building for Production

To build the application for production:

```bash
npm run tauri:build
```
