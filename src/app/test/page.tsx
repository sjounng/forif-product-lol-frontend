"use client";

import { useMemo, useState } from "react";
import styles from "./page.module.css";

type Role = "전체" | "탑" | "정글" | "미드" | "원딜" | "서포터";

type Champion = {
  name: string;
  role: Exclude<Role, "전체">;
  hue: string;
  mark: string;
  disabled?: boolean;
};

const roles: { value: Role; label: string }[] = [
  { value: "전체", label: "ALL" },
  { value: "탑", label: "TOP" },
  { value: "정글", label: "JUNGLE" },
  { value: "미드", label: "MID" },
  { value: "원딜", label: "ADC" },
  { value: "서포터", label: "SUPPORT" },
];

const champions: Champion[] = [
  { name: "아트록스", role: "탑", hue: "#722d36", mark: "AT" },
  { name: "아리", role: "미드", hue: "#69518c", mark: "AH" },
  { name: "아칼리", role: "미드", hue: "#2f6670", mark: "AK" },
  { name: "알리스타", role: "서포터", hue: "#58486e", mark: "AL" },
  { name: "아무무", role: "정글", hue: "#51785e", mark: "AM" },
  { name: "애니비아", role: "미드", hue: "#4d7895", mark: "AN" },
  { name: "애니", role: "미드", hue: "#8e4a3f", mark: "NI" },
  { name: "애쉬", role: "원딜", hue: "#5b86a3", mark: "AS" },
  { name: "아우렐리온 솔", role: "미드", hue: "#394d8c", mark: "AU" },
  { name: "아지르", role: "미드", hue: "#9b7834", mark: "AZ" },
  { name: "바드", role: "서포터", hue: "#8a6c3f", mark: "BR" },
  { name: "블리츠크랭크", role: "서포터", hue: "#8d713c", mark: "BL" },
  { name: "브랜드", role: "미드", hue: "#9c4327", mark: "BN" },
  { name: "브라움", role: "서포터", hue: "#586f86", mark: "BM" },
  { name: "케이틀린", role: "원딜", hue: "#525c87", mark: "CA" },
  { name: "카밀", role: "탑", hue: "#476779", mark: "CM" },
  { name: "카시오페아", role: "미드", hue: "#4a7454", mark: "CS" },
  { name: "초가스", role: "탑", hue: "#71456f", mark: "CH" },
  { name: "코르키", role: "원딜", hue: "#826542", mark: "CO" },
  { name: "다리우스", role: "탑", hue: "#6d3034", mark: "DA" },
  { name: "다이애나", role: "정글", hue: "#53648c", mark: "DI" },
  { name: "드레이븐", role: "원딜", hue: "#8c5336", mark: "DR" },
  { name: "문도 박사", role: "탑", hue: "#6b4f78", mark: "MD" },
  { name: "에코", role: "정글", hue: "#34756c", mark: "EK" },
  { name: "엘리스", role: "정글", hue: "#783c4a", mark: "EL" },
  { name: "이블린", role: "정글", hue: "#714373", mark: "EV" },
  { name: "이즈리얼", role: "원딜", hue: "#667f9a", mark: "EZ" },
  { name: "피들스틱", role: "정글", hue: "#554a42", mark: "FI" },
  { name: "피오라", role: "탑", hue: "#785067", mark: "FO" },
  { name: "피즈", role: "미드", hue: "#39768a", mark: "FZ" },
];

const bluePicks = [
  ["TOP", "제우스", "아트록스", "AT", "#315c81"],
  ["JUG", "오너", "리 신", "LS", "#3d6a73"],
  ["MID", "페이커", "아지르", "AZ", "#7c6434"],
  ["BOT", "구마유시", "케이틀린", "CA", "#505d86"],
  ["SUP", "케리아", "바드", "BR", "#79643d"],
];

const redPicks = [
  ["TOP", "도란", "카밀", "CM", "#476779"],
  ["JUG", "캐니언", "니달리", "ND", "#7a6338"],
  ["MID", "쵸비", "아리", "AH", "#69518c"],
  ["BOT", "페이즈", "애쉬", "AS", "#5b86a3"],
  ["SUP", "리헨즈", "알리스타", "AL", "#58486e"],
];

const fearless = [
  ["그웬", "GW", "#4e7c83", "1"], ["바이", "VI", "#935b50", "1"],
  ["오리아나", "OR", "#8b744e", "1"], ["자야", "XY", "#6f4e76", "1"],
  ["라칸", "RK", "#5a708c", "1"], ["레넥톤", "RN", "#6a5540", "2"],
  ["세주아니", "SJ", "#527385", "2"], ["신드라", "SY", "#644b82", "2"],
];

function Portrait({ mark, hue }: { mark: string; hue: string }) {
  return (
    <span className={styles.portrait} style={{ "--portrait": hue } as React.CSSProperties}>
      <span>{mark}</span>
    </span>
  );
}

