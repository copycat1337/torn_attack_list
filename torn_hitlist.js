// ==UserScript==
// @name         Torn attack list (Faction + Player Manager + FF Stats)
// @namespace    https://torn.com/
// @version      1.6
// @description  attack list maker scanner with FF Scouter battle stats - Manage multiple players
// @author       c0pyc4t 4039125
// @license      MIT
// @match        https://www.torn.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @connect      api.torn.com
// @connect      ffscouter.com
// ==/UserScript==

(function () {
    'use strict';

    // ============================================================
    // STYLES - Modern Dark Theme
    // ============================================================
    GM_addStyle(`
        .activity-floating-panel {
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 540px;
            max-height: 580px;
            background: linear-gradient(135deg, #0a0e1a 0%, #0d1117 100%);
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(48, 54, 61, 0.5);
            z-index: 100000;
            display: flex;
            flex-direction: column;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'Roboto', monospace;
            backdrop-filter: blur(10px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .activity-floating-panel.hidden {
            display: none !important;
        }

        .activity-floating-panel.minimized {
            width: auto !important;
            max-height: none !important;
            min-width: 60px !important;
            border-radius: 20px !important;
            cursor: pointer;
            background: linear-gradient(135deg, #0d1117 0%, #0a0e1a 100%);
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .activity-floating-panel.minimized .activity-panel-content,
        .activity-floating-panel.minimized .activity-tabs,
        .activity-floating-panel.minimized .activity-timestamp,
        .activity-floating-panel.minimized .button-group {
            display: none !important;
            opacity: 0 !important;
            height: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: hidden !important;
        }

        .activity-floating-panel.minimized .activity-panel-header {
            border-radius: 20px !important;
            border-bottom: none !important;
            padding: 8px 16px !important;
            cursor: pointer;
            justify-content: center;
            background: transparent !important;
            min-height: 36px;
        }

        .activity-floating-panel.minimized .activity-panel-title {
            font-size: 13px;
            font-weight: 700;
            white-space: nowrap;
        }

        .activity-floating-panel.minimized .activity-panel-title .panel-title-text {
            display: inline;
        }

        .activity-floating-panel.minimized .activity-panel-title::before {
            font-size: 16px;
        }

        .activity-floating-panel.minimized .minimize-btn {
            display: none !important;
        }

        .activity-panel-header {
            background: linear-gradient(135deg, rgba(16, 20, 30, 0.98) 0%, rgba(10, 14, 23, 0.98) 100%);
            padding: 10px 14px;
            border-radius: 12px 12px 0 0;
            cursor: move;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #e8edf5;
            font-weight: 600;
            border-bottom: 1px solid rgba(48, 54, 61, 0.5);
            backdrop-filter: blur(10px);
            letter-spacing: -0.2px;
            user-select: none;
            min-height: 40px;
            flex-shrink: 0;
        }

        .activity-panel-title {
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 6px;
            font-weight: 600;
            color: #e8edf5;
        }

        .activity-panel-title::before {
            content: "⚡";
            font-size: 14px;
            filter: drop-shadow(0 0 2px rgba(0,200,83,0.5));
        }

        .button-group {
            display: flex;
            gap: 6px;
            align-items: center;
        }

        .activity-refresh-btn {
            background: rgba(48, 54, 61, 0.6);
            border: 1px solid rgba(72, 78, 85, 0.5);
            color: #b4bec8;
            cursor: pointer;
            font-size: 10px;
            padding: 4px 12px;
            border-radius: 6px;
            transition: all 0.2s;
            font-weight: 600;
            white-space: nowrap;
        }

        .activity-refresh-btn:hover {
            background: rgba(0, 200, 83, 0.2);
            border-color: #00c853;
            color: #00c853;
            transform: translateY(-1px);
        }

        .minimize-btn {
            background: rgba(48, 54, 61, 0.5);
            border: none;
            color: #b4bec8;
            cursor: pointer;
            font-size: 16px;
            padding: 0 8px;
            border-radius: 6px;
            transition: all 0.2s;
            font-weight: bold;
            line-height: 1.4;
            width: 30px;
            text-align: center;
        }

        .minimize-btn:hover {
            background: rgba(0, 200, 83, 0.2);
            color: #00c853;
            transform: scale(1.05);
        }

        /* Hide button (X) styles */
        .hide-btn {
            background: rgba(48, 54, 61, 0.5);
            border: none;
            color: #b4bec8;
            cursor: pointer;
            font-size: 14px;
            padding: 0 8px;
            border-radius: 6px;
            transition: all 0.2s;
            font-weight: bold;
            line-height: 1.4;
            width: 30px;
            text-align: center;
        }

        .hide-btn:hover {
            background: rgba(255, 23, 68, 0.2);
            color: #ff1744;
            transform: scale(1.05);
        }

        .activity-tabs {
            display: flex;
            background: rgba(10, 14, 23, 0.95);
            border-bottom: 1px solid rgba(48, 54, 61, 0.5);
            padding: 4px 6px 0 6px;
            gap: 4px;
            flex-shrink: 0;
        }

        .activity-tab {
            flex: 1;
            padding: 6px 10px;
            text-align: center;
            cursor: pointer;
            font-size: 11px;
            font-weight: 600;
            color: #8b96a5;
            transition: all 0.2s;
            border: none;
            background: transparent;
            white-space: nowrap;
            border-radius: 6px 6px 0 0;
            letter-spacing: -0.2px;
        }

        .activity-tab:hover {
            background: rgba(48, 54, 61, 0.5);
            color: #d1d9e8;
        }

        .activity-tab.active {
            color: #00c853;
            border-bottom: 2px solid #00c853;
            background: rgba(0, 200, 83, 0.08);
        }

        .activity-panel-content {
            padding: 10px;
            overflow-y: auto;
            max-height: 480px;
            font-size: 11px;
            background: linear-gradient(180deg, rgba(13, 17, 23, 0.95) 0%, rgba(10, 14, 23, 0.95) 100%);
            flex: 1;
        }

        .activity-panel-content::-webkit-scrollbar {
            width: 5px;
        }

        .activity-panel-content::-webkit-scrollbar-track {
            background: rgba(48, 54, 61, 0.3);
            border-radius: 3px;
        }

        .activity-panel-content::-webkit-scrollbar-thumb {
            background: #00c853;
            border-radius: 3px;
        }

        .activity-tab-content {
            display: none;
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .activity-tab-content.active {
            display: block;
        }

        .activity-player-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 10px;
            border-bottom: 1px solid rgba(48, 54, 61, 0.3);
            gap: 8px;
            flex-wrap: wrap;
            transition: all 0.2s;
            border-radius: 6px;
            margin-bottom: 2px;
        }

        .activity-player-item:hover {
            background: rgba(48, 54, 61, 0.3);
            transform: translateX(2px);
        }

        .player-info-row {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 2;
            flex-wrap: wrap;
            min-width: 0;
        }

        .activity-player-name {
            color: #e8edf5;
            font-weight: 500;
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 11px;
            cursor: pointer;
            min-width: 80px;
            transition: color 0.2s;
        }

        .activity-player-name:hover {
            color: #ff1744;
            text-decoration: none;
            text-shadow: 0 0 8px rgba(255,23,68,0.3);
        }

        .activity-player-badge {
            padding: 3px 10px;
            border-radius: 16px;
            font-size: 9px;
            font-weight: 600;
            white-space: nowrap;
            min-width: 70px;
            text-align: center;
            letter-spacing: 0.2px;
            transition: all 0.2s;
            backdrop-filter: blur(4px);
        }

        .ff-badge {
            background: linear-gradient(135deg, rgba(106, 27, 154, 0.9) 0%, rgba(81, 45, 168, 0.9) 100%);
            color: white;
            cursor: help;
            border: 1px solid rgba(156, 39, 176, 0.5);
            font-size: 9px;
            padding: 3px 8px;
            min-width: 60px;
        }

        .ff-badge:hover {
            background: linear-gradient(135deg, rgba(142, 36, 170, 0.95) 0%, rgba(106, 27, 154, 0.95) 100%);
            transform: scale(1.02);
        }

        .badge-green {
            background: linear-gradient(135deg, rgba(0, 200, 83, 0.9) 0%, rgba(0, 150, 60, 0.9) 100%);
            color: white;
            border: 1px solid rgba(0, 200, 83, 0.5);
        }
        .badge-yellow {
            background: linear-gradient(135deg, rgba(255, 214, 0, 0.9) 0%, rgba(230, 190, 0, 0.9) 100%);
            color: #1a1a1a;
            border: 1px solid rgba(255, 214, 0, 0.5);
        }
        .badge-orange {
            background: linear-gradient(135deg, rgba(255, 109, 0, 0.9) 0%, rgba(230, 81, 0, 0.9) 100%);
            color: white;
            border: 1px solid rgba(255, 109, 0, 0.5);
        }
        .badge-red {
            background: linear-gradient(135deg, rgba(255, 23, 68, 0.9) 0%, rgba(200, 0, 50, 0.9) 100%);
            color: white;
            border: 1px solid rgba(255, 23, 68, 0.5);
        }
        .badge-black {
            background: linear-gradient(135deg, rgba(35, 39, 45, 0.95) 0%, rgba(20, 24, 30, 0.95) 100%);
            color: #b4bec8;
            border: 1px solid rgba(72, 78, 85, 0.5);
        }

        .badge-okay {
            background: linear-gradient(135deg, rgba(0, 200, 83, 0.7) 0%, rgba(0, 150, 60, 0.7) 100%);
            color: white;
            border: 1px solid rgba(0, 200, 83, 0.3);
        }
        .badge-hospital {
            background: linear-gradient(135deg, rgba(233, 30, 99, 0.8) 0%, rgba(200, 0, 70, 0.8) 100%);
            color: white;
            border: 1px solid rgba(233, 30, 99, 0.4);
        }
        .badge-traveling {
            background: linear-gradient(135deg, rgba(33, 150, 243, 0.8) 0%, rgba(25, 118, 210, 0.8) 100%);
            color: white;
            border: 1px solid rgba(33, 150, 243, 0.4);
        }

        .activity-loading {
            text-align: center;
            padding: 30px;
            color: #8b96a5;
            font-size: 11px;
        }

        .activity-loading::after {
            content: " ⚡";
            animation: pulse 1s ease-in-out infinite;
            display: inline-block;
        }

        @keyframes pulse {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.1); }
        }

        .activity-empty {
            text-align: center;
            padding: 30px;
            color: #5a6575;
            font-size: 11px;
            font-style: italic;
        }

        .activity-timestamp {
            font-size: 8px;
            text-align: center;
            padding: 6px;
            color: #5a6575;
            border-top: 1px solid rgba(48, 54, 61, 0.5);
            background: rgba(10, 14, 23, 0.95);
            font-weight: 500;
            letter-spacing: 0.5px;
            flex-shrink: 0;
        }

        .activity-toast {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #1a1f2e 0%, #0d1117 100%);
            color: #e8edf5;
            padding: 8px 16px;
            border-radius: 10px;
            font-size: 11px;
            z-index: 100001;
            border-left: 3px solid #00c853;
            opacity: 0;
            transition: opacity 0.3s;
            pointer-events: none;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }

        .activity-toast.show {
            opacity: 1;
        }

        .player-actions {
            display: flex;
            gap: 4px;
        }

        .player-action-btn {
            background: rgba(48, 54, 61, 0.5);
            border: 1px solid rgba(72, 78, 85, 0.3);
            color: #b4bec8;
            cursor: pointer;
            font-size: 9px;
            padding: 2px 8px;
            border-radius: 4px;
            transition: all 0.2s;
            font-weight: 500;
            white-space: nowrap;
        }

        .player-action-btn:hover {
            background: rgba(255, 23, 68, 0.2);
            border-color: #ff1744;
            color: #ff1744;
        }

        .player-action-btn.remove-user:hover {
            background: rgba(255, 23, 68, 0.3);
            border-color: #ff1744;
            color: #ff1744;
        }

        .player-action-btn.attack-btn {
            background: rgba(255, 23, 68, 0.15);
            border-color: rgba(255, 23, 68, 0.3);
            color: #ff1744;
        }

        .player-action-btn.attack-btn:hover {
            background: rgba(255, 23, 68, 0.3);
            border-color: #ff1744;
            transform: scale(1.05);
        }

        /* Settings Tab Styles */
        .settings-field-group {
            margin-bottom: 12px;
        }

        .settings-field-group label {
            display: block;
            color: #8b96a5;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }

        .settings-field-group input {
            width: 100%;
            padding: 6px 10px;
            background: rgba(13, 17, 23, 0.9);
            border: 1px solid rgba(48, 54, 61, 0.5);
            border-radius: 6px;
            color: #e8edf5;
            font-size: 11px;
            font-family: monospace;
            transition: border-color 0.2s;
            box-sizing: border-box;
        }

        .settings-field-group input:focus {
            outline: none;
            border-color: #00c853;
            box-shadow: 0 0 0 2px rgba(0,200,83,0.1);
        }

        .settings-field-group input::placeholder {
            color: #5a6575;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', monospace;
            font-size: 10px;
        }

        .settings-btn-row {
            display: flex;
            gap: 8px;
            margin: 8px 0 12px 0;
            flex-wrap: wrap;
        }

        .settings-btn {
            padding: 6px 16px;
            border-radius: 6px;
            border: 1px solid rgba(48, 54, 61, 0.5);
            background: rgba(48, 54, 61, 0.4);
            color: #b4bec8;
            cursor: pointer;
            font-size: 10px;
            font-weight: 600;
            transition: all 0.2s;
            flex: 1;
            min-width: 80px;
            text-align: center;
        }

        .settings-btn:hover {
            transform: translateY(-1px);
        }

        .settings-btn.primary {
            background: rgba(0, 200, 83, 0.2);
            border-color: #00c853;
            color: #00c853;
        }

        .settings-btn.primary:hover {
            background: rgba(0, 200, 83, 0.3);
            box-shadow: 0 0 20px rgba(0,200,83,0.1);
        }

        .settings-btn.danger {
            background: rgba(255, 23, 68, 0.15);
            border-color: #ff1744;
            color: #ff1744;
        }

        .settings-btn.danger:hover {
            background: rgba(255, 23, 68, 0.3);
        }

        .settings-btn.warning {
            background: rgba(255, 214, 0, 0.15);
            border-color: #ffd600;
            color: #ffd600;
        }

        .settings-btn.warning:hover {
            background: rgba(255, 214, 0, 0.3);
        }

        .settings-status {
            font-size: 10px;
            color: #5a6575;
            text-align: center;
            padding: 4px;
            border-top: 1px solid rgba(48, 54, 61, 0.3);
            margin-top: 8px;
        }

        .settings-status.success {
            color: #00c853;
        }

        .settings-status.error {
            color: #ff1744;
        }

        .settings-status.loading {
            color: #ffd600;
        }

        .hitlist-count {
            font-size: 10px;
            color: #8b96a5;
            text-align: center;
            padding: 4px 0 8px 0;
            border-bottom: 1px solid rgba(48, 54, 61, 0.2);
            margin-bottom: 8px;
        }

        .hitlist-header-actions {
            display: flex;
            gap: 6px;
            justify-content: flex-end;
            margin-bottom: 8px;
        }

        .hitlist-header-actions .settings-btn {
            padding: 4px 12px;
            font-size: 9px;
            flex: none;
            min-width: auto;
        }

        .hitlist-refresh-btn {
            background: rgba(0, 200, 83, 0.15);
            border-color: #00c853;
            color: #00c853;
        }

        .hitlist-refresh-btn:hover {
            background: rgba(0, 200, 83, 0.3);
            transform: scale(1.02);
        }

        .status-badge {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 8px;
            font-weight: 600;
            white-space: nowrap;
        }
    `);

    // ============================================================
    // CONFIGURATION
    // ============================================================
    const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
    const FF_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours for FF stats
    const API_DELAY = 700; // ~85 calls/min
    const FF_API_DELAY = 700; // ~85 calls/min
    const AUTO_REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hour auto-refresh
    const MAX_API_CALLS_PER_MINUTE = 95;

    let TORN_API_KEY = GM_getValue('torn_api_key', '');
    let FF_API_KEY = GM_getValue('ff_api_key', '');

    // ============================================================
    // PERSISTENT STORAGE KEYS
    // ============================================================
    const STORAGE_KEYS = {
        HITLIST_DATA: 'torn_attack_hitlist_data',
        HITLIST_TIMESTAMP: 'torn_attack_hitlist_timestamp',
        PANEL_MINIMIZED: 'torn_attack_panel_minimized',
        PANEL_HIDDEN: 'torn_attack_panel_hidden',
        PANEL_POSITION: 'torn_attack_panel_position',
        FF_CACHE: 'ff_scouter_cache',
        LAST_REFRESH: 'torn_attack_last_refresh'
    };

    // Data structures
    let hitlistPlayers = new Map();
    let ffCache = new Map();

    let lastHitlistFetch = 0;
    let isFetching = false;
    let currentTab = 'hitlist';
    let panel = null;
    let isPanelMinimized = false;
    let isPanelHidden = false;
    let autoRefreshTimer = null;

    // Rate limiting
    let apiCallTimestamps = [];

    function canMakeAPICall() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        apiCallTimestamps = apiCallTimestamps.filter(ts => ts > oneMinuteAgo);
        return apiCallTimestamps.length < MAX_API_CALLS_PER_MINUTE;
    }

    function recordAPICall() {
        apiCallTimestamps.push(Date.now());
    }

    async function rateLimitedAPICall(url, retryDelay = 2000) {
        let attempts = 0;
        while (!canMakeAPICall()) {
            const oldestCall = apiCallTimestamps[0];
            const waitTime = 60000 - (Date.now() - oldestCall) + 100;
            console.log(`[Rate Limit] Waiting ${waitTime}ms before next API call...`);
            await new Promise(r => setTimeout(r, Math.min(waitTime, 5000)));
            attempts++;
            if (attempts > 10) {
                console.error('[Rate Limit] Too many retries, giving up');
                return { error: { error: 'Rate limit exceeded' } };
            }
        }
        recordAPICall();
        return apiRequest(url);
    }

    // ============================================================
    // FF SCOUTER API INTEGRATION
    // ============================================================
    const FF_BASE_URL = "https://ffscouter.com";

    function loadFFCache() {
        const saved = GM_getValue(STORAGE_KEYS.FF_CACHE, null);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                ffCache = new Map(parsed);
                const now = Date.now();
                for (const [id, data] of ffCache) {
                    if (data.expiry && data.expiry < now) {
                        ffCache.delete(id);
                    }
                }
                return true;
            } catch (e) {
                console.error('[Scanner] Failed to parse FF cache:', e);
            }
        }
        return false;
    }

    function saveFFCache() {
        const dataToSave = Array.from(ffCache.entries());
        GM_setValue(STORAGE_KEYS.FF_CACHE, JSON.stringify(dataToSave));
    }

    async function fetchFFStats(playerIds) {
        if (!FF_API_KEY || playerIds.length === 0) return new Map();

        const now = Date.now();
        const uncachedIds = playerIds.filter(id => {
            const cached = ffCache.get(id);
            return !cached || cached.expiry < now;
        });

        if (uncachedIds.length === 0) return new Map();

        const results = new Map();
        const playerIdList = uncachedIds.join(",");
        const url = `${FF_BASE_URL}/api/v1/get-stats?key=${FF_API_KEY}&targets=${playerIdList}`;

        return new Promise((resolve) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: url,
                timeout: 15000,
                onload: function (response) {
                    if (response.status === 200 && response.responseText) {
                        try {
                            const ffResponse = JSON.parse(response.responseText);
                            if (ffResponse && !ffResponse.error) {
                                const expiry = now + FF_CACHE_DURATION;
                                for (const result of ffResponse) {
                                    if (result && result.player_id) {
                                        const cacheEntry = {
                                            player_id: result.player_id,
                                            ff: result.fair_fight,
                                            bs_estimate: result.bs_estimate,
                                            bs_estimate_human: result.bs_estimate_human,
                                            distribution_human: result.distribution?.distribution_human,
                                            last_updated: result.last_updated,
                                            expiry: expiry
                                        };
                                        ffCache.set(result.player_id.toString(), cacheEntry);
                                        results.set(result.player_id.toString(), cacheEntry);
                                    }
                                }
                                saveFFCache();
                            }
                        } catch (e) {
                            console.error('[FF] Parse error:', e);
                        }
                    }
                    resolve(results);
                },
                onerror: () => resolve(new Map())
            });
        });
    }

    async function getFFStatsForPlayers(playerIds) {
        const now = Date.now();
        const result = new Map();
        const needFetch = [];

        for (const id of playerIds) {
            const cached = ffCache.get(id);
            if (cached && cached.expiry > now) {
                result.set(id, cached);
            } else {
                needFetch.push(id);
            }
        }

        if (needFetch.length > 0) {
            for (let i = 0; i < needFetch.length; i += 50) {
                const chunk = needFetch.slice(i, i + 50);
                const fetched = await fetchFFStats(chunk);
                for (const [id, data] of fetched) {
                    result.set(id, data);
                }
                await new Promise(r => setTimeout(r, FF_API_DELAY));
            }
        }

        return result;
    }

    function getFFBadgeHtml(ffData) {
        if (!ffData || ffData.ff === null || ffData.ff === undefined) {
            return '<span class="activity-player-badge ff-badge" title="No FF data available">❓ No FF</span>';
        }

        const ff = ffData.ff;
        const ffString = ff.toFixed(2);
        let difficulty = '';
        let bgColor = '';

        if (ff <= 1) {
            difficulty = 'Extremely easy';
            bgColor = '#00c853';
        } else if (ff <= 2) {
            difficulty = 'Easy';
            bgColor = '#69f0ae';
        } else if (ff <= 3.5) {
            difficulty = 'Moderately difficult';
            bgColor = '#ffd600';
        } else if (ff <= 4.5) {
            difficulty = 'Difficult';
            bgColor = '#ff6d00';
        } else {
            difficulty = 'May be impossible';
            bgColor = '#ff1744';
        }

        const statLine = ffData.bs_estimate_human ? ` ${ffData.bs_estimate_human}` : '';
        const title = `FF: ${ffString} (${difficulty})${statLine}`;

        return `<span class="activity-player-badge ff-badge" style="background: linear-gradient(135deg, ${bgColor}CC 0%, ${bgColor}99 100%); color: ${bgColor === '#ffd600' ? '#1a1a1a' : 'white'}; border: 1px solid ${bgColor}80;" title="${title}">⚔️ ${ffString}${statLine}</span>`;
    }

    function getStatusBadgeHtml(status) {
        if (!status) {
            return '<span class="status-badge badge-okay">✅ Okay</span>';
        }
        const desc = status.description || '';
        const state = status.state || '';

        if (state === 'Hospital' || desc.toLowerCase().includes('hospital')) {
            return '<span class="status-badge badge-hospital">🏥 Hospital</span>';
        } else if (state === 'Traveling' || desc.toLowerCase().includes('travel')) {
            return '<span class="status-badge badge-traveling">✈️ Traveling</span>';
        }
        return '<span class="status-badge badge-okay">✅ Okay</span>';
    }

    // ============================================================
    // UTILITIES
    // ============================================================
    function showToast(msg, duration = 2500) {
        let toast = document.querySelector('.activity-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'activity-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), duration);
    }

    function formatTimeAsHours(minutes) {
        if (minutes <= 0) return '0m';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
        if (hours > 0) return `${hours}h`;
        return `${mins}m`;
    }

    function formatTimeDisplayFromRelative(relative, minutes) {
        if (relative?.toLowerCase().includes('online')) return '🟢 Online';
        if (minutes <= 0) return '0m';
        return formatTimeAsHours(minutes);
    }

    function minutesFromText(text) {
        if (!text) return 999999;
        text = text.toLowerCase();
        let total = 0;
        const daysMatch = text.match(/(\d+)\s*day/);
        const hoursMatch = text.match(/(\d+)\s*hour/);
        const minutesMatch = text.match(/(\d+)\s*min/);

        if (daysMatch) total += parseInt(daysMatch[1]) * 1440;
        if (hoursMatch) total += parseInt(hoursMatch[1]) * 60;
        if (minutesMatch) total += parseInt(minutesMatch[1]);

        if (total === 0 && (text.includes('sec') || text.includes('just now'))) total = 1;
        return total;
    }

    function getBadgeClass(minutes) {
        if (minutes >= 4320) return 'badge-black';
        if (minutes >= 1440) return 'badge-red';
        if (minutes >= 900) return 'badge-orange';
        if (minutes >= 240) return 'badge-yellow';
        return 'badge-green';
    }

    function escapeHtml(str) {
        if (!str) return 'Unknown';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    function openAttackPage(id) {
        window.open(`https://www.torn.com/page.php?sid=attack&user2ID=${id}`, '_blank');
    }

    function updateTimestamp() {
        const timestampEl = document.getElementById('activity-timestamp');
        if (timestampEl) {
            const lastRefresh = GM_getValue(STORAGE_KEYS.LAST_REFRESH, null);
            if (lastRefresh) {
                const timeAgo = Math.floor((Date.now() - lastRefresh) / 60000);
                if (timeAgo < 1) {
                    timestampEl.textContent = `Last refresh: just now | Auto-refresh every 1 hour`;
                } else if (timeAgo < 60) {
                    timestampEl.textContent = `Last refresh: ${timeAgo} min ago | Auto-refresh every 1 hour`;
                } else {
                    const hours = Math.floor(timeAgo / 60);
                    const mins = timeAgo % 60;
                    timestampEl.textContent = `Last refresh: ${hours}h ${mins}m ago | Auto-refresh every 1 hour`;
                }
            } else {
                timestampEl.textContent = `Ready | Auto-refresh every 1 hour`;
            }
        }
    }

    // ============================================================
    // API FETCH (Torn)
    // ============================================================
    function apiRequest(url) {
        return new Promise((resolve) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                timeout: 10000,
                onload: (resp) => {
                    try {
                        resolve(JSON.parse(resp.responseText));
                    } catch (e) {
                        resolve({ error: { error: 'Parse error' } });
                    }
                },
                onerror: () => resolve({ error: { error: 'Network error' } })
            });
        });
    }

    // ============================================================
    // HITLIST - Fetch players by ID or Faction
    // ============================================================
    async function fetchPlayerById(playerId) {
        if (!TORN_API_KEY) return null;

        const url = `https://api.torn.com/user/${playerId}?selections=profile&key=${TORN_API_KEY}`;
        const json = await rateLimitedAPICall(url);
        if (json.error) return null;

        const status = json.status || {};
        return {
            name: json.name || `User ${playerId}`,
            data: json.last_action?.relative ? {
                relative: json.last_action.relative,
                minutes: minutesFromText(json.last_action.relative)
            } : null,
            status: status,
            timestamp: Date.now()
        };
    }

    async function fetchFactionById(factionId) {
        if (!TORN_API_KEY) return new Map();

        const url = `https://api.torn.com/faction/${factionId}?selections=basic&key=${TORN_API_KEY}`;
        const json = await rateLimitedAPICall(url);
        if (json.error) return new Map();

        const members = json.members;
        if (!members) return new Map();

        const playersMap = new Map();
        for (const [id, member] of Object.entries(members)) {
            const relative = member.last_action?.relative;
            const profile = await fetchPlayerById(id);
            playersMap.set(id, {
                name: member.name || `User ${id}`,
                data: relative ? { relative, minutes: minutesFromText(relative) } : null,
                status: profile?.status || {},
                timestamp: Date.now()
            });
            await new Promise(r => setTimeout(r, API_DELAY));
        }
        return playersMap;
    }

    async function addPlayersToHitlist(playerIds, source = 'manual') {
        if (!TORN_API_KEY) {
            showToast('⚠️ Please set your Torn API Key in Settings first!', 5000);
            return false;
        }

        const newPlayers = new Map();
        let addedCount = 0;

        for (const id of playerIds) {
            const trimmedId = id.trim();
            if (!trimmedId || isNaN(trimmedId)) continue;

            if (hitlistPlayers.has(trimmedId)) {
                continue;
            }

            try {
                const playerData = await fetchPlayerById(trimmedId);
                if (playerData) {
                    newPlayers.set(trimmedId, { ...playerData, source });
                    addedCount++;
                }
                await new Promise(r => setTimeout(r, API_DELAY));
            } catch (e) {
                console.error(`[Hitlist] Failed to fetch player ${trimmedId}:`, e);
            }
        }

        for (const [id, entry] of newPlayers) {
            hitlistPlayers.set(id, entry);
        }

        if (addedCount > 0) {
            saveHitlistData();
            renderHitlist();
            showToast(`✅ Added ${addedCount} players to hitlist`, 3000);
            return true;
        } else {
            showToast('⚠️ No new players were added (check IDs or API key)', 3000);
            return false;
        }
    }

    async function fetchFactionToHitlist(factionId) {
        if (!TORN_API_KEY) {
            showToast('⚠️ Please set your Torn API Key in Settings first!', 5000);
            return false;
        }

        if (!factionId || isNaN(factionId)) {
            showToast('⚠️ Please enter a valid Faction ID', 3000);
            return false;
        }

        const playersMap = await fetchFactionById(factionId);
        if (playersMap.size === 0) {
            showToast('⚠️ No players found in faction or invalid ID', 3000);
            return false;
        }

        let addedCount = 0;
        for (const [id, entry] of playersMap) {
            if (!hitlistPlayers.has(id)) {
                hitlistPlayers.set(id, { ...entry, source: `faction_${factionId}` });
                addedCount++;
            }
        }

        if (addedCount > 0) {
            saveHitlistData();
            renderHitlist();
            showToast(`✅ Added ${addedCount} players from faction ${factionId}`, 3000);
            return true;
        } else {
            showToast('ℹ️ All players already in hitlist', 3000);
            return false;
        }
    }

    function removePlayerFromHitlist(playerId) {
        if (hitlistPlayers.has(playerId)) {
            hitlistPlayers.delete(playerId);
            saveHitlistData();
            renderHitlist();
            showToast(`🗑️ Removed player ${playerId} from hitlist`, 2000);
            return true;
        }
        return false;
    }

    function clearHitlist() {
        if (hitlistPlayers.size === 0) {
            showToast('ℹ️ Hitlist is already empty', 2000);
            return;
        }
        if (confirm('Remove ALL players from the hitlist?')) {
            hitlistPlayers.clear();
            saveHitlistData();
            renderHitlist();
            showToast('🗑️ Cleared all players from hitlist', 2000);
        }
    }

    function saveHitlistData() {
        GM_setValue(STORAGE_KEYS.HITLIST_DATA, JSON.stringify(Array.from(hitlistPlayers.entries())));
        GM_setValue(STORAGE_KEYS.HITLIST_TIMESTAMP, lastHitlistFetch);
    }

    function loadHitlistData() {
        const saved = GM_getValue(STORAGE_KEYS.HITLIST_DATA, null);
        if (saved) {
            try {
                hitlistPlayers = new Map(JSON.parse(saved));
                lastHitlistFetch = GM_getValue(STORAGE_KEYS.HITLIST_TIMESTAMP, 0);
                return true;
            } catch (e) {}
        }
        return false;
    }

    // ============================================================
    // FORCE REFRESH ALL
    // ============================================================
    async function forceRefreshAll() {
        if (isFetching) {
            console.log('[Auto-Refresh] Already fetching, skipping...');
            return;
        }
        console.log('[Auto-Refresh] Starting scheduled refresh...');
        showToast('🔄 Auto-refreshing hitlist...', 2000);

        isFetching = true;

        if (hitlistPlayers.size > 0) {
            const hitlistIds = Array.from(hitlistPlayers.keys());
            const updatedPlayers = new Map();
            let updatedCount = 0;

            for (const id of hitlistIds) {
                try {
                    const playerData = await fetchPlayerById(id);
                    if (playerData) {
                        const existing = hitlistPlayers.get(id);
                        updatedPlayers.set(id, { ...playerData, source: existing?.source || 'manual' });
                        updatedCount++;
                    }
                    await new Promise(r => setTimeout(r, API_DELAY));
                } catch (e) {
                    console.error(`[Hitlist Refresh] Failed to update ${id}:`, e);
                }
            }

            if (updatedCount > 0) {
                hitlistPlayers.clear();
                for (const [id, entry] of updatedPlayers) {
                    hitlistPlayers.set(id, entry);
                }
                saveHitlistData();
            }
        }

        if (hitlistPlayers.size > 0 && FF_API_KEY) {
            const playerIds = Array.from(hitlistPlayers.keys());
            for (const id of playerIds) {
                ffCache.delete(id);
            }
            saveFFCache();
            await getFFStatsForPlayers(playerIds);
            saveFFCache();
        }

        renderHitlist();
        GM_setValue(STORAGE_KEYS.LAST_REFRESH, Date.now());
        updateTimestamp();

        isFetching = false;
        console.log('[Auto-Refresh] Completed');
        showToast('✅ Auto-refresh complete', 2000);
    }

    // ============================================================
    // UI COMPONENTS
    // ============================================================
    function toggleMinimized() {
        isPanelMinimized = !isPanelMinimized;
        GM_setValue(STORAGE_KEYS.PANEL_MINIMIZED, isPanelMinimized);

        if (panel) {
            const minBtn = document.getElementById('minimize-panel');
            if (isPanelMinimized) {
                panel.classList.add('minimized');
                if (minBtn) minBtn.textContent = '□';
            } else {
                panel.classList.remove('minimized');
                if (minBtn) minBtn.textContent = '−';
                // Re-render content
                if (currentTab === 'hitlist') {
                    renderHitlist();
                } else if (currentTab === 'settings') {
                    buildSettingsTab();
                }
            }
        }
    }

    function togglePanelHidden() {
        isPanelHidden = !isPanelHidden;
        GM_setValue(STORAGE_KEYS.PANEL_HIDDEN, isPanelHidden);

        if (panel) {
            if (isPanelHidden) {
                panel.classList.add('hidden');
                showToast('📌 Panel hidden. Use Tampermonkey menu to show again.', 3000);
            } else {
                panel.classList.remove('hidden');
                // Restore minimized state if it was minimized
                if (isPanelMinimized) {
                    panel.classList.add('minimized');
                }
                // Re-render content
                if (currentTab === 'hitlist') {
                    renderHitlist();
                } else if (currentTab === 'settings') {
                    buildSettingsTab();
                }
                showToast('📌 Panel shown', 2000);
            }
        }
    }

    function startAutoRefreshTimer() {
        if (autoRefreshTimer) {
            clearInterval(autoRefreshTimer);
        }
        autoRefreshTimer = setInterval(() => {
            forceRefreshAll();
        }, AUTO_REFRESH_INTERVAL);
        console.log(`[Auto-Refresh] Timer started - will refresh every ${AUTO_REFRESH_INTERVAL / 60000} minutes`);
    }

    // ============================================================
    // HITLIST TAB UI
    // ============================================================
    function renderHitlist() {
        const container = document.getElementById('hitlist-tab');
        if (!container) return;
        if (isPanelHidden) return;

        if (hitlistPlayers.size === 0) {
            container.innerHTML = `
                <div class="hitlist-count">📋 0 players in hitlist</div>
                <div class="activity-empty">No players in hitlist. Go to Settings tab to add players.</div>
            `;
            return;
        }

        const playerIds = Array.from(hitlistPlayers.keys());
        getFFStatsForPlayers(playerIds).then(() => {
            const sorted = Array.from(hitlistPlayers.entries()).sort((a, b) => {
                const minA = a[1].data?.minutes ?? 999999;
                const minB = b[1].data?.minutes ?? 999999;
                return minA - minB;
            });

            let html = `
                <div class="hitlist-count">📋 ${hitlistPlayers.size} players in hitlist</div>
                <div class="hitlist-header-actions">
                    <button class="settings-btn hitlist-refresh-btn" id="hitlist-refresh-data" style="padding:3px 10px;font-size:9px;">🔄 Refresh Data</button>
                    <button class="settings-btn danger" id="hitlist-remove-all" style="padding:3px 10px;font-size:9px;">🗑️ Clear All</button>
                </div>
            `;

            for (const [id, { name, data, source, status }] of sorted) {
                const ffData = ffCache.get(id);
                const ffBadge = getFFBadgeHtml(ffData);
                const statusBadge = getStatusBadgeHtml(status);

                if (!data) {
                    html += `<div class="activity-player-item">
                                <div class="player-info-row">
                                    <span class="activity-player-name" data-id="${id}">${escapeHtml(name)}</span>
                                    ${ffBadge}
                                    ${statusBadge}
                                    <span class="activity-player-badge" style="background: #2a2e3a;">⏳ pending</span>
                                </div>
                                <div class="player-actions">
                                    <button class="player-action-btn attack-btn" data-id="${id}">⚔️ Attack</button>
                                    <button class="player-action-btn remove-user" data-id="${id}">✕</button>
                                </div>
                             </div>`;
                } else {
                    const timeDisplay = formatTimeDisplayFromRelative(data.relative, data.minutes);
                    const badgeClass = getBadgeClass(data.minutes);
                    html += `<div class="activity-player-item">
                                <div class="player-info-row">
                                    <span class="activity-player-name" data-id="${id}">${escapeHtml(name)}</span>
                                    ${ffBadge}
                                    ${statusBadge}
                                    <span class="activity-player-badge ${badgeClass}">⏱️ ${timeDisplay}</span>
                                </div>
                                <div class="player-actions">
                                    <button class="player-action-btn attack-btn" data-id="${id}">⚔️ Attack</button>
                                    <button class="player-action-btn remove-user" data-id="${id}">✕</button>
                                </div>
                             </div>`;
                }
            }
            container.innerHTML = html;

            container.querySelectorAll('.activity-player-name').forEach(el => {
                el.addEventListener('click', () => openAttackPage(el.dataset.id));
            });

            container.querySelectorAll('.attack-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    openAttackPage(this.dataset.id);
                });
            });

            container.querySelectorAll('.remove-user').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const id = this.dataset.id;
                    removePlayerFromHitlist(id);
                });
            });

            const removeAllBtn = document.getElementById('hitlist-remove-all');
            if (removeAllBtn) {
                removeAllBtn.addEventListener('click', clearHitlist);
            }

            const refreshBtn = document.getElementById('hitlist-refresh-data');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', async function() {
                    this.disabled = true;
                    this.textContent = '⏳ Refreshing...';
                    await forceRefreshAll();
                    this.textContent = '🔄 Refresh Data';
                    this.disabled = false;
                });
            }
        });
    }

    // ============================================================
    // SETTINGS TAB UI
    // ============================================================
    function buildSettingsTab() {
        const container = document.getElementById('settings-tab');
        if (!container) return;
        if (isPanelHidden) return;

        let html = `
            <div class="settings-field-group">
                <label>🔑 Torn API Key</label>
                <input type="password" id="settings-torn-key" placeholder="Enter your Torn API key..." value="${TORN_API_KEY || ''}">
            </div>
            <div class="settings-field-group">
                <label>⚔️ FF Scouter API Key</label>
                <input type="password" id="settings-ff-key" placeholder="Enter your FF Scouter API key..." value="${FF_API_KEY || ''}">
            </div>
            <hr style="border-color: rgba(48,54,61,0.3); margin: 8px 0;">
            <div class="settings-field-group">
                <label>🎯 Player ID(s) (comma separated)</label>
                <input type="text" id="settings-player-ids" placeholder="e.g. 123456, 789012, 345678">
            </div>
            <div class="settings-field-group">
                <label>🏛️ Faction ID</label>
                <input type="text" id="settings-faction-id" placeholder="e.g. 12345">
            </div>
            <div class="settings-btn-row">
                <button class="settings-btn primary" id="settings-add-players">➕ Add Players</button>
                <button class="settings-btn primary" id="settings-add-faction">🏛️ Add Faction</button>
            </div>
            <hr style="border-color: rgba(48,54,61,0.3); margin: 8px 0;">
            <div class="settings-btn-row">
                <button class="settings-btn danger" id="settings-clear-hitlist">🗑️ Clear Hitlist</button>
                <button class="settings-btn" id="settings-refresh-ff">🔄 Refresh FF Stats</button>
            </div>
            <div id="settings-status" class="settings-status">Ready</div>
        `;

        container.innerHTML = html;

        document.getElementById('settings-torn-key').addEventListener('change', function() {
            TORN_API_KEY = this.value.trim();
            GM_setValue('torn_api_key', TORN_API_KEY);
            setSettingsStatus('Torn API Key saved', 'success');
        });

        document.getElementById('settings-ff-key').addEventListener('change', function() {
            FF_API_KEY = this.value.trim();
            GM_setValue('ff_api_key', FF_API_KEY);
            setSettingsStatus('FF Scouter API Key saved', 'success');
            saveFFCache();
        });

        document.getElementById('settings-add-players').addEventListener('click', async function() {
            const input = document.getElementById('settings-player-ids');
            const ids = input.value.split(',').map(s => s.trim()).filter(s => s && !isNaN(s));
            if (ids.length === 0) {
                setSettingsStatus('⚠️ Please enter at least one valid player ID', 'error');
                return;
            }
            setSettingsStatus(`⏳ Adding ${ids.length} players...`, 'loading');
            this.disabled = true;
            await addPlayersToHitlist(ids, 'manual');
            this.disabled = false;
            document.getElementById('settings-player-ids').value = '';
            switchTab('hitlist');
        });

        document.getElementById('settings-add-faction').addEventListener('click', async function() {
            const input = document.getElementById('settings-faction-id');
            const factionId = input.value.trim();
            if (!factionId || isNaN(factionId)) {
                setSettingsStatus('⚠️ Please enter a valid Faction ID', 'error');
                return;
            }
            setSettingsStatus(`⏳ Fetching faction ${factionId}...`, 'loading');
            this.disabled = true;
            await fetchFactionToHitlist(factionId);
            this.disabled = false;
            document.getElementById('settings-faction-id').value = '';
            switchTab('hitlist');
        });

        document.getElementById('settings-clear-hitlist').addEventListener('click', function() {
            clearHitlist();
            setSettingsStatus('🗑️ Hitlist cleared', 'success');
        });

        document.getElementById('settings-refresh-ff').addEventListener('click', async function() {
            if (!FF_API_KEY) {
                setSettingsStatus('⚠️ Please set your FF Scouter API key first', 'error');
                return;
            }
            if (hitlistPlayers.size === 0) {
                setSettingsStatus('ℹ️ No players in hitlist', 'error');
                return;
            }
            const playerIds = Array.from(hitlistPlayers.keys());
            setSettingsStatus(`⏳ Fetching FF stats for ${playerIds.length} players...`, 'loading');
            this.disabled = true;

            for (const id of playerIds) {
                ffCache.delete(id);
            }
            saveFFCache();

            await getFFStatsForPlayers(playerIds);
            saveFFCache();
            renderHitlist();
            setSettingsStatus(`✅ FF stats updated for ${playerIds.length} players`, 'success');
            this.disabled = false;
        });
    }

    function setSettingsStatus(msg, type = 'info') {
        const statusEl = document.getElementById('settings-status');
        if (statusEl) {
            statusEl.textContent = msg;
            statusEl.className = 'settings-status';
            if (type) statusEl.classList.add(type);
        }
    }

    // ============================================================
    // TAB SWITCHING
    // ============================================================
    function switchTab(tabName) {
        if (isPanelHidden) return;

        currentTab = tabName;
        document.querySelectorAll('.activity-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        document.querySelectorAll('.activity-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        if (tabName === 'hitlist') {
            renderHitlist();
        } else if (tabName === 'settings') {
            buildSettingsTab();
        }
    }

    // ============================================================
    // PANEL CREATION
    // ============================================================
    function createFloatingPanel() {
        if (panel) return panel;

        const savedMinimized = GM_getValue(STORAGE_KEYS.PANEL_MINIMIZED, false);
        const savedHidden = GM_getValue(STORAGE_KEYS.PANEL_HIDDEN, false);
        isPanelMinimized = savedMinimized;
        isPanelHidden = savedHidden;

        panel = document.createElement('div');
        panel.className = 'activity-floating-panel';
        if (isPanelMinimized) panel.classList.add('minimized');
        if (isPanelHidden) panel.classList.add('hidden');

        // Restore saved position
        const savedPosition = GM_getValue(STORAGE_KEYS.PANEL_POSITION, null);
        if (savedPosition) {
            try {
                const pos = JSON.parse(savedPosition);
                panel.style.left = pos.left + 'px';
                panel.style.bottom = pos.bottom + 'px';
            } catch (e) {}
        }

        panel.innerHTML = `
            <div class="activity-panel-header">
                <span class="activity-panel-title"><span class="panel-title-text">Attack List</span></span>
                <div class="button-group">
                    <button class="activity-refresh-btn" id="activity-force-refresh">🔄 Refresh</button>
                    <button class="minimize-btn" id="minimize-panel" title="Minimize panel">${isPanelMinimized ? '□' : '−'}</button>
                    <button class="hide-btn" id="hide-panel" title="Hide panel completely (use Tampermonkey menu to show again)">✕</button>
                </div>
            </div>
            <div class="activity-tabs">
                <button class="activity-tab active" data-tab="hitlist">🎯 Hit List</button>
                <button class="activity-tab" data-tab="settings">⚙️ Settings</button>
            </div>
            <div class="activity-panel-content">
                <div id="hitlist-tab" class="activity-tab-content active"><div class="activity-loading">Loading...</div></div>
                <div id="settings-tab" class="activity-tab-content"><div class="activity-loading">Loading...</div></div>
            </div>
            <div class="activity-timestamp" id="activity-timestamp">Ready</div>
        `;
        document.body.appendChild(panel);

        // Tab switching
        document.querySelectorAll('.activity-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                if (!isPanelHidden) {
                    switchTab(tab.dataset.tab);
                }
            });
        });

        // Force Refresh button
        document.getElementById('activity-force-refresh').addEventListener('click', function() {
            if (isPanelHidden) return;
            this.disabled = true;
            this.textContent = '⏳...';
            forceRefreshAll().then(() => {
                this.textContent = '🔄 Refresh';
                this.disabled = false;
            });
        });

        // Minimize button
        document.getElementById('minimize-panel').addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMinimized();
        });

        // Hide button - completely hides the panel
        document.getElementById('hide-panel').addEventListener('click', function(e) {
            e.stopPropagation();
            togglePanelHidden();
        });

        // Click on minimized panel to expand
        panel.addEventListener('click', function(e) {
            if (isPanelMinimized && !isPanelHidden) {
                // Only expand if clicking on the header or the panel itself (not on buttons)
                const target = e.target;
                if (target.closest('.minimize-btn') || target.closest('.hide-btn') || target.closest('.activity-refresh-btn')) {
                    return;
                }
                toggleMinimized();
            }
        });

        // Draggable with position saving
        let isDragging = false, startX, startY, startLeft, startBottom;
        const header = panel.querySelector('.activity-panel-header');
        header.addEventListener('mousedown', (e) => {
            if (isPanelHidden) return;
            if (e.target.classList.contains('minimize-btn') || e.target.classList.contains('hide-btn') || e.target.classList.contains('activity-refresh-btn')) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = panel.getBoundingClientRect();
            startLeft = rect.left;
            startBottom = window.innerHeight - rect.bottom;
            panel.style.transition = 'none';
        });
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const newLeft = startLeft + (e.clientX - startX);
            const newBottom = startBottom + (startY - e.clientY);
            panel.style.left = newLeft + 'px';
            panel.style.bottom = newBottom + 'px';
        });
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                panel.style.transition = '';
                // Save position
                const rect = panel.getBoundingClientRect();
                const pos = {
                    left: rect.left,
                    bottom: window.innerHeight - rect.bottom
                };
                GM_setValue(STORAGE_KEYS.PANEL_POSITION, JSON.stringify(pos));
            }
        });

        return panel;
    }

    // ============================================================
    // INITIALIZATION
    // ============================================================
    async function initialize() {
        createFloatingPanel();
        loadHitlistData();
        loadFFCache();

        if (!TORN_API_KEY) {
            const warn = document.createElement('div');
            warn.textContent = '⚠️ Attack List: Set Torn API Key in the Settings tab';
            warn.style.cssText = 'position:fixed;top:0;left:0;right:0;background:linear-gradient(135deg,#ff9800,#ff6d00);color:#fff;text-align:center;padding:6px;z-index:999999;font-size:11px;font-weight:600;box-shadow:0 2px 8px rgba(0,0,0,0.2);';
            document.body.appendChild(warn);
        }

        if (!isPanelHidden) {
            switchTab('hitlist');
        }
        updateTimestamp();

        startAutoRefreshTimer();

        // Menu commands
        GM_registerMenuCommand('🔑 Set Torn API Key', () => {
            const input = prompt('Enter your Torn API key (Limited, with Profile access):', TORN_API_KEY);
            if (input?.trim()) {
                TORN_API_KEY = input.trim();
                GM_setValue('torn_api_key', TORN_API_KEY);
                showToast('✅ Torn API Key saved!', 2000);
                if (document.getElementById('settings-torn-key')) {
                    document.getElementById('settings-torn-key').value = TORN_API_KEY;
                }
            }
        });

        GM_registerMenuCommand('🔑 Set FF Scouter API Key', () => {
            const input = prompt('Enter your FF Scouter API key (from ffscouter.com):', FF_API_KEY);
            if (input?.trim()) {
                FF_API_KEY = input.trim();
                GM_setValue('ff_api_key', FF_API_KEY);
                showToast('✅ FF Scouter API Key saved!', 2000);
                if (document.getElementById('settings-ff-key')) {
                    document.getElementById('settings-ff-key').value = FF_API_KEY;
                }
            }
        });

        GM_registerMenuCommand('📌 Minimize/Restore Panel', () => {
            toggleMinimized();
        });

        GM_registerMenuCommand('👁️ Show/Hide Panel', () => {
            togglePanelHidden();
        });

        GM_registerMenuCommand('🗑️ Clear All Cached Data', () => {
            if (confirm('Clear all cached data?')) {
                GM_setValue(STORAGE_KEYS.HITLIST_DATA, null);
                GM_setValue(STORAGE_KEYS.FF_CACHE, null);
                hitlistPlayers.clear();
                ffCache.clear();
                showToast('🗑️ All cached data cleared!', 2000);
                setTimeout(() => location.reload(), 1500);
            }
        });

        console.log('[Attack List] v1.4 - Minimize + Hide buttons, movable panel with position saving');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();