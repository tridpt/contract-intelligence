/**
 * ⚖️ ContractShield & Redline Studio v3.0 Flagship — Frontend Controller
 */

const state = {
  presets: [],
  activePreset: null,
  currentContractText: '',
  currentAuditReport: null,
  currentPartnerIOCs: null,
  isRawEditorMode: false,
  selectedNegTone: 'COLLABORATIVE',
  activeSeal: null,
  redlineDiffResult: null,
  redlineDecisions: {},
  piiVaultMap: {},
  playbookRules: [],
  webcamStream: null
};

function showToast(msg) {
  const el = document.getElementById('toastBox');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    el.classList.add('hidden');
  }, 4000);
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatMoney(amount, currency = 'VNĐ') {
  const n = Math.round(Number(amount || 0));
  if (currency === 'USD') {
    return `$${n.toLocaleString('en-US')} USD`;
  }
  return `${n.toLocaleString('vi-VN')} VNĐ`;
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-panel').forEach((p) => {
    p.classList.toggle('active', p.id === tabId);
  });
}

// ============================================================================
// 1. KHỞI TẠO & NẠP DỮ LIỆU BAN ĐẦU
// ============================================================================

async function initApp() {
  bindTabs();
  bindEvents();
  drawSampleContractOnCanvas();

  try {
    const [presetRes, pbRes] = await Promise.all([fetch('/api/presets'), fetch('/api/playbook')]);
    const presetData = await presetRes.json();
    const pbData = await pbRes.json();

    if (pbData.ok) {
      state.playbookRules = pbData.rules || [];
      renderPlaybookList();
    }

    if (presetData.ok && Array.isArray(presetData.presets)) {
      state.presets = presetData.presets;
      renderPresetChips();
      if (state.presets.length > 0) {
        await selectPreset(state.presets[0].id);
      }
    }
  } catch (err) {
    showToast('⚠️ Không thể kết nối máy chủ: ' + err.message);
  }

  generateSafeContractPreview();
}

function bindTabs() {
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

function renderPresetChips() {
  const container = document.getElementById('presetList');
  if (!container) return;
  container.innerHTML = state.presets
    .map(
      (p) => `
      <button class="preset-chip ${state.activePreset?.id === p.id ? 'active' : ''}" data-id="${p.id}">
        <strong>${escapeHtml(p.title)}</strong>
        <span style="opacity:0.75; margin-left:4px;">(${escapeHtml(p.badge)})</span>
      </button>
    `
    )
    .join('');

  container.querySelectorAll('.preset-chip').forEach((chip) => {
    chip.addEventListener('click', () => selectPreset(chip.dataset.id));
  });
}

async function refreshAllDerivedViews(text, title) {
  await Promise.all([
    runContractAudit(text, title),
    runFinancialSimulation(text),
    runObligationExtractor(text),
    generateNegotiationDraft(),
    runPiiRedaction(text)
  ]);
}

async function selectPreset(presetId) {
  const preset = state.presets.find((p) => p.id === presetId);
  if (!preset) return;
  state.activePreset = preset;
  state.currentContractText = preset.originalText;

  document.getElementById('contractRawEditor').value = state.currentContractText;
  document.getElementById('negContractTitle').value = preset.title;
  document.getElementById('sealTitleInput').value = preset.title;
  document.getElementById('sealCandidateTextarea').value = preset.originalText;

  const v1 = document.getElementById('redlineTextV1');
  const v2 = document.getElementById('redlineTextV2');
  if (v1) v1.value = preset.originalText;
  if (v2) v2.value = preset.revisedPartnerText || preset.originalText;

  renderPresetChips();
  await refreshAllDerivedViews(state.currentContractText, preset.title);
  await runRedlineComparison();
}

// ============================================================================
// 2. KIỂM TOÁN RỦI RO & BẮT ĐIỀU KHOẢN BẪY SONG NGỮ VIỆT / ANH (TAB 1)
// ============================================================================

async function runContractAudit(text, title = 'Hợp đồng Kiểm toán') {
  try {
    const res = await fetch('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, title, protectParty: 'PARTY_B' })
    });
    const data = await res.json();
    if (!data.ok) return;
    state.currentAuditReport = data.report;
    state.currentPartnerIOCs = data.partnerIOCs;
    renderAuditDashboard(data.report, data.partnerIOCs);
  } catch (err) {
    showToast('⚠️ Lỗi kiểm toán: ' + err.message);
  }
}

function renderAuditDashboard(report, partnerIOCs) {
  const langEl = document.getElementById('detectedLangBadge');
  if (langEl) {
    langEl.textContent = report.detectedLanguage === 'EN' ? '🌐 EN (International)' : '🇻🇳 VI (Việt Nam)';
  }

  const scoreEl = document.getElementById('safetyScoreVal');
  if (scoreEl) {
    scoreEl.textContent = `${report.safetyScore}/100`;
    scoreEl.style.color =
      report.safetyScore >= 80 ? '#10b981' : report.safetyScore >= 55 ? '#f59e0b' : '#ef4444';
  }
  document.getElementById('safetyGradeBadge').textContent = `Hạng ${report.grade}`;
  document.getElementById('safetyVerdictText').textContent = report.verdict;

  document.getElementById('countCritical').textContent = report.counts.critical;
  document.getElementById('countHigh').textContent = report.counts.high;
  document.getElementById('countMedium').textContent =
    report.counts.medium + report.counts.missingClauses;

  const pA = report.powerBalance.partyAPercent;
  const pB = report.powerBalance.partyBPercent;
  document.getElementById('partyAPercentLabel').textContent = `Bên A: ${pA}%`;
  document.getElementById('partyBPercentLabel').textContent = `Bên B (Bạn): ${pB}%`;
  document.getElementById('balanceBarA').style.width = `${pA}%`;

  const metricsBox = document.getElementById('extractedMetricsBox');
  const tags = [
    ...(report.extractedMetrics.amounts || []).slice(0, 3).map((x) => `💰 ${x}`),
    ...(report.extractedMetrics.percentages || []).slice(0, 2).map((x) => `📊 ${x}`),
    ...(partnerIOCs?.taxIds || []).map((x) => `🏢 MST: ${x}`),
    ...(partnerIOCs?.domains || []).slice(0, 2).map((x) => `🌐 ${x}`)
  ];
  metricsBox.innerHTML =
    tags.length > 0
      ? tags.map((t) => `<span class="metric-tag">${escapeHtml(t)}</span>`).join('')
      : '<span class="metric-tag">Chưa phát hiện số liệu định lượng</span>';

  renderHighlightedContract(state.currentContractText, report.findings);
  renderFindingsList(report.findings, report.missingClauses);
}

function renderHighlightedContract(rawText, findings) {
  const viewEl = document.getElementById('contractHighlightedView');
  if (!viewEl) return;

  let html = escapeHtml(rawText);
  const highlightedClauses = new Set();

  for (const f of findings) {
    const targetClause = escapeHtml(f.flaggedClauseText);
    if (targetClause && !highlightedClauses.has(targetClause) && html.includes(targetClause)) {
      highlightedClauses.add(targetClause);
      html = html.replace(
        targetClause,
        `<span class="clause-highlight ${f.severity}" data-finding-id="${f.id}" title="${escapeHtml(f.title)}">${targetClause}</span>`
      );
    }
  }

  viewEl.innerHTML = html;

  viewEl.querySelectorAll('.clause-highlight').forEach((span) => {
    span.addEventListener('click', () => {
      const id = span.dataset.findingId;
      const card = document.getElementById(`finding-card-${id}`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.style.outline = '2px solid #fbbf24';
        setTimeout(() => {
          card.style.outline = 'none';
        }, 1800);
      }
    });
  });
}

