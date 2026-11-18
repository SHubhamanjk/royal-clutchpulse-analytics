/**
 * pressure_engine.js
 * Real-time mathematical engine for match state pressure calculations.
 */

(function(window) {
  'use strict';

  var cfg = window.SIM_CONFIG;

  function clip(x, min, max) {
    return Math.max(min, Math.min(max, x));
  }

  function interp(x, xp, fp) {
    if (x <= xp[0]) return fp[0];
    if (x >= xp[xp.length - 1]) return fp[fp.length - 1];
    for (var i = 0; i < xp.length - 1; i++) {
      if (x >= xp[i] && x <= xp[i + 1]) {
        var t = (x - xp[i]) / (xp[i + 1] - xp[i] + 1e-12);
        return fp[i] + t * (fp[i + 1] - fp[i]);
      }
    }
    return fp[fp.length - 1];
  }

  var PressureEngine = {
    computeWPInn1: function(score, lballs, wt, venuePar) {
      venuePar = venuePar || 176.68;
      var lballsCl = clip(lballs, 0, 120);
      var wtCl = clip(wt, 0, 10);
      if (wtCl >= 10) return 0.0;

      var wkRem = 10.0 - wtCl;
      var bBowled = lballsCl / 120.0;
      var parToDate = venuePar * bBowled;
      var scoreDiffPar = (score - parToDate) / 30.0;

      var rpar = venuePar / 20.0;
      var crrShrunk = (score + 18.0 * (rpar / 6.0)) / (lballsCl + 18.0) * 6.0;
      var crrRelPar = crrShrunk / rpar;

      var ballsRem = (120.0 - lballsCl) / 120.0;
      var resInter = wkRem * ballsRem;

      var raw = [scoreDiffPar, wkRem, bBowled, resInter, crrRelPar];
      var m = cfg.wp_model_inn1.means;
      var s = cfg.wp_model_inn1.stds;
      var beta = cfg.wp_model_inn1.coefficients;

      var z = beta[0]; // intercept
      for (var i = 0; i < raw.length; i++) {
        var norm = (raw[i] - m[i]) / s[i];
        z += norm * beta[i + 1];
      }
      return 1.0 / (1.0 + Math.exp(-clip(z, -20.0, 20.0)));
    },

    computeWPInn2: function(runsReq, brem, wt) {
      var wtCl = clip(wt, 0, 10);
      if (runsReq <= 0) return 1.0;
      if (wtCl >= 10 || brem <= 0) return 0.0;

      var wkRem = 10.0 - wtCl;
      if (brem === 1) {
        var pBound = (wkRem === 1) ? 0.055 : 0.155;
        if (runsReq > 6) return 0.001;
        if (runsReq === 5 || runsReq === 6) return 0.50 * pBound;
        if (runsReq === 3 || runsReq === 4) return 1.00 * pBound;
        if (runsReq === 2) return 2.50 * pBound;
        return 1.0 - (0.45 * (wkRem === 1 ? 0.045 : 0.015));
      }

      var rrr = clip((runsReq / Math.max(1.0, brem)) * 6.0, 0.0, 36.0);
      var bNorm = brem / 120.0;
      var rrrXWk = rrr * (10.0 - wkRem);

      var raw = [rrr, wkRem, bNorm, rrrXWk];
      var m = cfg.wp_model_inn2.means;
      var s = cfg.wp_model_inn2.stds;
      var beta = cfg.wp_model_inn2.coefficients;

      var z = beta[0]; // intercept
      for (var i = 0; i < raw.length; i++) {
        var norm = (raw[i] - m[i]) / s[i];
        z += norm * beta[i + 1];
      }
      return 1.0 / (1.0 + Math.exp(-clip(z, -20.0, 20.0)));
    },

    computeLeverageAndLNorm: function(innings, ballsRemaining, score, wicketsLost, runsRequired, venuePar) {
      venuePar = venuePar || 176.68;
      var lballs = 120 - ballsRemaining;
      var phase = (ballsRemaining > 84) ? 'PP' : (ballsRemaining > 30 ? 'Middle' : 'Death');
      var key = phase + '_inn' + innings;
      var pVec = cfg.transition_probs[key] || cfg.transition_probs['Middle_inn1'];
      var outcomes = cfg.outcomes;

      var currWP = 0.0;
      var cumSwing = 0.0;
      var rawL = 0.0;
      var lNorm = 0.0;

      if (innings === 1) {
        currWP = this.computeWPInn1(score, lballs, wicketsLost, venuePar);
        for (var i = 0; i < outcomes.length; i++) {
          var pO = pVec[i];
          var rAdd = outcomes[i][1];
          var wAdd = outcomes[i][2];
          var bAdd = outcomes[i][3];

          var nextScore = score + rAdd;
          var nextLballs = lballs + bAdd;
          var nextWt = wicketsLost + wAdd;
          var wpNext = this.computeWPInn1(nextScore, nextLballs, nextWt, venuePar);
          cumSwing += pO * Math.abs(wpNext - currWP);
        }
        rawL = cumSwing;
        lNorm = interp(rawL, cfg.ecdf_inn1.vals, cfg.ecdf_inn1.pcts);
      } else {
        currWP = this.computeWPInn2(runsRequired, ballsRemaining, wicketsLost);
        for (var j = 0; j < outcomes.length; j++) {
          var pO2 = pVec[j];
          var rAdd2 = outcomes[j][1];
          var wAdd2 = outcomes[j][2];
          var bAdd2 = outcomes[j][3];

          var nextReq = Math.max(0, runsRequired - rAdd2);
          var nextBrem = Math.max(0, ballsRemaining - bAdd2);
          var nextWt2 = wicketsLost + wAdd2;
          var wpNext2 = this.computeWPInn2(nextReq, nextBrem, nextWt2);
          cumSwing += pO2 * Math.abs(wpNext2 - currWP);
        }
        rawL = cumSwing;
        lNorm = interp(rawL, cfg.ecdf_inn2.vals, cfg.ecdf_inn2.pcts);
      }

      return {
        currWP: currWP,
        rawL: rawL,
        lNorm: clip(lNorm, 0.0, 100.0),
        phase: phase
      };
    },

    computeTaskDifficulty: function(innings, ballsRemaining, score, wicketsLost, runsRequired, venuePar) {
      venuePar = venuePar || 176.68;
      var lballs = 120 - ballsRemaining;
      var wInfo = cfg.getWicketCurve(lballs);
      var muW = wInfo.mean;
      var sigW = wInfo.std;
      var rpar = venuePar / 20.0;
      var phase = (ballsRemaining > 84) ? 'PP' : (ballsRemaining > 30 ? 'Middle' : 'Death');

      var tBat = 0.0;
      var tBowl = 0.0;

      if (innings === 1) {
        var brem = Math.max(1.0, ballsRemaining);
        var rar = Math.max(0.0, (venuePar - score) / (brem / 6.0));
        var rateStress = (rar - rpar) / rpar;
        var wStress = (lballs === 0) ? 0.0 : (wicketsLost - muW) / sigW;
        var zB1 = 0.60 * rateStress + 0.40 * wStress;
        tBat = 100.0 / (1.0 + Math.exp(-1.2 * clip(zB1, -20.0, 20.0)));

        var crr1 = (lballs === 0) ? rpar : (score / Math.max(1.0, lballs)) * 6.0;
        var crrStress1 = (crr1 - rpar) / rpar;
        var wOppStress1 = (lballs === 0) ? 0.0 : (muW - wicketsLost) / sigW;
        var fieldFactor1 = (phase === 'PP' || phase === 'Death') ? 0.50 : 0.0;
        var zBo1 = 0.50 * crrStress1 + 0.35 * wOppStress1 + 0.15 * fieldFactor1;
        tBowl = 100.0 / (1.0 + Math.exp(-1.1 * clip(zBo1, -20.0, 20.0)));
      } else {
        var brem2 = Math.max(1.0, ballsRemaining);
        var rrr = clip((runsRequired / brem2) * 6.0, 0.0, 36.0);
        var zRrr = (rrr - 8.10) / 3.00;
        var zW = (wicketsLost - 3.50) / 2.00;
        var zInter = (rrr * wicketsLost - 28.0) / 25.0;
        var zB2 = 0.55 * zRrr + 0.25 * zW + 0.20 * zInter;
        tBat = 100.0 / (1.0 + Math.exp(-1.0 * clip(zB2, -20.0, 20.0)));

        var rrrStress2 = (8.10 - rrr) / 3.00;
        var wOppStress2 = (muW - wicketsLost) / sigW;
        var zBo2 = 0.60 * rrrStress2 + 0.40 * wOppStress2;
        tBowl = 100.0 / (1.0 + Math.exp(-1.0 * clip(zBo2, -20.0, 20.0)));
      }

      return {
        tBat: clip(tBat, 0.0, 100.0),
        tBowl: clip(tBowl, 0.0, 100.0)
      };
    },

    simulate: function(innings, ballsRemaining, score, wicketsLost, target, venuePar) {
      if (typeof innings === 'object' && innings !== null) {
        var p = innings;
        venuePar = p.par || p.venuePar || 176.68;
        target = p.target !== undefined ? p.target : 175;
        wicketsLost = p.wkts !== undefined ? p.wkts : (p.wicketsLost !== undefined ? p.wicketsLost : 3);
        score = p.score !== undefined ? p.score : 100;
        ballsRemaining = p.brem !== undefined ? p.brem : (p.ballsRemaining !== undefined ? p.ballsRemaining : 60);
        innings = p.inn || p.innings || 1;
      }
      venuePar = venuePar || 176.68;
      var runsReq = null;
      if (innings === 2) {
        runsReq = (target !== null && target !== undefined) ? Math.max(0, target - score) : Math.max(1, 180 - score);
      }

      var tDiff = this.computeTaskDifficulty(innings, ballsRemaining, score, wicketsLost, runsReq, venuePar);
      var lev = this.computeLeverageAndLNorm(innings, ballsRemaining, score, wicketsLost, runsReq, venuePar);

      var pBat = clip(Math.sqrt(tDiff.tBat * lev.lNorm), 0.0, 100.0);
      var pBowl = clip(Math.sqrt(tDiff.tBowl * lev.lNorm), 0.0, 100.0);

      var getBand = function(p) {
        if (p >= 75.0) return { name: "CRITICAL PRESSURE (CLUTCH TIME)", code: "CRUCIBLE", color: "#EA1B86" };
        if (p >= 50.0) return { name: "HIGH PRESSURE (GAME ON THE LINE)", code: "HIGH", color: "#F472B6" };
        if (p >= 30.0) return { name: "MEDIUM PRESSURE", code: "MODERATE", color: "#F59E0B" };
        return { name: "RELAXED / EASY GAME", code: "LOW", color: "#38BDF8" };
      };

      var bandBat = getBand(pBat);
      var bandBowl = getBand(pBowl);

      var crr = (score / Math.max(1.0, 120 - ballsRemaining)) * 6.0;
      var rrr = (runsReq !== null) ? (runsReq / Math.max(1.0, ballsRemaining) * 6.0) : null;

      return {
        innings: innings,
        phase: lev.phase,
        ballsRemaining: ballsRemaining,
        score: score,
        wicketsLost: wicketsLost,
        target: target,
        runsRequired: runsReq,
        wpBatting: lev.currWP,
        wpBowling: 1.0 - lev.currWP,
        win_prob: lev.currWP,
        rawConsequenceL: lev.rawL,
        normalizedConsequenceL: lev.lNorm,
        leverage_norm: lev.lNorm,
        taskDifficultyBat: tDiff.tBat,
        taskDifficultyBowl: tDiff.tBowl,
        task_difficulty: tDiff.tBat,
        pressureBatting: pBat,
        pressureBowling: pBowl,
        pressure_index: pBat,
        pressureBandBatting: bandBat,
        pressureBandBowling: bandBowl,
        classification: bandBat.name,
        crr: crr,
        rrr: rrr
      };
    }
  };

  window.PressureEngine = PressureEngine;
})(window);
