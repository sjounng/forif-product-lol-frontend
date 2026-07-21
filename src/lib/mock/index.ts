import type {
  BalanceCandidate,
  Champion,
  DraftStep,
  Match,
  Player,
  Room,
  ScrimSession,
  SessionPlayer,
  User,
} from "@/types";

/**
 * 목업 더미 데이터.
 *
 * 화면 형태를 잡기 위한 가짜 데이터다. 각 화면이 실제 API에 붙는 순간
 * 해당 export 를 지운다. 이 파일이 비면 목업 단계가 끝난 것이다.
 *
 * 값은 아무렇게나 넣지 않았다 — DESIGN.md 의 수식과 맞춰뒀으므로
 * 화면 검토할 때 "이 숫자가 말이 되나"를 같이 볼 수 있다.
 *   예) 골드2 0LP → ladder_score 1400 → seed_rating 1500
 */

export const mockUser: User = {
  id: 1,
  email: "owner@test.com",
  displayName: "방장",
  avatarUrl: null,
};

export const mockRooms: Room[] = [
  {
    id: 1,
    name: "포리프 정기 내전",
    description: "매주 목요일 밤 9시",
    publicCode: "K7QM2XPA",
    guestCanDraft: true,
    playerCount: 24,
    sessionCount: 12,
    status: "ACTIVE",
    createdAt: "2026-04-02",
  },
  {
    id: 2,
    name: "주말 빡겜방",
    description: "피어리스 전용",
    publicCode: "B3VN9WLD",
    guestCanDraft: false,
    playerCount: 15,
    sessionCount: 4,
    status: "ACTIVE",
    createdAt: "2026-06-18",
  },
];