function renderFindingsList(findings, missingClauses) {
  const listEl = document.getElementById('findingsList');
  const missingEl = document.getElementById('missingClausesBox');

  if (!findings || findings.length === 0) {
    listEl.innerHTML = `
      <div class="finding-safe-box" style="padding:18px; text-align:center;">
        <strong style="font-size:15px;">✅ KHÔNG PHÁT HIỆN ĐIỀU KHOẢN BẪY NGUY HIỂM!</strong>
        <p style="margin-top:6px;">Hợp đồng hiện tại đã tuân thủ trần pháp lý và cân bằng quyền lợi hai bên.</p>
      </div>
    `;
  } else {
    listEl.innerHTML = findings
      .map(
        (f, idx) => `
        <div class="finding-card ${f.severity}" id="finding-card-${f.id}">
          <div class="finding-top">
            <span class="sev-tag ${f.severity}">#${idx + 1} • ${f.severity} (-${f.scorePenalty}đ)</span>
            <span class="legal-basis-tag">⚖️ ${escapeHtml(f.legalBasis)}</span>
          </div>
          <div class="finding-title">${escapeHtml(f.title)}</div>
          <div class="finding-quote">"${escapeHtml(f.flaggedClauseText)}"</div>
          <div class="finding-explain"><strong>🔍 Phân tích:</strong> ${escapeHtml(f.explanation)}</div>
          <div class="finding-safe-box">
            <strong>🛡️ Đề xuất câu chữ bảo vệ:</strong>
            <p>${escapeHtml(f.safeReplacement)}</p>
            <button class="btn btn-emerald btn-sm btn-apply-single-fix" data-index="${idx}">
              ✨ Thay Thế Điều Khoản Này
            </button>
          </div>
        </div>
      `
      )
      .join('');

    listEl.querySelectorAll('.btn-apply-single-fix').forEach((btn) => {
      btn.addEventListener('click', () => applySingleClauseFix(findings[Number(btn.dataset.index)]));
    });
  }

  if (missingClauses && missingClauses.length > 0) {
    missingEl.innerHTML = missingClauses
      .map(
        (m, idx) => `
        <div class="finding-card MEDIUM">
          <div class="finding-top">
            <span class="sev-tag MEDIUM">THIẾU ĐIỀU KHOẢN BẢO VỆ</span>
            <span class="legal-basis-tag">⚖️ ${escapeHtml(m.legalBasis)}</span>
          </div>
          <div class="finding-title">${escapeHtml(m.title)}</div>
          <div class="finding-safe-box">
            <p>${escapeHtml(m.suggestedClause)}</p>
            <button class="btn btn-outline btn-sm btn-append-missing" data-index="${idx}">➕ Chèn Bổ Sung</button>
          </div>
        </div>
      `
      )
      .join('');

    missingEl.querySelectorAll('.btn-append-missing').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const item = missingClauses[Number(btn.dataset.index)];
        if (!item) return;
        state.currentContractText = `${state.currentContractText.trim()}\n\n${item.suggestedClause}`;
        document.getElementById('contractRawEditor').value = state.currentContractText;
        await refreshAllDerivedViews(state.currentContractText);
        showToast('✅ Đã chèn bổ sung điều khoản bảo vệ!');
      });
    });
  } else {
    missingEl.innerHTML = '';
  }
}

async function applySingleClauseFix(finding) {
  if (!finding) return;
  const oldClause = finding.flaggedClauseText;
  const prefixMatch = oldClause.match(/^(\d+(?:\.\d+)*\.?\s+)/);
  const prefix = prefixMatch ? prefixMatch[1] : '';
  const newClause = `${prefix}${finding.safeReplacement}`;

  if (state.currentContractText.includes(oldClause)) {
    state.currentContractText = state.currentContractText.replace(oldClause, newClause);
    document.getElementById('contractRawEditor').value = state.currentContractText;
    await refreshAllDerivedViews(state.currentContractText);
    showToast(`✅ Đã sửa điều khoản — Điểm An Toàn tăng lên ${state.currentAuditReport?.safetyScore}/100!`);
  }
}

async function applyAllClauseFixes() {
  const report = state.currentAuditReport;
  if (!report || (!report.findings?.length && !report.missingClauses?.length)) {
    showToast('✅ Hợp đồng đã đạt mức an toàn tối đa!');
    return;
  }

  let updatedText = state.currentContractText;
  let fixedCount = 0;

  for (const f of report.findings || []) {
    const oldClause = f.flaggedClauseText;
    const prefixMatch = oldClause.match(/^(\d+(?:\.\d+)*\.?\s+)/);
    const prefix = prefixMatch ? prefixMatch[1] : '';
    if (updatedText.includes(oldClause)) {
      updatedText = updatedText.replace(oldClause, `${prefix}${f.safeReplacement}`);
      fixedCount++;
    }
  }

  for (const m of report.missingClauses || []) {
    updatedText = `${updatedText.trim()}\n\n${m.suggestedClause}`;
    fixedCount++;
  }

  state.currentContractText = updatedText;
  document.getElementById('contractRawEditor').value = state.currentContractText;
  await refreshAllDerivedViews(state.currentContractText);
  showToast(`🎉 Đã sửa ${fixedCount} điều khoản! Điểm An Toàn đạt ${state.currentAuditReport?.safetyScore}/100.`);
}

// ============================================================================
// 3. 🧮 MÁY MÔ PHỎNG THIỆT HẠI TÀI CHÍNH & LỊCH NGHĨA VỤ .ICS (TAB 2)
// ============================================================================

async function runFinancialSimulation(sourceText) {
  const delayDays = Number(document.getElementById('simDelayDaysRange')?.value || 20);
  const loanMonths = Number(document.getElementById('simLoanMonthsRange')?.value || 12);
  const triggerEarlyExit = Boolean(document.getElementById('simEarlyExitCheck')?.checked);

  document.getElementById('simDelayDaysVal').textContent = `${delayDays} ngày`;
  document.getElementById('simLoanMonthsVal').textContent = `${loanMonths} tháng`;

  try {
    const res = await fetch('/api/simulate-financials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: sourceText || state.currentContractText,
        delayDays,
        loanMonths,
        triggerEarlyExit
      })
    });
    const data = await res.json();
    if (!data.ok) return;
    renderSimulationResult(data.simulation);
  } catch (err) {
    showToast('⚠️ Lỗi mô phỏng tài chính: ' + err.message);
  }
}

function renderSimulationResult(sim) {
  const cur = sim.params.currency;
  const maxRef = Math.max(1, sim.trapScenario.totalExposure, sim.legalCapScenario.totalLegalMax);
  const trapPct = Math.min(100, Math.round((sim.trapScenario.totalExposure / maxRef) * 100));
  const legalPct = Math.min(100, Math.max(4, Math.round((sim.legalCapScenario.totalLegalMax / maxRef) * 100)));

  const box = document.getElementById('simResultBox');
  box.innerHTML = `
    <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px; font-size:12.5px; color:#cbd5e1;">
      <span>📌 Giá trị gốc bóc tách: <strong style="color:#fff;">${formatMoney(sim.params.baseAmount, cur)}</strong></span>
      <span>⚠️ Mức thiệt hại so với giá trị HĐ: <strong style="color:#fca5a5;">${sim.lossVsContractPct}%</strong></span>
    </div>

    <div class="sim-bars-wrap">
      <div>
        <div style="display:flex; justify-content:space-between; font-size:13px;">
          <span style="color:#fca5a5; font-weight:700;">🚨 Kịch bản Ký Bản Bẫy Hiện Tại:</span>
          <strong style="color:#ef4444; font-size:16px;">Mất ${formatMoney(sim.trapScenario.totalExposure, cur)}</strong>
        </div>
        <div class="sim-bar-track"><div class="sim-bar-fill-trap" style="width:${trapPct}%"></div></div>
        <small style="color:#94a3b8;">
          (Phạt trễ hạn: ${formatMoney(sim.trapScenario.delayLoss, cur)} • Lãi vay: ${formatMoney(sim.trapScenario.interestLoss, cur)} • Phạt hủy/Mất cọc/Giữ tiền: ${formatMoney(sim.trapScenario.exitOrDepositLoss, cur)})
        </small>
      </div>

      <div>
        <div style="display:flex; justify-content:space-between; font-size:13px;">
          <span style="color:#6ee7b7; font-weight:700;">🛡️ Trần Tối Đa Sau Khi Sửa Chuẩn Pháp Luật:</span>
          <strong style="color:#10b981; font-size:16px;">Tối đa ${formatMoney(sim.legalCapScenario.totalLegalMax, cur)}</strong>
        </div>
        <div class="sim-bar-track"><div class="sim-bar-fill-legal" style="width:${legalPct}%"></div></div>
        <small style="color:#94a3b8;">⚖️ ${escapeHtml(sim.legalCapScenario.appliedLawSummary)}</small>
      </div>
    </div>

    <div class="savings-banner">
      <div style="font-size:15px; font-weight:800;">
        💰 SỐ TIỀN BẠN TỰ CỨU ĐƯỢC NHỜ SỬA HỢP ĐỒNG: +${formatMoney(sim.moneySaved, cur)}
      </div>
      <div style="font-size:12px; margin-top:4px; color:#d1fae5;">
        Đàm phán đưa các điều khoản về trần pháp định giúp bạn tránh nguy cơ mất trắng tài sản khi xảy ra sự cố khách quan!
      </div>
    </div>
  `;
}

