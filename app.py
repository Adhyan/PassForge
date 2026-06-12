from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import secrets
import string
import math

app = Flask(__name__)
CORS(app)


def calculate_entropy(password: str) -> float:
    charset = 0
    if any(c.islower() for c in password):
        charset += 26
    if any(c.isupper() for c in password):
        charset += 26
    if any(c.isdigit() for c in password):
        charset += 10
    if any(c in string.punctuation for c in password):
        charset += 32
    if charset == 0:
        return 0.0
    return len(password) * math.log2(charset)


def get_strength(entropy: float) -> dict:
    if entropy < 28:
        return {"label": "Very Weak", "score": 1, "color": "#ff4444"}
    elif entropy < 36:
        return {"label": "Weak", "score": 2, "color": "#ff8c00"}
    elif entropy < 60:
        return {"label": "Fair", "score": 3, "color": "#ffd700"}
    elif entropy < 80:
        return {"label": "Strong", "score": 4, "color": "#00c851"}
    else:
        return {"label": "Very Strong", "score": 5, "color": "#00e676"}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/generate", methods=["POST"])
def generate_password():
    data = request.get_json()

    length = int(data.get("length", 16))
    use_uppercase = data.get("uppercase", True)
    use_lowercase = data.get("lowercase", True)
    use_digits = data.get("digits", True)
    use_symbols = data.get("symbols", True)
    exclude_ambiguous = data.get("exclude_ambiguous", False)
    count = int(data.get("count", 1))

    # Clamp values
    length = max(4, min(128, length))
    count = max(1, min(10, count))

    charset = ""
    if use_lowercase:
        charset += string.ascii_lowercase
    if use_uppercase:
        charset += string.ascii_uppercase
    if use_digits:
        charset += string.digits
    if use_symbols:
        charset += string.punctuation

    if exclude_ambiguous:
        ambiguous = "0O1lI|`"
        charset = "".join(c for c in charset if c not in ambiguous)

    if not charset:
        return jsonify({"error": "At least one character type must be selected."}), 400

    passwords = []
    for _ in range(count):
        # Guarantee at least one char from each selected group
        required = []
        pool = list(charset)

        if use_lowercase:
            src = string.ascii_lowercase
            if exclude_ambiguous:
                src = "".join(c for c in src if c not in "0O1lI|`")
            if src:
                required.append(secrets.choice(src))
        if use_uppercase:
            src = string.ascii_uppercase
            if exclude_ambiguous:
                src = "".join(c for c in src if c not in "0O1lI|`")
            if src:
                required.append(secrets.choice(src))
        if use_digits:
            src = string.digits
            if exclude_ambiguous:
                src = "".join(c for c in src if c not in "01")
            if src:
                required.append(secrets.choice(src))
        if use_symbols:
            src = string.punctuation
            if exclude_ambiguous:
                src = "".join(c for c in src if c not in "0O1lI|`")
            if src:
                required.append(secrets.choice(src))

        remaining_length = length - len(required)
        remaining = [secrets.choice(pool) for _ in range(max(0, remaining_length))]
        password_list = required + remaining
        secrets.SystemRandom().shuffle(password_list)
        password = "".join(password_list[:length])
        passwords.append(password)

    result_passwords = []
    for pwd in passwords:
        entropy = calculate_entropy(pwd)
        strength = get_strength(entropy)
        result_passwords.append({
            "password": pwd,
            "entropy": round(entropy, 2),
            "strength": strength,
        })

    return jsonify({"passwords": result_passwords})


@app.route("/api/analyze", methods=["POST"])
def analyze_password():
    data = request.get_json()
    password = data.get("password", "")

    if not password:
        return jsonify({"error": "No password provided."}), 400

    entropy = calculate_entropy(password)
    strength = get_strength(entropy)

    analysis = {
        "length": len(password),
        "has_lowercase": any(c.islower() for c in password),
        "has_uppercase": any(c.isupper() for c in password),
        "has_digits": any(c.isdigit() for c in password),
        "has_symbols": any(c in string.punctuation for c in password),
        "entropy": round(entropy, 2),
        "strength": strength,
    }

    return jsonify(analysis)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
