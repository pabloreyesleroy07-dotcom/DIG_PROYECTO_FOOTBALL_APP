# 🤝 Contributing Guide: Football Stats Analyzer Pro

Thank you for your interest in collaborating with our project! This analyzer aspires to be the best sports investment tool supported by mathematics in the Open Source community. Whether you are a programmer, data analyst, or simply have good ideas, we would love to have you on board.

## 🚀 How to Contribute

We have designed this workflow to keep the project secure and stable without hindering current asynchronous analysis:

1. **Fork the Project** (Fork it to your user account).
2. **Clone your repository locally**:
   `git clone https://github.com/your-username/Football_Stats.git`
3. **Create your Working Branch**:
   `git checkout -b fix/statistical-error` or `git checkout -b feature/new-cards-scanner`
4. **Program the Improvements**: Ensure you follow the style guidelines defined below.
5. **Make Formal Commits**:
   `git commit -m "Added improvement in the asynchronous filter to include second halves"`
6. **Push the changes to your branch**:
   `git push origin feature/new-cards-scanner`
7. **Open a Pull Request (PR)**: Explain to us in detail what problem your code solves and we will evaluate it for merging into the main core (`main`).

---

## 📐 Style Guidelines
- **Python (PEP 8)**: Use standard Python conventions. Respect the use of lowercase names with underscores (`snake_case`) for variables and functions.
- **Asynchrony**: The heart of the `Engine_Football` is high performance (using `aiohttp`). Avoid programming blocking network functions (classic `requests_sync`) inside the main loop.
- **Security**: Never send `API_KEYS` or static credentials in your commits. Remember to ignore them in your local files (ideally using `.env`).

---

## 🔮 Roadmap and Expansions of Interest

If you are looking for inspiration on how to improve the program, here is our official list of "Expansions of Interest". These points will catapult the Football Stats Analyzer to an institutional level:

### 1. Integration of Instant Alerts (Bots)
Currently, the user must manually scan the "Dashboard" to see anomalies (`Value Bets`).
- *Objective:* Create submodules integrating the **Telegram** or **Discord** API so that it sends an alert beep to the user's mobile at the exact second an unfavorable odd is detected.

### 2. Auto-Correction Machine Learning
The `predicciones.json` file internally evaluates the *Hit Rate*.
- *Objective:* Use libraries like `scikit-learn` or `TensorFlow` so that the analyzer itself changes its asynchronous logic if it detects that its "Corner alerts" are failing lately, creating an autonomous mathematical correction system.

### 3. Bookmaker Odds Websocket API (Live Odds)
The engine currently reads historical statistics and static pre-match odds.
- *Objective:* Connect the project to data ports offering live money movements across different bookmakers (*Pinnacle, Bet365*).

### 4. New Secondary Filters
Almost all simulations operate under "Goals", "Corners", and "Both Teams to Score".
- *Objective:* Implement reading of valuable exotic metrics: `Cards`, `Ball Possession`, and `Fouls / Shots on Target`.

We are looking forward to discovering what you are capable of! If you find a bug and don't dare to solve it through code, feel free to open an *Issue* describing the situation meticulously.
