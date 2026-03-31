from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)

# ✅ Enable CORS properly
CORS(app, resources={r"/*": {"origins": "*"}})

DB_NAME = "database.db"

# 📌 Create DB
def init_db():
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS scans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT NOT NULL,
                risk TEXT NOT NULL,
                score INTEGER NOT NULL
            )
        """)
        conn.commit()

init_db()

# 🏠 Root route (optional but useful)
@app.route('/')
def home():
    return jsonify({"message": "Quantum Scanner Backend Running 🚀"})

# 🚀 Save Scan
@app.route('/save-scan', methods=['POST'])
def save_scan():
    try:
        data = request.get_json()

        # ✅ Validation
        if not data:
            return jsonify({"error": "No data provided"}), 400

        url = data.get("url")
        risk = data.get("risk")
        score = data.get("score")

        if not url or not risk or score is None:
            return jsonify({"error": "Missing fields"}), 400

        # ✅ Save to DB
        with sqlite3.connect(DB_NAME) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO scans (url, risk, score) VALUES (?, ?, ?)",
                (url, risk, score)
            )
            conn.commit()

        return jsonify({"message": "Scan saved successfully!"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 📜 Get History
@app.route('/get-history', methods=['GET'])
def get_history():
    try:
        with sqlite3.connect(DB_NAME) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT url, risk, score FROM scans ORDER BY id DESC")
            rows = cursor.fetchall()

        history = [
            {"url": row[0], "risk": row[1], "score": row[2]}
            for row in rows
        ]

        return jsonify(history)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ▶️ Run Server (IMPORTANT FIX)
if __name__ == '__main__':
    app.run(debug=True, threaded=True)