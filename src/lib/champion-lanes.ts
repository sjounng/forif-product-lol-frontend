import type { Lane } from "@/types";

// TODO(api): 백엔드가 패치별 포지션 통계를 제공하면 이 임시 분류를 제거한다.
// Data Dragon의 tags는 역할군(Fighter, Mage 등)이며 실제 라인 정보가 아니다.
const CHAMPIONS_BY_LANE: Record<Lane, readonly string[]> = {
  TOP: [
    "Aatrox", "Akali", "Ambessa", "Aurora", "Camille", "Chogath", "Darius",
    "DrMundo", "Fiora", "Gangplank", "Garen", "Gnar", "Gragas", "Gwen",
    "Heimerdinger", "Illaoi", "Irelia", "Jax", "Jayce", "Kayle", "Kennen",
    "Kled", "KSante", "Malphite", "Maokai", "Mordekaiser", "Nasus", "Olaf",
    "Ornn", "Pantheon", "Poppy", "Quinn", "Renekton", "Rengar", "Riven",
    "Rumble", "Ryze", "Sett", "Shen", "Singed", "Sion", "Skarner",
    "TahmKench", "Teemo", "Trundle", "Tryndamere", "Udyr", "Urgot", "Vayne",
    "Vladimir", "Volibear", "Warwick", "MonkeyKing", "Yasuo", "Yone", "Yorick",
    "Zaahen",
  ],
  JUNGLE: [
    "Amumu", "Belveth", "Brand", "Briar", "Diana", "Ekko", "Elise", "Evelynn",
    "Fiddlesticks", "Gragas", "Graves", "Hecarim", "Ivern", "JarvanIV", "Jax",
    "Karthus", "Kayn", "Khazix", "Kindred", "LeeSin", "Lillia", "Maokai",
    "MasterYi", "Morgana", "Naafiri", "Nidalee", "Nocturne", "Nunu", "Olaf",
    "Pantheon", "Poppy", "Qiyana", "Rammus", "RekSai", "Rell", "Rengar",
    "Sejuani", "Shaco", "Shyvana", "Skarner", "Taliyah", "Talon", "Trundle",
    "Udyr", "Vi", "Viego", "Volibear", "Warwick", "MonkeyKing", "XinZhao",
    "Zac", "Zed", "Zyra",
  ],
  MID: [
    "Ahri", "Akali", "Akshan", "Anivia", "Annie", "AurelionSol", "Aurora",
    "Azir", "Cassiopeia", "Corki", "Diana", "Ekko", "Fizz", "Galio",
    "Heimerdinger", "Hwei", "Irelia", "Jayce", "Kassadin", "Katarina",
    "Leblanc", "Lissandra", "Locke", "Lucian", "Lux", "Malphite", "Malzahar", "Mel",
    "Naafiri", "Neeko", "Orianna", "Pantheon", "Qiyana", "Rumble", "Ryze",
    "Smolder", "Swain", "Sylas", "Syndra", "Taliyah", "Talon", "Tristana",
    "TwistedFate", "Veigar", "Velkoz", "Vex", "Viktor", "Vladimir", "Xerath",
    "Yasuo", "Yone", "Zed", "Ziggs", "Zilean", "Zoe",
  ],
  ADC: [
    "Aphelios", "Ashe", "Caitlyn", "Corki", "Draven", "Ezreal", "Jhin", "Jinx",
    "Kaisa", "Kalista", "Karthus", "KogMaw", "Lucian", "MissFortune", "Nilah",
    "Samira", "Senna", "Seraphine", "Sivir", "Smolder", "Swain", "Tristana",
    "Twitch", "Varus", "Vayne", "Xayah", "Yasuo", "Yunara", "Zeri", "Ziggs",
  ],
  SUPPORT: [
    "Alistar", "Amumu", "Ashe", "Bard", "Blitzcrank", "Brand", "Braum",
    "Heimerdinger", "Janna", "Karma", "Leona", "Lulu", "Lux", "Maokai", "Mel",
    "Milio", "Morgana", "Nami", "Nautilus", "Neeko", "Pantheon", "Poppy",
    "Pyke", "Rakan", "Rell", "Renata", "Senna", "Seraphine", "Sett", "Shaco",
    "Shen", "Sona", "Soraka", "Swain", "TahmKench", "Taric", "Thresh",
    "Velkoz", "Xerath", "Yuumi", "Zilean", "Zyra",
  ],
};

const LANES_BY_CHAMPION = Object.entries(CHAMPIONS_BY_LANE).reduce<
  Map<string, Lane[]>
>((result, [lane, championIds]) => {
  for (const riotId of championIds) {
    const lanes = result.get(riotId) ?? [];
    lanes.push(lane as Lane);
    result.set(riotId, lanes);
  }
  return result;
}, new Map());

export function getChampionLanes(riotId: string): readonly Lane[] {
  return LANES_BY_CHAMPION.get(riotId) ?? [];
}
