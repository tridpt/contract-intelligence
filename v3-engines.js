/**
 * 🚀 ContractShield v3.0 Advanced Engines
 * 1. 🧮 What-If Financial Breach & Penalty Simulator
 * 2. 📅 Obligation Timeline Extractor & RFC 5545 .ICS Calendar Generator
 * 3. 🧠 Hybrid Contract Counsel Q&A (Offline Legal Retrieval + Live Gemini API) & Custom Playbook
 * 4. 📸 Local Paper Contract Image OCR (Tesseract LSTM vie+eng + Windows Native WinRT OCR fallback)
 * 5. 🔗 Live OmniTrace OSINT Bridge (Port 4090)
 */

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const https = require('node:https');
const crypto = require('node:crypto');
const { execFile } = require('node:child_process');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const PLAYBOOK_FILE = path.join(DATA_DIR, 'custom_playbook.json');

const DEFAULT_PLAYBOOK_RULES = [
  {
    id: 'PB_MIN_DEPOSIT_30',
    enabled: false,
    title: '[Playbook Nội bộ] Tạm ứng Đợt 1 thấp hơn ngưỡng tối thiểu 30%',
    category: 'CUSTOM PLAYBOOK',
    severity: 'HIGH',
    scorePenalty: 12,
    legalBasis: 'Quy chuẩn Tài chính Nội bộ (Tạm ứng ≥ 30%)',
    patternStr: 'tạm ứng\\s*(?:5|10|15|20)\\s*%',
    explanation: 'Quy tắc Playbook của bạn yêu cầu khoản tạm ứng Đợt 1 ngay sau khi ký phải đạt tối thiểu 30% để đảm bảo chi phí khởi tạo dự án.',
    safeReplacement: 'Đợt 1: Bên A tạm ứng 30% tổng giá trị hợp đồng trong vòng 05 ngày làm việc kể từ ngày ký kết.'
  },
  {
    id: 'PB_MAX_NET_30',
    enabled: false,
    title: '[Playbook Nội bộ] Chu kỳ công nợ thanh toán vượt quá 30 ngày',
    category: 'CUSTOM PLAYBOOK',
    severity: 'MEDIUM',
    scorePenalty: 10,
    legalBasis: 'Quy chuẩn Dòng tiền Nội bộ (Max Net 30)',
    patternStr: '(?:trong vòng\\s*(?:45|60|90|120)\\s*ngày|Net\\s*(?:45|60|90|120|150))',
    explanation: 'Quy tắc Playbook của bạn giới hạn thời hạn thanh toán hóa đơn tối đa là 30 ngày (Net 30).',
    safeReplacement: 'Bên A thanh toán đầy đủ giá trị đợt nghiệm thu trong vòng tối đa 15 - 30 ngày (Net 30) kể từ ngày nhận hồ sơ thanh toán.'
  }
];

if (!fs.existsSync(PLAYBOOK_FILE)) {
  fs.writeFileSync(PLAYBOOK_FILE, JSON.stringify(DEFAULT_PLAYBOOK_RULES, null, 2), 'utf8');
}

// ============================================================================
// 1. 🧮 MÁY MÔ PHỎNG THIỆT HẠI TÀI CHÍNH ("WHAT-IF BREACH & PENALTY SIMULATOR")
// ============================================================================

function parseVndNumber(rawStr) {
  if (!rawStr) return 0;
  const digits = String(rawStr).replace(/[^\d]/g, '');
  return Number(digits || 0);
}

