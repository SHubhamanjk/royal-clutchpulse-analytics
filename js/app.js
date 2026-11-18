/**
 * Royal ClutchPulse - Main Application Controller
 * Reactive Cockpit Engine & Event Wiring
 */

(function() {
  // Global State
  const state = {
    discipline: 'batting', // 'batting' | 'bowling'
    selectedPlayer: null,
    h2hPlayer: null,
    activeTab: 'tab-leaderboard',
    filters: {
      search: '',
      tournament: 'ALL',
      origin: 'ALL',
      minEss: 0,
      sortField: 'shrunk',
      sortAsc: false
    },
    simInputs: {
      inn: 2,
      brem: 12,
      score: 151,
      wkts: 7,
      target: 175,
      par: 170
    }
  };

  /**
   * Initialize Application
   */
  function init() {
    setupDisciplineToggle();
    setupFilters();
    setupTabs();
    setupSimulator();
    setupFormulaSandbox();
    setupExportCSV();
    
    // Default initial selection to Rank 1 Batter
    state.selectedPlayer = window.BATTING_DATA[0];
    
    updateAppView();
    runSimulator();
  }

  /**
   * Setup Batting / Bowling Pill Switcher
   */
  function setupDisciplineToggle() {
    const batBtn = document.getElementById('toggleBatting');
    const bowlBtn = document.getElementById('toggleBowling');

    batBtn.addEventListener('click', () => {
      if (state.discipline === 'batting') return;
      state.discipline = 'batting';
      batBtn.classList.add('active');
      bowlBtn.classList.remove('active');
      state.selectedPlayer = window.BATTING_DATA[0];
      state.h2hPlayer = null;
      updateAppView();
      if (state.activeTab === 'tab-simulator') {
        runSimulator();
      }
    });

    bowlBtn.addEventListener('click', () => {
      if (state.discipline === 'bowling') return;
      state.discipline = 'bowling';
      bowlBtn.classList.add('active');
      batBtn.classList.remove('active');
      state.selectedPlayer = window.BOWLING_DATA[0];
      state.h2hPlayer = null;
      updateAppView();
      if (state.activeTab === 'tab-simulator') {
        runSimulator();
      }
    });
  }

  /**
   * Setup Left Rail Filters & Presets
   */
  function setupFilters() {
    const searchInput = document.getElementById('filterSearch');
    const tournamentSelect = document.getElementById('filterTournament');
    const originSelect = document.getElementById('filterOrigin');
    const essSlider = document.getElementById('filterEssSlider');
    const essValDisplay = document.getElementById('essSliderValue');
    const resetBtn = document.getElementById('btnResetFilters');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.filters.search = e.target.value.toLowerCase().trim();
        renderTableAndCharts();
      });
    }

    if (tournamentSelect) {
      tournamentSelect.addEventListener('change', (e) => {
        state.filters.tournament = e.target.value;
        renderTableAndCharts();
      });
    }

    if (originSelect) {
      originSelect.addEventListener('change', (e) => {
        state.filters.origin = e.target.value;
        renderTableAndCharts();
      });
    }

    if (essSlider) {
      essSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        state.filters.minEss = val;
        if (essValDisplay) essValDisplay.textContent = val;
        renderTableAndCharts();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (tournamentSelect) tournamentSelect.value = 'ALL';
        if (originSelect) originSelect.value = 'ALL';
        if (essSlider) essSlider.value = 0;
        if (essValDisplay) essValDisplay.textContent = '0';
        state.filters.search = '';
        state.filters.tournament = 'ALL';
        state.filters.origin = 'ALL';
        state.filters.minEss = 0;
        renderTableAndCharts();
      });
    }
  }

  /**
   * Switch Active Tab and manage Focus Modes (Simulator Mode & Methodology Mode)
   */
  function switchToTab(tabId) {
    const cockpit = document.querySelector('.cockpit-container');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const navSimBtn = document.getElementById('navSimulatorBtn');
    const navMethBtn = document.getElementById('navMethodologyBtn');

    state.activeTab = tabId;

    if (cockpit) {
      cockpit.classList.remove('simulator-mode');
      cockpit.classList.remove('methodology-mode');
    }
    if (navSimBtn) navSimBtn.classList.remove('active');
    if (navMethBtn) navMethBtn.classList.remove('active');
    tabBtns.forEach(b => b.classList.remove('active'));

    if (tabId === 'tab-simulator') {
      if (cockpit) cockpit.classList.add('simulator-mode');
      if (navSimBtn) navSimBtn.classList.add('active');
      runSimulator();
    } else if (tabId === 'tab-methodology') {
      if (cockpit) cockpit.classList.add('methodology-mode');
      if (navMethBtn) navMethBtn.classList.add('active');
      runFormulaSandbox();
    } else {
      tabBtns.forEach(b => {
        if (b.getAttribute('data-tab') === tabId) {
          b.classList.add('active');
        }
      });
      if (tabId === 'tab-lift') {
        renderLiftTab();
      }
    }

    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    const activePane = document.getElementById(tabId);
    if (activePane) activePane.classList.add('active');
  }

  /**
   * Setup Tab Navigation, Live Match Simulator & Methodology Buttons
   */
  function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const navSimBtn = document.getElementById('navSimulatorBtn');
    const navMethBtn = document.getElementById('navMethodologyBtn');
    const backBtnSim = document.getElementById('btnBackToLeaderboard');
    const backBtnMeth = document.getElementById('btnBackFromMethodology');

    // Live Match Simulator Launcher in Nav Bar (toggleable)
    if (navSimBtn) {
      navSimBtn.addEventListener('click', () => {
        if (state.activeTab === 'tab-simulator') {
          switchToTab('tab-leaderboard');
        } else {
          switchToTab('tab-simulator');
        }
      });
    }

    // Methodology & Formula Launcher in Nav Bar (toggleable)
    if (navMethBtn) {
      navMethBtn.addEventListener('click', () => {
        if (state.activeTab === 'tab-methodology') {
          switchToTab('tab-leaderboard');
        } else {
          switchToTab('tab-methodology');
        }
      });
    }

    // Back to Leaderboard button inside Simulator View
    if (backBtnSim) {
      backBtnSim.addEventListener('click', () => {
        switchToTab('tab-leaderboard');
      });
    }

    // Back to Leaderboard button inside Methodology View
    if (backBtnMeth) {
      backBtnMeth.addEventListener('click', () => {
        switchToTab('tab-leaderboard');
      });
    }

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        if (state.activeTab === targetTab) return;
        switchToTab(targetTab);
      });
    });
  }

  /**
   * Get Current Cohort Dataset
   */
  function getRawDataset() {
    return state.discipline === 'batting' ? window.BATTING_DATA : window.BOWLING_DATA;
  }

  /**
   * Get Filtered & Sorted Dataset
   */
  function getFilteredDataset() {
    let dataset = getRawDataset();

    // 1. Search Query (Matches player name, team, or country)
    if (state.filters.search) {
      const q = state.filters.search;
      dataset = dataset.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.team.toLowerCase().includes(q) ||
        (p.country && p.country.toLowerCase().includes(q))
      );
    }

    // 2. Tournament Filter
    if (state.filters.tournament === 'IPL') {
      dataset = dataset.filter(p => p.team.includes('IPL') || p.ipl !== 0);
    } else if (state.filters.tournament === 'T20I') {
      dataset = dataset.filter(p => p.team.includes('T20I') || p.t20i !== 0);
    }

    // 3. Player Origin Filter (Indian vs Overseas)
    if (state.filters.origin === 'INDIAN') {
      dataset = dataset.filter(p => p.is_indian === true);
    } else if (state.filters.origin === 'OVERSEAS') {
      dataset = dataset.filter(p => p.is_indian === false);
    }

    // 4. Min Kish ESS Filter
    if (state.filters.minEss > 0) {
      dataset = dataset.filter(p => p.ess >= state.filters.minEss);
    }

    // 5. Sort
    const { sortField, sortAsc } = state.filters;
    dataset = [...dataset].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });

    return dataset;
  }

  /**
   * Update Entire Cockpit View
   */
  function updateAppView() {
    renderTableAndCharts();
    populateH2HSelect();
    renderPlayerDossier();
  }

  /**
   * Render Leaderboard Chart, Cohort Table, and Lift Chart
   */
  function renderTableAndCharts() {
    const dataset = getFilteredDataset();

    // Update count badge
    const countBadge = document.getElementById('cohortCountBadge');
    if (countBadge) {
      countBadge.textContent = `${dataset.length} ${state.discipline === 'batting' ? 'Batters' : 'Bowlers'} Ranked`;
    }

    // Dynamic Top 10 Title
    const top10Title = document.getElementById('top10ChartTitle');
    if (top10Title) {
      top10Title.textContent = `Top 10 Most Reliable ${state.discipline === 'batting' ? 'Batters' : 'Bowlers'} in Tight Finishes`;
    }

    // Top 10 Horizontal Bar Chart
    window.ClutchCharts.renderTop10BarChart('top10Canvas', dataset, (player) => {
      selectPlayer(player);
    });

    // Render Lift Tab Chart
    window.ClutchCharts.renderLiftChart('liftCanvas', dataset);

    // Render Cohort Table
    renderCohortTable(dataset);
  }

  /**
   * Render Lift Tab Chart specifically when switching to it
   */
  function renderLiftTab() {
    const dataset = getFilteredDataset();
    window.ClutchCharts.renderLiftChart('liftCanvas', dataset);
  }

  /**
   * Get Player Photo Path from Registry
   */
  function getPlayerPhoto(name) {
    if (window.PLAYER_PHOTOS && window.PLAYER_PHOTOS[name]) {
      return window.PLAYER_PHOTOS[name];
    }
    return null;
  }

  /**
   * Render Cohort Table Rows
   */
  function renderCohortTable(dataset) {
    const tbody = document.getElementById('cohortTableBody');
    if (!tbody) return;

    if (dataset.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 24px; color: var(--text-muted);">No qualified players match current filters.</td></tr>`;
      return;
    }

    let html = '';
    dataset.forEach(p => {
      const isSelected = state.selectedPlayer && state.selectedPlayer.name === p.name;
      const shrunkClass = p.shrunk >= 0 ? 'val-positive' : 'val-negative';
      const dthClass = p.dth >= 0 ? 'val-positive' : 'val-negative';

      const liftPositive = p.lift >= 0;
      const liftIcon = liftPositive ? '▲' : '▼';
      const liftWord = liftPositive ? 'Rises' : 'Dips';
      const liftSign = p.lift > 0 ? '+' : '';
      const shrunkSign = p.shrunk > 0 ? '+' : '';
      const rawSign = p.raw > 0 ? '+' : '';
      const dthSign = p.dth > 0 ? '+' : '';

      const photo = getPlayerPhoto(p.name);
      const initials = p.name.split(' ').map(n => n[0]).join('').substring(0, 2);
      const avatarHtml = photo 
        ? `<img src="${photo}" class="table-player-avatar" alt="${p.name}" onerror="this.outerHTML='<span class=\\'table-player-initials\\'>${initials}</span>'">` 
        : `<span class="table-player-initials">${initials}</span>`;

      html += `
        <tr class="${isSelected ? 'selected' : ''}" data-name="${p.name}">
          <td class="rank-cell">#${p.rank}</td>
          <td>
            <div class="table-player-cell">
              ${avatarHtml}
              <span class="table-player-name">${p.name}</span>
            </div>
          </td>
          <td>
            <div class="country-flag-tag">
              <span>${p.flag || '🏏'}</span>
              <span>${p.country || 'India'}</span>
              <span class="origin-tag ${p.is_indian ? 'ind' : 'ovs'}">${p.is_indian ? 'IND' : 'OVS'}</span>
            </div>
            <div class="team-subtext">${p.team}</div>
          </td>
          <td><span class="clutch-badge">${shrunkSign}${p.shrunk.toFixed(4)}</span></td>
          <td style="color: var(--text-secondary);">${rawSign}${p.raw.toFixed(4)}</td>
          <td style="color: #FDE047; font-weight: 500;">${p.ess.toFixed(1)}</td>
          <td><span class="ci-pill">${p.ci[0].toFixed(2)} &ndash; ${p.ci[1].toFixed(2)}</span></td>
          <td>
            <span class="lift-pill ${liftPositive ? 'lift-up' : 'lift-down'}" title="${liftPositive ? 'Performance increases under pressure' : 'Performance dips under pressure'}">
              ${liftIcon} ${liftSign}${p.lift.toFixed(3)}
              <small>${liftWord}</small>
            </span>
          </td>
          <td class="death-cell ${dthClass}">${dthSign}${p.dth.toFixed(3)}</td>
        </tr>
      `;
    });

    tbody.innerHTML = html;

    // Attach row click listeners
    tbody.querySelectorAll('tr').forEach(tr => {
      tr.addEventListener('click', () => {
        const pName = tr.getAttribute('data-name');
        const player = dataset.find(p => p.name === pName);
        if (player) selectPlayer(player);
      });
    });
  }

  /**
   * Select a Player for the Right Rail Dossier
   */
  function selectPlayer(player) {
    state.selectedPlayer = player;
    renderPlayerDossier();

    // Re-highlight table row
    const tbody = document.getElementById('cohortTableBody');
    if (tbody) {
      tbody.querySelectorAll('tr').forEach(tr => {
        if (tr.getAttribute('data-name') === player.name) {
          tr.classList.add('selected');
        } else {
          tr.classList.remove('selected');
        }
      });
    }
  }

  /**
   * Render Right Rail Active Player Profile Dossier
   */
  function renderPlayerDossier() {
    const p = state.selectedPlayer;
    if (!p) return;

    // Photo or initials
    const photo = getPlayerPhoto(p.name);
    const initials = p.name.split(' ').map(n => n[0]).join('').substring(0, 2);
    const avatarEl = document.getElementById('profileAvatar');
    if (avatarEl) {
      if (photo) {
        avatarEl.innerHTML = `<img src="${photo}" class="profile-avatar-img" alt="${p.name}" onerror="this.outerHTML='${initials}'">`;
      } else {
        avatarEl.textContent = initials;
      }
    }

    document.getElementById('profileName').textContent = p.name;
    const teamEl = document.getElementById('profileCountryTeam') || document.getElementById('profileTeam');
    if (teamEl) {
      teamEl.innerHTML = `${p.flag || '🏏'} <strong>${p.country || 'India'}</strong> &bull; ${p.team}`;
    }
    document.getElementById('profileRank').textContent = `RANK #${p.rank}`;

    // Metric boxes
    document.getElementById('statShrunk').textContent = `${p.shrunk > 0 ? '+' : ''}${p.shrunk.toFixed(4)}`;
    document.getElementById('statRaw').textContent = `${p.raw > 0 ? '+' : ''}${p.raw.toFixed(4)}`;
    document.getElementById('statEss').textContent = p.ess.toFixed(1);
    document.getElementById('statLift').textContent = `${p.lift > 0 ? '+' : ''}${p.lift.toFixed(4)}`;

    // Dynamic Scout Takeaway
    const scoutEl = document.getElementById('scoutVerdict');
    if (scoutEl) {
      const isElevating = p.lift >= 0;
      const liftText = isElevating 
        ? `<span style="color:#34D399; font-weight:700;">elevates by +${p.lift.toFixed(3)} (▲ Rises)</span>` 
        : `<span style="color:#F87171; font-weight:700;">dips by ${p.lift.toFixed(3)} (▼ Dips)</span>`;
      
      const phaseStrength = p.dth >= 0.20 
        ? `<strong style="color:#FF4DA6;">deadly Death Overs execution (+${p.dth.toFixed(3)})</strong>` 
        : (p.pp >= 0.15 ? `<strong style="color:#10B981;">explosive Powerplay attack (+${p.pp.toFixed(3)})</strong>` : `reliable middle overs control (+${p.mid.toFixed(3)})`);
      
      scoutEl.innerHTML = `<strong>💡 Scout's Takeaway:</strong> <strong>${p.name}</strong> (${p.flag || ''} ${p.country || 'India'} &bull; ${p.is_indian ? 'Indian Player' : 'Overseas Player'}) ranks <strong>#${p.rank}</strong> with an elite Clutch Rating of <strong>${p.shrunk > 0 ? '+' : ''}${p.shrunk.toFixed(4)}</strong> over ${Math.round(p.ess)} high-tension balls. In match crises, their output ${liftText} with ${phaseStrength}.`;
    }

    // Charts
    window.ClutchCharts.renderRadarChart('radarCanvas', p, state.h2hPlayer);
    window.ClutchCharts.renderPhaseChart('phaseCanvas', p);
  }

  /**
   * Populate Head-to-Head Comparison Dropdown
   */
  function populateH2HSelect() {
    const select = document.getElementById('h2hSelect');
    if (!select) return;

    const dataset = getRawDataset();
    let html = `<option value="">-- Compare with another player --</option>`;
    dataset.forEach(p => {
      html += `<option value="${p.name}">#${p.rank} ${p.name}</option>`;
    });
    select.innerHTML = html;

    select.addEventListener('change', (e) => {
      const selectedName = e.target.value;
      if (!selectedName) {
        state.h2hPlayer = null;
      } else {
        state.h2hPlayer = dataset.find(p => p.name === selectedName) || null;
      }
      window.ClutchCharts.renderRadarChart('radarCanvas', state.selectedPlayer, state.h2hPlayer);
    });
  }

  /**
   * Setup Simulator Controls & Quick Scenario Presets
   */
  function setupSimulator() {
    const simInn = document.getElementById('simInn');
    const simBrem = document.getElementById('simBrem');
    const simScore = document.getElementById('simScore');
    const simWkts = document.getElementById('simWkts');
    const simTarget = document.getElementById('simTarget');
    const simPar = document.getElementById('simPar');
    const targetGroup = document.getElementById('simTargetGroup');
    const parGroup = document.getElementById('simParGroup');

    function readAndRun() {
      state.simInputs.inn = parseInt(simInn.value, 10);
      state.simInputs.brem = parseInt(simBrem.value, 10);
      state.simInputs.score = parseInt(simScore.value, 10);
      state.simInputs.wkts = parseInt(simWkts.value, 10);
      state.simInputs.target = parseInt(simTarget.value, 10);
      state.simInputs.par = parseInt(simPar.value, 10);

      // Toggle Target vs Par visibility
      if (state.simInputs.inn === 1) {
        if (targetGroup) targetGroup.style.display = 'none';
        if (parGroup) parGroup.style.display = 'block';
      } else {
        if (targetGroup) targetGroup.style.display = 'block';
        if (parGroup) parGroup.style.display = 'none';
      }

      runSimulator();
    }

    [simInn, simBrem, simScore, simWkts, simTarget, simPar].forEach(input => {
      if (input) input.addEventListener('input', readAndRun);
    });

    // Preset Scenario Buttons
    const presets = {
      crucible: { inn: 2, brem: 12, score: 151, wkts: 7, target: 175, par: 170 },
      routine: { inn: 2, brem: 60, score: 100, wkts: 2, target: 150, par: 170 },
      garbage: { inn: 2, brem: 18, score: 145, wkts: 8, target: 210, par: 170 },
      collapse: { inn: 1, brem: 96, score: 22, wkts: 4, target: 170, par: 170 },
      deathblitz: { inn: 1, brem: 24, score: 145, wkts: 4, target: 170, par: 170 }
    };

    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-preset');
        const p = presets[key];
        if (!p) return;

        simInn.value = p.inn;
        simBrem.value = p.brem;
        simScore.value = p.score;
        simWkts.value = p.wkts;
        simTarget.value = p.target;
        simPar.value = p.par;

        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        readAndRun();
      });
    });
  }

  /**
   * Run Live Match Pressure Simulator Engine (ES6 Client-Side)
   */
  function runSimulator() {
    if (!window.PressureEngine) return;

    const res = window.PressureEngine.simulate(state.simInputs);

    // Update Readouts
    const pIndexEl = document.getElementById('simPressureIndex');
    const wpEl = document.getElementById('simWinProb');
    const levEl = document.getElementById('simLeverage');
    const diffEl = document.getElementById('simTaskDiff');
    const classBadge = document.getElementById('simClassificationBadge');

    if (pIndexEl) pIndexEl.textContent = res.pressure_index.toFixed(1);
    if (wpEl) wpEl.textContent = `${(res.win_prob * 100).toFixed(1)}%`;
    if (levEl) levEl.textContent = res.leverage_norm.toFixed(3);
    if (diffEl) diffEl.textContent = res.task_difficulty.toFixed(3);

    if (classBadge) {
      classBadge.textContent = res.classification;
      classBadge.className = 'gauge-classification';
      if (res.pressure_index >= 75) classBadge.classList.add('class-crucible');
      else if (res.pressure_index >= 50) classBadge.classList.add('class-high');
      else if (res.pressure_index >= 25) classBadge.classList.add('class-medium');
      else classBadge.classList.add('class-low');
    }

    // Draw Radial Gauges
    window.ClutchCharts.drawRadialGauge('pressureGaugeCanvas', res.pressure_index, 0, 100, 'Pressure Index (P)');
    window.ClutchCharts.drawRadialGauge('wpGaugeCanvas', res.win_prob * 100, 0, 100, 'Win Probability');

    // Update Tactical Dugout Recommendations
    updateDugoutRecommendations(res);
  }

  /**
   * Tactical Dugout Recommendations Engine
   * Context-Aware Matchup & Specialist Recommender
   */
  function updateDugoutRecommendations(res) {
    const brem = state.simInputs.brem;
    const pIndex = res.pressure_index;

    // Determine tactical phase
    let phase = 'death';
    let phaseName = 'Final Overs / Death Phase (Overs 16-20)';
    let batMetricKey = 'dth';
    let batLabel = 'Death Overs Match-Winners';
    let bowlLabel = 'Death Overs Wicket-Takers';

    if (brem > 84) {
      phase = 'powerplay';
      phaseName = 'Powerplay (Overs 1-6)';
      batMetricKey = 'pp';
      batLabel = 'Top-Order Attackers';
      bowlLabel = 'New-Ball Swing Bowlers';
    } else if (brem > 30) {
      phase = 'middle';
      phaseName = 'Middle Overs (Overs 7-15)';
      batMetricKey = 'mid';
      batLabel = 'Middle Overs Anchors & Spin Hitters';
      bowlLabel = 'Spin Stranglehold Bowlers';
    }

    // Update state summary
    const summaryEl = document.getElementById('recStateSummary');
    if (summaryEl) {
      summaryEl.textContent = `${phaseName} • ${res.classification} (P = ${pIndex.toFixed(1)})`;
    }

    const batLabelEl = document.getElementById('recBatLabel');
    if (batLabelEl) batLabelEl.textContent = batLabel;

    const bowlLabelEl = document.getElementById('recBowlLabel');
    if (bowlLabelEl) bowlLabelEl.textContent = bowlLabel;

    // Filter & rank batters:
    const isHighPressure = pIndex >= 50;
    const scoredBatters = window.BATTING_DATA
      .filter(p => p.ess >= 60)
      .map(p => {
        const phaseVal = p[batMetricKey];
        const tensionVal = isHighPressure ? p.ge50 : p.shrunk;
        const score = (0.60 * phaseVal) + (0.40 * tensionVal);
        return { ...p, recScore: score, keyVal: phaseVal };
      })
      .sort((a, b) => b.recScore - a.recScore)
      .slice(0, 4);

    // Filter & rank bowlers:
    const scoredBowlers = window.BOWLING_DATA
      .filter(p => p.ess >= 60)
      .map(p => {
        const phaseVal = p[batMetricKey];
        const tensionVal = isHighPressure ? p.ge50 : p.shrunk;
        const score = (0.60 * phaseVal) + (0.40 * tensionVal);
        return { ...p, recScore: score, keyVal: phaseVal };
      })
      .sort((a, b) => b.recScore - a.recScore)
      .slice(0, 4);

    // Render Batters List
    const batListEl = document.getElementById('recBattersList');
    if (batListEl) {
      batListEl.innerHTML = scoredBatters.map(p => {
        const photo = getPlayerPhoto(p.name);
        const initials = p.name.split(' ').map(n => n[0]).join('').substring(0, 2);
        const avatarHtml = photo 
          ? `<img src="${photo}" class="rec-card-avatar" alt="${p.name}" onerror="this.outerHTML='<span class=\\'rec-card-initials\\'>${initials}</span>'">` 
          : `<span class="rec-card-initials">${initials}</span>`;
        return `
          <div class="rec-player-card" data-disc="batting" data-name="${p.name}" title="Click to inspect ${p.name}'s profile">
            <div class="rec-card-left">
              ${avatarHtml}
              <div class="rec-card-info">
                <span class="rec-card-name">#${p.rank} ${p.name}</span>
                <span class="rec-card-team">${p.team}</span>
              </div>
            </div>
            <div class="rec-card-right">
              <span class="rec-metric-val ${p.keyVal >= 0 ? 'val-positive' : 'val-negative'}">
                ${p.keyVal > 0 ? '+' : ''}${p.keyVal.toFixed(3)}
              </span>
              <span class="rec-tag">${phase === 'death' ? 'Death Impact' : phase === 'powerplay' ? 'Powerplay Impact' : 'Middle Impact'}</span>
            </div>
          </div>
        `;
      }).join('');

      batListEl.querySelectorAll('.rec-player-card').forEach(card => {
        card.addEventListener('click', () => {
          const name = card.getAttribute('data-name');
          const player = window.BATTING_DATA.find(x => x.name === name);
          if (player) {
            if (state.discipline !== 'batting') {
              state.discipline = 'batting';
              document.getElementById('toggleBatting').classList.add('active');
              document.getElementById('toggleBowling').classList.remove('active');
              renderTableAndCharts();
              populateH2HSelect();
            }
            selectPlayer(player);
          }
        });
      });
    }

    // Render Bowlers List
    const bowlListEl = document.getElementById('recBowlersList');
    if (bowlListEl) {
      bowlListEl.innerHTML = scoredBowlers.map(p => {
        const photo = getPlayerPhoto(p.name);
        const initials = p.name.split(' ').map(n => n[0]).join('').substring(0, 2);
        const avatarHtml = photo 
          ? `<img src="${photo}" class="rec-card-avatar" alt="${p.name}" onerror="this.outerHTML='<span class=\\'rec-card-initials\\'>${initials}</span>'">` 
          : `<span class="rec-card-initials">${initials}</span>`;
        return `
          <div class="rec-player-card" data-disc="bowling" data-name="${p.name}" title="Click to inspect ${p.name}'s profile">
            <div class="rec-card-left">
              ${avatarHtml}
              <div class="rec-card-info">
                <span class="rec-card-name">#${p.rank} ${p.name}</span>
                <span class="rec-card-team">${p.team}</span>
              </div>
            </div>
            <div class="rec-card-right">
              <span class="rec-metric-val ${p.keyVal >= 0 ? 'val-positive' : 'val-negative'}">
                ${p.keyVal > 0 ? '+' : ''}${p.keyVal.toFixed(3)}
              </span>
              <span class="rec-tag">${phase === 'death' ? 'Death Impact' : phase === 'powerplay' ? 'Powerplay Impact' : 'Middle Impact'}</span>
            </div>
          </div>
        `;
      }).join('');

      bowlListEl.querySelectorAll('.rec-player-card').forEach(card => {
        card.addEventListener('click', () => {
          const name = card.getAttribute('data-name');
          const player = window.BOWLING_DATA.find(x => x.name === name);
          if (player) {
            if (state.discipline !== 'bowling') {
              state.discipline = 'bowling';
              document.getElementById('toggleBowling').classList.add('active');
              document.getElementById('toggleBatting').classList.remove('active');
              renderTableAndCharts();
              populateH2HSelect();
            }
            selectPlayer(player);
          }
        });
      });
    }
  }

  /**
   * Setup & Run Interactive Pressure Formula Sandbox
   */
  function setupFormulaSandbox() {
    const tSlider = document.getElementById('sandboxDifficulty');
    const lSlider = document.getElementById('sandboxLeverage');
    if (!tSlider || !lSlider) return;

    tSlider.addEventListener('input', runFormulaSandbox);
    lSlider.addEventListener('input', runFormulaSandbox);
    runFormulaSandbox();
  }

  function runFormulaSandbox() {
    const tSlider = document.getElementById('sandboxDifficulty');
    const lSlider = document.getElementById('sandboxLeverage');
    if (!tSlider || !lSlider) return;

    const t = parseFloat(tSlider.value);
    const l = parseFloat(lSlider.value);
    const p = Math.sqrt(t * l);

    const valT = document.getElementById('sandboxValT');
    const valL = document.getElementById('sandboxValL');
    const valP = document.getElementById('sandboxValP');
    const badge = document.getElementById('sandboxQuadrantBadge');
    const desc = document.getElementById('sandboxExplanation');

    if (valT) valT.textContent = t.toFixed(1);
    if (valL) valL.textContent = l.toFixed(1);
    if (valP) valP.textContent = `${p.toFixed(1)} / 100`;

    // Quadrant Resolution
    let qName = '';
    let qBg = '';
    let qColor = '';
    let qDesc = '';

    if (t >= 60 && l >= 60) {
      qName = '🔥 The Crucible (True High Pressure)';
      qBg = 'rgba(234, 27, 134, 0.15)';
      qColor = '#EA1B86';
      qDesc = 'Both tactical difficulty and match consequence are high. Every delivery swings championship win probability. Elite match-winners thrive here.';
    } else if (t < 35 && l >= 55) {
      qName = '🚶 The Dead Death Walkover (Garbage Time)';
      qBg = 'rgba(56, 189, 248, 0.15)';
      qColor = '#38BDF8';
      qDesc = 'High leverage theoretically exists, but immediate difficulty is trivial (e.g. chasing 10 runs off 24 balls). The geometric mean gate purges fake death-overs heroism.';
    } else if (t >= 70 && l < 30) {
      qName = '🏳️ Lost Cause Garbage Time';
      qBg = 'rgba(245, 158, 11, 0.15)';
      qColor = '#F59E0B';
      qDesc = 'The task is mathematically impossible (e.g. 75 needed off 12 balls), but the match outcome is already 99.9% decided. Hitting boundaries here is not clutch; pressure collapses.';
    } else {
      qName = '⚖️ Baseline Routine Play';
      qBg = 'rgba(148, 163, 184, 0.15)';
      qColor = '#94A3B8';
      qDesc = 'Standard match flow with moderate difficulty and consequence. Forms the baseline replacement expectation across all athletes.';
    }

    if (badge) {
      badge.textContent = qName;
      badge.style.backgroundColor = qBg;
      badge.style.color = qColor;
      badge.style.borderColor = `${qColor}66`;
    }
    if (desc) {
      desc.textContent = qDesc;
    }

    // Draw radial gauge
    if (window.ClutchCharts && window.ClutchCharts.drawRadialGauge) {
      window.ClutchCharts.drawRadialGauge('formulaGaugeCanvas', p, 0, 100, 'Master Pressure P');
    }
  }

  /**
   * Setup CSV Export Feature
   */
  function setupExportCSV() {
    const exportBtn = document.getElementById('btnExportCSV');
    if (!exportBtn) return;

    exportBtn.addEventListener('click', () => {
      const dataset = getFilteredDataset();
      const headers = ['Rank', 'Player', 'Country', 'Origin', 'Team', 'Clutch Rating', 'Raw Impact', 'Balls Played', '95% CI Lower', '95% CI Upper', 'Pressure Boost', 'Death Overs Impact'];
      const rows = dataset.map(p => [
        p.rank,
        `"${p.name}"`,
        `"${p.country || 'India'}"`,
        p.is_indian ? 'Indian' : 'Overseas',
        `"${p.team}"`,
        p.shrunk,
        p.raw,
        p.ess,
        p.ci[0],
        p.ci[1],
        p.lift,
        p.dth
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `royal_clutchpulse_${state.discipline}_cohort.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // Self-start on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