export const mockPlayers: Player[] = [
  {
    id: 1,
    displayName: "칼바람만함",
    riotAccount: { gameName: "Hide on bush", tagLine: "KR1", tier: "DIAMOND", division: "II", leaguePoints: 42 },
    rating: 2160, rd: 88, gamesPlayed: 31, wins: 20, losses: 11,
    primaryLane: "MID", secondaryLane: "TOP",
    lanePool: { TOP: 4, JUNGLE: 1, MID: 5, ADC: 2, SUPPORT: 0 },
    isActive: true,
  },
  {
    id: 2,
    displayName: "정글차이",
    riotAccount: { gameName: "Oner", tagLine: "KR2", tier: "EMERALD", division: "I", leaguePoints: 78 },
    rating: 1893, rd: 102, gamesPlayed: 24, wins: 13, losses: 11,
    primaryLane: "JUNGLE", secondaryLane: "TOP",
    lanePool: { TOP: 3, JUNGLE: 5, MID: 2, ADC: 0, SUPPORT: 1 },
    isActive: true,
  },
  {
    id: 3,
    displayName: "원딜장인",
    riotAccount: { gameName: "Gumayusi", tagLine: "KR1", tier: "PLATINUM", division: "III", leaguePoints: 12 },
    rating: 1704, rd: 140, gamesPlayed: 12, wins: 7, losses: 5,
    primaryLane: "ADC", secondaryLane: "MID",
    lanePool: { TOP: 0, JUNGLE: 0, MID: 3, ADC: 5, SUPPORT: 2 },
    isActive: true,
  },
  {
    id: 4,
    displayName: "서폿본능",
    riotAccount: { gameName: "Keria", tagLine: "KR1", tier: "GOLD", division: "II", leaguePoints: 0 },
    rating: 1500, rd: 210, gamesPlayed: 6, wins: 3, losses: 3,
    primaryLane: "SUPPORT", secondaryLane: "FILL",
    lanePool: { TOP: 2, JUNGLE: 2, MID: 2, ADC: 3, SUPPORT: 5 },
    isActive: true,
  },
  {
    id: 5,
    displayName: "탑솔러",
    riotAccount: { gameName: "Zeus", tagLine: "KR3", tier: "PLATINUM", division: "I", leaguePoints: 55 },
    rating: 1788, rd: 121, gamesPlayed: 18, wins: 10, losses: 8,
    primaryLane: "TOP", secondaryLane: null,
    lanePool: { TOP: 5, JUNGLE: 3, MID: 1, ADC: 0, SUPPORT: 0 },
    isActive: true,
  },
  {
    id: 6,
    displayName: "뉴비입니다",
    riotAccount: null,
    rating: 1280, rd: 350, gamesPlayed: 0, wins: 0, losses: 0,
    primaryLane: "FILL", secondaryLane: null,
    lanePool: { TOP: 2, JUNGLE: 2, MID: 2, ADC: 2, SUPPORT: 2 },
    isActive: true,
  },
  {
    id: 7,
    displayName: "미드왕",
    riotAccount: { gameName: "Faker", tagLine: "T1", tier: "MASTER", division: null, leaguePoints: 231 },
    rating: 2295, rd: 74, gamesPlayed: 44, wins: 31, losses: 13,
    primaryLane: "MID", secondaryLane: "ADC",
    lanePool: { TOP: 1, JUNGLE: 2, MID: 5, ADC: 4, SUPPORT: 1 },
    isActive: true,
  },
  {
    id: 8,
    displayName: "라인전지옥",
    riotAccount: { gameName: "Doran", tagLine: "KR1", tier: "GOLD", division: "I", leaguePoints: 22 },
    rating: 1620, rd: 168, gamesPlayed: 9, wins: 3, losses: 6,
    primaryLane: "TOP", secondaryLane: "SUPPORT",
    lanePool: { TOP: 5, JUNGLE: 0, MID: 1, ADC: 1, SUPPORT: 4 },
    isActive: true,
  },
  {
    id: 9,
    displayName: "봇duo",
    riotAccount: { gameName: "Peyz", tagLine: "KR1", tier: "EMERALD", division: "III", leaguePoints: 61 },
    rating: 1822, rd: 115, gamesPlayed: 21, wins: 12, losses: 9,
    primaryLane: "ADC", secondaryLane: "SUPPORT",
    lanePool: { TOP: 0, JUNGLE: 1, MID: 2, ADC: 5, SUPPORT: 4 },
    isActive: true,
  },
  {
    id: 10,
    displayName: "정글고인물",
    riotAccount: { gameName: "Canyon", tagLine: "KR1", tier: "DIAMOND", division: "IV", leaguePoints: 8 },
    rating: 2044, rd: 96, gamesPlayed: 27, wins: 17, losses: 10,
    primaryLane: "JUNGLE", secondaryLane: "MID",
    lanePool: { TOP: 2, JUNGLE: 5, MID: 4, ADC: 0, SUPPORT: 0 },
    isActive: true,
  },
  {
    id: 11,
    displayName: "관전러",
    riotAccount: { gameName: "Kkoma", tagLine: "KR1", tier: "GOLD", division: "IV", leaguePoints: 44 },
    rating: 1421, rd: 155, gamesPlayed: 11, wins: 5, losses: 6,
    primaryLane: "SUPPORT", secondaryLane: "FILL",
    lanePool: { TOP: 1, JUNGLE: 1, MID: 2, ADC: 2, SUPPORT: 5 },
    isActive: true,
  },
  {
    id: 12,
    displayName: "복귀유저",
    riotAccount: { gameName: "Bengi", tagLine: "KR1", tier: "PLATINUM", division: "II", leaguePoints: 19 },
    rating: 1655, rd: 245, gamesPlayed: 4, wins: 2, losses: 2,
    primaryLane: "JUNGLE", secondaryLane: "SUPPORT",
    lanePool: { TOP: 0, JUNGLE: 5, MID: 1, ADC: 1, SUPPORT: 3 },
    isActive: true,
  },
];

export const mockSessions: ScrimSession[] = [
  {
    id: 41, name: "7/21 정기 내전", fearlessMode: "GLOBAL_FEARLESS",
    status: "IN_PROGRESS", ratingEnabled: true, gameCount: 2, playerCount: 12,
    createdAt: "2026-07-21",
  },
  {
    id: 40, name: "7/14 정기 내전", fearlessMode: "FEARLESS",
    status: "FINISHED", ratingEnabled: true, gameCount: 4, playerCount: 11,
    createdAt: "2026-07-14",
  },
  {
    id: 39, name: "7/7 친선전", fearlessMode: "NONE",
    status: "FINISHED", ratingEnabled: false, gameCount: 3, playerCount: 10,
    createdAt: "2026-07-07",
  },
];

