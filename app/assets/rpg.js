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
/* ---------------- the stories ----------------
   node: {p: picture, who: person, t: title, x: text, xf: [[condition, extra text]], c: [choices], f: fight, end, en: ending name,
          gold, goldIf, tr/trIf: rewards, rest, go (a node, or [[condition, node], …, default]), set: [flags], rep: {faction: ±n}, gain, shop}
   a node without a title only routes on (go) to the right next node.
   choice: {l: label, req: condition (shown only then), s: stat, dc, ok, no, okx, nox, oks/nos: flags, okr/nor: reputation, hurt, need, take,
            gain, go, tx: text when there's no roll, set, rep}
   conditions: "f:flag" "!f:flag" "r:gob>=2" "an:elf" "bg:noble" "cl:wizard" "it:key" "g:20", or a list of them (all must hold) */
const ADV={
lantern:{n:"The Lantern of Brindlemere",p:"hill",x:"The lantern on Brindlemere hill has kept the night-mists away for a hundred years. Last night it went dark, and its keeper vanished.",start:"l0",nodes:{
 l0:{p:"tavern",who:"mayor",t:"The Crooked Kettle",x:"The village tavern is packed and scared. Mist curls under the door. Mayor Hollin slams a purse on the bar: “Fifty gold to whoever brings old Maren and her lantern back before the mist swallows us.”",
   xf:[["f:bell_won","A sailor from Saltmarrow raises his mug: “The ones who silenced the Drowned Bell!” The room cheers for you."],["f:mayor_mad","Hollin eyes you sourly. He hasn't forgotten your last bargain."]],
   c:[{l:"Ask the locals what they saw",s:"cha",dc:11,ok:"l1",no:"l0f",okx:"A shaky farmer leans in: “Pale lights by the old chapel in Whisperwood. And goblins at the bridge, charging tolls.”",nox:"You ask the wrong man about his cousin. Chairs fly."},
      {l:"Remind the mayor who your family is",req:"bg:noble",s:"cha",dc:10,ok:"l1",no:"l1",okx:"Hollin pays twenty gold up front, red in the face.",nox:"Hollin is not impressed by titles, but he points you to the farmer who saw everything.",gain:{gold:20}},
      {l:"Demand double pay",s:"cha",dc:13,ok:"l1",no:"l1",okx:"He agrees, through his teeth. The room goes quiet: Brindlemere won't forget the greedy heroes.",nox:"“Fifty, and be glad of it!” Everyone saw you try.",oks:["double_pay","mayor_mad"],nos:["mayor_mad"],okr:{brin:-1},nor:{brin:-1}},
      {l:"The smuggler in the corner owes you a favour",req:"f:smug_paid",tx:"He grins: “Spiders in the chapel doorway, friend. Big ones.” Your money was worth something after all.",go:"l1",set:["warned"]},
      {l:"Go straight up the hill",go:"l2"}]},
 l0f:{p:"tavern",t:"Tavern brawl",x:"Two big regulars want a word with you, mostly with their fists.",f:{m:["thug","brute"],win:"l0w",lose:"l0l"}},
 l0w:{p:"tavern",who:"mayor",t:"Broken furniture",x:"You win, the tables don't. Hollin glares at the splinters: “That comes out of your fee.” The farmer slips you what he knows anyway.",set:["brawl"],rep:{brin:-1},go:"l1"},
 l0l:{p:"plain",t:"Thrown out",x:"You wake up in the hay behind the tavern. Nobody's hurt, only proud. The farmer who saw it all helps you up.",set:["brawl"],rep:{brin:-1},go:"l1"},
 l1:{p:"plain",who:"farmer",t:"What the village knows",x:"“Maren went up to fix the lantern at dusk and never came down,” says Farmer Otto. “Since then a cold blue glow sits on the ruined chapel deep in Whisperwood.” He points at the smithy: “Dagna's still open, if you want to get ready.”",
   c:[{l:"Visit Dagna's smithy",go:"l1s"},{l:"Head up the hill",go:"l2"}]},
 l1s:{p:"smithy",who:"smith",t:"Dagna's smithy",x:"Sparks fly. Dagna wipes her hands on her apron and nods at the racks.",shop:{fac:"brin",it:["potion","meal","blade","mail"]},
   xf:[["r:brin<0","“Heard about you,” she says, and puts her prices up."],["r:brin>=2","“Heroes of Brindlemere pay less here,” she says."]],
   c:[{l:"Head up the hill",go:"l2"}]},
 l2:{p:"hill",t:"Lantern Hill",x:"The great lantern stands cold. Its glass is smashed from the inside, and frost covers the stones in a strange pattern. Tracks lead down into Whisperwood.",
   c:[{l:"Search the lantern room",s:"wit",dc:12,ok:"l3",no:"l3",okx:"Under the frost you find Maren's silver key, and a note: “The heart of the flame must not leave the light.”",nox:"The mist rolls in while you search. It bites like ice.",gain:{item:"key"},hurt:["all",[1,4]]},
      {l:"Read the frost-runes in the stones",req:"an:dwarf",tx:"Dwarf eyes read what others miss: the frost is a curse-mark. Something that eats light took the flame, and it fears the flame's own heat.",go:"l3",set:["weak_known"]},
      {l:"Sense the magic that broke the lantern",req:"cl:wizard",s:"wit",dc:10,ok:"l3",no:"l3",okx:"A cold, hungry magic. A wraith, feeding on the Ember. Light is its weakness.",nox:"The magic slips away from you like smoke.",oks:["weak_known"]},
      {l:"Follow the tracks at once",go:"l3"}]},
 l3:{p:"forest",t:"Whisperwood",x:"The trees whisper your names. The path splits: an easy track down to the river, or straight through a wall of thorns towards the blue glow.",
   xf:[["f:gob_friends","Someone carved a grinning face into a tree, with a spoon. Your goblin friends live here."]],
   c:[{l:"Take the river path",go:"l4"},{l:"Cut through the thorns",s:"agi",dc:13,ok:"l5",no:"l5",okx:"You slip through like shadows and come out right at the chapel.",nox:"You make it through, but the thorns leave their mark.",hurt:["one",[1,6]]},
      {l:"Walk the old elf-paths",req:"an:elf",tx:"The trees lean aside for you. An hour later you stand before the chapel, rested and unseen.",go:"l5"}]},
 l4:{p:"bridge",who:"gob",t:"The goblin bridge",x:"Three goblins sit on a rickety bridge, sharpening spoons. “Toll!” squeaks the biggest. “Twenty gold, or we eat your boots.”",
   xf:[["f:gob_friends","Then he squints. “Wait. Boot-friends! It's the boot-friends!”"],["f:gob_fought","Then he squints. “YOU. Bridge-breakers!” The spoons come up."]],
   c:[{l:"Greet your old friends",req:"f:gob_friends",go:"l4t"},
      {l:"Pay the 20 gold",need:{gold:20},gain:{gold:-20},go:"l4t",rep:{gob:1}},
      {l:"Talk them out of it",s:"cha",dc:14,ok:"l4t",no:"l4f",okx:"The goblins giggle and wave you through.",nox:"“Liar!” the goblins shriek, and grab their spoons."},
      {l:"Haggle like on the street",req:"bg:urchin",s:"cha",dc:10,ok:"l4t",no:"l4f",okx:"Five gold and a shiny button. The goblins are delighted.",nox:"They don't like your button.",gain:{gold:-5}},
      {l:"Fight your way across",go:"l4f"}]},
 l4t:{p:"bridgesun",who:"gob",t:"Friends with goblins",x:"The goblins share their stew. Disgusting, but warming. “If you need us, shout SPOONS,” says chief Grub, “and we come running.”",set:["gob_friends"],rep:{gob:1},rest:0.3,go:"l5"},
 l4f:{p:"bridge",t:"Goblin ambush",x:"Spoons out! The goblin boss jumps off the railing.",f:{m:["goblin","goblin","gobboss"],win:"l4w",lose:"lL"},gold:15},
 l4w:{p:"bridge",t:"Bridge-breakers",x:"The goblins flee into the trees, screaming. Whisperwood's goblins will remember this.",set:["gob_fought"],rep:{gob:-2},go:"l5"},
 l5:{p:"chapel",t:"The ruined chapel",x:"The old chapel glows blue from inside. Thick webs cover the doorway, and something big shifts in the dark beyond.",
   xf:[["f:warned","You remember the smuggler's warning. Spiders."]],
   c:[{l:"Shout “SPOONS!”",req:"f:gob_friends",tx:"Twenty goblins burst from the bushes and tear the webs down, cackling. The spiders flee. Grub salutes you with a ladle.",go:"l6",rep:{gob:1},set:["gob_help"]},
      {l:"Burn the webs away",s:"wit",dc:11,ok:"l6",no:"l5f",okx:"A quick spark and the webs go up. Whatever lived there flees deeper.",nox:"The webs won't catch. Two giant spiders drop down."},
      {l:"Sneak past along the wall",s:"agi",dc:13,ok:"l6",no:"l5f",okx:"Not a strand trembles. You're inside.",nox:"You touch one strand. Just one."}]},
 l5f:{p:"chapel",t:"Spiders!",x:"Two giant spiders, all legs and hunger.",f:{m:["spider","spider"],win:"l6",lose:"lL"}},
 l6:{p:"door",t:"The riddle door",x:"Steps lead down to a stone door. Carved letters glow: “I am hungry, I must be fed; the finger I touch will soon turn red. What am I?”",
   c:[{l:"Answer the riddle",s:"wit",dc:13,ok:"l7",no:"l7",okx:"“Fire!” The door grinds open and warm air rushes past.",nox:"Wrong. A dart hisses out of the wall before the door opens.",hurt:["one",[1,6]]},
      {l:"Read the old script around the frame",req:"bg:scholar",tx:"It's a prayer to the hearth, and it ends with the answer: fire. The door opens for you like an old friend.",go:"l7"},
      {l:"Use Maren's silver key",need:{item:"key"},go:"l7"},
      {l:"Break it down",s:"mig",dc:14,ok:"l7",no:"l7",okx:"The old door gives way with a crash.",nox:"It breaks in the end, but so do your shoulders.",hurt:["all",[1,4]]}]},
 l7:{p:"crypt",who:"maren",t:"The crypt",x:"Old Maren hangs in chains above a cold altar. On it lies the Ember Heart, the lantern's flame, and a Shadow Wraith drinks its light. It turns towards you.",
   xf:[["f:weak_known","You know its weakness: the Ember's own heat."]],
   c:[{l:"Free Maren first",s:"agi",dc:12,ok:"l7b",no:"l7c",okx:"You snap the chains. Maren grabs the Ember Heart and blasts the wraith with its light!",nox:"The wraith sees you coming and throws you back.",oks:["maren_free"]},
      {l:"Speak the rite of rest over the dead",req:"bg:acolyte",s:"wit",dc:11,ok:"l7b",no:"l7c",okx:"The shades falter at the old words. In the moment of quiet you cut Maren loose.",nox:"Your voice shakes. The wraith laughs.",oks:["maren_free"]},
      {l:"Attack the wraith",go:"l7c"}]},
 l7b:{p:"wraith",t:"Light against shadow",x:"The wraith shrieks and shrinks, weakened by the flame. It still fights.",f:{m:["wraith","shade"],win:"l8",lose:"lL",weak:12,
   weakIf:[["f:gob_help",6,"👺 The goblins pour in shouting SPOONS and pelt the wraith."],["f:weak_known",5,"🔥 You aim every blow at the Ember's light."]]}},
 l7c:{p:"wraith",t:"The Shadow Wraith",x:"The wraith rises, and the shades of the crypt with it. Above you, Maren's light grows dim.",f:{m:["wraith","shade","shade"],win:"l8",lose:"lL",
   weakIf:[["f:gob_help",6,"👺 The goblins pour in shouting SPOONS and pelt the wraith."],["f:weak_known",5,"🔥 You aim every blow at the Ember's light."]]}},
 l8:{go:[["!f:maren_free","l8c"],["r:brin>=0","l8a"],"l8b"]},
 l8a:{p:"villagewin",who:"maren",t:"Hero of Brindlemere",x:"Maren carries the Ember Heart back up the hill and the lantern blazes. The mist flees the valley. Hollin pays up, and the Crooked Kettle sings your names all night. Maren presses a warm charm into each of your hands.",
   xf:[["f:gob_friends","At the edge of the light, a row of goblins waves their spoons. Grub has promised to guard the lantern."],["f:double_pay","Hollin pays the double fee, stiffly, without a word of thanks."]],
   end:"win",en:"Hero of Brindlemere",gold:50,goldIf:[["f:double_pay",40]],tr:["ember","medal"],trIf:[["f:gob_friends","boots"]],set:["lan_won","maren"],rep:{brin:2}},
 l8b:{p:"hills",who:"maren",t:"The lantern burns",x:"The lantern blazes and the mist flees. Maren thanks you warmly, but the village keeps its distance after all the trouble. Hollin pays, and the door of the Crooked Kettle closes quietly behind you.",
   xf:[["f:gob_friends","Grub's goblins walk you to the edge of the valley, singing badly."]],
   end:"win",en:"The Lantern Burns",gold:35,goldIf:[["f:double_pay",30]],tr:["ember"],trIf:[["f:gob_friends","boots"]],set:["lan_won","maren"],rep:{brin:1}},
 l8c:{p:"hills",t:"A light rekindled, a keeper lost",x:"The wraith dies, but in its last breath it drinks the light from Maren. You carry the Ember Heart up the hill yourselves, and the lantern burns again. Brindlemere is safe. It buries its keeper the next morning.",
   end:"win",en:"A Keeper Lost",gold:30,goldIf:[["f:double_pay",20]],trIf:[["f:gob_friends","boots"]],set:["lan_won","maren_lost"],rep:{brin:1}},
 lL:{p:"mist",t:"Swallowed by mist",x:"Everything goes dark… You wake up in the village. A woodcutter found you at the edge of the forest. The lantern is still dark. Maybe another day.",end:"lose",en:"Lost in the mist"}}},
bell:{n:"The Drowned Bell",p:"harbour",x:"Every night a bell rings under the sea near Saltmarrow, and the fishermen walk into the waves in their sleep.",start:"b0",nodes:{
 b0:{p:"harbour",who:"brin",t:"Saltmarrow harbour",x:"Fog, gulls and worried faces. Harbourmaster Brin points at the empty boats: “Six men gone this week. They walk into the water singing. The bell started when the smugglers came.”",
   xf:[["f:lan_won","Brin squints at you. “The ones who lit Brindlemere's lantern? Good. We need that kind.”"],["f:mayor_mad","“Heard you squeezed Hollin for coin. Don't try that here.”"],["f:gob_friends","A small green figure waves at you from a barrel: Nib, the goblin peddler from Whisperwood!"]],
   c:[{l:"Talk to old Tobin by the nets",s:"cha",dc:11,ok:"b1",no:"b2",okx:"Old Tobin lights his pipe and waves you into his hut.",nox:"He only spits in the sea and turns away."},
      {l:"Ask the fishermen, sailor to sailor",req:"bg:sailor",tx:"They tell you everything: the smugglers ring the bell at midnight from a cove up north, and the town sleeps while they work.",go:"b2",set:["knows_cove"]},
      {l:"Visit Nib's barrel shop",req:"f:gob_friends",go:"b0n"},
      {l:"Visit the ship's chandler",go:"b0c"},
      {l:"Climb the lighthouse to look out",go:"b2"}]},
 b0n:{p:"harbour",who:"nib",t:"Nib's barrel",x:"“Boot-friends! Best prices on the coast, for you.” Nib's barrel holds a surprising amount of stuff.",shop:{fac:"gob",it:["potion","meal","blade"]},c:[{l:"Back to the harbour",go:"b0"}]},
 b0c:{p:"harbour",t:"The ship's chandler",x:"Rope, tar, lamp oil and a shelf of brown bottles.",shop:{fac:"salt",it:["potion","meal","mail"]},
   xf:[["r:salt<0","The chandler doesn't smile. “Cash first.”"],["r:salt>=2","“For Saltmarrow's friends, a discount.”"]],c:[{l:"Back to the harbour",go:"b0"}]},
 b1:{p:"hut",who:"tobin",t:"Tobin's story",x:"“A hundred years ago the sea took the abbey, bell and all. One of the sisters went down with it, and the sea made her into the Siren. The bell's true song puts her to sleep. Rung wrong, it wakes her, hungry for voices.” He hands you a bottle: “For your lungs.”",set:["tobin"],gain:{potion:1},go:"b2"},
 b2:{p:"lighthouse",t:"The lighthouse",x:"From the top you see it: lantern lights in a cove north of town, where no boat should be. And far out, a ring of strange calm water.",
   xf:[["f:knows_cove","Just like the fishermen said."]],
   c:[{l:"Sneak to the smugglers' cove",go:"b3"},{l:"Row straight to the calm water",s:"mig",dc:13,ok:"b4",no:"b4",okx:"Strong strokes through the swell bring you right above the old abbey.",nox:"The sea fights back. You get there, soaked and battered.",hurt:["all",[1,4]]}]},
 b3:{p:"cove",who:"vask",t:"The smugglers' cove",x:"Crates of stolen church silver, and a dozen smugglers around a fire. Captain Vask holds a tarnished bell clapper and laughs: “Every night we ring it, and every night the town sleeps while we work!”",
   c:[{l:"Order them to surrender in the guard's name",req:"bg:soldier",s:"cha",dc:11,ok:"b3j",no:"b3f",okx:"Old habits: half of them drop their knives before they think.",nox:"Vask laughs. “What guard?”"},
      {l:"Bluff: “The harbour guard is coming!”",s:"cha",dc:14,ok:"b3w",no:"b3f",okx:"Panic! The smugglers run. In the rush, Vask drops the clapper.",nox:"Vask draws his sword. “Nice try.”"},
      {l:"Steal the clapper quietly",s:"agi",dc:14,ok:"b3w",no:"b3f",okx:"Nobody notices a thing until you're long gone.",nox:"A parrot screams. Everyone turns."},
      {l:"Buy the clapper for 30 gold",need:{gold:30},gain:{gold:-30},go:"b3p"},
      {l:"Charge!",go:"b3f"}]},
 b3p:{p:"cove",who:"vask",t:"A deal with thieves",x:"Vask bites the coins and tosses you the clapper. “Pleasure.” By morning his boat is gone, and so is the church silver. Saltmarrow will hear who paid him.",gain:{item:"clapper"},set:["smug_paid"],rep:{salt:-1},go:"b4"},
 b3w:{p:"cove",t:"The clapper",x:"You hold the bell's clapper. Without it, the Siren's call is half as strong. Now to the calm water.",gain:{item:"clapper"},go:"b4"},
 b3f:{p:"cove",t:"Fight in the cove",x:"Steel rings out over the waves.",f:{m:["smug","smug","captain"],win:"b3j",lose:"bL"},gold:25},
 b3j:{p:"cove",who:"brin",t:"Tied up for the guard",x:"You tie the smugglers up and send a boy running for Brin. The church silver goes back, and the clapper goes in your bag.",gain:{item:"clapper"},set:["smug_jailed"],rep:{salt:2},go:"b4"},
 b4:{p:"calm",t:"Above the drowned abbey",x:"The water here is calm as glass. Far below, a tower. The way down is a sea cave in the cliff, or a dive straight down.",
   c:[{l:"Dive straight down",s:"agi",dc:13,ok:"b5",no:"b5",okx:"Down through the green light, into the tower's window.",nox:"Out of breath, you swallow half the sea before you make it.",hurt:["one",[2,4]]},
      {l:"Light the cave with Maren's ember charm",req:"f:maren",tx:"The charm Maren gave you glows warm and bright. The cave creatures shrink from its light and you walk through untouched.",go:"b5"},
      {l:"Take the sea cave",go:"b4c"}]},
 b4c:{p:"coast",t:"The sea cave",x:"The cave is dry at low tide, but it's not empty.",f:{m:["crab","eel"],win:"b5",lose:"bL"}},
 b5:{p:"sunken",who:"guard",t:"The merfolk guard",x:"A merfolk warrior blocks the tower with a coral spear. “Land-walkers. The Siren is our shame. Why should we let you pass?”",
   xf:[["f:mer_ally","Then he lowers the spear. “Friends of the merfolk. Pass, and be blessed.”"]],
   c:[{l:"Accept his blessing, old friend",req:"f:mer_ally",go:"b5o"},
      {l:"Tell him you've come to end this",s:"cha",dc:12,ok:"b5o",no:"b5n",okx:"He lowers his spear. “Then take the abbey's blessing.” He gives you a shell that glows softly.",nox:"“Words. Land-walkers always have words.” But he steps aside, coldly.",okr:{mer:1}},
      {l:"Speak to him in the old sea-tongue",req:"an:elf",tx:"His eyes go wide at the old words. “Elf-friend. It has been long.” He bows and blesses you.",go:"b5o",rep:{mer:2}},
      {l:"Show him the bell's clapper",need:{item:"clapper"},go:"b5o",rep:{mer:1}}]},
 b5o:{p:"sunken",who:"guard",t:"A blessing",x:"The shell's glow warms you and everyone heals. “When you face her, I'll be close,” Coralan says.",set:["mer_ally"],rest:0.6,go:"b6"},
 b5n:{p:"sunken",t:"Alone",x:"You swim on into the tower, without his help.",go:"b6"},
 b6:{p:"tower",who:"siren",t:"The bell tower",x:"The great bronze bell hangs in the dark water. Coiled around it, singing, the Siren of the Deep opens her eyes. Drowned sailors drift up around her.",
   xf:[["f:tobin","You remember Tobin's words: the bell's true song puts her to sleep."]],
   c:[{l:"Put the clapper back and ring the true song",req:["f:tobin","it:clapper"],s:"cha",dc:12,ok:"b7p",no:"b6f",okx:"The bell rings low and slow. Her song falters, her eyes close…",nox:"A wrong note. She screams.",take:"clapper"},
      {l:"Sing louder than she does",s:"cha",dc:15,ok:"b6w",no:"b6f",okx:"Your voice fills the tower. Her song cracks!",nox:"Her song is stronger. Your head spins."},
      {l:"Cover your ears and attack",go:"b6f"}]},
 b6w:{p:"deep",t:"The song breaks",x:"Weakened, the Siren lunges.",f:{m:["siren","drowned"],win:"b7",lose:"bL",weak:14,weakIf:[["f:mer_ally",8,"🧜 Coralan strikes from behind with his coral spear!"],["f:gob_friends",4,"👺 Nib throws a jar of pepper into the water. The Siren sneezes."]]}},
 b6f:{p:"deep",t:"The Siren of the Deep",x:"She screams, and the water itself attacks.",f:{m:["siren","drowned","drowned"],win:"b7",lose:"bL",weakIf:[["f:mer_ally",8,"🧜 Coralan strikes from behind with his coral spear!"],["f:gob_friends",4,"👺 Nib throws a jar of pepper into the water. The Siren sneezes."]]}},
 b7:{go:[["f:smug_jailed","b7a"],"b7b"]},
 b7a:{p:"dawn",who:"brin",t:"Saviours of Saltmarrow",x:"The Siren sinks into the dark and the bell goes still. At dawn the six fishermen wake up on the beach, confused and alive. The smugglers are in chains, the church silver is back, and Saltmarrow throws a feast.",
   xf:[["f:mer_ally","Out on the water, Coralan raises his spear in salute and leaves a pearl on the jetty for each of you."]],
   end:"win",en:"Saviours of Saltmarrow",gold:60,tr:["scale"],trIf:[["f:mer_ally","pearl"]],set:["bell_won"],rep:{salt:2}},
 b7b:{p:"dawn",t:"The bell is silent",x:"The Siren sinks into the dark and the bell goes still. At dawn the six fishermen wake up on the beach, alive. Brin pays you in silver, though the smugglers are long gone.",
   xf:[["f:smug_paid","Everyone in Saltmarrow knows whose gold paid for their escape."],["f:mer_ally","Out on the water, Coralan raises his spear in salute and leaves a pearl on the jetty for each of you."]],
   end:"win",en:"The Bell Is Silent",gold:45,tr:["scale"],trIf:[["f:mer_ally","pearl"]],set:["bell_won"],rep:{salt:1}},
 b7p:{p:"coast",who:"guard",t:"The sleeping song",x:"The Siren curls up around the bell and sleeps, smiling, like the sister she once was. The six fishermen wake on the beach. The merfolk sing for you all night, and Coralan gives each of you a shell that hums her song.",
   end:"win",en:"The Sleeping Song",gold:50,tr:["shell","pearl"],set:["bell_won","bell_peace","mer_ally"],rep:{mer:2,salt:1}},
 bL:{p:"deep",t:"Pulled under",x:"Cold water, then nothing… You wake up coughing on the beach. Tobin is there with a blanket: “The sea gave you back. It doesn't always.”",end:"lose",en:"Pulled under"}}}};