async function runObligationExtractor(sourceText) {
  try {
    const res = await fetch('/api/obligations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: sourceText || state.currentContractText })
    });
    const data = await res.json();
    if (!data.ok) return;

    const tl = data.timeline;
    document.getElementById('obligationMetaBanner').innerHTML = `
      <span class="metric-tag">📅 Hiệu lực: <strong>${tl.startDate}</strong></span>
      <span class="metric-tag">🏁 Đáo hạn: <strong>${tl.endDate} (${tl.durationMonths} tháng)</strong></span>
      <span class="metric-tag" style="color:#fde68a;">⏰ Báo trước tối thiểu: <strong>${tl.noticeDays} ngày</strong></span>
    `;

    document.getElementById('obligationTimelineList').innerHTML = tl.milestones
      .map(
        (m) => `
        <div class="timeline-card ${m.urgency}">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <strong style="font-size:13.5px; color:#fff;">${escapeHtml(m.title)}</strong>
            <span class="sev-tag ${m.urgency === 'CRITICAL' ? 'CRITICAL' : m.urgency === 'HIGH' ? 'HIGH' : 'MEDIUM'}">${m.date}</span>
          </div>
          <p style="font-size:12.5px; color:#cbd5e1;">${escapeHtml(m.description)}</p>
        </div>
      `
      )
      .join('');
  } catch (err) {
    showToast('⚠️ Lỗi trích xuất lịch nghĩa vụ: ' + err.message);
  }
}

async function downloadIcsCalendar() {
  try {
    const title = state.activePreset?.title || 'Hợp Đồng ContractShield';
    const res = await fetch('/api/export-ics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: state.currentContractText, title })
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Lich_Nhac_Hen_Hop_Dong_ContractShield.ics';
    a.click();
    URL.revokeObjectURL(url);
    showToast('🔔 Đã tải tệp lịch .ICS (kèm chuông báo trước 7 ngày cho Google/Outlook Calendar)!');
  } catch (err) {
    showToast('⚠️ Lỗi xuất lịch .ICS: ' + err.message);
  }
}

// ============================================================================
// 4. 🧠 HỎI ĐÁP LUẬT SƯ AI & CUSTOM PLAYBOOK STUDIO (TAB 3)
// ============================================================================

async function askContractCounsel(questionStr) {
  const input = document.getElementById('qaQuestionInput');
  const question = String(questionStr || input.value || '').trim();
  if (!question) return;
  input.value = '';

  const chatBox = document.getElementById('qaChatHistory');
  chatBox.insertAdjacentHTML('beforeend', `<div class="qa-msg user">🙋‍♂️ ${escapeHtml(question)}</div>`);
  chatBox.scrollTop = chatBox.scrollHeight;

  const geminiApiKey = document.getElementById('qaGeminiKeyInput')?.value || '';

  try {
    const res = await fetch('/api/qa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: state.currentContractText,
        question,
        geminiApiKey
      })
    });
    const data = await res.json();
    if (!data.ok) {
      chatBox.insertAdjacentHTML('beforeend', `<div class="qa-msg ai">⚠️ ${escapeHtml(data.error)}</div>`);
      return;
    }

    const badge = data.engine === 'GEMINI_2.5_FLASH_LIVE' ? '✨ Gemini 2.5 Flash Live' : '⚡ Local Legal Counsel';
    chatBox.insertAdjacentHTML(
      'beforeend',
      `<div class="qa-msg ai"><div style="font-size:11px; color:#fbbf24; margin-bottom:4px;">[${badge}]</div>${escapeHtml(data.answer)}</div>`
    );
    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (err) {
    showToast('⚠️ Lỗi hỏi đáp: ' + err.message);
  }
}

function renderPlaybookList() {
  const listEl = document.getElementById('playbookRulesList');
  if (!listEl) return;

  listEl.innerHTML = state.playbookRules
    .map(
      (r) => `
      <div class="finding-card ${r.severity}" style="padding:11px 13px; opacity:${r.enabled ? '1' : '0.68'};">
        <div class="finding-top">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:700; font-size:13px;">
            <input type="checkbox" class="chk-toggle-pb" data-id="${r.id}" ${r.enabled ? 'checked' : ''} />
            ${escapeHtml(r.title)}
          </label>
          <button class="btn btn-outline btn-sm btn-del-pb" data-id="${r.id}" title="Xóa quy tắc này">✕</button>
        </div>
        <div style="font-size:12px; color:#93c5fd; margin-bottom:4px;">Regex bắt lỗi: <code>${escapeHtml(r.patternStr)}</code></div>
        <div style="font-size:12px; color:#d1fae5;">Đề xuất sửa: ${escapeHtml(r.safeReplacement)}</div>
      </div>
    `
    )
    .join('');

  listEl.querySelectorAll('.chk-toggle-pb').forEach((chk) => {
    chk.addEventListener('change', async () => {
      const res = await fetch('/api/playbook/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleId: chk.dataset.id, enabled: chk.checked })
      });
      const data = await res.json();
      if (data.ok) {
        state.playbookRules = data.rules;
        renderPlaybookList();
        await runContractAudit(state.currentContractText);
        showToast(chk.checked ? '✅ Đã bật quy tắc Playbook & cập nhật kiểm toán!' : '⏸️ Đã tạm tắt quy tắc Playbook.');
      }
    });
  });

  listEl.querySelectorAll('.btn-del-pb').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const res = await fetch('/api/playbook', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleId: btn.dataset.id })
      });
      const data = await res.json();
      if (data.ok) {
        state.playbookRules = data.rules;
        renderPlaybookList();
        await runContractAudit(state.currentContractText);
        showToast('🗑️ Đã xóa quy tắc khỏi Playbook.');
      }
    });
  });
}

// ============================================================================
// 5. 📸 QUÉT ẢNH CHỤP HỢP ĐỒNG GIẤY TẠI BÀN KÝ (OFFLINE OCR vie+eng - TAB 4)
// ============================================================================

function drawSampleContractOnCanvas() {
  const canvas = document.getElementById('ocrSampleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Warm paper background
  ctx.fillStyle = '#fdfbf7';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle paper border
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px Arial';
  ctx.fillText('HỢP ĐỒNG THUÊ MẶT BẰNG & ĐẶT CỌC GIẤY', 165, 62);

  ctx.font = '16px Arial';
  const sampleLines = [
    'Ngày ký: 18/11/2026 - Bên A: Ông Trần Văn Chủ - SĐT: 0909888777',
    'Điều 1: Giá thuê 30.000.000 VNĐ/tháng. Tiền đặt cọc 120.000.000 VNĐ.',
    'Điều 2: Bên A có quyền tăng giá thuê bất kỳ lúc nào mà không giới hạn mức trần.',
    'Điều 3: Nếu Bên B thanh toán chậm quá 02 ngày thì tịch thu 100% tiền đặt cọc.',
    'Điều 4: Lãi suất phạt chậm trả là 4%/tháng và từ bỏ quyền khởi kiện tại Tòa án.',
    'Điều 5: Hợp đồng tự động gia hạn thêm 24 tháng nếu không báo trước 90 ngày.'
  ];

  sampleLines.forEach((line, i) => {
    ctx.fillText(line, 42, 118 + i * 48);
  });

  // Simulated red company seal stamp in bottom right
  ctx.save();
  ctx.translate(680, 385);
  ctx.rotate(-0.18);
  ctx.strokeStyle = 'rgba(220, 38, 38, 0.75)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 48, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(220, 38, 38, 0.75)';
  ctx.font = 'bold 12px Arial';
  ctx.fillText('ĐÃ ĐÓNG DẤU', -40, 4);
  ctx.restore();
}

async function runOcrOnBase64Image(base64Data, fileName = 'paper-contract.png') {
  const statusEl = document.getElementById('ocrStatusMeta');
  statusEl.textContent = '⏳ Đang chạy mạng nơ-ron OCR nhận diện chữ Tiếng Việt + Tiếng Anh...';
  showToast('📸 Đang bóc tách chữ từ ảnh hợp đồng giấy...');

  try {
    const res = await fetch('/api/ocr-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Data, fileName, lang: 'vie+eng' })
    });
    const data = await res.json();
    if (!data.ok) {
      statusEl.textContent = '⚠️ Lỗi OCR: ' + data.error;
      showToast('⚠️ ' + data.error);
      return;
    }

    document.getElementById('ocrResultTextarea').value = data.text;
    statusEl.textContent = `✅ Hoàn tất bởi ${data.engine} • Độ tin cậy: ${data.confidence}% (${data.charCount} ký tự)`;
    showToast(`✅ Đã nhận diện ${data.charCount} ký tự (Độ tin cậy ${data.confidence}%)!`);
  } catch (err) {
    statusEl.textContent = '⚠️ Lỗi OCR: ' + err.message;
  }
}