/**
 * 12명 참가 = 매 게임 2명이 쉰다.
 * 배열 순서 = 서버가 주는 투입 순번 그대로다 (games_played ASC → bench_priority DESC
 * → last_played_game_no ASC). 화면은 정렬하지 않고 받은 순서대로 그린다.
 *
 * 2게임 진행 = 출전 20인분: 6명이 2판, 6명이 1판. 위 10명이 3게임째 후보.
 */
export const mockSessionPlayers: SessionPlayer[] = [
  { playerId: 11, displayName: "관전러", status: "ROSTERED", rating: 1421, gamesPlayed: 1, gamesBenched: 1, lastPlayedGameNo: 1, primaryLane: "SUPPORT" },
  { playerId: 4, displayName: "서폿본능", status: "ROSTERED", rating: 1500, gamesPlayed: 1, gamesBenched: 1, lastPlayedGameNo: 1, primaryLane: "SUPPORT" },
  { playerId: 8, displayName: "라인전지옥", status: "ROSTERED", rating: 1620, gamesPlayed: 1, gamesBenched: 1, lastPlayedGameNo: 1, primaryLane: "TOP" },
  { playerId: 3, displayName: "원딜장인", status: "ROSTERED", rating: 1704, gamesPlayed: 1, gamesBenched: 1, lastPlayedGameNo: 2, primaryLane: "ADC" },
  { playerId: 12, displayName: "복귀유저", status: "ROSTERED", rating: 1655, gamesPlayed: 1, gamesBenched: 1, lastPlayedGameNo: 2, primaryLane: "JUNGLE" },
  { playerId: 5, displayName: "탑솔러", status: "ROSTERED", rating: 1788, gamesPlayed: 1, gamesBenched: 1, lastPlayedGameNo: 2, primaryLane: "TOP" },
  { playerId: 7, displayName: "미드왕", status: "ROSTERED", rating: 2295, gamesPlayed: 2, gamesBenched: 0, lastPlayedGameNo: 2, primaryLane: "MID" },
  { playerId: 1, displayName: "칼바람만함", status: "ROSTERED", rating: 2160, gamesPlayed: 2, gamesBenched: 0, lastPlayedGameNo: 2, primaryLane: "MID" },
  { playerId: 10, displayName: "정글고인물", status: "ROSTERED", rating: 2044, gamesPlayed: 2, gamesBenched: 0, lastPlayedGameNo: 2, primaryLane: "JUNGLE" },
  { playerId: 2, displayName: "정글차이", status: "ROSTERED", rating: 1893, gamesPlayed: 2, gamesBenched: 0, lastPlayedGameNo: 2, primaryLane: "JUNGLE" },
  { playerId: 9, displayName: "봇duo", status: "BENCHED", rating: 1822, gamesPlayed: 2, gamesBenched: 0, lastPlayedGameNo: 2, primaryLane: "ADC" },
  { playerId: 6, displayName: "뉴비입니다", status: "BENCHED", rating: 1280, gamesPlayed: 2, gamesBenched: 0, lastPlayedGameNo: 2, primaryLane: "FILL" },
];

/**
 * 팀 구성 후보 3건. cost 가 낮을수록 좋다 (DESIGN §5).
 * 1순위는 실제로 하드 제약(총합차 150, 라인차 300)을 만족하는 값이다 —
 * 화면에서 밸런스 빔이 눈금 안에 들어오는지 확인할 수 있다.
 */