const ADVS=Object.keys(ADV);
/* ---------------- heroes: building and stats ---------------- */
/* points: −1…2 on each stat, adding up to 4 (lowering a stat gives you a point back) */
const ptsOk=p=>p.length===4&&p.every(v=>v>=-1&&v<=2)&&p.reduce((a,b)=>a+b,0)===4;
const packP=p=>[(p[0]+1)|((p[1]+1)<<4),(p[2]+1)|((p[3]+1)<<4)],unpackP=(a,b)=>[(a&15)-1,(a>>4)-1,(b&15)-1,(b>>4)-1];
function calc(h){const c=CL[h.cl],an=AN[h.an],s={};
  STS.forEach((k,i)=>{s[k]=c.s[k]+h.pa[i]+(an.s[k]||0)+(BG[h.bg].s===k?1:0);});
  if(h.tro&1)s.wit++;if(h.tro&2)s.agi++;if(h.tro&4)s.cha++;if(h.tro&8)s.mig++;
  for(const k of STS)s[k]=Math.min(5,s[k]);
  h.s=s;const old=h.max||0;h.max=c.hp+an.hp+(h.tr==="tough"?5:0)+(h.tro&32?4:0)+(h.lv-1)*4;
  if(old&&h.max>old)h.hp+=h.max-old;h.hp=Math.min(h.hp==null?h.max:h.hp,h.max);
  h.ac=c.ac+(h.tr==="stalwart"?1:0)+(h.tro&16?1:0);h.db=h.tr==="brawler"?2:0;return h;}
/* a hero's bonus for a stat; checks also count the Silver tongue / Keen mind traits */
const mod=(h,s,check)=>h.s[s]+(h.lv>1&&s===CL[h.cl].atk?h.lv-1:0)+(check&&h.tr==="silver"&&s==="cha"?2:0)+(check&&h.tr==="keen"&&s==="wit"?2:0);
/* the action that brings a hero to the table: class, ancestry, background, trait, portrait, points, level, rewards, gold, gear */
function buildAct(b){return [1,CLS.indexOf(b.cl),ANS.indexOf(b.an),BGS.indexOf(b.bg),TRS.indexOf(b.tr),b.po,...packP(b.pa),Math.min(30,b.lv||1),(b.tro||0)&63,Math.min(255,b.gs||0),(b.up||0)&255];}
function randomBuild(lv){const cl=CLS[Math.floor(Math.random()*5)],an=ANS[Math.floor(Math.random()*3)];
  return {cl,an,bg:BGS[Math.floor(Math.random()*6)],tr:TRS[Math.floor(Math.random()*6)],po:Math.floor(Math.random()*POR[an].length),pa:CL[cl].sug.slice(),lv:lv||1};}