// ============================================================================
// 6. CÁC TRẠM CÒN LẠI (EMAIL ĐÀM PHÁN, SHA-256 SEAL, REDLINE, PII, BUILDER)
// ============================================================================

async function generateNegotiationDraft() {
  try {
    const res = await fetch('/api/negotiation-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: state.currentContractText,
        tone: state.selectedNegTone,
        language: document.getElementById('negLangSelect')?.value || 'AUTO',
        contractTitle: document.getElementById('negContractTitle')?.value || '',
        recipientName: document.getElementById('negRecipientName')?.value || '',
        senderName: document.getElementById('negSenderName')?.value || ''
      })
    });
    const data = await res.json();
    if (!data.ok) return;
    document.getElementById('negEmailSubject').value = data.emailDraft.subject;
    document.getElementById('negEmailBody').value = data.emailDraft.body;
    document.getElementById('negMetaStatus').textContent =
      `Ngôn ngữ: ${data.emailDraft.language} • Giọng văn: ${data.emailDraft.tone} • ${data.emailDraft.pointsCount} kiến nghị sửa đổi`;
  } catch {}
}

async function createSha256Seal() {
  const res = await fetch('/api/seal/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: document.getElementById('sealTitleInput')?.value || 'Bản Chốt Ký',
      signerNote: document.getElementById('sealNoteInput')?.value || '',
      contractText: state.currentContractText
    })
  });
  const data = await res.json();
  if (!data.ok) return;
  state.activeSeal = data.seal;
  document.getElementById('sealCandidateTextarea').value = state.currentContractText;

  document.getElementById('activeSealCertificateCard').innerHTML = `
    <div class="seal-code-banner">
      <div>
        <small style="color:#cbd5e1; display:block;">MÃ CHỨNG THƯ NIÊM PHONG SHA-256</small>
        <code>${escapeHtml(data.seal.sealCode)}</code>
      </div>
      <span class="grade-pill">${data.seal.clauseLineCount} dòng</span>
    </div>
    <div style="font-size:11.5px; color:#94a3b8;">Canonical SHA-256:</div>
    <div class="hash-line">${escapeHtml(data.seal.normalizedSha256)}</div>
  `;
  showToast(`🔏 Đã tạo Chứng thư Niêm phong ${data.seal.sealCode}!`);
}

async function verifyCandidateAgainstSeal() {
  if (!state.activeSeal) await createSha256Seal();
  const candidateText = document.getElementById('sealCandidateTextarea').value;
  const res = await fetch('/api/seal/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sealCodeOrId: state.activeSeal?.sealCode,
      candidateText,
      referenceSnapshot: state.activeSeal?.sealedTextSnapshot || state.currentContractText
    })
  });
  const data = await res.json();
  if (!data.ok) return;

  const v = data.verification;
  const isSafe = v.status === 'EXACT_MATCH' || v.status === 'CANONICAL_MATCH';
  const tamperedHtml = !isSafe
    ? (v.tamperedLines || [])
        .map((line) => {
          const diffTokens = line.tokens
            .map((tk) =>
              tk.type === 'added'
                ? `<span class="diff-added">${escapeHtml(tk.value)}</span>`
                : tk.type === 'removed'
                ? `<span class="diff-removed">${escapeHtml(tk.value)}</span>`
                : escapeHtml(tk.value)
            )
            .join('');
          return `<div class="diff-para-row modified" style="margin-top:8px;"><div class="diff-tokens-text"><small style="color:#fbbf24;">[Đoạn #${line.paragraphIndex}]</small> ${diffTokens}</div></div>`;
        })
        .join('')
    : '';

  document.getElementById('sealVerifyResultBox').innerHTML = `
    <div class="verify-banner ${isSafe ? 'safe' : 'tampered'}">
      <div style="font-size:14px; font-weight:800;">${escapeHtml(v.statusTitle)}</div>
    </div>
    ${tamperedHtml}
  `;
}

async function runRedlineComparison() {
  const originalText = document.getElementById('redlineTextV1').value;
  const revisedText = document.getElementById('redlineTextV2').value;
  const res = await fetch('/api/redline-diff', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ originalText, revisedText })
  });
  const data = await res.json();
  if (!data.ok) return;
  state.redlineDiffResult = data.diffResult;
  state.redlineDecisions = {};
  renderRedlineResult(data.diffResult);
}

function renderRedlineResult(diffResult) {
  const sum = diffResult.summary;
  const deltaSign = sum.scoreDelta >= 0 ? `+${sum.scoreDelta}` : `${sum.scoreDelta}`;
  document.getElementById('redlineSummaryRow').innerHTML = `
    <span class="metric-tag">📑 Đoạn sửa: <strong>${sum.changedParagraphs}/${sum.totalParagraphs}</strong></span>
    <span class="metric-tag" style="color:#6ee7b7;">➕ Thêm: <strong>+${sum.addedWords} từ</strong></span>
    <span class="metric-tag" style="color:#fca5a5;">➖ Xóa: <strong>-${sum.removedWords} từ</strong></span>
    <span class="metric-tag" style="color:#fde68a;">🚨 Sửa ngầm: <strong>${sum.sneakyAlertCount} điểm</strong></span>
    <span class="metric-tag">⚖️ Điểm: <strong>${sum.originalSafetyScore} ➔ ${sum.revisedSafetyScore} (${deltaSign})</strong></span>
  `;

  document.getElementById('sneakyAlertsBox').innerHTML = diffResult.sneakyAlerts
    .map(
      (a) => `
      <div class="sneaky-alert-card">
        <h4>🚨 Đoạn #${a.paragraphIndex}: ${escapeHtml(a.title)}</h4>
        <p>${escapeHtml(a.detail)}</p>
      </div>
    `
    )
    .join('');

  const listEl = document.getElementById('redlineDiffList');
  listEl.innerHTML = diffResult.paragraphDiffs
    .map((p) => {
      const tokensHtml = p.tokens
        .map((tk) =>
          tk.type === 'added'
            ? `<span class="diff-added">${escapeHtml(tk.value)}</span>`
            : tk.type === 'removed'
            ? `<span class="diff-removed">${escapeHtml(tk.value)}</span>`
            : escapeHtml(tk.value)
        )
        .join('');
      const decision = state.redlineDecisions[p.index] || (p.isModified ? 'OLD' : 'NEW');
      state.redlineDecisions[p.index] = decision;
      if (!p.isModified) {
        return `<div class="diff-para-row"><div class="diff-tokens-text"><small style="color:#64748b;">[#${p.index}]</small> ${tokensHtml}</div></div>`;
      }
      return `
        <div class="diff-para-row modified">
          <div class="diff-tokens-text"><small style="color:#fbbf24; font-weight:700;">[#${p.index} ĐÃ SỬA]</small> ${tokensHtml}</div>
          <div class="diff-decision-btns">
            <button class="btn btn-sm ${decision === 'OLD' ? 'btn-gold' : 'btn-outline'} btn-decide-diff" data-idx="${p.index}" data-choice="OLD">🛡️ Giữ Gốc</button>
            <button class="btn btn-sm ${decision === 'NEW' ? 'btn-emerald' : 'btn-outline'} btn-decide-diff" data-idx="${p.index}" data-choice="NEW">✅ Nhận Mới</button>
          </div>
        </div>
      `;
    })
    .join('');

  listEl.querySelectorAll('.btn-decide-diff').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.redlineDecisions[Number(btn.dataset.idx)] = btn.dataset.choice;
      renderRedlineResult(state.redlineDiffResult);
    });
  });
}

