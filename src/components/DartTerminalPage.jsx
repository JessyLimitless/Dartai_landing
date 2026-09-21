import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { API } from '../lib/api'

/**
 * DART Terminal — 기관용 공시 관제 워크스페이스.
 *
 * 기준 화면은 사용자가 기획한 `dart_terminal_pro.html`(2026-09-14) 이고, 브랜딩은
 * __다트인/다트M → DART Terminal__ 로 통합된다. 이 파일은 그 목업을 __실제 API 에__
 * 붙인 것이다. 목업의 더미 데이터(테크윙 3회CB·심텍 7회CB 등)는 한 줄도 옮기지 않았다.
 *
 * ## 두 모드
 *   · 메자닌·오버행 원장 → `GET /api/dartm/overhang` · `/api/dartm/coverage`
 *   · 실시간 공시 피드   → `GET /api/flash/disclosures` · `/reports` · `/report/{no}`
 * 둘 다 `x-dartin-key` 가 있어야 열린다(서버가 잠근다. 프론트 게이트는 보안이 아니다).
 *
 * ## 이 화면이 지키는 것 (DARTIN.md §2 · CLAUDE.md 데이터 검증 의무)
 *   1. **없는 값을 지어내지 않는다.** 빈칸은 `-`·`0` 이 아니라 __[미기재]__ 로 찍고,
 *      왜 비었는지(`notes`)를 같이 보여준다.
 *   2. **커버리지를 자수한다.** 목업의 "전체 시장 (593)" 같은 숫자는 없다 —
 *      원장이 실제로 들고 있는 회차 수와 조항 확보율을 그대로 띄운다.
 *   3. **`confidence` 칸을 메자닌에 만들지 않는다.** `mezz_events` 에 그 컬럼이
 *      없어서 자리를 만들면 채우려고 숫자를 지어내게 된다(DARTIN.md §15-4 기각).
 *   4. **"실시간"이라고 쓰지 않는다.** 메자닌 크론이 아직 미설치라 지금은 배치조차
 *      안 돈다. 대신 __마지막 적립 시각__ 을 박는다(§15-5).
 *   5. **검산은 우리 계산이 아니라 발행사의 산술이다.** `cross_check` 문자열
 *      (`25,500,000,000÷2,304=11,067,708 ✓`)을 가공하지 않고 그대로 싣는다.
 *
 * ## 스코프
 * 앱의 다른 화면은 카드/박스 문법인데 여기는 고밀도 터미널이다. 2026-08-02 배당
 * 페이지 사고(전면 재설계 반려)를 반복하지 않으려고 __모든 CSS 를 `.dtp` 아래로
 * 가둔다.__ 전역 셀렉터·전역 클래스를 쓰지 않는다. 라우트 밖으로 새지 않는다.
 *
 * ⚠️ 게이트 점수·픽 종목·요인 분해는 여기 들어오지 않는다(CLAUDE.md 영업비밀).
 *    나가는 것은 DART 공개 원문과 그 정량 분해까지다.
 *
 * ## 톤 — 두 층 (DARTIN.md §36 · 2026-09-16 사용자 결정. 뒤집지 말 것)
 *   · 데이터 층(그리드·검산 원장) = __증권사 터미널__ 규율. 밀도 유지 · 숫자 우측정렬 · 강조 1행 1개 ·
 *     세로 괘선 없음 + hover · 헤더 고정 · 컬럼 삭제 없음(접기/2차 패널만).
 *   · 프레이밍 층(헤더·리드 한 줄·KPI·리포트 머리) = __에디토리얼__. 여백·타이포 위계·짧은 문장.
 *   · 색은 셋뿐 — 빨강 = 경보(하한 도달·풋 D-90·커버<1·검산 불일치) / 앰버 = 규모 막대 / 나머지 무채색.
 *   · 밀도 자체는 의도다(증권사 HTS 톤). "덜 빡빡하게"가 아니라 "증권사급인데 더 세련되게".
 */

/* ────────────────────────────────────────────────────────────────
   스코프 CSS — 전부 `.dtp` 아래. 팔레트는 DARTM_UI_SPEC 라이트 계열.
   §15-3 판정에 따라 다크를 기본으로 못 박지 않는다(사람이 고르기 전까지).
   ──────────────────────────────────────────────────────────────── */