function extractFinancialStructure(text) {
  const src = String(text || '');
  const isUsd = /\$\d+|\bUSD\b/i.test(src) && !/VNĐ|đồng/i.test(src);
  const currency = isUsd ? 'USD' : 'VNĐ';

  let baseAmount = isUsd ? 48000 : 100000000;
  if (isUsd) {
    const usdMatch = src.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/);
    if (usdMatch) baseAmount = Number(usdMatch[1].replace(/,/g, ''));
  } else {
    // Look for contract total, loan principal, monthly salary or rent
    const mainValMatch =
      src.match(/(?:tổng giá trị hợp đồng[^0-9]{0,35}|số tiền vay[^0-9]{0,25}|vay số tiền là\s*|lương chính thức[^0-9]{0,25}|giá thuê[^0-9]{0,30}|phí dịch vụ là\s*)(\d{1,3}(?:\.\d{3}){2,})/i) ||
      src.match(/(\d{1,3}(?:\.\d{3}){2,})\s*VNĐ/i);
    if (mainValMatch) baseAmount = parseVndNumber(mainValMatch[1]);
  }

  // Deposit
  let depositAmount = 0;
  const depMatch = src.match(/đặt cọc[^0-9]{0,35}(\d{1,3}(?:\.\d{3}){2,})/i);
  if (depMatch) depositAmount = parseVndNumber(depMatch[1]);

  // Daily Penalty % (e.g. 5%/ngày, 0.3%/ngày)
  let dailyPenaltyPct = 0;
  const dailyMatch = src.match(/(?:phạt[^.;\n]{0,45}|quá hạn là\s*)(\d+(?:[.,]\d+)?)\s*%\/ngày/i);
  if (dailyMatch) dailyPenaltyPct = Number(dailyMatch[1].replace(',', '.'));

  // Monthly Interest % (e.g. 3.5%/tháng)
  let monthlyInterestPct = 0;
  const interestMatch = src.match(/lãi suất[^.;\n]{0,40}(\d+(?:[.,]\d+)?)\s*%\/tháng/i);
  if (interestMatch) monthlyInterestPct = Number(interestMatch[1].replace(',', '.'));

  // Salary cut % (e.g. 50% tiền lương)
  let salaryCutPct = 0;
  const salCutMatch = src.match(/(?:phạt trừ lương|khấu trừ)[^.;\n]{0,35}(\d+)\s*%\s*(?:tiền\s*)?lương/i);
  if (salCutMatch) salaryCutPct = Number(salCutMatch[1]);

  // Lump-sum fine / training compensation / prepayment fee
  let lumpSumFine = 0;
  const fineMatches = [
    ...src.matchAll(/(?:phạt vi phạm là|đền bù|phạt trả nợ trước hạn[^0-9]{0,35}\()(\d{1,3}(?:\.\d{3}){2,})/gi)
  ];
  for (const m of fineMatches) {
    lumpSumFine += parseVndNumber(m[1]);
  }

  // Detect contract type
  let contractKind = 'COMMERCIAL_SERVICE';
  if (/hợp đồng lao động|tiền lương/i.test(src)) contractKind = 'LABOR';
  else if (/vay tiền|lãi suất vay/i.test(src)) contractKind = 'LOAN';
  else if (/thuê mặt bằng|thuê nhà|tiền đặt cọc/i.test(src)) contractKind = 'LEASE';
  else if (isUsd) contractKind = 'INTERNATIONAL_MSA';

  return {
    currency,
    contractKind,
    baseAmount,
    depositAmount,
    dailyPenaltyPct,
    monthlyInterestPct,
    salaryCutPct,
    lumpSumFine
  };
}