/* ---------------- the world ---------------- */
function cond(S,c){if(c==null||c==="")return true;if(Array.isArray(c))return c.every(x=>cond(S,x));
  if(c[0]==="!")return !cond(S,c.slice(1));const i=c.indexOf(":"),t=c.slice(0,i),v=c.slice(i+1);
  if(t==="f")return !!S.fl[v];
  if(t==="r"){const m=/^(\w+)(>=|<=|<|>)(-?\d+)$/.exec(v);if(!m)return false;const r=S.rep[m[1]]||0,n=+m[3];return m[2]===">="?r>=n:m[2]==="<="?r<=n:m[2]==="<"?r<n:r>n;}
  if(t==="an")return S.heroes.some(h=>h&&h.an===v);if(t==="bg")return S.heroes.some(h=>h&&h.bg===v);if(t==="cl")return S.heroes.some(h=>h&&h.cl===v);
  if(t==="it")return S.items.includes(v);if(t==="g")return S.gold>=+v;return false;}
/* the badge a special choice gets, so you can see why it's there */
function tagOf(c){const r=[].concat(c.req||[]);for(const x of r){const i=x.indexOf(":"),t=x.slice(0,i),v=x.slice(i+1);
    if(t==="an")return AN[v].e+" "+AN[v].n;if(t==="bg")return BG[v].e+" "+BG[v].n;if(t==="cl")return CL[v].e+" "+CL[v].n;
    if(t==="f"&&v==="gob_friends")return "👺 Goblin friends";if(t==="f"&&v==="smug_paid")return "🦜 Old deal";if(t==="f"&&v==="maren")return "🔥 Maren's gift";if(t==="f"&&v==="mer_ally")return "🧜 Merfolk friends";if(t==="f"&&v==="tobin")return "📜 Tobin's secret";}
  return "";}
const route=(S,g)=>{if(!Array.isArray(g))return g;for(const x of g){if(!Array.isArray(x))return x;if(cond(S,x[0]))return x[1];}return null;};
function setFl(S,a){for(const f of a||[])S.fl[f]=1;}
function addRep(S,o){for(const [f,v] of Object.entries(o||{})){const old=S.rep[f]||0;S.rep[f]=Math.max(-3,Math.min(3,old+v));
    if(S.rep[f]!==old){const t=`${FAC[f][1]} ${FAC[f][0]} ${v>0?"likes you more":"likes you less"}`;S.notes.push([t,v>0]);log(S,t);}}}
const node=S=>ADV[S.adv].nodes[S.node];
function choiceOk(S,c){if(c.req&&!cond(S,c.req))return false;if(c.need){if(c.need.gold&&S.gold<c.need.gold)return false;if(c.need.item&&!S.items.includes(c.need.item))return false;}return true;}
const choiceShown=(S,c)=>!c.req||cond(S,c.req);
function price(S,N,it){const r=S.rep[N.shop.fac]||0,p=ITEM[it].p;return Math.max(Math.ceil(p/2),p-2*r);}
const shopShut=(S,N)=>(S.rep[N.shop.fac]||0)<=-2;
function canBuy(S,N,it){if(!N.shop||shopShut(S,N)||!N.shop.it.includes(it)||S.gold<price(S,N,it))return false;if(it==="blade")return S.up.dmg<2;if(it==="mail")return S.up.ac<2;return true;}
/* ---------------- rules ---------------- */
const alive=S=>S.heroes.filter(h=>h&&h.hp>0);
const roll=(S,n,d)=>{let t=0;for(let i=0;i<n;i++)t+=1+Math.floor(S.R()*d);return t;};
function log(S,t){S.log.push(t);if(S.log.length>50)S.log.shift();}
function hurt(S,k,n){const h=S.heroes[k];h.hp=Math.max(0,h.hp-n);return n;}
/* computer heroes take their time, so people can read what happens: longer for long story text */
const DEF={min:1,max:4,sync:true,aiDelay(S){if(S.phase==="scene"){const N=node(S);return Math.min(8000,2200+(N.x||"").length*30);}if(S.phase==="who")return 2200;if(S.phase==="roll")return 1600;if(S.phase==="fight")return 2300;return 1300;},
  /* opts carry the remembered world and who's a computer hero: reputation (2 bytes, a nibble each, +3), flags (2), finished adventures (1), computer seats (1) */
  init(pl,seed,opts){const R=window.__rng(seed),o=opts||[],rep={},fl={};FACS.forEach((f,i)=>{const b=o[i>>1];rep[f]=b==null?0:Math.max(-3,Math.min(3,((b>>((i&1)*4))&15)-3));});
    const bits=(o[2]||0)|((o[3]||0)<<8);WF.forEach((f,i)=>{if(bits&(1<<i))fl[f]=1;});const cpu=pl.map((p,i)=>!!((o[5]||0)&(1<<i)));
    return {R,names:pl.map(p=>p.name),n:pl.length,phase:"pick",heroes:pl.map(()=>null),adv:null,node:null,lead:0,gold:10,potions:pl.length===1?4:pl.length===2?3:2,items:[],
      pend:null,res:null,fight:null,log:[],rollN:0,last:null,fights:0,inspire:pl.map(()=>0),outcome:null,fl,rep,done:o[4]||0,cpu,up:{dmg:0,ac:0},lk:pl.map(()=>0),notes:[],endN:0,ending:null};},
  turn(S){if(S.phase==="pick"){const i=S.heroes.findIndex(h=>!h);return i;}
    if(S.phase==="adv")return 0;if(S.phase==="scene"||S.phase==="who"||S.phase==="result")return S.lead;if(S.phase==="roll")return S.pend.k;
    if(S.phase==="fight")return S.fight.order[S.fight.i];return -1;},
  check(S,k,a){try{return legal(S,k,a);}catch(e){return false;}},
  apply(S,k,a){if(!legal(S,k,a))return false;act(S,k,a);return true;},
  ai(S,k){return aiMove(S,k);}};
function legal(S,k,a){const t=a[0];if(k<0||k>=S.n)return false;
  if(t===1){if(S.phase!=="pick"||S.heroes[k]||a.length<12)return false;const an=ANS[a[2]];
    return a[1]<CLS.length&&!!an&&a[3]<BGS.length&&a[4]<TRS.length&&a[5]<POR[an].length&&ptsOk(unpackP(a[6],a[7]))&&a[8]>=1&&a[8]<=30;}
  if(t===11)return S.phase==="adv"&&k===0&&a[1]<ADVS.length;
  if(t===9){if(S.potions<1)return false;const h=S.heroes[a[1]];if(!h||h.hp>=h.max)return false;   // potion: out of a fight anyone, in a fight it's your action
    if(S.phase==="fight")return S.fight.order[S.fight.i]===k;return ["scene","who","roll","result"].includes(S.phase);}
  if(t===2){if(S.phase!=="scene")return false;const N=node(S);if(k!==S.lead&&!N.shop)return false;const c=(N.c||[])[a[1]];return !!c&&choiceOk(S,c);}   // at a shop anyone may move on
  if(t===14){if(S.phase!=="scene")return false;const N=node(S);return !!N.shop&&canBuy(S,N,N.shop.it[a[1]]);}
  if(t===12)return S.phase==="who"&&k===S.lead&&S.heroes[a[1]]&&S.heroes[a[1]].hp>0;
  if(t===3)return S.phase==="roll"&&k!==S.pend.k&&S.heroes[k].hp>0&&!S.pend.help.includes(k)&&S.pend.help.length<2;
  if(t===4)return S.phase==="roll"&&k===S.pend.k;
  if(t===8){if(S.phase==="result")return true;if(S.phase!=="scene")return false;const N=node(S);return !N.c&&!N.f&&!N.end;}
  if(t===5||t===6||t===7){if(S.phase!=="fight"||S.fight.order[S.fight.i]!==k)return false;if(t===7)return true;
    const h=S.heroes[k];if(t===6&&h.ab<1)return false;const cl=h.cl;
    if(t===5||(t===6&&(cl==="fighter"||cl==="rogue"))){const e=S.fight.en[a[1]];return !!e&&e.hp>0;}
    if(t===6&&cl==="wizard")return true;if(t===6){const h2=S.heroes[a[1]];return !!h2&&(cl==="cleric"||h2.hp>0);}return false;}
  if(t===10)return S.phase==="end"&&k===0;
  return false;}
function goNode(S,id,depth){S.node=id;const N=node(S);S.pend=null;S.res=null;
  if(N.set)setFl(S,N.set);if(N.rep)addRep(S,N.rep);
  if(N.rest){for(const h of S.heroes)if(h&&h.hp>0)h.hp=Math.min(h.max,h.hp+Math.ceil(h.max*N.rest));}
  if(N.gain)gain(S,N.gain);
  if(!N.t){goNode(S,route(S,N.go),(depth||0)+1);return;}   // a crossroads: straight on to the right place
  if(N.f){startFight(S,N);return;}
  if(N.end)return finish(S,N);
  S.phase="scene";}
function finish(S,N){S.phase="end";S.outcome=N.end;S.endN++;const win=N.end==="win";let g=0;const got=[];
  if(win){g=(N.gold||0);for(const [c,v] of N.goldIf||[])if(cond(S,c))g+=v;S.gold+=g;
    const tr=(N.tr||[]).slice();for(const [c,v] of N.trIf||[])if(cond(S,c))tr.push(v);
    for(const t of tr){const b=1<<TROI[t];let any=false;for(const h of S.heroes)if(h&&!(h.tro&b)){h.tro|=b;any=true;calc(h);}got.push(t);void any;}
    S.done|=1<<ADVS.indexOf(S.adv);}
  else{S.fl[S.adv==="lantern"?"lan_lost":"bell_lost"]=1;}
  S.ending={en:N.en||N.t,gold:g,tr:got,win};
  log(S,win?`🏆 ${ADV[S.adv].n}: ${N.en||"done"}!`:"The adventure ends here…");}
function gain(S,g){if(g.gold)S.gold=Math.max(0,S.gold+g.gold);if(g.item&&!S.items.includes(g.item))S.items.push(g.item);if(g.potion)S.potions+=g.potion;}
/* the lead goes round the people at the table; computer heroes don't lead when a person can */
function nextLead(S){const people=S.cpu&&S.cpu.some(c=>!c);for(let i=1;i<=S.n;i++){const k=(S.lead+i)%S.n;if(S.heroes[k]&&S.heroes[k].hp>0&&!(people&&S.cpu[k])){S.lead=k;return;}}
  for(let i=1;i<=S.n;i++){const k=(S.lead+i)%S.n;if(S.heroes[k]&&S.heroes[k].hp>0){S.lead=k;return;}}}
function act(S,k,a){const t=a[0],nm=S.names[k];if(t!==14&&t!==3&&t!==9)S.notes=[];
  if(t===1){const an=ANS[a[2]],up=a[11]||0;const h={cl:CLS[a[1]],an,bg:BGS[a[3]],tr:TRS[a[4]],po:a[5],pa:unpackP(a[6],a[7]),lv:a[8],tro:a[9]&63,hp:null,ab:2,def:0};calc(h);h.hp=h.max;S.heroes[k]=h;
    S.gold+=(a[10]||0)*5+(h.bg==="noble"?15:0);S.up.dmg=Math.max(S.up.dmg,Math.min(2,up&15));S.up.ac=Math.max(S.up.ac,Math.min(2,up>>4));
    log(S,`${nm} is a ${AN[an].n.toLowerCase()} ${CL[h.cl].n.toLowerCase()}${h.lv>1?` (level ${h.lv})`:""}`);if(S.heroes.every(Boolean))S.phase="adv";return;}
  if(t===11){S.adv=ADVS[a[1]];S.lk=S.heroes.map(()=>0);log(S,`📖 ${ADV[S.adv].n}`);goNode(S,ADV[S.adv].start);return;}
  if(t===9){const h=S.heroes[a[1]];S.potions--;const v=roll(S,2,4)+2;h.hp=Math.min(h.max,h.hp+v);log(S,`🧪 ${S.names[a[1]]} drinks a potion: +${v} HP`);if(S.phase==="fight")fightNext(S);return;}
  if(t===14){const N=node(S),it=N.shop.it[a[1]],p=price(S,N,it);S.gold-=p;
    if(it==="potion")S.potions++;if(it==="meal")for(const h of S.heroes)if(h&&h.hp>0)h.hp=Math.min(h.max,h.hp+6);if(it==="blade")S.up.dmg++;if(it==="mail")S.up.ac++;
    log(S,`🛒 ${nm} buys ${ITEM[it].n.toLowerCase()} for ${p} gold`);S.buyN=(S.buyN||0)+1;return;}
  if(t===2){const c=node(S).c[a[1]];if(c.set)setFl(S,c.set);if(c.rep)addRep(S,c.rep);if(c.take)S.items=S.items.filter(x=>x!==c.take);
    if(!c.s){if(c.gain)gain(S,c.gain);log(S,`${nm}: ${c.l}`);
      if(c.tx){S.res={txt:c.tx,ok:true,next:c.go};S.phase="result";nextLead(S);return;}
      nextLead(S);goNode(S,c.go);return;}
    log(S,`${nm}: ${c.l}`);S.pend={c:a[1],k:-1,help:[]};S.phase="who";return;}
  if(t===12){S.pend.k=a[1];S.phase="roll";return;}
  if(t===3){S.pend.help.push(k);log(S,`🤝 ${nm} helps (+2)`);return;}
  if(t===4){const c=node(S).c[S.pend.c],h=S.heroes[k],b=mod(h,c.s,true)+S.pend.help.length*2+(S.inspire[k]||0);S.inspire[k]=0;
    let d=1+Math.floor(S.R()*20),lucky=0;const pass=x=>x===20||(x!==1&&x+b>=c.dc);
    if(!pass(d)&&h.tr==="lucky"&&!S.lk[k]){S.lk[k]=1;lucky=d;d=1+Math.floor(S.R()*20);log(S,`🍀 ${nm} is lucky and rolls again`);}
    const tot=d+b,ok=pass(d);S.rollN++;S.last={n:S.rollN,k,d,b,tot,dc:c.dc,ok,st:c.s,lucky};
    log(S,`🎲 ${nm} rolls ${d} ${b>=0?"+":"−"} ${Math.abs(b)} = ${tot} vs ${c.dc}: ${ok?"success":"fail"}${d===20?" (critical!)":d===1?" (fumble!)":""}`);
    let txt=ok?c.okx:c.nox;
    if(ok&&c.gain)gain(S,c.gain);if(ok)setFl(S,c.oks);else setFl(S,c.nos);addRep(S,ok?c.okr:c.nor);
    if(!ok&&c.hurt){const [who,[n,dd]]=c.hurt;if(who==="all"){const v=roll(S,n,dd);for(let i=0;i<S.n;i++)if(S.heroes[i]&&S.heroes[i].hp>0)hurt(S,i,v);txt+=` Everyone loses ${v} HP.`;}
      else{const v=roll(S,n,dd);hurt(S,k,v);txt+=` ${nm} loses ${v} HP.`;}}
    S.res={txt,ok,next:ok?c.ok:c.no};S.phase="result";
    if(!alive(S).length){S.res.next=Object.keys(ADV[S.adv].nodes).find(x=>ADV[S.adv].nodes[x].end==="lose");}
    return;}
  if(t===8){if(S.phase==="result"){const nx=route(S,S.res.next);nextLead(S);goNode(S,nx);}else{nextLead(S);goNode(S,route(S,node(S).go));}return;}
  if(t===10){for(const h of S.heroes)if(h){h.hp=h.max;h.ab=2;h.def=0;}
    const keep={};for(const f of WF)if(S.fl[f])keep[f]=1;S.fl=keep;
    S.items=[];S.potions=Math.max(S.potions,2);S.phase="adv";S.adv=null;S.node=null;S.outcome=null;S.fight=null;S.ending=null;S.notes=[];log(S,"A new adventure…");return;}
  if(t===5||t===6||t===7)fightAct(S,k,a);}