const CSS = `
.dtp{--bg:#f1f5f9;--surf:#fff;--surf2:#f8fafc;--line:#e2e8f0;--line2:#cbd5e1;
 --ink:#0f172a;--ink2:#334155;--sub:#64748b;--mute:#94a3b8;
 --up:#dc2626;--down:#2563eb;--warn:#ea580c;--ok:#059669;
 --alert:#dc2626;--amber:#b45309;--amberBg:#fde68a;
 --onink:#fff;--chip:#f1f5f9;--zebra:#fafbfc;--hov:#eff6ff;--sel:#e0f2fe;
 --selline:#0284c7;--badge:#e2e8f0;--pin:#000;--btnA:#fff;--btnB:#f8fafc;
 --strip:#000;--stripFg:#fff;--stripInk:#e2e8f0;--stripLine:#1f2937;--stripSep:#475569;
 --tagFg:#475569;--okOnInk:#34d399;--badOnInk:#fca5a5;--noteBg:#fff7ed;--noteLine:#fed7aa;--g1:#fee2e2;--g2:#fef3c7;--g3:#e0f2fe;
 position:fixed;inset:0;display:flex;flex-direction:column;overflow:hidden;
 background:var(--bg);color:var(--ink);font-size:12px;
 font-family:Pretendard,-apple-system,BlinkMacSystemFont,system-ui,sans-serif;
 -webkit-font-smoothing:antialiased;z-index:1}
.dtp *{box-sizing:border-box}
.dtp .num{font-variant-numeric:tabular-nums;letter-spacing:-.01em}
.dtp .mute{color:var(--mute)}
.dtp .miss{color:var(--mute);font-style:normal}
/* 색 어휘 — 세 가지뿐이다(§34-3 A안). 빨강 = 경보(하한 도달·풋 D-90·커버<1·검산 불일치),
   앰버 = 규모(발행주식 대비 10%↑), 나머지는 무채색. 파랑은 링크에만 남긴다.
   같은 빨강이 규모·경보·등락 세 뜻으로 쓰이던 것을 끊는다. */
.dtp .alert{color:var(--alert);font-weight:700}
.dtp .amb{color:var(--amber);font-weight:700}
/* 빈 값 — 그리드에서는 흐린 대시. 채워진 값이 눈에 띄어야지 빈칸이 시끄러우면 안 된다.
   \`0\` 과 헷갈리지 않게 hover 에 [미기재] 를 남기고, 사유는 우측 패널 "왜 비었나" 가 맡는다. */
.dtp .dash{color:var(--mute);opacity:.75}

/* 상단 상태 스트립 — 목업의 LED 티커 자리. 지수·유통잔액은 수집하지 않으므로
   지어내지 않고, 대신 __원장이 실제로 들고 있는 것__ 을 띄운다. */
.dtp .strip{background:var(--strip);color:var(--stripInk);padding:4px 10px;display:flex;
 align-items:center;justify-content:space-between;gap:10px;flex:0 0 auto;
 font-size:10.5px;border-bottom:1px solid var(--stripLine);overflow:hidden}
.dtp .strip .grp{display:flex;align-items:center;gap:10px;white-space:nowrap;overflow:hidden}
.dtp .strip b{color:var(--stripFg);font-weight:700}
.dtp .strip .sep{color:var(--stripSep)}
.dtp .dot{width:6px;height:6px;border-radius:50%;display:inline-block}

.dtp header.bar{background:var(--surf);border-bottom:1px solid var(--line2);
 padding:8px 12px;display:flex;align-items:center;justify-content:space-between;
 gap:10px;flex:0 0 auto;flex-wrap:wrap}
.dtp .brand{display:flex;align-items:center;gap:6px;text-decoration:none;color:inherit}
.dtp a.brand:hover .nm{text-decoration:underline}
.dtp .brand .mk{width:24px;height:24px;background:var(--ink);color:var(--onink);display:flex;
 align-items:center;justify-content:center;font-weight:700;font-size:10px}
.dtp .brand .nm{font-weight:700;font-size:14px;letter-spacing:-.02em}
.dtp .brand .sub{font-size:9.5px;color:var(--mute);margin-top:1px;letter-spacing:.04em}

.dtp .modetabs{display:flex;background:var(--chip);border:1px solid var(--line2);padding:2px}
.dtp .modetabs button{border:0;background:transparent;color:var(--sub);font-weight:700;
 font-size:11px;padding:4px 10px;cursor:pointer;font-family:inherit}
.dtp .modetabs button.on{background:var(--ink);color:var(--onink)}

.dtp .btn{border:1px solid var(--line2);background:linear-gradient(180deg,var(--btnA),var(--btnB));
 color:var(--ink2);font-weight:600;padding:3px 8px;font-size:10.5px;cursor:pointer;
 display:inline-flex;align-items:center;gap:4px;font-family:inherit;user-select:none}
.dtp .btn:hover{background:var(--chip);border-color:var(--mute)}
.dtp .btn.on{background:var(--ink);color:var(--onink);border-color:var(--ink)}
.dtp .btn:disabled{opacity:.45;cursor:not-allowed}
.dtp .btn.dark{background:var(--ink2);color:var(--onink);border-color:var(--ink)}
.dtp input.fld{border:1px solid var(--line2);background:var(--surf2);padding:3px 7px;
 font-size:11px;font-family:inherit;color:var(--ink);outline:none;width:200px}
.dtp input.fld:focus{border-color:var(--ink2);background:var(--surf)}

/* KPI */
/* KPI 띠 = 프레이밍 층(에디토리얼). 회색 바닥 위 흰 카드에 여백을 주고, 리드 한 줄로 "무엇을 봐야 하나"를
   표 위에서 먼저 말한다. 아래 흰 그리드(데이터 층)와는 바닥 톤 하나로 경계가 갈린다. 참고 design/dartm_report_v2.html */
.dtp .frame{background:var(--bg);border-bottom:1px solid var(--line2);flex:0 0 auto;padding:8px 12px 10px}
.dtp .lead{font-size:13px;color:var(--ink2);line-height:1.5;margin:0 0 8px;letter-spacing:-.01em}
.dtp .lead b{color:var(--ink);font-weight:700}
.dtp .lead .ov{font-size:10.5px;font-weight:700;color:var(--sub);letter-spacing:.06em;text-transform:uppercase;margin-right:8px}
.dtp .kpis{display:flex;gap:8px}
.dtp .kpi{flex:1;padding:8px 13px 10px;background:var(--surf);border:1px solid var(--line2);
 border-top:2px solid var(--line2);min-width:0}
.dtp .kpi .k{font-size:10.5px;font-weight:600;color:var(--sub);letter-spacing:.02em;
 white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dtp .kpi .v{font-size:20px;font-weight:700;margin-top:5px;line-height:1.1;letter-spacing:-.03em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dtp .kpi .u{font-size:10.5px;color:var(--sub);font-weight:400;margin-left:5px;letter-spacing:0}

.dtp main.work{flex:1;display:flex;min-height:0}
.dtp .left{width:60%;display:flex;flex-direction:column;background:var(--surf);
 border-right:1px solid var(--line2);min-width:0}
.dtp .right{width:40%;display:flex;flex-direction:column;background:var(--surf2);
 overflow-y:auto;min-width:0}
.dtp .tbar{padding:5px 10px;background:var(--chip);border-bottom:1px solid var(--line2);
 display:flex;justify-content:space-between;align-items:center;gap:8px;flex:0 0 auto;flex-wrap:wrap}
.dtp .tbar .ttl{font-size:12px;font-weight:700}
.dtp .badge{font-size:10px;background:var(--badge);color:var(--ink2);padding:1px 5px;
 border:1px solid var(--line2);font-variant-numeric:tabular-nums}
.dtp .scroll{flex:1;overflow:auto;min-height:0}
.dtp .foot{background:var(--surf2);border-top:1px solid var(--line2);padding:4px 10px;
 font-size:10.5px;color:var(--sub);display:flex;justify-content:space-between;gap:10px;flex:0 0 auto;flex-wrap:wrap}
.dtp .foot .sw{display:inline-block;width:8px;height:8px;vertical-align:-1px;margin:0 3px 0 6px}

/* 그리드 — 한 셀 한 줄. 부기(코드·시장·기준일·부제)는 hover title 과 우측 패널 몫이다.
   세로 괘선을 없애고 가로선만 남긴다 — 같은 12px 로도 숨이 트인다(§34-3). 얼룩말 무늬 대신 hover. */
/* 고도화_0921 로 컬럼이 13→17. 60% 폭(1440 에서 864px)에 다 넣으면 종목명이 "한올소…" 로 뭉개진다.
   그래서 표는 __가로로 넘치게__ 두고(.scroll 이 양방향 스크롤) 종목명·# 만 왼쪽에 고정한다 — 스크롤해도 어느 회차인지 보인다. */
.dtp table.grid{border-collapse:collapse;width:100%;min-width:1280px}
.dtp table.grid th:first-child,.dtp table.grid td:first-child{position:sticky;left:0;z-index:3;background:var(--surf)}
.dtp table.grid th:nth-child(2),.dtp table.grid td.nm{position:sticky;left:26px;z-index:3;background:var(--surf);box-shadow:1px 0 0 var(--line2)}
.dtp table.grid thead th:first-child,.dtp table.grid thead th:nth-child(2){background:var(--surf2);z-index:4}
.dtp table.grid tbody tr:hover td:first-child,.dtp table.grid tbody tr:hover td.nm{background:var(--hov)}
.dtp table.grid tbody tr.sel td:first-child,.dtp table.grid tbody tr.sel td.nm{background:var(--sel)}
.dtp table.grid th{background:var(--surf2);border:0;border-bottom:1px solid var(--line2);
 border-top:2px solid var(--ink);padding:6px 6px;font-size:11px;font-weight:700;
 color:var(--ink2);text-transform:uppercase;letter-spacing:.03em;white-space:nowrap;
 position:sticky;top:0;z-index:2}
.dtp table.grid th.sub{font-weight:600;color:var(--sub)}
.dtp table.grid td{border:0;border-bottom:1px solid var(--line);padding:6px 6px;font-size:12px;
 line-height:1.4;white-space:nowrap;vertical-align:middle}
.dtp table.grid tbody tr:hover{background:var(--hov)}
.dtp table.grid tbody tr.sel{background:var(--sel);box-shadow:inset 3px 0 0 var(--ink)}
.dtp table.grid tbody tr{cursor:pointer}
.dtp .r{text-align:right}
.dtp .c{text-align:center}
.dtp .tag{font-size:10px;font-weight:700;padding:0 4px;border:1px solid currentColor;
 display:inline-block;line-height:16px}
.dtp .rnd{font-size:11px;font-weight:600;color:var(--ink2);margin-left:5px}
/* 전환가능 상태 — 색 어휘를 늘리지 않는다. 전환가능=잉크(테두리) · 락업=무채 · 종료=흐림. 경보색(빨강)은 안 쓴다 —
   "지금 나올 수 있는 물량" 은 사실이지 경보가 아니다. 경보는 하한·풋·커버·검산 넷뿐이다. */
.dtp .st{font-size:9.5px;font-weight:700;padding:0 4px;line-height:15px;margin-left:5px;white-space:nowrap;border:1px solid var(--line2);color:var(--sub);flex-shrink:0}
.dtp .st.on{color:var(--onink);background:var(--ink);border-color:var(--ink)}
.dtp .st.off{opacity:.55}
.dtp td.nm{min-width:230px;max-width:260px}
.dtp td.nm .row{display:flex;align-items:center;min-width:0}
.dtp td.nm .row b{overflow:hidden;text-overflow:ellipsis;min-width:0}
.dtp td.nm .row .code,.dtp td.nm .row .rnd,.dtp td.nm .row .tag{flex-shrink:0}
.dtp .code{font-size:11px;color:var(--mute);margin-left:5px}
/* 규모 데이터바 — 셀 배경에 얕게 깐다. 값은 글자, 크기는 바. 한 줄이다. */
.dtp td.bar{position:relative}
.dtp td.bar i{position:absolute;right:0;top:4px;bottom:4px;background:var(--amberBg);opacity:.45;z-index:0}
.dtp td.bar span{position:relative;z-index:1}

/* 우측 패널 */
.dtp .panel{background:var(--surf);border:1px solid var(--line2)}
.dtp .head{margin:10px 10px 8px;padding:12px 14px 12px;border-left:3px solid var(--ink)}
.dtp .head .ov{font-size:10.5px;font-weight:700;color:var(--sub);letter-spacing:.06em;text-transform:uppercase}
.dtp .head h2{margin:2px 0 0;font-size:18px;font-weight:700;letter-spacing:-.025em;display:inline;line-height:1.25}
.dtp .head .meta{margin-top:7px;font-size:12px;color:var(--ink2);line-height:1.55;letter-spacing:-.005em}
.dtp .head .meta b{color:var(--ink)}
.dtp .viz{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 10px 10px}
.dtp .viz .panel{padding:9px 11px;display:flex;flex-direction:column;min-height:78px}
.dtp .viz .vh{display:flex;justify-content:space-between;align-items:center;gap:6px;
 border-bottom:1px solid var(--line);padding-bottom:5px;margin-bottom:7px}
.dtp .viz .vh span:first-child{font-size:11px;font-weight:700;color:var(--ink2)}
.dtp .pill{font-size:10px;font-weight:700;padding:0 5px;line-height:17px;white-space:nowrap}
.dtp .gauge{position:relative;height:11px;border:1px solid var(--line2);overflow:hidden;
 background:linear-gradient(90deg,var(--g1) 0%,var(--g2) 40%,var(--g3) 100%)}
.dtp .gauge .floor{position:absolute;top:0;bottom:0;width:2px;background:var(--alert);z-index:1}
.dtp .gauge .pin{position:absolute;top:0;bottom:0;width:5px;background:var(--pin);z-index:2;
 transform:translateX(-50%)}
.dtp .stack{display:flex;height:13px;border:1px solid var(--line2);font-size:9px;
 color:var(--stripFg);line-height:13px;text-align:center;overflow:hidden}
.dtp .rowline{display:flex;justify-content:space-between;gap:8px;font-size:10.5px;
 color:var(--sub);margin-top:4px;line-height:1.45}
.dtp .kv{display:flex;justify-content:space-between;gap:10px;font-size:11px;padding:3px 0;line-height:1.45}
.dtp .kv .k{color:var(--sub)}
.dtp .kv .v{font-weight:700;font-variant-numeric:tabular-nums}

.dtp .audit{margin:0 10px 10px}
.dtp .audit .ah{background:var(--ink);color:var(--onink);padding:6px 10px;font-size:11px;
 font-weight:700;display:flex;justify-content:space-between;gap:8px;align-items:center}
.dtp .audit .abody{display:flex;border:1px solid var(--line2);border-top:0;background:var(--surf)}
.dtp .audit .col{width:50%;padding:10px;min-width:0}
.dtp .audit .col+.col{border-left:1px solid var(--line2);background:var(--surf2)}
.dtp .audit .ct{font-size:10px;font-weight:700;color:var(--sub);text-transform:uppercase;
 letter-spacing:.03em;border-bottom:1px solid var(--line);padding-bottom:4px;margin-bottom:7px;
 display:flex;justify-content:space-between;gap:6px}
.dtp .calc{background:var(--surf2);border:1px solid var(--line2);padding:7px 8px;
 font-size:10.5px;font-variant-numeric:tabular-nums;word-break:break-all;line-height:1.55}
.dtp table.raw{border-collapse:collapse;width:100%;border:1px solid var(--sub)}
.dtp table.raw th,.dtp table.raw td{border:1px solid var(--mute);padding:4px 6px;font-size:10.5px}
.dtp table.raw th{background:var(--badge);font-weight:600;text-align:left;width:50%}
.dtp table.raw td{text-align:right;font-variant-numeric:tabular-nums}

.dtp .note{font-size:11px;color:var(--warn);background:var(--noteBg);border:1px solid var(--noteLine);
 padding:6px 9px;margin-top:8px;line-height:1.55}
.dtp .empty{padding:28px 18px;text-align:center;color:var(--sub);font-size:12px;line-height:1.7}
.dtp .gate{max-width:560px;margin:40px auto;background:var(--surf);border:1px solid var(--line2);padding:20px}
.dtp .gate h3{margin:0 0 8px;font-size:15px}
.dtp .gate p{margin:0 0 12px;font-size:11.5px;color:var(--sub);line-height:1.7}
.dtp .toast{position:fixed;right:14px;bottom:14px;background:var(--ink);color:var(--onink);
 font-size:11px;padding:7px 12px;border:1px solid var(--ink2);z-index:20}
.dtp a{color:var(--down);text-decoration:none}
.dtp a:hover{text-decoration:underline}
.dtp ::-webkit-scrollbar{width:6px;height:6px}
.dtp ::-webkit-scrollbar-track{background:var(--chip)}
.dtp ::-webkit-scrollbar-thumb{background:var(--mute)}

/* 1024~1200: 13열 그리드가 우선이다. 우측 패널을 좁히고 viz 를 1열로 세운다. */
@media (max-width:1200px){
 .dtp .left{width:64%}
 .dtp .right{width:36%}
 .dtp .viz{grid-template-columns:1fr}
 .dtp table.grid th,.dtp table.grid td{padding:6px 5px}
}
@media (max-width:900px){
 .dtp main.work{flex-direction:column}
 .dtp .left,.dtp .right{width:100%}
 .dtp .left{flex:1 1 45%;border-right:0;border-bottom:1px solid var(--line2)}
 .dtp .right{flex:1 1 55%}
 .dtp .kpis{overflow-x:auto}
 .dtp .kpi{min-width:150px}
 .dtp .lead{font-size:12px}
}

/* 앱 테마를 따른다. ThemeContext 가 <html data-theme="dark"> 를 찍는다.
   __변수만__ 갈아끼우고 규칙은 건드리지 않는다 — 라이트와 구조가 갈리면
   한쪽만 고쳐지는 사고가 난다. */
[data-theme="dark"] .dtp{
 --bg:#0b1220;--surf:#111a2b;--surf2:#0e1726;--line:#1e2b41;--line2:#2b3b55;
 --ink:#e6edf7;--ink2:#c2cfe2;--sub:#93a6c2;--mute:#6b7d99;
 --up:#f87171;--down:#60a5fa;--warn:#fb923c;--ok:#34d399;
 --alert:#f87171;--amber:#fbbf24;--amberBg:#78350f;
 --onink:#0b1220;--chip:#0e1726;--zebra:#0d1626;--hov:#152238;--sel:#17304d;
 --selline:#38bdf8;--badge:#1e2b41;--pin:#e6edf7;--btnA:#18233a;--btnB:#131c2e;
 --strip:#000;--stripFg:#fff;--stripInk:#cbd5e1;--stripLine:#1f2937;--stripSep:#64748b;
 --tagFg:#93a6c2;--okOnInk:#047857;--badOnInk:#b91c1c;--noteBg:#2a1c0e;--noteLine:#7c4a1d;--g1:#4c1d1d;--g2:#463610;--g3:#123049;
}
[data-theme="dark"] .dtp table.grid thead th{background:var(--surf2)}
`

/* ── 표기 헬퍼 ────────────────────────────────────────────────── */
const MISSING = '[미기재]'
// 소화 일수 경보 기준 (2026-09-22 사용자 결정 — "우리 기준을 만들고 가이드를 넣어 내보낸다").
// 분모가 20거래일 평균이므로 20일 = __출회 물량이 한 달치 거래량과 같다__ 는 뜻이라 말로 설명된다.
// 실측 110행: 중앙 8.9일 · 상위 25% 38일 → 20일이 자연스러운 경계. 운용사 기준이 오면 이 상수 하나만 바꾼다.
const DTC_ALERT_DAYS = 20

function krw(v) {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  if (!Number.isFinite(n)) return null
  if (n === 0) return '0'
  const a = Math.abs(n)
  if (a >= 1e12) return (n / 1e12).toFixed(2) + '조'
  if (a >= 1e8) return (n / 1e8).toFixed(1) + '억'
  if (a >= 1e4) return (n / 1e4).toFixed(0) + '만'
  return n.toLocaleString('ko-KR')
}
const int = (v) => (v === null || v === undefined || !Number.isFinite(Number(v))
  ? null : Number(v).toLocaleString('ko-KR'))
const shares = (v) => {
  if (v === null || v === undefined || !Number.isFinite(Number(v))) return null
  const n = Number(v)
  return n >= 1e4 ? (n / 1e4).toFixed(n >= 1e6 ? 0 : 1) + '만 주' : n.toLocaleString('ko-KR') + ' 주'
}

/** 값이 없으면 __[미기재]__ 를 낸다. `-`·`0` 으로 뭉개지 않는다(HARD RULE). */
function Val({ v, suffix = '', cls = '' }) {
  if (v === null || v === undefined || v === '') return <span className="miss">{MISSING}</span>
  return <span className={cls}>{v}{suffix}</span>
}

/** 그리드 전용 빈 값 — 흐린 대시. `[미기재]` 라벨 35개가 채워진 값보다 시끄럽던 것을
 *  고친다(§34-3 #1). 뜻은 같다: hover 에 [미기재] 를 남기고, 사유는 우측 패널 "왜 비었나".
 *  `0` 은 여전히 `0` 으로 찍히므로 대시가 0 으로 읽힐 일은 없다. */