function simulateFinancialExposure(text, options = {}) {
  const delayDays = Math.max(0, Number(options.delayDays ?? 20));
  const loanMonths = Math.max(1, Number(options.loanMonths ?? 12));
  const triggerEarlyExit = options.triggerEarlyExit !== false;

  const params = extractFinancialStructure(text);
  const { currency, contractKind, baseAmount, depositAmount, dailyPenaltyPct, monthlyInterestPct, salaryCutPct, lumpSumFine } = params;

  let trapDelayLoss = 0;
  let trapInterestLoss = 0;
  let trapExitOrDepositLoss = 0;

  let legalDelayMax = 0;
  let legalInterestMax = 0;
  let legalExitMax = 0;
  let appliedLawSummary = '';

  if (contractKind === 'LOAN') {
    // Trap interest vs 20%/yr (1.6667%/month) cap under Art 468 Civil Code 2015
    const effMonthly = monthlyInterestPct || 3.5;
    trapInterestLoss = Math.round(baseAmount * (effMonthly / 100) * loanMonths);
    legalInterestMax = Math.round(baseAmount * (20 / 12 / 100) * loanMonths);

    const effDailyOverdue = dailyPenaltyPct || 0.3;
    trapDelayLoss = Math.round(baseAmount * (effDailyOverdue / 100) * delayDays);
    // Overdue max = 150% of 20%/yr = 30%/yr (~0.082%/day)
    legalDelayMax = Math.round(baseAmount * (0.3 / 365) * delayDays);

    if (triggerEarlyExit) {
      trapExitOrDepositLoss = lumpSumFine || Math.round(baseAmount * 0.2);
      legalExitMax = Math.round(baseAmount * 0.02); // Standard reasonable bank admin fee 1-2%
    }
    appliedLawSummary = 'Điều 468 Bộ luật Dân sự 2015: Trần lãi suất vay tối đa 20%/năm (~1,66%/tháng), lãi quá hạn tối đa 150% lãi trong hạn.';
  } else if (contractKind === 'LABOR') {
    // Illegal salary cut + non-compete fine + keeping last month salary
    if (delayDays > 0 && salaryCutPct > 0) {
      trapDelayLoss = Math.round(baseAmount * (salaryCutPct / 100));
      legalDelayMax = 0; // Art 128 Labor Code prohibits salary fines!
    }
    if (triggerEarlyExit) {
      const withheldLastMonth = /không được nhận lương tháng cuối/i.test(text) ? baseAmount : 0;
      trapExitOrDepositLoss = lumpSumFine + withheldLastMonth;
      legalExitMax = 0; // Lawful 30/45-day notice resignation requires 0đ penalty
    }
    appliedLawSummary = 'Điều 128 & Điều 35 Bộ luật Lao động 2019: Nghiêm cấm phạt tiền/cắt lương thay kỷ luật; nghỉ việc báo trước đúng hạn không phải bồi thường.';
  } else if (contractKind === 'LEASE') {
    const effDeposit = depositAmount || baseAmount * 3;
    if (delayDays > 2 && /tịch thu 100%\s*tiền đặt cọc/i.test(text)) {
      trapDelayLoss = effDeposit;
    } else {
      trapDelayLoss = Math.round(baseAmount * 0.005 * delayDays);
    }
    // Legal late rent interest ~20%/yr pro-rata on 1 month rent
    legalDelayMax = Math.round(baseAmount * (0.2 / 365) * delayDays);

    if (triggerEarlyExit) {
      // Price hike 35% over remaining 12 months or losing deposit
      trapExitOrDepositLoss = Math.round(baseAmount * 0.35 * 12);
      legalExitMax = Math.round(baseAmount * 0.08 * 12); // Capped 8%/yr negotiated adjustment
    }
    appliedLawSummary = 'Điều 328 & Điều 473 Bộ luật Dân sự 2015: Bảo vệ tiền đặt cọc trước hành vi tăng giá tùy ý & áp dụng ân hạn thanh toán hợp lý.';
  } else if (contractKind === 'INTERNATIONAL_MSA') {
    // International USD contract: Uncapped consequential damages + unpaid WIP
    trapDelayLoss = Math.round(baseAmount * 0.01 * delayDays);
    legalDelayMax = Math.round(baseAmount * 0.08);
    if (triggerEarlyExit) {
      // Uncapped consequential damages / unpaid WIP simulation (e.g. 2.5x contract value claim)
      trapExitOrDepositLoss = Math.round(baseAmount * 2.5);
      legalExitMax = Math.round(baseAmount * 1.0); // 100% fees paid Liability Cap
    }
    appliedLawSummary = 'International MSA Liability Cap Standard: Waive consequential damages & cap aggregate liability at ≤ 100% of fees paid.';
  } else {
    // Commercial / Software Freelance IT
    const effDaily = dailyPenaltyPct || 5;
    trapDelayLoss = Math.round(baseAmount * (effDaily / 100) * delayDays);
    // Art 301 Commercial Law 2005: Max 8% penalty cap!
    legalDelayMax = Math.min(Math.round(baseAmount * 0.0005 * delayDays), Math.round(baseAmount * 0.08));

    if (triggerEarlyExit) {
      // Unlimited liability / 80% held payment risk
      const held80 = /80%\s*giá trị còn lại/i.test(text) ? Math.round(baseAmount * 0.8) : Math.round(baseAmount * 0.5);
      trapExitOrDepositLoss = held80 + lumpSumFine;
      legalExitMax = Math.round(baseAmount * 0.08);
    }
    appliedLawSummary = 'Điều 301 Luật Thương mại 2005: Tổng mức phạt vi phạm tối đa KHÔNG vượt quá 8% giá trị phần nghĩa vụ hợp đồng bị vi phạm.';
  }

  const trapTotal = trapDelayLoss + trapInterestLoss + trapExitOrDepositLoss;
  const legalTotal = legalDelayMax + legalInterestMax + legalExitMax;
  const moneySaved = Math.max(0, trapTotal - legalTotal);
  const lossVsContractPct = baseAmount > 0 ? Math.round((trapTotal / baseAmount) * 100) : 0;

  return {
    inputs: { delayDays, loanMonths, triggerEarlyExit },
    params,
    trapScenario: {
      delayLoss: trapDelayLoss,
      interestLoss: trapInterestLoss,
      exitOrDepositLoss: trapExitOrDepositLoss,
      totalExposure: trapTotal
    },
    legalCapScenario: {
      delayMax: legalDelayMax,
      interestMax: legalInterestMax,
      exitMax: legalExitMax,
      totalLegalMax: legalTotal,
      appliedLawSummary
    },
    moneySaved,
    lossVsContractPct
  };
}

// ============================================================================
// 2. 📅 TRÍCH XUẤT TIMELINE NGHĨA VỤ & XUẤT LỊCH CHUÔNG NHẮC .ICS (RFC 5545)
// ============================================================================

function parseContractStartDate(text) {
  const src = String(text || '');
  // Match "ngày 10 tháng 11 năm 2026"
  const vnFull = src.match(/ngày\s+(\d{1,2})\s+tháng\s+(\d{1,2})\s+năm\s+(\d{4})/i);
  if (vnFull) {
    return new Date(Date.UTC(Number(vnFull[3]), Number(vnFull[2]) - 1, Number(vnFull[1]), 9, 0, 0));
  }
  // Match "10/11/2026"
  const slash = src.match(/\b(\d{1,2})\/(\d{1,2})\/(20\d{2})\b/);
  if (slash) {
    return new Date(Date.UTC(Number(slash[3]), Number(slash[2]) - 1, Number(slash[1]), 9, 0, 0));
  }
  // Match English "November 18, 2026"
  const enMatch = src.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s*(20\d{2})\b/i);
  if (enMatch) {
    const parsed = new Date(`${enMatch[1]} ${enMatch[2]}, ${enMatch[3]} 09:00:00 UTC`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 9, 0, 0));
}

