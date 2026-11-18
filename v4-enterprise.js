/**
 * 🏛️ ContractShield v4.0 Enterprise CLM Engines
 * 1. ✍️ Cryptographic Ed25519 PKI E-Signature Pad & Verification
 * 2. 📂 Batch Multi-Contract Portfolio Scanner & Excel-Ready UTF-8 BOM .CSV Export
 * 3. 🕵️‍♂️ Redundant Per-Paragraph Zero-Width Unicode Leak Watermarker & Forensic Tracer
 */

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const ESIGN_FILE = path.join(DATA_DIR, 'esign_records.json');
const WATERMARK_FILE = path.join(DATA_DIR, 'leak_watermarks.json');

if (!fs.existsSync(ESIGN_FILE)) fs.writeFileSync(ESIGN_FILE, JSON.stringify([], null, 2), 'utf8');
if (!fs.existsSync(WATERMARK_FILE)) fs.writeFileSync(WATERMARK_FILE, JSON.stringify([], null, 2), 'utf8');

function normalizeCanonical(text) {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

function sha256Hex(str) {
  return crypto.createHash('sha256').update(String(str || ''), 'utf8').digest('hex');
}

// ============================================================================
// 1. ✍️ BÀN KÝ ĐIỆN TỬ & CHỮ KÝ SỐ BẤT ĐỐI XỨNG ED25519 (PKI DIGITAL SIGNATURE)
// ============================================================================

function loadEsignRecords() {
  try {
    return JSON.parse(fs.readFileSync(ESIGN_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveEsignRecords(list) {
  fs.writeFileSync(ESIGN_FILE, JSON.stringify(list.slice(0, 50), null, 2), 'utf8');
}

function signContractEd25519({
  contractText,
  contractTitle = 'Hợp Đồng Pháp Lý',
  signerName = 'Đại diện Hợp pháp',
  signerRole = 'PARTY_B',
  signerEmail = '',
  drawnSignatureDataUrl = ''
}) {
  const canonicalText = normalizeCanonical(contractText);
  if (!canonicalText) {
    throw new Error('Nội dung hợp đồng trống, không thể ký số Ed25519.');
  }

  const documentSha256 = sha256Hex(canonicalText);
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  // Sign exact canonical document digest + contract text so tampering any word invalidates Ed25519 verification
  const payloadToSign = Buffer.from(`CONTRACTSHIELD_ED25519_V4|${documentSha256}|${canonicalText}`, 'utf8');
  const sigBuf = crypto.sign(null, payloadToSign, privateKey);
  const signatureBase64 = sigBuf.toString('base64');
  const signatureHex = sigBuf.toString('hex');

  const pubKeyFingerprint = sha256Hex(publicKey).slice(0, 16).toUpperCase();
  const certCode = `ESIG-${new Date().getFullYear()}-${pubKeyFingerprint.slice(0, 4)}-${pubKeyFingerprint.slice(4, 8)}`;
  const signedAt = new Date().toISOString();

  const executionBlockText = [
    '',
    '====================================================================',
    `CHỨNG THƯ CHỮ KÝ SỐ MẬT MÃ PKI ED25519 (${certCode})`,
    `• Người ký xác thực: ${signerName} (${signerRole})${signerEmail ? ` <${signerEmail}>` : ''}`,
    `• Thời điểm ký số (UTC): ${signedAt}`,
    `• Thuật toán PKI: Ed25519 (RFC 8032 Elliptic Curve Digital Signature)`,
    `• SHA-256 Tài liệu gốc: ${documentSha256}`,
    `• Vân tay Khóa Công Khai (Public Key Fingerprint): ${pubKeyFingerprint}`,
    `• Chữ ký số Ed25519 (Hex): ${signatureHex}`,
    '===================================================================='
  ].join('\n');

  const record = {
    executionId: crypto.randomUUID(),
    certCode,
    contractTitle,
    signerName,
    signerRole,
    signerEmail,
    signedAt,
    algorithm: 'Ed25519 (RFC 8032)',
    documentSha256,
    pubKeyFingerprint,
    publicKeyPem: publicKey,
    signatureBase64,
    signatureHex,
    hasDrawnSignature: Boolean(drawnSignatureDataUrl),
    drawnSignatureDataUrl: drawnSignatureDataUrl ? String(drawnSignatureDataUrl).slice(0, 150000) : '',
    canonicalSnapshot: canonicalText,
    signedContractText: `${String(contractText).trim()}\n${executionBlockText}`
  };

  const all = loadEsignRecords();
  all.unshift(record);
  saveEsignRecords(all);

  return record;
}

function verifyContractEd25519({ certCodeOrId, candidateText, publicKeyPem, signatureBase64 }) {
  const records = loadEsignRecords();
  const stored = certCodeOrId
    ? records.find((r) => r.certCode === certCodeOrId || r.executionId === certCodeOrId)
    : records[0];

  const effPubKey = publicKeyPem || stored?.publicKeyPem;
  const effSigB64 = signatureBase64 || stored?.signatureBase64;
  if (!effPubKey || !effSigB64) {
    throw new Error('Không tìm thấy Khóa công khai (Public Key) hoặc Chữ ký số Ed25519 để xác thực.');
  }

  // Strip appended execution block if user pasted the signed text containing the footer banner
  const cleanedCandidate = String(candidateText || '').split('====================================================================')[0];
  const canonicalCandidate = normalizeCanonical(cleanedCandidate);
  const candidateSha256 = sha256Hex(canonicalCandidate);

  const payloadToVerify = Buffer.from(`CONTRACTSHIELD_ED25519_V4|${candidateSha256}|${canonicalCandidate}`, 'utf8');
  let valid = false;
  try {
    valid = crypto.verify(null, payloadToVerify, effPubKey, Buffer.from(effSigB64, 'base64'));
  } catch {
    valid = false;
  }

  return {
    verifiedAt: new Date().toISOString(),
    valid,
    certCode: stored?.certCode || 'EXTERNAL_PKI_KEY',
    signerName: stored?.signerName || 'External Signer',
    signedAt: stored?.signedAt || null,
    algorithm: 'Ed25519 (RFC 8032)',
    candidateSha256,
    expectedSha256: stored?.documentSha256 || null,
    verdict: valid
      ? '✅ XÁC THỰC CHỮ KÝ SỐ ED25519 HỢP LỆ 100% — Văn bản nguyên vẹn & đúng khóa bí mật của người ký!'
      : '🚨 CẢNH BÁO GIẢ MẠO: Chữ ký số Ed25519 KHÔNG khớp! Nội dung hợp đồng đã bị sửa sau khi ký hoặc chữ ký bị giả mạo.'
  };
}

// ============================================================================
// 2. 📂 QUÉT KIỂM TOÁN HÀNG LOẠT NHIỀU HỢP ĐỒNG (BATCH PORTFOLIO SCANNER & CSV)
// ============================================================================

async function runBatchPortfolioScan({ items, analyzeContractFn, simulateFinancialsFn, extractObligationsFn }) {
  const results = [];

  for (const item of items) {
    const text = String(item.text || '').trim();
    if (!text) continue;

    const audit = analyzeContractFn(text);
    const fin = simulateFinancialsFn(text, { delayDays: 20, loanMonths: 12, triggerEarlyExit: true });
    const timeline = extractObligationsFn(text);
    const criticalNotice = timeline.milestones.find((m) => m.id === 'MS_NOTICE_CUTOFF');

    results.push({
      fileName: item.fileName || 'Untitled_Contract.docx',
      format: item.format || 'TEXT',
      language: audit.detectedLanguage,
      safetyScore: audit.safetyScore,
      grade: audit.grade,
      totalTraps: audit.counts.total,
      criticalTraps: audit.counts.critical,
      highTraps: audit.counts.high,
      currency: fin.params.currency,
      baseAmount: fin.params.baseAmount,
      trapExposure: fin.trapScenario.totalExposure,
      legalSafeMax: fin.legalCapScenario.totalLegalMax,
      potentialSavings: fin.moneySaved,
      endDate: timeline.endDate,
      noticeCutoffDate: criticalNotice ? criticalNotice.date : timeline.endDate,
      topRiskTitle: audit.findings[0]?.title || 'An toàn — Không phát hiện điều khoản bẫy'
    });
  }

  // Sort from lowest safety score (most dangerous) to highest
  results.sort((a, b) => a.safetyScore - b.safetyScore);

  const vndItems = results.filter((r) => r.currency === 'VNĐ');
  const usdItems = results.filter((r) => r.currency === 'USD');

  const summary = {
    totalContracts: results.length,
    criticalContracts: results.filter((r) => r.safetyScore < 50).length,
    safeContracts: results.filter((r) => r.safetyScore >= 80).length,
    averageSafetyScore:
      results.length > 0
        ? Math.round(results.reduce((s, r) => s + r.safetyScore, 0) / results.length)
        : 0,
    totalVndExposure: vndItems.reduce((s, r) => s + r.trapExposure, 0),
    totalVndSavings: vndItems.reduce((s, r) => s + r.potentialSavings, 0),
    totalUsdExposure: usdItems.reduce((s, r) => s + r.trapExposure, 0),
    totalUsdSavings: usdItems.reduce((s, r) => s + r.potentialSavings, 0)
  };

  return { summary, results };
}

function escapeCsvCell(val) {
  const s = String(val ?? '');
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function generateBatchPortfolioCsv(results) {
  const headers = [
    'Xep_Hang_Uu_Tien',
    'Ten_Hop_Dong',
    'Ngon_Ngu',
    'Diem_An_Toan',
    'Hang',
    'Tong_Dieu_Khoan_Bay',
    'Loi_Critical',
    'Tien_Te',
    'Gia_Tri_Hop_Dong',
    'Thiet_Hai_Neu_Ky_Ban_Bay',
    'Tran_Toi_Da_Theo_Luat',
    'So_Tien_Cuu_Duoc',
    'Han_Chot_Bao_Huy_Gia_Han',
    'Ngay_Het_Han',
    'Rui_Ro_Lon_Nhat'
  ];

  const rows = [headers.join(',')];
  results.forEach((r, idx) => {
    rows.push(
      [
        idx + 1,
        r.fileName,
        r.language,
        r.safetyScore,
        r.grade,
        r.totalTraps,
        r.criticalTraps,
        r.currency,
        r.baseAmount,
        r.trapExposure,
        r.legalSafeMax,
        r.potentialSavings,
        r.noticeCutoffDate,
        r.endDate,
        r.topRiskTitle
      ]
        .map(escapeCsvCell)
        .join(',')
    );
  });

  // Prepend UTF-8 BOM (\uFEFF) so Microsoft Excel displays Vietnamese perfectly
  return '\uFEFF' + rows.join('\r\n');
}

// ============================================================================
// 3. 🕵️‍♂️ VÂN TAY VÔ HÌNH TRUY VẾT RÒ RỈ HỢP ĐỒNG MẬT (ZERO-WIDTH LEAK TRACER)
// ============================================================================

const ZW_ZERO = '\u200B'; // Zero-Width Space (bit 0)
const ZW_ONE = '\u200C'; // Zero-Width Non-Joiner (bit 1)
const ZW_FRAME = '\u200D'; // Zero-Width Joiner (packet boundary)

function loadWatermarks() {
  try {
    return JSON.parse(fs.readFileSync(WATERMARK_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveWatermarks(list) {
  fs.writeFileSync(WATERMARK_FILE, JSON.stringify(list.slice(0, 200), null, 2), 'utf8');
}

function crc8(bytes) {
  let crc = 0x00;
  for (const b of bytes) {
    crc ^= b;
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x80 ? ((crc << 1) ^ 0x07) & 0xff : (crc << 1) & 0xff;
    }
  }
  return crc;
}

function encodeTagToZeroWidth(tagHex8) {
  const payloadBytes = Buffer.from(tagHex8, 'hex'); // 4 bytes = 32 bits
  const checksum = crc8(payloadBytes); // 1 byte = 8 bits
  const full5Bytes = Buffer.concat([payloadBytes, Buffer.from([checksum])]); // 40 bits total

  let bits = '';
  for (const byte of full5Bytes) {
    bits += byte.toString(2).padStart(8, '0');
  }

  const zwBody = bits
    .split('')
    .map((b) => (b === '1' ? ZW_ONE : ZW_ZERO))
    .join('');

  return `${ZW_FRAME}${zwBody}${ZW_FRAME}`;
}

function decodeZeroWidthTagsFromText(leakedText) {
  const src = String(leakedText || '');
  const regex = new RegExp(`${ZW_FRAME}([${ZW_ZERO}${ZW_ONE}]{40})${ZW_FRAME}`, 'g');
  const recoveredTags = [];
  let m;

  while ((m = regex.exec(src)) !== null) {
    const bitStr = m[1]
      .split('')
      .map((ch) => (ch === ZW_ONE ? '1' : '0'))
      .join('');

    const bytes = [];
    for (let i = 0; i < 40; i += 8) {
      bytes.push(parseInt(bitStr.slice(i, i + 8), 2));
    }
    const payloadBuf = Buffer.from(bytes.slice(0, 4));
    const expectedCrc = bytes[4];
    if (crc8(payloadBuf) === expectedCrc) {
      recoveredTags.push(payloadBuf.toString('hex').toUpperCase());
    }
  }

  return recoveredTags;
}

function stripExistingZeroWidth(text) {
  return String(text || '').replace(/[\u200B\u200C\u200D]/g, '');
}

function embedInvisibleLeakWatermarks({ contractText, contractTitle = 'Dự Thảo Hợp Đồng Mật', recipients = [] }) {
  const cleanSource = stripExistingZeroWidth(contractText);
  if (!cleanSource.trim()) {
    throw new Error('Nội dung văn bản gốc trống.');
  }

  const validRecipients = recipients.map((r) => String(r || '').trim()).filter(Boolean);
  if (validRecipients.length === 0) {
    throw new Error('Vui lòng nhập ít nhất 1 tên Đối tác / Người nhận bản thảo.');
  }

  const stored = loadWatermarks();
  const generatedCopies = [];

  for (const recipientName of validRecipients) {
    const tagHex8 = crypto.randomBytes(4).toString('hex').toUpperCase();
    const invisiblePacket = encodeTagToZeroWidth(tagHex8);

    // Inject invisible packet after the first space of EVERY non-empty line/paragraph so even a 1-sentence leak is caught!
    const watermarkedLines = cleanSource.split('\n').map((line) => {
      const spaceIdx = line.indexOf(' ');
      if (spaceIdx !== -1 && line.trim().length >= 8) {
        return line.slice(0, spaceIdx) + invisiblePacket + line.slice(spaceIdx);
      }
      return line;
    });

    const watermarkedText = watermarkedLines.join('\n');
    const embeddedParagraphCount = watermarkedLines.filter((l) => l.includes(ZW_FRAME)).length;

    const record = {
      watermarkId: tagHex8,
      recipientName,
      contractTitle,
      createdAt: new Date().toISOString(),
      embeddedParagraphCount
    };
    stored.unshift(record);

    generatedCopies.push({
      ...record,
      watermarkedText,
      visibleCharDiff: 0,
      hiddenZeroWidthChars: watermarkedText.length - cleanSource.length
    });
  }

  saveWatermarks(stored);
  return { copies: generatedCopies };
}

function traceLeakedDocumentSnippet(leakedSnippet) {
  const tags = decodeZeroWidthTagsFromText(leakedSnippet);
  if (tags.length === 0) {
    return {
      found: false,
      verdict: '⚪ Không phát hiện dấu vân tay vô hình (Zero-Width Tag) nào trong đoạn văn bản này.'
    };
  }

  // Count frequency of each valid CRC-verified tag
  const freq = {};
  for (const t of tags) freq[t] = (freq[t] || 0) + 1;
  const topTag = Object.keys(freq).sort((a, b) => freq[b] - freq[a])[0];

  const registry = loadWatermarks();
  const match = registry.find((r) => r.watermarkId === topTag);

  return {
    found: true,
    watermarkId: topTag,
    intactPacketsRecovered: freq[topTag],
    crcVerified: true,
    leakerIdentified: Boolean(match),
    recipientName: match?.recipientName || `Mã định danh chưa lưu tên (#${topTag})`,
    contractTitle: match?.contractTitle || 'Tài liệu Mật',
    issuedAt: match?.createdAt || null,
    verdict: match
      ? `🚨 BẮT TẬN TAY NGUỒN RÒ RỈ: Đoạn văn bản này được trích ra từ bản giao riêng cho "${match.recipientName}" (Mã vân tay #${topTag}, khôi phục ${freq[topTag]} gói tin CRC-8 nguyên vẹn)!`
      : `🚨 Phát hiện mã vân tay vô hình #${topTag} (${freq[topTag]} gói tin hợp lệ)!`
  };
}

module.exports = {
  loadEsignRecords,
  signContractEd25519,
  verifyContractEd25519,
  runBatchPortfolioScan,
  generateBatchPortfolioCsv,
  embedInvisibleLeakWatermarks,
  traceLeakedDocumentSnippet
};