const DASH_TITLE = `${MISSING} — 원문에 값이 없거나 아직 연결되지 않았습니다. 사유는 우측 패널 "왜 비었나"`
function Cell({ v, suffix = '', cls = '', title }) {
  if (v === null || v === undefined || v === '') return <span className="dash" title={DASH_TITLE}>–</span>
  return <span className={cls} title={title}>{v}{suffix}</span>
}

const mv = (row, key) => (row && row.metrics && row.metrics[key] ? row.metrics[key].value : null)
const mas = (row, key) => (row && row.metrics && row.metrics[key] ? row.metrics[key].as_of : null)

const LS = { key: 'dartin.key', universe: 'dartin.universe', mode: 'terminal.mode' }
const readLS = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : v } catch { return d } }
const writeLS = (k, v) => { try { localStorage.setItem(k, v) } catch { /* 프라이빗 모드 */ } }
const parseCodes = (t) => [...new Set(String(t || '').match(/\d{6}/g) || [])].slice(0, 400)

class AccessError extends Error {
  constructor(status, detail) { super(detail || `HTTP ${status}`); this.status = status; this.detail = detail }
}
/** 라우터가 프로덕션에 __아직 없을 때__(404). 소실이 아니라 미배선이다. */
class UnwiredError extends Error {}

async function call(path, key) {
  const r = await fetch(`${API}${path}`, key ? { headers: { 'x-dartin-key': key } } : undefined)
  if (r.status === 401 || r.status === 403 || r.status === 429) {
    let d = ''
    try { d = (await r.json()).detail || '' } catch { /* 본문 없음 */ }
    throw new AccessError(r.status, d)
  }
  if (r.status === 404) throw new UnwiredError(path)
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json()
}

const CATS = [
  { k: 'ALL', label: '전체' },
  { k: 'GROWTH', label: '성장·수주', c: '#0d9488' },
  { k: 'EARNINGS', label: '실적·배당', c: '#1d4ed8' },
  { k: 'CAPITAL', label: '자금조달', c: '#d97706' },
  { k: 'GOVERNANCE', label: '지분·자사주', c: '#7c3aed' },
  { k: 'ALERT', label: '시장경보', c: 'var(--up)' },
  { k: 'GENERAL', label: '기타', c: '#71717a' },
]
const CAT_C = Object.fromEntries(CATS.map(c => [c.k, c.c || '#71717a']))

const PSTAT = {
  ok: ['분해 완료', 'var(--ok)'],
  partial: ['일부만 읽음', '#d97706'],
  not_in_document: ['원문에 값 없음', '#6366f1'],
  inconsistent: ['검산 불일치', 'var(--up)'],
  failed: ['분해 실패', 'var(--up)'],
  no_document: ['원문 못 읽음', 'var(--up)'],
  synthetic_rcept: ['원문 번호 없음', '#71717a'],
  not_attempted: ['분해 대상 아님', '#71717a'],
}

// 화면에 올리지 않는 내부 키 — DartInPage 와 같은 목록을 쓴다.
const SKIP = new Set(['is_accumulation', 'verified', 'cross_check', 'source_api',
  'contract_amount_raw', 'revenue_ratio_raw', 'revenue_raw', 'operating_profit_raw',
  'net_income_raw', 'revenue_yoy_raw', 'operating_profit_yoy_raw', 'yoy_basis'])
const MLABEL = {
  contract_amount: '계약금액', revenue_ratio: '매출액 대비', prev_revenue: '직전 매출액',
  counterparty: '계약상대방', period: '기간', revised_from: '정정 전 금액',
  revenue: '매출액', revenue_yoy: '매출 전년동기', operating_profit: '영업이익',
  operating_profit_yoy: '영업이익 전년동기', opm: '영업이익률', net_income: '당기순이익',
  summary: '요약',
}