export const mockCandidates: BalanceCandidate[] = [
  {
    id: 501, rankNo: 1, cost: 118.4, totalDiff: 59, maxLaneDiff: 168, offRoleCount: 1,
    predictedBlueWinrate: 0.492,
    assignment: [
      { playerId: 5, displayName: "탑솔러", side: "BLUE", lane: "TOP", effRating: 1788, assignedFrom: "PRIMARY" },
      { playerId: 2, displayName: "정글차이", side: "BLUE", lane: "JUNGLE", effRating: 1893, assignedFrom: "PRIMARY" },
      { playerId: 7, displayName: "미드왕", side: "BLUE", lane: "MID", effRating: 2295, assignedFrom: "PRIMARY" },
      { playerId: 3, displayName: "원딜장인", side: "BLUE", lane: "ADC", effRating: 1704, assignedFrom: "PRIMARY" },
      // 정글러를 서폿에 넣었다. 유효 점수를 0.85배로 깎아서 팀에 반영한다 (DESIGN §4.3-A)
      { playerId: 12, displayName: "복귀유저", side: "BLUE", lane: "SUPPORT", effRating: 1407, assignedFrom: "OFF_ROLE" },
      { playerId: 8, displayName: "라인전지옥", side: "RED", lane: "TOP", effRating: 1620, assignedFrom: "PRIMARY" },
      { playerId: 10, displayName: "정글고인물", side: "RED", lane: "JUNGLE", effRating: 2044, assignedFrom: "PRIMARY" },
      { playerId: 1, displayName: "칼바람만함", side: "RED", lane: "MID", effRating: 2160, assignedFrom: "PRIMARY" },
      { playerId: 9, displayName: "봇duo", side: "RED", lane: "ADC", effRating: 1822, assignedFrom: "PRIMARY" },
      { playerId: 4, displayName: "서폿본능", side: "RED", lane: "SUPPORT", effRating: 1500, assignedFrom: "PRIMARY" },
    ],
  },
  {
    id: 502, rankNo: 2, cost: 146.9, totalDiff: 118, maxLaneDiff: 268, offRoleCount: 1,
    predictedBlueWinrate: 0.474,
    assignment: [],
  },
  {
    id: 503, rankNo: 3, cost: 203.2, totalDiff: 12, maxLaneDiff: 391, offRoleCount: 3,
    predictedBlueWinrate: 0.503,
    assignment: [],
  },
];

export const mockMatches: Match[] = [
  { id: 902, gameNo: 2, status: "COMPLETED", winnerSide: "RED", blueTotal: 9088, redTotal: 9146, durationSec: 2114, endedAt: "22:38" },
  { id: 901, gameNo: 1, status: "COMPLETED", winnerSide: "BLUE", blueTotal: 8840, redTotal: 8912, durationSec: 1876, endedAt: "21:52" },
];