/* ---------------- fights ---------------- */
// fights scale with the party: fewer and weaker enemies for one or two heroes
function startFight(S,N){const ms=N.f.m.slice(0,S.n===1?2:S.n===2?3:9),mult=[0.42,0.75,1.25,1.6][S.n-1]||1,lvl=Math.max(0,Math.round((S.heroes.reduce((a,h)=>a+(h?h.lv:1),0)/S.n-1)*1.5));
  const en=ms.map((m,i)=>{const M=MON[m],hp=Math.max(4,Math.round((M[2]+lvl*3)*mult));
    return {m,n:M[0]+(ms.filter(x=>x===m).length>1?" "+"ABCD"[ms.slice(0,i).filter(x=>x===m).length]:""),e:M[1],hp,max:hp,ac:M[3]-(S.n===1?1:0),atk:M[4]+Math.floor(lvl/2)-(S.n===1?1:0),dmg:M[5]};});
  const helps=[];let weak=N.f.weak||0;for(const [c,v,txt] of N.f.weakIf||[])if(cond(S,c)){weak+=v;helps.push(txt);}
  if(weak)en[0].hp=en[0].max=Math.max(8,en[0].max-weak);
  for(const h of S.heroes)if(h)h.def=0;
  S.fight={en,order:S.heroes.map((h,i)=>i).filter(i=>S.heroes[i]),i:0,round:1,ev:[],evn:0,win:N.f.win,lose:N.f.lose,gold:N.gold||0,helps};S.phase="fight";
  log(S,`⚔ ${en.map(e=>e.n).join(", ")}!`);for(const t of helps)log(S,t);skipDown(S);}
function fev(S,o){const F=S.fight;F.evn++;o.n=F.evn;F.ev.push(o);if(F.ev.length>12)F.ev.shift();}
function skipDown(S){const F=S.fight;let g=0;while(g++<10&&F.i<F.order.length&&S.heroes[F.order[F.i]].hp<=0)F.i++;if(F.i>=F.order.length)enemiesAct(S);}
function fightNext(S){const F=S.fight;if(!F)return;if(F.en.every(e=>e.hp<=0))return fightWon(S);F.i++;skipDown(S);}
function fightAct(S,k,a){const F=S.fight,h=S.heroes[k],c=CL[h.cl],nm=S.names[k],t=a[0];h.def=0;
  const hit=(e,always,extra,dbl)=>{const d=1+Math.floor(S.R()*20),tot=d+mod(h,c.atk)+1+(S.inspire[k]||0);S.inspire[k]=0;const ok=always||d===20||(d!==1&&tot>=e.ac);
    if(!ok){log(S,`${nm} attacks ${e.n}: ${d} = ${tot} vs AC ${e.ac}, miss`);fev(S,{k:"miss",t:F.en.indexOf(e),who:k});return;}
    let dmg=roll(S,1,c.die)+Math.max(0,mod(h,c.atk))+(extra||0)+h.db+S.up.dmg;if(d===20||dbl)dmg*=2;e.hp=Math.max(0,e.hp-dmg);
    log(S,`${nm} hits ${e.n} for ${dmg}${d===20?" (critical!)":""}${e.hp<=0?`: ${e.n} falls`:""}`);fev(S,{k:"hit",t:F.en.indexOf(e),v:dmg,who:k,kill:e.hp<=0});};
  if(t===7){h.def=4;log(S,`🛡 ${nm} defends (+4 armour this round)`);fev(S,{k:"def",who:k});}
  else if(t===5)hit(F.en[a[1]]);
  else{h.ab--;const cl=h.cl;
    if(cl==="fighter")hit(F.en[a[1]],false,6);else if(cl==="rogue")hit(F.en[a[1]],true,0,true);
    else if(cl==="wizard"){const v=roll(S,2,6)+mod(h,"wit");for(const e of F.en)if(e.hp>0){e.hp=Math.max(0,e.hp-v);}log(S,`🔥 ${nm} casts Fireball: ${v} to every enemy`);fev(S,{k:"fire",v,who:k});}
    else if(cl==="cleric"){const h2=S.heroes[a[1]],v=roll(S,2,6)+3;h2.hp=Math.min(h2.max,h2.hp+v);log(S,`✨ ${nm} heals ${S.names[a[1]]} for ${v}`);fev(S,{k:"heal",to:a[1],v});}
    else if(cl==="bard"){const h2=S.heroes[a[1]],v=roll(S,1,6);h2.hp=Math.min(h2.max,h2.hp+v);S.inspire[a[1]]=4;log(S,`🎻 ${nm} inspires ${S.names[a[1]]}: +${v} HP and +4 on the next roll`);fev(S,{k:"heal",to:a[1],v});}}
  fightNext(S);}
function enemiesAct(S){const F=S.fight;
  for(const e of F.en){if(e.hp<=0)continue;const targets=S.heroes.map((h,i)=>i).filter(i=>S.heroes[i]&&S.heroes[i].hp>0);if(!targets.length)break;
    const ti=targets[Math.floor(S.R()*targets.length)],h=S.heroes[ti],ac=h.ac+S.up.ac+h.def,d=1+Math.floor(S.R()*20),tot=d+e.atk;
    if(d===20||(d!==1&&tot>=ac)){let v=Math.max(1,roll(S,e.dmg[0],e.dmg[1])+Math.floor(e.atk/2)-(S.n===1?2:S.n===2?1:0));if(d===20)v*=2;hurt(S,ti,v);log(S,`${e.e} ${e.n} hits ${S.names[ti]} for ${v}${h.hp<=0?`: ${S.names[ti]} is down!`:""}`);fev(S,{k:"ehit",from:F.en.indexOf(e),to:ti,v,down:h.hp<=0});}
    else{log(S,`${e.e} ${e.n} attacks ${S.names[ti]} and misses`);fev(S,{k:"emiss",from:F.en.indexOf(e),to:ti});}}
  if(!alive(S).length){fightLost(S);return;}
  for(const h of S.heroes)if(h)h.def=0;F.round++;F.i=0;skipDown(S);}
function fightWon(S){const F=S.fight;S.fights++;let lvUp=false;
  for(const h of S.heroes){if(!h)continue;if(h.hp<=0)h.hp=1;}
  if(S.fights%2===0){for(const h of S.heroes)if(h){h.lv++;calc(h);h.hp=Math.min(h.max,h.hp+4);h.ab=Math.min(3,h.ab+1);}lvUp=true;}
  const g=F.gold+5*F.en.length;S.gold+=g;if(S.R()<0.35)S.potions++;
  log(S,`🏆 Victory! +${g} gold${lvUp?` · ⭐ everyone goes up a level`:""}`);
  const win=F.win;S.fight=null;S.lastWin={g,lvUp,n:S.rollN+1000+S.fights};goNode(S,win);}
function fightLost(S){const F=S.fight;S.fight=null;for(const h of S.heroes)if(h)h.hp=Math.max(1,Math.ceil(h.max/3));goNode(S,F.lose);}
/* ---------------- the computer heroes ---------------- */
function best(S,c){let bk=-1,bv=-99;for(let i=0;i<S.n;i++){const h=S.heroes[i];if(!h||h.hp<=0)continue;const v=mod(h,c.s,true);if(v>bv){bv=v;bk=i;}}return bk;}
function aiMove(S,k){const a=aiPick(S,k);if(a&&legal(S,k,a))return a;   /* never get stuck on a move that isn't allowed */
  if(S.phase==="fight"){const F=S.fight,i=F.en.findIndex(e=>e.hp>0);return i>=0?[5,i]:[7];}return null;}
function aiPick(S,k){
  if(S.phase==="pick"){const lv=Math.max(1,...S.heroes.filter(Boolean).map(h=>h.lv));const b=randomBuild(lv);
    const taken=S.heroes.filter(Boolean).map(h=>h.cl),free=CLS.filter(c=>!taken.includes(c));if(free.length){b.cl=free[Math.floor(Math.random()*free.length)];b.pa=CL[b.cl].sug.slice();}
    return buildAct(b);}
  if(S.phase==="adv")return [11,0];
  if(S.phase==="scene"){const N=node(S);if(!N.c||N.shop)return null;   /* shops: people decide when to move on */
    let bi=-1,bs=-99;N.c.forEach((c,i)=>{if(!choiceOk(S,c))return;const sc=c.req?20:c.s?mod(S.heroes[best(S,c)],c.s,true)-c.dc+12:(c.need?9:8);if(sc>bs){bs=sc;bi=i;}});return bi>=0?[2,bi]:null;}
  if(S.phase==="who")return [12,best(S,node(S).c[S.pend.c])];
  if(S.phase==="roll")return [4];if(S.phase==="result")return null;   /* people press Continue themselves, after reading */
  if(S.phase==="fight"){const F=S.fight,h=S.heroes[k],en=F.en.map((e,i)=>[e,i]).filter(x=>x[0].hp>0).sort((a,b)=>a[0].hp-b[0].hp),weak=S.heroes.map((x,i)=>[x,i]).filter(x=>x[0]).sort((a,b)=>a[0].hp/a[0].max-b[0].hp/b[0].max)[0];
    if(h.ab>0&&h.cl==="cleric"&&weak&&weak[0].hp/weak[0].max<0.45)return [6,weak[1]];
    if(h.ab>0&&h.cl==="wizard"&&en.length>=2)return [6,0];
    if(h.ab>0&&(h.cl==="fighter"||h.cl==="rogue")&&en.length&&en[en.length-1][0].hp>8)return [6,en[en.length-1][1]];
    if(h.ab>0&&h.cl==="bard"&&weak&&weak[0].hp>0&&weak[0].hp/weak[0].max<0.5)return [6,weak[1]];
    if(h.hp/h.max<0.3&&S.potions>0)return [9,k];
    return en.length?[5,en[0][1]]:[7];}
  return null;}
/* ---------------- saving: your hero and the world, on this phone ---------------- */
function store(k,v){try{if(v===undefined){const s=localStorage.getItem(k);return s?JSON.parse(s):null;}localStorage.setItem(k,JSON.stringify(v));}catch(e){return null;}return v;}
function saveHero(S,me){const h=S.heroes[me];if(!h)return;store("pt-rq-hero",{cl:h.cl,an:h.an,bg:h.bg,tr:h.tr,po:h.po,pa:h.pa,lv:h.lv,tro:h.tro,gs:Math.min(255,Math.floor(S.gold/S.n/5)),up:S.up.dmg|(S.up.ac<<4)});}
function saveWorld(S){let bits=0;WF.forEach((f,i)=>{if(S.fl[f])bits|=1<<i;});store("pt-rq-world",{rep:S.rep,bits,done:S.done});}
/* the start options: the world as this phone remembers it */
function worldOpts(R){const w=store("pt-rq-world")||{},r=w.rep||{},n=f=>Math.max(0,Math.min(6,(r[f]||0)+3));let cpu=0;if(R&&R.players)R.players.forEach((p,i)=>{if(p&&p.ai)cpu|=1<<i;});
  return [n("brin")|(n("salt")<<4),n("gob")|(n("mer")<<4),(w.bits||0)&255,((w.bits||0)>>8)&255,(w.done||0)&255,cpu];}