/* ════════════════════════════════════════════════════════════════ */
export default function DartTerminalPage() {
  const [apiKey, setApiKey] = useState(() => readLS(LS.key, ''))
  const [keyDraft, setKeyDraft] = useState('')
  const [mode, setMode] = useState(() => (readLS(LS.mode, 'mezz') === 'flash' ? 'flash' : 'mezz'))
  const [universe, setUniverse] = useState(() => parseCodes(readLS(LS.universe, '')))
  const [univDraft, setUnivDraft] = useState('')
  const [editUniv, setEditUniv] = useState(false)
  const [scope, setScope] = useState('all')          // all | my | warn
  const [sort, setSort] = useState('overhang')       // overhang | floor | recent
  const [cat, setCat] = useState('ALL')
  // 기간은 __반드시 화면에 있어야 한다.__ 0건일 때 "없는 날"인지 "창 밖"인지를
  // 사람이 구분 못 하면 빈 화면을 장애로 읽는다(DARTIN.md §1 — 넓히는 버튼이
  // 오히려 창을 좁히던 사고가 정확히 이 지점이다).
  const [days, setDays] = useState(3)
  const [q, setQ] = useState('')
  const [toast, setToast] = useState('')

  // 메자닌
  const [mez, setMez] = useState(null)
  const [cov, setCov] = useState(null)
  const [mezErr, setMezErr] = useState(null)
  const [mezLoading, setMezLoading] = useState(false)
  const [selMez, setSelMez] = useState(null)         // `${corp_code}:${bd_tm}`

  // 플래시
  const [feed, setFeed] = useState(null)
  const [reports, setReports] = useState({})         // rcept_no -> report
  const [flashErr, setFlashErr] = useState(null)
  const [flashLoading, setFlashLoading] = useState(false)
  const [selRc, setSelRc] = useState(null)

  const toastT = useRef(null)
  const say = useCallback((m) => {
    setToast(m)
    clearTimeout(toastT.current)
    toastT.current = setTimeout(() => setToast(''), 2200)
  }, [])
  useEffect(() => () => clearTimeout(toastT.current), [])

  useEffect(() => { writeLS(LS.mode, mode) }, [mode])

  /* ── 메자닌 로드 ───────────────────────────────────────────── */
  const loadMez = useCallback(async () => {
    if (!apiKey) return
    setMezLoading(true); setMezErr(null)
    try {
      const codes = scope === 'my' && universe.length ? `&codes=${universe.join(',')}` : ''
      const [o, c] = await Promise.all([
        call(`/api/dartm/overhang?limit=400&sort=${sort}${codes}`, apiKey),
        call('/api/dartm/coverage', apiKey).catch(() => null),
      ])
      setMez(o); setCov(c)
      if (o && o.results && o.results.length) {
        setSelMez(s => (s && o.results.some(r => `${r.corp_code}:${r.bd_tm}` === s))
          ? s : `${o.results[0].corp_code}:${o.results[0].bd_tm}`)
      } else setSelMez(null)
    } catch (e) { setMezErr(e); setMez(null) } finally { setMezLoading(false) }
  }, [apiKey, sort, scope, universe])

  /* ── 플래시 로드 ───────────────────────────────────────────── */
  const loadFlash = useCallback(async () => {
    if (!apiKey) return
    setFlashLoading(true); setFlashErr(null)
    try {
      const p = new URLSearchParams({ limit: '120', days: String(days), sort: 'important' })
      if (cat !== 'ALL') p.set('category', cat)
      if (scope === 'my' && universe.length) p.set('codes', universe.join(','))
      if (q.trim()) p.set('search', q.trim())
      const d = await call(`/api/flash/disclosures?${p}`, apiKey)
      setFeed(d)
      const list = d.disclosures || []
      if (list.length) setSelRc(s => (list.some(x => x.rcept_no === s) ? s : list[0].rcept_no))
      else setSelRc(null)
      // 목록 단계에서 인라인 정량값을 보여주려면 리포트를 미리 받아야 한다(최대 20건).
      const want = list.filter(x => x.parsable).slice(0, 20).map(x => x.rcept_no)
      if (want.length) {
        const rr = await call(`/api/flash/reports?rcept_nos=${want.join(',')}`, apiKey)
        const m = {}
        for (const r of (rr.reports || [])) if (r && r.rcept_no) m[r.rcept_no] = r
        setReports(prev => ({ ...prev, ...m }))
      }
    } catch (e) { setFlashErr(e); setFeed(null) } finally { setFlashLoading(false) }
  }, [apiKey, cat, scope, universe, q, days])

  useEffect(() => { if (mode === 'mezz') loadMez() }, [mode, loadMez])
  useEffect(() => { if (mode === 'flash') loadFlash() }, [mode, loadFlash])

  // 선택한 플래시 건의 상세 — 목록 프리페치에 없었으면 단건으로 연다.
  useEffect(() => {
    if (mode !== 'flash' || !selRc || !apiKey || reports[selRc]) return
    let dead = false
    call(`/api/flash/report/${selRc}`, apiKey)
      .then(r => { if (!dead && r) setReports(p => ({ ...p, [r.rcept_no]: r })) })
      .catch(() => { /* 목록은 살아 있다 — 상세 실패로 화면을 죽이지 않는다 */ })
    return () => { dead = true }
  }, [mode, selRc, apiKey, reports])

  /* ── 메자닌 파생 ───────────────────────────────────────────── */
  const mezRows = useMemo(() => {
    const raw = (mez && mez.results) || []
    const uni = new Set(universe)
    return raw.map(r => {
      const bal = mv(r, '미전환 잔액')
      const price = mv(r, '현재 전환가액')
      const rem = mv(r, '잔여 전환가능주식')
      const pct = mv(r, '발행주식 대비')
      const floor = mv(r, '리픽싱 하한')
      const gap = mv(r, '하한까지')
      const face = mv(r, '권면총액')
      // 차기 풋 = 라우터가 주기를 굴려 낸 __오늘 이후 첫 날__(put_next). 최초일이 지났는데 주기를
      // 모르면 null 이다 — 2년 전 날짜를 "차기" 로 보이던 것을 고쳤다(§27-8 #6).
      const dday = r.issuance ? (r.issuance.put_next_d_day ?? null) : null
      const putDate = r.issuance ? (r.issuance.put_next_date || null) : null
      // 주가 기준 두 칸 — 하루 한 번(15:50 KST) 적립한 키움 현재가. as_of 는 조회시각이다.
      const px = mv(r, '현재가')
      const pxAsOf = mas(r, '현재가')
      const pxFloor = mv(r, '주가/하한')      // 현재가÷하한×100 · 100 이하 = 리픽싱 한계 도달
      const pxConv = mv(r, '주가/전환가')     // (현재가÷전환가액−1)×100 · 양수 = 전환 유인
      // 커버 = 회사 보유현금 ÷ 그 회사 사채잔액 합산. __라우터가 계산해 준다.__
      // 오버행에서 진짜 묻는 것은 "풋이 언제냐" 가 아니라 __"갚을 돈이 있느냐"__ 다.
      const cover = (r.company && r.company['현금 커버']) ? r.company['현금 커버'].value : null
      // 고도화_0921 — 전부 __라우터가 계산한 값__ 이다. 화면에서 다시 나누지 않는다(두 군데서 계산하면 반드시 갈린다).
      const used = mv(r, '소진율')                    // (권면−잔액)÷권면 · 권면은 발행결정에서 소급 복사됐을 수 있다(faceSrc)
      const faceSrc = (r.metrics && r.metrics['권면총액'] && r.metrics['권면총액'].source) || null
      const exitVal = mv(r, '엑시트 평가액')            // 잔여주식×현재가
      const exitGain = mv(r, '평가 차익')               // 엑시트 평가액−잔액(원금)
      const real = mv(r, '실질 오버행')                 // 잔여주식−콜 방어 물량
      const realPct = mv(r, '실질 오버행 비율')
      const realSrc = (r.metrics && r.metrics['실질 오버행'] && r.metrics['실질 오버행'].source) || null
      const callShares = mv(r, '콜 방어 물량')
      const avgVol = mv(r, '20일 평균 거래량')
      const dtc = mv(r, '소화 일수')                    // 출회 물량÷20일 평균 거래량
      const cs = r.conv_status || { state: null }       // convertible | lockup(d_day) | expired | null
      const rfx = r.refix || {}                         // next_date · next_d_day · interval_months
      const rfxD = rfx.next_d_day ?? null
      return {
        ...r,
        key: `${r.corp_code}:${r.bd_tm}`,
        bal, price, rem, pct, floor, gap, face, dday, putDate, used, cover,
        faceSrc, exitVal, exitGain, real, realPct, realSrc, callShares, avgVol, dtc, cs, rfx, rfxD,
        px, pxAsOf, pxFloor, pxConv,
        floorHit: gap !== null && gap <= 0,
        pxHit: pxFloor !== null && pxFloor <= 100,
        mine: !!(r.stock_code && uni.has(r.stock_code)),
        alive: bal === null ? null : bal > 0,
      }
    }).filter(r => {
      if (scope === 'warn') return r.floorHit || (r.dday !== null && r.dday <= 90 && r.dday >= 0) || (r.dtc !== null && r.dtc >= DTC_ALERT_DAYS)
      if (scope === 'my') return r.mine
      return true
    }).filter(r => {
      const s = q.trim().toLowerCase()
      if (!s) return true
      return (r.corp_name || '').toLowerCase().includes(s) || (r.stock_code || '').includes(s)
    })
  }, [mez, scope, universe, q])

  const mezSel = useMemo(
    () => mezRows.find(r => r.key === selMez) || mezRows[0] || null, [mezRows, selMez])

  // KPI — 전부 원장에서 센 값이다. 목업의 "금주 신주 출회 예정"은 상장예정일을
  // 수집하지 않아 만들 수 없으므로 __칸 자체를 두지 않는다.__
  const mezKpi = useMemo(() => {
    const rows = (mez && mez.results) || []
    const enriched = rows.map(r => ({
      bal: mv(r, '미전환 잔액'), gap: mv(r, '하한까지'),
      pxFloor: mv(r, '주가/하한'),
      dday: r.issuance ? (r.issuance.put_next_d_day ?? null) : null,
      cover: (r.company && r.company['현금 커버']) ? r.company['현금 커버'].value : null,
      dtc: mv(r, '소화 일수'),
    }))
    const near = enriched.filter(r => r.dday !== null && r.dday >= 0 && r.dday <= 90)
    return {
      active: enriched.filter(r => r.bal === null || r.bal > 0).length,
      totalBal: enriched.reduce((a, r) => a + (r.bal || 0), 0),
      floorHit: enriched.filter(r => r.gap !== null && r.gap <= 0).length,
      pxHit: enriched.filter(r => r.pxFloor !== null && r.pxFloor <= 100).length,
      pxKnown: enriched.filter(r => r.pxFloor !== null).length,
      nearPut: near.length,
      nearExp: near.reduce((a, r) => a + (r.bal || 0), 0),
      noPut: enriched.filter(r => r.dday === null).length,
      // 커버는 __산출된 것만__ 센다. 미기재를 0 으로 세면 경보가 부풀려진다.
      coverKnown: enriched.filter(r => r.cover !== null && r.cover !== undefined).length,
      thinCover: enriched.filter(r => r.cover !== null && r.cover !== undefined && r.cover < 1).length,
      dtcKnown: enriched.filter(r => r.dtc !== null).length,
      dtcOver: enriched.filter(r => r.dtc !== null && r.dtc >= DTC_ALERT_DAYS).length,
    }
  }, [mez])

  /* ── 플래시 파생 ───────────────────────────────────────────── */
  const feedRows = (feed && feed.disclosures) || []
  const flashSel = selRc ? reports[selRc] : null
  const flashRow = feedRows.find(r => r.rcept_no === selRc) || null

  /* ── 반출 ─────────────────────────────────────────────────── */
  const copyBrief = useCallback(() => {
    let t = ''
    if (mode === 'mezz' && mezSel) {
      const r = mezSel
      t = [
        `[DART TERMINAL] ${r.corp_name}(${r.stock_code || r.corp_code}) 제${r.bd_tm}회 ${r.sec_type || ''}`.trim(),
        `· 상태: ${r.cs.label || MISSING}` + (r.cs.conv_start ? ` (전환청구 시작 ${r.cs.conv_start})` : ''),
        `· 미전환 잔액: ${krw(r.bal) ?? MISSING} / 권면 ${krw(r.face) ?? MISSING}` +
          (r.used !== null ? ` · 소진율 ${r.used}%` : '') + (r.faceSrc === '발행결정 소급' ? ' (권면은 발행결정에서)' : ''),
        `· 현재 전환가액: ${int(r.price) ?? MISSING}원 · 리픽싱 하한 ${int(r.floor) ?? MISSING}원`,
        `· 잔여 전환가능주식: ${int(r.rem) ?? MISSING}주 (발행주식 대비 ${r.pct ?? MISSING}%)`,
        `· 실질 오버행(콜 차감): ${int(r.real) ?? MISSING}주` + (r.realPct !== null ? ` (${r.realPct}%)` : '') +
          ` · 소화 일수 ${r.dtc ?? MISSING}일` + (r.avgVol ? ` (20일 평균 ${int(r.avgVol)}주)` : ''),
        `· 엑시트 평가액: ${krw(r.exitVal) ?? MISSING} · 평가 차익 ${r.exitGain === null ? MISSING : (r.exitGain > 0 ? '+' : '') + krw(r.exitGain)}`,
        `· 차기 리픽싱: ${r.rfx.next_date || MISSING}` + (r.rfxD !== null ? ` (D-${r.rfxD})` : '') +
          (r.rfx.interval_months ? ` · 주기 ${r.rfx.interval_months}개월` : ''),
        `· 주가: ${int(r.px) ?? MISSING}원 (하한 대비 ${r.pxFloor ?? MISSING}% · 전환가 대비 ${r.pxConv ?? MISSING}%)` +
          (r.pxAsOf ? ` @${String(r.pxAsOf).slice(0, 16)}` : ''),
        `· 차기 풋: ${r.putDate || MISSING}` +
          (r.dday !== null && r.dday !== undefined ? ` (D-${r.dday})` : '') +
          ` · 만기 ${(r.issuance && r.issuance.maturity_date) || MISSING}`,
        `· 검산(발행사 산술): ${r.cross_check || MISSING}`,
        `· 근거: ${r.anchor && r.anchor.dart_url} (${r.anchor && r.anchor.as_of} 기준)`,
      ].join('\n')
    } else if (flashSel) {
      t = flashSel.messenger_copy || `[${flashSel.corp_name}] ${flashSel.report_nm}\n${flashSel.dart_url}`
    }
    if (!t) { say('복사할 항목이 없습니다'); return }
    navigator.clipboard?.writeText(t).then(() => say('클립보드 복사 완료'),
      () => say('복사 실패 — 브라우저가 막았습니다'))
  }, [mode, mezSel, flashSel, say])

  const exportCsv = useCallback(() => {
    const esc = v => `"${String(v === null || v === undefined ? '' : v).replace(/"/g, '""')}"`
    let csv = '﻿'
    if (mode === 'mezz') {
      csv += ['종목명', '종목코드', '고유번호', '시장', '회차', '종류', '상태', '전환청구시작일', '권면총액', '권면출처', '소진율%', '미전환잔액',
        '전환가액', '리픽싱하한', '하한까지%', '잔여전환가능주식', '발행주식대비%',
        '콜방어물량', '실질오버행', '실질오버행%', '20일평균거래량', '소화일수',
        '현재가', '주가/하한%', '주가/전환가%', '주가기준시각', '엑시트평가액', '평가차익',
        '차기리픽싱', '리픽싱주기(개월)', '마지막조정적용일',
        '차기풋', '최초풋', '만기', '표면이자율', '만기이자율', '검산식', '기준일', '접수번호', '원문URL'].join(',') + '\n'
      for (const r of mezRows) {
        csv += [r.corp_name, r.stock_code, r.corp_code, r.market, r.bd_tm, r.sec_type, r.cs.label, r.cs.conv_start,
          r.face, r.faceSrc, r.used, r.bal, r.price, r.floor, r.gap, r.rem, r.pct,
          r.callShares, r.real, r.realPct, r.avgVol, r.dtc,
          r.px, r.pxFloor, r.pxConv, r.pxAsOf, r.exitVal, r.exitGain,
          r.rfx.next_date, r.rfx.interval_months, r.rfx.last_apply_date,
          r.putDate, r.issuance && r.issuance.put_first_date, r.issuance && r.issuance.maturity_date,
          r.issuance && r.issuance.coupon_rate, r.issuance && r.issuance.ytm,
          r.cross_check, r.anchor && r.anchor.as_of, r.anchor && r.anchor.rcept_no,
          r.anchor && r.anchor.dart_url].map(esc).join(',') + '\n'
      }
    } else {
      csv += ['접수일', '종목명', '종목코드', '분류', '공시제목', '분해상태', '요약', '접수번호', '원문URL'].join(',') + '\n'
      for (const r of feedRows) {
        const rep = reports[r.rcept_no]
        csv += [r.rcept_day, r.corp_name, r.stock_code, r.category_label, r.report_nm,
          rep ? rep.parse_status : '', rep ? rep.takeaway : '',
          r.rcept_no, r.dart_url].map(esc).join(',') + '\n'
      }
    }
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `DART_TERMINAL_${mode}_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [mode, mezRows, feedRows, reports])

  /* ── 키 게이트 ────────────────────────────────────────────── */
  const accessErr = (mode === 'mezz' ? mezErr : flashErr)
  if (!apiKey || (accessErr instanceof AccessError)) {
    return (
      <div className="dtp">
        <style>{CSS}</style>
        <div className="gate">
          <h3>DART Terminal — 접근 키가 필요합니다</h3>
          <p>
            모든 데이터 호출은 <code>x-dartin-key</code> 를 달고 나갑니다. 키가 없거나 틀리면
            서버가 401 을 돌려줍니다 — 화면이 가리는 것이 아니라 <b>서버가 잠급니다</b>.
            {accessErr ? <><br /><b style={{ color: 'var(--up)' }}>{accessErr.status}: {accessErr.detail || '인증 실패'}</b></> : null}
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            <input className="fld" style={{ flex: 1, width: 'auto' }} value={keyDraft} type="password"
              placeholder="발급받은 키" onChange={e => setKeyDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && keyDraft.trim()) { writeLS(LS.key, keyDraft.trim()); setApiKey(keyDraft.trim()); setMezErr(null); setFlashErr(null) } }} />
            <button className="btn dark" disabled={!keyDraft.trim()}
              onClick={() => { writeLS(LS.key, keyDraft.trim()); setApiKey(keyDraft.trim()); setMezErr(null); setFlashErr(null) }}>
              열기
            </button>
          </div>
          <p style={{ marginTop: 12, marginBottom: 0, fontSize: 10.5 }}>
            발급: 서버에서 <code>python dartin_key.py issue --org &quot;조직명&quot; --days 30</code>
          </p>
        </div>
      </div>
    )
  }

  const unwired = (mode === 'mezz' ? mezErr : flashErr) instanceof UnwiredError

  /* ── 렌더 ─────────────────────────────────────────────────── */
  return (
    <div className="dtp">
      <style>{CSS}</style>

      {/* 상태 스트립 — 목업의 LED 티커 자리. 지수·CB 유통잔액·당월 풋 청구도래는
          수집하지 않는 값이라 지어내지 않고, 원장 실측치로 대체한다. */}
      <div className="strip">
        <div className="grp">
          <span style={{ color: '#facc15', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span className="dot" style={{ background: unwired ? '#ef4444' : '#10b981' }} />
            DART TERMINAL
          </span>
          <span className="sep">|</span>
          {mode === 'mezz' ? (
            <>
              <span>활성 회차 <b>{mez ? mezKpi.active : '—'}</b></span>
              <span className="sep">|</span>
              <span>미전환 잔액 합 <b>{mez ? (krw(mezKpi.totalBal) ?? MISSING) : '—'}</b></span>
              <span className="sep">|</span>
              <span>적립 창 <b>{cov && cov.filings ? (cov.filings.window || []).join(' ~ ') : '—'}</b></span>
              <span className="sep">|</span>
              <span className="mute">지수·CB 유통잔액·신주 상장예정 = 미연동 (채권 API 연동 예정)</span>
            </>
          ) : (
            <>
              <span>창 안 공시 <b>{feed ? feed.matched : '—'}</b></span>
              <span className="sep">|</span>
              <span>유니버스 적중 <b>{feed ? feed.universe_hit : '—'}</b></span>
              <span className="sep">|</span>
              <span>기준일(KST) <b>{feed ? feed.today_kst : '—'}</b></span>
              {feed && feed.window_capped
                ? <><span className="sep">|</span><span style={{ color: '#fb923c' }}>스캔 창 포화 — 집계가 실제보다 적다</span></>
                : null}
            </>
          )}
        </div>
        <div className="grp mute" style={{ flexShrink: 0 }}>
          <span>마지막 적립 {mode === 'mezz'
            ? ((cov && cov.generated_at) ? String(cov.generated_at).slice(0, 16).replace('T', ' ') : '—')
            : ((feed && feed.today_kst) || '—')}</span>
        </div>
      </div>

      {/* 헤더 */}
      <header className="bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* 앱 크롬을 숨기는 화면이라 돌아갈 길이 없으면 갇힌다 — 브랜드를 홈 링크로 쓴다. */}
          <a className="brand" href="/" title="DART Insight 홈으로">
            <div className="mk">DT</div>
            <div>
              <div className="nm">DART Terminal</div>
              <div className="sub">DISCLOSURE WORKSPACE</div>
            </div>
          </a>
          <div className="modetabs">
            <button className={mode === 'mezz' ? 'on' : ''} onClick={() => setMode('mezz')}>메자닌·오버행 원장</button>
            <button className={mode === 'flash' ? 'on' : ''} onClick={() => setMode('flash')}>공시 정량분해 피드</button>
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            <button className={`btn ${scope === 'all' ? 'on' : ''}`} onClick={() => setScope('all')}>전체</button>
            <button className={`btn ${scope === 'my' ? 'on' : ''}`} onClick={() => setScope('my')}>
              내 커버리지 ({universe.length})
            </button>
            {mode === 'mezz' && (
              <button className={`btn ${scope === 'warn' ? 'on' : ''}`} onClick={() => setScope('warn')}
                style={{ color: scope === 'warn' ? '#fff' : 'var(--up)' }}>
                플로어·풋 경보
              </button>
            )}
            <button className="btn" onClick={() => { setUnivDraft(universe.join(' ')); setEditUniv(v => !v) }}>
              유니버스 편집
            </button>
          </div>
          {mode === 'flash' && (
            <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <span className="mute" style={{ fontSize: 9.5 }}>기간</span>
              {[[1, '오늘'], [3, '3일'], [7, '7일'], [14, '14일']].map(([d, l]) => (
                <button key={d} className={`btn ${days === d ? 'on' : ''}`} onClick={() => setDays(d)}>{l}</button>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input className="fld" value={q} placeholder="종목명 · 6자리 코드 (ESC 초기화)"
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') setQ('') }} />
          <button className="btn dark" onClick={copyBrief}>회의노트 복사</button>
          <button className="btn" onClick={exportCsv}>↓ CSV</button>
          <button className="btn" onClick={() => (mode === 'mezz' ? loadMez() : loadFlash())}
            disabled={mezLoading || flashLoading}>{(mezLoading || flashLoading) ? '…' : '새로고침'}</button>
        </div>
      </header>

      {editUniv && (
        <div style={{ background: '#fff', borderBottom: '1px solid var(--line2)', padding: '6px 10px', display: 'flex', gap: 6 }}>
          <input className="fld" style={{ flex: 1, width: 'auto' }} value={univDraft}
            placeholder="6자리 종목코드를 붙여넣으세요 (구분자 무관, 최대 400)"
            onChange={e => setUnivDraft(e.target.value)} />
          <button className="btn dark" onClick={() => {
            const c = parseCodes(univDraft); setUniverse(c); writeLS(LS.universe, c.join(' ')); setEditUniv(false)
            say(`유니버스 ${c.length}종 저장`)
          }}>저장</button>
          <button className="btn" onClick={() => setEditUniv(false)}>닫기</button>
        </div>
      )}

      {/* 프레이밍 층 — 리드 한 줄 + KPI. 전부 아래 KPI 와 같은 숫자에서 나온다(두 번째 진실 없음).
          문장은 "경보 우선순위"만 말한다 — 표를 읽기 전에 3초 안에 어디부터 볼지 잡게 하는 역할. */}
      <div className="frame">
        {mode === 'mezz' ? (
          <p className="lead">
            <span className="ov">오늘 볼 것</span>
            {mez ? (
              <>
                원장 <b>{mez.counts && mez.counts['회차']}</b>회차 중 활성 <b>{mezKpi.active}</b> —
                주가가 하한 밑인 회차 <b>{mezKpi.pxHit}</b>, 90일 내 풋 <b>{mezKpi.nearPut}</b>
                {mezKpi.nearExp ? <> (익스포저 {krw(mezKpi.nearExp)})</> : null},
                현금커버 1배 미만 <b>{mezKpi.thinCover}</b>, 소화 {DTC_ALERT_DAYS}일 이상 <b>{mezKpi.dtcOver}</b>. 「플로어·풋 경보」로 좁혀 보세요.
              </>
            ) : (mezLoading ? '원장을 불러오는 중…' : '원장을 아직 불러오지 못했습니다.')}
          </p>
        ) : (
          <p className="lead">
            <span className="ov">오늘 볼 것</span>
            {feed ? (
              <>
                {days === 1 ? '오늘' : `최근 ${days}일`} 창 안 공시 <b>{feed.matched}</b>건
                {universe.length ? <> · 내 유니버스 적중 <b>{feed.universe_hit}</b>건</> : null}
                {feed.window_capped ? <> — <b>스캔 창 포화</b>, 집계가 실제보다 적습니다</> : null}.
              </>
            ) : (flashLoading ? '피드를 불러오는 중…' : '피드를 아직 불러오지 못했습니다.')}
          </p>
        )}
      <div className="kpis">
        {mode === 'mezz' ? (
          <>
            {/* 숫자는 전부 잉크색. 경보 계열은 상단 2px 선으로만 구분한다 — 큰 빨간 숫자 셋이
                그리드의 빨강과 합쳐져 "경보가 경보로 안 읽히던" 것을 끊는다(§34-3 #2). */}
            <Kpi t="var(--ink)" k="활성 회차 (잔액 앵커 보유)"
              v={mez ? mezKpi.active : '—'} u={`건 / 원장 ${mez ? (mez.counts && mez.counts['회차']) : '—'}`} />
            <Kpi t="var(--alert)" k="리픽싱 하한 도달"
              v={mez ? mezKpi.floorHit : '—'}
              u={mez ? `회차 · 주가≤하한 ${mezKpi.pxHit}/${mezKpi.pxKnown} · 하한 확보 ${mez.counts && mez.counts['플로어 확보']}건` : ''} />
            <Kpi t="var(--alert)" k="조기상환 풋 D-90 이내"
              v={mez ? mezKpi.nearPut : '—'}
              u={mez ? `익스포저 ${krw(mezKpi.nearExp) ?? MISSING} · 풋일 미확보 ${mezKpi.noPut}` : ''} />
            <Kpi t="var(--alert)" k="현금커버 1배 미만"
              v={mez ? mezKpi.thinCover : '—'}
              u={mez ? `회차 · 커버 산출 ${mezKpi.coverKnown}건` : ''} />
            <Kpi t="var(--alert)" k={`소화 일수 ${DTC_ALERT_DAYS}일 이상`}
              v={mez ? mezKpi.dtcOver : '—'}
              u={mez ? `회차 · 출회 물량 > 한 달치 거래량 · 산출 ${mezKpi.dtcKnown}건` : ''} />
            <Kpi t="var(--line2)" k="미전환 잔액 합계"
              v={mez ? (krw(mezKpi.totalBal) ?? MISSING) : '—'} u="원 (원장 창 내)" />
          </>
        ) : (
          CATS.filter(c => ['GROWTH', 'EARNINGS', 'CAPITAL', 'GOVERNANCE'].includes(c.k)).map(c => (
            <Kpi key={c.k} t={c.c} k={c.label} color={c.c}
              v={feed && feed.counts ? (feed.counts[c.k] || 0) : '—'}
              u={`건 (${days === 1 ? '오늘' : `최근 ${days}일`})`} />
          ))
        )}
      </div>
      </div>

      {/* 워크스페이스 */}
      <main className="work">
        <div className="left">
          <div className="tbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="ttl">{mode === 'mezz' ? '메자닌 회차 원장' : '공시 정량분해 피드'}</span>
              <span className="badge">{mode === 'mezz' ? mezRows.length : feedRows.length}건</span>
            </div>
            <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {mode === 'mezz'
                ? [['overhang', '희석률순'], ['real', '실질오버행순'], ['days_to_cover', '소화일수순'], ['refix', '리픽싱임박순'],
                   ['cover', '커버낮은순'], ['floor', '플로어순'], ['recent', '최신공시순']].map(([k, l]) => (
                  <button key={k} className={`btn ${sort === k ? 'on' : ''}`} onClick={() => setSort(k)}>{l}</button>
                ))
                : CATS.map(c => (
                  <button key={c.k} className={`btn ${cat === c.k ? 'on' : ''}`} onClick={() => setCat(c.k)}>
                    {c.label}{feed && feed.counts && c.k !== 'ALL' ? ` ${feed.counts[c.k] || 0}` : ''}
                  </button>
                ))}
            </div>
          </div>

          <div className="scroll">
            {unwired ? <Unwired mode={mode} /> : null}
            {!unwired && mode === 'mezz' && <MezGrid rows={mezRows} sel={selMez} onSel={setSelMez} loading={mezLoading} scope={scope} counts={mez && mez.counts} />}
            {!unwired && mode === 'flash' && <FlashGrid rows={feedRows} reports={reports} sel={selRc} onSel={setSelRc} loading={flashLoading} days={days} feed={feed} />}
          </div>

          <div className="foot">
            <span>
              {mode === 'mezz' && mez && mez.counts
                ? `회차 ${mez.counts['회차']} · 발행결정 연결 ${mez.counts['발행결정 연결']} · 권면 ${mez.counts['권면 확보(소급 포함)'] ?? '–'} · 락업판정 ${mez.counts['락업 판정'] ?? '–'} · 차기리픽싱 ${mez.counts['차기 리픽싱 산출'] ?? '–'} · 실질오버행 ${mez.counts['실질 오버행 산출'] ?? '–'} · 소화일수 ${mez.counts['소화 일수 산출'] ?? '–'} · 비율 불가 ${mez.counts['비율 산출 불가']}`
                : mode === 'flash' && feed
                  ? `스캔 ${feed.scanned} / 창 ${feed.scan_limit} · 창 안 ${feed.matched}건${feed.truncated ? ' (표시 잘림)' : ''}`
                  : ''}
            </span>
            {/* 색 어휘 범례 — 색이 세 가지뿐이라 한 줄로 끝난다. 블룸버그처럼 색마다 뜻이 고정돼야
                사용자가 색을 읽는다. */}
            <span className="mute">
              {mode === 'mezz' ? (
                <>
                  <span className="dash">–</span> 미기재
                  <span className="sw" style={{ background: 'var(--alert)' }} />경보 (하한 도달 · 풋 D-90 · 커버&lt;1 · 검산 불일치 · 소화≥{DTC_ALERT_DAYS}일=출회 물량&gt;한 달치 거래량)
                  <span className="sw" style={{ background: 'var(--amberBg)', border: '1px solid var(--amber)' }} />규모 (막대 = 발행주식 대비, 50%에서 가득)
                  <span className="st on" style={{ marginLeft: 8 }}>전환가능</span><span className="st">락업 D-n</span> 오늘 vs 전환청구 시작일
                  <span style={{ marginLeft: 8 }}>{(mez && mez.engine) || ''}</span>
                </>
              ) : '11계열 정량분해'}
            </span>
          </div>
        </div>

        <div className="right">
          {unwired
            ? <div className="empty">좌측 안내 참조 — 이 패널은 같은 소스를 씁니다.</div>
            : mode === 'mezz'
              ? <MezPanel row={mezSel} />
              : <FlashPanel row={flashRow} rep={flashSel} />}
        </div>
      </main>

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  )
}

/* ── 소단위 ───────────────────────────────────────────────────── */
function Kpi({ k, v, u, t, color }) {
  return (
    <div className="kpi" style={{ borderTopColor: t }}>
      <div className="k">{k}</div>
      <div className="v num" style={color ? { color } : undefined}>
        {v}{u ? <span className="u">{u}</span> : null}
      </div>
    </div>
  )
}

/** 라우터가 프로덕션에 없을 때. __소실이 아니라 미배선__ 이라고 분명히 적는다. */
function Unwired({ mode }) {
  return (
    <div className="empty" style={{ textAlign: 'left', padding: '18px 16px' }}>
      <div style={{ fontWeight: 700, color: 'var(--up)', fontSize: 13, marginBottom: 8 }}>
        데이터 소스 미배선 (HTTP 404)
      </div>
      <p style={{ margin: '0 0 10px' }}>
        {mode === 'mezz'
          ? '메자닌 API(/api/dartm/*) 가 프로덕션에 없습니다. 데이터가 사라진 것이 아니라 라우터가 아직 배포되지 않았습니다 — 원장(mezz_events)은 서버에 살아 있습니다.'
          : '요청한 엔드포인트가 프로덕션에 없습니다.'}
      </p>
      {mode === 'mezz' && (
        <p style={{ margin: 0, fontSize: 11 }}>
          닫는 법: <code>modules/dartm_router.py</code> 는 커밋되어 있고 <code>api.py</code> 배선도
          되어 있습니다. <b>신규 파일이라 빠른 경로가 아닙니다</b> —
          <code> bash sync-backend.sh</code> 를 포그라운드(타임아웃 10분)로 한 번 돌리면 열립니다.
        </p>
      )}
    </div>
  )
}

function MezGrid({ rows, sel, onSel, loading, scope, counts }) {
  if (!rows.length) {
    // 경보 필터가 0건인 것과 __조항을 아직 못 붙인 것__ 은 완전히 다른 사실이다.
    // 앞의 것만 말하면 "경보가 없다"로 읽히는데 실제로는 잴 수가 없는 상태다.
    const clauseless = counts && counts['플로어 확보'] === 0 && counts['풋 도래일 확보'] === 0
    return (
      <div className="empty">
        {loading ? '불러오는 중…' : (
          <>
            표시할 회차가 없습니다.
            {scope === 'warn' && clauseless ? (
              <div className="mute" style={{ fontSize: 10.5, marginTop: 8, lineHeight: 1.7 }}>
                경보가 없는 것이 아니라 <b>잴 수가 없습니다</b> — 이 창의 회차에
                리픽싱 하한 0건 · 풋 도래일 0건입니다.
                <br />발행결정 원문이 붙어야 플로어·풋을 판정할 수 있습니다.
              </div>
            ) : <div className="mute" style={{ fontSize: 10.5, marginTop: 8 }}>필터를 넓혀보세요.</div>}
          </>
        )}
      </div>
    )
  }
  // 한 셀 한 줄 — 옛 "전환가액 (하한까지)" · "주가 (하한·전환가 대비)" 두 칸이 각각 두 줄이었다.
  // 10~11px 부기가 전 셀에 붙어 행은 높고 정보는 흐렸다(§34-3 #3). 부기를 __컬럼으로 승격__하고
  // 코드·시장·기준일은 hover title + 우측 패널로 보낸다. 정보는 하나도 버리지 않는다(CSV 도 그대로).
  return (
    <table className="grid">
      <thead>
        <tr>
          <th style={{ width: 26 }} className="c">#</th>
          <th>종목 · 회차</th>
          <th className="r">권면</th>
          <th className="r">미전환 잔액</th>
          <th className="r sub" title="(권면총액 − 미전환 잔액) ÷ 권면총액. 얼마나 이미 전환·상환됐나">소진율</th>
          <th className="r">발행주식 대비</th>
          <th className="r sub" title="잔여 전환가능주식 − 대주주 콜옵션 방어 물량(권면×콜한도%÷전환가액). 진짜 튀어나올 물량">실질 오버행</th>
          <th className="r">전환가액</th>
          <th className="r sub" title="현재 전환가액이 리픽싱 하한까지 남은 폭. 0 = 하한 도달(더 못 내린다)">하한까지</th>
          <th className="r">주가</th>
          <th className="r sub" title="현재가 ÷ 리픽싱 하한 × 100. 100% 이하 = 주가가 하한 밑">주가/하한</th>
          <th className="r sub" title="(현재가 ÷ 전환가액 − 1) × 100. 양수 = 전환 유인">주가/전환가</th>
          <th className="r sub" title="출회 물량(실질 오버행, 없으면 잔여주식) ÷ 최근 20거래일 일평균 거래량. 며칠이면 다 팔리나">소화일수</th>
          <th className="c sub" title="차기 전환가액 조정일 = 마지막 조정 적용일 + 주기(1M/3M). 하한 도달이면 더 못 내린다">차기 리픽싱</th>
          <th className="c">차기 풋</th>
          <th className="r">현금커버</th>
          <th className="c" title="발행사 자신의 산술(잔액÷전환가액=잔여주식) 대조">검산</th>
        </tr>
      </thead>
      <tbody className="num">
        {rows.map((r, i) => {
          const w = r.pct === null ? 0 : Math.min(100, r.pct * 2)
          const rowTitle = `${r.stock_code || r.corp_code} · ${r.market || '시장미상'} · 기준일 ${(r.anchor && r.anchor.as_of) || MISSING}`
          return (
            <tr key={r.key} className={r.key === sel ? 'sel' : ''} onClick={() => onSel(r.key)}>
              <td className="c mute">{i + 1}</td>
              <td className="nm" title={rowTitle}>
                <div className="row">
                  <b>{r.corp_name}</b>
                  <span className="code num">{r.stock_code || r.corp_code}</span>
                  <span className="rnd">{r.bd_tm}회 {r.sec_type || '?'}</span>
                  {/* 전환가능 상태 — 오늘 vs 전환청구 시작일. 시작일을 못 읽었으면 뱃지를 안 그린다(없는 판정을 그리지 않는다) */}
                  {r.cs.state === 'convertible' ? <span className="st on" title={`전환청구 시작일 ${r.cs.conv_start}`}>전환가능</span> : null}
                  {r.cs.state === 'lockup' ? <span className="st" title={`전환청구 시작일 ${r.cs.conv_start} 까지`}>락업 D-{r.cs.d_day}</span> : null}
                  {r.cs.state === 'expired' ? <span className="st off" title={`청구기간 종료 ${r.cs.conv_end}`}>종료</span> : null}
                  {r.mine ? <span className="tag" style={{ color: 'var(--ink2)', marginLeft: 5 }}>MY</span> : null}
                </div>
              </td>
              {/* 발행결정이 안 붙은 행은 대시 대신 __왜 없는지__ 를 적는다 — 대시만 있으면 파싱 실패로 읽힌다(2026-09-22 사용자 지적) */}
              <td className="r">
                {r.face === null && r.issuance_gap
                  ? <span className="mute" style={{ fontSize: 10 }} title={r.issuance_gap.detail}>발행결정 {r.issuance_gap.reason}</span>
                  : <Cell v={krw(r.face)} title={r.faceSrc ? `출처 ${r.faceSrc}` : undefined} />}
              </td>
              <td className="r"><b><Cell v={krw(r.bal)} /></b></td>
              <td className="r"><Cell v={r.used === null ? null : `${r.used}%`} /></td>
              {/* 규모 — 글자는 잉크, 크기는 앰버 막대. 21% 와 105% 가 같은 빨강이던 것을 막대 길이로 가른다. */}
              <td className="r bar">
                {r.pct !== null ? <i style={{ width: `${w}%` }} /> : null}
                <Cell v={r.pct === null ? null : `${r.pct}%`} cls="" title="막대 = 발행주식 대비 (50% 에서 가득)" />
              </td>
              {/* 실질 오버행 — 콜 조항을 모르면(발행결정 미연결) 비운다. 0 으로 두면 물량이 없어 보인다 */}
              <td className="r">
                {r.real === null
                  ? <Cell v={null} title={r.realSrc || undefined} />
                  : <span title={`${int(r.real)}주 · ${r.realSrc || ''}`}>{r.realPct === null ? int(r.real) : `${r.realPct}%`}</span>}
              </td>
              <td className="r"><Cell v={int(r.price)} /></td>
              <td className="r">
                {r.floor === null
                  ? <Cell v={null} />
                  : r.floorHit
                    ? <span className="alert" title={`리픽싱 하한 ${int(r.floor)}원 = 현재 전환가액`}>도달</span>
                    : <span title={`리픽싱 하한 ${int(r.floor)}원`}>+{r.gap}%</span>}
              </td>
              <td className="r"><Cell v={int(r.px)} title={r.pxAsOf ? `키움 현재가 @${String(r.pxAsOf).slice(0, 16)}` : undefined} /></td>
              {/* 주가/하한 — 100% 이하면 __더 못 내린다__(리픽싱 한계). 경보다. */}
              <td className="r">
                {r.pxFloor === null
                  ? <Cell v={null} />
                  : <span className={r.pxHit ? 'alert' : ''}>{r.pxFloor}%</span>}
              </td>
              {/* 주가/전환가 — 양수 = 전환 유인(내재가치 있음). 방향이지 경보가 아니라 무채색. */}
              <td className="r">
                {r.pxConv === null
                  ? <Cell v={null} />
                  : <span className={r.pxConv >= 0 ? '' : 'mute'} style={r.pxConv >= 0 ? { fontWeight: 700 } : undefined}>
                      {r.pxConv > 0 ? '+' : ''}{r.pxConv}%
                    </span>}
              </td>
              {/* 소화 일수 — 길수록 시장이 못 받는다. 방향이지 경보가 아니라 무채색. 20일이 넘으면 굵게 */}
              <td className="r">
                {r.dtc === null
                  ? <Cell v={null} />
                  : <span className={r.dtc >= DTC_ALERT_DAYS ? 'alert' : ''} style={r.dtc >= 5 ? { fontWeight: 700 } : undefined}
                      title={`20일 평균 거래량 ${int(r.avgVol)}주 · ${DTC_ALERT_DAYS}일 이상 = 출회 물량이 한 달치 거래량 초과`}>{r.dtc}일</span>}
              </td>
              {/* 차기 리픽싱 — 마지막 조정 적용일+주기. 주기를 모르면 비운다 */}
              <td className="c">
                {r.rfxD === null
                  ? <Cell v={null} />
                  : <span title={`${r.rfx.next_date} · ${r.rfx.next_source || ''} · 주기 ${r.rfx.interval_months || '?'}개월`}
                      className={r.floorHit ? 'mute' : ''}>
                      {r.rfxD >= 0 ? `D-${r.rfxD}` : `D+${-r.rfxD}`}
                    </span>}
              </td>
              <td className="c">
                {r.dday === null || r.dday === undefined
                  ? <Cell v={null} />
                  : <span className={r.dday <= 90 && r.dday >= 0 ? 'alert' : ''} title={`차기 도래일 ${r.putDate || MISSING}`}>
                      {r.dday >= 0 ? `D-${r.dday}` : `D+${-r.dday}`}
                    </span>}
              </td>
              {/* 현금커버 — 1배 미만이면 __현금으로 못 갚는다__ 는 뜻이라 경보색. 1배 이상은 무채색
                  (초록을 빼 색을 셋으로 줄였다). 재무가 없는 회사 약 37% 는 대시(0 이 아니다). */}
              <td className="r">
                {r.cover === null || r.cover === undefined
                  ? <Cell v={null} />
                  : <span className={r.cover < 1 ? 'alert' : ''} style={{ fontWeight: 700 }}>
                      {r.cover < 10 ? r.cover.toFixed(2) : Math.round(r.cover)}x
                    </span>}
              </td>
              <td className="c">
                {(() => {
                  // ok = 삼각이 닫혔다 · partial = __짝이 없어 못 쟀다__ · inconsistent/failed = 틀렸다
                  const ps = r.parse_status
                  if (ps === 'ok') return <span style={{ color: 'var(--ink2)', fontWeight: 700 }} title="검산 일치">✓</span>
                  if (ps === 'inconsistent' || ps === 'failed')
                    return <span className="alert" title="검산 불일치">✗</span>
                  if (ps === 'partial')
                    return <span className="dash" title="검산 짝이 없어 판정하지 못했습니다">–</span>
                  return <span className="dash">·</span>
                })()}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function FlashGrid({ rows, reports, sel, onSel, loading, days, feed }) {
  if (!rows.length) {
    // ☠️ 0건일 때 __"없는 날"과 "창 밖"을 구분해 준다.__ 안 그러면 사람이 빈 화면을
    //    장애로 읽고 원장을 뒤지러 간다(CLAUDE.md — 마스킹은 소실과 화면이 똑같다).
    return (
      <div className="empty">
        {loading ? '불러오는 중…' : (
          <>
            {days === 1 ? '오늘' : `최근 ${days}일`} 창에 해당 조건의 공시가 없습니다.
            {feed ? (
              <div className="mute" style={{ fontSize: 10.5, marginTop: 8 }}>
                스캔 {feed.scanned}건 · 창 안 {feed.matched}건 · 기준일(KST) {feed.today_kst}
                <br />데이터가 사라진 것이 아닙니다 — 기간을 넓히거나 카테고리를 풀어보세요.
              </div>
            ) : null}
          </>
        )}
      </div>
    )
  }
  return (
    <table className="grid">
      <thead>
        <tr>
          <th style={{ width: 24 }} className="c">#</th>
          <th>접수</th>
          <th>종목</th>
          <th>분류</th>
          <th>공시 제목</th>
          <th className="r">인라인 정량</th>
          <th className="c">분해</th>
        </tr>
      </thead>
      <tbody className="num">
        {rows.map((r, i) => {
          const rep = reports[r.rcept_no]
          const st = rep ? (PSTAT[rep.parse_status] || PSTAT.not_attempted) : null
          return (
            <tr key={r.rcept_no} className={r.rcept_no === sel ? 'sel' : ''} onClick={() => onSel(r.rcept_no)}>
              <td className="c mute">{i + 1}</td>
              <td className="mute" style={{ fontSize: 11 }}>{r.rcept_day}</td>
              <td>
                <b>{r.corp_name}</b>
                <span className="code num">{r.stock_code || ''}</span>
              </td>
              <td>
                <span className="tag" style={{ color: CAT_C[r.category] }}>{r.category_label}</span>
              </td>
              <td style={{ fontWeight: 600, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {r.is_correction ? <span className="tag" style={{ color: 'var(--warn)', marginRight: 3 }}>정정</span> : null}
                {r.report_nm}
              </td>
              <td className="r" style={{ maxWidth: 190, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {rep ? (rep.takeaway || <Val v={null} />) : (r.parsable ? <span className="mute">…</span> : <span className="mute">분해 대상 아님</span>)}
              </td>
              <td className="c">
                {st ? <span style={{ color: st[1], fontWeight: 700, fontSize: 10.5 }}>{st[0]}</span> : <span className="dash">·</span>}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

/* ── 메자닌 딥다이브 ─────────────────────────────────────────── */
function MezPanel({ row: r }) {
  if (!r) return <div className="empty">좌측에서 회차를 선택하세요.</div>
  const co = r.company || null
  // 커버는 __라우터가 계산해 준 값만__ 쓴다. 화면에서 나눗셈을 다시 하지
  // 않는다 — 두 군데서 계산하면 반드시 갈린다.
  const cover = co && co['현금 커버'] ? co['현금 커버'].value : null
  const iss = r.issuance
  const ok = typeof r.cross_check === 'string' && r.cross_check.includes('✓')
  // 플로어 게이지 — 하한(30% 지점)과 현재 전환가액의 상대 위치.
  // 하한이 없으면 __핀을 찍지 않는다.__ 없는 위치를 그리면 그림이 값을 지어낸다.
  const gaugeLeft = (r.floor && r.gap !== null)
    ? Math.max(4, Math.min(96, 30 + Math.min(r.gap, 120) * 0.55)) : null

  return (
    <>
      {/* 1페이지 리포트 머리 = 프레이밍 층(에디토리얼). 오버라인 → 제목 → 한 줄 요약.
          요약은 그리드와 같은 값을 문장으로 옮긴 것이고, 빈 값은 여기서는 [미기재] 로 명시한다
          (그리드의 대시가 뜻을 잃지 않도록 한 곳에서는 글자로 말한다). */}
      <div className="panel head">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ minWidth: 0 }}>
            <div className="ov">
              제{r.bd_tm}회 {r.sec_type || '?'} · {r.market || '시장미상'} · <span className="num">{r.stock_code || r.corp_code}</span>
              <span className="mute" style={{ marginLeft: 8, fontWeight: 400, letterSpacing: 0, textTransform: 'none' }}>
                종류 출처 {r.sec_type_source || '미상'}
              </span>
            </div>
            <h2>{r.corp_name}</h2>
            <div className="meta num">
              {r.cs.state === 'convertible' ? <b>전환가능</b> : r.cs.state === 'lockup' ? <b>락업중 D-{r.cs.d_day}</b> : r.cs.state === 'expired' ? <b className="mute">청구기간 종료</b> : <>상태 {MISSING}</>}
              {' · '}미전환 <b><Val v={krw(r.bal)} /></b>
              {r.pct !== null ? <> (발행주식 대비 <b className={r.pct >= 10 ? 'amb' : ''}>{r.pct}%</b>)</> : null}
              {' · '}전환가 <b><Val v={int(r.price)} suffix={r.price ? '원' : ''} /></b>
              {r.floor === null ? <> (하한 {MISSING})</> : r.floorHit ? <> (<b className="alert">하한 도달</b>)</> : <> (하한까지 +{r.gap}%)</>}
              {' · '}주가/하한 {r.pxFloor === null ? MISSING : <b className={r.pxHit ? 'alert' : ''}>{r.pxFloor}%</b>}
              {' · '}차기 풋 {r.dday === null || r.dday === undefined ? MISSING : <b className={r.dday <= 90 && r.dday >= 0 ? 'alert' : ''}>D-{r.dday}</b>}
              {' · '}커버 {cover === null || cover === undefined ? MISSING : <b className={cover < 1 ? 'alert' : ''}>{cover}x</b>}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div className="mute" style={{ fontSize: 10 }}>ANCHOR RCEPT_NO</div>
            <a className="num" style={{ fontWeight: 700, fontSize: 12 }} target="_blank" rel="noreferrer"
              href={r.anchor && r.anchor.dart_url}>{r.anchor && r.anchor.rcept_no} ↗</a>
            <div className="mute" style={{ fontSize: 10.5, marginTop: 2 }}>기준일 {r.anchor && r.anchor.as_of}</div>
          </div>
        </div>
        {/* 근거 공시 두 줄 — 잔액·전환가는 앵커 공시에서, 권면·조항·풋·락업은 발행결정에서 온다. 어느 공시인지 제목으로 밝힌다.
            발행결정이 없으면 대시 대신 __왜 없는지__(미개봉/회차 없음/목록 없음)를 같은 자리에 적는다. */}
        <div style={{ marginTop: 8, paddingTop: 6, borderTop: '1px dashed var(--line2)', fontSize: 10.5, lineHeight: 1.7 }} className="mute">
          <div><span style={{ fontWeight: 700, color: 'var(--ink2)' }}>잔액·전환가 근거</span>{' '}
            <a target="_blank" rel="noreferrer" href={r.anchor && r.anchor.dart_url} style={{ color: 'inherit' }}>
              {(r.anchor && r.anchor.report_nm) || '공시명 미상'}</a>
            {' '}<span className="num">({r.anchor && r.anchor.as_of})</span></div>
          <div><span style={{ fontWeight: 700, color: 'var(--ink2)' }}>권면·조항·풋 근거</span>{' '}
            {iss
              ? <><a target="_blank" rel="noreferrer" href={iss.dart_url} style={{ color: 'inherit' }}>{iss.report_nm || '주요사항보고서(발행결정)'}</a>
                  {' '}<span className="num">({iss.as_of})</span></>
              : <span className="miss" title={r.issuance_gap ? r.issuance_gap.detail : undefined}>
                  발행결정 미연결{r.issuance_gap ? ` — ${r.issuance_gap.reason}: ${r.issuance_gap.detail}` : ''}
                </span>}
          </div>
        </div>
      </div>

      <div className="viz">
        {/* VIZ 1 — 리픽싱 플로어 위치 */}
        <div className="panel">
          <div className="vh">
            <span>리픽싱 플로어 위치</span>
            {r.floor === null
              ? <span className="pill miss">{MISSING}</span>
              : <span className="pill" style={{ background: r.floorHit ? 'var(--alert)' : 'var(--surf)', color: r.floorHit ? '#fff' : 'var(--ink2)', border: '1px solid var(--line2)' }}>
                {r.floorHit ? '하한 도달' : `+${r.gap}%`}
              </span>}
          </div>
          <div className="gauge">
            <div className="floor" style={{ left: '30%' }} />
            {gaugeLeft !== null ? <div className="pin" style={{ left: `${gaugeLeft}%` }} /> : null}
          </div>
          <div className="rowline">
            <span>하한 <b><Val v={int(r.floor)} /></b></span>
            <span>전환가액 <b><Val v={int(r.price)} /></b></span>
          </div>
          {r.floor === null
            ? <div className="mute" style={{ fontSize: 10, marginTop: 4 }}>발행결정 원문 미확보 — 핀을 찍지 않습니다</div>
            : null}
        </div>

        {/* VIZ 2 — 권면 소진율 & 잠재 희석률 */}
        <div className="panel">
          <div className="vh">
            <span>권면 소진율 · 잠재 희석률</span>
            <span className="pill" style={{ border: '1px solid var(--line2)', color: 'var(--ink2)' }}>
              희석 {r.pct === null ? MISSING : `${r.pct}%`}
            </span>
          </div>
          {r.used === null ? (
            <div className="miss" style={{ fontSize: 11, padding: '6px 0' }}>
              권면총액 또는 잔액 미확보 — 소진율 {MISSING}
            </div>
          ) : (
            <div className="stack">
              <div style={{ width: `${r.used}%`, background: 'var(--sub)' }}>{r.used >= 14 ? `소진 ${r.used}%` : ''}</div>
              <div style={{ width: `${Math.round((100 - r.used) * 10) / 10}%`, background: 'var(--amber)', fontWeight: 700 }}>
                {100 - r.used >= 14 ? `잔여 ${Math.round((100 - r.used) * 10) / 10}%` : ''}
              </div>
            </div>
          )}
          <div className="rowline">
            <span>권면 <b><Val v={krw(r.face)} /></b>
              {r.faceSrc === '발행결정 소급' ? <span className="mute" style={{ fontSize: 9 }}> (발행결정에서 복사)</span> : null}</span>
            <span>출회대기 <b style={{ color: 'var(--amber)' }}><Val v={shares(r.rem)} /></b></span>
          </div>
          {/* 엑시트 평가액 = 잔여주식 × 현재가. 지금 다 전환해 팔면 시장에 나오는 금액. 차익은 원금(잔액) 대비 */}
          <div className="rowline">
            <span>엑시트 평가액 <b><Val v={krw(r.exitVal)} /></b></span>
            <span>평가 차익 <b className={r.exitGain !== null && r.exitGain > 0 ? '' : 'mute'}>
              {r.exitGain === null ? MISSING : `${r.exitGain > 0 ? '+' : ''}${krw(r.exitGain)}`}</b></span>
          </div>
        </div>

        {/* VIZ 3 — 조기상환 풋 */}
        <div className="panel">
          <div className="vh">
            <span>차기 조기상환 풋</span>
            {r.dday === null || r.dday === undefined
              ? <span className="pill miss">{MISSING}</span>
              : <span className="pill" style={{ background: r.dday <= 90 && r.dday >= 0 ? 'var(--alert)' : 'var(--sub)', color: '#fff' }}>
                {r.dday >= 0 ? `D-${r.dday}` : `D+${-r.dday}`}
              </span>}
          </div>
          <div className="rowline" style={{ marginTop: 6 }}>
            <span>차기 도래일 <b><Val v={r.putDate} /></b>
              {iss && iss.put_next_source === '주기 산출' ? <span className="mute" style={{ fontSize: 9 }}> (최초 {iss.put_first_date} + 주기)</span> : null}
              {iss && iss.put_next_source === '만기 경과' ? <span className="mute" style={{ fontSize: 9 }}> (만기 경과)</span> : null}
              {iss && iss.put_next_source === '주기 미상' ? <span className="mute" style={{ fontSize: 9 }}> (최초 {iss.put_first_date} 경과 · 주기 미상)</span> : null}
            </span>
            <span>만기 <b><Val v={iss && iss.maturity_date} /></b></span>
          </div>
          <div className="rowline">
            <span>주가 <b><Val v={int(r.px)} suffix={r.px ? '원' : ''} /></b>
              {r.pxAsOf ? <span className="mute" style={{ fontSize: 10 }}> @{String(r.pxAsOf).slice(5, 10)}</span> : null}</span>
            <span>하한비 <b className={r.pxHit ? 'alert' : ''}><Val v={r.pxFloor} suffix={r.pxFloor !== null ? '%' : ''} /></b>
              {' · '}전환가비 <b><Val v={r.pxConv} suffix={r.pxConv !== null ? '%' : ''} /></b></span>
          </div>
          <div className="rowline">
            <span>행사주기 <Val v={iss && iss.put_interval_months} suffix={iss && iss.put_interval_months ? '개월' : ''} /></span>
            <span>콜 상한 <Val v={iss && iss.call_cap_pct} suffix={iss && iss.call_cap_pct ? '%' : ''} /></span>
          </div>
          {/* 차기 리픽싱 — 마지막 조정 적용일(리픽싱 공시가 스스로 적음) + 주기(발행결정 조항). 하한 도달이면 날짜는 와도 단가는 안 깎인다 */}
          <div className="rowline" style={{ borderTop: '1px dashed var(--line2)', paddingTop: 4, marginTop: 4 }}>
            <span>차기 리픽싱 <b><Val v={r.rfx.next_date} /></b>
              {r.rfxD !== null ? <b style={{ marginLeft: 4 }}>{r.rfxD >= 0 ? `D-${r.rfxD}` : `D+${-r.rfxD}`}</b> : null}
              {r.rfx.next_source ? <span className="mute" style={{ fontSize: 9 }}> ({r.rfx.next_source})</span> : null}</span>
            <span>주기 <Val v={r.rfx.interval_months} suffix={r.rfx.interval_months ? '개월' : ''} />
              {r.rfx.last_apply_date ? <span className="mute" style={{ fontSize: 9 }}> · 마지막 적용 {r.rfx.last_apply_date}</span> : null}</span>
          </div>
        </div>

        {/* VIZ 3b — 실질 오버행 · 소화 일수 (고도화_0921 §4.2·§4.3)
            전환가능 물량에서 대주주 콜옵션 방어 물량을 뺀 것이 __진짜 튀어나올 물량__ 이다. 그것을 20일 평균
            거래량으로 나누면 며칠이면 시장이 다 받는지가 나온다. 콜 조항 유무를 모르면 둘 다 비운다. */}
        <div className="panel">
          <div className="vh">
            <span>실질 오버행 · 소화 일수</span>
            {r.dtc === null
              ? <span className="pill miss">{MISSING}</span>
              : <span className="pill" style={r.dtc >= DTC_ALERT_DAYS
                  ? { background: 'var(--alert)', color: '#fff' }
                  : { border: '1px solid var(--line2)', color: 'var(--ink2)' }}
                  title={`${DTC_ALERT_DAYS}일 이상 = 출회 물량이 20거래일 평균 거래량의 ${DTC_ALERT_DAYS}배(한 달치) 초과`}>{r.dtc}일{r.dtc >= DTC_ALERT_DAYS ? ' · 경보' : ''}</span>}
          </div>
          <div className="kv"><span className="k">잔여 전환가능주식</span><span className="v"><Val v={int(r.rem)} suffix={r.rem !== null ? ' 주' : ''} /></span></div>
          <div className="kv"><span className="k">− 콜 방어 물량 {iss && iss.call_cap_pct ? `(권면×${iss.call_cap_pct}%÷전환가)` : ''}</span>
            <span className="v"><Val v={int(r.callShares)} suffix={r.callShares !== null ? ' 주' : ''} /></span></div>
          <div className="kv"><span className="k">= 실질 오버행</span>
            <span className="v"><b><Val v={int(r.real)} suffix={r.real !== null ? ' 주' : ''} /></b>
              {r.realPct !== null ? <span className="mute"> (발행주식 대비 {r.realPct}%)</span> : null}</span></div>
          <div className="kv"><span className="k">÷ 20일 평균 거래량</span>
            <span className="v"><Val v={int(r.avgVol)} suffix={r.avgVol !== null ? ' 주' : ''} />
              {r.metrics && r.metrics['20일 평균 거래량'] && r.metrics['20일 평균 거래량'].as_of
                ? <span className="mute"> ({r.metrics['20일 평균 거래량'].as_of})</span> : null}</span></div>
          {r.real === null && r.realSrc ? <div className="mute" style={{ fontSize: 10, marginTop: 4 }}>실질 오버행 {MISSING} — {r.realSrc}{r.dtc !== null ? ' · 소화 일수는 콜 차감 전 잔여주식 기준' : ''}</div> : null}
          {/* 경보 기준 가이드 — 화면 안에 둔다. 별도 문서 없이 색의 뜻이 읽히도록 */}
          <div className="mute" style={{ fontSize: 9.5, marginTop: 4, lineHeight: 1.5 }}>
            기준: &lt;5일 소화 가능 · 5~{DTC_ALERT_DAYS}일 한 달 안 · <b>≥{DTC_ALERT_DAYS}일 경보</b>(출회 물량이 한 달치 거래량 초과).
            콜 방어 물량은 조항 상한이라 실질 오버행은 하한값.
          </div>
        </div>

        {/* VIZ 4 — 사채잔액 대비 현금 커버 + 분모·조달조건.
            2026-09-15: 라우터가 회사 단위 보유현금을 주기 시작해 목업의
            "보유현금 커버리지" 칸을 되살렸다. 재무가 없는 회사가 약 37% 라
            그때는 __커버를 계산하지 않고__ [미기재] 로 둔다. */}
        <div className="panel">
          <div className="vh">
            <span>사채잔액 · 보유현금</span>
            <span className="pill" style={{
              border: '1px solid var(--line2)',
              color: cover === null || cover === undefined ? 'var(--sub)'
                : (cover < 1 ? 'var(--alert)' : 'var(--ink2)'),
            }}>
              {cover === null || cover === undefined ? '커버 [미기재]' : `커버 ${cover}x`}
            </span>
          </div>
          <div className="kv"><span className="k">사채잔액 합산(회사)</span>
            <span className="v"><Val v={int(co && co['사채잔액 합산'] && co['사채잔액 합산'].value)} suffix=" 원" /></span></div>
          <div className="kv"><span className="k">보유현금</span>
            <span className="v">
              <Val v={int(co && co['보유현금'] && co['보유현금'].value)} suffix=" 원" />
              {co && co['보유현금'] && co['보유현금'].as_of
                ? <span className="mute" style={{ marginLeft: 4 }}>({co['보유현금'].as_of})</span>
                : null}
            </span></div>
        </div>

        <div className="panel">
          <div className="vh">
            <span>분모 · 조달 조건</span>
            <span className="pill mute" style={{ border: '1px solid var(--line2)' }}>
              {(r.denominator && r.denominator.source) || '출처미상'}
            </span>
          </div>
          <div className="kv"><span className="k">발행주식총수</span>
            <span className="v"><Val v={int(r.denominator && r.denominator.total_shares)} /></span></div>
          <div className="kv"><span className="k">기준일</span>
            <span className="v"><Val v={r.denominator && r.denominator.as_of} /></span></div>
          <div className="kv"><span className="k">표면이자율 / 만기이자율</span>
            <span className="v">
              <Val v={iss && iss.coupon_rate} suffix={iss && iss.coupon_rate !== null && iss.coupon_rate !== undefined ? '%' : ''} />
              {' / '}
              <Val v={iss && iss.ytm} suffix={iss && iss.ytm !== null && iss.ytm !== undefined ? '%' : ''} />
            </span></div>
        </div>
      </div>

      {/* 감사 추적 */}
      <div className="audit">
        <div className="ah">
          <span>DART 원문 대조 · 검산 원장</span>
          <span style={{ color: ok ? 'var(--stripInk)' : 'var(--badOnInk)', fontSize: 10.5 }}>
            {r.cross_check ? (ok ? '검산 일치' : '검산 불일치') : '검산 미판정'}
            {r.confidence === null || r.confidence === undefined ? null : (
              <span style={{ marginLeft: 6, opacity: .85 }}
                title="검산 결과에서 파생한 값입니다. 별도 점수가 아닙니다.">
                confidence {r.confidence.toFixed(2)}
              </span>
            )}
          </span>
        </div>
        <div className="abody">
          <div className="col">
            <div className="ct"><span>정량 분해 산출값</span><span>{r.parse_status || ''}</span></div>
            <div className="kv"><span className="k">미전환 잔액</span><span className="v"><Val v={int(r.bal)} suffix={r.bal !== null ? ' 원' : ''} /></span></div>
            <div className="kv"><span className="k">적용 전환가액</span><span className="v"><Val v={int(r.price)} suffix={r.price ? ' 원' : ''} /></span></div>
            <div className="kv"><span className="k">잔여 전환가능주식</span><span className="v"><Val v={int(r.rem)} suffix={r.rem !== null ? ' 주' : ''} /></span></div>
            <div className="kv"><span className="k">하한 도달 시 주식수</span><span className="v"><Val v={int(mv(r, '하한 도달 시 주식수'))} suffix={mv(r, '하한 도달 시 주식수') ? ' 주' : ''} /></span></div>
            <div className="kv"><span className="k">권면총액</span><span className="v"><Val v={int(r.face)} suffix={r.face ? ' 원' : ''} /></span></div>
          </div>
          <div className="col">
            <div className="ct"><span>발행사 자신의 산술</span>
              <span className="mute" style={{ fontSize: 9.5 }}>cross_check</span></div>
            <div className="calc">
              {r.cross_check
                ? <>{r.cross_check}<div className="mute" style={{ marginTop: 4, fontStyle: 'normal' }}>
                  미전환 잔액 ÷ 전환가액 == 잔여 전환가능주식. 세 숫자 모두 공시 원문에 있고,
                  이 식은 우리 계산이 아니라 발행사가 스스로 적은 것입니다.
                  닫는 규칙은 셋 — ±1주(절사·절상) · 원미만 반올림 가액(±0.5원) · 단수주 절사(보유자별 단수 버림, 1bp 이내).
                  어느 규칙으로 닫았는지 식 뒤에 적힙니다.
                </div></>
                : <span className="miss">{MISSING} — 검산 짝(잔액·전환가액·주식수) 부족</span>}
            </div>
            <div style={{ marginTop: 8, fontSize: 10.5, lineHeight: 1.6 }} className="mute">
              출처 DART 원문 · 접수번호 {r.anchor && r.anchor.rcept_no} · 추출 {r.anchor && r.anchor.as_of}
              <br />
              <a target="_blank" rel="noreferrer" href={r.anchor && r.anchor.dart_url}>원문 열기 ↗</a>
            </div>
          </div>
        </div>

        {(r.notes && r.notes.length) ? (
          <div className="note">
            <b>왜 비었나</b>
            <ul style={{ margin: '4px 0 0', paddingLeft: 16 }}>
              {r.notes.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
          </div>
        ) : null}
      </div>
    </>
  )
}

/* ── 플래시 딥다이브 ─────────────────────────────────────────── */
function FlashPanel({ row, rep }) {
  if (!row) return <div className="empty">좌측에서 공시를 선택하세요.</div>
  const st = rep ? (PSTAT[rep.parse_status] || PSTAT.not_attempted) : null
  const entries = rep && rep.metrics
    ? Object.entries(rep.metrics).filter(([k, v]) => !SKIP.has(k) && v !== null && v !== undefined && v !== '')
    : []
  // 서버가 `-` 를 그대로 흘려보내는 칸이 있다. 화면에서 `-` 는 __0 처럼 읽힌다__ —
  // 시도했는데 값이 없었다는 뜻이 되도록 [미기재] 로 바꿔 적는다.
  const shown = (v) => (String(v).trim() === '-' ? null : String(v))
  return (
    <>
      <div className="panel head">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ minWidth: 0 }}>
            <div className="ov">
              <span style={{ color: CAT_C[row.category] }}>{row.category_label}</span> · <span className="num">{row.stock_code || row.corp_code}</span> · {row.rcept_day}
            </div>
            <h2>{row.corp_name}</h2>
            <div className="meta">
              {row.is_correction ? <span className="tag" style={{ color: 'var(--warn)', marginRight: 5 }}>정정</span> : null}
              {row.report_nm}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div className="mute" style={{ fontSize: 9 }}>RCEPT_NO</div>
            {row.dart_url
              ? <a className="num" style={{ fontWeight: 700, fontSize: 11 }} target="_blank" rel="noreferrer" href={row.dart_url}>{row.rcept_no} ↗</a>
              : <span className="num miss" style={{ fontSize: 11 }}>{row.rcept_no}</span>}
            <div className="mute" style={{ fontSize: 9, marginTop: 2 }}>{row.rcept_day}</div>
          </div>
        </div>
      </div>

      <div className="audit" style={{ marginTop: 0 }}>
        <div className="ah">
          <span>1페이지 정량 분해</span>
          {st ? <span style={{ color: st[1] === 'var(--ok)' ? '#34d399' : '#fca5a5', fontSize: 9.5 }}>{st[0]}</span> : null}
        </div>
        <div className="abody" style={{ display: 'block' }}>
          <div className="col" style={{ width: '100%' }}>
            {!rep ? (
              <div className="mute" style={{ fontSize: 11, padding: '10px 0' }}>불러오는 중…</div>
            ) : entries.length ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {entries.map(([k, v]) => (
                    <tr key={k}>
                      <td style={{ padding: '3px 0', color: 'var(--sub)', fontSize: 10.5 }}>{MLABEL[k] || k}</td>
                      <td className="num" style={{ padding: '3px 0', textAlign: 'right', fontWeight: 700, fontSize: 11 }}>
                        <Val v={shown(v)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="miss" style={{ fontSize: 11, padding: '10px 0' }}>
                {MISSING} — 이 공시는 정량 분해 대상이 아니거나 원문에 값이 없습니다.
              </div>
            )}

            {rep && rep.takeaway ? (
              <div className="calc" style={{ marginTop: 8, fontVariantNumeric: 'normal', lineHeight: 1.6 }}>
                {rep.takeaway}
              </div>
            ) : null}

            {rep && rep.parse_errors && rep.parse_errors.length ? (
              <div className="note">
                <b>왜 비었나</b>
                <ul style={{ margin: '4px 0 0', paddingLeft: 16 }}>
                  {rep.parse_errors.map((e, i) => <li key={i}>{String(e)}</li>)}
                </ul>
              </div>
            ) : null}

            {rep ? (
              <div className="mute" style={{ marginTop: 8, fontSize: 9.5, lineHeight: 1.6 }}>
                출처 {rep.source || 'DART 공시원문'} · 유형 {rep.template_type}
                {rep.parse_confidence !== null && rep.parse_confidence !== undefined
                  ? ` · confidence ${rep.parse_confidence}` : ''}
                {rep.cached ? ' · 캐시' : ''}
                <br />추출 {rep.generated_at ? String(rep.generated_at).replace('T', ' ').slice(0, 19) : ''}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  )
}
