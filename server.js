/**
 * ⚖️ ContractShield & Redline Studio v3.0 (Port 4175)
 * - Kiểm toán Rủi ro Hợp đồng Pháp lý Song ngữ Việt - Anh + Custom Playbook
 * - Máy Mô phỏng Thiệt hại Tài chính ("What-If Breach & Penalty Simulator")
 * - Trích xuất Lịch Nghĩa vụ & Xuất File Chuông Nhắc Hẹn .ICS (RFC 5545)
 * - Hỏi-Đáp Luật sư AI Trực tiếp (Hybrid Offline Counsel + Live Gemini API)
 * - Quét Ảnh chụp Hợp đồng Giấy tại chỗ (.JPG/.PNG/.WEBP + Webcam OCR vie+eng)
 * - Tự động soạn Email Đàm phán 3 Giọng văn, Niêm phong SHA-256, Redline Diff & PII Vault
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const crypto = require('node:crypto');
const { URL } = require('node:url');
const v3Engines = require('./v3-engines');
const v4Enterprise = require('./v4-enterprise');

const PORT = Number(process.env.PORT || 4175);
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const HISTORY_FILE = path.join(DATA_DIR, 'audit_history.json');
const SEALS_FILE = path.join(DATA_DIR, 'contract_seals.json');

if (!fs.existsSync(HISTORY_FILE)) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify([], null, 2), 'utf8');
}
if (!fs.existsSync(SEALS_FILE)) {
  fs.writeFileSync(SEALS_FILE, JSON.stringify([], null, 2), 'utf8');
}

// ============================================================================
// 1. KHO 6 MẪU HỢP ĐỒNG THỰC TẾ (5 VIỆT NAM + 1 QUỐC TẾ TIẾNG ANH MSA/NDA)
// ============================================================================

const PRESET_CONTRACTS = [
  {
    id: 'labor-nda-trap',
    title: 'Hợp Đồng Lao Động & Cam Kết Bảo Mật (NDA / Non-Compete)',
    language: 'VI',
    category: 'LAO_DONG',
    badge: 'Bẫy Lao Động & Cấm Cạnh Tranh',
    protectParty: 'PARTY_B',
    partyALabel: 'Công ty Cổ phần Công nghệ Sao Khuê (Người sử dụng lao động - Bên A)',
    partyBLabel: 'Ông Nguyễn Minh Quân (Người lao động - Bên B)',
    summary: 'Hợp đồng lao động vị trí Kỹ sư Phần mềm Senior kèm thỏa thuận bảo mật và không cạnh tranh có nhiều điều khoản vượt quá giới hạn của Bộ luật Lao động 2019.',
    originalText: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
---o0o---

HỢP ĐỒNG LAO ĐỘNG & THỎA THUẬN BẢO MẬT (NDA)
Số: 2026/HĐLĐ-SKTECH

Hôm nay, ngày 10 tháng 11 năm 2026, tại TP. Hồ Chí Minh, chúng tôi gồm:

BÊN A (Người sử dụng lao động): CÔNG TY CỔ PHẦN CÔNG NGHỆ SAO KHUÊ
Mã số thuế: 0316894521
Địa chỉ: Tầng 18, Tòa nhà Viettel Complex, 285 Cách Mạng Tháng Tám, Quận 10, TP.HCM
Đại diện: Ông Trần Hoàng Nam - Chức vụ: Tổng Giám đốc
Số điện thoại: 0908123456 - Email: legal@saokhuetech.vn
Số tài khoản: 19036889922019 tại Ngân hàng Techcombank - CN Sài Gòn

BÊN B (Người lao động): Ông NGUYỄN MINH QUÂN
Sinh ngày: 15/08/1997 - Số CCCD: 079097012345
Địa chỉ thường trú: 142 Nguyễn Thị Minh Khai, Phường Võ Thị Sáu, Quận 3, TP.HCM
Số điện thoại: 0987654321 - Email: minhquan.dev@gmail.com
Số tài khoản nhận lương: 0071001239876 tại Ngân hàng Vietcombank

ĐIỀU 1: CÔNG VIỆC, ĐỊA ĐIỂM VÀ THỜI HẠN LÀM VIỆC
1.1. Bên B đảm nhận vị trí Kỹ sư Phần mềm AI (Senior AI Engineer) với thời hạn hợp đồng 24 tháng kể từ ngày 10/11/2026.
1.2. Để đảm bảo cam kết gắn bó lâu dài, Bên A giữ bản gốc Bằng tốt nghiệp Đại học và căn cước công dân của Bên B trong suốt thời gian thực hiện hợp đồng.

ĐIỀU 2: TIỀN LƯƠNG, KHẤU TRỪ LƯƠNG VÀ KỶ LUẬT
2.1. Mức lương chính thức của Bên B là 45.000.000 VNĐ/tháng (Bốn mươi lăm triệu đồng), thanh toán vào ngày 05 hàng tháng.
2.2. Trường hợp Bên B đi làm muộn hoặc bàn giao task chậm tiến độ, Bên A có quyền phạt trừ lương trực tiếp tối đa 50% tiền lương tháng của Bên B mà không cần lập biên bản kỷ luật.

ĐIỀU 3: QUYỀN SỞ HỮU TRÍ TUỆ (IP)
3.1. Toàn bộ mã nguồn, phần mềm, thuật toán và cả các thư viện, công cụ có sẵn của cá nhân Bên B trước khi vào công ty cũng như mọi sáng kiến tạo ra ngoài giờ làm việc trên máy tính cá nhân của Bên B đều thuộc quyền sở hữu độc quyền vô điều kiện của Bên A.

ĐIỀU 4: ĐIỀU KHOẢN CẤM CẠNH TRANH (NON-COMPETE)
4.1. Trong thời gian làm việc và trong vòng 36 tháng (03 năm) sau khi chấm dứt hợp đồng lao động vì bất kỳ lý do gì, Bên B tuyệt đối cấm làm việc cho bất kỳ công ty công nghệ, phần mềm, ngân hàng hoặc tổ chức nào có hoạt động lập trình trên toàn lãnh thổ Việt Nam và Đông Nam Á, đồng thời Bên A không phải chi trả bất kỳ khoản tiền hỗ trợ nào.
4.2. Nếu vi phạm Điều 4.1, Bên B phải nộp khoản phạt vi phạm là 500.000.000 VNĐ (Năm trăm triệu đồng) và bồi thường toàn bộ mọi thiệt hại trực tiếp, gián tiếp không giới hạn cho Bên A.

ĐIỀU 5: ĐƠN PHƯƠNG CHẤM DỨT HỢP ĐỒNG
5.1. Bên A có quyền tự ý chấm dứt hợp đồng bất kỳ lúc nào mà không cần báo trước và không phải bồi thường. Ngược lại, nếu Bên B xin nghỉ việc trước hạn 24 tháng vì bất kỳ lý do gì thì không được nhận lương tháng cuối cùng và phải đền bù 100.000.000 VNĐ chi phí đào tạo.`,
    revisedPartnerText: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
---o0o---

HỢP ĐỒNG LAO ĐỘNG & THỎA THUẬN BẢO MẬT (NDA)
Số: 2026/HĐLĐ-SKTECH

Hôm nay, ngày 10 tháng 11 năm 2026, tại TP. Hồ Chí Minh, chúng tôi gồm:

BÊN A (Người sử dụng lao động): CÔNG TY CỔ PHẦN CÔNG NGHỆ SAO KHUÊ
Mã số thuế: 0316894521
Địa chỉ: Tầng 18, Tòa nhà Viettel Complex, 285 Cách Mạng Tháng Tám, Quận 10, TP.HCM
Đại diện: Ông Trần Hoàng Nam - Chức vụ: Tổng Giám đốc
Số điện thoại: 0908123456 - Email: legal@saokhuetech.vn
Số tài khoản: 19036889922019 tại Ngân hàng Techcombank - CN Sài Gòn

BÊN B (Người lao động): Ông NGUYỄN MINH QUÂN
Sinh ngày: 15/08/1997 - Số CCCD: 079097012345
Địa chỉ thường trú: 142 Nguyễn Thị Minh Khai, Phường Võ Thị Sáu, Quận 3, TP.HCM
Số điện thoại: 0987654321 - Email: minhquan.dev@gmail.com
Số tài khoản nhận lương: 0071001239876 tại Ngân hàng Vietcombank

ĐIỀU 1: CÔNG VIỆC, ĐỊA ĐIỂM VÀ THỜI HẠN LÀM VIỆC
1.1. Bên B đảm nhận vị trí Kỹ sư Phần mềm AI (Senior AI Engineer) với thời hạn hợp đồng 36 tháng kể từ ngày 10/11/2026.
1.2. Để đảm bảo cam kết gắn bó lâu dài, Bên A giữ bản gốc Bằng tốt nghiệp Đại học của Bên B trong suốt thời gian thực hiện hợp đồng.

ĐIỀU 2: TIỀN LƯƠNG, KHẤU TRỪ LƯƠNG VÀ KỶ LUẬT
2.1. Mức lương chính thức của Bên B là 38.000.000 VNĐ/tháng (Ba mươi tám triệu đồng), có thể thanh toán vào ngày 15 hàng tháng tùy tình hình dòng tiền của Bên A.
2.2. Trường hợp Bên B đi làm muộn hoặc bàn giao task chậm tiến độ, Bên A có quyền phạt trừ lương trực tiếp tối đa 60% tiền lương tháng của Bên B mà không cần lập biên bản kỷ luật.

ĐIỀU 3: QUYỀN SỞ HỮU TRÍ TUỆ (IP)
3.1. Toàn bộ mã nguồn, phần mềm, thuật toán và cả các thư viện, công cụ có sẵn của cá nhân Bên B trước khi vào công ty cũng như mọi sáng kiến tạo ra ngoài giờ làm việc trên máy tính cá nhân của Bên B đều thuộc quyền sở hữu độc quyền vô điều kiện của Bên A.

ĐIỀU 4: ĐIỀU KHOẢN CẤM CẠNH TRANH (NON-COMPETE)
4.1. Trong thời gian làm việc và trong vòng 60 tháng (05 năm) sau khi chấm dứt hợp đồng lao động vì bất kỳ lý do gì, Bên B tuyệt đối cấm làm việc cho bất kỳ công ty công nghệ, phần mềm, ngân hàng hoặc tổ chức nào có hoạt động lập trình trên toàn lãnh thổ Việt Nam và Đông Nam Á, đồng thời Bên B tự chịu mọi chi phí sinh hoạt.
4.2. Nếu vi phạm Điều 4.1, Bên B phải nộp khoản phạt vi phạm là 800.000.000 VNĐ (Tám trăm triệu đồng) và bồi thường toàn bộ mọi thiệt hại trực tiếp, gián tiếp không giới hạn cho Bên A.

ĐIỀU 5: ĐƠN PHƯƠNG CHẤM DỨT HỢP ĐỒNG
5.1. Bên A có quyền tự ý chấm dứt hợp đồng bất kỳ lúc nào mà không cần báo trước và không phải bồi thường. Ngược lại, nếu Bên B xin nghỉ việc trước hạn thì phải báo trước 90 ngày, không được nhận lương tháng cuối cùng và phải đền bù 150.000.000 VNĐ chi phí đào tạo.`
  },
  {
    id: 'software-freelance-trap',
    title: 'Hợp Đồng Phát Triển Phần Mềm & Triển Khai AI (Outsource / Freelance)',
    language: 'VI',
    category: 'CONG_NGHE_IT',
    badge: 'Bẫy Scope Creep & Giữ Tiền Nghiệm Thu',
    protectParty: 'PARTY_B',
    partyALabel: 'Công ty TNHH Thương mại Điện tử Hoàng Gia (Khách hàng - Bên A)',
    partyBLabel: 'Studio Giải pháp Phần mềm NexusDev (Đơn vị phát triển - Bên B)',
    summary: 'Hợp đồng làm phần mềm trọn gói có gài bẫy sửa đổi tính năng không giới hạn (Scope Creep), treo tiền nghiệm thu vô thời hạn và phạt chậm tiến độ 5%/ngày vượt trần Luật Thương mại.',
    originalText: `HỢP ĐỒNG DỊCH VỤ PHÁT TRIỂN PHẦN MỀM
Số: 88/2026/HĐPM-HG

Hôm nay, ngày 10 tháng 11 năm 2026, tại Hà Nội, chúng tôi gồm:

BÊN THUÊ DỊCH VỤ (BÊN A): CÔNG TY TNHH THƯƠNG MẠI ĐIỆN TỬ HOÀNG GIA
Mã số thuế: 0109283746
Địa chỉ: Tầng 12, Keangnam Landmark 72, Quận Nam Từ Liêm, Hà Nội
Đại diện: Bà Lê Thu Trang - Giám đốc Điều hành - SĐT: 0912345678

BÊN CUNG CẤP DỊCH VỤ (BÊN B): STUDIO GIẢI PHÁP PHẦN MỀM NEXUSDEV
Mã số thuế: 0110567890
Đại diện: Ông Phạm Quốc Huy - Trưởng nhóm Kỹ thuật - SĐT: 0934567890
Email: huy.pham@nexusdev.vn - STK: 1029384756 tại Ngân hàng ACB

ĐIỀU 1: PHẠM VI CÔNG VIỆC & YÊU CẦU CHỈNH SỬA
1.1. Bên B thực hiện xây dựng Hệ thống Quản lý Kho vận & Dự báo AI cho Bên A với tổng giá trị hợp đồng trọn gói là 300.000.000 VNĐ (Ba trăm triệu đồng).
1.2. Trong quá trình thực hiện và trước khi nghiệm thu, Bên B có nghĩa vụ sửa đổi không giới hạn số lần và bổ sung miễn phí mọi tính năng phát sinh theo yêu cầu của Bên A cho đến khi Bên A hoàn toàn hài lòng.

ĐIỀU 2: TIẾN ĐỘ THANH TOÁN & NGHIỆM THU
2.1. Đợt 1: Bên A tạm ứng 20% (60.000.000 VNĐ) sau khi ký hợp đồng.
2.2. Đợt 2: 80% giá trị còn lại (240.000.000 VNĐ) chỉ được thanh toán sau khi nghiệm thu hoàn tất và hệ thống vận hành không có bất kỳ lỗi nào theo đánh giá chủ quan của Bên A (không quy định thời hạn tối đa Bên A phải ký biên bản nghiệm thu).

ĐIỀU 3: CHUYỂN GIAO BẢN QUYỀN MÃ NGUỒN
3.1. Toàn bộ quyền sở hữu trí tuệ, mã nguồn gốc, cơ sở dữ liệu và cả các thư viện, công cụ có sẵn (Background IP) của Bên B đều chuyển giao cho Bên A ngay tại thời điểm ký hợp đồng bất kể Bên A đã thanh toán đủ hay chưa.

ĐIỀU 4: PHẠT VI PHẠM VÀ BỒI THƯỜNG THIỆT HẠI
4.1. Nếu Bên B bàn giao chậm so với bất kỳ mốc thời gian nào, Bên B chịu phạt chậm tiến độ 5%/ngày trên tổng giá trị hợp đồng và không giới hạn mức phạt tối đa.
4.2. Bên B chịu trách nhiệm bồi thường toàn bộ mọi thiệt hại trực tiếp, gián tiếp và khoản lợi nhuận suy giảm của Bên A không giới hạn mức trần nếu phần mềm gặp sự cố kỹ thuật.`,
    revisedPartnerText: `HỢP ĐỒNG DỊCH VỤ PHÁT TRIỂN PHẦN MỀM
Số: 88/2026/HĐPM-HG

Hôm nay, ngày 10 tháng 11 năm 2026, tại Hà Nội, chúng tôi gồm:

BÊN THUÊ DỊCH VỤ (BÊN A): CÔNG TY TNHH THƯƠNG MẠI ĐIỆN TỬ HOÀNG GIA
Mã số thuế: 0109283746
Địa chỉ: Tầng 12, Keangnam Landmark 72, Quận Nam Từ Liêm, Hà Nội
Đại diện: Bà Lê Thu Trang - Giám đốc Điều hành - SĐT: 0912345678

BÊN CUNG CẤP DỊCH VỤ (BÊN B): STUDIO GIẢI PHÁP PHẦN MỀM NEXUSDEV
Mã số thuế: 0110567890
Đại diện: Ông Phạm Quốc Huy - Trưởng nhóm Kỹ thuật - SĐT: 0934567890
Email: huy.pham@nexusdev.vn - STK: 1029384756 tại Ngân hàng ACB

ĐIỀU 1: PHẠM VI CÔNG VIỆC & YÊU CẦU CHỈNH SỬA
1.1. Bên B thực hiện xây dựng Hệ thống Quản lý Kho vận & Dự báo AI cho Bên A với tổng giá trị hợp đồng trọn gói là 270.000.000 VNĐ (Hai trăm bảy mươi triệu đồng).
1.2. Trong quá trình thực hiện và trong 24 tháng sau nghiệm thu, Bên B bắt buộc sửa đổi không giới hạn số lần và bổ sung miễn phí mọi tính năng phát sinh theo yêu cầu của Bên A cho đến khi Bên A hoàn toàn hài lòng.

ĐIỀU 2: TIẾN ĐỘ THANH TOÁN & NGHIỆM THU
2.1. Đợt 1: Bên A có thể tạm ứng 10% (27.000.000 VNĐ) trong vòng 45 ngày sau khi ký hợp đồng.
2.2. Đợt 2: 90% giá trị còn lại chỉ được thanh toán sau khi nghiệm thu hoàn tất và sau 90 ngày vận hành thực tế không có bất kỳ lỗi nào theo đánh giá chủ quan của Bên A.

ĐIỀU 3: CHUYỂN GIAO BẢN QUYỀN MÃ NGUỒN
3.1. Toàn bộ quyền sở hữu trí tuệ, mã nguồn gốc, cơ sở dữ liệu và cả các thư viện, công cụ có sẵn (Background IP) của Bên B đều chuyển giao cho Bên A ngay tại thời điểm ký hợp đồng bất kể Bên A đã thanh toán đủ hay chưa, đồng thời Bên B không được làm dự án thương mại điện tử cho khách hàng khác.

ĐIỀU 4: PHẠT VI PHẠM VÀ BỒI THƯỜNG THIỆT HẠI
4.1. Nếu Bên B bàn giao chậm so với bất kỳ mốc thời gian nào, Bên B chịu phạt chậm tiến độ 8%/ngày trên tổng giá trị hợp đồng và không giới hạn mức phạt tối đa.
4.2. Bên B chịu trách nhiệm bồi thường toàn bộ mọi thiệt hại trực tiếp, gián tiếp và khoản lợi nhuận suy giảm của Bên A không giới hạn mức trần nếu phần mềm gặp sự cố kỹ thuật.`
  },
  {
    id: 'house-lease-trap',
    title: 'Hợp Đồng Thuê Nhà / Mặt Bằng Kinh Doanh',
    language: 'VI',
    category: 'BAT_DONG_SAN',
    badge: 'Bẫy Mất Cọc & Tăng Giá Thuê Tự Ý',
    protectParty: 'PARTY_B',
    partyALabel: 'Ông Đặng Văn Phú (Chủ nhà / Bên cho thuê - Bên A)',
    partyBLabel: 'Bà Vũ Ngọc Lan (Bên thuê mặt bằng - Bên B)',
    summary: 'Hợp đồng thuê mặt bằng kinh doanh cài điều khoản chủ nhà tăng giá tùy ý, mất 100% cọc nếu nộp tiền trễ 2 ngày, tự động gia hạn 24 tháng và bắt người thuê chịu chi phí sửa chữa kết cấu tòa nhà.',
    originalText: `HỢP ĐỒNG THUÊ MẶT BẰNG KINH DOANH
Số: 15/2026/HĐTMB

Hôm nay, ngày 10 tháng 11 năm 2026, tại Quận 1, TP. Hồ Chí Minh:

BÊN CHO THUÊ (BÊN A): Ông ĐẶNG VĂN PHÚ
Số CCCD: 079065009988 - SĐT: 0903888999
Địa chỉ: 88 Lý Tự Trọng, Phường Bến Thành, Quận 1, TP.HCM
Số tài khoản: 0501000888999 tại Ngân hàng Sacombank

BÊN THUÊ (BÊN B): Bà VŨ NGỌC LAN
Số CCCD: 079194005566 - SĐT: 0977111222 - Email: ngoclan.coffee@gmail.com
Địa chỉ: 25B Điện Biên Phủ, Quận Bình Thạnh, TP.HCM

ĐIỀU 1: GIÁ THUÊ VÀ ĐIỀU CHỈNH GIÁ
1.1. Giá thuê mặt bằng tầng trệt tại số 88 Lý Tự Trọng là 35.000.000 VNĐ/tháng. Thời hạn thuê là 24 tháng.
1.2. Trong thời gian thuê, Bên A có quyền tăng giá thuê bất kỳ lúc nào theo biến động thị trường mà không giới hạn mức trần tăng giá. Nếu Bên B không đồng ý mức giá mới thì xem như Bên B tự ý hủy hợp đồng và mất toàn bộ tiền cọc.

ĐIỀU 2: TIỀN ĐẶT CỌC VÀ THANH TOÁN
2.1. Bên B đặt cọc cho Bên A số tiền 140.000.000 VNĐ (tương đương 04 tháng tiền thuê).
2.2. Tiền thuê thanh toán từ ngày 01 đến ngày 03 hàng tháng. Nếu Bên B thanh toán chậm quá 02 ngày vì bất kỳ lý do gì, Bên A có quyền khóa cửa mặt bằng ngay lập tức, chấm dứt hợp đồng và tịch thu 100% tiền đặt cọc.

ĐIỀU 3: SỬA CHỮA KẾT CẤU VÀ BẤT KHẢ KHÁNG
3.1. Bên B phải tự bỏ toàn bộ chi phí sửa chữa mọi hư hỏng của tòa nhà bao gồm cả sụt lún nền móng, thấm dột mái nhà và hệ thống kết cấu chịu lực đã xuống cấp từ trước.
3.2. Trường hợp mặt bằng bị cơ quan nhà nước phong tỏa, giải tỏa hoặc xảy ra thiên tai, dịch bệnh (Bất khả kháng), Bên B vẫn phải thanh toán đủ 100% tiền thuê hàng tháng và điều khoản bất khả kháng chỉ áp dụng cho Bên A.

ĐIỀU 4: GIA HẠN TỰ ĐỘNG VÀ LẤY LẠI MẶT BẰNG
4.1. Khi hết hạn hợp đồng, nếu Bên B không gửi văn bản thông báo chấm dứt trước ít nhất 90 ngày thì hợp đồng sẽ tự động gia hạn thêm 24 tháng với mức giá thuê tăng thêm 35%.
4.2. Bên A có quyền lấy lại mặt bằng bất kỳ lúc nào chỉ cần báo trước 03 ngày và chỉ trả lại đúng số tiền cọc gốc mà không phải bồi thường chi phí đầu tư nội thất của Bên B.`,
    revisedPartnerText: `HỢP ĐỒNG THUÊ MẶT BẰNG KINH DOANH
Số: 15/2026/HĐTMB

Hôm nay, ngày 10 tháng 11 năm 2026, tại Quận 1, TP. Hồ Chí Minh:

BÊN CHO THUÊ (BÊN A): Ông ĐẶNG VĂN PHÚ
Số CCCD: 079065009988 - SĐT: 0903888999
Địa chỉ: 88 Lý Tự Trọng, Phường Bến Thành, Quận 1, TP.HCM
Số tài khoản: 0501000888999 tại Ngân hàng Sacombank

BÊN THUÊ (BÊN B): Bà VŨ NGỌC LAN
Số CCCD: 079194005566 - SĐT: 0977111222 - Email: ngoclan.coffee@gmail.com
Địa chỉ: 25B Điện Biên Phủ, Quận Bình Thạnh, TP.HCM

ĐIỀU 1: GIÁ THUÊ VÀ ĐIỀU CHỈNH GIÁ
1.1. Giá thuê mặt bằng tầng trệt tại số 88 Lý Tự Trọng là 40.000.000 VNĐ/tháng (chưa bao gồm thuế). Thời hạn thuê là 36 tháng.
1.2. Trong thời gian thuê, Bên A có quyền tăng giá thuê bất kỳ lúc nào theo biến động thị trường mà không giới hạn mức trần tăng giá. Nếu Bên B không đồng ý mức giá mới thì xem như Bên B tự ý hủy hợp đồng và mất toàn bộ tiền cọc.

ĐIỀU 2: TIỀN ĐẶT CỌC VÀ THANH TOÁN
2.1. Bên B đặt cọc cho Bên A số tiền 240.000.000 VNĐ (tương đương 06 tháng tiền thuê).
2.2. Tiền thuê thanh toán vào ngày 01 hàng tháng. Nếu Bên B thanh toán chậm quá 01 ngày vì bất kỳ lý do gì, Bên A có quyền cắt điện nước, khóa cửa mặt bằng ngay lập tức, chấm dứt hợp đồng và tịch thu 100% tiền đặt cọc.

ĐIỀU 3: SỬA CHỮA KẾT CẤU VÀ BẤT KHẢ KHÁNG
3.1. Bên B phải tự bỏ toàn bộ chi phí sửa chữa mọi hư hỏng của tòa nhà bao gồm cả sụt lún nền móng, thấm dột mái nhà và hệ thống kết cấu chịu lực đã xuống cấp từ trước.
3.2. Trường hợp mặt bằng bị cơ quan nhà nước phong tỏa, giải tỏa hoặc xảy ra thiên tai, dịch bệnh (Bất khả kháng), Bên B vẫn bắt buộc thanh toán đủ 100% tiền thuê hàng tháng và điều khoản bất khả kháng chỉ áp dụng cho Bên A.

ĐIỀU 4: GIA HẠN TỰ ĐỘNG VÀ LẤY LẠI MẶT BẰNG
4.1. Khi hết hạn hợp đồng, nếu Bên B không gửi văn bản thông báo chấm dứt trước ít nhất 120 ngày thì hợp đồng sẽ tự động gia hạn thêm 36 tháng với mức giá thuê tăng thêm 50%.
4.2. Bên A có quyền lấy lại mặt bằng bất kỳ lúc nào mà không cần báo trước và chỉ trả lại 50% số tiền cọc gốc mà không phải bồi thường chi phí đầu tư nội thất của Bên B.`
  },
  {
    id: 'loan-pledge-trap',
    title: 'Hợp Đồng Vay Tiền & Thế Chấp Tài Sản Dân Sự',
    language: 'VI',
    category: 'TAI_CHINH_DAN_SU',
    badge: 'Bẫy Lãi Suất Vượt Trần 20%/Năm & Tự Ý Siết Nợ',
    protectParty: 'PARTY_B',
    partyALabel: 'Ông Bùi Trọng Nghĩa (Bên cho vay - Bên A)',
    partyBLabel: 'Ông Lê Hoàng Khang (Bên vay - Bên B)',
    summary: 'Hợp đồng vay vốn dân sự gài lãi suất 3.5%/tháng (42%/năm - vượt trần Điều 468 Bộ luật Dân sự 2015), phạt lãi chồng lãi và tự ý đoạt quyền sở hữu xe ô tô thế chấp không qua đấu giá.',
    originalText: `HỢP ĐỒNG VAY TIỀN & CẦM CỐ TÀI SẢN
Số: 09/2026/HĐVT

Hôm nay, ngày 10 tháng 11 năm 2026, chúng tôi gồm:

BÊN CHO VAY (BÊN A): Ông BÙI TRỌNG NGHĨA
Số CCCD: 001082003344 - SĐT: 0918222333
Địa chỉ: 56 Trần Duy Hưng, Quận Cầu Giấy, Hà Nội

BÊN VAY (BÊN B): Ông LÊ HOÀNG KHANG
Số CCCD: 001095007788 - SĐT: 0966555444
Địa chỉ: 19 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội

ĐIỀU 1: SỐ TIỀN VAY VÀ LÃI SUẤT
1.1. Bên A cho Bên B vay số tiền là 500.000.000 VNĐ (Năm trăm triệu đồng chẵn) trong thời hạn 12 tháng.
1.2. Lãi suất vay thỏa thuận là 3.5%/tháng (tương đương 42%/năm), tiền lãi trả vào ngày 10 hàng tháng.
1.3. Nếu Bên B chậm trả lãi quá 03 ngày, số tiền lãi chậm trả sẽ được cộng dồn vào nợ gốc để tính lãi kép với mức lãi phạt quá hạn là 0.3%/ngày (tương đương 108%/năm).

ĐIỀU 2: PHÍ PHẠT TRẢ NỢ TRƯỚC HẠN
2.1. Trường hợp Bên B muốn tất toán khoản vay trước thời hạn 12 tháng, Bên B bắt buộc phải nộp phí phạt trả nợ trước hạn bằng 20% tổng số tiền vay gốc (100.000.000 VNĐ) cộng toàn bộ tiền lãi của những tháng còn lại.

ĐIỀU 3: XỬ LÝ TÀI SẢN BẢO ĐẢM & TỪ BỎ QUYỀN KHỞI KIỆN
3.1. Để bảo đảm khoản vay, Bên B giao chiếc xe ô tô Mazda CX-5 (BKS: 30K-889.99) kèm giấy đăng ký gốc cho Bên A. Nếu Bên B chậm trả gốc hoặc lãi dù chỉ 01 kỳ, Bên A có toàn quyền tự ý sang tên hoặc bán thanh lý chiếc xe với bất kỳ giá nào mà không cần định giá hay đấu giá, và Bên B không được nhận lại phần tiền chênh lệch.
3.2. Bên B cam kết từ bỏ quyền khiếu nại và từ bỏ quyền khởi kiện tại Tòa án nhân dân trong mọi trường hợp xảy ra tranh chấp.`,
    revisedPartnerText: `HỢP ĐỒNG VAY TIỀN & CẦM CỐ TÀI SẢN
Số: 09/2026/HĐVT

Hôm nay, ngày 10 tháng 11 năm 2026, chúng tôi gồm:

BÊN CHO VAY (BÊN A): Ông BÙI TRỌNG NGHĨA
Số CCCD: 001082003344 - SĐT: 0918222333
Địa chỉ: 56 Trần Duy Hưng, Quận Cầu Giấy, Hà Nội

BÊN VAY (BÊN B): Ông LÊ HOÀNG KHANG
Số CCCD: 001095007788 - SĐT: 0966555444
Địa chỉ: 19 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội

ĐIỀU 1: SỐ TIỀN VAY VÀ LÃI SUẤT
1.1. Bên A cho Bên B vay số tiền là 500.000.000 VNĐ (Năm trăm triệu đồng chẵn) trong thời hạn 06 tháng.
1.2. Lãi suất vay thỏa thuận là 4.5%/tháng (tương đương 54%/năm), tiền lãi trả vào ngày 05 hàng tháng.
1.3. Nếu Bên B chậm trả lãi quá 01 ngày, số tiền lãi chậm trả sẽ được cộng dồn vào nợ gốc để tính lãi kép với mức lãi phạt quá hạn là 0.5%/ngày.

ĐIỀU 2: PHÍ PHẠT TRẢ NỢ TRƯỚC HẠN
2.1. Trường hợp Bên B muốn tất toán khoản vay trước thời hạn, Bên B bắt buộc phải nộp phí phạt trả nợ trước hạn bằng 30% tổng số tiền vay gốc (150.000.000 VNĐ) cộng toàn bộ tiền lãi của những tháng còn lại.

ĐIỀU 3: XỬ LÝ TÀI SẢN BẢO ĐẢM & TỪ BỎ QUYỀN KHỞI KIỆN
3.1. Để bảo đảm khoản vay, Bên B giao chiếc xe ô tô Mazda CX-5 (BKS: 30K-889.99) kèm giấy đăng ký gốc cho Bên A. Nếu Bên B chậm trả gốc hoặc lãi dù chỉ 01 kỳ, Bên A có toàn quyền tự ý sang tên hoặc bán thanh lý chiếc xe với bất kỳ giá nào mà không cần định giá hay đấu giá, và Bên B không được nhận lại phần tiền chênh lệch.
3.2. Bên B cam kết từ bỏ quyền khiếu nại và từ bỏ quyền khởi kiện tại Tòa án nhân dân trong mọi trường hợp xảy ra tranh chấp.`
  },
  {
    id: 'saas-privacy-trap',
    title: 'Điều Khoản Dịch Vụ Cloud SaaS & Xử Lý Dữ Liệu Cá Nhân AI',
    language: 'VI',
    category: 'DU_LIEU_AI',
    badge: 'Bẫy Thu Thập Dữ Liệu Huấn Luyện AI & Miễn Trừ Rò Rỉ',
    protectParty: 'PARTY_B',
    partyALabel: 'Công ty CloudAI Global (Nhà cung cấp nền tảng - Bên A)',
    partyBLabel: 'Doanh nghiệp Khách hàng sử dụng dịch vụ (Bên B)',
    summary: 'Hợp đồng cung cấp dịch vụ Cloud/AI có điều khoản lấy toàn bộ dữ liệu mật và dữ liệu cá nhân của khách hàng để huấn luyện mô hình AI thương mại và miễn trừ hoàn toàn trách nhiệm khi bị hack rò rỉ dữ liệu.',
    originalText: `THỎA THUẬN CUNG CẤP DỊCH VỤ ĐIỆN TOÁN ĐÁM MÂY & AI (MSA)
Số: 2026/MSA-CLOUDAI

BÊN CUNG CẤP (BÊN A): CÔNG TY TNHH CLOUDAI VIỆT NAM (MST: 0319988776)
BÊN SỬ DỤNG (BÊN B): CÔNG TY CỔ PHẦN Y TẾ ĐA KHOA TÂM ĐỨC (MST: 0314455667)
Người đại diện Bên B: Bác sĩ Ngô Thanh Tùng - SĐT: 0945112233 - Email: tung.ngo@tamducmed.vn

ĐIỀU 1: QUYỀN KHAI THÁC DỮ LIỆU & HUẤN LUYỆN MÔ HÌNH AI
1.1. Bằng việc sử dụng nền tảng, Bên B cấp cho Bên A quyền vĩnh viễn, không thể hủy ngang để toàn quyền sử dụng dữ liệu khách hàng, hồ sơ bệnh án, tài liệu nội bộ của Bên B nhằm huấn luyện AI thương mại và chia sẻ dữ liệu cho bên thứ ba hoặc đối tác quảng cáo mà không cần xin phép.

ĐIỀU 2: BẢO MẬT & MIỄN TRỪ TRÁCH NHIỆM KHI RÒ RỈ DỮ LIỆU
2.1. Trường hợp hệ thống của Bên A bị tấn công mạng, rò rỉ dữ liệu cá nhân hoặc mất mát toàn bộ cơ sở dữ liệu của Bên B, Bên A được miễn trừ mọi trách nhiệm pháp lý và không phải bồi thường bất kỳ khoản tiền nào.

ĐIỀU 3: TỰ ĐỘNG GIA HẠN & KHÓA TÀI KHOẢN
3.1. Phí dịch vụ là 120.000.000 VNĐ/năm. Hợp đồng sẽ tự động gia hạn thêm 24 tháng nếu Bên B không gửi thông báo hủy trước ít nhất 90 ngày.
3.2. Bên A có quyền khóa tài khoản và xóa dữ liệu của Bên B bất kỳ lúc nào mà không cần báo trước và không hoàn trả phí dịch vụ đã đóng.`
  },
  {
    id: 'en-global-msa-trap',
    title: '🌐 International Software Contractor MSA & NDA (English Contract)',
    language: 'EN',
    category: 'INTERNATIONAL_EN',
    badge: 'Global MSA / NDA Traps (English)',
    protectParty: 'PARTY_B',
    partyALabel: 'Apex Global Ventures Inc. (Client - Party A)',
    partyBLabel: 'Vietnam AI Engineering Studio (Contractor - Party B)',
    summary: 'Hợp đồng Gia công Phần mềm & Bảo mật Quốc tế bằng Tiếng Anh chứa 6 điều khoản bẫy điển hình: Bồi thường vô hạn (Uncapped Indemnification), Chiếm đoạt Background IP, Thanh toán Net 120 / Pay-when-paid và Cấm cạnh tranh toàn cầu 3 năm.',
    originalText: `MASTER SOFTWARE SERVICES AGREEMENT & NDA
Contract Ref: MSA-2026-APEX-VN

This Master Services Agreement ("Agreement") is entered into on November 18, 2026 by and between:
CLIENT (Party A): Apex Global Ventures Inc., located at 400 Market Street, San Francisco, CA, Email: legal@apexventures.io
CONTRACTOR (Party B): Minh Quan Engineering Co., Email: contact@minhquan.ai, Phone: +84987654321

ARTICLE 1: PAYMENT TERMS & SUBJECTIVE ACCEPTANCE
1.1. Client agrees to pay Contractor a total fee of $48,000 USD. Invoices shall be payable on Net 120 days terms, strictly on a pay-when-paid basis after Client receives payment from its end customer, and deliverables shall only be accepted at Client's sole and absolute discretion.

ARTICLE 2: INTELLECTUAL PROPERTY & BACKGROUND IP GRAB
2.1. Contractor hereby irrevocably assigns to Client all rights, title, and interest in all deliverables as well as all pre-existing tools, libraries, frameworks, and background intellectual property owned by Contractor prior to this Agreement, effective immediately upon signing regardless of whether payment has been made.

ARTICLE 3: ONE-SIDED INDEMNIFICATION & UNCAPPED LIABILITY
3.1. Contractor shall indemnify, defend, and hold harmless Client from any and all claims, liabilities, losses, and legal fees of any kind without limitation.
3.2. Contractor shall be liable for all direct, indirect, incidental, punitive, and consequential damages including lost profits without any liability cap.

ARTICLE 4: GLOBAL NON-COMPETE & UNILATERAL TERMINATION
4.1. During the term and for a period of 3 years following termination, Contractor shall not engage in any competing business or provide software services to any technology company worldwide.
4.2. Client may terminate immediately without cause and without payment for work already performed in progress. Confidentiality obligations under this Agreement shall survive in perpetuity without exception.`,
    revisedPartnerText: `MASTER SOFTWARE SERVICES AGREEMENT & NDA
Contract Ref: MSA-2026-APEX-VN

This Master Services Agreement ("Agreement") is entered into on November 18, 2026 by and between:
CLIENT (Party A): Apex Global Ventures Inc., located at 400 Market Street, San Francisco, CA, Email: legal@apexventures.io
CONTRACTOR (Party B): Minh Quan Engineering Co., Email: contact@minhquan.ai, Phone: +84987654321

ARTICLE 1: PAYMENT TERMS & SUBJECTIVE ACCEPTANCE
1.1. Client may pay Contractor a total fee of $42,000 USD. Invoices shall be payable on Net 150 days terms, strictly on a pay-when-paid basis after Client receives payment from its end customer, and deliverables shall only be accepted at Client's sole and absolute discretion.

ARTICLE 2: INTELLECTUAL PROPERTY & BACKGROUND IP GRAB
2.1. Contractor hereby irrevocably assigns to Client all rights, title, and interest in all deliverables as well as all pre-existing tools, libraries, frameworks, and background intellectual property owned by Contractor prior to this Agreement, effective immediately upon signing regardless of whether payment has been made.

ARTICLE 3: ONE-SIDED INDEMNIFICATION & UNCAPPED LIABILITY
3.1. Contractor shall indemnify, defend, and hold harmless Client from any and all claims, liabilities, losses, and legal fees of any kind without limitation.
3.2. Contractor shall be liable for all direct, indirect, incidental, punitive, and consequential damages including lost profits without any liability cap.

ARTICLE 4: GLOBAL NON-COMPETE & UNILATERAL TERMINATION
4.1. During the term and for a period of 5 years following termination, Contractor shall not engage in any competing business or provide software services to any technology company worldwide.
4.2. Client may terminate immediately without cause and without payment for work already performed in progress, and Contractor shall refund 50% of prior fees. Confidentiality obligations under this Agreement shall survive in perpetuity without exception.`
  }
];

// ============================================================================
// 2. BỘ 22 QUY TẮC KIỂM TOÁN RỦI RO SONG NGỮ VIỆT - ANH (14 VN + 8 INTERNATIONAL EN)
// ============================================================================

const LEGAL_AUDIT_RULES = [
  // --- A. QUY TẮC HỢP ĐỒNG VIỆT NAM (14 RULES) ---
  {
    id: 'USURY_INTEREST_CAP',
    lang: 'VI',
    title: 'Lãi suất vay / lãi phạt vượt trần pháp định 20%/năm',
    category: 'TÀI CHÍNH & LÃI SUẤT',
    severity: 'CRITICAL',
    scorePenalty: 28,
    legalBasis: 'Điều 468 Bộ luật Dân sự 2015 & Nghị quyết 01/2019/NQ-HĐTP',
    patterns: [
      /lãi suất[^.;\n]{0,60}(?<![0-9.,])([2-9](?:[.,]\d+)?\s*%\/tháng|[1-9]\d\s*%\/tháng|(?:2[1-9]|[3-9]\d|\d{3})\s*%\/năm|0[.,][1-9]\s*%\/ngày|[1-9]\s*%\/ngày)/i,
      /lãi kép|cộng dồn vào nợ gốc để tính lãi/i
    ],
    explanation:
      'Khoản 1 Điều 468 Bộ luật Dân sự 2015 quy định lãi suất vay theo thỏa thuận KHÔNG được vượt quá 20%/năm (tương đương ~1,66%/tháng) của khoản tiền vay. Mức lãi suất vượt quá và việc tính lãi chồng lãi (lãi kép trái phép) sẽ bị Tòa án tuyên vô hiệu phần vượt quá.',
    recommendation:
      'Hạ mức lãi suất trong hạn xuống tối đa không quá 20%/năm (≤ 1,66%/tháng), lãi suất quá hạn tối đa bằng 150% lãi suất trong hạn theo đúng Điều 468 Bộ luật Dân sự 2015.',
    safeReplacement:
      'Lãi suất vay thỏa thuận là 1,5%/tháng (tương đương 18%/năm, tuân thủ trần lãi suất 20%/năm tại Điều 468 Bộ luật Dân sự 2015). Trường hợp chậm trả gốc, lãi suất quá hạn bằng 150% lãi suất trong hạn tính trên số tiền gốc chậm trả tương ứng với thời gian chậm trả.'
  },
  {
    id: 'ILLEGAL_SALARY_DEDUCTION_OR_ID_RETENTION',
    lang: 'VI',
    title: 'Giữ giấy tờ tùy thân / Bằng cấp gốc hoặc Phạt trừ lương trái Bộ luật Lao động',
    category: 'LAO ĐỘNG & TIỀN LƯƠNG',
    severity: 'CRITICAL',
    scorePenalty: 25,
    legalBasis: 'Điều 17, Điều 102 & Điều 128 Bộ luật Lao động 2019',
    patterns: [
      /giữ bản gốc[^.;\n]{0,80}(bằng|căn cước|cccd|cmnd|giấy tờ)/i,
      /phạt trừ lương|khấu trừ\s*(?:[3-9]\d|100)\s*%\s*(?:tiền\s*)?lương|không được nhận lương tháng cuối/i
    ],
    explanation:
      'Khoản 1 Điều 17 Bộ luật Lao động 2019 nghiêm cấm người sử dụng lao động giữ bản chính giấy tờ tùy thân, văn bằng, chứng chỉ của người lao động. Đồng thời, Điều 128 nghiêm cấm dùng hình thức phạt tiền, cắt lương thay việc xử lý kỷ luật lao động; Điều 102 chỉ cho phép khấu trừ bồi thường thiệt hại vật chất tối đa không quá 30% tiền lương thực nhận hàng tháng.',
    recommendation:
      'Xóa bỏ hoàn toàn quy định giữ bản gốc văn bằng/CCCD và xóa bỏ quy định phạt trừ lương trực tiếp hoặc tịch thu lương tháng cuối.',
    safeReplacement:
      'Bên A chỉ đối chiếu bản sao chứng thực văn bằng, CCCD khi tiếp nhận nhân sự (không giữ bản chính giấy tờ theo Điều 17 Bộ luật Lao động 2019). Mọi việc đánh giá hiệu suất hoặc xử lý kỷ luật lao động được thực hiện theo Nội quy lao động đã đăng ký và tuân thủ Điều 102, Điều 128 Bộ luật Lao động 2019.'
  },
  {
    id: 'EXCESSIVE_PENALTY_CAP',
    lang: 'VI',
    title: 'Mức phạt vi phạm hợp đồng vượt trần 8% (Thương mại) hoặc phạt lũy tiến không giới hạn trần',
    category: 'PHẠT VI PHẠM & BỒI THƯỜNG',
    severity: 'CRITICAL',
    scorePenalty: 22,
    legalBasis: 'Điều 301 Luật Thương mại 2005 & Điều 418 Bộ luật Dân sự 2015',
    patterns: [
      /phạt[^.;\n]{0,60}(?<![0-9.,])([2-9]\s*%\/ngày|[1-9]\d\s*%\/ngày|không giới hạn mức phạt)/i,
      /phạt vi phạm[^.;\n]{0,60}(?<![0-9.,])([3-9]00\.000\.000|800\.000\.000|1\.000\.000\.000)/i,
      /phạt trả nợ trước hạn[^.;\n]{0,60}(?<![0-9.,])([1-9]\d\s*%)/i
    ],
    explanation:
      'Theo Điều 301 Luật Thương mại 2005, mức phạt đối với vi phạm nghĩa vụ hợp đồng thương mại KHÔNG quá 8% giá trị phần nghĩa vụ hợp đồng bị vi phạm. Việc quy định phạt 5%/ngày không giới hạn trần hoặc phạt hàng trăm triệu đồng bất tương xứng sẽ gây rủi ro tài chính cực lớn.',
    recommendation:
      'Giới hạn mức phạt chậm tiến độ ở mức 0,05%/ngày - 0,1%/ngày và tổng mức phạt tối đa không vượt quá 8% giá trị phần nghĩa vụ bị vi phạm.',
    safeReplacement:
      'Trường hợp một Bên chậm thực hiện nghĩa vụ do lỗi chủ quan của mình sau khi đã có văn bản gia hạn hợp lý, Bên vi phạm chịu mức phạt 0,05%/ngày tính trên giá trị phần nghĩa vụ bị chậm trễ, nhưng tổng mức phạt tối đa không vượt quá 8% giá trị phần nghĩa vụ bị vi phạm theo Điều 301 Luật Thương mại 2005.'
  },
  {
    id: 'OVERBROAD_NON_COMPETE',
    lang: 'VI',
    title: 'Điều khoản Cấm cạnh tranh (Non-Compete) quá rộng về thời gian (3-5 năm), lãnh thổ & không có hỗ trợ tài chính',
    category: 'LAO ĐỘNG & BẢO MẬT',
    severity: 'HIGH',
    scorePenalty: 20,
    legalBasis: 'Điều 10 Bộ luật Lao động 2019 & Điều 35 Hiến pháp 2013',
    patterns: [
      /cấm làm việc cho bất kỳ công ty/i,
      /(?:36|60)\s*tháng\s*(?:\(\s*0?[35]\s*năm\s*\))?\s*sau khi chấm dứt/i,
      /trên toàn lãnh thổ việt nam[^.;\n]{0,80}không phải chi trả bất kỳ khoản tiền hỗ trợ/i
    ],
    explanation:
      'Điều khoản cấm người lao động làm việc cho bất kỳ công ty công nghệ/ngân hàng nào trên toàn quốc trong 3-5 năm mà không có khoản bù đắp tài chính xâm phạm nghiêm trọng quyền tự do việc làm (Điều 10 BLLĐ 2019).',
    recommendation:
      'Thu hẹp phạm vi chỉ áp dụng với danh sách tối đa 3-5 đối thủ cạnh tranh trực tiếp trong mảng sản phẩm cốt lõi, thời hạn tối đa 06 - 12 tháng và Bên A phải trả khoản hỗ trợ tối thiểu 50% mức lương bình quân/tháng trong thời gian hạn chế.',
    safeReplacement:
      'Trong vòng 06 tháng kể từ ngày chấm dứt hợp đồng, Bên B cam kết không trực tiếp mang bí mật kinh doanh của Bên A sang làm việc ở vị trí tương đương tại tối đa 03 đối thủ cạnh tranh trực tiếp được liệt kê cụ thể tại Phụ lục đính kèm, với điều kiện Bên A chi trả khoản hỗ trợ 50% mức lương cơ bản hàng tháng cho Bên B trong suốt thời gian hạn chế này.'
  },
  {
    id: 'UNLIMITED_SCOPE_CREEP',
    lang: 'VI',
    title: 'Bẫy sửa đổi không giới hạn số lần & bổ sung tính năng miễn phí (Scope Creep)',
    category: 'PHẠM VI CÔNG VIỆC',
    severity: 'HIGH',
    scorePenalty: 18,
    legalBasis: 'Điều 513 & Điều 519 Bộ luật Dân sự 2015 (Hợp đồng dịch vụ)',
    patterns: [
      /sửa đổi không giới hạn số lần/i,
      /bổ sung miễn phí mọi tính năng phát sinh/i,
      /cho đến khi bên a hoàn toàn hài lòng/i
    ],
    explanation:
      'Cụm từ "sửa đổi không giới hạn số lần", "bổ sung miễn phí mọi tính năng phát sinh" và "đến khi hoàn toàn hài lòng" là bẫy kinh điển khiến dự án kéo dài vô tận mà không được nhận tiền nghiệm thu.',
    recommendation:
      'Giới hạn rõ số vòng chỉnh sửa (tối đa 02 - 03 vòng dựa trên tài liệu đặc tả SRS đã chốt). Mọi tính năng nằm ngoài SRS ban đầu phải được lập thành Phụ lục Yêu cầu Thay đổi (Change Request - CR) có tính phí và gia hạn thời gian.',
    safeReplacement:
      'Bên B hỗ trợ tối đa 02 (hai) vòng chỉnh sửa giao diện/tính năng nằm trong phạm vi Tài liệu Đặc tả Yêu cầu (SRS) đã được hai Bên ký duyệt tại Phụ lục 01. Mọi yêu cầu bổ sung hoặc thay đổi nằm ngoài phạm vi SRS ban đầu sẽ được hai Bên lập thành Phụ lục Yêu cầu Thay đổi (Change Request) với chi phí và thời gian bổ sung tương ứng.'
  },
  {
    id: 'INDEFINITE_ACCEPTANCE_HOLD',
    lang: 'VI',
    title: 'Điều khoản treo tiền thanh toán / nghiệm thu theo đánh giá chủ quan không có hạn ngày (Deemed Acceptance)',
    category: 'THANH TOÁN & NGHIỆM THU',
    severity: 'HIGH',
    scorePenalty: 18,
    legalBasis: 'Điều 280 & Điều 519 Bộ luật Dân sự 2015',
    patterns: [
      /chỉ được thanh toán sau khi nghiệm thu hoàn tất[^.;\n]{0,120}(đánh giá chủ quan|không quy định thời hạn)/i,
      /theo đánh giá chủ quan của bên a/i
    ],
    explanation:
      'Giữ lại 80%-90% giá trị hợp đồng và gắn điều kiện thanh toán với "đánh giá chủ quan của Bên A" mà không có thời hạn nghiệm thu tối đa sẽ giúp Bên A trì hoãn ký nghiệm thu vô thời hạn để chiếm dụng vốn.',
    recommendation:
      'Chia nhỏ đợt thanh toán (30% - 40% - 30%) và bổ sung cơ chế "Nghiệm thu mặc nhiên (Deemed Acceptance)" sau 05 - 07 ngày làm việc kể từ ngày bàn giao nếu Bên A không có phản hồi lỗi nghiêm trọng bằng văn bản.',
    safeReplacement:
      'Thanh toán thành 03 đợt: Đợt 1 (30%) khi ký hợp đồng; Đợt 2 (40%) khi bàn giao bản chạy thử (UAT); Đợt 3 (30%) trong vòng 05 ngày làm việc sau khi nghiệm thu. Trong vòng 07 ngày làm việc kể từ khi Bên B bàn giao sản phẩm, nếu Bên A không gửi danh sách lỗi nghiêm trọng (Critical Bugs) bằng văn bản thì sản phẩm được coi là đã nghiệm thu hoàn tất mặc nhiên (Deemed Acceptance).'
  },
  {
    id: 'BACKGROUND_IP_GRAB',
    lang: 'VI',
    title: 'Chiếm đoạt Quyền sở hữu trí tuệ có sẵn (Background IP) & Chuyển giao trước khi thanh toán đủ',
    category: 'SỞ HỮU TRÍ TUỆ (IP)',
    severity: 'HIGH',
    scorePenalty: 18,
    legalBasis: 'Luật Sở hữu trí tuệ 2005 (sửa đổi, bổ sung 2022)',
    patterns: [
      /thư viện,\s*công cụ có sẵn[^.;\n]{0,90}thuộc quyền sở hữu/i,
      /sáng kiến tạo ra ngoài giờ làm việc trên máy tính cá nhân/i,
      /chuyển giao cho bên a ngay tại thời điểm ký hợp đồng bất kể bên a đã thanh toán đủ hay chưa/i
    ],
    explanation:
      'Điều khoản này tước đoạt toàn bộ thư viện cốt lõi (Background IP / Core Framework) có sẵn của bạn và chuyển giao quyền sở hữu ngay cả khi khách hàng chưa thanh toán đủ tiền.',
    recommendation:
      'Tách bạch rõ: (1) Tài sản trí tuệ nền tảng có sẵn (Background IP) vẫn thuộc sở hữu của Bên B; (2) Quyền sở hữu sản phẩm đặt hàng (Foreground IP) chỉ chính thức chuyển giao cho Bên A sau khi Bên A đã thanh toán đủ 100% giá trị hợp đồng.',
    safeReplacement:
      'Quyền sở hữu đối với phần mã nguồn được phát triển riêng cho dự án (Foreground IP) sẽ chính thức được chuyển giao cho Bên A ngay sau khi Bên A hoàn tất thanh toán đủ 100% giá trị hợp đồng. Các thư viện, framework và công cụ nền tảng có sẵn của Bên B trước hoặc độc lập với dự án (Background IP) vẫn thuộc quyền sở hữu của Bên B; Bên A được cấp quyền sử dụng không độc quyền các thành phần này để vận hành hệ thống.'
  },
  {
    id: 'UNLIMITED_LIABILITY_TRAP',
    lang: 'VI',
    title: 'Trách nhiệm bồi thường thiệt hại trực tiếp & gián tiếp không giới hạn mức trần (Unlimited Liability)',
    category: 'TRÁCH NHIỆM PHÁP LÝ',
    severity: 'HIGH',
    scorePenalty: 16,
    legalBasis: 'Điều 360 & Điều 419 Bộ luật Dân sự 2015; Điều 302 Luật Thương mại 2005',
    patterns: [
      /bồi thường toàn bộ mọi thiệt hại trực tiếp,?\s*gián tiếp[^.;\n]{0,80}không giới hạn/i,
      /khoản lợi nhuận suy giảm của bên a không giới hạn mức trần/i
    ],
    explanation:
      'Chấp nhận bồi thường cả thiệt hại gián tiếp (lợi nhuận kỳ vọng bị mất, gián đoạn kinh doanh) mà không có mức trần giới hạn (Liability Cap) có thể khiến một hợp đồng vài chục triệu đồng dẫn tới vụ kiện đòi bồi thường hàng tỷ đồng.',
    recommendation:
      'Loại trừ trách nhiệm bồi thường thiệt hại gián tiếp/suy đoán và giới hạn tổng mức trách nhiệm bồi thường tối đa không vượt quá 100% giá trị thực tế mà Bên B đã nhận được từ hợp đồng.',
    safeReplacement:
      'Trong mọi trường hợp, hai Bên không chịu trách nhiệm đối với các thiệt hại gián tiếp, thiệt hại mang tính hệ quả hoặc khoản lợi nhuận kỳ vọng bị suy giảm. Tổng mức trách nhiệm bồi thường thiệt hại tối đa của mỗi Bên phát sinh từ Hợp đồng này không vượt quá 100% tổng giá trị phí dịch vụ thực tế đã thanh toán theo Hợp đồng.'
  },
  {
    id: 'UNILATERAL_PRICE_HIKE_AND_DEPOSIT_FORFEITURE',
    lang: 'VI',
    title: 'Tự ý tăng giá thuê không giới hạn trần & Tịch thu 100% tiền cọc khi chậm thanh toán ngắn ngày',
    category: 'BẤT ĐỘNG SẢN & ĐẶT CỌC',
    severity: 'CRITICAL',
    scorePenalty: 24,
    legalBasis: 'Điều 328, Điều 428 & Điều 473 Bộ luật Dân sự 2015',
    patterns: [
      /tăng giá thuê bất kỳ lúc nào[^.;\n]{0,80}không giới hạn mức trần/i,
      /thanh toán chậm quá\s*0?[123]\s*ngày[^.;\n]{0,100}tịch thu 100%\s*tiền đặt cọc/i
    ],
    explanation:
      'Cho phép chủ nhà tự ý tăng giá thuê không giới hạn trần và tịch thu toàn bộ 4-6 tháng tiền cọc chỉ vì chậm chuyển khoản 1-2 ngày là cái bẫy đẩy người thuê vào thế mất trắng tiền cọc và chi phí đầu tư mặt bằng.',
    recommendation:
      'Cố định giá thuê trong ít nhất 12 tháng đầu; từ năm thứ 2 biên độ điều chỉnh tối đa không quá 5% - 10%/năm. Nếu chậm thanh toán cần có thời gian ân hạn (Grace Period) 07 - 10 ngày làm việc sau khi có thông báo nhắc nợ.',
    safeReplacement:
      'Giá thuê được giữ cố định trong suốt 12 tháng đầu tiên. Từ năm thứ hai trở đi, mức điều chỉnh giá thuê (nếu có) không vượt quá 8%/năm trên cơ sở thỏa thuận bằng văn bản trước 30 ngày. Trường hợp Bên B chậm thanh toán quá 07 ngày làm việc kể từ ngày nhận được thông báo nhắc thanh toán của Bên A mà không có lý do chính đáng, Bên A được tính lãi chậm trả theo quy định pháp luật.'
  },
  {
    id: 'UNILATERAL_TERMINATION_TRAP',
    lang: 'VI',
    title: 'Đơn phương chấm dứt hợp đồng / Lấy lại mặt bằng bất kỳ lúc nào không báo trước & Không đền cọc',
    category: 'CHẤM DỨT HỢP ĐỒNG',
    severity: 'HIGH',
    scorePenalty: 17,
    legalBasis: 'Điều 328 & Điều 428 Bộ luật Dân sự 2015; Điều 35, 36 Bộ luật Lao động 2019',
    patterns: [
      /tự ý chấm dứt hợp đồng bất kỳ lúc nào mà không cần báo trước/i,
      /lấy lại mặt bằng bất kỳ lúc nào[^.;\n]{0,80}không phải bồi thường/i,
      /khóa tài khoản và xóa dữ liệu của bên b bất kỳ lúc nào mà không cần báo trước/i
    ],
    explanation:
      'Điều khoản cho phép một bên tự ý hủy hợp đồng bất kỳ lúc nào không cần báo trước và không phải đền cọc hoặc hoàn phí tạo sự mất cân bằng quyền lợi nghiêm trọng.',
    recommendation:
      'Quy định nghĩa vụ báo trước tối thiểu 30 - 60 ngày cho cả hai bên; hoàn trả phí chưa sử dụng hoặc đền cọc tương ứng theo Điều 328 BLDS.',
    safeReplacement:
      'Mỗi Bên chỉ được đơn phương chấm dứt Hợp đồng trước thời hạn khi Bên kia vi phạm nghiêm trọng nghĩa vụ hợp đồng và không khắc phục trong vòng 15 ngày kể từ ngày nhận được thông báo bằng văn bản. Nếu Bên A đơn phương chấm dứt hợp đồng trước hạn không do lỗi của Bên B, Bên A phải báo trước ít nhất 30 ngày, hoàn trả đầy đủ phần phí/tiền đặt cọc và bồi thường theo quy định tại Điều 328, Điều 428 Bộ luật Dân sự 2015.'
  },
  {
    id: 'EVERGREEN_AUTO_RENEWAL_TRAP',
    lang: 'VI',
    title: 'Bẫy tự động gia hạn dài hạn (24-36 tháng) kèm tăng giá cao nếu không báo trước 90-120 ngày',
    category: 'THỜI HẠN & GIA HẠN',
    severity: 'MEDIUM',
    scorePenalty: 12,
    legalBasis: 'Điều 401 & Điều 422 Bộ luật Dân sự 2015',
    patterns: [
      /tự động gia hạn thêm\s*(?:24|36)\s*tháng[^.;\n]{0,100}(?:90|120)\s*ngày/i
    ],
    explanation:
      'Yêu cầu thông báo trước tới 90-120 ngày, nếu quên sẽ tự động khóa chặt thêm 2-3 năm kèm tăng giá cao là bẫy gia hạn ngầm (Evergreen Clause).',
    recommendation:
      'Chuyển sang cơ chế gia hạn khi có xác nhận bằng văn bản của hai bên trước 30 ngày khi hết hạn.',
    safeReplacement:
      'Trước khi Hợp đồng hết hạn ít nhất 30 ngày, hai Bên sẽ cùng trao đổi bằng văn bản về việc gia hạn Hợp đồng và thống nhất biểu phí cho kỳ tiếp theo. Hợp đồng chỉ được gia hạn khi có Phụ lục gia hạn được đại diện hợp pháp của cả hai Bên ký xác nhận.'
  },
  {
    id: 'ONE_SIDED_FORCE_MAJEURE_AND_STRUCTURE_REPAIR',
    lang: 'VI',
    title: 'Bắt người thuê chịu chi phí sửa chữa kết cấu tòa nhà & Điều khoản Bất khả kháng một chiều',
    category: 'BẤT KHẢ KHÁNG & BẢO TRÌ',
    severity: 'HIGH',
    scorePenalty: 16,
    legalBasis: 'Điều 156, Điều 351 & Điều 477 Bộ luật Dân sự 2015',
    patterns: [
      /tự bỏ toàn bộ chi phí sửa chữa mọi hư hỏng của tòa nhà bao gồm cả sụt lún nền móng/i,
      /bất khả kháng chỉ áp dụng cho bên a/i
    ],
    explanation:
      'Theo Điều 477 Bộ luật Dân sự 2015, Bên cho thuê có nghĩa vụ bảo đảm tài sản thuê trong tình trạng an toàn và phải sửa chữa những hư hỏng về kết cấu lớn. Ngoài ra, Sự kiện Bất khả kháng (Điều 156 BLDS) là quy định miễn trừ trách nhiệm pháp định cho cả hai bên.',
    recommendation:
      'Bên cho thuê chịu trách nhiệm sửa chữa hư hỏng kết cấu lớn (móng, mái, tường chịu lực); áp dụng miễn trừ Bất khả kháng công bằng cho cả hai bên.',
    safeReplacement:
      'Bên A chịu trách nhiệm bảo trì và sửa chữa kịp thời các hư hỏng thuộc về kết cấu công trình (nền móng, mái nhà, hệ thống chịu lực, đường ống chính) theo Điều 477 Bộ luật Dân sự 2015; Bên B chịu trách nhiệm sửa chữa các hư hỏng nhỏ do lỗi sử dụng của Bên B. Trường hợp xảy ra Sự kiện Bất khả kháng theo Điều 156 Bộ luật Dân sự 2015 khiến mặt bằng không thể khai thác, Bên B được miễn/giảm tiền thuê tương ứng với thời gian bị ảnh hưởng.'
  },
  {
    id: 'ILLEGAL_COLLATERAL_SEIZURE_AND_COURT_WAIVER',
    lang: 'VI',
    title: 'Tự ý đoạt/thanh lý tài sản thế chấp không qua định giá & Tước quyền khởi kiện tại Tòa án',
    category: 'TÀI SẢN BẢO ĐẢM & TỐ TỤNG',
    severity: 'CRITICAL',
    scorePenalty: 26,
    legalBasis: 'Điều 14, Điều 303 & Điều 307 Bộ luật Dân sự 2015; Điều 4 Bộ luật Tố tụng Dân sự 2015',
    patterns: [
      /tự ý sang tên hoặc bán thanh lý[^.;\n]{0,100}không được nhận lại phần tiền chênh lệch/i,
      /từ bỏ quyền khiếu nại và từ bỏ quyền khởi kiện tại tòa án/i
    ],
    explanation:
      'Theo Điều 307 Bộ luật Dân sự 2015, nếu số tiền thu được từ việc xử lý tài sản cầm cố/thế chấp lớn hơn giá trị nghĩa vụ được bảo đảm thì số tiền chênh lệch PHẢI trả lại cho bên bảo đảm. Đồng thời, thỏa thuận tước bỏ quyền khởi kiện tại Tòa án nhân dân là vô hiệu.',
    recommendation:
      'Việc xử lý tài sản bảo đảm phải thực hiện công khai theo giá thị trường/đấu giá và hoàn trả phần tiền dư sau khi trừ nợ gốc, lãi hợp pháp. Giữ nguyên quyền giải quyết tranh chấp tại Tòa án có thẩm quyền.',
    safeReplacement:
      'Việc xử lý tài sản bảo đảm (nếu phát sinh) được thực hiện theo phương thức thỏa thuận định giá khách quan hoặc bán đấu giá theo quy định tại Điều 303 Bộ luật Dân sự 2015; phần giá trị chênh lệch sau khi thanh toán nghĩa vụ nợ gốc và lãi hợp pháp sẽ được hoàn trả đầy đủ cho Bên B theo Điều 307 Bộ luật Dân sự 2015. Mọi tranh chấp không thương lượng được sẽ do Tòa án nhân dân có thẩm quyền giải quyết.'
  },
  {
    id: 'DATA_PRIVACY_AND_AI_TRAINING_VIOLATION',
    lang: 'VI',
    title: 'Thu thập dữ liệu cá nhân/dữ liệu mật để huấn luyện AI thương mại & Miễn trừ trách nhiệm khi rò rỉ dữ liệu',
    category: 'BẢO VỆ DỮ LIỆU CÁ NHÂN & AI',
    severity: 'CRITICAL',
    scorePenalty: 25,
    legalBasis: 'Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân & Luật An toàn thông tin mạng',
    patterns: [
      /toàn quyền sử dụng dữ liệu khách hàng[^.;\n]{0,120}huấn luyện ai thương mại/i,
      /chia sẻ dữ liệu cho bên thứ ba[^.;\n]{0,80}không cần xin phép/i,
      /rò rỉ dữ liệu[^.;\n]{0,100}miễn trừ mọi trách nhiệm pháp lý/i
    ],
    explanation:
      'Nghị định 13/2023/NĐ-CP nghiêm cấm chia sẻ hoặc sử dụng dữ liệu cá nhân sai mục đích đã đăng ký mà không có sự đồng ý rõ ràng, đồng thời đơn vị xử lý dữ liệu phải chịu trách nhiệm pháp lý và thông báo trong 72 giờ khi xảy ra vi phạm dữ liệu.',
    recommendation:
      'Cấm sử dụng dữ liệu nội bộ/dữ liệu cá nhân của Bên B để huấn luyện mô hình AI dùng chung; quy định nghĩa vụ thông báo sự cố bảo mật trong vòng 72 giờ theo Nghị định 13/2023/NĐ-CP.',
    safeReplacement:
      'Bên A cam kết chỉ xử lý dữ liệu của Bên B đúng mục đích cung cấp dịch vụ theo Hợp đồng, tuyệt đối không sử dụng dữ liệu của Bên B để huấn luyện các mô hình AI thương mại dùng chung và không chia sẻ cho bất kỳ bên thứ ba nào khi chưa có văn bản chấp thuận của Bên B. Hai Bên tuân thủ đầy đủ Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân và thông báo ngay trong vòng 72 giờ nếu phát hiện nguy cơ mất an toàn dữ liệu.'
  },

  // --- B. QUY TẮC HỢP ĐỒNG QUỐC TẾ TIẾNG ANH (8 INTERNATIONAL ENGLISH RULES) ---
  {
    id: 'EN_PAY_WHEN_PAID_AND_SUBJECTIVE_ACCEPTANCE',
    lang: 'EN',
    title: 'Pay-When-Paid Trap, Net 90/120+ Payment Delay & Sole Discretion Acceptance',
    category: 'INTERNATIONAL PAYMENT & ACCEPTANCE',
    severity: 'CRITICAL',
    scorePenalty: 24,
    legalBasis: 'UCC / International Commercial Contract Standards (Net 15–30 & Objective Acceptance)',
    patterns: [
      /\bNet\s*(?:90|120|150|180)\b/i,
      /\bpay-when-paid\b/i,
      /\bsole and absolute discretion\b/i
    ],
    explanation:
      'Linking your payment to whether the Client collects money from their end-customer ("pay-when-paid"), stretching invoices to Net 90–150 days, or allowing rejection at "sole and absolute discretion" exposes Contractor to total non-payment risk.',
    recommendation:
      'Set Net 15 or Net 30 payment terms independent of third-party collections, and add a 7-business-day Deemed Acceptance window based on written specifications.',
    safeReplacement:
      'Client agrees to pay Contractor a total fee of $48,000 USD payable within Net 30 calendar days of invoice date (independent of third-party collections). Deliverables shall be deemed accepted within seven (7) business days of delivery unless Client provides a written notice detailing material non-conformities against the mutually agreed Statement of Work.'
  },
  {
    id: 'EN_BACKGROUND_IP_ASSIGNMENT',
    lang: 'EN',
    title: 'Pre-Existing / Background IP Grab & IP Transfer Prior to Full Payment',
    category: 'INTELLECTUAL PROPERTY (EN)',
    severity: 'CRITICAL',
    scorePenalty: 24,
    legalBasis: 'International IP Licensing Standard (Foreground vs. Background IP Carve-Out)',
    patterns: [
      /assigns[^.;\n]{0,120}(pre-existing tools|background intellectual property)/i,
      /regardless of whether payment has been made/i
    ],
    explanation:
      'Assigning "pre-existing tools, libraries, frameworks, and background intellectual property" strips you of ownership of your reusable codebase and prevents you from using your own frameworks for future clients.',
    recommendation:
      'Retain full ownership of all Background IP (granting Client a non-exclusive license to use it inside the deliverables) and condition Foreground IP assignment upon 100% payment.',
    safeReplacement:
      'Upon Contractor’s receipt of full payment under the applicable Statement of Work, Contractor assigns to Client all ownership rights in custom deliverables created specifically for Client ("Foreground IP"). Contractor retains all right, title, and interest in its pre-existing tools, libraries, frameworks, and know-how ("Background IP"), granting Client a non-exclusive, perpetual license to use any Background IP embedded in the deliverables.'
  },
  {
    id: 'EN_UNLIMITED_INDEMNIFICATION',
    lang: 'EN',
    title: 'Broad One-Sided Uncapped Indemnification ("Any and All Claims Without Limitation")',
    category: 'INDEMNIFICATION (EN)',
    severity: 'HIGH',
    scorePenalty: 18,
    legalBasis: 'Commercial MSA Market Standard (Mutual Third-Party IP & Gross Negligence Indemnity)',
    patterns: [
      /indemnify,\s*defend,\s*and hold harmless[^.;\n]{0,140}without limitation/i
    ],
    explanation:
      'An uncapped, one-sided indemnification for "any and all claims" forces Contractor to pay Client’s legal fees and settlements even for claims partially caused by Client’s own misuse or business operations.',
    recommendation:
      'Limit indemnification to third-party intellectual property infringement and willful misconduct, subject to prompt notice and the overall contractual liability cap.',
    safeReplacement:
      'Each Party shall mutually indemnify and hold harmless the other Party solely against third-party claims arising directly from gross negligence, willful misconduct, or knowing infringement of third-party intellectual property rights, subject to the Limitation of Liability cap set forth in this Agreement.'
  },
  {
    id: 'EN_UNCAPPED_CONSEQUENTIAL_DAMAGES',
    lang: 'EN',
    title: 'Uncapped Liability & Inclusion of Indirect / Consequential / Punitive Damages',
    category: 'LIMITATION OF LIABILITY (EN)',
    severity: 'CRITICAL',
    scorePenalty: 22,
    legalBasis: 'Restatement (Second) of Contracts § 351 & SaaS/MSA Liability Cap Standard',
    patterns: [
      /liable for all direct,\s*indirect,\s*incidental,\s*punitive,\s*and consequential damages[^.;\n]{0,80}without any liability cap/i,
      /lost profits without any liability cap/i
    ],
    explanation:
      'Accepting uncapped consequential, punitive, and lost-profit damages exposes a $48k software engagement to multi-million-dollar enterprise lawsuits.',
    recommendation:
      'Mutually waive indirect/consequential damages and cap aggregate liability at 100% of fees paid in the preceding 12 months.',
    safeReplacement:
      'NEITHER PARTY SHALL BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, PUNITIVE, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS. EACH PARTY’S TOTAL AGGREGATE LIABILITY ARISING OUT OF THIS AGREEMENT SHALL NOT EXCEED 100% OF THE FEES ACTUALLY PAID UNDER THIS AGREEMENT IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.'
  },
  {
    id: 'EN_WORLDWIDE_NON_COMPETE',
    lang: 'EN',
    title: 'Overbroad Worldwide Non-Compete Restraint (3–5 Years Global Ban)',
    category: 'RESTRICTIVE COVENANTS (EN)',
    severity: 'HIGH',
    scorePenalty: 20,
    legalBasis: 'California Bus. & Prof. Code § 16600 / FTC & Common Law Reasonableness Doctrine',
    patterns: [
      /for a period of\s*[3-9]\s*years[^.;\n]{0,120}(competing business|software services to any technology company worldwide)/i
    ],
    explanation:
      'A 3–5 year worldwide ban from providing software services to any technology company effectively bars an agency or engineer from practicing their profession (void under California law and unenforceable in most jurisdictions).',
    recommendation:
      'Replace broad non-compete with strict Confidentiality and a narrow 12-month Non-Solicitation of named client employees.',
    safeReplacement:
      'Nothing in this Agreement shall restrict Contractor from providing software engineering services to other clients, provided Contractor strictly protects Client’s Confidential Information. During the term and for twelve (12) months thereafter, neither Party shall directly solicit for employment key personnel of the other Party involved in this engagement.'
  },
  {
    id: 'EN_UNILATERAL_TERMINATION_WITHOUT_PAYMENT_AND_PERPETUAL_NDA',
    lang: 'EN',
    title: 'Termination Without Payment for Work-in-Progress & Perpetual Unbounded NDA',
    category: 'TERMINATION & NDA SURVIVAL (EN)',
    severity: 'HIGH',
    scorePenalty: 18,
    legalBasis: 'Quantum Meruit Principle & Standard 2–5 Year NDA Survival Clause',
    patterns: [
      /terminate immediately without cause and without payment for work already performed/i,
      /survive in perpetuity without exception/i
    ],
    explanation:
      'Allowing Client to terminate without cause and refuse to pay for hours/milestones already completed enables free work extraction. In addition, NDA survival "without exception" omits mandatory carve-outs for public-domain or legally compelled disclosures.',
    recommendation:
      'Require 15–30 days written notice for convenience termination with pro-rata payment for all work performed through termination date, and set a 3-year NDA term with standard legal carve-outs.',
    safeReplacement:
      'Either Party may terminate this Agreement for convenience upon thirty (30) days prior written notice, provided Client pays Contractor in full for all deliverables completed and work-in-progress performed up to the effective termination date. Confidentiality obligations shall survive for three (3) years following termination, excluding information that becomes publicly available or is required to be disclosed by law.'
  }
];

// ============================================================================
// 3. PHÂN TÍCH NGÔN NGỮ & KIỂM TOÁN RỦI RO HỢP ĐỒNG CHUYÊN SÂU
// ============================================================================

function detectContractLanguage(text) {
  const src = String(text || '');
  const vnChars = (src.match(/[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/gi) || []).length;
  return vnChars >= 8 ? 'VI' : 'EN';
}

function splitClauses(text) {
  const lines = String(text || '').replace(/\r\n/g, '\n').split('\n');
  const clauses = [];
  let currentHeading = 'Mở đầu / Preamble';

  lines.forEach((rawLine, lineIdx) => {
    const line = rawLine.trim();
    if (!line) return;
    if (/^(ĐIỀU\s+\d+|CHƯƠNG\s+[IVX\d]+|ARTICLE\s+\d+|SECTION\s+\d+)/i.test(line)) {
      currentHeading = line;
    }
    clauses.push({
      index: clauses.length + 1,
      lineNumber: lineIdx + 1,
      section: currentHeading,
      text: line
    });
  });

  return clauses;
}

function extractKeyFinancialsAndDates(text) {
  const src = String(text || '');
  const amounts = [
    ...new Set(
      (
        src.match(
          /\$\d{1,3}(?:,\d{3})*(?:\.\d+)?(?:\s*USD)?|\b\d{1,3}(?:\.\d{3})+(?:\s*VNĐ|\s*đồng)?|\b\d+(?:[.,]\d+)?\s*(?:triệu|tỷ|USD)\b/gi
        ) || []
      ).slice(0, 10)
    )
  ];
  const percentages = [
    ...new Set((src.match(/\b\d+(?:[.,]\d+)?\s*%(?:\/(?:ngày|tháng|năm|day|month|year))?/gi) || []).slice(0, 10))
  ];
  const durations = [
    ...new Set(
      (
        src.match(
          /\b(?:Net\s*\d+|\d+\s*(?:ngày|tháng|năm|days|months|years|business days))(?:\s*làm việc)?\b/gi
        ) || []
      ).slice(0, 12)
    )
  ];
  return { amounts, percentages, durations };
}

function analyzeContract(text, protectParty = 'PARTY_B') {
  const cleanText = String(text || '').replace(/\r\n/g, '\n');
  const detectedLang = detectContractLanguage(cleanText);
  const clauses = splitClauses(cleanText);
  const findings = [];

  for (const clause of clauses) {
    for (const rule of LEGAL_AUDIT_RULES) {
      for (const pattern of rule.patterns) {
        const match = pattern.exec(clause.text);
        if (match) {
          findings.push({
            id: `${rule.id}_${findings.length + 1}`,
            ruleId: rule.id,
            lang: rule.lang || 'VI',
            title: rule.title,
            category: rule.category,
            severity: rule.severity,
            scorePenalty: rule.scorePenalty,
            legalBasis: rule.legalBasis,
            section: clause.section,
            lineNumber: clause.lineNumber,
            flaggedClauseText: clause.text,
            matchedPhrase: match[0],
            explanation: rule.explanation,
            recommendation: rule.recommendation,
            safeReplacement: rule.safeReplacement
          });
          break;
        }
      }
    }
  }

  // Evaluate user-enabled Custom Playbook rules
  const playbookFindings = v3Engines.evaluatePlaybookRulesOnClauses(clauses);
  findings.push(...playbookFindings);

  // Missing standard protective clauses (localized to VI or EN)
  const missingClauses = [];
  if (!/bất khả kháng|force majeure/i.test(cleanText)) {
    missingClauses.push(
      detectedLang === 'EN'
        ? {
            id: 'MISSING_FORCE_MAJEURE_EN',
            title: 'Missing Mutual Force Majeure Protection Clause',
            legalBasis: 'International Commercial Contract Standard',
            suggestedClause:
              'FORCE MAJEURE: Neither Party shall be liable for any delay or failure to perform its obligations under this Agreement to the extent caused by Force Majeure events beyond its reasonable control (including natural disasters, acts of government, epidemics, or major internet backbone outages).'
          }
        : {
            id: 'MISSING_FORCE_MAJEURE',
            title: 'Thiếu điều khoản Sự kiện Bất khả kháng (Force Majeure) 2 chiều',
            legalBasis: 'Điều 156 Bộ luật Dân sự 2015',
            suggestedClause:
              'ĐIỀU KHOẢN BẤT KHẢ KHÁNG: Trường hợp xảy ra sự kiện bất khả kháng (thiên tai, dịch bệnh, hỏa hoạn, thay đổi chính sách pháp luật của cơ quan nhà nước có thẩm quyền) làm một Bên không thể thực hiện nghĩa vụ hợp đồng thì Bên đó được miễn trừ trách nhiệm vi phạm trong thời gian xảy ra sự kiện bất khả kháng theo Điều 156 Bộ luật Dân sự 2015.'
          }
    );
  }

  if (!/tòa án|trọng tài|giải quyết tranh chấp|governing law|jurisdiction|arbitration|dispute/i.test(cleanText)) {
    missingClauses.push(
      detectedLang === 'EN'
        ? {
            id: 'MISSING_DISPUTE_RESOLUTION_EN',
            title: 'Missing Governing Law & Good-Faith Dispute Resolution Clause',
            legalBasis: 'UNCITRAL / Commercial Dispute Resolution Standard',
            suggestedClause:
              'GOVERNING LAW & DISPUTE RESOLUTION: Any dispute arising out of this Agreement shall first be resolved through good-faith negotiation within fifteen (15) calendar days. Failing resolution, disputes shall be settled by mutually agreed neutral arbitration or a court of competent jurisdiction.'
          }
        : {
            id: 'MISSING_DISPUTE_RESOLUTION',
            title: 'Thiếu điều khoản Cơ chế Thương lượng & Cơ quan Giải quyết Tranh chấp',
            legalBasis: 'Điều 317 Luật Thương mại 2005',
            suggestedClause:
              'ĐIỀU KHOẢN GIẢI QUYẾT TRANH CHẤP: Mọi tranh chấp phát sinh từ hoặc liên quan đến Hợp đồng này trước hết sẽ được giải quyết thông qua thương lượng thiện chí trong vòng 15 ngày. Nếu không đạt được thỏa thuận, một trong hai Bên có quyền đưa vụ việc ra giải quyết tại Tòa án nhân dân có thẩm quyền theo quy định của pháp luật Việt Nam.'
          }
    );
  }

  const totalPenalty = findings.reduce((sum, f) => sum + f.scorePenalty, 0) + missingClauses.length * 4;
  const safetyScore = Math.max(5, Math.min(100, 100 - totalPenalty));

  let grade = 'A';
  let verdict = 'An toàn cao — Hợp đồng cân bằng quyền lợi hai bên';
  if (safetyScore < 35) {
    grade = 'F';
    verdict = 'CỰC KỲ NGUY HIỂM — Phát hiện nhiều điều khoản bẫy & trái quy định pháp luật! Tuyệt đối không ký trước khi sửa đổi.';
  } else if (safetyScore < 55) {
    grade = 'D';
    verdict = 'RỦI RO CAO — Hợp đồng nghiêng hẳn về một phía, có nguy cơ thiệt hại tài chính lớn.';
  } else if (safetyScore < 75) {
    grade = 'C';
    verdict = 'CẦN ĐÀM PHÁN LẠI — Có một số điều khoản bất lợi cần chỉnh sửa trước khi đặt bút ký.';
  } else if (safetyScore < 90) {
    grade = 'B';
    verdict = 'KHÁ AN TOÀN — Chỉ còn một vài điểm nhỏ cần làm rõ.';
  }

  const criticalCount = findings.filter((f) => f.severity === 'CRITICAL').length;
  const highCount = findings.filter((f) => f.severity === 'HIGH').length;
  const mediumCount = findings.filter((f) => f.severity === 'MEDIUM').length;

  const partyAShare = Math.min(92, Math.max(50, 50 + Math.round((100 - safetyScore) * 0.42)));
  const partyBShare = 100 - partyAShare;

  return {
    analyzedAt: new Date().toISOString(),
    detectedLanguage: detectedLang,
    protectParty,
    safetyScore,
    grade,
    verdict,
    counts: {
      total: findings.length,
      critical: criticalCount,
      high: highCount,
      medium: mediumCount,
      missingClauses: missingClauses.length
    },
    powerBalance: {
      partyAPercent: partyAShare,
      partyBPercent: partyBShare
    },
    extractedMetrics: extractKeyFinancialsAndDates(cleanText),
    findings,
    missingClauses,
    clauseCount: clauses.length
  };
}

// ============================================================================
// 4. TỰ ĐỘNG SOẠN EMAIL / TIN NHẮN ĐÀM PHÁN GỬI ĐỐI TÁC (3 GIỌNG VĂN SONG NGỮ)
// ============================================================================

function generateNegotiationEmail({
  text,
  tone = 'PROFESSIONAL',
  language = 'AUTO',
  recipientName = '',
  senderName = '',
  contractTitle = ''
}) {
  const report = analyzeContract(text);
  const lang = language === 'AUTO' ? report.detectedLanguage : language;
  const docTitle =
    contractTitle ||
    (lang === 'EN' ? 'Master Services Agreement' : 'Dự thảo Hợp đồng');
  const toName =
    recipientName ||
    (lang === 'EN' ? 'Legal / Partnerships Team' : 'Quý Đối tác / Bộ phận Nhân sự - Pháp chế');
  const fromName =
    senderName ||
    (lang === 'EN' ? 'Authorized Representative (Party B)' : 'Đại diện Bên B');

  if (report.findings.length === 0 && report.missingClauses.length === 0) {
    return {
      language: lang,
      tone,
      subject:
        lang === 'EN'
          ? `Confirmation of Contract Review — ${docTitle}`
          : `[Xác nhận Dự thảo] Đồng thuận các điều khoản của ${docTitle}`,
      body:
        lang === 'EN'
          ? `Dear ${toName},\n\nThank you for sharing the draft of "${docTitle}". We have completed our legal review and confirm that all clauses are well-balanced and acceptable. Please proceed with preparing the execution copy for signature.\n\nBest regards,\n${fromName}`
          : `Kính gửi ${toName},\n\nCảm ơn Quý Đối tác đã gửi bản dự thảo "${docTitle}". Sau khi rà soát chi tiết, chúng tôi hoàn toàn đồng thuận với các điều khoản hiện tại (Điểm an toàn pháp lý đạt 100/100). Quý bên có thể tiến hành bước ký kết chính thức.\n\nTrân trọng,\n${fromName}`,
      pointsCount: 0,
      safetyScore: report.safetyScore
    };
  }

  if (lang === 'EN') {
    const toneConfigEn = {
      COLLABORATIVE: {
        subject: `Friendly Review & Proposed Refinements — ${docTitle}`,
        intro: `Dear ${toName},\n\nThank you very much for sending over the draft of "${docTitle}". We are genuinely excited about collaborating on this project and moving forward swiftly.\n\nWhile reviewing the draft with our team, we noted ${report.findings.length} areas where standard mutual adjustments would help align the contract with market best practices and protect both sides fairly:`
      },
      PROFESSIONAL: {
        subject: `[Legal Redline Review] Proposed Amendments to ${docTitle}`,
        intro: `Dear ${toName},\n\nThank you for providing the draft "${docTitle}". We have completed our legal and commercial review. Prior to execution, we kindly request revising the following ${report.findings.length} clauses so that risk allocation, payment terms, and intellectual property ownership reflect balanced commercial standards:`
      },
      FIRM: {
        subject: `[Required Revisions Prior to Execution] Risk & Compliance Findings — ${docTitle}`,
        intro: `Dear ${toName},\n\nWe have reviewed the proposed "${docTitle}". In its current form, the draft contains ${report.findings.length} material risk provisions (including ${report.counts.critical} critical items) that we cannot execute under our compliance and risk-management policy. Specifically, the following amendments are required before signing:`
      }
    };

    const chosen = toneConfigEn[tone] || toneConfigEn.PROFESSIONAL;
    const itemBlocks = report.findings.map(
      (f, idx) =>
        `${idx + 1}. [${f.section}] — ${f.title}\n` +
        `   • Current Concern (${f.legalBasis}): ${f.explanation}\n` +
        `   • Proposed Balanced Wording: "${f.safeReplacement}"`
    );
    if (report.missingClauses.length > 0) {
      report.missingClauses.forEach((m, i) => {
        itemBlocks.push(
          `${report.findings.length + i + 1}. [Additional Clause] — ${m.title}\n` +
            `   • Proposed Addition: "${m.suggestedClause}"`
        );
      });
    }

    const closing =
      tone === 'FIRM'
        ? `\nOnce these revisions are incorporated into the clean execution draft, we will be ready to counter-sign promptly. Please send over the updated version at your earliest convenience.\n\nSincerely,\n${fromName}`
        : `\nWe have also prepared a redlined .DOCX copy reflecting the wording above if helpful. Please let us know your thoughts on these adjustments so we can finalize and sign right away.\n\nWarm regards,\n${fromName}`;

    return {
      language: 'EN',
      tone,
      subject: chosen.subject,
      body: `${chosen.intro}\n\n${itemBlocks.join('\n\n')}\n${closing}`,
      pointsCount: report.findings.length + report.missingClauses.length,
      safetyScore: report.safetyScore
    };
  }

  // VIETNAMESE NEGOTIATION EMAIL (3 TONES)
  const toneConfigVi = {
    COLLABORATIVE: {
      subject: `[Góp ý thiện chí] Đề xuất hoàn thiện một số điều khoản tại ${docTitle}`,
      intro: `Chào ${toName},\n\nLời đầu tiên, cảm ơn Quý bên đã gửi bản dự thảo "${docTitle}". Phía mình rất trân trọng cơ hội hợp tác này và mong muốn hai bên sớm hoàn tất thủ tục để bắt tay vào công việc hiệu quả nhất.\n\nQua bước rà soát nội dung dự thảo, mình xin phép trao đổi và đề xuất điều chỉnh nhẹ ${report.findings.length} điểm dưới đây để đảm bảo sự hài hòa, rõ ràng và thuận lợi cho cả hai bên trong suốt quá trình thực hiện:`,
      outro: `\nRất mong ${toName} xem xét và hỗ trợ cập nhật giúp mình các nội dung trên vào bản chính thức (mình cũng có thể gửi kèm file Word đã chỉnh sửa sẵn để Quý bên tiện đối chiếu). Mong sớm nhận được phản hồi để hai bên tiến hành ký kết ngay trong tuần này!\n\nTrân trọng cảm ơn,\n${fromName}`
    },
    PROFESSIONAL: {
      subject: `[Đề xuất Hiệu đính Pháp lý] Rà soát dự thảo ${docTitle}`,
      intro: `Kính gửi ${toName},\n\nCảm ơn Quý Đối tác đã chuyển dự thảo "${docTitle}". Sau khi đối chiếu chi tiết các điều khoản với quy định pháp luật hiện hành (Bộ luật Dân sự 2015 / Bộ luật Lao động 2019 / Luật Thương mại 2005), chúng tôi xin gửi bảng đề xuất hiệu đính đối với ${report.findings.length} điều khoản nhằm đảm bảo tính tuân thủ pháp lý và cân bằng quyền - nghĩa vụ giữa hai Bên:`,
      outro: `\nViệc chuẩn hóa các điều khoản trên theo đúng khung pháp lý sẽ giúp Hợp đồng có hiệu lực thực thi vững chắc và phòng ngừa rủi ro tranh chấp cho cả hai phía. Kính đề nghị Quý Đối tác xem xét cập nhật dự thảo để hai Bên sớm hoàn tất ký kết.\n\nTrân trọng,\n${fromName}`
    },
    FIRM: {
      subject: `[Yêu cầu Sửa đổi Bắt buộc Trước Khi Ký] Các điều khoản rủi ro tại ${docTitle}`,
      intro: `Kính gửi ${toName},\n\nChúng tôi đã hoàn tất kiểm toán pháp lý bản dự thảo "${docTitle}" và ghi nhận ${report.findings.length} điều khoản bất cân xứng nghiêm trọng (trong đó có ${report.counts.critical} điều khoản vượt giới hạn pháp định / gây rủi ro trực tiếp). Theo nguyên tắc quản trị rủi ro, chúng tôi chưa thể đặt bút ký nếu giữ nguyên các nội dung hiện tại và đề nghị sửa đổi dứt điểm các điều khoản sau:`,
      outro: `\nNgay sau khi các điều khoản trên được điều chỉnh về mức cân bằng và đúng quy định pháp luật Việt Nam, chúng tôi sẵn sàng tiến hành ký kết ngay lập tức. Rất mong nhận được bản dự thảo cập nhật từ Quý bên.\n\nTrân trọng,\n${fromName}`
    }
  };

  const chosenVi = toneConfigVi[tone] || toneConfigVi.PROFESSIONAL;
  const viBlocks = report.findings.map(
    (f, idx) =>
      `${idx + 1}. Tại [${f.section}] — Vấn đề: ${f.title}\n` +
      `   • Nội dung dự thảo hiện tại: "${f.flaggedClauseText}"\n` +
      `   • Căn cứ pháp lý & Lý do cần điều chỉnh (${f.legalBasis}): ${f.explanation}\n` +
      `   • Đề xuất sửa lại thành: "${f.safeReplacement}"`
  );

  if (report.missingClauses.length > 0) {
    report.missingClauses.forEach((m, i) => {
      viBlocks.push(
        `${report.findings.length + i + 1}. [Đề xuất bổ sung điều khoản bảo vệ chung] — ${m.title} (${m.legalBasis})\n` +
          `   • Nội dung bổ sung: "${m.suggestedClause}"`
      );
    });
  }

  return {
    language: 'VI',
    tone,
    subject: chosenVi.subject,
    body: `${chosenVi.intro}\n\n${viBlocks.join('\n\n')}\n${chosenVi.outro}`,
    pointsCount: report.findings.length + report.missingClauses.length,
    safetyScore: report.safetyScore
  };
}

// ============================================================================
// 5. ĐÓNG DẤU NIÊM PHONG SHA-256 CHỐNG TRÁO BẢN THẢO TRƯỚC KHI IN KÝ
// ============================================================================

function normalizeTextForSeal(text) {
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

function loadSeals() {
  try {
    return JSON.parse(fs.readFileSync(SEALS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveSeals(seals) {
  fs.writeFileSync(SEALS_FILE, JSON.stringify(seals.slice(0, 50), null, 2), 'utf8');
}

function createContractSeal({ title, contractText, signerNote = '' }) {
  const raw = String(contractText || '');
  const normalized = normalizeTextForSeal(raw);
  const exactSha256 = sha256Hex(raw);
  const normalizedSha256 = sha256Hex(normalized);
  const shortHash = normalizedSha256.slice(0, 8).toUpperCase();
  const sealCode = `CS-${new Date().getFullYear()}-${shortHash.slice(0, 4)}-${shortHash.slice(4, 8)}`;

  const lines = normalized.split('\n');
  const lineDigests = lines.map((line, i) => ({
    line: i + 1,
    hash: sha256Hex(line).slice(0, 16)
  }));

  const sealRecord = {
    sealId: crypto.randomUUID(),
    sealCode,
    title: title || 'Bản Hợp Đồng Chốt Ký Kết',
    signerNote,
    sealedAt: new Date().toISOString(),
    charCount: raw.length,
    clauseLineCount: lines.length,
    exactSha256,
    normalizedSha256,
    lineDigests,
    sealedTextSnapshot: raw
  };

  const seals = loadSeals();
  seals.unshift(sealRecord);
  saveSeals(seals);

  return sealRecord;
}

function verifyContractAgainstSeal({ sealCodeOrId, candidateText, referenceSnapshot = null }) {
  const seals = loadSeals();
  const seal =
    seals.find((s) => s.sealCode === sealCodeOrId || s.sealId === sealCodeOrId) ||
    (referenceSnapshot
      ? {
          sealCode: 'DIRECT-SNAPSHOT',
          title: 'Bản Đối Chiếu Trực Tiếp',
          sealedAt: new Date().toISOString(),
          exactSha256: sha256Hex(referenceSnapshot),
          normalizedSha256: sha256Hex(normalizeTextForSeal(referenceSnapshot)),
          sealedTextSnapshot: referenceSnapshot
        }
      : seals[0]);

  if (!seal) {
    throw new Error('Chưa tìm thấy Chứng thư Niêm phong nào. Hãy bấm "Tạo Niêm Phong SHA-256" trước!');
  }

  const candRaw = String(candidateText || '');
  const candNorm = normalizeTextForSeal(candRaw);
  const candExactHash = sha256Hex(candRaw);
  const candNormHash = sha256Hex(candNorm);

  let status = 'TAMPERED';
  let statusTitle = '🚨 CẢNH BÁO ĐỎ: PHÁT HIỆN BẢN THẢO ĐÃ BỊ SỬA ĐỔI / ĐÁNH TRÁO NỘI DUNG!';
  if (candExactHash === seal.exactSha256) {
    status = 'EXACT_MATCH';
    statusTitle = '✅ KHỚP TUYỆT ĐỐI 100% (EXACT BIT-FOR-BIT SHA-256) — An toàn để đặt bút ký!';
  } else if (candNormHash === seal.normalizedSha256) {
    status = 'CANONICAL_MATCH';
    statusTitle =
      '✅ KHỚP 100% NỘI DUNG CÂU CHỮ & CON SỐ (Chỉ khác khoảng trắng/xuống dòng khi chuyển đổi Word/PDF) — An toàn để ký!';
  }

  // Pinpoint exact tampered lines if tampered
  let tamperedLines = [];
  let sneakyAlerts = [];
  if (status === 'TAMPERED' && seal.sealedTextSnapshot) {
    const redline = compareContractsRedline(seal.sealedTextSnapshot, candRaw);
    sneakyAlerts = redline.sneakyAlerts;
    tamperedLines = redline.paragraphDiffs
      .filter((p) => p.isModified)
      .map((p) => ({
        paragraphIndex: p.index,
        sealedOriginal: p.oldText,
        candidateModified: p.newText,
        tokens: p.tokens
      }));
  }

  return {
    verifiedAt: new Date().toISOString(),
    sealCode: seal.sealCode,
    sealTitle: seal.title,
    sealedAt: seal.sealedAt,
    status,
    statusTitle,
    hashes: {
      expectedExactSha256: seal.exactSha256,
      candidateExactSha256: candExactHash,
      expectedNormalizedSha256: seal.normalizedSha256,
      candidateNormalizedSha256: candNormHash
    },
    tamperedCount: tamperedLines.length,
    sneakyAlerts,
    tamperedLines
  };
}

// ============================================================================
// 6. SO SÁNH 2 BẢN THẢO HỢP ĐỒNG (VISUAL REDLINE DIFF + SNEAKY EDIT DETECTOR)
// ============================================================================

function tokenizeWords(text) {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .split(/(\s+)/)
    .filter((t) => t.length > 0);
}

function diffParagraphTokens(oldText, newText) {
  const a = tokenizeWords(oldText);
  const b = tokenizeWords(newText);
  const n = a.length;
  const m = b.length;

  if (n * m > 250000) {
    if (oldText === newText) return [{ type: 'same', value: oldText }];
    return [
      { type: 'removed', value: oldText },
      { type: 'added', value: newText }
    ];
  }

  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (a[i] === b[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const rawOps = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      rawOps.push({ type: 'same', value: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      rawOps.push({ type: 'removed', value: a[i] });
      i++;
    } else {
      rawOps.push({ type: 'added', value: b[j] });
      j++;
    }
  }
  while (i < n) rawOps.push({ type: 'removed', value: a[i++] });
  while (j < m) rawOps.push({ type: 'added', value: b[j++] });

  const merged = [];
  for (const op of rawOps) {
    if (merged.length > 0 && merged[merged.length - 1].type === op.type) {
      merged[merged.length - 1].value += op.value;
    } else {
      merged.push({ ...op });
    }
  }
  return merged;
}

function detectSneakyEdits(oldPara, newPara, index) {
  const alerts = [];
  if (oldPara === newPara) return alerts;

  const numRegex =
    /\$\d+(?:,\d{3})*(?:\.\d+)?|\b\d+(?:[.,]\d+)*(?:\s*%|\s*VNĐ|\s*USD|\s*đồng|\s*ngày|\s*tháng|\s*năm|\s*days|\s*years)?\b/gi;
  const oldNums = (oldPara.match(numRegex) || []).map((s) => s.trim());
  const newNums = (newPara.match(numRegex) || []).map((s) => s.trim());
  if (oldNums.join('|') !== newNums.join('|') && (oldNums.length > 0 || newNums.length > 0)) {
    alerts.push({
      type: 'NUMERIC_SHIFT',
      severity: 'CRITICAL',
      paragraphIndex: index,
      title: 'Thay đổi Con số / Số tiền / Thời hạn / Tỷ lệ %',
      detail: `Bản gốc: [${oldNums.join(', ') || 'Không có'}] ➔ Bản đối tác: [${newNums.join(', ') || 'Đã xóa'}]`
    });
  }

  const hasStrongOld = /\b(phải|bắt buộc|cam kết|shall|agrees to|must)\b/i.test(oldPara);
  const hasWeakNew = /\b(có thể|tùy tình hình|cố gắng|may|endeavor to)\b/i.test(newPara);
  if (hasStrongOld && hasWeakNew) {
    alerts.push({
      type: 'MODAL_WEAKENING',
      severity: 'HIGH',
      paragraphIndex: index,
      title: 'Làm yếu nghĩa vụ pháp lý ("phải/shall/agrees" ➔ "có thể/may")',
      detail: 'Đối tác đã nới lỏng nghĩa vụ bắt buộc thành tùy nghi trong điều khoản này.'
    });
  }

  const oldACount = (oldPara.match(/Bên A|Client|Party A/gi) || []).length;
  const newACount = (newPara.match(/Bên A|Client|Party A/gi) || []).length;
  const oldBCount = (oldPara.match(/Bên B|Contractor|Party B/gi) || []).length;
  const newBCount = (newPara.match(/Bên B|Contractor|Party B/gi) || []).length;
  if (oldACount !== newACount || oldBCount !== newBCount) {
    alerts.push({
      type: 'PARTY_SHIFT',
      severity: 'HIGH',
      paragraphIndex: index,
      title: 'Thay đổi Chủ thể chịu trách nhiệm (Bên A/Client ↔ Bên B/Contractor)',
      detail: 'Số lần nhắc tới chủ thể nghĩa vụ trong điều khoản đã bị thay đổi hoặc đẩy sang phía bạn.'
    });
  }

  const oldNeg = (oldPara.match(/\b(không|chưa|miễn|not|without|never)\b/gi) || []).length;
  const newNeg = (newPara.match(/\b(không|chưa|miễn|not|without|never)\b/gi) || []).length;
  if (oldNeg !== newNeg) {
    alerts.push({
      type: 'NEGATION_FLIP',
      severity: 'CRITICAL',
      paragraphIndex: index,
      title: 'Thay đổi Từ phủ định ("không / not / without")',
      detail: 'Phát hiện thêm hoặc xóa từ phủ định làm đảo ngược ý nghĩa pháp lý của câu.'
    });
  }

  return alerts;
}

function compareContractsRedline(originalText, revisedText) {
  const origParas = String(originalText || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  const revParas = String(revisedText || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  const maxLen = Math.max(origParas.length, revParas.length);
  const paragraphDiffs = [];
  const sneakyAlerts = [];
  let changedParagraphs = 0;
  let addedWords = 0;
  let removedWords = 0;

  for (let idx = 0; idx < maxLen; idx++) {
    const oldP = origParas[idx] || '';
    const newP = revParas[idx] || '';
    const isModified = oldP !== newP;
    if (isModified) changedParagraphs++;

    const tokens = diffParagraphTokens(oldP, newP);
    tokens.forEach((tk) => {
      const wc = tk.value.trim() ? tk.value.trim().split(/\s+/).length : 0;
      if (tk.type === 'added') addedWords += wc;
      if (tk.type === 'removed') removedWords += wc;
    });

    const alerts = detectSneakyEdits(oldP, newP, idx + 1);
    sneakyAlerts.push(...alerts);

    paragraphDiffs.push({
      index: idx + 1,
      isModified,
      oldText: oldP,
      newText: newP,
      tokens,
      alerts
    });
  }

  const origAudit = analyzeContract(originalText);
  const revAudit = analyzeContract(revisedText);

  return {
    summary: {
      totalParagraphs: maxLen,
      changedParagraphs,
      unchangedParagraphs: maxLen - changedParagraphs,
      addedWords,
      removedWords,
      sneakyAlertCount: sneakyAlerts.length,
      originalSafetyScore: origAudit.safetyScore,
      revisedSafetyScore: revAudit.safetyScore,
      scoreDelta: revAudit.safetyScore - origAudit.safetyScore
    },
    sneakyAlerts,
    paragraphDiffs
  };
}

// ============================================================================
// 7. LÁ CHẮN CHE DỮ LIỆU NHẠY CẢM (PII AUTO-REDACTOR & REVERSIBLE VAULT)
// ============================================================================

const PII_DETECTORS = [
  { type: 'CCCD_CMND', label: 'Số CCCD / CMND', regex: /\b(?:0\d{11}|\d{9})\b/g },
  { type: 'TAX_ID', label: 'Mã số thuế (MST)', regex: /(?<=Mã số thuế:\s*|MST:\s*)\b\d{10}(?:-\d{3})?\b/gi },
  { type: 'PHONE', label: 'Số điện thoại', regex: /(?:\+84|0)(?:3|5|7|8|9)\d{8}\b/g },
  { type: 'EMAIL', label: 'Địa chỉ Email', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g },
  { type: 'BANK_ACCOUNT', label: 'Số tài khoản Ngân hàng', regex: /(?<=(?:Số tài khoản|STK)[^:\n]{0,20}:\s*)\b\d{8,16}\b/gi },
  {
    type: 'MONEY_AMOUNT',
    label: 'Số tiền / Mức lương',
    regex: /\$\d{1,3}(?:,\d{3})*(?:\.\d+)?(?:\s*USD)?|\b\d{1,3}(?:\.\d{3})+(?:\s*VNĐ|\s*đồng)(?:\/tháng|\/năm)?/gi
  },
  { type: 'LICENSE_PLATE', label: 'Biển kiểm soát xe', regex: /\b\d{2}[A-Z]-\d{3}\.\d{2}\b/g }
];

function redactContractPII(text, mode = 'TOKEN_VAULT', enabledTypes = null) {
  let redactedText = String(text || '');
  const vaultMap = {};
  const detectedItems = [];
  const counters = {};

  const activeDetectors = enabledTypes
    ? PII_DETECTORS.filter((d) => enabledTypes.includes(d.type))
    : PII_DETECTORS;

  for (const detector of activeDetectors) {
    redactedText = redactedText.replace(detector.regex, (match) => {
      counters[detector.type] = (counters[detector.type] || 0) + 1;
      const seq = String(counters[detector.type]).padStart(2, '0');
      const token = `[${detector.type}_${seq}]`;

      let replacement = token;
      if (mode === 'BLACKOUT') {
        replacement = '████████████';
      } else if (mode === 'PARTIAL_MASK') {
        replacement = match.length <= 4 ? '***' : `${match.slice(0, 3)}***${match.slice(-2)}`;
      }

      vaultMap[token] = {
        token,
        type: detector.type,
        label: detector.label,
        originalValue: match,
        replacement
      };
      detectedItems.push(vaultMap[token]);
      return replacement;
    });
  }

  return {
    mode,
    totalRedacted: detectedItems.length,
    redactedText,
    vaultMap,
    detectedItems
  };
}

function restoreContractPII(redactedText, vaultMap) {
  let restored = String(redactedText || '');
  const entries = Object.values(vaultMap || {});
  for (const item of entries) {
    if (item && item.token && item.originalValue) {
      restored = restored.split(item.token).join(item.originalValue);
    }
  }
  return { restoredText: restored, restoredCount: entries.length };
}

// ============================================================================
// 8. BỘ ĐỌC FILE .DOCX + .PDF THUẦN NODE.JS & BỘ XUẤT .DOCX + SAMPLE .PDF
// ============================================================================

function decodeXmlEntities(str) {
  return String(str || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function extractTextFromDocxBuffer(buf) {
  let offset = 0;
  while (offset + 30 <= buf.length) {
    const sig = buf.readUInt32LE(offset);
    if (sig !== 0x04034b50) break;
    const compressionMethod = buf.readUInt16LE(offset + 8);
    const compressedSize = buf.readUInt32LE(offset + 18);
    const fileNameLen = buf.readUInt16LE(offset + 26);
    const extraLen = buf.readUInt16LE(offset + 28);
    const fileName = buf.subarray(offset + 30, offset + 30 + fileNameLen).toString('utf8');
    const dataStart = offset + 30 + fileNameLen + extraLen;
    const dataEnd = dataStart + compressedSize;

    if (fileName === 'word/document.xml') {
      const rawData = buf.subarray(dataStart, dataEnd);
      const xmlBuf = compressionMethod === 8 ? zlib.inflateRawSync(rawData) : rawData;
      const xml = xmlBuf.toString('utf8');
      const withBreaks = xml
        .replace(/<w:tab\b[^>]*\/>/g, '\t')
        .replace(/<w:br\b[^>]*\/>/g, '\n')
        .replace(/<\/w:p>/g, '\n');
      const plain = decodeXmlEntities(withBreaks.replace(/<[^>]+>/g, ''));
      return plain
        .split('\n')
        .map((line) => line.trim())
        .filter((line, idx, arr) => line.length > 0 || (idx > 0 && arr[idx - 1].length > 0))
        .join('\n');
    }
    offset = dataEnd;
  }
  throw new Error('Không tìm thấy cấu trúc word/document.xml hợp lệ trong tệp .docx');
}

/**
 * Bộ bóc tách văn bản từ tệp .PDF thuần Node.js (Hỗ trợ cả FlateDecode nén zlib, chuỗi Literal (...) Tj/TJ & Hex UTF-16BE <FEFF...>)
 */