async function runPiiRedaction(sourceText) {
  const mode = document.getElementById('piiModeSelect').value;
  const res = await fetch('/api/redact-pii', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: sourceText || state.currentContractText, mode })
  });
  const data = await res.json();
  if (!data.ok) return;
  state.piiVaultMap = data.vaultMap || {};
  document.getElementById('piiRedactedTextarea').value = data.redactedText;
  document.getElementById('piiCountBadge').textContent = `${data.totalRedacted} mục đã che`;
  document.getElementById('piiVaultTableWrap').innerHTML = (data.detectedItems || [])
    .map(
      (item) => `
      <div class="finding-card MEDIUM" style="padding:9px 12px;">
        <div class="finding-top">
          <span class="sev-tag MEDIUM">${escapeHtml(item.label)}</span>
          <code style="color:#6ee7b7;">${escapeHtml(item.token)}</code>
        </div>
        <div style="font-size:12.5px;">Gốc: <strong style="color:#fca5a5;">${escapeHtml(item.originalValue)}</strong></div>
      </div>
    `
    )
    .join('');
}

function generateSafeContractPreview() {
  const type = document.getElementById('builderType')?.value || 'FREELANCE_IT';
  const partyA = document.getElementById('buildPartyA')?.value || 'BÊN A';
  const partyB = document.getElementById('buildPartyB')?.value || 'BÊN B';
  const amount = document.getElementById('buildAmount')?.value || '150.000.000 VNĐ';
  const duration = document.getElementById('buildDuration')?.value || '06 tháng';

  const lines = [
    'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
    'Độc lập - Tự do - Hạnh phúc',
    '---o0o---',
    type === 'FREELANCE_IT'
      ? 'HỢP ĐỒNG DỊCH VỤ PHÁT TRIỂN PHẦN MỀM CHUẨN AN TOÀN'
      : type === 'HOUSE_LEASE'
      ? 'HỢP ĐỒNG THUÊ MẶT BẰNG CÂN BẰNG QUYỀN LỢI HAI BÊN'
      : 'HỢP ĐỒNG LAO ĐỘNG & BẢO MẬT THÔNG TIN CHUẨN BLLĐ 2019',
    `BÊN A: ${partyA}`,
    `BÊN B: ${partyB}`,
    `1.1. Giá trị thỏa thuận: ${amount} — Thời hạn: ${duration}. Hỗ trợ tối đa 02 vòng chỉnh sửa theo SRS.`,
    document.getElementById('chkDeemedAccept')?.checked
      ? '2.1. Thanh toán 30% - 40% - 30%. Nghiệm thu mặc nhiên (Deemed Acceptance) sau 07 ngày làm việc.'
      : '',
    document.getElementById('chkBackgroundIp')?.checked
      ? '3.1. Chuyển giao Foreground IP sau khi thanh toán đủ 100%; Bên B giữ toàn quyền sở hữu Background IP.'
      : '',
    document.getElementById('chkCapPenalty')?.checked
      ? '4.1. Phạt vi phạm 0,05%/ngày nhưng tổng mức phạt tối đa không vượt quá 8% theo Điều 301 Luật Thương mại 2005.'
      : '',
    document.getElementById('chkLiabilityCap')?.checked
      ? '4.2. Loại trừ thiệt hại gián tiếp; tổng trách nhiệm bồi thường tối đa không vượt quá 100% giá trị thực thanh toán.'
      : '',
    document.getElementById('chkDataPrivacy')?.checked
      ? '5.1. Tuân thủ Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân.'
      : '',
    document.getElementById('chkForceMajeure')?.checked
      ? '6.1. Miễn trừ Sự kiện Bất khả kháng hai chiều theo Điều 156 Bộ luật Dân sự 2015. Tranh chấp giải quyết tại Tòa án nhân dân có thẩm quyền.'
      : ''
  ].filter(Boolean);

  const previewEl = document.getElementById('builderPreviewText');
  if (previewEl) previewEl.value = lines.join('\n\n');
}

function handleFileUpload(fileInput, onTextLoaded) {
  const file = fileInput.files?.[0];
  if (!file) return;
  showToast(`📂 Đang đọc tệp "${file.name}"...`);

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const res = await fetch('/api/parse-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, base64Data: reader.result })
      });
      const data = await res.json();
      if (!data.ok) {
        showToast('⚠️ Lỗi đọc file: ' + data.error);
        return;
      }
      onTextLoaded(data.text, file.name, data.format);
      showToast(`✅ Đã đọc tệp ${data.format} "${file.name}" (${data.charCount} ký tự)!`);
    } catch (err) {
      showToast('⚠️ Lỗi tải file: ' + err.message);
    } finally {
      fileInput.value = '';
    }
  };
  reader.readAsDataURL(file);
}

async function downloadDocx(includeAuditAppendix = false) {
  const res = await fetch('/api/export-docx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: state.activePreset?.title || 'HỢP ĐỒNG ĐÃ KIỂM TOÁN PHÁP LÝ',
      contractText: state.currentContractText,
      includeAuditAppendix
    })
  });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = includeAuditAppendix ? 'HopDong_KemPhuLuc_ContractShield.docx' : 'HopDong_AnToan_ContractShield.docx';
  a.click();
  URL.revokeObjectURL(url);
  showToast('📥 Đã xuất tệp Microsoft Word (.DOCX) kèm dấu niêm phong SHA-256!');
}

