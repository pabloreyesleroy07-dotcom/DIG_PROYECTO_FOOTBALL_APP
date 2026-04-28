# ⚽ Football Stats Analyzer Pro

## 🌟 Project Motivation
The world of sports analysis and investments is often dominated by intuition and time spent manually evaluating data, which often leads to biased decisions or missed high-value hidden opportunities.

The fundamental motivation behind **Football Stats Analyzer Pro** is to **democratize and automate advanced football data analysis**. We have created a high-performance engine that evaluates thousands of statistical parameters on a global scale in a matter of milliseconds. This tool searches for mathematical "anomalies" and patterns (value bets), transforming tedious human analysis based on spreadsheets into a single-click system. Its clean, modular, and asynchronous architecture aims to deliver precise results in an interface fully accessible to any user profile, guaranteeing maximum technical rigor on the backend.

---

## 🚀 Application Deployment (For All Audiences)

Below are the step-by-step instructions to get the tool running on your own computer. No prior experience is required if you follow the instructions.

### 🪟 Option A: Windows Deployment (From Source Code)
To ensure the best performance on Windows, we will run the application using the Python codebase.

1. **Install Python:** Download and install [Python 3.11 or higher](https://www.python.org/downloads/).
   ⚠️ **IMPORTANT!** During installation, look at the first screen and check the box that says **"Add Python to PATH"** before clicking install.
2. **Download the Project:** Download this repository (click "Download ZIP") or clone it, and extract the folder in an easy-to-find directory (e.g., in Documents, resulting in `C:\Users\YourUser\Documents\Football_Stats`).
3. **Open Command Prompt:** Press the Windows key, type `cmd` and press Enter.
4. **Navigate to the Folder:** Type the following command replacing the path accordingly and press Enter:
   ```cmd
   cd C:\Users\YourUser\Documents\Football_Stats
   ```
5. **Create a Virtual Environment:** To avoid mixing dependencies on your PC, we will create a secure environment (and wait a few seconds):
   ```cmd
   python -m venv venv
   ```
6. **Activate the Environment:** Now we tell Windows to use it:
   ```cmd
   venv\Scripts\activate
   ```
   *(You will see that the command line now starts with `(venv)`, which means it worked!)*
7. **Install Dependencies:** Install all necessary libraries with a single click:
   ```cmd
   pip install -r requirements.txt
   ```
8. **Start the Analyzer:** Start the application with this final command:
   ```cmd
   python run.py
   ```
9. **Done!** Open your favorite web browser (Chrome, Edge, Firefox) and type in the top bar: **`http://127.0.0.1:5000`**

### 🐧 Option B: Linux Deployment (Ubuntu, Debian, Mint...)
For Linux, we have prepared a pre-compiled binary inside this project to make things as easy as possible for you. To start it easily:

1. **Open Terminal:** Go to the `Football_Stats` folder and open a terminal by right-clicking -> "Open terminal here".
2. **Grant Permissions to the Executable:** We need to authorize the binary located in the internal `dist/` folder. Type:
   ```bash
   chmod +x dist/AnalizadorFutbol_Linux
   ```
3. **Start the Analyzer:** Launch the application by running:
   ```bash
   ./dist/AnalizadorFutbol_Linux
   ```
4. **Done!** Open your web browser and go to: **`http://127.0.0.1:5000`**

> 💡 **Alternative (Source Code):** If you prefer to run directly from the source code instead of the binary, repeat the Windows steps adapting step 6 to `source venv/bin/activate` and start with `python3 run.py`.

---

## 🛠️ Usage Examples

**Example 1: Scanning and Predicting Daily Anomalies**
1. Open the application in your web browser.
2. In the main **Dashboard**, use the date picker to choose today's date, and then click the primary start scan button.
3. The engine (thanks to asynchronous technology) will evaluate leagues worldwide simultaneously in a matter of seconds.
4. Review the dynamic informative panels, which will highlight filtered scenarios such as:
   > `[!!!] VALUE ALERT: The Home Team averages 75% or more in Corners Over 9.5. Market odds out of place (Anomaly).`

**Example 2: Exploration by Specific Leagues**
1. If you do not want to look at matches from secondary or unknown leagues, use the top filters on the Dashboard.
2. You can exclusively check the "Big 5" (Premier League, La Liga, Serie A, etc.).
3. The general report will return not only a list of matches, but a *Confidence* factor based strictly on the last home matches for the Home team, and away matches for the Away team.

**Example 3: Asynchronous API Extraction (Professional Use)**
If you develop Machine Learning models and need to query the underlying mathematics without opening the browser, you can query the enabled port directly by making a GET request locally to the provided endpoint: `http://127.0.0.1:5000/api/v1/stats/...`.

---
## 📄 Additional Details
Check the details about involved developers in [CONTRIBUTING.md](CONTRIBUTING.md), licenses in [LICENSE](LICENSE), and the past update tree in [CHANGELOG.md](CHANGELOG.md).
