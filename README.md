<div align="center">

<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

  <h1>Streamline</h1>

  <p>The fastest path from prompt to production with Gemini.</p>
  <p><strong>A Workflow Map Generator</strong> - Built with AI Studio</p>

  <a href="https://aistudio.google.com/apps">Start building</a>

</div>

---

## 📋 Overview

Streamline is a workflow map generator that helps you visualize and organize your processes. Built with Google's Gemini API and powered by AI Studio, it streamlines the process of creating visual representations of your workflows.

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Python 3.8+** or **Node.js 14+** (depending on your project setup)
- **pip** (Python package manager) or **npm** (Node package manager)
- A **Google Gemini API key** from [AI Studio](https://aistudio.google.com)

### Installation

#### For Python Projects

```bash
# Clone the repository
git clone https://github.com/pmoraf/streamline.git
cd streamline

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### For Node.js Projects

```bash
# Clone the repository
git clone https://github.com/pmoraf/streamline.git
cd streamline

# Install dependencies
npm install
```

### Configuration

1. **Set up your Gemini API Key:**
   - Visit [AI Studio](https://aistudio.google.com/apps)
   - Create or copy your API key
   - Create a `.env` file in the project root:

   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

2. **Environment Variables:**
   - The application will read from your `.env` file
   - Never commit the `.env` file to version control (add it to `.gitignore`)

## ▶️ Running the Application

### Python

```bash
# Run the main application
python main.py

# Or run with specific arguments
python main.py --input workflow.json --output map.svg
```

### Node.js

```bash
# Start the development server
npm start

# Or run with specific scripts
npm run dev
```

### Docker (Optional)

```bash
# Build the Docker image
docker build -t streamline .

# Run the container
docker run -e GEMINI_API_KEY=your_api_key streamline
```

## 📝 Usage Examples

### Basic Workflow Generation

```python
from streamline import WorkflowMapper

mapper = WorkflowMapper(api_key="your_gemini_key")
workflow = mapper.generate_map("Describe your workflow here")
workflow.save("output.svg")
```

## 🛠️ Development

### Run Tests

```bash
# Python
pytest tests/

# Node.js
npm test
```

### Format Code

```bash
# Python
black . && isort .

# Node.js
npm run lint
```

### Build for Production

```bash
# Python
python setup.py build

# Node.js
npm run build
```

## 📚 Project Structure

```
streamline/
├── README.md
├── .env.example           # Example environment variables
├── requirements.txt       # Python dependencies (if applicable)
├── package.json          # Node dependencies (if applicable)
├── src/
│   ├── main.py           # Main entry point
│   ├── workflow_mapper.py
│   └── utils.py
├── tests/
│   └── test_workflow.py
└── docs/
    └── CONTRIBUTING.md
```

## 🔑 API Key Management

⚠️ **Important Security Notes:**
- Never hardcode API keys in your source code
- Use environment variables or secure configuration management
- Add `.env` to `.gitignore`
- Rotate your API keys periodically
- Use different keys for development, staging, and production

## 🐛 Troubleshooting

### Common Issues

**Issue: API Key not found**
- Ensure your `.env` file is in the project root
- Verify the `GEMINI_API_KEY` variable name is correct
- Check that the API key is valid

**Issue: Dependencies not installing**
```bash
# Python: Try upgrading pip
pip install --upgrade pip

# Node: Clear cache and reinstall
npm cache clean --force
npm install
```

**Issue: Module not found errors**
- Ensure the virtual environment is activated (Python)
- Make sure you've installed all dependencies

## 📖 Documentation

For more detailed information, please refer to:
- [Gemini API Documentation](https://ai.google.dev/docs)
- [AI Studio Guide](https://aistudio.google.com/)
- [Contributing Guidelines](./docs/CONTRIBUTING.md)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Contact & Support

For support, please:
- Open an [issue](https://github.com/pmoraf/streamline/issues)
- Check existing discussions
- Contact the maintainers

---

**Built with ❤️ using Google Gemini AI**