function bindEvents() {
  document.getElementById('btnToggleHighlightMode')?.addEventListener('click', (e) => {
    state.isRawEditorMode = !state.isRawEditorMode;
    const viewEl = document.getElementById('contractHighlightedView');
    const rawEl = document.getElementById('contractRawEditor');
    if (state.isRawEditorMode) {
      rawEl.value = state.currentContractText;
      viewEl.classList.add('hidden');
      rawEl.classList.remove('hidden');
      e.currentTarget.textContent = '🖍️ Chế độ: Soạn thảo Trực tiếp';
    } else {
      state.currentContractText = rawEl.value;
      rawEl.classList.add('hidden');
      viewEl.classList.remove('hidden');
      e.currentTarget.textContent = '🖍️ Chế độ: Đánh dấu Rủi ro';
      refreshAllDerivedViews(state.currentContractText);
    }
  });

  document.getElementById('btnRunAudit')?.addEventListener('click', () => {
    if (state.isRawEditorMode) {
      state.currentContractText = document.getElementById('contractRawEditor').value;
    }
    refreshAllDerivedViews(state.currentContractText);
    showToast('🔍 Đã cập nhật kiểm toán & mô phỏng tài chính!');
  });

  document.getElementById('btnFixAllRisks')?.addEventListener('click', applyAllClauseFixes);

  document.getElementById('btnJumpSim')?.addEventListener('click', () => {
    runFinancialSimulation(state.currentContractText);
    switchTab('tab-sim');
  });

  document.getElementById('btnJumpNegotiate')?.addEventListener('click', async () => {
    await generateNegotiationDraft();
    switchTab('tab-negotiate');
  });

  document.getElementById('docxUploadInput')?.addEventListener('change', (e) => {
    handleFileUpload(e.target, (text, fileName) => {
      state.currentContractText = text;
      document.getElementById('contractRawEditor').value = text;
      refreshAllDerivedViews(text, fileName);
    });
  });

  document.getElementById('btnExportCleanDocx')?.addEventListener('click', () => downloadDocx(false));
  document.getElementById('btnExportAuditDocx')?.addEventListener('click', () => downloadDocx(true));

  // Live OmniTrace OSINT Push
  document.getElementById('btnPushOmnitrace')?.addEventListener('click', async () => {
    const res = await fetch('/api/osint-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: state.currentContractText,
        title: state.activePreset?.title || 'Contract_Audit'
      })
    });
    const data = await res.json();
    if (data.ok) {
      const b = data.bridgeResult;
      if (b.omnitraceOnline) {
        showToast(`🕸️ Đã đẩy trực tiếp ${b.pushedCount} thực thể đối tác vào Đồ thị OmniTrace OSINT!`);
      } else {
        showToast(`ℹ️ Đã trích xuất ${b.pushedCount} IOC đối tác — Đang mở OmniTrace (Port 4090)...`);
      }
      window.open(b.targetUrl, '_blank');
    }
  });

  // Tab 2: Financial Simulator & .ICS Calendar
  ['simDelayDaysRange', 'simLoanMonthsRange', 'simEarlyExitCheck'].forEach((id) => {
    document.getElementById(id)?.addEventListener('input', () => runFinancialSimulation(state.currentContractText));
    document.getElementById(id)?.addEventListener('change', () => runFinancialSimulation(state.currentContractText));
  });
  document.getElementById('btnExportIcsCalendar')?.addEventListener('click', downloadIcsCalendar);

  // Tab 3: Legal Q&A & Custom Playbook
  document.querySelectorAll('.q-chip').forEach((chip) => {
    chip.addEventListener('click', () => askContractCounsel(chip.textContent));
  });
  document.getElementById('btnAskCounsel')?.addEventListener('click', () => askContractCounsel());
  document.getElementById('qaQuestionInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') askContractCounsel();
  });

  document.getElementById('btnAddPlaybookRule')?.addEventListener('click', async () => {
    const title = document.getElementById('pbTitleInput').value.trim();
    const patternStr = document.getElementById('pbPatternInput').value.trim();
    const severity = document.getElementById('pbSeveritySelect').value;
    const safeReplacement = document.getElementById('pbReplaceInput').value.trim();
    if (!title || !patternStr) {
      showToast('⚠️ Vui lòng nhập Tên quy tắc và Từ khóa/Regex!');
      return;
    }
    const res = await fetch('/api/playbook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, patternStr, severity, safeReplacement })
    });
    const data = await res.json();
    if (!data.ok) {
      showToast('⚠️ ' + data.error);
      return;
    }
    state.playbookRules = data.rules;
    renderPlaybookList();
    document.getElementById('pbTitleInput').value = '';
    document.getElementById('pbPatternInput').value = '';
    await runContractAudit(state.currentContractText);
    showToast('✅ Đã thêm quy tắc mới vào Playbook & quét lại hợp đồng!');
  });

  // Tab 4: Paper Contract Photo / Webcam OCR
  document.getElementById('ocrImageUploadInput')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.getElementById('ocrSampleCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
      img.src = reader.result;
      runOcrOnBase64Image(reader.result, file.name);
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('btnDemoSamplePaperOcr')?.addEventListener('click', () => {
    const canvas = document.getElementById('ocrSampleCanvas');
    canvas.width = 820;
    canvas.height = 460;
    drawSampleContractOnCanvas();
    const b64 = canvas.toDataURL('image/png');
    runOcrOnBase64Image(b64, 'Sample_Paper_Lease_Contract.png');
  });

  document.getElementById('btnToggleWebcam')?.addEventListener('click', async () => {
    const video = document.getElementById('ocrWebcamVideo');
    const canvas = document.getElementById('ocrSampleCanvas');
    const capBtn = document.getElementById('btnCaptureWebcam');
    if (state.webcamStream) {
      state.webcamStream.getTracks().forEach((t) => t.stop());
      state.webcamStream = null;
      video.classList.add('hidden');
      capBtn.classList.add('hidden');
      canvas.classList.remove('hidden');
      return;
    }
    try {
      state.webcamStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      video.srcObject = state.webcamStream;
      video.classList.remove('hidden');
      capBtn.classList.remove('hidden');
      canvas.classList.add('hidden');
    } catch (err) {
      showToast('⚠️ Không thể mở Camera: ' + err.message);
    }
  });

  document.getElementById('btnCaptureWebcam')?.addEventListener('click', () => {
    const video = document.getElementById('ocrWebcamVideo');
    const canvas = document.getElementById('ocrSampleCanvas');
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 600;
    canvas.getContext('2d').drawImage(video, 0, 0);
    video.classList.add('hidden');
    canvas.classList.remove('hidden');
    if (state.webcamStream) {
      state.webcamStream.getTracks().forEach((t) => t.stop());
      state.webcamStream = null;
    }
    document.getElementById('btnCaptureWebcam').classList.add('hidden');
    runOcrOnBase64Image(canvas.toDataURL('image/png'), 'webcam-contract.png');
  });

  document.getElementById('btnSendOcrToAuditor')?.addEventListener('click', async () => {
    const ocrText = document.getElementById('ocrResultTextarea').value.trim();
    if (!ocrText) {
      showToast('⚠️ Chưa có văn bản OCR để kiểm toán!');
      return;
    }
    state.currentContractText = ocrText;
    document.getElementById('contractRawEditor').value = ocrText;
    await refreshAllDerivedViews(ocrText, 'Hợp đồng Quét Ảnh Giấy (OCR)');
    switchTab('tab-audit');
    showToast('🛡️ Đã đẩy văn bản OCR sang Trạm Kiểm Toán Điều Khoản Bẫy!');
  });

  // Tab 5: Negotiation Email
  document.querySelectorAll('.tone-card').forEach((card) => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.tone-card').forEach((c) => c.classList.remove('active'));
      card.classList.add('active');
      state.selectedNegTone = card.dataset.tone;
      generateNegotiationDraft();
    });
  });
  document.getElementById('negLangSelect')?.addEventListener('change', generateNegotiationDraft);
  document.getElementById('btnGenerateNegEmail')?.addEventListener('click', generateNegotiationDraft);
  document.getElementById('btnCopyNegEmail')?.addEventListener('click', () => {
    const subj = document.getElementById('negEmailSubject').value;
    const body = document.getElementById('negEmailBody').value;
    navigator.clipboard.writeText(`Subject: ${subj}\n\n${body}`);
    showToast('📋 Đã copy Email đàm phán vào Clipboard!');
  });
  document.getElementById('btnOpenMailto')?.addEventListener('click', () => {
    const subj = encodeURIComponent(document.getElementById('negEmailSubject').value);
    const body = encodeURIComponent(document.getElementById('negEmailBody').value.slice(0, 1800));
    window.location.href = `mailto:?subject=${subj}&body=${body}`;
  });

  // Tab 6: SHA-256 Seal
  document.getElementById('btnCreateSeal')?.addEventListener('click', createSha256Seal);
  document.getElementById('btnExportSealedPdf')?.addEventListener('click', async () => {
    const res = await fetch('/api/export-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contractText: state.currentContractText })
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ContractShield_SealedCopy.pdf';
    a.click();
    URL.revokeObjectURL(url);
  });
  document.getElementById('btnRunSealVerify')?.addEventListener('click', verifyCandidateAgainstSeal);
  document.getElementById('btnSimulateTamperAttack')?.addEventListener('click', async () => {
    if (!state.activeSeal) await createSha256Seal();
    let text = state.activeSeal.sealedTextSnapshot || state.currentContractText;
    text = /\d{2}\.000\.000/.test(text)
      ? text.replace(/(\d{2})\.000\.000/, (_, n) => `${Number(n) + 15}.000.000`)
      : text + '\nPhụ lục lén chèn: Phí phạt 50.000.000 VNĐ.';
    document.getElementById('sealCandidateTextarea').value = text;
    await verifyCandidateAgainstSeal();
    showToast('🚨 Đã giả lập tráo 1 con số — Hệ thống bắt sống ngay đoạn bị tráo!');
  });
  document.getElementById('sealVerifyUploadInput')?.addEventListener('change', (e) => {
    handleFileUpload(e.target, (text) => {
      document.getElementById('sealCandidateTextarea').value = text;
      verifyCandidateAgainstSeal();
    });
  });

  // Tab 7: Redline
  document.getElementById('btnLoadPresetRedline')?.addEventListener('click', () => {
    if (state.activePreset) {
      document.getElementById('redlineTextV1').value = state.activePreset.originalText;
      document.getElementById('redlineTextV2').value =
        state.activePreset.revisedPartnerText || state.activePreset.originalText;
      runRedlineComparison();
    }
  });
  document.getElementById('btnRunRedlineDiff')?.addEventListener('click', runRedlineComparison);
  document.getElementById('redlineUploadV1')?.addEventListener('change', (e) => {
    handleFileUpload(e.target, (t) => {
      document.getElementById('redlineTextV1').value = t;
      runRedlineComparison();
    });
  });
  document.getElementById('redlineUploadV2')?.addEventListener('change', (e) => {
    handleFileUpload(e.target, (t) => {
      document.getElementById('redlineTextV2').value = t;
      runRedlineComparison();
    });
  });
  document.getElementById('btnApplyMergedToAuditor')?.addEventListener('click', async () => {
    if (!state.redlineDiffResult) return;
    const mergedParas = state.redlineDiffResult.paragraphDiffs.map((p) =>
      (state.redlineDecisions[p.index] || 'OLD') === 'NEW' ? p.newText : p.oldText
    );
    state.currentContractText = mergedParas.filter(Boolean).join('\n\n');
    document.getElementById('contractRawEditor').value = state.currentContractText;
    await refreshAllDerivedViews(state.currentContractText);
    switchTab('tab-audit');
  });

  // Tab 8: PII & Safe Builder
  document.getElementById('btnRunPiiRedact')?.addEventListener('click', () => runPiiRedaction(state.currentContractText));
  document.getElementById('piiModeSelect')?.addEventListener('change', () => runPiiRedaction(state.currentContractText));
  document.getElementById('btnRestorePii')?.addEventListener('click', async () => {
    const res = await fetch('/api/restore-pii', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        redactedText: document.getElementById('piiRedactedTextarea').value,
        vaultMap: state.piiVaultMap
      })
    });
    const data = await res.json();
    if (data.ok) {
      document.getElementById('piiRedactedTextarea').value = data.restoredText;
      showToast(`🔓 Đã khôi phục ${data.restoredCount} thông tin gốc!`);
    }
  });
  document.getElementById('btnCopyRedacted')?.addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('piiRedactedTextarea').value);
    showToast('📋 Đã copy văn bản đã che PII!');
  });

  ['builderType', 'buildPartyA', 'buildPartyB', 'buildAmount', 'buildDuration'].forEach((id) => {
    document.getElementById(id)?.addEventListener('input', generateSafeContractPreview);
    document.getElementById(id)?.addEventListener('change', generateSafeContractPreview);
  });
  ['chkCapPenalty', 'chkDeemedAccept', 'chkBackgroundIp', 'chkLiabilityCap', 'chkForceMajeure', 'chkDataPrivacy'].forEach(
    (id) => document.getElementById(id)?.addEventListener('change', generateSafeContractPreview)
  );
  document.getElementById('btnSendBuilderToAuditor')?.addEventListener('click', async () => {
    const builtText = document.getElementById('builderPreviewText').value;
    state.currentContractText = builtText;
    document.getElementById('contractRawEditor').value = builtText;
    await refreshAllDerivedViews(builtText, 'Hợp đồng Chuẩn An Toàn');
    switchTab('tab-audit');
    showToast('🛡️ Đã đưa Hợp đồng Chuẩn An Toàn (100/100) sang Trạm Kiểm Toán!');
  });
}