export default function DraftTestPage() {
  const [role, setRole] = useState<Role>("전체");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("아칼리");
  const [showFearless, setShowFearless] = useState(false);

  const filtered = useMemo(
    () => champions.filter((champion) =>
      (role === "전체" || champion.role === role) && champion.name.includes(query.trim()),
    ),
    [query, role],
  );

  return (
    <main className={styles.stage}>
      <div className={styles.ambient} />
      <header className={styles.scoreboard}>
        <section className={`${styles.teamHeader} ${styles.blueHeader}`}>
          <div className={styles.teamIdentity}><span className={styles.teamMonogram}>BLUE</span><div><b>균형의 수호자</b><small>BLUE SIDE</small></div></div>
          <strong className={styles.score}>0</strong>
        </section>
        <section className={styles.matchMeta}>
          <small>한타대학교 정기 내전</small>
          <b>소환사의 협곡</b>
          <span>3번째 세션 · 2번째 매치</span>
        </section>
        <section className={`${styles.teamHeader} ${styles.redHeader}`}>
          <strong className={styles.score}>1</strong>
          <div className={styles.teamIdentity}><div><b>협곡의 지배자</b><small>RED SIDE</small></div><span className={styles.teamMonogram}>RED</span></div>
        </section>
      </header>

      <div className={styles.timerBar}>
        <div className={styles.timerSide}><span>BLUE TURN</span><b>0:24</b></div>
        <div className={styles.phase}><span>12 / 20</span><b>RED TEAM PICK</b><i /></div>
        <div className={styles.timerSide}><b>0:24</b><span>RESERVE 0:38</span></div>
      </div>

      <section className={styles.draftBoard}>
        <aside className={styles.rail} aria-label="블루 팀 픽">
          {bluePicks.map(([lane, player, champion, mark, hue], index) => (
            <article className={`${styles.pickCard} ${index === 2 ? styles.activeBlue : ""}`} key={player}>
              <Portrait mark={mark} hue={hue} />
              <div><small>{lane} · {player}</small><b>{champion}</b></div>
              <em>{index + 1}</em>
            </article>
          ))}
        </aside>

        <section className={styles.centerPanel}>
          <div className={styles.panelTopline}>
            <div className={styles.tabs}>
              <button className={!showFearless ? styles.activeTab : ""} onClick={() => setShowFearless(false)}>CHAMPIONS</button>
              <button className={showFearless ? styles.activeTab : ""} onClick={() => setShowFearless(true)}>FEARLESS POOL</button>
            </div>
          </div>

          {!showFearless ? (
            <>
              <nav className={styles.roleFilters} aria-label="포지션 필터">
                {roles.map((item) => <button key={item.value} className={role === item.value ? styles.activeRole : ""} onClick={() => setRole(item.value)}>{item.label}</button>)}
                <label className={styles.search}><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search champion" /></label>
              </nav>
              <div className={styles.championInventory}>
                <div className={styles.championGrid}>
                {filtered.map((champion) => (
                  <button key={champion.name} onClick={() => setSelected(champion.name)} className={selected === champion.name ? styles.selectedChampion : ""}>
                    <Portrait mark={champion.mark} hue={champion.hue} />
                    <span>{champion.name}</span>
                    {selected === champion.name && <i>선택</i>}
                  </button>
                ))}
                </div>
              </div>
              <footer className={styles.selectionBar}>
                <div><span className={styles.selectionMark}>PICK</span><p><small>현재 선택</small><b>{selected}</b></p></div>
                <button>선택 확정 <span>↵</span></button>
              </footer>
            </>
          ) : (
            <div className={styles.fearlessPanel}>
              <div className={styles.fearlessTitle}><div><small>GLOBAL FEARLESS INVENTORY</small><h2>LOCKED CHAMPIONS</h2><p>양 팀 모두 다시 선택할 수 없습니다.</p></div></div>
              <div className={styles.fearlessGrid}>{fearless.map(([name, mark, hue, setNo]) => <article key={name}><div className={styles.fearlessPortrait}><Portrait mark={mark} hue={hue} /><span>LOCKED</span></div><b>{name}</b><small>SET {setNo}</small></article>)}</div>
            </div>
          )}
        </section>

        <aside className={`${styles.rail} ${styles.redRail}`} aria-label="레드 팀 픽">
          {redPicks.map(([lane, player, champion, mark, hue], index) => (
            <article className={`${styles.pickCard} ${index === 3 ? styles.activeRed : ""}`} key={player}>
              <em>{index + 1}</em>
              <div><small>{player} · {lane}</small><b>{champion}</b></div>
              <Portrait mark={mark} hue={hue} />
            </article>
          ))}
        </aside>
      </section>

      <footer className={styles.broadcastFooter}>
        <span><i className={styles.liveDot} /> LIVE DRAFT</span>
        <p>3번째 세션 · 2번째 매치 · 관전자 14명</p>
        <span>한타대학교 정기 내전</span>
      </footer>
    </main>
  );
}