function addDaysUtc(date, days) {
  const d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function addMonthsUtc(date, months) {
  const d = new Date(date.getTime());
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

function toIsoDate(d) {
  return d.toISOString().slice(0, 10);
}

function extractObligationTimeline(text) {
  const src = String(text || '');
  const startDate = parseContractStartDate(src);
  const milestones = [];

  // 1. Signing / Effective Date
  milestones.push({
    id: 'MS_START',
    date: toIsoDate(startDate),
    urgency: 'INFO',
    title: '📝 Ngày Ký Kết & Bắt Đầu Hiệu Lực Hợp Đồng',
    description: 'Lưu trữ bản gốc/bản niêm phong SHA-256 và thực hiện nghĩa vụ bàn giao/tạm ứng ban đầu.'
  });

  // 2. Payment Cycle / Net Terms
  const payDayMatch = src.match(/thanh toán vào ngày\s*(\d{1,2})\s*hàng tháng|từ ngày\s*(\d{1,2})\s*đến ngày\s*(\d{1,2})\s*hàng tháng|trả vào ngày\s*(\d{1,2})\s*hàng tháng/i);
  if (payDayMatch) {
    const dayNum = Number(payDayMatch[1] || payDayMatch[2] || payDayMatch[4] || 5);
    const nextMonthPay = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth() + 1, Math.min(28, dayNum), 9, 0, 0));
    milestones.push({
      id: 'MS_MONTHLY_PAY',
      date: toIsoDate(nextMonthPay),
      urgency: 'HIGH',
      title: `💰 Kỳ Thanh Toán Định Kỳ Đầu Tiên (Ngày ${String(dayNum).padStart(2, '0')} hàng tháng)`,
      description: 'Kiểm tra chuyển khoản đúng hạn để tránh rơi vào bẫy phạt chậm thanh toán hoặc mất tiền cọc.'
    });
  }

  const netMatch = src.match(/\bNet\s*(\d{2,3})\b/i);
  if (netMatch) {
    const netDays = Number(netMatch[1]);
    milestones.push({
      id: 'MS_NET_INVOICE',
      date: toIsoDate(addDaysUtc(startDate, netDays)),
      urgency: netDays > 45 ? 'CRITICAL' : 'MEDIUM',
      title: `🧾 Đáo Hạn Thanh Toán Hóa Đơn Quốc Tế (Net ${netDays} Days)`,
      description: `Theo dõi công nợ khách hàng quốc tế theo chu kỳ Net ${netDays} ngày kể từ ngày xuất Invoice.`
    });
  }

  // 3. Deemed Acceptance / UAT Milestone (default +30 days for IT/service contracts)
  if (/nghiệm thu|deliverables|phần mềm/i.test(src)) {
    milestones.push({
      id: 'MS_ACCEPTANCE',
      date: toIsoDate(addDaysUtc(startDate, 30)),
      urgency: 'HIGH',
      title: '📋 Mốc Bàn Giao Nghiệm Thu & Yêu Cầu Ký Biên Bản (UAT)',
      description: 'Gửi biên bản bàn giao bằng văn bản để kích hoạt thời hạn Nghiệm thu mặc nhiên (Deemed Acceptance 07 ngày).'
    });
  }

  // 4. Contract Duration & Anti-Auto-Renewal Notice Cutoff
  let durationMonths = 12;
  const durMonthMatch = src.match(/(?:thời hạn(?: hợp đồng| thuê)? là|trong thời hạn)\s*(\d{1,2})\s*tháng/i);
  const durYearMatch = src.match(/(\d)\s*năm|period of\s*(\d)\s*years/i);
  if (durMonthMatch) durationMonths = Number(durMonthMatch[1]);
  else if (durYearMatch) durationMonths = Number(durYearMatch[1] || durYearMatch[2]) * 12;

  const endDate = addMonthsUtc(startDate, durationMonths);

  const noticeDaysMatch = src.match(/báo[^.;\n]{0,35}trước(?:\s*ít nhất)?\s*(\d{1,3})\s*ngày|prior written notice[^.;\n]{0,20}(\d{1,3})\s*days/i);
  const noticeDays = noticeDaysMatch ? Number(noticeDaysMatch[1] || noticeDaysMatch[2]) : 30;
  const noticeDeadline = addDaysUtc(endDate, -noticeDays);

  milestones.push({
    id: 'MS_NOTICE_CUTOFF',
    date: toIsoDate(noticeDeadline),
    urgency: 'CRITICAL',
    title: `🚨 HẠN CHÓT GỬI THÔNG BÁO HỦY / KHÔNG GIA HẠN TỰ ĐỘNG (Trước ${noticeDays} ngày)`,
    description: `Phải gửi văn bản trước ngày ${toIsoDate(noticeDeadline)} nếu không muốn bị khóa gia hạn tự động hoặc mất quyền đàm phán lại giá!`
  });

  milestones.push({
    id: 'MS_CONTRACT_END',
    date: toIsoDate(endDate),
    urgency: 'HIGH',
    title: `🏁 Ngày Kết Thúc Thời Hạn Hợp Đồng (${durationMonths} tháng)`,
    description: 'Thực hiện thanh lý hợp đồng, đối chiếu công nợ cuối kỳ và thu hồi toàn bộ tiền đặt cọc.'
  });

  // 5. Post-termination Non-Compete / NDA Survival
  const survivalMatch = src.match(/trong vòng\s*(\d{1,2})\s*tháng[^.;\n]{0,35}sau khi chấm dứt|for\s*(?:a period of\s*)?(\d)\s*years\s*following termination/i);
  if (survivalMatch) {
    const survMonths = survivalMatch[1] ? Number(survivalMatch[1]) : Number(survivalMatch[2]) * 12;
    milestones.push({
      id: 'MS_SURVIVAL_END',
      date: toIsoDate(addMonthsUtc(endDate, survMonths)),
      urgency: 'MEDIUM',
      title: `🔓 Ngày Mãn Hạn Ràng Buộc Bảo Mật / Hạn Chế Sau Hợp Đồng (+${survMonths} tháng)`,
      description: 'Chấm dứt hoàn toàn hiệu lực ràng buộc NDA / Non-compete sau khi kết thúc hợp đồng chính.'
    });
  }

  milestones.sort((a, b) => a.date.localeCompare(b.date));
  return {
    startDate: toIsoDate(startDate),
    endDate: toIsoDate(endDate),
    durationMonths,
    noticeDays,
    milestones
  };
}