window.addEventListener('DOMContentLoaded', initApp);


// ============================================================================
// 8. v4.0 ENTERPRISE CLM CONTROLLERS: ED25519 PKI E-SIGN, BATCH SCAN & LEAK TRACER
// ============================================================================

state.lastEsignRecord = null;
state.batchResults = [];
state.watermarkedCopies = [];

function initSignaturePad() {
  const canvas = document.getElementById('esignCanvasPad');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const drawGuide = () => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, 120);
    ctx.lineTo(canvas.width - 30, 120);
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Segoe UI';
    ctx.fillText('✍️ Ký tên tại đây (Sign above line)', 32, 138);
  };

  drawGuide();

  // Draw an initial stylish sample signature so 1-Click test works immediately
  ctx.strokeStyle = '#1d4ed8';
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(90, 95);
  ctx.bezierCurveTo(135, 35, 175, 115, 225, 65);
  ctx.bezierCurveTo(260, 45, 290, 105, 355, 72);
  ctx.stroke();

  let drawing = false;
  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height
    };
  };

  const start = (e) => {
    e.preventDefault();
    drawing = true;
    const p = getPos(e);
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };
  const move = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const p = getPos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };
  const stop = () => {
    drawing = false;
  };

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  window.addEventListener('mouseup', stop);
  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', move, { passive: false });
  window.addEventListener('touchend', stop);

  document.getElementById('btnClearSigPad')?.addEventListener('click', drawGuide);
}

async function executeEd25519Sign() {
  const canvas = document.getElementById('esignCanvasPad');
  const signerName = document.getElementById('esignSignerName')?.value || 'Nguyễn Minh Quân';
  const signerEmail = document.getElementById('esignSignerEmail')?.value || '';

  const res = await fetch('/api/esign/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contractText: state.currentContractText,
      contractTitle: state.activePreset?.title || 'Hợp Đồng Ký Số PKI',
      signerName,
      signerEmail,
      signerRole: 'PARTY_B',
      drawnSignatureDataUrl: canvas ? canvas.toDataURL('image/png') : ''
    })
  });
  const data = await res.json();
  if (!data.ok) {
    showToast('⚠️ ' + data.error);
    return;
  }

  const r = data.record;
  state.lastEsignRecord = r;

  document.getElementById('esignCertificateOutput').innerHTML = `
    <div class="seal-code-banner">
      <div>
        <small style="color:#cbd5e1; display:block;">CHỨNG THƯ CHỮ KÝ SỐ PKI ED25519</small>
        <code>${escapeHtml(r.certCode)}</code>
      </div>
      <span class="grade-pill">${escapeHtml(r.algorithm)}</span>
    </div>
    <div style="font-size:12.5px; color:#cbd5e1; margin-bottom:6px;">
      <strong>👤 Người ký:</strong> ${escapeHtml(r.signerName)} •
      <strong>🔑 Public Key Fingerprint:</strong> <code>${escapeHtml(r.pubKeyFingerprint)}</code>
    </div>
    <div style="font-size:11.5px; color:#94a3b8;">Chữ ký số bất đối xứng Ed25519 (64-byte Hex):</div>
    <div class="hash-line">${escapeHtml(r.signatureHex)}</div>
  `;
  showToast(`✍️ Đã ký số mật mã Ed25519 (${r.certCode}) thành công!`);
}

async function verifyCurrentEd25519() {
  if (!state.lastEsignRecord) {
    await executeEd25519Sign();
  }
  const res = await fetch('/api/esign/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      certCodeOrId: state.lastEsignRecord.certCode,
      candidateText: state.currentContractText
    })
  });
  const data = await res.json();
  if (!data.ok) return;
  const v = data.verification;
  document.getElementById('esignVerifyBannerBox').innerHTML = `
    <div class="verify-banner ${v.valid ? 'safe' : 'tampered'}">
      <strong>${escapeHtml(v.verdict)}</strong>
    </div>
  `;
}