/* ---------------- the screen ---------------- */
const CSS=`.rq{display:flex;flex-direction:column;gap:9px}
.rq-party{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px}
.rq-h{flex:1 0 92px;min-width:92px;border:0;text-align:left;border-radius:14px;padding:6px 8px 6px 6px;background:var(--chip);color:var(--ink);position:relative;font:600 12px system-ui;display:flex;gap:6px;align-items:center}
.rq-h .av{flex:none;width:38px;height:38px;border-radius:50%;object-fit:cover;object-position:50% 8%;background:#3a3156;box-shadow:0 0 0 2px rgba(255,255,255,.6)}
.rq-h .in{min-width:0;flex:1}.rq-h b{display:block;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rq-h.lead{box-shadow:inset 0 0 0 2px var(--tc)}.rq-h.now{box-shadow:inset 0 0 0 2px #f2b233,0 0 12px rgba(242,178,51,.5)}.rq-h.down{opacity:.5;filter:grayscale(.8)}
.rq-h .crown{position:absolute;top:-6px;left:4px;font-size:14px}
.rq-bar{height:6px;border-radius:3px;background:rgba(0,0,0,.15);overflow:hidden;margin-top:3px}.rq-bar i{display:block;height:100%;background:#3fb56b;transition:width .4s}
.rq-bar i.lo{background:#e0533c}.rq-h small{opacity:.8;display:block;white-space:nowrap}
.rq-scene{border-radius:20px;background:#171428;color:#f3eee2;box-shadow:0 6px 20px rgba(0,0,0,.25);position:relative;overflow:hidden}
.rq-art{position:relative;aspect-ratio:16/9;max-height:42vh;overflow:hidden;background:#241d3a}
.rq-art .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;animation:rqkb 26s ease-in-out infinite alternate;transform-origin:60% 40%}
@keyframes rqkb{from{transform:scale(1.02)}to{transform:scale(1.12) translate(-1.5%,-1%)}}
.rq-art:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(23,20,40,0) 45%,rgba(23,20,40,.65) 75%,#171428)}
.rq-art h3{position:absolute;left:14px;right:38%;bottom:6px;z-index:2;margin:0;font:800 21px/1.15 Georgia,serif;color:#ffd98a;text-shadow:0 2px 8px rgba(0,0,0,.8)}
.rq-who{position:absolute;right:4px;bottom:0;top:0;padding-top:30px;box-sizing:border-box;z-index:1;display:flex;flex-direction:column;align-items:flex-end;justify-content:flex-end;pointer-events:none}
.rq-who img{height:100%;max-height:100%;max-width:46vw;object-fit:contain;object-position:bottom right;filter:drop-shadow(0 4px 10px rgba(0,0,0,.6))}
.rq-who span{position:absolute;top:8px;right:6px;z-index:3;font:700 11px system-ui;color:#fff;background:rgba(0,0,0,.55);padding:2px 8px;border-radius:999px;white-space:nowrap}
.rq-in .rq-art .bg{animation:rqfade .9s ease-out,rqkb 26s ease-in-out .9s infinite alternate}@keyframes rqfade{from{opacity:0;transform:scale(1.08)}}
.rq-in .rq-who{animation:rqwho .7s .25s ease-out backwards}@keyframes rqwho{from{opacity:0;transform:translateX(30px)}}
.rq-txt{padding:4px 14px 14px}.rq-txt p{margin:8px 0;font:400 15.5px/1.55 Georgia,serif}.rq-txt p.xf{color:#e9d8ff;font-style:italic}
.rq-txt p.res{padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.08)}.rq-txt p.ok{box-shadow:inset 3px 0 0 #3fb56b}.rq-txt p.no{box-shadow:inset 3px 0 0 #e0533c}
.rq-notes{display:flex;gap:6px;flex-wrap:wrap;margin-top:4px}.rq-notes span{font:700 12px system-ui;padding:4px 10px;border-radius:999px;background:rgba(63,181,107,.22);color:#b9f5cd;animation:rqin .6s ease-out backwards .3s}
.rq-notes span.bad{background:rgba(224,83,60,.22);color:#ffc4b8}
.rq-in .rq-txt{animation:rqin .6s ease-out}@keyframes rqin{from{opacity:0;transform:translateY(8px)}}
.rq-ch{display:flex;flex-direction:column;gap:8px}
.rq-c{border:0;border-radius:14px;padding:12px 14px;text-align:left;background:var(--card);color:var(--ink);box-shadow:0 2px 8px rgba(0,0,0,.12),inset 0 0 0 1px var(--line);font:600 15px system-ui;display:flex;gap:10px;align-items:center}
.rq-c small{display:block;font-weight:500;font-size:12.5px;color:var(--muted);margin-top:2px}.rq-c .tag{flex:none;font-size:22px}
.rq-c .bdg{display:inline-block;font:800 11px system-ui;color:#fff;background:linear-gradient(135deg,#8a5cf0,#c4497d);padding:2px 8px;border-radius:999px;margin-bottom:3px}
.rq-c.sp{box-shadow:0 2px 10px rgba(138,92,240,.25),inset 0 0 0 2px #8a5cf0}
.rq-c:disabled{opacity:.5}.rq-c.mine{box-shadow:0 2px 8px rgba(0,0,0,.12),inset 0 0 0 2px var(--tc)}.rq-c.sp.mine{box-shadow:0 2px 10px rgba(138,92,240,.3),inset 0 0 0 2px #8a5cf0}
.rq-note{font:600 13px system-ui;color:var(--muted);text-align:center}
.rq-big{border:0;border-radius:18px;padding:16px;font:800 18px system-ui;background:var(--tc);color:#fff;box-shadow:0 4px 14px rgba(0,0,0,.2)}
.rq-big.alt{background:var(--chip);color:var(--ink)}.rq-big:disabled{opacity:.45}
.rq-fight{position:relative;border-radius:20px;overflow:hidden;color:#fff;padding:10px 10px 12px;background:#120f1f}
.rq-fight .fbg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(.42) saturate(.9)}
.rq-fight>*:not(.fbg){position:relative}.rq-fight h3{margin:2px 0 8px;text-align:center;font:800 18px Georgia,serif;color:#ffd98a}
.rq-en{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.rq-e{border:0;background:rgba(10,8,20,.55);color:#fff;border-radius:14px;padding:4px 6px 6px;width:100px;position:relative;font:700 12px system-ui;backdrop-filter:blur(2px)}
.rq-e img{display:block;height:86px;width:100%;object-fit:contain;object-position:bottom;filter:drop-shadow(0 4px 6px rgba(0,0,0,.6))}
.rq-e.tgt{box-shadow:0 0 0 2px #f2b233;animation:rqp 1s infinite}@keyframes rqp{50%{box-shadow:0 0 0 2px transparent}}
.rq-e.dead{opacity:.25;filter:grayscale(1)}.rq-e .rq-bar i{background:#e0533c}
.rq-helps{font:600 12.5px system-ui;color:#d6f5dd;text-align:center;margin-top:6px}
.rq-acts{display:grid;grid-template-columns:1fr 1fr;gap:8px}.rq-acts button{border:0;border-radius:14px;padding:12px 8px;font:700 14px system-ui;background:var(--card);color:var(--ink);box-shadow:inset 0 0 0 1px var(--line)}
.rq-acts button.on{background:var(--tc);color:#fff}.rq-acts button small{display:block;font-weight:500;font-size:11.5px;opacity:.8}
.rq-log{font:500 13px/1.45 system-ui;color:var(--muted);background:var(--chip);border-radius:12px;padding:8px 10px}.rq-log b{color:var(--ink);font-size:14.5px;font-weight:700}.rq-log span{opacity:.75}.rq-new{display:inline-block;animation:rqin .5s ease-out}
.rq-inv{display:flex;gap:8px;justify-content:center;font:700 14px system-ui;flex-wrap:wrap;align-items:center}.rq-inv button,.rq-inv span{border:0;background:var(--chip);color:var(--ink);border-radius:12px;padding:6px 10px;font:inherit}
.rq-shop{display:grid;grid-template-columns:1fr 1fr;gap:8px}.rq-shop button{border:0;border-radius:14px;padding:10px;text-align:left;background:var(--card);color:var(--ink);box-shadow:inset 0 0 0 1px var(--line);font:700 14px system-ui}
.rq-shop button small{display:block;font:500 11.5px/1.35 system-ui;color:var(--muted);margin-top:2px}.rq-shop button .pr{float:right;color:#b8860b}.rq-shop button:disabled{opacity:.45}
.rq-sec{font:800 13px system-ui;color:var(--muted);margin:4px 2px -2px}
/* building a hero */
.rq-bh{display:flex;gap:10px;align-items:center;background:linear-gradient(135deg,#2a2346,#171428);color:#f3eee2;border-radius:18px;padding:8px 12px 8px 8px}
.rq-bh img{width:64px;height:64px;border-radius:14px;object-fit:cover;object-position:50% 8%;background:#3a3156}.rq-bh b{font:800 16px Georgia,serif;color:#ffd98a;display:block}.rq-bh small{font:500 12px system-ui;opacity:.85}
.rq-steps{display:flex;gap:4px}.rq-steps i{flex:1;height:4px;border-radius:2px;background:var(--line)}.rq-steps i.on{background:var(--tc)}
.rq-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.rq-grid.g3{grid-template-columns:1fr 1fr 1fr}
.rq-opt{border:0;border-radius:16px;padding:10px;text-align:left;background:var(--card);color:var(--ink);box-shadow:inset 0 0 0 1px var(--line);font:500 12px/1.35 system-ui;position:relative}
.rq-opt b{display:block;font-size:14.5px}.rq-opt .e{font-size:22px}.rq-opt.on{box-shadow:inset 0 0 0 3px var(--tc),0 4px 12px rgba(0,0,0,.15)}
.rq-opt img.cp{display:block;width:100%;height:96px;object-fit:contain;object-position:bottom;margin-bottom:4px}
.rq-por{border:0;padding:0;border-radius:14px;background:linear-gradient(180deg,#3a3156,#1d1830);aspect-ratio:3/4;overflow:hidden;box-shadow:inset 0 0 0 1px var(--line)}
.rq-por img{width:100%;height:100%;object-fit:contain;object-position:bottom}.rq-por.on{box-shadow:0 0 0 3px var(--tc),0 4px 12px rgba(0,0,0,.25)}
.rq-st{display:flex;align-items:center;gap:8px;background:var(--card);border-radius:14px;padding:8px 10px;box-shadow:inset 0 0 0 1px var(--line)}
.rq-st .nm{flex:1;font:700 14px system-ui}.rq-st .nm small{display:block;font:500 11.5px system-ui;color:var(--muted)}
.rq-st .v{font:900 22px system-ui;width:42px;text-align:center}.rq-st button{width:38px;height:38px;border:0;border-radius:12px;background:var(--chip);color:var(--ink);font:800 20px system-ui}
.rq-st button:disabled{opacity:.35}
.rq-row{display:flex;gap:8px}.rq-row>*{flex:1}
/* sheets */
.rq-sheetimg{float:right;width:38%;max-height:220px;object-fit:contain;object-position:bottom;margin:0 0 6px 8px}
.rq-tro{display:flex;flex-wrap:wrap;gap:6px}.rq-tro span{font:600 12.5px system-ui;padding:5px 10px;border-radius:999px;background:var(--chip)}
.rq-rep{display:flex;align-items:center;gap:8px;margin:6px 0}.rq-rep .f{width:150px;font:700 13px system-ui}.rq-rep .b{flex:1;height:8px;border-radius:4px;background:var(--chip);position:relative}
.rq-rep .b i{position:absolute;top:0;bottom:0;border-radius:4px}.rq-rep .w{width:66px;font:600 12px system-ui;color:var(--muted);text-align:right}
.rq-end{text-align:center}.rq-end .en{font:800 13px system-ui;color:#c9b6ff;margin-top:2px}.rq-end .rw{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:8px 0 4px}
.rq-end .rw span{font:700 13px system-ui;padding:6px 12px;border-radius:999px;background:rgba(255,217,138,.15);color:#ffe7ae;animation:rqin .6s ease-out backwards}
.rq-advs{display:flex;flex-direction:column;gap:10px}.rq-adv{border:0;padding:0;border-radius:18px;overflow:hidden;background:#171428;color:#f3eee2;text-align:left;position:relative;box-shadow:0 6px 18px rgba(0,0,0,.2)}
.rq-adv img{display:block;width:100%;aspect-ratio:21/9;object-fit:cover}.rq-adv div{padding:8px 12px 12px;font:400 14px/1.45 Georgia,serif}.rq-adv b{display:block;font:800 18px Georgia,serif;color:#ffd98a}
.rq-adv .dn{position:absolute;top:8px;right:8px;font:800 12px system-ui;background:rgba(63,181,107,.9);color:#fff;padding:3px 10px;border-radius:999px}
@media (prefers-reduced-motion: reduce){.rq-art .bg,.rq-in .rq-art .bg{animation:none}}
.rq-dice{position:fixed;inset:0;z-index:300;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 40%,rgba(48,34,96,.78),rgba(6,4,16,.9));backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);-webkit-tap-highlight-color:transparent}
.rq-stage{position:relative;width:190px;height:210px;display:flex;align-items:center;justify-content:center}
.rq-dw{position:relative;width:170px;height:170px;will-change:transform}.rq-dt{width:100%;height:100%;will-change:transform}
.rq-die{width:100%;height:100%;overflow:visible;filter:drop-shadow(0 10px 18px rgba(0,0,0,.45));transition:filter .4s}
.rq-die .fc{stroke:rgba(255,255,255,.28);stroke-width:1.3;stroke-linejoin:round}.rq-die stop{transition:stop-color .45s}
.rq-die .n{font:900 40px system-ui;fill:#fff;text-anchor:middle;dominant-baseline:central;paint-order:stroke;stroke:rgba(0,0,0,.35);stroke-width:3px}
.rq-die .sn{font:800 15px system-ui;fill:rgba(255,255,255,.55);text-anchor:middle;dominant-baseline:central}
.rq-die .ck{fill:none;stroke:#1a0503;stroke-width:3;stroke-linecap:round;stroke-dasharray:160;stroke-dashoffset:160;opacity:0}
.rq-dice.ok .rq-die{filter:drop-shadow(0 0 22px rgba(80,230,140,.65)) drop-shadow(0 10px 18px rgba(0,0,0,.4))}
.rq-dice.no .rq-die{filter:drop-shadow(0 0 18px rgba(255,90,60,.5)) drop-shadow(0 10px 18px rgba(0,0,0,.4))}
.rq-dice.crit .rq-die{filter:drop-shadow(0 0 30px rgba(255,210,90,.9)) drop-shadow(0 10px 18px rgba(0,0,0,.4))}
.rq-shadow{position:absolute;left:50%;bottom:4px;width:120px;height:18px;margin-left:-60px;border-radius:50%;background:radial-gradient(rgba(0,0,0,.55),transparent 70%)}
.rq-ring{position:absolute;left:50%;top:50%;width:150px;height:150px;margin:-75px 0 0 -75px;border-radius:50%;border:3px solid var(--rc,#fff);opacity:0;pointer-events:none}
.rq-spark{position:absolute;left:50%;top:50%;font-size:18px;color:#ffe38a;pointer-events:none;text-shadow:0 0 8px #ffb300}
.rq-dice .cap{margin-top:6px;font:900 28px system-ui;color:#fff;letter-spacing:.5px;text-shadow:0 2px 12px rgba(0,0,0,.7);opacity:0}
.rq-dice.ok .cap{color:#8ff0b0}.rq-dice.no .cap{color:#ffab96}.rq-dice.crit .cap{color:#ffe38a}
.rq-dice .sub{margin-top:6px;display:flex;gap:6px;align-items:center;opacity:0}
.rq-dice .sub span{font:800 14px system-ui;color:#fff;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);padding:4px 10px;border-radius:999px}
.rq-dice .who{font:700 13px system-ui;color:rgba(255,255,255,.75);margin-bottom:4px}.rq-dice .tap{position:absolute;bottom:28px;font:600 12px system-ui;color:rgba(255,255,255,.45)}
.rq-float{position:fixed;z-index:290;pointer-events:none;font:900 24px system-ui;color:#fff;-webkit-text-stroke:1.2px #000;transform:translate(-50%,-50%)}
.rq-shake{animation:rqsh .4s}@keyframes rqsh{20%{transform:translateX(-6px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}}
.rq-ov{position:fixed;inset:0;z-index:300;background:rgba(10,8,20,.7);display:flex;align-items:flex-end;justify-content:center;padding:10px 10px calc(10px + env(safe-area-inset-bottom))}
.rq-sheet{width:100%;max-width:520px;max-height:86vh;overflow:auto;background:var(--card);color:var(--ink);border-radius:20px;padding:14px}.rq-sheet h3{margin:4px 0 8px;font:900 19px system-ui}.rq-sheet p,.rq-sheet li{font-size:14px;line-height:1.45}`;
const DCW=dc=>dc<=10?"easy":dc<=12?"medium":dc<=14?"hard":"very hard";
const HELP=`<h3>How to play Questbook</h3><p>The phone is your game master: it tells the story, you decide what your heroes do. Work together to reach the end.</p>
  <ul><li><b>Your hero:</b> pick a class, a people (human, elf or dwarf), a look, a background and a trait, then spend 4 points on your stats. Lower a stat to get a point back.</li>
  <li><b>Choices:</b> one hero leads each scene (👑, it goes round) and picks what the party does. Purple choices are special: your party can only take them because of who you are or what you did before.</li>
  <li><b>Checks:</b> the leader picks who tries. That hero rolls a <b>d20</b> and adds their skill (💪 Might, 🤸 Agility, 🧠 Wits, 💬 Charm). Reach the number (DC) and it works. A 20 always works, a 1 always fails.</li>
  <li><b>Help:</b> while someone is about to roll, others can tap <b>Help</b>: +2 each (two helpers at most).</li>
  <li><b>Fights:</b> take turns: Attack, use your class Ability, Defend (+4 armour this round) or drink a Potion. Then the enemies strike back. A hero at 0 HP is down until the fight is won.</li>
  <li><b>The world remembers:</b> the people you help or cross remember it, also in the next adventure and the next game. Prices, help and endings change with it. Tap 🗺️ to see where you stand.</li>
  <li><b>Endings:</b> every adventure ends in more than one way. Good endings give rewards every hero keeps.</li>
  <li><b>Your hero is saved</b> on this phone with their level and rewards. Next time, carry on with them.</li>
  <li><b>Shops:</b> spend the party's gold on potions, meals and gear. Anyone can buy.</li></ul>
  <p style="font-size:12px;color:var(--muted)">Paintings and portraits: the artists of Battle for Wesnoth (wesnoth.org), GNU GPL v2 or later. Stories: original.</p>`;
