import os
import json
import asyncio
import aiohttp
import time
from datetime import datetime, timedelta
from config import Config

class FootballAsyncEngine:
    """
    Asynchronous computation engine for processing extreme volumes of football statistics via REST APIs.
    Utilizes concurrent gathering to map corners, shots, and hit rates while respecting rate limits.
    """
    def __init__(self):
        self.headers = {'x-apisports-key': Config.API_KEY}
        self.benchmarks = {}
        self.seasons_cache = {}
        self.results_cache = {} # Level 2 Caching to avoid re-requesting fixtures/statistics

        # Semaphore limits active connections. Token-like delay ensures we don't exceed API rate limits.
        self.semaphore = asyncio.Semaphore(Config.MAX_CONCURRENT_REQUESTS) 
        self.session = None

    def _log(self, msg):
        """
        Prints a timestamped message to the console for tracking async process lifecycles.
        
        :param msg: String containing the descriptive log message.
        """
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

    def _extract_val(self, stats_list, target_type):
        """
        Extracts a specific statistical value from the API-Sports response dictionary.
        
        :param stats_list: List of dictionary statistics provided by the API.
        :param target_type: String representation of the stat to find (e.g., 'Corner Kicks').
        :return: Integer value of the statistic, or 0 if not found/null.
        """
        for s in stats_list:
            if s['type'] == target_type:
                return s['value'] if s['value'] is not None else 0
        return 0

    async def _fetch(self, endpoint, params, retries=3):
        """
        Asynchronous HTTP wrapper fetching data from the API-Sports REST API.
        Handles rate limit semaphores to prevent connection bans.
        
        :param endpoint: Target API relative path string (e.g. '/fixtures').
        :param params: Dictionary of query parameters.
        :return: Decoded JSON response dictionary.
        """
        for attempt in range(retries):
            async with self.semaphore:
                # Prevents hitting max throughput instantly
                await asyncio.sleep(Config.ESPERA_API) 
                try:
                    async with self.session.get(f"{Config.BASE_URL}{endpoint}", params=params, headers=self.headers, timeout=12) as response:
                        data = await response.json()
                        if "errors" in data and data["errors"]:
                            err = data["errors"]
                            self._log(f"API Error at {endpoint}: {err}")
                            # If we exceed the requests per minute limit, wait a full minute to reset it.
                            if "rateLimit" in err or (isinstance(err, str) and "rate" in err.lower()):
                                self._log("Rate limit hit! Pausing for 60 seconds to reset quota...")
                                await asyncio.sleep(60)
                                continue
                        return data
                except Exception as e:
                    self._log(f"Fetch Exception at {endpoint}: {e}")
                    await asyncio.sleep(2)
        return {}

    async def get_current_season(self, league_id):
        """
        Retrieves the exact active current season year of a given football league ID.
        :param league_id: Numeric identifier for the target league.
        :return: Integer representing the year (e.g. 2025).
        """
        if league_id in self.seasons_cache: return self.seasons_cache[league_id]
        res = await self._fetch("/leagues", {"id": league_id})
        try:
            for s in res.get('response', [])[0]['seasons']:
                if s['current']:
                    self.seasons_cache[league_id] = s['year']
                    return s['year']
        except: pass
        return 2025

    async def get_match_stats(self, fixture_id):
        """
        Fetches detailed endpoint statistics (Corners, Shots, Cards) for a specific match.
        Caches results to avoid duplicate redundant API calls in nested methods.
        
        :param fixture_id: Numeric ID of the match fixture.
        :return: List of structured dictionaries containing team stats, or None if unavailable.
        """
        if fixture_id in self.results_cache: return self.results_cache[fixture_id]
        res = await self._fetch("/fixtures/statistics", {"fixture": fixture_id})
        response = res.get("response", [])
        if len(response) < 2: return None
        results = []
        for team_data in response:
            s = team_data['statistics']
            results.append({
                'id': team_data['team']['id'],
                'name': team_data['team']['name'],
                'tap': self._extract_val(s, "Shots on Goal"),
                't': self._extract_val(s, "Total Shots"),
                'cor': self._extract_val(s, "Corner Kicks"),
                'yc': self._extract_val(s, "Yellow Cards"),
                'rc': self._extract_val(s, "Red Cards")
            })
        self.results_cache[fixture_id] = results
        return results 

    async def get_league_benchmark(self, league_id, season):
        """
        Computes the baseline statistic averages (Benchmark) across the last 8 finished matches
        in a given league to dynamically identify standard behavioral thresholds.
        
        :param league_id: Numeric ID of the league.
        :param season: Target season year.
        :return: Dictionary object matching the baseline means, or None if fail/insufficient data.
        """
        key = f"{league_id}_{season}"
        if key in self.benchmarks: return self.benchmarks[key]
        
        res = await self._fetch("/fixtures", {"league": league_id, "season": season, "status": "FT", "last": 8})
        matches = res.get("response", [])
        if not matches: return None
        
        sums = {'tap': 0, 't': 0, 'cor': 0, 'yc': 0, 'rc': 0, 'count': 0}
        
        # Parallel fetch for all benchmarks matches statistics
        tasks = [self.get_match_stats(m['fixture']['id']) for m in matches]
        stats_results = await asyncio.gather(*tasks)

        for stats in stats_results:
            if stats:
                for ts in stats:
                    sums['tap'] += ts['tap']; sums['t'] += ts['t']
                    sums['cor'] += ts['cor']; sums['yc'] += ts['yc']; sums['rc'] += ts['rc']
                    sums['count'] += 1

        if sums['count'] > 0:
            bench = {k: v/sums['count'] for k, v in sums.items() if k != 'count'}
            self.benchmarks[key] = bench
            return bench
        return None

    async def get_standings(self, league_id, season):
        """
        Retrieves current rank table positions for all teams in a specific league to assess logical prowess.
        
        :param league_id: Numeric ID of the targeted league.
        :param season: Target season year.
        :return: Dictionary mapping {team_id: rank_integer}.
        """
        res = await self._fetch("/standings", {"league": league_id, "season": season})
        response = res.get("response", [])
        if not response: return {}
        standings_data = {}
        try:
            for league_info in response:
                for standing in league_info['league']['standings']:
                    for team in standing:
                        standings_data[team['team']['id']] = team['rank']
        except: pass
        return standings_data

    def analyze_anomalies(self, l, v, b):
        """
        Executes strict logical/mathematical constraints to detect an outcome anomaly.
        Compares Local (l) and Visitor (v) averages against the League Benchmark (b).
        
        :param l: Local home team statistics dictionary.
        :param v: Visitor away team statistics dictionary.
        :param b: League baseline averages dictionary.
        :return: Tuple containing a boolean flag (if logic values detected) and a list of reasoning strings.
        """
        reasoning = []
        interest = False
        total_reliability = 0
        detected_anomalies = 0
        
        for stat, label in [('tap', 'TAP'), ('t', 'SHOTS'), ('cor', 'CORNERS')]:
            max_stat = max(l[stat], v[stat])
            if b[stat] > 0 and max_stat > b[stat] * 1.5:
                ratio = max_stat / b[stat]
                local_rel = min(99, int(((ratio - 1.5) / 1.0) * 30 + 70))
                reasoning.append(f"      [!!!] {label}: Extreme value detected. (Reliability: {local_rel}%)")
                total_reliability += local_rel
                detected_anomalies += 1
                interest = True

        proj_cor = l['cor'] + v['cor']
        avg_cor = b['cor'] * 2
        if avg_cor > 0 and proj_cor > (avg_cor * 1.15):
            ratio_cor = proj_cor / avg_cor
            cor_rel = min(99, int(((ratio_cor - 1.15) / 0.75) * 30 + 70))
            reasoning.append(f"      [!] CORNERS: Interest in Over (Projection {proj_cor:.1f} vs Media {avg_cor:.1f}). (Reliability: {cor_rel}%)")
            total_reliability += cor_rel
            detected_anomalies += 1
            interest = True

        if b['tap'] > 0 and l['tap'] > b['tap'] * 1.15 and v['tap'] > b['tap'] * 1.15:
            ratio_tap = min(l['tap']/b['tap'], v['tap']/b['tap'])
            tap_rel = min(99, int(((ratio_tap - 1.15) / 0.7) * 30 + 70))
            reasoning.append(f"      [!] BOTH SCORE: Based on high Target Shots volume. (Reliability: {tap_rel}%)")
            total_reliability += tap_rel
            detected_anomalies += 1
            interest = True

        if interest and detected_anomalies > 0:
            average_reliability = int(total_reliability / detected_anomalies)
            traffic_light = "🟢 HIGH" if average_reliability >= 85 else ("🟡 MEDIUM" if average_reliability >= 75 else "🔴 LOW")
            reasoning.insert(0, f"   🚦 GLOBAL CONFIDENCE: {traffic_light} ({average_reliability}%)")

        return interest, reasoning

    async def process_fixture(self, fi, target_date):
        """
        Concurrently manages the full analytical lifecycle for a single upcoming match fixture.
        Dispatches threaded requests fetching H2H, Standings, and Last 5 averages.
        
        :param fi: The fixture dictionary payload object dict.
        :param target_date: Execution date string scope (YYYY-MM-DD).
        :return: Tuple containing (Raw reporting string chunk, Database prediction save dictionary).
        """
        l_id, l_name = fi['league']['id'], fi['league']['name']
        t1, t2 = fi['teams']['home'], fi['teams']['away']
        match_id = str(fi['fixture']['id'])
        hora = fi['fixture']['date'][11:16]
        
        self._log(f"⚙️ Analyzing: {t1['name']} vs {t2['name']}...")
        
        season = await self.get_current_season(l_id)
        
        # Parallel baseline calculations
        standings_task = asyncio.create_task(self.get_standings(l_id, season))
        bench_task = asyncio.create_task(self.get_league_benchmark(l_id, season))
        h2h_task = asyncio.create_task(self._fetch("/fixtures/headtohead", {"h2h": f"{t1['id']}-{t2['id']}", "last": 2, "status": "FT"}))
        res_t1_task = asyncio.create_task(self._fetch("/fixtures", {"team": t1['id'], "last": 5, "status": "FT"}))
        res_t2_task = asyncio.create_task(self._fetch("/fixtures", {"team": t2['id'], "last": 5, "status": "FT"}))
        
        standings, bench, res_h, res_f1, res_f2 = await asyncio.gather(
            standings_task, bench_task, h2h_task, res_t1_task, res_t2_task
        )
        
        p1, p2 = standings.get(t1['id'], "?"), standings.get(t2['id'], "?")
        output_buffer = []

        output_buffer.append("=" * 115)
        output_buffer.append(f"🏆 LEAGUE: {l_name} | ⏰ Time: {hora}")
        output_buffer.append(f"🔥 MATCH: {t1['name']} ({p1}º) vs {t2['name']} ({p2}º)")
        
        if bench:
            output_buffer.append(f"📊 LEAGUE BENCHMARK: TAP:{bench['tap']:.1f} | T:{bench['t']:.1f} | COR:{bench['cor']:.1f} | YC:{bench['yc']:.1f} | RC:{bench['rc']:.2f}")

        # H2H Processing
        h2h_matches = res_h.get("response", [])
        if h2h_matches:
            h2h_stats = await asyncio.gather(*[self.get_match_stats(m['fixture']['id']) for m in h2h_matches])
            for m, s in zip(h2h_matches, h2h_stats):
                if s:
                    hid = m['teams']['home']['id']
                    sh, sa = (s[0], s[1]) if s[0]['id'] == hid else (s[1], s[0])
                    output_buffer.append(f"\n   ⚔️  H2H: [{m['fixture']['date'][:10]}] {sh['name']} {m['goals']['home']}-{m['goals']['away']} {sa['name']}")
                    output_buffer.append(f"         TAP:{sh['tap']}-{sa['tap']} | T:{sh['t']}-{sa['t']} | COR:{sh['cor']}-{sa['cor']} | YC:{sh['yc']}-{sa['yc']} | RC:{sh['rc']}-{sa['rc']}")

        # L5 Processing
        team_data = []
        for team_info, p_rank, res_f in [(t1, p1, res_f1), (t2, p2, res_f2)]:
            output_buffer.append(f"\n   📈 LAST 5 {team_info['name'].upper()}:")
            matches = res_f.get("response", [])
            s_tap, s_t, s_cor, s_yc, s_rc, count = 0, 0, 0, 0, 0, 0
            
            l5_stats = await asyncio.gather(*[self.get_match_stats(p['fixture']['id']) for p in matches])
            for p, st in zip(matches, l5_stats):
                if st:
                    idx = 0 if st[0]['id'] == team_info['id'] else 1
                    ridx = 1 if idx == 0 else 0
                    g_fav, g_con = (p['goals']['home'], p['goals']['away']) if idx == 0 else (p['goals']['away'], p['goals']['home'])
                    output_buffer.append(f"      [{p['fixture']['date'][:10]}] vs {p['teams']['away' if idx==0 else 'home']['name'][:10]} | {g_fav}-{g_con} | TAP:{st[idx]['tap']}-{st[ridx]['tap']} | T:{st[idx]['t']}-{st[ridx]['t']} | COR:{st[idx]['cor']}-{st[ridx]['cor']} | RC:{st[idx]['rc']}-{st[ridx]['rc']}")
                    s_tap += st[idx]['tap']; s_t += st[idx]['t']; s_cor += st[idx]['cor']; s_yc += st[idx]['yc']; s_rc += st[idx]['rc']
                    count += 1
            if count > 0:
                prom = {'name': team_info['name'], 'tap': s_tap/count, 't': s_t/count, 'cor': s_cor/count, 'yc': s_yc/count, 'rc': s_rc/count}
                team_data.append(prom)
                if bench:
                    output_buffer.append(f"      >> AVERAGE: TAP:{prom['tap']:.1f} | T:{prom['t']:.1f} | COR:{prom['cor']:.1f} | YC:{prom['yc']:.1f} | RC:{prom['rc']:.2f}")

        # Final Analytics
        value_detected = False
        prediction_dict = None

        if bench and len(team_data) == 2:
            has_value, reason = self.analyze_anomalies(team_data[0], team_data[1], bench)
            if has_value:
                value_detected = True
                output_buffer.append("\n   💡 LOGICAL ANALYSIS:")
                output_buffer.extend(reason)
                output_buffer.append("=" * 115 + "\n")
                
                tags = []
                for r in reason:
                    if 'CORNERS' in r: tags.append('corners')
                    if 'BOTH SCORE' in r: tags.append('ambos_marcan')
                
                prediction_dict = {
                    "id": match_id,
                    "date": target_date,
                    "home": t1['name'],
                    "away": t2['name'],
                    "tags": tags,
                    "checked": False,
                    "won": False
                }

        ret_val = "\n".join(output_buffer) if value_detected else None
        return ret_val, prediction_dict

    async def execute_async(self, dia="tomorrow"):
        """
        Main orchestration loop for evaluating future bets over all tracked global leagues.
        Maps dates to fixtures, splits tasks concurrently and handles the dynamic local DB saves.
        
        :param dia: Input date mapping (today, tomorrow, YYYY-MM-DD).
        :return: Success/failure message JSON dictionary payload.
        """
        # Match Target Date
        if dia == "today": target_date = datetime.now().strftime("%Y-%m-%d")
        elif dia == "tomorrow": target_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        else:
            try:
                datetime.strptime(dia, "%Y-%m-%d")
                target_date = dia
            except ValueError:
                return {"error": "Invalid date format. Use YYYY-MM-DD."}
                
        day_str = target_date
        leagues = [2, 3, 848, 140, 141, 39, 40, 135, 136, 78, 79, 61, 62, 94, 88, 144, 203, 71, 128, 253, 262, 98, 307, 113, 103, 265, 119, 292]
        
        self._log(f"🚀 Async Scanner V48 analyzing {day_str}: {target_date}...")
        
        async with aiohttp.ClientSession() as session:
            self.session = session
            try:
                res = await self._fetch("/fixtures", {"date": target_date})
                fixtures_obj = [fi for fi in res.get("response", []) if fi['league']['id'] in leagues]
            except Exception as e:
                self._log(f"❌ Initial connection error: {e}")
                return {"error": "Initial connection error a la API."}

            if not fixtures_obj:
                return {"message": f"No fixtures scheduled for {target_date}."}

            # Batch Processing Concurrently
            tasks = [self.process_fixture(fi, target_date) for fi in fixtures_obj]
            results = await asyncio.gather(*tasks)

            # Reconstruct outputs
            valuable_matches = []
            new_predictions = []
            with_anomalies = 0

            for txt_res, pred_dist in results:
                if txt_res and pred_dist:
                    with_anomalies += 1
                    valuable_matches.append(txt_res)
                    new_predictions.append(pred_dist)

            # Merge with persistent state in JSON
            try:
                with open(Config.PREDICCIONES_FILE, 'r', encoding='utf-8') as f:
                    all_predictions = json.load(f)
            except (FileNotFoundError, json.JSONDecodeError):
                all_predictions = []

            for nv in new_predictions:
                if not any(p['id'] == nv['id'] for p in all_predictions):
                    all_predictions.append(nv)

            try:
                with open(Config.PREDICCIONES_FILE, 'w', encoding='utf-8') as f:
                    json.dump(all_predictions, f, indent=4, ensure_ascii=False)
            except Exception as e:
                self._log(f"⚠️ Error saving JSON db: {e}")

            # Write Report locally in reporting dir
            filename = os.path.join(Config.REPORTS_DIR, f"Report_{target_date}.txt")
            with open(filename, "w", encoding="utf-8") as f:
                f.write(f"Matches analyzed ({day_str}): {len(fixtures_obj)}\n")
                f.write(f"Matches with anomalies: {with_anomalies}\n")
                f.write(f"Matches without anomalies: {len(fixtures_obj) - with_anomalies}\n\n")
                f.write("".join(valuable_matches))
            
            self._log(f"✅ Finished (ASYNCHRONOUS). Report: {filename}")
            return {"success": True, "message": "Completed Successfully"}

def run_scan(dia="tomorrow"):
    """
    Synchronous wrapper to properly interface asynchronous loops generated by the Flask backend.
    
    :param dia: Date input format indicator mapped from JSON POST requests.
    :return: Async loop evaluation.
    """
    engine = FootballAsyncEngine()
    return asyncio.run(engine.execute_async(dia=dia))
