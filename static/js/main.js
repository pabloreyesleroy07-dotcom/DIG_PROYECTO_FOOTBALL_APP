document.addEventListener("DOMContentLoaded", () => {
    const reportsList = document.getElementById("reports-list");
    const generateBtn = document.getElementById("generate-btn");
    const reportViewer = document.getElementById("report-viewer");
    const emptyState = document.getElementById("empty-state");
    const reportContent = document.getElementById("report-content");
    const topbarInfo = document.getElementById("topbar-info");
    const loadingOverlay = document.getElementById("loading-overlay");
    const toast = document.getElementById("toast");
    const reportFilters = document.getElementById("report-filters");
    const searchInput = document.getElementById("search-input");
    const filterBtns = document.querySelectorAll(".filter-btn:not(#btn-toggle-all)");

    // Theme logic
    const themeToggle = document.getElementById("theme-toggle");
    let currentTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", currentTheme);
    updateThemeIcon();

    themeToggle.addEventListener("click", () => {
        currentTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", currentTheme);
        localStorage.setItem("theme", currentTheme);
        updateThemeIcon();
    });

    function updateThemeIcon() {
        themeToggle.innerHTML = currentTheme === "dark" ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    }

    // Server Shutdown Logic
    const shutdownBtn = document.getElementById("shutdown-btn");
    shutdownBtn.addEventListener("click", () => {
        if (confirm("¿Estás seguro de que quieres apagar el servidor? El analizador se detendrá por completo.")) {
            fetch("/api/shutdown", { method: "POST" })
                .then(() => {
                    document.body.innerHTML = "<h2 style='text-align:center; margin-top: 20%; font-family: sans-serif; color: white;'>Servidor apagado. Ya puedes cerrar esta ventana.</h2>";
                }).catch(() => {
                    alert("Servidor interrumpido.");
                    window.close();
                });
        }
    });

    // Fetch initial list of reports
    fetchReports();
    // Auto-load dashboard natively
    setTimeout(() => {
        const dbBtn = document.getElementById('btn-open-dashboard');
        if (dbBtn) dbBtn.click();
    }, 500);

    function fetchReports() {
        fetch('/api/reports')
            .then(response => response.json())
            .then(data => {
                renderReportsList(data);
            })
            .catch(error => {
                console.error('Error fetching reports:', error);
                reportsList.innerHTML = '<p style="color:red; text-align:center;">Error fetching reports.</p>';
            });
    }

    function renderReportsList(reports) {
        reportsList.innerHTML = ''; // clear loader

        if (reports.length === 0) {
            reportsList.innerHTML = '<p style="text-align:center; color: var(--text-muted);">No reports available yet.</p>';
            return;
        }

        reports.forEach((report, index) => {
            const li = document.createElement("li");
            li.className = "report-item";
            li.dataset.filename = report.filename;

            // Format date for display
            const dateObj = new Date(report.timestamp * 1000);
            const formattedDate = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

            li.innerHTML = `
                <div class="report-icon glass-circle">
                    <i class="fa-solid fa-file-lines"></i>
                </div>
                <div class="report-info">
                    <h4>${report.date_str}</h4>
                    <p>${formattedDate}</p>
                </div>
            `;

            li.addEventListener("click", () => {
                document.querySelectorAll(".report-item").forEach(el => el.classList.remove("active"));
                li.classList.add("active");
                loadReport(report.filename, report.date_str);
            });

            reportsList.appendChild(li);

            // Auto click first item if available
            if (index === 0) {
                li.click();
            }
        });
    }

    function loadReport(filename, dateStr) {
        // Show loading state in viewer
        reportContent.classList.add("hidden");
        emptyState.classList.remove("hidden");
        emptyState.innerHTML = '<div class="sidebar-loader"></div><p>Loading report...</p>';

        fetch(`/api/reports/${filename}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) throw new Error(data.error);

                // Update Topbar Title safely without destroying the buttons child div
                const titleDiv = topbarInfo.querySelector('div:first-child');
                if (titleDiv) {
                    titleDiv.innerHTML = `
                        <h2>Report from ${dateStr}</h2>
                        <p>Resultados del Scanner AI Global</p>
                    `;
                }

                const btnVerify = document.getElementById('btn-verify-report');
                if (btnVerify) {
                    btnVerify.disabled = false;
                    btnVerify.style.opacity = '1';
                    btnVerify.style.cursor = 'pointer';
                    btnVerify.dataset.date = dateStr;
                }

                // Update Content
                emptyState.classList.add("hidden");
                reportContent.classList.remove("hidden");
                reportFilters.classList.remove("hidden");

                // Simple Parser to make text look pretty
                const parsedHTML = formatReportText(data.content, dateStr);
                reportContent.innerHTML = parsedHTML;

                initBetButtons();

                // Reset search and filters
                searchInput.value = '';
                filterBtns.forEach(b => b.classList.remove('active'));
                document.querySelector('[data-filter="all"]').classList.add('active');
                applyFilters();
                
                // Reset Toggle All Button state
                const tglBtn = document.getElementById('btn-toggle-all');
                if (tglBtn) { tglBtn.innerHTML = '<i class="fa-solid fa-compress"></i> Contraer Todo'; tglBtn.dataset.state = 'expanded'; }

                // Auto-scroll to viewer to enhance UX in sectioned layout
                setTimeout(() => {
                    const viewerSection = document.getElementById('report-viewer-section');
                    if (viewerSection) {
                        viewerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            })
            .catch(err => {
                emptyState.innerHTML = `<div class="empty-icon glass-circle" style="color:var(--accent)"><i class="fa-solid fa-triangle-exclamation"></i></div><h2>Error</h2><p>${err.message}</p>`;
            });
    }

    function formatReportText(text, dateStr) {
        const lines = text.split('\n');
        let html = '';
        let currentMatchHtml = '';
        let currentTags = [];
        let inMatchBlock = false;

        lines.forEach(line => {
            if (line.includes('===================================================================================================================')) {
                if (inMatchBlock) {
                    // Close previous match block and inject its tags
                    const tagsAttr = currentTags.length > 0 ? currentTags.join(' ') : 'none';
                    html += `<div class="match-block" data-tags="${tagsAttr}">${currentMatchHtml}</div>`;
                }
                inMatchBlock = true;
                currentMatchHtml = '';
                currentTags = [];
                return;
            }

            if (!inMatchBlock) {
                // Header Lines
                if (line.trim().startsWith('Matches analyzed')) {
                    html += `<div class="report-header">
                                <h3>Resumen Diario</h3>
                                <p>${line}</p>`;
                } else if (line.trim().startsWith('Matches with anomalies') || line.trim().startsWith('Matches without anomalies')) {
                    html += `<p>${line}</p>`;
                    if (line.trim().startsWith('Matches without anomalies')) html += `</div>`;
                }
            } else {
                // Inside a Match Block
                if (line.includes('[!!!]') || line.includes('[!]')) {
                    currentMatchHtml += `<div class="anomalia-alert">${line.replace(/\(Fiabilidad: \d+%\)/g, '').trim()}</div>`;

                    if (line.includes('CÓRNERS:')) currentTags.push('corners');
                    if (line.includes('AMBOS MARCAN:')) currentTags.push('ambos_marcan');
                    if (line.includes('TIROS:') || line.includes('TAP:') || line.includes('VALOR EXTREMO detectado en TAP') || line.includes('VALOR EXTREMO detectado en Tiros')) currentTags.push('tiros');

                } else if (line.includes('🚦 GLOBAL CONFIDENCE:')) {
                    const matchArray = line.match(/🚦 GLOBAL CONFIDENCE: (.*?) \((\d+)%\)/);
                    if (matchArray) {
                        const level = matchArray[1];
                        const pct = matchArray[2];
                        let colorVar = 'var(--text-main)';
                        if (level.includes('ALTA')) {
                            colorVar = 'var(--secondary)';
                            currentTags.push('confianza_alta');
                        }
                        else if (level.includes('MEDIA')) colorVar = '#eab308'; // yellow
                        else if (level.includes('BAJA')) colorVar = 'var(--accent)';

                        currentMatchHtml += `
                            <div style="display: inline-block; margin-top: 0.5rem; margin-bottom: 0.5rem; padding: 0.3rem 0.8rem; background: rgba(0,0,0,0.3); border: 1px solid ${colorVar}; border-radius: 20px; font-weight: bold; color: ${colorVar}; font-size: 0.85rem;">
                                🚦 Confidence: ${level} (${pct}%)
                            </div>
                        `;
                    }
                } else if (line.includes('🏆 LEAGUE') || line.includes('🔥 MATCH')) {
                    if (line.includes('🔥 MATCH')) {
                        const matchName = line.replace('🔥 MATCH:', '').trim();
                        const matchId = matchName.replace(/[^a-zA-Z0-9]/g, '');

                        currentMatchHtml += `
                            <div class="match-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; cursor: pointer; padding: 0.5rem; border-radius: 8px; transition: background 0.2s;" onclick="this.parentElement.classList.toggle('collapsed')" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">
                                <div style="display: flex; align-items: center; gap: 0.8rem;">
                                    <i class="fa-solid fa-chevron-down toggle-icon" style="color: var(--text-muted); transition: transform 0.2s;"></i>
                                    <h4 class="search-target" style="color: var(--primary); margin: 0;">${line.trim()}</h4>
                                </div>
                                <div style="display: flex; gap: 0.8rem; align-items: center;">
                                    <i class="fa-solid fa-plus-circle bet-add-btn" data-match-id="${matchId}" data-match-name="${matchName}" data-date="${dateStr}" style="color: var(--warning); cursor: pointer; font-size: 1.2rem; transition: transform 0.2s;" title="Añadir a Boleto de Apuestas" onclick="event.stopPropagation()" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'"></i>
                                </div>
                            </div>`;
                    } else {
                        currentMatchHtml += `<h4 class="search-target match-header-liga" style="margin-bottom: 0.5rem; color: var(--text-muted); opacity: 0.8; font-size: 0.9rem;">${line.trim()}</h4>`;
                    }
                } else if (line.includes('TAP:')) {
                    currentMatchHtml += `<div class="stat-row">${line.replace(/ /g, "\u00a0")}</div>`;
                } else if (line.trim() !== '') {
                    currentMatchHtml += `<p style="margin-bottom: 0.2rem;">${line}</p>`;
                }
            }
        });

        // Close last block if exists
        if (inMatchBlock) {
            const tagsAttr = currentTags.length > 0 ? currentTags.join(' ') : 'none';
            html += `<div class="match-block" data-tags="${tagsAttr}">${currentMatchHtml}</div>`;
        }

        return `<div>${html}</div>`;
    }

    // Filtering Logic
    let currentFilter = 'all';

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            applyFilters();
        });
    });

    searchInput.addEventListener('input', applyFilters);

    function applyFilters() {
        const query = searchInput.value.toLowerCase();
        const blocks = document.querySelectorAll('.match-block');

        blocks.forEach(block => {
            const tags = block.dataset.tags || "";
            const textContent = Array.from(block.querySelectorAll('.search-target')).map(el => el.textContent.toLowerCase()).join(" ");

            let matchesFilter = currentFilter === 'all' || tags.includes(currentFilter);
            const matchesSearch = query === '' || textContent.includes(query);

            if (matchesFilter && matchesSearch) {
                block.style.display = 'block';
            } else {
                block.style.display = 'none';
            }
        });
    }

    // Generate Button Logic
    generateBtn.addEventListener("click", () => {
        const datePicker = document.getElementById("date-picker");
        const selectedDate = datePicker.value;
        if (!selectedDate) {
            alert("Por favor selecciona una fecha");
            return;
        }
        loadingOverlay.classList.remove("hidden");

        fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ dia: selectedDate })
        })
            .then(response => response.json())
            .then(data => {
                loadingOverlay.classList.add("hidden");
                if (data.success) {
                    showToast();
                    fetchReports(); // Reload list
                } else {
                    alert("Error generating: " + data.error);
                }
            })
            .catch(err => {
                loadingOverlay.classList.add("hidden");
                alert("Network error while generating report.");
            });
    });

    function showToast() {
        toast.classList.remove("hidden");
        setTimeout(() => {
            toast.classList.add("hidden");
        }, 3000);
    }

    // Dashboard Logic
    const dashboardBtn = document.getElementById('btn-open-dashboard');
    const dashboardModal = document.getElementById('dashboard-modal');
    const closeDashboardBtn = document.getElementById('close-dashboard');
    const dashboardContent = document.getElementById('dashboard-content');
    const dashboardStats = document.getElementById('dashboard-stats');

    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', () => {
            dashboardModal.classList.remove('hidden');
            dashboardContent.classList.remove('hidden');
            dashboardStats.classList.add('hidden');
            
            // Auto-scroll to view the stats that are updating at the bottom
            const intelligenceSection = document.getElementById('intelligence-section');
            if (intelligenceSection) {
                intelligenceSection.scrollIntoView({ behavior: 'smooth' });
            }

            fetch('/api/dashboard')
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.stats) {
                        const stats = data.stats;
                        document.getElementById('dashboard-won').textContent = stats.won;
                        document.getElementById('dashboard-total').textContent = stats.total;

                        const pctText = document.getElementById('hit-rate-text');
                        const radialCircle = document.getElementById('hit-rate-circle');
                        const pendingText = document.getElementById('dashboard-pending');

                        // Count up animation
                        let currentPct = 0;
                        const targetPct = stats.hit_rate;
                        const interval = setInterval(() => {
                            if (currentPct >= targetPct) {
                                clearInterval(interval);
                                currentPct = targetPct;
                            }
                            pctText.textContent = `${currentPct}%`;
                            radialCircle.style.background = `conic-gradient(var(--secondary) ${currentPct * 3.6}deg, rgba(255,255,255,0.05) 0deg)`;

                            // Change color based on performance
                            if (currentPct >= 70) {
                                pctText.style.color = 'var(--secondary)';
                                radialCircle.style.background = `conic-gradient(var(--secondary) ${currentPct * 3.6}deg, rgba(255,255,255,0.05) 0deg)`;
                            } else if (currentPct >= 50) {
                                pctText.style.color = '#eab308';
                                radialCircle.style.background = `conic-gradient(#eab308 ${currentPct * 3.6}deg, rgba(255,255,255,0.05) 0deg)`;
                            } else {
                                pctText.style.color = 'var(--accent)';
                                radialCircle.style.background = `conic-gradient(var(--accent) ${currentPct * 3.6}deg, rgba(255,255,255,0.05) 0deg)`;
                            }
                            currentPct++;
                        }, 20);

                        if (stats.pending > 0) {
                            pendingText.innerHTML = `<i class="fa-solid fa-clock"></i> Hay ${stats.pending} predicciones en espera o futuras.`;
                        } else {
                            pendingText.textContent = "Todas las predicciones están resueltas.";
                        }

                        setTimeout(() => {
                            dashboardContent.classList.add('hidden');
                            dashboardStats.classList.remove('hidden');
                        }, 500); // Small fake delay to make it feel like "calculating"
                    }
                })
                .catch(err => {
                    dashboardContent.innerHTML = `<p style="color:var(--accent)"><i class="fa-solid fa-triangle-exclamation"></i> Error loading data: ${err.message}</p>`;
                });
        });
    }

    if (closeDashboardBtn) {
        closeDashboardBtn.addEventListener('click', () => {
            dashboardModal.classList.add('hidden');
        });
    }

    // Verify Current Document Logic
    const btnVerifyReport = document.getElementById('btn-verify-report');
    if (btnVerifyReport) {
        btnVerifyReport.addEventListener('click', () => {
            const dateStr = btnVerifyReport.dataset.date;
            if (!dateStr) return;

            btnVerifyReport.disabled = true;
            btnVerifyReport.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Escaneando...';

            fetch('/api/generate_historic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fecha: dateStr })
            })
                .then(res => res.json())
                .then(data => {
                    btnVerifyReport.disabled = false;
                    btnVerifyReport.innerHTML = '<i class="fa-solid fa-check-double"></i> Validar Metadatos del Documento';

                    if (data.success) {
                        showToast(data.message);
                    } else {
                        alert('Error: ' + data.error);
                    }
                })
                .catch(err => {
                    btnVerifyReport.disabled = false;
                    btnVerifyReport.innerHTML = '<i class="fa-solid fa-check-double"></i> Validar Metadatos del Documento';
                    alert('Network error while scanning.');
                });
        });
    }

    // --- Bet Slip System ---
    let betSlip = [];

    const betSlipPanel = document.getElementById('bet-slip-panel');
    const btnOpenBetslip = document.getElementById('btn-open-betslip');
    const btnCloseBetslip = document.getElementById('close-betslip-btn');
    const btnToggleArrow = document.getElementById('toggle-betslip-arrow');
    const betSlipContent = document.getElementById('bet-slip-content');

    if (btnOpenBetslip) btnOpenBetslip.addEventListener('click', () => betSlipPanel.classList.remove('hidden'));
    if (btnCloseBetslip) btnCloseBetslip.addEventListener('click', () => betSlipPanel.classList.add('hidden'));
    if (btnToggleArrow) btnToggleArrow.addEventListener('click', () => betSlipPanel.classList.toggle('hidden'));

    function loadBets() {
        fetch('/api/bets')
            .then(res => res.json())
            .then(data => {
                if (data.error || !Array.isArray(data)) {
                    betSlip = [];
                } else {
                    betSlip = data.map(b => {
                        if (!b.betId) {
                            b.betId = b.id + '_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
                        }
                        return b;
                    });
                }
                renderBetSlip();
            }).catch(e => console.error("Error loading bets", e));
    }
    loadBets();

    function saveBets() {
        fetch('/api/bets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(betSlip)
        }).catch(e => console.error("Error saving bets", e));
    }

    function initBetButtons() {
        document.querySelectorAll('.bet-add-btn').forEach(btn => {
            btn.removeEventListener('click', handleAddBet);
            btn.addEventListener('click', handleAddBet);
        });
    }

    function handleAddBet(e) {
        const matchId = e.target.dataset.matchId;
        const matchName = e.target.dataset.matchName;
        const dateStr = e.target.dataset.date;

        // Find closest tags
        const block = e.target.closest('.match-block');
        const tags = block ? block.dataset.tags : '';

        const betId = matchId + '_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

        betSlip.push({
            id: matchId,
            betId: betId,
            name: matchName,
            date: dateStr,
            tags: tags,
            stake: 0,
            quote: 0,
            status: 'pending' // pending, win, lose
        });
        saveBets();
        renderBetSlip();
        showToast("Añadido al boleto");
        betSlipPanel.classList.remove('hidden');
    }

    function renderBetSlip() {
        // Group by date
        const grouped = betSlip.reduce((acc, bet) => {
            if (!acc[bet.date]) acc[bet.date] = [];
            acc[bet.date].push(bet);
            return acc;
        }, {});

        // Sort dates descending
        const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

        let html = '';
        let globalStake = 0;
        let globalExpected = 0;
        let globalWon = 0;

        let isFirstGroup = true;

        sortedDates.forEach(date => {
            const bets = grouped[date];
            let dailyStake = 0;
            let dailyWon = 0;

            let dateHtml = '';
            bets.forEach((bet, idx) => {
                const s = parseFloat(bet.stake) || 0;
                const q = parseFloat(bet.quote) || 0;
                let isWin = bet.status === 'win';
                let isLose = bet.status === 'lose';

                let profitStr = '0.00€';
                let profitClass = 'profit-neutral';

                dailyStake += s;
                globalStake += s;

                if (isWin) {
                    const prof = (s * q) - s;
                    profitStr = '+' + prof.toFixed(2) + '€';
                    profitClass = 'profit-positive';
                    dailyWon += (s * q);
                    globalWon += (s * q);
                } else if (isLose) {
                    profitStr = '-' + s.toFixed(2) + '€';
                    profitClass = 'profit-negative';
                }

                dateHtml += `
                    <div class="bet-card">
                        <i class="fa-solid fa-trash btn-remove-bet" data-id="${bet.betId}" style="position: absolute; top: 1rem; right: 1rem; color: var(--text-muted); cursor: pointer; font-size: 0.9rem;" title="Eliminar"></i>
                        <div class="bet-card-header" style="padding-right: 1.5rem;">
                            <div class="bet-card-title">${bet.name}</div>
                        </div>
                        <div style="margin-bottom: 0.8rem;">
                            ${bet.tags.split(' ').filter(t => t !== 'none' && t !== '').map(t => `<span class="bet-card-tag">${t}</span>`).join(' ')}
                        </div>
                        <div class="bet-inputs">
                            <div>
                                <label>Cuota</label>
                                <input type="number" step="0.01" class="bet-quote-input" data-id="${bet.betId}" value="${bet.quote || ''}" placeholder="Ej: 1.85">
                            </div>
                            <div>
                                <label>Stake (€)</label>
                                <input type="number" step="1" class="bet-stake-input" data-id="${bet.betId}" value="${bet.stake || ''}" placeholder="Ej: 10">
                            </div>
                        </div>
                        <div class="bet-actions">
                            <button class="btn-win ${isWin ? 'active' : ''}" data-id="${bet.betId}"><i class="fa-solid fa-check"></i> Acertada</button>
                            <button class="btn-lose ${isLose ? 'active' : ''}" data-id="${bet.betId}"><i class="fa-solid fa-xmark"></i> Fallada</button>
                        </div>
                        <div class="bet-profit ${profitClass}">${profitStr}</div>
                    </div>
                `;
            });

            const dailyNet = dailyWon - dailyStake;
            const netColor = dailyNet > 0 ? 'color: var(--success);' : (dailyNet < 0 ? 'color: var(--danger);' : 'color: var(--text-muted);');
            const sign = dailyNet > 0 ? '+' : '';

            html += `
                <div class="date-group">
                    <div class="date-group-header" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="this.nextElementSibling.classList.toggle('hidden');">
                        <div>
                            <span><i class="fa-regular fa-calendar" style="margin-right:4px;"></i> ${date}</span>
                        </div>
                        <div style="display: flex; gap: 1rem; align-items: center;">
                            <span style="${netColor}; font-weight: bold;">${sign}${dailyNet.toFixed(2)}€</span>
                            <i class="fa-solid fa-chevron-down" style="font-size: 0.8rem; color: var(--text-muted);"></i>
                        </div>
                    </div>
                    <div class="date-group-content ${isFirstGroup ? '' : 'hidden'}" style="margin-top: 1rem;">
                        ${dateHtml}
                    </div>
                </div>
            `;
            isFirstGroup = false;
        });

        if (sortedDates.length === 0) {
            html = `<p style="text-align:center; color: var(--text-muted); margin-top: 2rem;">No tienes boletos guardados.</p>`;
        }

        if (betSlip.length > 1) {
            let pendingCombo = false;
            let anyLose = false;
            let allWin = true;

            betSlip.forEach(b => {
                if (b.status === 'lose') { anyLose = true; allWin = false; }
                if (b.status === 'pending') { pendingCombo = true; allWin = false; }
            });

            let comboStatus = 'pend.';
            if (anyLose) {
                comboStatus = 'fallada';
            } else if (allWin) {
                comboStatus = 'acertada';
            }

            const cStake = parseFloat(localStorage.getItem('futbol_combo_stake')) || 0;
            const cQuote = parseFloat(localStorage.getItem('futbol_combo_quote')) || 0;

            let comboProfitStr = '0.00€';
            let comboClass = 'profit-neutral';

            if (comboStatus === 'acertada' && cStake > 0 && cQuote > 0) {
                const prof = (cStake * cQuote) - cStake;
                comboProfitStr = '+' + prof.toFixed(2) + '€';
                comboClass = 'profit-positive';
                globalWon += (cStake * cQuote);
            } else if (comboStatus === 'fallada' && cStake > 0) {
                comboProfitStr = '-' + cStake.toFixed(2) + '€';
                comboClass = 'profit-negative';
            }

            globalStake += cStake;

            html += `
                <div class="combo-bet-card" style="background: rgba(79, 70, 229, 0.1); border: 1px solid var(--primary); border-radius: 12px; padding: 1rem; margin-top: 1.5rem; margin-bottom: 2rem;">
                    <div style="font-size: 1rem; font-weight: bold; color: var(--primary); margin-bottom: 0.8rem; display: flex; align-items: center; justify-content: space-between;">
                        <span><i class="fa-solid fa-link"></i> Combo (${betSlip.length} sel.)</span>
                        <span style="font-size: 0.8rem; color: ${comboStatus === 'acertada' ? 'var(--success)' : (comboStatus === 'fallada' ? 'var(--danger)' : 'var(--warning)')}">${comboStatus.toUpperCase()}</span>
                    </div>
                    <div class="bet-inputs" style="margin-bottom: 0;">
                        <div>
                            <label>Cuota Total</label>
                            <input type="number" step="0.01" id="combo-quote-input" value="${cQuote || ''}" placeholder="Ej: 4.50">
                        </div>
                        <div>
                            <label>Stake Combo (€)</label>
                            <input type="number" step="1" id="combo-stake-input" value="${cStake || ''}" placeholder="Ej: 5">
                        </div>
                    </div>
                    <div style="text-align: right; margin-top: 0.8rem;">
                        <span class="bet-profit ${comboClass}" style="font-size: 1.1rem;">${comboProfitStr}</span>
                    </div>
                </div>
            `;
        }

        if (betSlipContent) betSlipContent.innerHTML = html;

        // Update Globals
        const globalNet = globalWon - globalStake;
        const eStake = document.getElementById('bet-global-stake');
        const eRet = document.getElementById('bet-global-return');
        const eProf = document.getElementById('bet-global-profit');

        if (eStake) eStake.textContent = globalStake.toFixed(2) + '€';
        if (eRet) eRet.textContent = globalWon.toFixed(2) + '€';
        if (eProf) {
            eProf.textContent = (globalNet > 0 ? '+' : '') + globalNet.toFixed(2) + '€';
            eProf.className = globalNet > 0 ? 'profit-positive' : (globalNet < 0 ? 'profit-negative' : 'profit-neutral');
        }

        attachBetListeners();
    }

    function attachBetListeners() {
        document.querySelectorAll('.bet-quote-input').forEach(inp => {
            inp.addEventListener('change', (e) => {
                const id = e.target.dataset.id;
                const bet = betSlip.find(b => b.betId === id);
                if (bet) bet.quote = parseFloat(e.target.value) || 0;
                saveBets();
                renderBetSlip();
            });
        });

        document.querySelectorAll('.bet-stake-input').forEach(inp => {
            inp.addEventListener('change', (e) => {
                const id = e.target.dataset.id;
                const bet = betSlip.find(b => b.betId === id);
                if (bet) bet.stake = parseFloat(e.target.value) || 0;
                saveBets();
                renderBetSlip();
            });
        });

        document.querySelectorAll('.btn-win').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('button').dataset.id;
                const bet = betSlip.find(b => b.betId === id);
                if (bet) {
                    bet.status = bet.status === 'win' ? 'pending' : 'win';
                    saveBets();
                    renderBetSlip();
                }
            });
        });

        document.querySelectorAll('.btn-lose').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('button').dataset.id;
                const bet = betSlip.find(b => b.betId === id);
                if (bet) {
                    bet.status = bet.status === 'lose' ? 'pending' : 'lose';
                    saveBets();
                    renderBetSlip();
                }
            });
        });

        document.querySelectorAll('.btn-remove-bet').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                betSlip = betSlip.filter(b => b.betId !== id);
                saveBets();
                renderBetSlip();
            });
        });

        const comboStakeInput = document.getElementById('combo-stake-input');
        if (comboStakeInput) {
            comboStakeInput.addEventListener('change', (e) => {
                let val = parseFloat(e.target.value);
                if (isNaN(val) || val < 0) val = 0;
                localStorage.setItem('futbol_combo_stake', val);
                renderBetSlip();
            });
        }

        const comboQuoteInput = document.getElementById('combo-quote-input');
        if (comboQuoteInput) {
            comboQuoteInput.addEventListener('change', (e) => {
                let val = parseFloat(e.target.value);
                if (isNaN(val) || val < 0) val = 0;
                localStorage.setItem('futbol_combo_quote', val);
                renderBetSlip();
            });
        }

    }

    // --- 🔮 Optimizer Logic ---
    const btnOptimize = document.getElementById('btn-optimize-combos');
    const optimizerPanel = document.getElementById('optimizer-panel');
    const closeOptimizerBtn = document.getElementById('close-optimizer-btn');
    const btnRunOptimizer = document.getElementById('btn-run-optimizer');
    const optimizerContent = document.getElementById('optimizer-content');

    if (btnOptimize && optimizerPanel) {
        btnOptimize.addEventListener('click', () => {
            optimizerPanel.classList.toggle('hidden');
        });

        if (closeOptimizerBtn) {
            closeOptimizerBtn.addEventListener('click', () => {
                optimizerPanel.classList.add('hidden');
            });
        }

        if (btnRunOptimizer) {
            btnRunOptimizer.addEventListener('click', () => {
                // Get all pending bets with valid quotes > 1
                const validBets = betSlip.filter(b => b.status === 'pending' && parseFloat(b.quote) > 1.0);

                if (validBets.length < 3) {
                    optimizerContent.innerHTML = '<p style="color: var(--danger); font-size: 0.9rem; text-align: center;">Necesitas al menos 3 apuestas pendientes con cuota asignada para crear los grupos.</p>';
                    return;
                }

                // Sort bets descending by quote to distribute them evenly
                const sortedBets = [...validBets].sort((a, b) => parseFloat(b.quote) - parseFloat(a.quote));

                // Initialize 3 groups
                const groups = [
                    { id: 1, bets: [], quote: 1.0 },
                    { id: 2, bets: [], quote: 1.0 },
                    { id: 3, bets: [], quote: 1.0 }
                ];

                // Simple greedy algorithm: put the next biggest bet into the group with the lowest current multiplicative quote
                sortedBets.forEach(bet => {
                    const group = groups.reduce((prev, curr) => (prev.quote < curr.quote ? prev : curr));
                    group.bets.push(bet);
                    group.quote *= parseFloat(bet.quote);
                });

                // Total Investment is fixed: 3.5 per combo = 10.5 Total
                const unitStake = 3.5;
                const totalInvestment = unitStake * 3;

                // Render result
                let html = '<div style="display: flex; flex-direction: column; gap: 0.8rem; margin-top: 1rem;">';

                let anyPairLoss = false;

                groups.forEach((g, i) => {
                    const profitIfWins = unitStake * g.quote;

                    // Simple check on pairs: If any 2 groups win, do we profit globally?
                    // Pair 1+2, Pair 1+3, Pair 2+3

                    html += `
                        <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.8rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; align-items: center;">
                                <strong style="color: var(--primary);">Combo ${g.id}</strong>
                                <span style="color: var(--warning); font-weight: bold;">Cuota: ${g.quote.toFixed(2)}</span>
                            </div>
                            <ul style="list-style: none; padding: 0; margin: 0 0 0.5rem 0; font-size: 0.85rem; color: var(--text-muted);">
                                ${g.bets.map(b => `<li>• ${b.name} (${b.quote})</li>`).join('')}
                            </ul>
                            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 0.5rem;">
                                <span style="font-size: 0.8rem;">Apostar:</span>
                                <strong>${unitStake.toFixed(2)} €</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.2rem;">
                                <span style="font-size: 0.8rem;">Retorno si gana:</span>
                                <strong style="color: var(--success);">${profitIfWins.toFixed(2)} €</strong>
                            </div>
                        </div>
                    `;
                });

                // Profitability Check
                const r1 = unitStake * groups[0].quote;
                const r2 = unitStake * groups[1].quote;
                const r3 = unitStake * groups[2].quote;

                const pair12 = r1 + r2 - totalInvestment;
                const pair13 = r1 + r3 - totalInvestment;
                const pair23 = r2 + r3 - totalInvestment;

                const minProfit = Math.min(pair12, pair13, pair23);

                let checkHtml = '';
                if (minProfit > 0) {
                    checkHtml = `
                    <div style="margin-top: 1rem; padding: 0.8rem; border-radius: 8px; background: rgba(16, 185, 129, 0.1); border: 1px solid var(--success); text-align: center;">
                        <i class="fa-solid fa-circle-check" style="color: var(--success); font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
                        <h4 style="color: var(--success); margin: 0 0 0.2rem 0;">¡Cobertura Exitosa!</h4>
                        <p style="font-size: 0.85rem; color: var(--text); margin: 0;">Acertando cualquiera de las 3 COMBINACIONES DOBLES, aseguras un beneficio mínimo limpio de <b>+${minProfit.toFixed(2)}€</b> (Inversión total: ${totalInvestment.toFixed(2)}€).</p>
                    </div>`;
                } else {
                    checkHtml = `
                    <div style="margin-top: 1rem; padding: 0.8rem; border-radius: 8px; background: rgba(239, 68, 68, 0.1); border: 1px solid var(--danger); text-align: center;">
                        <i class="fa-solid fa-triangle-exclamation" style="color: var(--danger); font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
                        <h4 style="color: var(--danger); margin: 0 0 0.2rem 0;">Riesgo de Cobertura</h4>
                        <p style="font-size: 0.85rem; color: var(--text); margin: 0;">At least one double combination yields a loss (-${Math.abs(minProfit).toFixed(2)}€). Introduce matches with higher odds to assure cross-profitability.</p>
                    </div>`;
                }

                html += checkHtml + '</div>';
                optimizerContent.innerHTML = html;
            });
        }
    }

    // Toggle All Button Logic
    const btnToggleAll = document.getElementById('btn-toggle-all');
    if (btnToggleAll) {
        btnToggleAll.addEventListener('click', () => {
            const blocks = document.querySelectorAll('.match-block');
            const isExpanded = btnToggleAll.dataset.state !== 'collapsed';
            
            blocks.forEach(block => {
                if (isExpanded) {
                    block.classList.add('collapsed');
                } else {
                    block.classList.remove('collapsed');
                }
            });
            
            if (isExpanded) {
                btnToggleAll.dataset.state = 'collapsed';
                btnToggleAll.innerHTML = '<i class="fa-solid fa-expand"></i> Expandir Todo';
            } else {
                btnToggleAll.dataset.state = 'expanded';
                btnToggleAll.innerHTML = '<i class="fa-solid fa-compress"></i> Contraer Todo';
            }
        });
    }

});