function formatIcsDateUtc(isoDateStr) {
  return isoDateStr.replace(/-/g, '') + 'T020000Z'; // 09:00 AM GMT+7
}

function escapeIcsText(str) {
  return String(str || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function generateIcsCalendar(timeline, contractTitle = 'Hợp Đồng Pháp Lý') {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ContractShield Studio v3.0//Obligation Reminder//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(`Lịch Hợp Đồng: ${contractTitle}`)}`
  ];

  for (const m of timeline.milestones) {
    const dtStart = formatIcsDateUtc(m.date);
    const dtEnd = m.date.replace(/-/g, '') + 'T030000Z';
    lines.push(
      'BEGIN:VEVENT',
      `UID:${m.id}-${crypto.randomUUID()}@contractshield.local`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${escapeIcsText(`[ContractShield] ${m.title}`)}`,
      `DESCRIPTION:${escapeIcsText(`${contractTitle} — ${m.description}`)}`,
      'BEGIN:VALARM',
      'TRIGGER:-P7D',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeIcsText(`Nhắc trước 7 ngày: ${m.title}`)}`,
      'END:VALARM',
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

// ============================================================================
// 3. 🧠 CUSTOM PLAYBOOK & HYBRID AI CONTRACT COUNSEL Q&A
// ============================================================================

function loadCustomPlaybook() {
  try {
    return JSON.parse(fs.readFileSync(PLAYBOOK_FILE, 'utf8'));
  } catch {
    return [...DEFAULT_PLAYBOOK_RULES];
  }
}

function saveCustomPlaybook(rules) {
  fs.writeFileSync(PLAYBOOK_FILE, JSON.stringify(rules, null, 2), 'utf8');
  return rules;
}

function addPlaybookRule({ title, patternStr, severity = 'HIGH', legalBasis = 'Quy chuẩn Playbook Riêng', explanation = '', safeReplacement = '' }) {
  // Validate regex syntax safely
  // eslint-disable-next-line no-new
  new RegExp(patternStr, 'i');
  const rules = loadCustomPlaybook();
  const newRule = {
    id: `PB_${Date.now()}`,
    enabled: true,
    title,
    category: 'CUSTOM PLAYBOOK',
    severity,
    scorePenalty: severity === 'CRITICAL' ? 22 : severity === 'HIGH' ? 15 : 10,
    legalBasis,
    patternStr,
    explanation: explanation || `Vi phạm tiêu chuẩn Playbook nội bộ: "${title}".`,
    safeReplacement: safeReplacement || `Điều chỉnh điều khoản tuân thủ tiêu chuẩn: ${title}.`
  };
  rules.unshift(newRule);
  saveCustomPlaybook(rules);
  return newRule;
}

function togglePlaybookRule(ruleId, enabled) {
  const rules = loadCustomPlaybook();
  const target = rules.find((r) => r.id === ruleId);
  if (!target) throw new Error('Không tìm thấy quy tắc Playbook');
  target.enabled = Boolean(enabled);
  saveCustomPlaybook(rules);
  return target;
}

function deletePlaybookRule(ruleId) {
  const rules = loadCustomPlaybook().filter((r) => r.id !== ruleId);
  saveCustomPlaybook(rules);
  return rules;
}

function evaluatePlaybookRulesOnClauses(clauses) {
  const activeRules = loadCustomPlaybook().filter((r) => r.enabled);
  const findings = [];

  for (const clause of clauses) {
    for (const rule of activeRules) {
      try {
        const re = new RegExp(rule.patternStr, 'i');
        const m = re.exec(clause.text);
        if (m) {
          findings.push({
            id: `${rule.id}_${findings.length + 1}`,
            ruleId: rule.id,
            isPlaybook: true,
            lang: 'VI',
            title: rule.title,
            category: rule.category,
            severity: rule.severity,
            scorePenalty: rule.scorePenalty || 12,
            legalBasis: rule.legalBasis,
            section: clause.section,
            lineNumber: clause.lineNumber,
            flaggedClauseText: clause.text,
            matchedPhrase: m[0],
            explanation: rule.explanation,
            recommendation: rule.safeReplacement,
            safeReplacement: rule.safeReplacement
          });
        }
      } catch {
        // Ignore malformed user regex
      }
    }
  }
  return findings;
}

function callGeminiCounselApi({ apiKey, question, contractText, auditReport }) {
  return new Promise((resolve, reject) => {
    const prompt = `Bạn là Luật sư Kiểm toán Hợp đồng cao cấp (am hiểu sâu Bộ luật Dân sự 2015, Bộ luật Lao động 2019, Luật Thương mại 2005, Nghị định 13/2023/NĐ-CP và Chuẩn Hợp đồng Quốc tế MSA/NDA).
Dựa trên VĂN BẢN HỢP ĐỒNG và BÁO CÁO RỦI RO dưới đây, hãy trả lời câu hỏi của người dùng một cách ngắn gọn, sắc bén, trích dẫn chính xác điều khoản trong hợp đồng và điều luật áp dụng.

=== ĐIỂM AN TOÀN HIỆN TẠI: ${auditReport.safetyScore}/100 (Hạng ${auditReport.grade}) ===
Số điều khoản bẫy phát hiện: ${auditReport.counts.total}

=== VĂN BẢN HỢP ĐỒNG ===
${String(contractText).slice(0, 12000)}

=== CÂU HỎI CỦA NGƯỜI DÙNG ===
${question}`;

    const payload = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.25, maxOutputTokens: 900 }
    });

    const req = https.request(
      {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 12000
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
            const answer = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (res.statusCode < 300 && answer) {
              resolve(answer.trim());
            } else {
              reject(new Error(parsed?.error?.message || `Gemini HTTP ${res.statusCode}`));
            }
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Gemini request timeout'));
    });
    req.write(payload);
    req.end();
  });
}

const INTENT_SYNONYMS = [
  { name: 'PAYMENT_SALARY', keywords: ['lương', 'thanh toán', 'tiền', 'tạm ứng', 'nghiệm thu', 'giữ tiền', 'trả chậm', 'payment', 'invoice', 'net', 'fee', 'salary'] },
  { name: 'PENALTY_LIABILITY', keywords: ['phạt', 'trễ', 'chậm', 'bồi thường', 'thiệt hại', 'lỗi', 'penalty', 'liable', 'liability', 'indemnify', 'damages'] },
  { name: 'DEPOSIT_TERMINATION', keywords: ['cọc', 'đặt cọc', 'nghỉ việc', 'chấm dứt', 'hủy', 'đơn phương', 'lấy lại', 'tăng giá', 'deposit', 'terminate', 'termination', 'cancel', 'renew', 'gia hạn'] },
  { name: 'IP_OWNERSHIP', keywords: ['bản quyền', 'sở hữu trí tuệ', 'mã nguồn', 'thư viện', 'ip', 'intellectual property', 'background', 'code', 'source'] },
  { name: 'NON_COMPETE_NDA', keywords: ['cạnh tranh', 'đối thủ', 'bảo mật', 'bí mật', 'non-compete', 'confidential', 'nda', 'competing'] },
  { name: 'LOAN_COLLATERAL', keywords: ['lãi', 'lãi suất', 'vay', 'thế chấp', 'cầm cố', 'xe', 'bán thanh lý', 'khởi kiện', 'tòa án'] },
  { name: 'REPAIR_FORCE_MAJEURE', keywords: ['sửa chữa', 'hư hỏng', 'thấm dột', 'móng', 'dịch bệnh', 'thiên tai', 'phong tỏa', 'bất khả kháng', 'force majeure'] },
  { name: 'DATA_PRIVACY', keywords: ['dữ liệu', 'cá nhân', 'huấn luyện ai', 'rò rỉ', 'hack', 'privacy', 'data'] }
];

async function answerContractQuestion({ text, question, clauses, auditReport, geminiApiKey }) {
  const cleanQ = String(question || '').trim();
  if (!cleanQ) throw new Error('Vui lòng nhập câu hỏi cần tư vấn.');

  const effectiveKey = String(geminiApiKey || process.env.GEMINI_API_KEY || '').trim();
  if (effectiveKey) {
    try {
      const llmAnswer = await callGeminiCounselApi({
        apiKey: effectiveKey,
        question: cleanQ,
        contractText: text,
        auditReport
      });
      return {
        engine: 'GEMINI_2.5_FLASH_LIVE',
        answer: llmAnswer,
        citedClauses: auditReport.findings.slice(0, 3).map((f) => ({
          section: f.section,
          text: f.flaggedClauseText,
          legalBasis: f.legalBasis
        }))
      };
    } catch (err) {
      // Fall through cleanly to Offline Legal Retrieval Counsel if API key invalid or offline
    }
  }

  // SMART OFFLINE LEGAL RETRIEVAL & STATUTORY REASONER
  const qLower = cleanQ.toLowerCase();
  const expandedTerms = new Set(
    qLower
      .split(/[\s,.;?!()]+/)
      .filter((w) => w.length >= 2)
  );

  for (const group of INTENT_SYNONYMS) {
    if (group.keywords.some((kw) => qLower.includes(kw))) {
      group.keywords.forEach((kw) => expandedTerms.add(kw));
    }
  }

  // Score clauses in the contract
  const scoredClauses = clauses
    .map((c) => {
      const cLow = c.text.toLowerCase();
      let score = 0;
      for (const term of expandedTerms) {
        if (cLow.includes(term)) score += term.includes(' ') ? 5 : 2;
      }
      const linkedFinding = auditReport.findings.find((f) => f.flaggedClauseText === c.text);
      if (linkedFinding && score > 0) score += 6;
      return { clause: c, score, linkedFinding };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const lines = [];
  if (scoredClauses.length === 0) {
    lines.push(
      `📌 **Kết quả rà soát Hợp đồng cho câu hỏi "${cleanQ}":**`,
      `• Hiện tại trong văn bản hợp đồng **chưa có điều khoản nào quy định trực tiếp** về tình huống bạn vừa hỏi (Tổng điểm an toàn hiện tại: **${auditReport.safetyScore}/100 — Hạng ${auditReport.grade}**).`,
      `• **Khuyến nghị Pháp lý:** Vì hợp đồng đang bỏ trống/mơ hồ điểm này, khi xảy ra tranh chấp sẽ phải áp dụng quy định chung của Bộ luật Dân sự 2015 / Luật Thương mại 2005. Bạn nên yêu cầu bổ sung một điều khoản ghi rõ quyền và giới hạn trách nhiệm bằng văn bản trước khi ký!`
    );
  } else {
    lines.push(`⚖️ **Phân Tích Tình Huống Dựa Trên Hợp Đồng Đang Mở:**\n`);
    scoredClauses.forEach((item, idx) => {
      lines.push(`**${idx + 1}. Điều khoản liên quan trực tiếp tại [${item.clause.section}]:**`);
      lines.push(`> *"${item.clause.text}"*`);
      if (item.linkedFinding) {
        lines.push(
          `🚨 **Cảnh báo Bẫy Pháp lý (${item.linkedFinding.severity} — ${item.linkedFinding.legalBasis}):** ${item.linkedFinding.explanation}`
        );
        lines.push(`✅ **Cách bảo vệ quyền lợi của bạn:** Đề nghị sửa điều khoản này thành: *"${item.linkedFinding.safeReplacement}"*\n`);
      } else {
        lines.push(`ℹ️ Điều khoản này hiện không vi phạm trần cấm của pháp luật, nhưng bạn cần lưu giữ chứng từ/email xác nhận khi thực hiện nghĩa vụ.\n`);
      }
    });
  }

  return {
    engine: 'LOCAL_LEGAL_COUNSEL_HYBRID',
    answer: lines.join('\n'),
    citedClauses: scoredClauses.map((s) => ({
      section: s.clause.section,
      text: s.clause.text,
      legalBasis: s.linkedFinding?.legalBasis || 'Đối chiếu văn bản hợp đồng'
    }))
  };
}

// ============================================================================
// 4. 📸 QUÉT ẢNH CHỤP HỢP ĐỒNG GIẤY TẠI CHỖ (LOCAL TESSERACT LSTM + WINRT OCR)
// ============================================================================

let cachedTesseractModule = null;
const SCROLL_OCR_DIR = 'd:\\AI_App\\scroll-ocr-word';

function runWindowsNativeOcr(imagePath) {
  return new Promise((resolve, reject) => {
    const psScript = `
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Foundation, ContentType = WindowsRuntime]

function Await($WinRtTask, $ResultType) {
  $asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation\`1' })[0]
  $asTask = $asTaskGeneric.MakeGenericMethod($ResultType)
  $netTask = $asTask.Invoke($null, @($WinRtTask))
  $netTask.Wait(-1) | Out-Null
  return $netTask.Result
}

$file = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync('${imagePath.replace(/'/g, "''")}')) ([Windows.Storage.StorageFile])
$stream = Await ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
$decoder = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
$bitmap = Await ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
if ($null -eq $engine) {
  $lang = New-Object Windows.Globalization.Language('en-US')
  $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($lang)
}
$result = Await ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Write-Output $result.Text
`;
    execFile('powershell.exe', ['-NoProfile', '-Command', psScript], { timeout: 15000 }, (err, stdout) => {
      if (err) return reject(err);
      resolve(String(stdout || '').trim());
    });
  });
}

async function performContractImageOcr({ base64Data, fileName = 'contract-photo.png', lang = 'vie+eng' }) {
  const cleanB64 = String(base64Data || '').replace(/^data:[^;]+;base64,/, '');
  const imgBuf = Buffer.from(cleanB64, 'base64');
  const ext = path.extname(fileName) || '.png';
  const tempFile = path.join(os.tmpdir(), `contractshield_ocr_${Date.now()}${ext}`);
  fs.writeFileSync(tempFile, imgBuf);

  try {
    // Primary Engine: Local Tesseract LSTM v7.0 with offline Vietnamese + English traineddata
    const tesseractModulePath = path.join(SCROLL_OCR_DIR, 'node_modules', 'tesseract.js');
    if (fs.existsSync(tesseractModulePath) && fs.existsSync(path.join(SCROLL_OCR_DIR, 'vie.traineddata'))) {
      if (!cachedTesseractModule) {
        // eslint-disable-next-line global-require, import/no-dynamic-require
        cachedTesseractModule = require(tesseractModulePath);
      }
      const worker = await cachedTesseractModule.createWorker(lang, 1, {
        langPath: SCROLL_OCR_DIR,
        gzip: false,
        cacheMethod: 'none'
      });
      try {
        const ret = await worker.recognize(tempFile);
        const text = String(ret?.data?.text || '').trim();
        const confidence = Math.round(ret?.data?.confidence || 0);
        await worker.terminate();
        if (text) {
          return {
            engine: 'TESSERACT_LSTM_OFFLINE (vie+eng)',
            confidence,
            text,
            charCount: text.length
          };
        }
      } catch (e) {
        try {
          await worker.terminate();
        } catch {}
      }
    }

    // Fallback Engine: Windows 10/11 Built-in WinRT OcrEngine
    const winText = await runWindowsNativeOcr(tempFile);
    return {
      engine: 'WINDOWS_NATIVE_WINRT_OCR',
      confidence: 88,
      text: winText,
      charCount: winText.length
    };
  } finally {
    try {
      fs.unlinkSync(tempFile);
    } catch {}
  }
}

// ============================================================================
// 5. 🔗 CẦU NỐI TRỰC TIẾP SANG ĐỒ THỊ OMNITRACE OSINT (PORT 4090)
// ============================================================================

function pushPartnerToOmniTrace({ contractTitle, partnerIOCs, safetyScore }) {
  return new Promise((resolve) => {
    const iocPieces = [
      ...(partnerIOCs?.domains || []),
      ...(partnerIOCs?.emails || []),
      ...(partnerIOCs?.phones || []),
      ...(partnerIOCs?.taxIds || []).map((t) => `MST:${t}`),
      ...(partnerIOCs?.bankAccounts || []).map((b) => `STK:${b}`)
    ];

    const payloadText = `ContractShield Due Diligence [${contractTitle} | Safety ${safetyScore}/100]: ${iocPieces.join(' ')}`;
    const bodyBuf = Buffer.from(
      JSON.stringify({
        text: payloadText,
        pushToGraph: true,
        sourceTitle: `ContractShield_${contractTitle.slice(0, 32)}`
      }),
      'utf8'
    );

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 4090,
        path: '/api/osint/ioc',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': bodyBuf.length
        },
        timeout: 3500
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
          } catch {}
          resolve({
            omnitraceOnline: res.statusCode < 400,
            pushedCount: iocPieces.length,
            entities: iocPieces,
            omnitraceResponse: parsed,
            targetUrl: `http://localhost:4090/?query=${encodeURIComponent(iocPieces[0] || 'saokhuetech.vn')}`
          });
        });
      }
    );

    req.on('error', () => {
      resolve({
        omnitraceOnline: false,
        pushedCount: iocPieces.length,
        entities: iocPieces,
        note: 'OmniTrace OSINT (Port 4090) hiện đang tắt — bạn có thể bật 1-Click từ NexusHub (Port 4000)!',
        targetUrl: `http://localhost:4090/?query=${encodeURIComponent(iocPieces[0] || 'saokhuetech.vn')}`
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        omnitraceOnline: false,
        pushedCount: iocPieces.length,
        entities: iocPieces,
        targetUrl: 'http://localhost:4090'
      });
    });

    req.write(bodyBuf);
    req.end();
  });
}

module.exports = {
  simulateFinancialExposure,
  extractObligationTimeline,
  generateIcsCalendar,
  loadCustomPlaybook,
  addPlaybookRule,
  togglePlaybookRule,
  deletePlaybookRule,
  evaluatePlaybookRulesOnClauses,
  answerContractQuestion,
  performContractImageOcr,
  pushPartnerToOmniTrace
};
