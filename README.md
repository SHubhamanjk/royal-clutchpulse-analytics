# Royal ClutchPulse: Elite Pressure Intelligence & Selection Suite

**Developed for**: Rajasthan Royals &bull; *PS SupeRR Selector Season 2 (Round 1: Identify the Most Reliable Players Under Pressure)*  
**Author**: **Shubham Kumar Gupta**  
**Email**: [shubham07kumargupta@gmail.com](mailto:shubham07kumargupta@gmail.com)  
**LinkedIn**: [linkedin.com/in/shubhamiitpatna](https://www.linkedin.com/in/shubhamiitpatna/)  
**GitHub**: [github.com/SHubhamanjk](https://github.com/SHubhamanjk)  
**Institution**: Indian Institute of Technology Patna (IIT Patna)

---

## 1. Executive Summary & Philosophy

High-stakes T20 franchise recruitment traditionally suffers from two fundamental methodological blindspots:
1. **The Phase-Bucket Fallacy**: Arbitrarily classifying Overs 16–20 as "high pressure" regardless of match context, falsely awarding maximum clutch credit to routine death-overs stat padding in one-sided walkovers while ignoring early-innings crisis stabilization.
2. **Small-Sample Noise**: Over-indexing on high-variance cameos (e.g. 10–20 ball cameos) without Bayesian shrinkage toward population expectation.

**Royal ClutchPulse** replaces static heuristics with a continuous, ball-by-ball leverage engine calibrated across **186,780 deliveries** from **2022 onwards (IPL & T20 Internationals)**. Every delivery is evaluated through an **Orthogonal Geometric Gate ($P \in [0, 100]$)**, **Score Value Added (SVA)** across 36 contextual state cells, and **Empirical Bayes (EB) Shrinkage with Kish Effective Sample Size ($N_{eff}$)**.

The frontend is an ultra-fast, zero-dependency analytical cockpit styled in the official **Rajasthan Royals Royal Pink (`#EA1B86`) and Obsidian Plum (`#07050E`, `#100824`)** theme. It runs 100% client-side with instant responsiveness and is fully prepared for one-click static deployment on Netlify or direct local viewing.

---

## 2. Core Architectural Principles

- **Dynamic Win-Probability Leverage (Zero Phase Heuristics)**:  
  Pre-ball win probability swings $L(S_t) = \sum p_o |\Delta WP|$ are evaluated across all 9 possible ball outcomes and combined with logistic task difficulty $T(S_t)$. Dead overs collapse to zero, while early collapse recovery in the powerplay receives elite tension weighting.
- **Role-Neutral Valuation (Eliminating Finisher Bias)**:  
  Evaluates **Pressure Lift ($\Delta = SVA_{pressure} - SVA_{routine}$)** relative to an athlete's personal baseline. Openers facing new-ball crises (e.g., Vaibhav Sooryavanshi #1, Abhishek Sharma #3) rank on equal tactical merit with late-overs power hitters (Tim David #4, Heinrich Klaasen #5).
- **Empirical Bayes Variance Shrinkage (Kish $N_{eff}$)**:  
  Incorporates weighted sample size $N_{eff} = (\sum w_i)^2 / \sum (w_i^2)$ with prior weight $K = 50$. An athlete must face at least 50 effective high-tension opportunities before their rating reflects 50% of their raw observed mean, eliminating short-term anomalies.
- **Monotonic Anti-Trap Calibration**:  
  Ensures chasing anchors who systematically lower match leverage as they close in on a target are never penalized for their own match-controlling excellence. Guarantees **100% Top-4 ranking invariance** under rigorous parameter sensitivity sweeps ($\alpha \in [0.1, 0.9]$).

---

## 3. Cockpit Layout Architecture

The application adopts a modular cockpit layout engineered for professional scouting:

### Top Navigation Bar
- **Brand Title**: Clean `ROYAL CLUTCHPULSE` identity.
- **Discipline Switcher**: Seamless pill toggle between **Top Batters** and **Top Bowlers** with dynamic metric labeling across all views.
- **Navigation Actions**:
  - `⚡ Try Live Match Simulator`: Launches real-time situational simulation in dedicated focus mode.
  - `📐 Pressure Architecture`: Opens the comprehensive quantitative specification, mathematical derivations, and interactive formula explorer.

### Pinned Left Sidebar (Filters & Match Scope)
- **Tournament / Format**: Filter across *All Competitions (IPL & T20I)*, *IPL Only*, or *T20I Only*.
- **Player Origin / Nationality**: Instant cohort filtering by *All Players*, *Indian Players Only 🇮🇳*, or *Overseas (Foreign) Players 🌍*.
- **Min. Balls Faced / Bowled Slider**: Slider (0 to 1,500 balls) to isolate high-experience veterans.
- **Reset Filters**: One-click restoration of default search parameters.

### Center Analytical Stage
1. **Leaderboard & All Players**:
   - Horizontal Top 10 bar chart with dynamic discipline title (*"Top 10 Most Reliable Batters/Bowlers in Tight Finishes"*).
   - Interactive search bar filtering across player names, teams, and countries.
   - Comprehensive cohort table displaying official player portraits, country flags, origin tags (`IND` / `OVS`), Clutch Ratings, Raw Impact, Balls Played, 95% Confidence Intervals, Pressure Boost (Rises/Dips), and Death Overs Impact.
   - Interactive row-click linking directly to the right-rail dossier.
2. **Who Rises Under Pressure? (Pressure Elevation)**:
   - Visualizes performance elevation ($\Delta > 0$) vs. routine play to detect athletes who genuinely thrive in crises.
3. **Try Live Match Simulator (Focus Mode)**:
   - Full client-side JavaScript execution of the production logistic Win Probability and pressure model.
   - Real-time animated radial gauges for **Pressure Index ($P$)** and **Win Probability ($WP$)**.
   - Context presets: *Super Over Thriller*, *Comfortable Run Chase*, *Match Practically Decided*, *Early Top-Order Collapse*, and *Death Overs Finish*.
   - **Tactical Dugout Specialist Recommendations**: Smart recommender ranking top qualified batters and bowlers proven to win matches in that exact phase and pressure tier.
4. **Pressure Architecture (Quantitative Specification)**:
   - Executive white paper: *Beyond Phase Dogma: Continuous Ball-by-Ball Leverage*.
   - The 4 Core Architectural Principles (Legacy Blindspots vs. ClutchPulse Innovations).
   - Architectural comparison matrix against conventional scouting metrics.
   - **Master Pressure Formula** ($P = \sqrt{T \times L_{norm}}$) with term-by-term decomposition.
   - **The 4 Match Context Quadrants**: *🔥 The Crucible*, *🚶 Low-Stakes Dead Death*, *🏳️ Lost-Cause Tail*, and *⚖️ Routine Baseline*.
   - Situational Baselines (36 Cells) & Dynamic Wicket Valuation ($\lambda_{eff} = \min(\lambda_{wkt}, \text{Runs Required})$).
   - **Interactive Pressure Dynamics Explorer**: Real-time interactive sliders for Tactical Difficulty ($T$) and Consequence Leverage ($L_{norm}$) with live radial gauge drawing and automatic quadrant classification.

### Pinned Right Sidebar (Player Profile Dossier)
- Large circular official player portrait, identity, country flag, and overall rank badge.
- Statistical metrics: Clutch Rating, Raw Impact, Balls Played, and Pressure Boost.
- **Scout's Takeaway**: Automated natural-language summary analyzing player strengths, lift under pressure, and phase specialization.
- **6-Axis Clutch Radar Chart**: Normalizes Clutch Rating, Pressure Boost, Death Overs, Powerplay, Middle Overs, and Consistency.
- **Head-to-Head (H2H) Selector**: Dropdown to overlay any second player's polygon onto the active radar in real time.
- **Performance by Match Stage**: Phase breakdown bar chart showing Powerplay, Middle, and Death overs contribution.

---

## 4. Audited Official Top 10 Rankings

### Top 10 Batters Under Pressure
| Rank | Player | Team / Country | Clutch Rating | Raw Impact | High-Pressure Balls | Pressure Lift ($\Delta$) | 95% CI |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **#1** | **Vaibhav Sooryavanshi** | 🇮🇳 Rajasthan Royals | **+0.3487** | +0.7614 | 506.9 | +0.207 (▲ Rises) | [0.142, 0.523] |
| **#2** | **Suryakumar Yadav** | 🇮🇳 India | **+0.2819** | +0.3558 | 2,287.2 | +0.037 (▲ Rises) | [0.183, 0.370] |
| **#3** | **Abhishek Sharma** | 🇮🇳 Sunrisers Hyderabad | **+0.2703** | +0.3547 | 1,923.3 | -0.161 (High Base) | [0.130, 0.399] |
| **#4** | **Tim David** | 🇦🇺 Australia | **+0.2571** | +0.4144 | 980.6 | +0.010 (▲ Rises) | [0.129, 0.378] |
| **#5** | **Heinrich Klaasen** | 🇿🇦 Sunrisers Hyderabad | **+0.2201** | +0.3357 | 1,142.0 | +0.077 (▲ Rises) | [0.124, 0.307] |
| **#6** | **Phil Salt** | 🏴󠁧󠁢󠁥󠁮󠁧󠁿 England | **+0.1954** | +0.2813 | 1,364.7 | +0.116 (▲ Rises) | [0.063, 0.303] |
| **#7** | **Tilak Varma** | 🇮🇳 Mumbai Indians | **+0.1745** | +0.2277 | 1,968.9 | +0.034 (▲ Rises) | [0.080, 0.267] |
| **#8** | **Travis Head** | 🇦🇺 Australia | **+0.1625** | +0.2611 | 988.6 | -0.061 (High Base) | [0.002, 0.320] |
| **#9** | **Andre Russell** | 🇯🇲 West Indies / KKR | **+0.1579** | +0.3239 | 570.7 | +0.045 (▲ Rises) | [0.030, 0.286] |
| **#10**| **Reeza Hendricks** | 🇿🇦 South Africa | **+0.1564** | +0.2874 | 715.9 | +0.018 (▲ Rises) | [0.007, 0.287] |

### Top 10 Bowlers Under Pressure
| Rank | Player | Team / Country | Clutch Rating | Raw Impact | High-Pressure Balls | Pressure Lift ($\Delta$) | 95% CI |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **#1** | **Rashid Khan** | 🇦🇫 Gujarat Titans | **+0.1756** | +0.2147 | 2,245.9 | +0.061 (▲ Rises) | [0.081, 0.278] |
| **#2** | **Jasprit Bumrah** | 🇮🇳 Mumbai Indians | **+0.1541** | +0.2103 | 1,369.7 | +0.085 (▲ Rises) | [0.024, 0.278] |
| **#3** | **Sunil Narine** | 🇹🇹 Kolkata Knight Riders | **+0.1442** | +0.2020 | 1,246.3 | +0.048 (▲ Rises) | [0.055, 0.233] |
| **#4** | **Josh Hazlewood** | 🇦🇺 Royal Challengers Bengaluru | **+0.1330** | +0.1904 | 1,159.5 | +0.054 (▲ Rises) | [0.002, 0.283] |
| **#5** | **Wanindu Hasaranga**| 🇱🇰 Sri Lanka | **+0.1184** | +0.1537 | 1,675.4 | +0.039 (▲ Rises) | [0.036, 0.200] |
| **#6** | **Bhuvneshwar Kumar**| 🇮🇳 Sunrisers Hyderabad | **+0.1065** | +0.1349 | 1,875.7 | +0.028 (▲ Rises) | [-0.009, 0.219] |
| **#7** | **Abrar Ahmed** | 🇵🇰 Pakistan | **+0.1058** | +0.1933 | 604.7 | +0.042 (▲ Rises) | [-0.025, 0.228] |
| **#8** | **Kuldeep Yadav** | 🇮🇳 Delhi Capitals | **+0.1027** | +0.1346 | 1,608.6 | +0.031 (▲ Rises) | [0.008, 0.210] |
| **#9** | **Mahedi Hasan** | 🇧🇩 Bangladesh | **+0.1025** | +0.1700 | 760.3 | +0.035 (▲ Rises) | [-0.044, 0.247] |
| **#10**| **Mujeeb Ur Rahman** | 🇦🇫 Afghanistan | **+0.1024** | +0.1770 | 686.6 | +0.030 (▲ Rises) | [-0.012, 0.215] |

---

## 5. Player Photo Registry & Media Assets

- **Consolidated Directory**: All 206 qualified player headshots are stored in `dashboard/players/` with normalized filename keys (e.g. `players/suryakumar_yadav.jpeg`).
- **Registry Mapping (`dashboard/js/player_photos.js`)**: Maps every athlete to their official photo path.
- **Graceful Fallbacks**: If a player lacks an official portrait, the UI automatically renders a circular monogram with the athlete's initials encased in a Royal Pink border.
- **Enlarged Avatars**: Table avatars render at 44px, right-rail dossier portraits render at 68px, and dugout recommendation cards render at 38px.

---

## 6. Deployment & Hosting Guide

The dashboard is completely static, with zero build steps or server dependencies required.

### Option A: Local Execution (Instant)
1. Navigate to `e:\SupeRR_round1_2026-main\dashboard\`.
2. Double-click `index.html` to open it in Chrome, Edge, Safari, or Firefox.
3. Everything functions locally out of the box.

### Option B: Netlify Deployment (60 Seconds)
The dashboard is pre-configured with `netlify.toml` and `_redirects` for continuous caching:
1. Go to **[app.netlify.com/drop](https://app.netlify.com/drop)**.
2. Drag and drop the **`dashboard`** directory directly into the browser upload zone.
3. Your live link (e.g. `https://royal-clutchpulse.netlify.app`) is active immediately with full image and asset support.

### Option C: GitHub & Netlify Continuous Integration
1. Push this repository to GitHub.
2. In Netlify, click **Add new site** &rarr; **Import an existing project**.
3. Set **Base directory** to `dashboard`, leave **Build command** empty, and set **Publish directory** to `.`.
4. Click **Deploy Site**.