/** 밴픽 그리드용. 실제로는 Data Dragon 에서 160여 개가 온다 */
export const mockChampions: Champion[] = [
  { id: 266, riotId: "Aatrox", nameKo: "아트록스", imageUrl: null },
  { id: 103, riotId: "Ahri", nameKo: "아리", imageUrl: null },
  { id: 84, riotId: "Akali", nameKo: "아칼리", imageUrl: null },
  { id: 12, riotId: "Alistar", nameKo: "알리스타", imageUrl: null },
  { id: 32, riotId: "Amumu", nameKo: "아무무", imageUrl: null },
  { id: 34, riotId: "Anivia", nameKo: "애니비아", imageUrl: null },
  { id: 1, riotId: "Annie", nameKo: "애니", imageUrl: null },
  { id: 22, riotId: "Ashe", nameKo: "애쉬", imageUrl: null },
  { id: 136, riotId: "AurelionSol", nameKo: "아우렐리온 솔", imageUrl: null },
  { id: 268, riotId: "Azir", nameKo: "아지르", imageUrl: null },
  { id: 432, riotId: "Bard", nameKo: "바드", imageUrl: null },
  { id: 53, riotId: "Blitzcrank", nameKo: "블리츠크랭크", imageUrl: null },
  { id: 63, riotId: "Brand", nameKo: "브랜드", imageUrl: null },
  { id: 201, riotId: "Braum", nameKo: "브라움", imageUrl: null },
  { id: 51, riotId: "Caitlyn", nameKo: "케이틀린", imageUrl: null },
  { id: 164, riotId: "Camille", nameKo: "카밀", imageUrl: null },
  { id: 69, riotId: "Cassiopeia", nameKo: "카시오페아", imageUrl: null },
  { id: 31, riotId: "Chogath", nameKo: "초가스", imageUrl: null },
  { id: 42, riotId: "Corki", nameKo: "코르키", imageUrl: null },
  { id: 122, riotId: "Darius", nameKo: "다리우스", imageUrl: null },
  { id: 131, riotId: "Diana", nameKo: "다이애나", imageUrl: null },
  { id: 119, riotId: "Draven", nameKo: "드레이븐", imageUrl: null },
  { id: 36, riotId: "DrMundo", nameKo: "문도 박사", imageUrl: null },
  { id: 245, riotId: "Ekko", nameKo: "에코", imageUrl: null },
  { id: 60, riotId: "Elise", nameKo: "엘리스", imageUrl: null },
  { id: 28, riotId: "Evelynn", nameKo: "이블린", imageUrl: null },
  { id: 81, riotId: "Ezreal", nameKo: "이즈리얼", imageUrl: null },
  { id: 9, riotId: "Fiddlesticks", nameKo: "피들스틱", imageUrl: null },
  { id: 114, riotId: "Fiora", nameKo: "피오라", imageUrl: null },
  { id: 105, riotId: "Fizz", nameKo: "피즈", imageUrl: null },
  { id: 3, riotId: "Galio", nameKo: "갈리오", imageUrl: null },
  { id: 41, riotId: "Gangplank", nameKo: "갱플랭크", imageUrl: null },
  { id: 86, riotId: "Garen", nameKo: "가렌", imageUrl: null },
  { id: 150, riotId: "Gnar", nameKo: "나르", imageUrl: null },
  { id: 79, riotId: "Gragas", nameKo: "그라가스", imageUrl: null },
  { id: 104, riotId: "Graves", nameKo: "그레이브즈", imageUrl: null },
];

/** 대회 표준 20스텝 중 진행 중인 상태 (6밴 → 6픽 → 4밴 → 4픽) */
export const mockDraftSteps: DraftStep[] = [
  { stepNo: 1, side: "BLUE", actionType: "BAN", championId: 266 },
  { stepNo: 2, side: "RED", actionType: "BAN", championId: 103 },
  { stepNo: 3, side: "BLUE", actionType: "BAN", championId: 84 },
  { stepNo: 4, side: "RED", actionType: "BAN", championId: 122 },
  { stepNo: 5, side: "BLUE", actionType: "BAN", championId: 245 },
  { stepNo: 6, side: "RED", actionType: "BAN", championId: 164 },
  { stepNo: 7, side: "BLUE", actionType: "PICK", championId: 268 },
  { stepNo: 8, side: "RED", actionType: "PICK", championId: 51 },
  { stepNo: 9, side: "RED", actionType: "PICK", championId: 60 },
  { stepNo: 10, side: "BLUE", actionType: "PICK", championId: 432 },
  { stepNo: 11, side: "BLUE", actionType: "PICK", championId: null },
  { stepNo: 12, side: "RED", actionType: "PICK", championId: null },
  { stepNo: 13, side: "RED", actionType: "BAN", championId: null },
  { stepNo: 14, side: "BLUE", actionType: "BAN", championId: null },
  { stepNo: 15, side: "RED", actionType: "BAN", championId: null },
  { stepNo: 16, side: "BLUE", actionType: "BAN", championId: null },
  { stepNo: 17, side: "RED", actionType: "PICK", championId: null },
  { stepNo: 18, side: "BLUE", actionType: "PICK", championId: null },
  { stepNo: 19, side: "BLUE", actionType: "PICK", championId: null },
  { stepNo: 20, side: "RED", actionType: "PICK", championId: null },
];

/** 피어리스로 이미 소진되어 이번 판에 못 쓰는 챔피언 */
export const mockFearlessUsed = [1, 22, 12, 32, 34, 136, 53, 63, 201, 69, 31, 42];