function ov(html,wire){const o=document.createElement("div");o.className="rq-ov";o.innerHTML=`<div class="rq-sheet">${html}<div class="gm-row2" style="margin-top:10px"><button class="tl-act ghost" data-x>Close</button></div></div>`;
  (document.querySelector(".gx")||document.body).appendChild(o);const close=()=>o.remove();o.onclick=e=>{if(e.target===o)close();};o.querySelector("[data-x]").onclick=close;if(wire)wire(o,close);}
const D20=(()=>{const P=(a,r)=>[100+r*Math.cos(a*Math.PI/180),100+r*Math.sin(a*Math.PI/180)],V=[-90,-30,30,90,150,210].map(a=>P(a,94)),C=[-90,30,150].map(a=>P(a,54));
  /* the visible faces of an icosahedron seen point-up: centre face, three edge faces, six rim faces, each with its own light */
  const F=[[C[0],C[1],V[1],.16],[C[1],C[2],V[3],-.3],[C[2],C[0],V[5],.05],[V[0],V[1],C[0],.3],[V[1],V[2],C[1],-.05],[V[2],V[3],C[1],-.22],[V[3],V[4],C[2],-.38],[V[4],V[5],C[2],-.18],[V[5],V[0],C[0],.22],[C[0],C[1],C[2],.1]];
  const pts=a=>a.slice(0,3).map(p=>p.map(v=>v.toFixed(1)).join(",")).join(" "),cen=f=>[(f[0][0]+f[1][0]+f[2][0])/3,(f[0][1]+f[1][1]+f[2][1])/3];
  const side=[[F[0],60],[F[1],180],[F[2],-60]].map(([f,r])=>{const c=cen(f);return `<text class="sn" x="${c[0].toFixed(1)}" y="${c[1].toFixed(1)}" transform="rotate(${r} ${c[0].toFixed(1)} ${c[1].toFixed(1)})">8</text>`;}).join("");
  return `<svg class="rq-die" viewBox="0 0 200 200"><defs><linearGradient id="rqDg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--d1)"/><stop offset="1" style="stop-color:var(--d2)"/></linearGradient>
    <radialGradient id="rqDs" cx=".32" cy=".22" r=".55"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
    <polygon points="${V.map(p=>p.map(v=>v.toFixed(1)).join(",")).join(" ")}" fill="url(#rqDg)"/>
    ${F.map(f=>`<polygon class="fc" points="${pts(f)}" fill="${f[3]>0?"#fff":"#000"}" fill-opacity="${Math.abs(f[3])}"/>`).join("")}
    <polygon points="${V.map(p=>p.map(v=>v.toFixed(1)).join(",")).join(" ")}" fill="url(#rqDs)" style="mix-blend-mode:screen"/>
    <polygon points="${V.map(p=>p.map(v=>v.toFixed(1)).join(",")).join(" ")}" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="2" stroke-linejoin="round"/>
    ${side}<text class="n" x="100" y="108">20</text><polyline class="ck" points="62,40 84,78 72,96 104,126 96,150 122,176"/></svg>`;})();
const DCOL={roll:["#8b74ff","#2a1b78"],ok:["#58e08b","#0f6a35"],no:["#ff7d62","#7d160b"],crit:["#ffe9a0","#b87a0a"],fum:["#5a1c16","#160404"]};
function dice(L,me,names){const rm=window.matchMedia("(prefers-reduced-motion: reduce)").matches,d=document.createElement("div");d.className="rq-dice";
  d.innerHTML=`<div class="who">${L.lucky?`🍀 Lucky! A ${L.lucky} is rolled again… `:""}${L.k===me?"You roll":X.esc(names[L.k])+" rolls"}</div><div class="rq-stage"><div class="rq-shadow"></div><div class="rq-ring"></div><div class="rq-dw"><div class="rq-dt">${D20}</div></div></div><div class="cap"></div><div class="sub"></div><div class="tap">tap to continue</div>`;
  (document.querySelector(".gx")||document.body).appendChild(d);
  const svg=d.querySelector(".rq-die"),n=svg.querySelector(".n"),sn=[...svg.querySelectorAll(".sn")],dw=d.querySelector(".rq-dw"),dt=d.querySelector(".rq-dt"),sh=d.querySelector(".rq-shadow");
  const col=c=>{svg.style.setProperty("--d1",DCOL[c][0]);svg.style.setProperty("--d2",DCOL[c][1]);};col("roll");
  const rnd=()=>1+Math.floor(Math.random()*20),face=v=>{n.textContent=v;sn.forEach(t=>t.textContent=rnd());};face(rnd());
  let done=false,timers=[];const T=(f,ms)=>timers.push(setTimeout(f,ms));
  const close=()=>{if(done)return;done=true;timers.forEach(clearTimeout);d.animate([{opacity:1},{opacity:0}],{duration:220,fill:"forwards"}).onfinish=()=>d.remove();};
  d.onclick=close;d.animate([{opacity:0},{opacity:1}],{duration:160});
  const LAND=rm?120:760;
  if(!rm){/* thrown in from below: an arc, a hard landing, two small bounces */
    dw.animate([{transform:"translate(130px,330px) rotate(-320deg) scale(.45)"},{transform:"translate(40px,-70px) rotate(-110deg) scale(1.12)",offset:.45},{transform:"translate(0,0) rotate(14deg) scale(1)",offset:.72},
      {transform:"translate(0,-22px) rotate(-5deg)",offset:.83},{transform:"translate(0,0) rotate(2deg)",offset:.93},{transform:"translate(0,-4px) rotate(0)",offset:.97},{transform:"none"}],{duration:1050,easing:"cubic-bezier(.25,.6,.4,1)"});
    dt.animate([{transform:"perspective(500px) rotate3d(1,.6,0,0deg)"},{transform:"perspective(500px) rotate3d(1,.6,0,540deg)",offset:.7},{transform:"perspective(500px) rotate3d(1,.6,0,720deg)"}],{duration:LAND,easing:"cubic-bezier(.2,.7,.35,1)"});
    sh.animate([{transform:"scale(.3)",opacity:.2},{transform:"scale(.55)",opacity:.3,offset:.45},{transform:"scale(1.05)",opacity:1,offset:.72},{transform:"scale(.85)",opacity:.75,offset:.83},{transform:"scale(1)",opacity:1}],{duration:1050});
    /* numbers flick past fast, then slow down as the die settles */
    let t=0,gap=45;while(t<LAND-60){T(()=>face(rnd()),t);t+=gap;gap*=1.13;}}
  T(()=>{const c=L.d===20?"crit":L.d===1?"fum":L.ok?"ok":"no";face(L.d);col(c);d.classList.add(L.d===20?"crit":L.ok?"ok":"no");X.tapv();
    dt.animate([{transform:"scale(1.16,.86)"},{transform:"scale(.95,1.06)",offset:.45},{transform:"none"}],{duration:380,easing:"ease-out"});
    const ring=d.querySelector(".rq-ring");ring.style.setProperty("--rc",DCOL[c==="fum"?"no":c][0]);ring.animate([{transform:"scale(.6)",opacity:.9},{transform:"scale(1.9)",opacity:0}],{duration:650,easing:"ease-out"});
    if(c==="crit"){for(let i=0;i<14;i++){const s=document.createElement("div");s.className="rq-spark";s.textContent=i%3?"✦":"✧";d.querySelector(".rq-stage").appendChild(s);const a=i/14*Math.PI*2,r=90+Math.random()*50;
        s.animate([{transform:"translate(-50%,-50%) scale(.3)",opacity:1},{transform:`translate(calc(-50% + ${Math.cos(a)*r}px),calc(-50% + ${Math.sin(a)*r}px)) scale(1.1) rotate(${180+Math.random()*180}deg)`,opacity:0}],{duration:900+Math.random()*300,easing:"cubic-bezier(.1,.7,.3,1)",fill:"forwards"});}
      X.confetti();}
    if(c==="fum"){const ck=svg.querySelector(".ck");ck.style.opacity=1;ck.animate([{strokeDashoffset:160},{strokeDashoffset:0}],{duration:260,fill:"forwards"});
      dw.animate([{transform:"translateX(0)"},{transform:"translateX(-9px)"},{transform:"translateX(8px)"},{transform:"translateX(-5px)"},{transform:"translateX(3px)"},{transform:"none"}],{duration:380,delay:60});}
    const cap=d.querySelector(".cap"),sub=d.querySelector(".sub");cap.textContent=L.d===20?"Critical!":L.d===1?"Fumble!":L.ok?"Success!":"Failed";
    cap.animate([{opacity:0,transform:"translateY(10px) scale(.9)"},{opacity:1,transform:"none"}],{duration:300,delay:120,easing:"cubic-bezier(.3,1.5,.5,1)",fill:"forwards"});
    sub.innerHTML=`<span>🎲 ${L.d}</span><span>${L.b>=0?"+":"−"} ${Math.abs(L.b)}</span><span>= ${L.tot}</span><span>DC ${L.dc}</span>`;
    sub.animate([{opacity:0,transform:"translateY(6px)"},{opacity:1,transform:"none"}],{duration:280,delay:260,fill:"forwards"});},LAND);
  T(close,LAND+2100);}
function float(el,t,col){if(!el)return;const r=el.getBoundingClientRect(),f=document.createElement("div");f.className="rq-float";f.textContent=t;if(col)f.style.color=col;f.style.left=r.left+r.width/2+"px";f.style.top=r.top+r.height/3+"px";document.body.appendChild(f);
  f.animate([{transform:"translate(-50%,-30%) scale(.6)",opacity:0},{transform:"translate(-50%,-70%) scale(1.15)",opacity:1,offset:.3},{transform:"translate(-50%,-130%)",opacity:0}],{duration:1000,fill:"forwards"}).onfinish=()=>f.remove();}
function float(el,t,col){if(!el)return;const r=el.getBoundingClientRect(),f=document.createElement("div");f.className="rq-float";f.textContent=t;if(col)f.style.color=col;f.style.left=r.left+r.width/2+"px";f.style.top=r.top+r.height/3+"px";document.body.appendChild(f);
  f.animate([{transform:"translate(-50%,-30%) scale(.6)",opacity:0},{transform:"translate(-50%,-70%) scale(1.15)",opacity:1,offset:.3},{transform:"translate(-50%,-130%)",opacity:0}],{duration:1000,fill:"forwards"}).onfinish=()=>f.remove();}
const REPW=v=>["Hated","Disliked","Wary","Neutral","Liked","Trusted","Heroes"][v+3];
const heroPor=h=>por(POR[h.an][h.po]||POR[h.an][0]);
const sumLine=h=>`${AN[h.an].n} ${CL[h.cl].n} · ${BG[h.bg].n} · ${TR[h.tr].n}`;
function heroSheet(S,k,me){const h=S.heroes[k];if(!h)return;const tro=TRO.filter((t,i)=>h.tro&(1<<i));
  ov(`<img class="rq-sheetimg" src="${heroPor(h)}" alt=""><h3>${k===me?"You":X.esc(S.names[k])}</h3><p><b>${sumLine(h)}</b><br>Level ${h.lv} · ❤ ${h.hp}/${h.max} · 🛡 ${h.ac+S.up.ac}${h.db+S.up.dmg?` · 🗡 +${h.db+S.up.dmg} damage`:""}</p>
    <p>${STS.map(s=>`${ST[s][1]} ${ST[s][0]} <b>${mod(h,s)>=0?"+":""}${mod(h,s)}</b>`).join("<br>")}</p>
    <p><b>${CL[h.cl].ab}:</b> ${CL[h.cl].abt}<br><b>${TR[h.tr].e} ${TR[h.tr].n}:</b> ${TR[h.tr].t}<br><b>${BG[h.bg].e} ${BG[h.bg].n}:</b> ${BG[h.bg].t}</p>
    ${tro.length?`<div class="rq-sec">Rewards</div><div class="rq-tro">${tro.map(t=>`<span>${t[1]} ${t[2]}: ${t[3]}</span>`).join("")}</div>`:""}`);}
function worldSheet(S){const fl=WF.filter(f=>S.fl[f]&&WFT[f]);
  ov(`<h3>🗺️ The world remembers</h3>${FACS.map(f=>{const v=S.rep[f]||0;return `<div class="rq-rep"><span class="f">${FAC[f][1]} ${FAC[f][0]}</span><span class="b"><i style="${v>=0?`left:50%;width:${v/3*50}%;background:#3fb56b`:`right:50%;width:${-v/3*50}%;background:#e0533c`}"></i></span><span class="w">${REPW(v)}</span></div>`;}).join("")}
    <p style="font-size:12.5px;color:var(--muted)">Liked places give discounts and help. At −2 their shops close their doors to you.</p>
    ${fl.length?`<div class="rq-sec">What happened</div><ul>${fl.map(f=>`<li>${WFT[f]}</li>`).join("")}</ul>`:`<p>Nothing yet. Your deeds will be remembered here.</p>`}
    ${S.up.dmg||S.up.ac?`<div class="rq-sec">Party gear</div><div class="rq-tro">${S.up.dmg?`<span>🗡️ +${S.up.dmg} damage</span>`:""}${S.up.ac?`<span>⛓️ +${S.up.ac} armour</span>`:""}</div>`:""}`);}
/* building your hero, on your own phone; nothing is sent until you're ready */
let B=null;
function builder(S,R,me,EL){const saved=store("pt-rq-hero");
  if(!B)B={step:saved&&CL[saved.cl]?-1:0,cl:"fighter",an:"human",po:0,bg:"soldier",tr:"tough",pa:CL.fighter.sug.slice()};
  const b=B,c=CL[b.cl],left=4-b.pa.reduce((a,v)=>a+v,0),h=calc({cl:b.cl,an:b.an,bg:b.bg,tr:b.tr,pa:b.pa,lv:1,tro:0,hp:null});
  const head=`<div class="rq-bh"><img src="${por(POR[b.an][b.po])}" alt=""><div><b>${X.esc(S.names[me])}</b><small>${AN[b.an].n} ${c.n}${b.step>=2?` · ${BG[b.bg].n} · ${TR[b.tr].n}`:""}</small><br><small>❤ ${h.max} · 🛡 ${h.ac} · ${STS.map(s=>`${ST[s][1]}${h.s[s]>=0?"+":""}${h.s[s]}`).join(" ")}</small></div></div>
    <div class="rq-steps">${[0,1,2,3].map(i=>`<i class="${i<=b.step?"on":""}"></i>`).join("")}</div>`;
  let body="";
  if(b.step===-1){const sh=calc({...saved,hp:null});
    body=`<div class="gm-big">Welcome back</div><div class="rq-bh"><img src="${heroPor(sh)}" alt=""><div><b>${X.esc(S.names[me])}</b><small>${sumLine(sh)}</small><br><small>Level ${sh.lv}${sh.tro?" · "+TRO.filter((t,i)=>sh.tro&(1<<i)).map(t=>t[1]).join(""):""}${saved.gs?` · brings ${saved.gs*5} gold`:""}</small></div></div>
      <button class="rq-big" id="rqKeep">Play on with this hero</button><button class="rq-big alt" id="rqNew">Make a new hero</button>`;}
  else if(b.step===0)body=`${head}<div class="gm-big">Choose a class</div><div class="rq-grid">${CLS.map(k=>{const x=CL[k];return `<button class="rq-opt ${b.cl===k?"on":""}" data-bcl="${k}"><img class="cp" src="${por(POR.human[POR0[k][0]])}" alt=""><b>${x.e} ${x.n}</b>${x.tip}<br>❤ ${x.hp} · 🛡 ${x.ac}<br><i>${x.ab}: ${x.abt}</i></button>`;}).join("")}</div>`;
  else if(b.step===1)body=`${head}<div class="rq-sec">Your people</div><div class="rq-grid g3">${ANS.map(k=>`<button class="rq-opt ${b.an===k?"on":""}" data-ban="${k}"><span class="e">${AN[k].e}</span><b>${AN[k].n}</b></button>`).join("")}</div>
      <p class="rq-note" style="text-align:left">${AN[b.an].t}</p><div class="rq-sec">Your look</div><div class="rq-grid g3">${POR[b.an].map((p,i)=>`<button class="rq-por ${b.po===i?"on":""}" data-bpo="${i}"><img src="${por(p)}" alt="" loading="lazy"></button>`).join("")}</div>`;
  else if(b.step===2)body=`${head}<div class="rq-sec">Background: who were you before?</div><div class="rq-grid">${BGS.map(k=>`<button class="rq-opt ${b.bg===k?"on":""}" data-bbg="${k}"><span class="e">${BG[k].e}</span><b>${BG[k].n}</b>${BG[k].t}</button>`).join("")}</div>
      <div class="rq-sec">Trait</div><div class="rq-grid">${TRS.map(k=>`<button class="rq-opt ${b.tr===k?"on":""}" data-btr="${k}"><span class="e">${TR[k].e}</span><b>${TR[k].n}</b>${TR[k].t}</button>`).join("")}</div>`;
  else body=`${head}<div class="gm-big">${left?`${left} point${left>1?"s":""} to spend`:"Ready to go"}</div><p class="rq-note">Lower a stat to get a point back. Each stat: −1 to +2 from points.</p>
      ${STS.map((s,i)=>`<div class="rq-st"><span class="nm">${ST[s][1]} ${ST[s][0]}<small>${c.n} ${c.s[s]>=0?"+":""}${c.s[s]}${AN[b.an].s[s]?` · ${AN[b.an].n} ${AN[b.an].s[s]>0?"+":""}${AN[b.an].s[s]}`:""}${BG[b.bg].s===s?` · ${BG[b.bg].n} +1`:""} · points ${b.pa[i]>=0?"+":""}${b.pa[i]}</small></span>
        <button data-bm="${i}" ${b.pa[i]<=-1?"disabled":""}>−</button><span class="v">${h.s[s]>=0?"+":""}${h.s[s]}</span><button data-bp="${i}" ${b.pa[i]>=2||left<=0?"disabled":""}>+</button></div>`).join("")}`;
  const nav=b.step>=0?`<div class="rq-row">${b.step>0?`<button class="rq-big alt" id="rqBk">Back</button>`:`<button class="rq-big alt" id="rqRnd">🎲 Surprise me</button>`}${b.step<3?`<button class="rq-big" id="rqFw">Next</button>`:`<button class="rq-big" id="rqGo" ${left?"disabled":""}>Ready!</button>`}</div>`:"";
  EL.innerHTML=`<div class="rq">${body}${nav}</div>`;
  const q=s=>EL.querySelector(s),re=()=>view(R),send=x=>{X.tapv();B=null;R.act(buildAct(x));};
  EL.querySelectorAll("[data-bcl]").forEach(e=>e.onclick=()=>{b.cl=e.dataset.bcl;b.pa=CL[b.cl].sug.slice();b.po=POR0[b.cl][ANS.indexOf(b.an)]%POR[b.an].length;re();});
  EL.querySelectorAll("[data-ban]").forEach(e=>e.onclick=()=>{b.an=e.dataset.ban;b.po=POR0[b.cl][ANS.indexOf(b.an)]%POR[b.an].length;re();});
  EL.querySelectorAll("[data-bpo]").forEach(e=>e.onclick=()=>{b.po=+e.dataset.bpo;re();});
  EL.querySelectorAll("[data-bbg]").forEach(e=>e.onclick=()=>{b.bg=e.dataset.bbg;re();});EL.querySelectorAll("[data-btr]").forEach(e=>e.onclick=()=>{b.tr=e.dataset.btr;re();});
  EL.querySelectorAll("[data-bm]").forEach(e=>e.onclick=()=>{b.pa[+e.dataset.bm]--;re();});EL.querySelectorAll("[data-bp]").forEach(e=>e.onclick=()=>{b.pa[+e.dataset.bp]++;re();});
  if(q("#rqBk"))q("#rqBk").onclick=()=>{b.step--;re();};if(q("#rqFw"))q("#rqFw").onclick=()=>{X.tapv();b.step++;EL.scrollTop=0;re();};
  if(q("#rqRnd"))q("#rqRnd").onclick=()=>{const r=randomBuild(1);Object.assign(b,r,{step:3});re();};
  if(q("#rqGo"))q("#rqGo").onclick=()=>send({cl:b.cl,an:b.an,bg:b.bg,tr:b.tr,po:b.po,pa:b.pa,lv:1});
  if(q("#rqKeep"))q("#rqKeep").onclick=()=>send(saved);if(q("#rqNew"))q("#rqNew").onclick=()=>{b.step=0;re();};}
let SEL=null;
function view(R){const S=R.S,me=R.mySlot(),EL=X.EL();if(!document.getElementById("rqCss")){const st=document.createElement("style");st.id="rqCss";st.textContent=CSS;document.head.appendChild(st);}
  if(view.R!==R){view.R=R;view.roll=S.rollN;view.fe=S.fight?S.fight.evn:0;view.node=null;view.ph=null;SEL=null;B=null;view.saved=0;}
  X.shell("Questbook",R.status(),false);X.onBack(()=>X.leaveAsk(R));
  try{if(!localStorage.getItem("pt-rq-help2")){localStorage.setItem("pt-rq-help2","1");setTimeout(()=>ov(HELP),300);}}catch(e){}
  if(S.phase==="pick"&&me>=0&&!S.heroes[me]){builder(S,R,me,EL);return;}
  const nm=k=>k===me?"You":X.esc(S.names[k]),turn=DEF.turn(S),mine=turn===me&&!R.pending,cpuLead=!!(R.players[S.lead]&&R.players[S.lead].ai);
  const party=`<div class="rq-party">${S.heroes.map((h,k)=>{if(!h)return `<div class="rq-h"><span class="av" style="display:grid;place-items:center">❔</span><span class="in"><b>${nm(k)}</b><small>building a hero…</small></span></div>`;const p=Math.round(h.hp/h.max*100);
    return `<button class="rq-h ${k===S.lead&&S.phase!=="fight"?"lead":""} ${S.phase==="fight"&&turn===k?"now":""} ${h.hp<=0?"down":""}" data-hero="${k}">${k===S.lead&&S.phase!=="fight"?`<span class="crown">👑</span>`:""}<img class="av" src="${heroPor(h)}" alt=""><span class="in"><b>${nm(k)}</b><small>${CL[h.cl].e} lv ${h.lv} · ✦${h.ab}</small>
      <span class="rq-bar"><i class="${p<35?"lo":""}" style="width:${p}%"></i></span><small>${h.hp}/${h.max} HP</small></span></button>`;}).join("")}</div>`;
  const inv=`<div class="rq-inv"><span>💰 ${S.gold}</span><button id="rqPot">🧪 ${S.potions}</button>${S.items.map(i=>`<span>${{key:"🗝️ Silver key",clapper:"🔔 Bell clapper"}[i]||i}</span>`).join("")}<button id="rqWorld">🗺️</button><button id="rqLog">📜</button><button id="rqHelp">?</button></div>`;
  const notes=S.notes&&S.notes.length?`<div class="rq-notes">${S.notes.map(([t,g])=>`<span class="${g?"":"bad"}">${X.esc(t)}</span>`).join("")}</div>`:"";
  const art=(p,t,who)=>`<div class="rq-art"><img class="bg" src="${pic(p)}" alt="">${who&&NPC[who]?`<div class="rq-who"><img src="${por(NPC[who][0])}" alt=""><span>${NPC[who][1]}</span></div>`:""}<h3>${t}</h3></div>`;
  let body="";
  if(S.phase==="pick"){body=`<div class="gm-big">The party gathers</div><p class="rq-note">Waiting for everyone to finish their hero…</p>`;}
  else if(S.phase==="adv"){body=me===0?`<div class="gm-big">Choose an adventure</div><div class="rq-advs">${ADVS.map((a,i)=>`<button class="rq-adv" data-adv="${i}"><img src="${pic(ADV[a].p)}" alt="">${S.done&(1<<i)?`<span class="dn">✓ Done · play again</span>`:""}<div><b>${ADV[a].n}</b>${ADV[a].x}</div></button>`).join("")}</div>`
      :`<div class="gm-big">📖</div><p class="rq-note">${X.esc(S.names[0])} is choosing the adventure…</p>`;}
  else if(S.phase==="end"){const N=node(S),E=S.ending||{},nEnd=Object.values(ADV[S.adv].nodes).filter(n=>n.end==="win").length;
    if(view.saved!==S.endN){view.saved=S.endN;saveHero(S,me);saveWorld(S);}
    body=`<div class="rq-scene ${view.node!==S.node?"rq-in":""}">${art(N.p,N.t,N.who)}<div class="rq-txt"><p>${N.x}</p>${(N.xf||[]).filter(x=>cond(S,x[0])).map(x=>`<p class="xf">${x[1]}</p>`).join("")}
      <div class="rq-end"><div class="en">${E.win?`Ending: ${X.esc(E.en)}`:"The end… for now"}</div><div class="rw">${E.gold?`<span>💰 +${E.gold} gold</span>`:""}${(E.tr||[]).map((t,i)=>{const T=TRO[TROI[t]];return `<span style="animation-delay:${.2+i*.25}s">${T[1]} ${T[2]} (${T[3]})</span>`;}).join("")}</div>${notes}
      ${E.win&&nEnd>1?`<p class="rq-note" style="color:#bdb3d6">This adventure has ${nEnd} endings. Your heroes and the world remember this one.</p>`:""}</div></div></div>
      ${me===0?`<button class="rq-big" id="rqAgain">${E.win?"Next adventure":"Try again"}</button>`:`<p class="rq-note">${X.esc(S.names[0])} can start the next adventure.</p>`}`;view.node=S.node;}
  else if(S.phase==="fight"){const F=S.fight,h=S.heroes[me],myTurn=mine&&h&&h.hp>0,N=node(S);
    const sel=SEL&&SEL.n===F.evn+"_"+F.i?SEL:null;const needEnemy=sel&&(sel.a===5||(sel.a===6&&["fighter","rogue"].includes(h.cl))),needAlly=sel&&sel.a===6&&["cleric","bard"].includes(h.cl);
    body=`<div class="rq-fight"><img class="fbg" src="${pic(N.p)}" alt=""><h3>⚔ ${N.t} · round ${F.round}</h3><div class="rq-en">${F.en.map((e,i)=>`<button class="rq-e ${e.hp<=0?"dead":""} ${needEnemy&&e.hp>0?"tgt":""}" data-en="${i}">${MON[e.m]&&MON[e.m][6]?`<img src="${por(MON[e.m][6])}" alt="">`:`<span style="font-size:44px">${e.e}</span>`}${X.esc(e.n)}<div class="rq-bar"><i style="width:${Math.round(e.hp/e.max*100)}%"></i></div><small>${e.hp}/${e.max} · AC ${e.ac}</small></button>`).join("")}</div>
      ${F.helps&&F.helps.length&&F.round===1?`<div class="rq-helps">${F.helps.map(X.esc).join("<br>")}</div>`:""}</div>
      ${myTurn?`<div class="rq-note">${needEnemy?"Tap an enemy":needAlly?"Tap a hero in the party bar":"Your turn: what do you do?"}</div>
        <div class="rq-acts"><button data-fa="5" class="${sel&&sel.a===5?"on":""}">⚔️ Attack<small>d20 + ${ST[CL[h.cl].atk][0]} vs armour, d${CL[h.cl].die} damage</small></button>
        <button data-fa="6" class="${sel&&sel.a===6?"on":""}" ${h.ab<1?"disabled":""}>${CL[h.cl].e} ${CL[h.cl].ab} ✦${h.ab}<small>${CL[h.cl].abt}</small></button>
        <button data-fa="7">🛡 Defend<small>+4 armour until your next turn</small></button><button data-fa="9" ${S.potions<1||h.hp>=h.max?"disabled":""}>🧪 Potion (${S.potions})<small>Heal yourself 2d4 + 2</small></button></div>`
      :`<p class="rq-note">${turn>=0?`${nm(turn)} ${turn===me?"":"is "}taking a turn…`:""}</p>`}
      <div class="rq-log">${S.log.slice(-5).map((l,i,a)=>i===a.length-1?`<b class="${view.ll!==S.log.length?"rq-new":""}">${X.esc(l)}</b>`:`<span>${X.esc(l)}</span>`).join("<br>")}</div>`;view.ll=S.log.length;view.node=S.node;}
  else{const N=node(S),lead=S.lead===me&&!R.pending;
    let txt=`<div class="rq-scene ${view.node!==S.node?"rq-in":""}">${art(N.p,N.t,N.who)}<div class="rq-txt"><p>${N.x}</p>${(N.xf||[]).filter(x=>cond(S,x[0])).map(x=>`<p class="xf">${x[1]}</p>`).join("")}${S.res?`<p class="res ${S.res.ok?"ok":"no"}">${X.esc(S.res.txt)}</p>`:""}${notes}</div></div>`;
    if(S.phase==="scene"&&N.shop){const shut=shopShut(S,N);
      txt+=shut?`<p class="rq-note">🚪 The door stays shut for you. ${FAC[N.shop.fac][0]} doesn't want your business.</p>`:`<div class="rq-sec">For sale · anyone can buy · 💰 ${S.gold}</div><div class="rq-shop">${N.shop.it.map((it,i)=>{const I=ITEM[it],p=price(S,N,it);
        return `<button data-buy="${i}" ${canBuy(S,N,it)?"":"disabled"}><span class="pr">💰 ${p}</span>${I.e} ${I.n}<small>${I.t}</small></button>`;}).join("")}</div>`;}
    if(S.phase==="scene"){const shop=!!N.shop,can=lead||shop;
      if(N.c)txt+=`<div class="rq-note">${shop?"Anyone can move on when the party is ready.":lead?"👑 You lead this scene: what does the party do?":`👑 ${nm(S.lead)} ${cpuLead?"is thinking…":"chooses what the party does…"}`}</div><div class="rq-ch">${N.c.map((c,i)=>{if(!choiceShown(S,c))return "";const ok=choiceOk(S,c),bh=c.s?best(S,c):-1,tg=tagOf(c);
        return `<button class="rq-c ${can?"mine":""} ${tg?"sp":""}" data-ch="${i}" ${!can||!ok?"disabled":""}><span class="tag">${c.s?ST[c.s][1]:c.need?(c.need.gold?"💰":"🗝️"):tg?"✦":"➡️"}</span><div>${tg?`<span class="bdg">${tg}</span><br>`:""}${X.esc(c.l)}<small>${c.s?`${ST[c.s][0]} check · ${DCW(c.dc)} (DC ${c.dc}) · best: ${nm(bh)} ${mod(S.heroes[bh],c.s,true)>=0?"+":""}${mod(S.heroes[bh],c.s,true)}`:c.need?(c.need.gold?`Costs ${c.need.gold} gold${ok?"":" (not enough)"}`:`Needs the ${c.need.item==="key"?"silver key":c.need.item}${ok?"":" (you don't have it)"}`):"No roll needed"}</small></div></button>`;}).join("")}</div>`;
      else txt+=lead||cpuLead?`<button class="rq-big" id="rqNext">Continue</button>`:`<p class="rq-note">${nm(S.lead)} continues the story…</p>`;}
    if(S.phase==="who"){const c=N.c[S.pend.c];txt+=`<div class="rq-note">${X.esc(c.l)}: ${ST[c.s][0]} check, DC ${c.dc}. ${lead?"Who tries?":`${nm(S.lead)} picks who tries…`}</div>
      <div class="rq-ch">${S.heroes.map((h,k)=>h&&h.hp>0?`<button class="rq-c ${lead?"mine":""}" data-who="${k}" ${lead?"":"disabled"}><span class="tag"><img src="${heroPor(h)}" alt="" style="width:34px;height:34px;border-radius:50%;object-fit:cover;object-position:50% 8%"></span><div>${nm(k)}<small>${ST[c.s][0]} ${mod(h,c.s,true)>=0?"+":""}${mod(h,c.s,true)} · needs ${Math.max(2,c.dc-mod(h,c.s,true))}+ on the d20${h.tr==="lucky"&&!S.lk[k]?" · 🍀 lucky":""}</small></div></button>`:"").join("")}</div>`;}
    if(S.phase==="roll"){const c=N.c[S.pend.c],h=S.heroes[S.pend.k],b=mod(h,c.s,true)+S.pend.help.length*2+(S.inspire[S.pend.k]||0);
      txt+=`<div class="rq-note">${nm(S.pend.k)} ${S.pend.k===me?"try":"tries"}: d20 ${b>=0?"+":"−"} ${Math.abs(b)} vs DC ${c.dc}${S.pend.help.length?` (helped by ${S.pend.help.map(nm).join(" and ")})`:""}</div>`;
      txt+=S.pend.k===me&&!R.pending?`<button class="rq-big" id="rqRoll">🎲 Roll the d20</button>`:`${S.heroes[me]&&S.heroes[me].hp>0&&!S.pend.help.includes(me)&&S.pend.help.length<2?`<button class="rq-big alt" id="rqHelp2">🤝 Help (+2)</button>`:""}<p class="rq-note">Waiting for ${nm(S.pend.k)} to roll…</p>`;}
    if(S.phase==="result")txt+=lead||cpuLead?`<button class="rq-big" id="rqNext">Continue</button>`:`<p class="rq-note">${nm(S.lead)} continues the story…</p>`;
    body=txt;view.node=S.node;}
  EL.innerHTML=`<div class="rq">${party}${body}${S.phase!=="pick"?inv:""}</div>`;
  if(view.ph!==S.phase+S.node){view.ph=S.phase+S.node;EL.scrollTop=0;}
  // what just happened: the dice, hits and heals
  if(S.last&&S.last.n!==view.roll&&S.phase!=="pick"){view.roll=S.last.n;dice(S.last,me,S.names);}else view.roll=S.last?S.last.n:view.roll;
  if(S.fight){const F=S.fight;for(const e of F.ev)if(e.n>view.fe){
      if(e.k==="hit"){const el=EL.querySelector(`[data-en="${e.t}"]`);float(el,`−${e.v}`,"#ffd2d2");if(el)el.classList.add("rq-shake");}
      if(e.k==="miss")float(EL.querySelector(`[data-en="${e.t}"]`),"miss","#ddd");
      if(e.k==="fire")EL.querySelectorAll("[data-en]").forEach(el=>{float(el,`🔥−${e.v}`);el.classList.add("rq-shake");});
      if(e.k==="heal")float(EL.querySelector(`[data-hero="${e.to}"]`),`+${e.v}`,"#9cf2b5");
      if(e.k==="ehit"){const el=EL.querySelector(`[data-hero="${e.to}"]`);float(el,`−${e.v}`,"#ffb3a8");if(el)el.classList.add("rq-shake");if(e.to===me)X.tapv();}
      if(e.k==="emiss")float(EL.querySelector(`[data-hero="${e.to}"]`),"miss","#ddd");}
    view.fe=F.evn;}
  const go=a=>{SEL=null;R.act(a);};
  EL.querySelectorAll("[data-adv]").forEach(b=>b.onclick=()=>{X.tapv();go([11,+b.dataset.adv]);});
  EL.querySelectorAll("[data-ch]").forEach(b=>b.onclick=()=>{X.tapv();go([2,+b.dataset.ch]);});
  EL.querySelectorAll("[data-who]").forEach(b=>b.onclick=()=>{X.tapv();go([12,+b.dataset.who]);});
  EL.querySelectorAll("[data-buy]").forEach(b=>b.onclick=()=>{X.tapv();go([14,+b.dataset.buy]);});
  const q=id=>EL.querySelector(id);
  if(q("#rqNext"))q("#rqNext").onclick=()=>{X.tapv();go([8]);};if(q("#rqRoll"))q("#rqRoll").onclick=()=>{X.tapv();go([4]);};
  if(q("#rqHelp2"))q("#rqHelp2").onclick=()=>{X.tapv();go([3]);};if(q("#rqAgain"))q("#rqAgain").onclick=()=>{X.tapv();go([10]);};
  if(q("#rqLog"))q("#rqLog").onclick=()=>ov(`<h3>📜 What happened</h3><p>${S.log.slice().reverse().map(X.esc).join("<br>")}</p>`);
  if(q("#rqHelp"))q("#rqHelp").onclick=()=>ov(HELP);if(q("#rqWorld"))q("#rqWorld").onclick=()=>worldSheet(S);
  if(q("#rqPot"))q("#rqPot").onclick=()=>{if(S.potions<1){X.toast("No potions left");return;}if(S.phase==="fight"){X.toast("In a fight, drink one with the Potion button on your turn");return;}
    ov(`<h3>🧪 Who drinks a potion?</h3><p>Heals 2d4 + 2. You have ${S.potions}.</p><div class="rq-ch">${S.heroes.map((h,k)=>h?`<button class="rq-c" data-pot="${k}" ${h.hp>=h.max?"disabled":""}><span class="tag">${CL[h.cl].e}</span><div>${nm(k)}<small>${h.hp}/${h.max} HP</small></div></button>`:"").join("")}</div>`,
      (o,close)=>o.querySelectorAll("[data-pot]").forEach(b=>b.onclick=()=>{close();go([9,+b.dataset.pot]);}));};
  const h=S.heroes[me],F=S.fight;
  EL.querySelectorAll("[data-hero]").forEach(b=>b.onclick=()=>{const k=+b.dataset.hero;
    if(S.phase==="fight"&&SEL&&SEL.a===6&&h&&["cleric","bard"].includes(h.cl)){X.tapv();go([6,k]);return;}heroSheet(S,k,me);});
  // fights: pick an action, then a target
  if(S.phase==="fight"){
    EL.querySelectorAll("[data-fa]").forEach(b=>b.onclick=()=>{X.tapv();const a=+b.dataset.fa;
      if(a===7){go([7]);return;}if(a===9){go([9,me]);return;}if(a===6&&h.cl==="wizard"){go([6,0]);return;}
      SEL={a,n:F.evn+"_"+F.i};const alv=F.en.map((e,i)=>e.hp>0?i:-1).filter(i=>i>=0);
      if((a===5||(a===6&&["fighter","rogue"].includes(h.cl)))&&alv.length===1){go([a,alv[0]]);return;}view(R);});
    EL.querySelectorAll("[data-en]").forEach(b=>b.onclick=()=>{if(!SEL)return;X.tapv();go([SEL.a,+b.dataset.en]);});}}
function stop(){document.querySelectorAll(".rq-ov,.rq-dice,.rq-float").forEach(e=>e.remove());const s=document.getElementById("rqCss");if(s)s.remove();view.R=null;B=null;}
window.RPG={def:DEF,view,stop,opts:worldOpts,init(h){X=h;},_t:{DEF,ADV,CL,MON,AN,BG,TR,POR,NPC,aiMove,legal,buildAct,randomBuild,cond,calc},_dice:(L,me,nm)=>dice(L,me,nm)};
})();
