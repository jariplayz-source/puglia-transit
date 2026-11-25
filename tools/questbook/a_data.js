/* Questbook: a story adventure with dice, the phone is the game master. Everyone builds and plays their own hero on their
   own phone (or alone, with computer heroes). Choices lead to d20 checks; friends can help; fights are turn by turn.
   The world remembers: flags and reputation change later scenes, adventures have several endings, heroes carry over.
   Runs on the shared room log (room.js), so every phone sees the same story and the same dice. All stories are original.
   Paintings and portraits: Battle for Wesnoth artists (wesnoth.org), GNU GPL v2 or later. */
(function(){
let X=null;
const IMG="rq/";
const pic=k=>`${IMG}s_${k}.webp`,por=k=>`${IMG}p_${k.replace(/[/+]/g,"_")}.webp`;
/* ---------------- heroes ---------------- */
const ST={mig:["Might","💪"],agi:["Agility","🤸"],wit:["Wits","🧠"],cha:["Charm","💬"]};
const STS=["mig","agi","wit","cha"];
const CL={
  fighter:{n:"Fighter",e:"⚔️",s:{mig:2,agi:0,wit:-1,cha:0},hp:22,ac:15,atk:"mig",die:10,ab:"Mighty Blow",abt:"Attack with +6 damage.",tip:"Tough and strong. Breaks things and holds the line.",sug:[2,1,0,1]},
  rogue:{n:"Rogue",e:"🗡️",s:{mig:-1,agi:2,wit:0,cha:0},hp:17,ac:14,atk:"agi",die:6,ab:"Shadow Strike",abt:"An attack that always hits, double damage.",tip:"Quick and quiet. Sneaking, climbing and locks.",sug:[0,2,1,1]},
  wizard:{n:"Wizard",e:"🔮",s:{mig:-1,agi:0,wit:2,cha:0},hp:13,ac:12,atk:"wit",die:6,ab:"Fireball",abt:"2d6 + Wits damage to every enemy.",tip:"Clever and fragile. Riddles, magic and old books.",sug:[0,1,2,1]},
  cleric:{n:"Cleric",e:"✨",s:{mig:1,agi:-1,wit:1,cha:0},hp:19,ac:15,atk:"mig",die:8,ab:"Healing Light",abt:"Heal a hero 2d6 + 3 (also wakes up a fallen one).",tip:"Wise and steady. Keeps the party alive.",sug:[1,0,2,1]},
  bard:{n:"Bard",e:"🎻",s:{mig:-1,agi:0,wit:0,cha:2},hp:15,ac:13,atk:"agi",die:6,ab:"Inspire",abt:"A hero heals 1d6 and gets +4 on their next roll.",tip:"Charming and lucky. Talks the party through.",sug:[0,1,1,2]}};
const CLS=Object.keys(CL);
const AN={
  human:{n:"Human",e:"🧑",s:{cha:1},hp:2,t:"Adaptable and well liked: +1 Charm, +2 HP."},
  elf:{n:"Elf",e:"🧝",s:{agi:1,wit:1},hp:-2,t:"Graceful and sharp but slight: +1 Agility, +1 Wits, −2 HP. Knows forests and old tongues."},
  dwarf:{n:"Dwarf",e:"🧔",s:{mig:1,agi:-1},hp:5,t:"Stout and stubborn: +1 Might, −1 Agility, +5 HP. Knows stone and runes."}};
const ANS=Object.keys(AN);
const POR={
  human:["humans/swordsman","humans/swordsman-2","humans/spearman-2","humans/lieutenant","humans/fencer","humans/thief","humans/thief+female","humans/footpad+female","humans/outlaw+female",
    "humans/assassin+female","humans/huntsman","humans/ranger","humans/mage","humans/mage+female","humans/mage-red+female","humans/mage-white","humans/mage-white+female","humans/mage-silver+female"],
  elf:["elves/fighter","elves/hero","elves/captain","elves/archer","elves/archer+female","elves/ranger+female","elves/marksman+female","elves/druid","elves/shaman","elves/sorceress","elves/lady"],
  dwarf:["dwarves/fighter","dwarves/fighter-2","dwarves/guard","dwarves/thunderer","dwarves/runemaster","dwarves/explorer","dwarves/scout","dwarves/ulfserker"]};
/* a good first look for each class */
const POR0={fighter:[0,0,0],rogue:[6,3,6],wizard:[13,9,4],cleric:[16,8,4],bard:[4,4,5]};
const BG={
  soldier:{n:"Soldier",e:"🪖",s:"mig",t:"+1 Might. Guards and officers listen to you."},
  urchin:{n:"Street urchin",e:"🧢",s:"agi",t:"+1 Agility. You know thieves, tricks and haggling."},
  scholar:{n:"Scholar",e:"📚",s:"wit",t:"+1 Wits. You read old scripts and riddles."},
  noble:{n:"Noble",e:"👑",s:"cha",t:"+1 Charm and 15 gold. Titles open doors and purses."},
  sailor:{n:"Sailor",e:"⚓",s:"agi",t:"+1 Agility. Boats, knots and sea talk."},
  acolyte:{n:"Acolyte",e:"🕯️",s:"wit",t:"+1 Wits. Prayers and rites against the restless dead."}};
const BGS=Object.keys(BG);
const TR={
  tough:{n:"Tough",e:"🪨",t:"+5 HP."},
  lucky:{n:"Lucky",e:"🍀",t:"Once per adventure a failed check is rolled again."},
  silver:{n:"Silver tongue",e:"🗣️",t:"+2 on Charm checks."},
  keen:{n:"Keen mind",e:"🔎",t:"+2 on Wits checks."},
  brawler:{n:"Brawler",e:"👊",t:"+2 damage in fights."},
  stalwart:{n:"Stalwart",e:"🛡️",t:"+1 armour."}};
const TRS=Object.keys(TR);
/* rewards from endings; every hero keeps them, also in later games */
const TRO=[["ember","🔥","Maren's ember charm","+1 Wits"],["boots","👢","Goblin-stitched boots","+1 Agility"],["medal","🏅","Brindlemere medal","+1 Charm"],
  ["pearl","🫧","Pearl of the tide","+1 Might"],["scale","🐉","Siren-scale cloak","+1 armour"],["shell","🐚","Sleeping-song shell","+4 HP"]];
const TROI=Object.fromEntries(TRO.map((t,i)=>[t[0],i]));
/* the four powers of the region */
const FAC={brin:["Brindlemere","🏘️"],salt:["Saltmarrow","⚓"],gob:["Whisperwood goblins","👺"],mer:["The merfolk","🧜"]};
const FACS=Object.keys(FAC);
/* what the world remembers between adventures (and between games) */
const WF=["lan_won","maren","gob_friends","gob_fought","mayor_mad","bell_won","bell_peace","smug_jailed","smug_paid","mer_ally","tobin","maren_lost"];
const WFT={maren:"You saved Maren, the lantern keeper",maren_lost:"Maren died in the crypt",gob_friends:"The Whisperwood goblins call you boot-friends",gob_fought:"You fought the Whisperwood goblins",
  mayor_mad:"Mayor Hollin thinks you're greedy",smug_jailed:"You handed the smugglers to the harbour guard",smug_paid:"You paid the smugglers for the clapper",
  mer_ally:"The merfolk count you as friends",bell_peace:"You sang the Siren back to sleep",tobin:"Old Tobin told you the abbey's secret"};
/* ---------------- shops ---------------- */
const ITEM={potion:{n:"Potion",e:"🧪",p:12,t:"Heals 2d4 + 2. Shared by the party."},meal:{n:"Hot meal",e:"🍲",p:6,t:"Everyone heals 6 HP."},
  blade:{n:"Sharpened blades",e:"🗡️",p:30,t:"+1 damage for the whole party, for good (max +2)."},mail:{n:"Chain shirts",e:"⛓️",p:35,t:"+1 armour for the whole party, for good (max +2)."}};
const ITEMS=Object.keys(ITEM);
/* ---------------- monsters: name, emoji, hp, ac, attack, damage dice, portrait ---------------- */
const MON={
  thug:["Tavern Thug","🧔",7,11,2,[1,6],"humans/thug"],brute:["Tavern Brute","🧔",8,11,2,[1,6],"humans/ruffian"],goblin:["Goblin","👺",6,12,3,[1,6],"goblins/spearman"],
  gobboss:["Goblin Boss","👹",12,13,4,[1,8],"goblins/rouser"],spider:["Giant Spider","🕷️",9,12,3,[1,6],"monsters/giant-spider"],
  shade:["Shade","👻",8,12,3,[1,6],"undead/shadow"],wraith:["Shadow Wraith","💀",34,14,5,[2,6],"undead/wraith"],
  smug:["Smuggler","🏴‍☠️",8,12,3,[1,6],"humans/outlaw"],captain:["Captain Vask","🦜",15,13,4,[1,8],"humans/bandit"],crab:["Reef Crab","🦀",10,14,3,[1,6],"monsters/scuttler"],
  eel:["Storm Eel","🐍",9,13,4,[1,6],"monsters/water-serpent"],siren:["Siren of the Deep","🧜‍♀️",38,14,5,[2,6],"merfolk/enchantress"],drowned:["Drowned Sailor","🧟",10,11,3,[1,6],"undead/zombie-swimmer"]};
/* people you meet */
const NPC={mayor:["humans/duelist","Mayor Hollin"],maren:["humans/mage-light+female","Maren, the lantern keeper"],farmer:["humans/peasant","Farmer Otto"],smith:["dwarves/fighter-2","Dagna the smith"],
  gob:["goblins/rouser-2","Grub, goblin chief"],brin:["humans/sergeant","Harbourmaster Brin"],tobin:["humans/mage-red","Old Tobin"],vask:["humans/bandit","Captain Vask"],
  nib:["goblins/spearman","Nib the peddler"],guard:["merfolk/hoplite","Coralan, merfolk guard"],siren:["merfolk/enchantress","The Siren"]};
