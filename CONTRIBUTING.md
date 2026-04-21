# Contributing to Football Stats Analyzer ⚽📈

First off, thank you for considering contributing to Football Stats Analyzer! We welcome enhancements, bug fixes, and data-science optimizations to our algorithmic engine.

## How Can I Contribute?

### 1. Reporting Bugs
If you find a bug regarding prediction miscalculations or unexpected API behavior, please open an Issue. Include:
- Operating system and Python version.
- Exact error traceback from `logs/flask_log.txt`.
- Screenshots of the Dashboard if visual misalignments happen.

### 2. Suggesting Enhancements (Criteria 6e)
We are actively seeking to expand our feature set related to our core strategic objectives (Digital Transformation of Sports Betting). 
Suggestions involving **Machine Learning implementations (Scikit-Learn/TensorFlow)** for predicting fixtures dynamically are highly prized.
Please include detailed mockups or mathematical validation models in your proposals.

### 3. Pull Requests (PR)
When submitting a PR:
1. Ensure the code adheres to **PEP 8** standards.
2. Ensure you have included full **Sphinx Docstrings** for new logic (`core/engine_football.py`) complying with our automated generation flow.
3. Test the deployment locally via `python3 run.py` or compile via PyInstaller to ensure binary packing remains unharmed.
4. Update `CHANGELOG.md` reflecting your modifications.

## Setting Up Your Development Environment
1. Clone the repo and navigate to root.
2. Initialize virtualenv: `python3 -m venv venv && source venv/bin/activate`.
3. Ensure requirements: `pip install flask aiohttp python-dotenv pyarmor pyinstaller pdoc3`.
4. (Warning): If you do not have the custom API-Sports key, contact the maintainers for testing keys, otherwise data pipelines will return `None`.

### Integrations & Interoperability (Criteria 6i, 6k)
If your contribution targets external integrations (e.g. streaming stats to PowerBI, or hooking Webhooks to Telegram for immediate notification of highly profitable predictions), please document your architecture clearly in the `docs/Wiki.md`. 
We value collaborators with skills in Data Engineering and API Middleware (Criteria 6k).
