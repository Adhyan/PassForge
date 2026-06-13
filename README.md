# ⬡ PassForge — Secure Password Generator

A full-stack password generator with a sleek dark UI. Built with **Python (Flask)** on the backend and **HTML/CSS/JavaScript** on the frontend.

![PassForge Screenshot](https://via.placeholder.com/800x400/0a0a0f/7c3aed?text=PassForge+Password+Generator)

---

## ✨ Features

- 🔐 **Cryptographically secure** — powered by Python's `secrets` module (not `random`)
- ⚡ **Instant generation** — generate 1–10 passwords at once
- 🎛️ **Full control** — toggle uppercase, lowercase, numbers, symbols
- 🚫 **Exclude ambiguous characters** — avoids `0`, `O`, `l`, `1`, `I`
- 📏 **Adjustable length** — 4 to 128 characters
- 🧮 **Entropy calculator** — shows exact entropy in bits per password
- 🔥 **Strength meter** — Very Weak → Very Strong with color coding
- 🔍 **Password analyzer** — analyze any existing password's strength
- 📋 **One-click copy** — copy any generated password instantly
- 📱 **Responsive design** — works on desktop and mobile

---

## 🛠️ Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Backend  | Python 3.x + Flask      |
| Frontend | HTML5, CSS3, Vanilla JS |
| Security | `secrets` module (CSPRNG)|

---

## 🚀 Getting Started

### Prerequisites

- Python 3.8 or higher
- pip

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/passforge.git
   cd passforge
   ```

2. **Create a virtual environment** (recommended)
   ```bash
   python -m venv venv

   # On Windows:
   venv\Scripts\activate

   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the app**
   ```bash
   python app.py
   ```

5. **Open your browser** and go to:
   ```
   http://localhost:5000
   ```

---

## 📁 Project Structure

```
passforge/
├── app.py              # Flask backend + API routes
├── requirements.txt    # Python dependencies
├── .gitignore
├── README.md
├── templates/
│   └── index.html      # Main HTML page
└── static/
    ├── style.css       # All styles (dark theme)
    └── script.js       # Frontend logic
```

---

## 🔌 API Reference

### `POST /api/generate`

Generates one or more passwords.

**Request Body:**
```json
{
  "length": 16,
  "uppercase": true,
  "lowercase": true,
  "digits": true,
  "symbols": true,
  "exclude_ambiguous": false,
  "count": 1
}
```

**Response:**
```json
{
  "passwords": [
    {
      "password": "xK#9mP@2nQrL!vZ5",
      "entropy": 104.86,
      "strength": {
        "label": "Very Strong",
        "score": 5,
        "color": "#00e676"
      }
    }
  ]
}
```

---

### `POST /api/analyze`

Analyzes the strength of an existing password.

**Request Body:**
```json
{
  "password": "myPassword123"
}
```

**Response:**
```json
{
  "length": 13,
  "has_lowercase": true,
  "has_uppercase": true,
  "has_digits": true,
  "has_symbols": false,
  "entropy": 77.6,
  "strength": {
    "label": "Strong",
    "score": 4,
    "color": "#00c851"
  }
}
```

---

## 🔒 Security Notes

- Passwords are generated using Python's `secrets.choice()` — a cryptographically secure pseudorandom number generator (CSPRNG) suitable for security-sensitive applications.
- No passwords are stored, logged, or transmitted beyond your local machine.
- Each selected character class is always guaranteed at least one character in the output.

---

## 📜 License

MIT License — feel free to use, modify, and distribute.

---

## 🙌 Contributing

Pull requests are welcome! For major changes, please open an issue first.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