async function runBatchScanRequest(payload) {
  showToast('📂 Đang kiểm toán hàng loạt danh mục hợp đồng...');
  const res = await fetch('/api/batch-audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!data.ok) {
    showToast('⚠️ ' + data.error);
    return;
  }

  state.batchResults = data.results || [];
  const s = data.summary;

  document.getElementById('batchSummaryKpis').innerHTML = `
    <div class="kpi-card">
      <div class="kpi-label">TỔNG SỐ HỢP ĐỒNG ĐÃ QUÉT</div>
      <div class="score-number" style="color:#fbbf24;">${s.totalContracts}</div>
      <p class="kpi-sub">Điểm An Toàn trung bình: ${s.averageSafetyScore}/100</p>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">HỢP ĐỒNG NGUY HIỂM CẦN ĐÀM PHÁN GẤP</div>
      <div class="score-number" style="color:#ef4444;">${s.criticalContracts}</div>
      <p class="kpi-sub">Hợp đồng đạt chuẩn an toàn: ${s.safeContracts}</p>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">TỔNG RỦI RO TIỀN MẶT (VNĐ)</div>
      <div style="font-size:22px; font-weight:800; color:#fca5a5;">${s.totalVndExposure.toLocaleString('vi-VN')} đ</div>
      <p class="kpi-sub" style="color:#6ee7b7;">Tiết kiệm được: +${s.totalVndSavings.toLocaleString('vi-VN')} đ</p>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">TỔNG RỦI RO NGOẠI TỆ (USD)</div>
      <div style="font-size:22px; font-weight:800; color:#fca5a5;">$${s.totalUsdExposure.toLocaleString('en-US')}</div>
      <p class="kpi-sub" style="color:#6ee7b7;">Tiết kiệm được: +$${s.totalUsdSavings.toLocaleString('en-US')}</p>
    </div>
  `;

  document.getElementById('batchMatrixTableWrap').innerHTML = `
    <table class="matrix-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Tên Tệp / Hợp Đồng</th>
          <th>Ngôn ngữ</th>
          <th>Điểm An Toàn</th>
          <th>Số Bẫy</th>
          <th>Thiệt Hại Bẫy</th>
          <th>Số Tiền Cứu Được</th>
          <th>Hạn Báo Hủy Gia Hạn</th>
          <th>Rủi Ro Lớn Nhất</th>
        </tr>
      </thead>
      <tbody>
        ${state.batchResults
          .map(
            (r, i) => `
          <tr>
            <td><strong>#${i + 1}</strong></td>
            <td><strong>${escapeHtml(r.fileName)}</strong></td>
            <td><span class="lang-pill">${r.language}</span></td>
            <td><span class="sev-tag ${r.safetyScore < 50 ? 'CRITICAL' : r.safetyScore < 80 ? 'MEDIUM' : 'HIGH'}" style="color:${r.safetyScore >= 80 ? '#6ee7b7' : ''};">${r.safetyScore}/100 (Hạng ${r.grade})</span></td>
            <td>${r.totalTraps} (${r.criticalTraps} Critical)</td>
            <td style="color:#fca5a5; font-weight:700;">${formatMoney(r.trapExposure, r.currency)}</td>
            <td style="color:#6ee7b7; font-weight:700;">+${formatMoney(r.potentialSavings, r.currency)}</td>
            <td><code>${r.noticeCutoffDate}</code></td>
            <td style="max-width:260px; font-size:12px; color:#cbd5e1;">${escapeHtml(r.topRiskTitle)}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `;
  showToast(`✅ Đã quét xong ${s.totalContracts} hợp đồng và lập Ma trận Xếp hạng Rủi ro!`);
}

async function embedLeakWatermarks() {
  const rawLines = document.getElementById('leakRecipientsInput')?.value || '';
  const recipients = rawLines.split('\n').map((s) => s.trim()).filter(Boolean);

  const res = await fetch('/api/watermark/embed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contractText: state.currentContractText,
      contractTitle: state.activePreset?.title || 'Dự thảo Mật',
      recipients
    })
  });
  const data = await res.json();
  if (!data.ok) {
    showToast('⚠️ ' + data.error);
    return;
  }

  state.watermarkedCopies = data.copies || [];
  const listEl = document.getElementById('watermarkedCopiesList');
  listEl.innerHTML = state.watermarkedCopies
    .map(
      (c, idx) => `
      <div class="finding-card HIGH" style="padding:11px 13px;">
        <div class="finding-top">
          <strong>👤 ${escapeHtml(c.recipientName)}</strong>
          <code style="color:#fbbf24; font-weight:700;">Mã ẩn #${escapeHtml(c.watermarkId)}</code>
        </div>
        <div style="font-size:12px; color:#cbd5e1; margin-bottom:8px;">
          Đã nhúng vào <strong>${c.embeddedParagraphCount} đoạn văn</strong> (${c.hiddenZeroWidthChars} ký tự Zero-Width tàng hình • Khác biệt hiển thị: 0%)
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm btn-copy-wm" data-idx="${idx}">📋 Copy Bản Giao Cho Người Này</button>
          <button class="btn btn-emerald btn-sm btn-test-leak-wm" data-idx="${idx}">🧪 Thử Cắt 1 Câu Đưa Sang Máy Truy Vết</button>
        </div>
      </div>
    `
    )
    .join('');

  listEl.querySelectorAll('.btn-copy-wm').forEach((btn) => {
    btn.addEventListener('click', () => {
      const c = state.watermarkedCopies[Number(btn.dataset.idx)];
      navigator.clipboard.writeText(c.watermarkedText);
      showToast(`📋 Đã copy bản hợp đồng có gắn vân tay ẩn riêng cho "${c.recipientName}"!`);
    });
  });

  listEl.querySelectorAll('.btn-test-leak-wm').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const c = state.watermarkedCopies[Number(btn.dataset.idx)];
      // Pick 1 single paragraph from the middle of the contract to prove 1-sentence leak tracing!
      const paras = c.watermarkedText.split('\n').filter((l) => l.includes('\u200D'));
      const middleSnippet = paras[Math.floor(paras.length / 2)] || c.watermarkedText.slice(0, 200);
      document.getElementById('leakedSnippetInput').value = middleSnippet;
      await traceLeakedSnippet();
    });
  });

  showToast(`🧬 Đã tạo ${state.watermarkedCopies.length} bản hợp đồng gắn vân tay vô hình riêng biệt!`);
}

async function traceLeakedSnippet() {
  const leakedText = document.getElementById('leakedSnippetInput')?.value || '';
  const res = await fetch('/api/watermark/trace', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leakedText })
  });
  const data = await res.json();
  if (!data.ok) return;

  const t = data.traceResult;
  document.getElementById('leakTraceResultBox').innerHTML = `
    <div class="verify-banner ${t.found ? 'tampered' : 'safe'}">
      <div style="font-size:14px; font-weight:800; margin-bottom:4px;">${escapeHtml(t.verdict)}</div>
      ${
        t.found
          ? `<div style="font-size:12px;">Mã vân tay giải mã: <code>#${escapeHtml(t.watermarkId)}</code> • Gói CRC-8 nguyên vẹn: <strong>${t.intactPacketsRecovered}</strong> • Cấp lúc: ${t.issuedAt ? new Date(t.issuedAt).toLocaleString('vi-VN') : 'N/A'}</div>`
          : ''
      }
    </div>
  `;
}

window.addEventListener('DOMContentLoaded', () => {
  initSignaturePad();

  document.getElementById('btnExecuteEd25519Sign')?.addEventListener('click', executeEd25519Sign);
  document.getElementById('btnVerifyEd25519Sig')?.addEventListener('click', verifyCurrentEd25519);
  document.getElementById('btnExportSignedDocx')?.addEventListener('click', async () => {
    if (!state.lastEsignRecord) await executeEd25519Sign();
    const res = await fetch('/api/export-docx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `${state.activePreset?.title || 'HỢP ĐỒNG'} (ĐÃ KÝ SỐ ED25519)`,
        contractText: state.lastEsignRecord.signedContractText,
        includeAuditAppendix: false
      })
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.lastEsignRecord.certCode}_SignedContract.docx`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📥 Đã tải tệp .DOCX đính kèm Khung Chữ Ký Số PKI Ed25519!');
  });

  // Batch Portfolio Events
  document.getElementById('btnRunDemoBatchPortfolio')?.addEventListener('click', () => {
    runBatchScanRequest({ demoAllPresets: true });
  });

  document.getElementById('batchMultiFilesInput')?.addEventListener('change', async (e) => {
    const fileList = Array.from(e.target.files || []);
    if (fileList.length === 0) return;
    const filesPayload = await Promise.all(
      fileList.map(
        (file) =>
          new Promise((resolve) => {
            const r = new FileReader();
            r.onload = () => resolve({ fileName: file.name, base64Data: r.result });
            r.readAsDataURL(file);
          })
      )
    );
    await runBatchScanRequest({ files: filesPayload });
    e.target.value = '';
  });

  document.getElementById('btnExportBatchCsv')?.addEventListener('click', async () => {
    if (!state.batchResults.length) {
      await runBatchScanRequest({ demoAllPresets: true });
    }
    const res = await fetch('/api/batch-export-csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results: state.batchResults })
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ContractShield_Portfolio_Matrix.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('📊 Đã xuất bảng xếp hạng rủi ro ra tệp Excel (.CSV chuẩn UTF-8 BOM)!');
  });

  // Zero-Width Leak Watermarker Events
  document.getElementById('btnEmbedLeakWatermarks')?.addEventListener('click', embedLeakWatermarks);
  document.getElementById('btnTraceLeaker')?.addEventListener('click', traceLeakedSnippet);
});