function decodePdfLiteralString(str) {
  let out = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '\\' && i + 1 < str.length) {
      const next = str[i + 1];
      if (next === 'n') {
        out += '\n';
        i++;
      } else if (next === 'r') {
        out += '\r';
        i++;
      } else if (next === 't') {
        out += '\t';
        i++;
      } else if (/[0-7]/.test(next)) {
        const oct = str.slice(i + 1, i + 4).match(/^[0-7]{1,3}/)[0];
        out += String.fromCharCode(parseInt(oct, 8));
        i += oct.length;
      } else {
        out += next;
        i++;
      }
    } else {
      out += ch;
    }
  }
  return out;
}

function decodePdfHexString(hex) {
  const clean = hex.replace(/\s+/g, '');
  const padded = clean.length % 2 === 1 ? clean + '0' : clean;
  const buf = Buffer.from(padded, 'hex');
  // Check UTF-16BE BOM (FE FF) or multibyte pairs
  if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) {
    let text = '';
    for (let i = 2; i + 1 < buf.length; i += 2) {
      text += String.fromCharCode((buf[i] << 8) | buf[i + 1]);
    }
    return text;
  }
  return buf.toString('utf8');
}

function parsePdfContentStream(content) {
  const lines = [];
  const btBlocks = content.match(/BT[\s\S]*?ET/g) || [content];

  for (const block of btBlocks) {
    let blockText = '';
    // Match literal strings (...) or hex strings <...> inside Tj / TJ / '
    const tokenRegex = /\((?:\\.|[^\\()])*\)\s*(?:Tj|')|<([0-9A-Fa-f\s]+)>\s*Tj|\[([\s\S]*?)\]\s*TJ|T\*|\bTd\b|\bTD\b/g;
    let m;
    while ((m = tokenRegex.exec(block)) !== null) {
      const full = m[0];
      if (full === 'T*' || full === 'Td' || full === 'TD') {
        if (blockText && !blockText.endsWith('\n')) blockText += '\n';
      } else if (m[1] !== undefined) {
        blockText += decodePdfHexString(m[1]);
      } else if (m[2] !== undefined) {
        const arrContent = m[2];
        const subRegex = /\(((?:\\.|[^\\()])*)\)|<([0-9A-Fa-f\s]+)>/g;
        let sm;
        while ((sm = subRegex.exec(arrContent)) !== null) {
          if (sm[1] !== undefined) blockText += decodePdfLiteralString(sm[1]);
          else if (sm[2] !== undefined) blockText += decodePdfHexString(sm[2]);
        }
      } else if (full.startsWith('(')) {
        const endParen = full.lastIndexOf(')');
        blockText += decodePdfLiteralString(full.slice(1, endParen));
      }
    }
    if (blockText.trim()) lines.push(blockText.trim());
  }

  return lines.join('\n');
}

function extractTextFromPdfBuffer(buf) {
  if (buf.subarray(0, 5).toString('latin1') !== '%PDF-') {
    throw new Error('Tệp tải lên không đúng định dạng header %PDF-');
  }

  const rawLatin1 = buf.toString('latin1');
  const extractedChunks = [];

  // Iterate over all stream ... endstream objects
  let searchPos = 0;
  while (true) {
    const streamIdx = rawLatin1.indexOf('stream', searchPos);
    if (streamIdx === -1) break;
    // Ensure 'stream' is not part of 'endstream'
    if (streamIdx >= 3 && rawLatin1.slice(streamIdx - 3, streamIdx) === 'end') {
      searchPos = streamIdx + 6;
      continue;
    }

    let dataStart = streamIdx + 6;
    if (rawLatin1[dataStart] === '\r' && rawLatin1[dataStart + 1] === '\n') dataStart += 2;
    else if (rawLatin1[dataStart] === '\n' || rawLatin1[dataStart] === '\r') dataStart += 1;

    const endStreamIdx = rawLatin1.indexOf('endstream', dataStart);
    if (endStreamIdx === -1) break;

    let dataEnd = endStreamIdx;
    if (rawLatin1[dataEnd - 2] === '\r' && rawLatin1[dataEnd - 1] === '\n') dataEnd -= 2;
    else if (rawLatin1[dataEnd - 1] === '\n' || rawLatin1[dataEnd - 1] === '\r') dataEnd -= 1;

    const streamSlice = buf.subarray(dataStart, dataEnd);
    const headerSlice = rawLatin1.slice(Math.max(0, streamIdx - 260), streamIdx);

    let decodedContent = '';
    if (/\/FlateDecode\b/.test(headerSlice)) {
      try {
        decodedContent = zlib.inflateSync(streamSlice).toString('latin1');
      } catch {
        try {
          decodedContent = zlib.inflateRawSync(streamSlice).toString('latin1');
        } catch {
          decodedContent = '';
        }
      }
    } else {
      decodedContent = streamSlice.toString('latin1');
    }

    if (decodedContent && (decodedContent.includes('Tj') || decodedContent.includes('TJ'))) {
      const txt = parsePdfContentStream(decodedContent);
      if (txt.trim()) extractedChunks.push(txt.trim());
    }

    searchPos = endStreamIdx + 9;
  }

  const finalResult = extractedChunks.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  if (!finalResult) {
    throw new Error(
      'Tệp PDF này là bản Scan dạng ảnh (không có lớp văn bản số bên trong) hoặc sử dụng bảng mã font tùy biến riêng.'
    );
  }
  return finalResult;
}

/**
 * Sinh tệp .PDF hợp lệ thuần Node.js (Dùng FlateDecode + UTF-16BE / ASCII stream) để người dùng có thể xuất hoặc kiểm thử đọc .PDF
 */
function generateContractPdfBuffer(contractText) {
  const lines = String(contractText || '').replace(/\r\n/g, '\n').split('\n');
  const streamOps = ['BT', '/F1 11 Tf', '50 790 Td'];

  for (const line of lines.slice(0, 62)) {
    // Encode UTF-16BE hex string with BOM FEFF so both Vietnamese & English preserve 100% fidelity in PDF text layer
    const utf16beBytes = [0xfe, 0xff];
    for (let i = 0; i < line.length; i++) {
      const code = line.charCodeAt(i);
      utf16beBytes.push((code >> 8) & 0xff, code & 0xff);
    }
    const hex = Buffer.from(utf16beBytes).toString('hex').toUpperCase();
    streamOps.push(`<${hex}> Tj`);
    streamOps.push('0 -12 Td');
  }
  streamOps.push('ET');

  const deflated = zlib.deflateSync(Buffer.from(streamOps.join('\n'), 'latin1'));

  const parts = [];
  const offsets = [];
  let len = 0;
  const pushStr = (s) => {
    const b = Buffer.isBuffer(s) ? s : Buffer.from(s, 'latin1');
    parts.push(b);
    len += b.length;
  };

  pushStr('%PDF-1.4\n');

  offsets[1] = len;
  pushStr('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  offsets[2] = len;
  pushStr('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

  offsets[3] = len;
  pushStr(
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n'
  );

  offsets[4] = len;
  pushStr('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');

  offsets[5] = len;
  pushStr(`5 0 obj\n<< /Length ${deflated.length} /Filter /FlateDecode >>\nstream\n`);
  pushStr(deflated);
  pushStr('\nendstream\nendobj\n');

  const xrefOffset = len;
  pushStr('xref\n0 6\n0000000000 65535 f \n');
  for (let i = 1; i <= 5; i++) {
    pushStr(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  }
  pushStr(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  return Buffer.concat(parts);
}

// CRC32 & ZIP Builder for .DOCX
const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC32_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createZipBuffer(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const file of files) {
    const nameBuf = Buffer.from(file.name, 'utf8');
    const dataBuf = Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data, 'utf8');
    const crc = crc32(dataBuf);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(dataBuf.length, 18);
    localHeader.writeUInt32LE(dataBuf.length, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localParts.push(localHeader, nameBuf, dataBuf);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(dataBuf.length, 20);
    centralHeader.writeUInt32LE(dataBuf.length, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    centralParts.push(centralHeader, nameBuf);
    offset += 30 + nameBuf.length + dataBuf.length;
  }

  const centralDirBuf = Buffer.concat(centralParts);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralDirBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirBuf, eocd]);
}

function generateContractDocxBuffer({ title, contractText, auditReport }) {
  const lines = String(contractText || '').replace(/\r\n/g, '\n').split('\n');
  const paragraphsXml = [];

  if (title) {
    paragraphsXml.push(`
      <w:p>
        <w:pPr><w:jc w:val="center"/><w:spacing w:after="200"/></w:pPr>
        <w:r>
          <w:rPr><w:b/><w:sz w:val="32"/><w:color w:val="1E3A8A"/></w:rPr>
          <w:t>${escapeXml(title)}</w:t>
        </w:r>
      </w:p>
    `);
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      paragraphsXml.push('<w:p><w:r><w:t></w:t></w:r></w:p>');
      continue;
    }
    const isHeading = /^(CỘNG HÒA|Độc lập|HỢP ĐỒNG|THỎA THUẬN|ĐIỀU\s+\d+|BÊN\s+[AB]|MASTER\s+|ARTICLE\s+\d+|CLIENT|CONTRACTOR)/i.test(line);
    const isCenter = /^(CỘNG HÒA|Độc lập|---o0o---|HỢP ĐỒNG|THỎA THUẬN|Số:|MASTER\s+|Contract Ref:)/i.test(line);
    paragraphsXml.push(`
      <w:p>
        <w:pPr>
          ${isCenter ? '<w:jc w:val="center"/>' : '<w:jc w:val="both"/>'}
          <w:spacing w:after="120" w:line="300" w:lineRule="auto"/>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
            ${isHeading ? '<w:b/>' : ''}
            <w:sz w:val="26"/>
          </w:rPr>
          <w:t>${escapeXml(line)}</w:t>
        </w:r>
      </w:p>
    `);
  }

  // Append SHA-256 Integrity Footer automatically
  const sealDigest = sha256Hex(normalizeTextForSeal(contractText));
  paragraphsXml.push(`
    <w:p>
      <w:pPr><w:spacing w:before="280" w:after="80"/></w:pPr>
      <w:r>
        <w:rPr><w:i/><w:sz w:val="18"/><w:color w:val="475569"/></w:rPr>
        <w:t>${escapeXml(`[ContractShield SHA-256 Integrity Seal: ${sealDigest}]`)}</w:t>
      </w:r>
    </w:p>
  `);

  if (auditReport && Array.isArray(auditReport.findings) && auditReport.findings.length > 0) {
    paragraphsXml.push(`
      <w:p>
        <w:pPr><w:spacing w:before="360" w:after="160"/></w:pPr>
        <w:r>
          <w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="B91C1C"/></w:rPr>
          <w:t>PHỤ LỤC KIỂM TOÁN RỦI RO PHÁP LÝ (CONTRACTSHIELD REPORT)</w:t>
        </w:r>
      </w:p>
      <w:p>
        <w:r>
          <w:rPr><w:b/><w:sz w:val="24"/></w:rPr>
          <w:t>${escapeXml(`Điểm An Toàn: ${auditReport.safetyScore}/100 (Hạng ${auditReport.grade}) — ${auditReport.verdict}`)}</w:t>
        </w:r>
      </w:p>
    `);

    for (const f of auditReport.findings) {
      paragraphsXml.push(`
        <w:p>
          <w:pPr><w:spacing w:before="160" w:after="80"/></w:pPr>
          <w:r>
            <w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="DC2626"/></w:rPr>
            <w:t>${escapeXml(`[${f.severity}] ${f.title} (${f.legalBasis})`)}</w:t>
          </w:r>
        </w:p>
        <w:p>
          <w:r>
            <w:rPr><w:i/><w:sz w:val="22"/></w:rPr>
            <w:t>${escapeXml(`• Phân tích: ${f.explanation}`)}</w:t>
          </w:r>
        </w:p>
        <w:p>
          <w:r>
            <w:rPr><w:sz w:val="22"/><w:color w:val="047857"/></w:rPr>
            <w:t>${escapeXml(`• Đề xuất sửa đổi: ${f.safeReplacement}`)}</w:t>
          </w:r>
        </w:p>
      `);
    }
  }

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraphsXml.join('\n')}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1800" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const wordRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;

  return createZipBuffer([
    { name: '[Content_Types].xml', data: contentTypesXml },
    { name: '_rels/.rels', data: relsXml },
    { name: 'word/_rels/document.xml.rels', data: wordRelsXml },
    { name: 'word/document.xml', data: documentXml }
  ]);
}

// ============================================================================
// 9. LỊCH SỬ KIỂM TOÁN & IOC ĐỐI TÁC
// ============================================================================

function loadAuditHistory() {
  try {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveAuditRecord(record) {
  const history = loadAuditHistory();
  history.unshift({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...record
  });
  const trimmed = history.slice(0, 30);
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(trimmed, null, 2), 'utf8');
  return trimmed[0];
}

function extractPartnerIOCs(text) {
  const src = String(text || '');
  const emails = [...new Set(src.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g) || [])];
  const phones = [...new Set(src.match(/(?:\+84|0)(?:3|5|7|8|9)\d{8}\b/g) || [])];
  const taxIds = [...new Set(src.match(/(?<=Mã số thuế:\s*|MST:\s*)\b\d{10}(?:-\d{3})?\b/gi) || [])];
  const bankAccounts = [...new Set(src.match(/(?<=(?:Số tài khoản|STK)[^:\n]{0,20}:\s*)\b\d{8,16}\b/gi) || [])];
  const domains = [
    ...new Set(emails.map((e) => e.split('@')[1]).filter((d) => d && !/gmail\.com|yahoo\.com|outlook\.com/i.test(d)))
  ];
  return { emails, phones, taxIds, bankAccounts, domains };
}

// ============================================================================
// 10. HTTP SERVER & REST API ENDPOINTS
// ============================================================================

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > 20 * 1024 * 1024) {
        reject(new Error('Payload quá lớn (>20MB)'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('JSON không hợp lệ'));
      }
    });
    req.on('error', reject);
  });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  try {
    // 1. Health
    if (pathname === '/api/health' && req.method === 'GET') {
      return sendJson(res, 200, {
        ok: true,
        version: '4.0.0',
        service: 'ContractShield & Redline Enterprise CLM',
        port: PORT,
        rulesCount: LEGAL_AUDIT_RULES.length,
        playbookCount: v3Engines.loadCustomPlaybook().length,
        presetsCount: PRESET_CONTRACTS.length,
        supportedFormats: ['.docx', '.pdf', '.png', '.jpg', '.webp', '.txt', '.md', '.csv', '.ics']
      });
    }

    // 2. Presets
    if (pathname === '/api/presets' && req.method === 'GET') {
      return sendJson(res, 200, {
        ok: true,
        presets: PRESET_CONTRACTS,
        rules: LEGAL_AUDIT_RULES.map((r) => ({
          id: r.id,
          lang: r.lang || 'VI',
          title: r.title,
          category: r.category,
          severity: r.severity,
          legalBasis: r.legalBasis
        }))
      });
    }

    // 3. Audit Contract
    if (pathname === '/api/audit' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const text = String(body.text || '').trim();
      if (!text) {
        return sendJson(res, 400, { ok: false, error: 'Vui lòng nhập hoặc tải nội dung hợp đồng cần kiểm toán.' });
      }
      const report = analyzeContract(text, body.protectParty || 'PARTY_B');
      const partnerIOCs = extractPartnerIOCs(text);

      if (body.saveHistory !== false) {
        saveAuditRecord({
          title: body.title || 'Kiểm toán Hợp đồng Pháp lý',
          language: report.detectedLanguage,
          safetyScore: report.safetyScore,
          grade: report.grade,
          findingsCount: report.counts.total,
          criticalCount: report.counts.critical
        });
      }

      return sendJson(res, 200, { ok: true, report, partnerIOCs });
    }

    // 4. Negotiation Email Generator (3 Tones, VI & EN)
    if (pathname === '/api/negotiation-email' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const text = String(body.text || '').trim();
      if (!text) {
        return sendJson(res, 400, { ok: false, error: 'Không có nội dung hợp đồng để soạn email đàm phán.' });
      }
      const emailDraft = generateNegotiationEmail({
        text,
        tone: body.tone || 'PROFESSIONAL',
        language: body.language || 'AUTO',
        recipientName: body.recipientName || '',
        senderName: body.senderName || '',
        contractTitle: body.contractTitle || ''
      });
      return sendJson(res, 200, { ok: true, emailDraft });
    }

    // 5. SHA-256 Integrity Seal (Create, List, Verify)
    if (pathname === '/api/seal/list' && req.method === 'GET') {
      const seals = loadSeals().map(({ sealedTextSnapshot, ...rest }) => rest);
      return sendJson(res, 200, { ok: true, seals });
    }

    if (pathname === '/api/seal/create' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const contractText = String(body.contractText || '').trim();
      if (!contractText) {
        return sendJson(res, 400, { ok: false, error: 'Nội dung hợp đồng trống, không thể niêm phong.' });
      }
      const seal = createContractSeal({
        title: body.title || 'Bản Hợp Đồng Đã Duyệt Chốt Ký',
        contractText,
        signerNote: body.signerNote || ''
      });
      return sendJson(res, 200, { ok: true, seal });
    }

    if (pathname === '/api/seal/verify' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const candidateText = String(body.candidateText || '').trim();
      if (!candidateText) {
        return sendJson(res, 400, { ok: false, error: 'Vui lòng dán hoặc tải file Bản thảo đem đi ký để đối chiếu.' });
      }
      const verification = verifyContractAgainstSeal({
        sealCodeOrId: body.sealCodeOrId,
        candidateText,
        referenceSnapshot: body.referenceSnapshot || null
      });
      return sendJson(res, 200, { ok: true, verification });
    }

    // 6. Redline Diff
    if (pathname === '/api/redline-diff' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const originalText = String(body.originalText || '');
      const revisedText = String(body.revisedText || '');
      if (!originalText.trim() || !revisedText.trim()) {
        return sendJson(res, 400, { ok: false, error: 'Cần có cả Bản gốc (v1) và Bản đối tác sửa (v2) để so sánh.' });
      }
      const diffResult = compareContractsRedline(originalText, revisedText);
      return sendJson(res, 200, { ok: true, diffResult });
    }

    // 7. PII Redactor & Restore
    if (pathname === '/api/redact-pii' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const result = redactContractPII(
        body.text || '',
        body.mode || 'TOKEN_VAULT',
        Array.isArray(body.enabledTypes) ? body.enabledTypes : null
      );
      return sendJson(res, 200, { ok: true, ...result });
    }

    if (pathname === '/api/restore-pii' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const result = restoreContractPII(body.redactedText || '', body.vaultMap || {});
      return sendJson(res, 200, { ok: true, ...result });
    }

    // 8. Parse Uploaded File (.DOCX / .PDF / .PNG / .JPG / .WEBP / .TXT / .MD)
    if ((pathname === '/api/parse-docx' || pathname === '/api/parse-file') && req.method === 'POST') {
      const body = await readJsonBody(req);
      const fileName = String(body.fileName || 'contract.docx');
      const lower = fileName.toLowerCase();
      const base64Data = String(body.base64Data || '').replace(/^data:[^;]+;base64,/, '');
      const buf = Buffer.from(base64Data, 'base64');

      let extractedText = '';
      let format = 'TXT';
      let ocrMeta = null;
      if (lower.endsWith('.docx')) {
        extractedText = extractTextFromDocxBuffer(buf);
        format = 'DOCX';
      } else if (lower.endsWith('.pdf') || buf.subarray(0, 5).toString('latin1') === '%PDF-') {
        extractedText = extractTextFromPdfBuffer(buf);
        format = 'PDF';
      } else if (/\.(png|jpe?g|webp|bmp)$/i.test(lower)) {
        const ocrRes = await v3Engines.performContractImageOcr({ base64Data, fileName });
        extractedText = ocrRes.text;
        format = 'IMAGE_OCR';
        ocrMeta = { engine: ocrRes.engine, confidence: ocrRes.confidence };
      } else {
        extractedText = buf.toString('utf8');
        format = 'TXT';
      }
      return sendJson(res, 200, {
        ok: true,
        fileName,
        format,
        ocrMeta,
        text: extractedText,
        charCount: extractedText.length
      });
    }

    // 8b. Dedicated Paper Contract Photo / Webcam OCR Endpoint
    if (pathname === '/api/ocr-image' && req.method === 'POST') {
      const body = await readJsonBody(req);
      if (!body.base64Data) {
        return sendJson(res, 400, { ok: false, error: 'Thiếu dữ liệu ảnh chụp hợp đồng.' });
      }
      const ocrRes = await v3Engines.performContractImageOcr({
        base64Data: body.base64Data,
        fileName: body.fileName || 'webcam-capture.png',
        lang: body.lang || 'vie+eng'
      });
      return sendJson(res, 200, { ok: true, ...ocrRes });
    }

    // 8c. What-If Breach & Penalty Financial Simulator
    if (pathname === '/api/simulate-financials' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const simulation = v3Engines.simulateFinancialExposure(body.text || '', {
        delayDays: body.delayDays,
        loanMonths: body.loanMonths,
        triggerEarlyExit: body.triggerEarlyExit
      });
      return sendJson(res, 200, { ok: true, simulation });
    }

    // 8d. Obligation Timeline & RFC 5545 .ICS Calendar Export
    if (pathname === '/api/obligations' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const timeline = v3Engines.extractObligationTimeline(body.text || '');
      return sendJson(res, 200, { ok: true, timeline });
    }

    if (pathname === '/api/export-ics' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const timeline = v3Engines.extractObligationTimeline(body.text || '');
      const icsContent = v3Engines.generateIcsCalendar(timeline, body.title || 'Hợp Đồng Pháp Lý');
      const icsBuf = Buffer.from(icsContent, 'utf8');
      res.writeHead(200, {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="ContractShield_Reminders.ics"',
        'Content-Length': icsBuf.length
      });
      return res.end(icsBuf);
    }

    // 8e. Custom Playbook Management (GET / POST / TOGGLE / DELETE)
    if (pathname === '/api/playbook' && req.method === 'GET') {
      return sendJson(res, 200, { ok: true, rules: v3Engines.loadCustomPlaybook() });
    }

    if (pathname === '/api/playbook' && req.method === 'POST') {
      const body = await readJsonBody(req);
      if (!body.title || !body.patternStr) {
        return sendJson(res, 400, { ok: false, error: 'Cần nhập Tên quy tắc và Từ khóa/Regex cần bắt.' });
      }
      const rule = v3Engines.addPlaybookRule(body);
      return sendJson(res, 200, { ok: true, rule, rules: v3Engines.loadCustomPlaybook() });
    }

    if (pathname === '/api/playbook/toggle' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const rule = v3Engines.togglePlaybookRule(body.ruleId, body.enabled);
      return sendJson(res, 200, { ok: true, rule, rules: v3Engines.loadCustomPlaybook() });
    }

    if (pathname === '/api/playbook' && req.method === 'DELETE') {
      const body = await readJsonBody(req);
      const rules = v3Engines.deletePlaybookRule(body.ruleId);
      return sendJson(res, 200, { ok: true, rules });
    }

    // 8f. Hybrid AI Legal Counsel Q&A (Offline Retrieval + Optional Gemini API)
    if (pathname === '/api/qa' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const text = String(body.text || '').trim();
      if (!text) {
        return sendJson(res, 400, { ok: false, error: 'Chưa có văn bản hợp đồng để tra cứu câu trả lời.' });
      }
      const clauses = splitClauses(text);
      const auditReport = analyzeContract(text);
      const qaResult = await v3Engines.answerContractQuestion({
        text,
        question: body.question,
        clauses,
        auditReport,
        geminiApiKey: body.geminiApiKey
      });
      return sendJson(res, 200, { ok: true, ...qaResult });
    }

    // 8g. Live OmniTrace OSINT Due-Diligence Bridge (Port 4090)
    if (pathname === '/api/osint-push' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const text = String(body.text || '');
      const report = analyzeContract(text);
      const partnerIOCs = extractPartnerIOCs(text);
      const bridgeResult = await v3Engines.pushPartnerToOmniTrace({
        contractTitle: body.title || 'Contract_Audit',
        partnerIOCs,
        safetyScore: report.safetyScore
      });
      return sendJson(res, 200, { ok: true, partnerIOCs, bridgeResult });
    }

    // 8h. v4.0 Cryptographic Ed25519 PKI E-Signature Pad & Verification
    if (pathname === '/api/esign/list' && req.method === 'GET') {
      const list = v4Enterprise.loadEsignRecords().map(({ canonicalSnapshot, signedContractText, ...rest }) => rest);
      return sendJson(res, 200, { ok: true, records: list });
    }

    if (pathname === '/api/esign/sign' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const record = v4Enterprise.signContractEd25519({
        contractText: body.contractText || '',
        contractTitle: body.contractTitle || 'Hợp Đồng Ký Số PKI',
        signerName: body.signerName || 'Đại diện Hợp pháp',
        signerRole: body.signerRole || 'PARTY_B',
        signerEmail: body.signerEmail || '',
        drawnSignatureDataUrl: body.drawnSignatureDataUrl || ''
      });
      return sendJson(res, 200, { ok: true, record });
    }

    if (pathname === '/api/esign/verify' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const verification = v4Enterprise.verifyContractEd25519({
        certCodeOrId: body.certCodeOrId,
        candidateText: body.candidateText || '',
        publicKeyPem: body.publicKeyPem,
        signatureBase64: body.signatureBase64
      });
      return sendJson(res, 200, { ok: true, verification });
    }

    // 8i. v4.0 Batch Multi-Contract Portfolio Scanner & UTF-8 BOM .CSV Export
    if (pathname === '/api/batch-audit' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const itemsToScan = [];

      if (body.demoAllPresets) {
        for (const p of PRESET_CONTRACTS) {
          itemsToScan.push({
            fileName: `${p.id}.docx — ${p.title}`,
            format: 'PRESET_DOCX',
            text: p.originalText
          });
        }
      } else if (Array.isArray(body.files)) {
        for (const f of body.files) {
          const fname = String(f.fileName || 'contract.txt');
          const lower = fname.toLowerCase();
          if (f.rawText) {
            itemsToScan.push({ fileName: fname, format: 'TEXT', text: f.rawText });
            continue;
          }
          const b64 = String(f.base64Data || '').replace(/^data:[^;]+;base64,/, '');
          const buf = Buffer.from(b64, 'base64');
          let text = '';
          let format = 'TXT';
          if (lower.endsWith('.docx')) {
            text = extractTextFromDocxBuffer(buf);
            format = 'DOCX';
          } else if (lower.endsWith('.pdf') || buf.subarray(0, 5).toString('latin1') === '%PDF-') {
            text = extractTextFromPdfBuffer(buf);
            format = 'PDF';
          } else if (/\.(png|jpe?g|webp|bmp)$/i.test(lower)) {
            const ocr = await v3Engines.performContractImageOcr({ base64Data: b64, fileName: fname });
            text = ocr.text;
            format = 'IMAGE_OCR';
          } else {
            text = buf.toString('utf8');
          }
          itemsToScan.push({ fileName: fname, format, text });
        }
      }

      const batchReport = await v4Enterprise.runBatchPortfolioScan({
        items: itemsToScan,
        analyzeContractFn: analyzeContract,
        simulateFinancialsFn: v3Engines.simulateFinancialExposure,
        extractObligationsFn: v3Engines.extractObligationTimeline
      });
      return sendJson(res, 200, { ok: true, ...batchReport });
    }

    if (pathname === '/api/batch-export-csv' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const csvText = v4Enterprise.generateBatchPortfolioCsv(body.results || []);
      const csvBuf = Buffer.from(csvText, 'utf8');
      res.writeHead(200, {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="ContractShield_Portfolio_Matrix.csv"',
        'Content-Length': csvBuf.length
      });
      return res.end(csvBuf);
    }

    // 8j. v4.0 Invisible Zero-Width Leak Watermarker & Forensic Traitor Tracer
    if (pathname === '/api/watermark/embed' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const result = v4Enterprise.embedInvisibleLeakWatermarks({
        contractText: body.contractText || '',
        contractTitle: body.contractTitle || 'Dự Thảo Hợp Đồng Mật',
        recipients: Array.isArray(body.recipients) ? body.recipients : []
      });
      return sendJson(res, 200, { ok: true, ...result });
    }

    if (pathname === '/api/watermark/trace' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const traceResult = v4Enterprise.traceLeakedDocumentSnippet(body.leakedText || '');
      return sendJson(res, 200, { ok: true, traceResult });
    }

    // 9. Export .DOCX & Export .PDF
    if (pathname === '/api/export-docx' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const title = body.title || 'HỢP ĐỒNG ĐÃ KIỂM TOÁN & HIỆU ĐÍNH PHÁP LÝ';
      const contractText = body.contractText || '';
      const auditReport = body.includeAuditAppendix ? analyzeContract(contractText) : null;

      const docxBuffer = generateContractDocxBuffer({ title, contractText, auditReport });
      res.writeHead(200, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="ContractShield_Audited.docx"',
        'Content-Length': docxBuffer.length
      });
      return res.end(docxBuffer);
    }

    if (pathname === '/api/export-pdf' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const pdfBuf = generateContractPdfBuffer(body.contractText || '');
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="ContractShield_Sealed.pdf"',
        'Content-Length': pdfBuf.length
      });
      return res.end(pdfBuf);
    }

    // 10. Audit History
    if (pathname === '/api/history' && req.method === 'GET') {
      return sendJson(res, 200, { ok: true, history: loadAuditHistory() });
    }

    // Static Files
    const filePath = pathname === '/' ? path.join(PUBLIC_DIR, 'index.html') : path.join(PUBLIC_DIR, pathname);
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(PUBLIC_DIR))) {
      res.writeHead(403);
      return res.end('Forbidden');
    }

    if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()) {
      const ext = path.extname(resolvedPath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      return fs.createReadStream(resolvedPath).pipe(res);
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  } catch (err) {
    sendJson(res, 500, { ok: false, error: err.message || 'Lỗi máy chủ nội bộ' });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`⚖️ ContractShield & Redline Enterprise CLM v4.0 đang chạy tại http://localhost:${PORT}`);
});
