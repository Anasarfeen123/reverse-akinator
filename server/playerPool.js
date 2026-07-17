/**
 * RAG Knowledge Base — Football Player Profiles (Updated: July 2026)
 * Each player has a rich text "context" block injected directly into
 * the Ollama prompt so the model doesn't need live internet knowledge.
 */

const PLAYER_POOL = {
  "Lionel Messi": {
    context: `
Name: Lionel Andrés Messi
Nationality: Argentine
Date of Birth: June 24, 1987 (age 39 as of July 2026)
Position: Forward / Attacking Midfielder
Foot: Left
Current Club: Inter Miami CF (MLS, USA) — since July 2023
Previous Clubs: FC Barcelona (2004–2021), Paris Saint-Germain (2021–2023)
Jersey Number: 10
Height: 1.70 m (5 ft 7 in)

Career Goals: 850+ professional goals across club and international career
International: Argentina national team — 190+ caps, 109+ international goals
Major International Trophies: FIFA World Cup 2022 (Qatar), Copa América 2021, FIFA World Cup U-20 2005, Olympic Gold 2008
Club Trophies (Barcelona): 10x La Liga, 7x Copa del Rey, 4x UEFA Champions League
Individual Awards: 8x Ballon d'Or (record: 2009, 2010, 2011, 2012, 2015, 2019, 2021, 2023), 6x European Golden Shoe
Style: Dribbling maestro, low center of gravity, free-kicks, assists, vision
Personal: Married to Antonela Roccuzzo, has 3 sons (Thiago, Mateo, Ciro). Grew up in Rosario, Argentina. Moved to Barcelona at age 13 after Barça paid for his growth hormone treatment.
Known for: GOAT debate, partnership with Xavi and Iniesta, rivalry with Cristiano Ronaldo, plays in the United States (MLS) now
`.trim()
  },

  "Cristiano Ronaldo": {
    context: `
Name: Cristiano Ronaldo dos Santos Aveiro
Nationality: Portuguese
Date of Birth: February 5, 1985 (age 41 as of July 2026)
Position: Forward / Striker
Foot: Right (strong with both)
Current Club: Al Nassr FC (Saudi Pro League, Saudi Arabia) — since January 2023
Previous Clubs: Sporting CP (2002–2003), Manchester United (2003–2009, 2021–2022), Real Madrid (2009–2018), Juventus (2018–2021)
Jersey Number: 7
Height: 1.87 m (6 ft 1 in)

Career Goals: 900+ professional goals — all-time top scorer in history
International: Portugal national team — 135+ caps, 135+ international goals (all-time top scorer in international football history)
Major International Trophies: UEFA Euro 2016, UEFA Nations League 2019
Club Trophies: 3x Premier League (Man Utd), 2x La Liga (Real Madrid), 5x UEFA Champions League (1 Man Utd, 4 Real Madrid), 1x Serie A (Juventus)
Individual Awards: 5x Ballon d'Or (2008, 2013, 2014, 2016, 2017), 4x European Golden Shoe, FIFA Best Player
Style: Pace, power, aerial ability, free-kicks, penalty box finishing, relentless physical dedication
Personal: Born in Funchal, Madeira. Has children — Cristiano Jr (2010), twins Eva and Mateo (2017), Alana Martina (2017, with Georgina Rodríguez), Bella Esmeralda (2022). Currently plays in Saudi Arabia.
Known for: CR7 brand, GOAT debate with Messi, "Siuuu" celebration, playing in Saudi Arabia at age 41
`.trim()
  },

  "Erling Haaland": {
    context: `
Name: Erling Braut Haaland
Nationality: Norwegian
Date of Birth: July 21, 2000 (age 25 as of July 2026, turns 26 on July 21)
Position: Centre Forward / Striker
Foot: Left (strong with both)
Current Club: Manchester City (Premier League, England) — since July 2022
Previous Clubs: Bryne FK, Molde FK, Red Bull Salzburg (2019–2020), Borussia Dortmund (2020–2022)
Jersey Number: 9
Height: 1.94 m (6 ft 4 in)

Career Goals: 250+ professional goals
Premier League record: 36 goals in debut 2022/23 season — all-time single-season Premier League record
International: Norway national team — 35+ caps, 35+ goals
Club Trophies (Man City): 1x Premier League (2022/23), 1x UEFA Champions League (2022/23), 1x FA Cup (2022/23) — treble winners
Style: Explosive pace, powerful physique, clinical finishing with both feet and head, high pressing
Personal: Son of former Manchester City and Leeds player Alfie Haaland. Born in Leeds, England but grew up in Bryne, Norway.
Known for: Machine-like goal-scoring record, robot/cyborg nickname, born in England but plays for Norway
`.trim()
  },

  "Kylian Mbappé": {
    context: `
Name: Kylian Mbappé Lottin
Nationality: French
Date of Birth: December 20, 1998 (age 27 as of July 2026)
Position: Forward / Striker / Left Winger
Foot: Right
Current Club: Real Madrid (La Liga, Spain) — since July 2024
Previous Clubs: AS Monaco (2015–2017), Paris Saint-Germain (2017–2024, loan then permanent)
Jersey Number: 9 (Real Madrid), 10 (PSG and France national team)
Height: 1.78 m (5 ft 10 in)

Career Goals: 350+ professional goals
International: France national team — 90+ caps, 50+ international goals
Major International Trophies: FIFA World Cup 2018, UEFA Nations League 2021
World Cup Finals 2022: Scored a hat-trick in the final vs Argentina — France lost on penalties. Named World Cup top scorer.
PSG Career (2017–2024): 6x Ligue 1 titles, multiple domestic cups, never won Champions League with PSG
Real Madrid: Joined on a free transfer in 2024 after PSG
Style: Exceptional pace (one of the fastest players ever recorded), dribbling, clinical finishing, left-foot cut inside from right wing
Personal: Born in Bondy, a suburb of Paris. Father Wilfried (Cameroonian), mother Fayza (Algerian-French).
Known for: Joining Real Madrid in 2024, youngest French scorer in World Cup history, heir to Messi/Ronaldo throne
`.trim()
  },

  "Vinicius Junior": {
    context: `
Name: Vinicius José Paixão de Oliveira Júnior
Nationality: Brazilian
Date of Birth: July 12, 2000 (age 26 as of July 2026)
Position: Left Winger / Forward
Foot: Right (plays on left wing, cuts inside)
Current Club: Real Madrid (La Liga, Spain) — since 2018 (under contract until 2027)
Jersey Number: 7
Height: 1.76 m (5 ft 9 in)

Career Goals: 150+ professional goals for Real Madrid
International: Brazil national team — 50+ caps, 30+ goals
Club Trophies (Real Madrid): 2x UEFA Champions League (2021/22, 2023/24), 2x La Liga
Champions League 2022: Scored the winning goal in the final vs Liverpool in Paris
Individual Awards: Runner-up Ballon d'Or 2024, UEFA Best Player in Europe 2024
Style: Explosive dribbling, pace, trickery, flair, right-footed but plays on the left wing
Personal: Born in São Gonçalo, Rio de Janeiro, Brazil. Vocal activist against racial abuse in football stadiums. Reports suggest Real Madrid may sell him in summer 2026.
Known for: Dancing goal celebrations, controversial Ballon d'Or 2024 loss to Rodri, Real Madrid's key attacking star
`.trim()
  },

  "Lamine Yamal": {
    context: `
Name: Lamine Yamal Nasraoui Ebana
Nationality: Spanish
Date of Birth: July 13, 2007 (age 19 as of July 2026 — just turned 19 on July 13, 2026)
Position: Right Winger / Forward
Foot: Left
Current Club: FC Barcelona (La Liga, Spain) — since youth academy
Jersey Number: 19
Height: 1.76 m (5 ft 9 in)

Career Goals: 30+ La Liga goals across 2023/24 and 2024/25 seasons
International: Spain national team — youngest player in Spain history, 25+ caps
Major International Trophies: UEFA Euro 2024 — scored an iconic curling left-foot semi-final goal vs France; Spain won the tournament
Individual Awards: Golden Boy 2024, Kopa Trophy 2024 (best young player at Ballon d'Or ceremony)
Style: Dribbling, pace, creativity, exceptional left foot despite playing on the right wing
Personal: Born in Esparreguera, near Barcelona. Father from Equatorial Guinea, mother Moroccan. Famously photographed as a baby being held by Lionel Messi.
Known for: Teen prodigy, youngest player at Euro for Spain, Messi comparisons at Barcelona, just turned 19 in July 2026
`.trim()
  },

  "Jude Bellingham": {
    context: `
Name: Jude Victor William Bellingham
Nationality: English
Date of Birth: June 29, 2003 (age 23 as of July 2026)
Position: Central Midfielder / Attacking Midfielder
Foot: Right
Current Club: Real Madrid (La Liga, Spain) — since July 2023
Previous Clubs: Birmingham City (2019–2020), Borussia Dortmund (2020–2023)
Jersey Number: 5
Height: 1.86 m (6 ft 1 in)

Career Goals: 40+ goals for Real Madrid across two seasons
International: England national team — 50+ caps, 15+ goals
Club Trophies (Real Madrid): 1x La Liga (2023/24), 1x UEFA Champions League (2023/24)
Champions League 2024: Scored dramatic last-minute overhead kick vs Atletico Madrid in quarter-final
Style: Box-to-box dynamism, late runs into the box, scoring, leadership, pressing, complete midfielder
Personal: Born in Stourbridge, England. Father Mark Bellingham was a footballer. Younger brother Jobe Bellingham is also a professional footballer. Transfer fee from Dortmund: 103 million euros — most expensive midfielder at the time.
Known for: Leadership beyond his years, overhead kick vs Atletico Madrid, key player for Real Madrid and England
`.trim()
  },

  "Rodri": {
    context: `
Name: Rodrigo Hernández Cascante
Nationality: Spanish
Date of Birth: June 22, 1996 (age 30 as of July 2026)
Position: Defensive Midfielder / Central Midfielder
Foot: Right
Current Club: Manchester City (Premier League, England) — since 2019
Previous Clubs: Villarreal (youth + loan), Atletico Madrid (2017–2019)
Jersey Number: 16
Height: 1.91 m (6 ft 3 in)

International: Spain national team — 55+ caps. Won UEFA Euro 2024 and was awarded the Golden Ball (best player of the tournament).
Major International Trophies: UEFA Euro 2024 (Golden Ball winner), UEFA Nations League 2021
Club Trophies (Man City): 3x Premier League, 1x UEFA Champions League (2022/23), 1x FA Cup — treble winner; multiple domestic cups
Individual Awards: Ballon d'Or 2024 — beat Vinicius Junior in a controversial decision
Injury: Suffered serious ACL knee injury in September 2024 — missed the entire 2024/25 season. Expected to return for 2025/26 season.
Style: Exceptional long passing, positioning, breaking up opposition attacks, rarely loses the ball, the "metronome" of Man City and Spain
Known for: Ballon d'Or 2024, Euro 2024 Golden Ball, Man City's engine room, returning from ACL injury in 2025/26
`.trim()
  },

  "Pedri": {
    context: `
Name: Pedro González López
Nationality: Spanish
Date of Birth: November 25, 2002 (age 23 as of July 2026)
Position: Central Midfielder / Attacking Midfielder
Foot: Right
Current Club: FC Barcelona (La Liga, Spain) — since 2020
Previous Clubs: Las Palmas (youth academy)
Jersey Number: 8
Height: 1.74 m (5 ft 8 in)

International: Spain national team — 35+ caps, scored at Euro 2020/21
Major International Trophies: UEFA Euro 2024
Club Trophies (Barcelona): 1x La Liga (2022/23)
Individual Awards: Kopa Trophy 2021, Golden Boy 2021
Injury history: Multiple significant muscle and knee injuries across 2022/23 and 2023/24 seasons disrupted his career progression
Style: Exceptional ball retention in tight spaces, vision, passing, composure under pressure — style compared to Xavi and Iniesta
Personal: Born in Tegueste, Tenerife, Canary Islands. Joined Barcelona's La Masia academy. Likened to Xavi and Andres Iniesta.
Known for: Barcelona and Spain midfield prodigy, injuries hampering an otherwise brilliant career, Xavi/Iniesta comparisons
`.trim()
  },

  "Thierry Henry": {
    context: `
Name: Thierry Daniel Henry
Nationality: French
Date of Birth: August 17, 1977 (age 48 as of July 2026)
Position: Striker / Left Winger (retired)
Foot: Left
Career Clubs: Monaco (1994–1999), Juventus (1999, briefly), Arsenal (1999–2007), Barcelona (2007–2010), New York Red Bulls (2010–2014), Arsenal (loan, Jan–Mar 2012)
Jersey Number: 14 (Arsenal iconic number)
Height: 1.88 m (6 ft 2 in)
Status: RETIRED

Career Goals: 360+ professional goals
Arsenal goals: 175 goals — all-time Arsenal top scorer (later surpassed by no one else at Arsenal)
International: France — 123 caps, 51 goals
Major International Trophies: FIFA World Cup 1998, UEFA Euro 2000
Club Trophies: Arsenal — 2x Premier League (2002, 2004 Invincibles unbeaten season), 3x FA Cup; Barcelona — 1x La Liga, 1x Champions League (2009)
Individual Awards: 2x FWA Footballer of Year, 2x PFA Players Player of Year, 2x European Golden Shoe (2004, 2005)
Famous moment: Handball vs Ireland in 2009 World Cup qualifying playoff — helped France qualify controversially
Post-career: Belgium national team manager (2018–2019); TV pundit on CBS Sports / Paramount+
Known for: Arsenal Invincibles unbeaten season 2003/04, partnership with Dennis Bergkamp, shirt-collar-popped celebrations
`.trim()
  },

  "Ronaldinho": {
    context: `
Name: Ronaldo de Assis Moreira (known as Ronaldinho)
Nationality: Brazilian
Date of Birth: March 21, 1980 (age 46 as of July 2026)
Position: Attacking Midfielder / Left Winger (retired)
Foot: Both equally two-footed
Career Clubs: Grêmio (1998–2001), Paris Saint-Germain (2001–2003), FC Barcelona (2003–2008), AC Milan (2008–2011), Flamengo (2011–2012), Atletico Mineiro (2012–2014), Queretaro (2014–2015), Fluminense (2015), Chapecoense (loan), others
Jersey Number: 10
Height: 1.81 m (5 ft 11 in)
Status: RETIRED

Career Goals: 300+ professional goals
International: Brazil — 97 caps, 33 goals
Major International Trophies: FIFA World Cup 2002 (Japan/South Korea), Copa América 1999, FIFA Confederations Cup 2005
Club Trophies (Barcelona): 1x La Liga, 1x UEFA Champions League (2006)
Ballon d'Or: WON EXACTLY 1 TIME — in 2005 only. He did NOT win 2 or more Ballon d'Or awards.
FIFA World Player of the Year: WON 2 TIMES — 2004 and 2005. NOTE: FIFA World Player of the Year and Ballon d'Or are DIFFERENT awards. Winning both in 2005 means 1 Ballon d'Or + 2 FIFA World Player awards total.
Has this player won multiple (more than one) Ballon d'Or? NO. He won only one Ballon d'Or.
Famous moments: Free-kick that lobbed David Seaman vs England in 2002 World Cup; received a standing ovation from Real Madrid fans at the Bernabéu in a Barcelona shirt (2005); won Champions League with Barcelona (2006)
Personal: Born in Porto Alegre, Brazil. Known for his infectious smile and joy of playing. Briefly detained in Paraguay in 2020 over a fake passport case.
Known for: Greatest entertainer the game has seen, partnership with Messi and Deco at Barcelona, samba flair and creativity
`.trim()
  },

  "Zinedine Zidane": {
    context: `
Name: Zinedine Yazid Zidane (nicknamed Zizou)
Nationality: French (of Algerian Berber descent)
Date of Birth: June 23, 1972 (age 54 as of July 2026)
Position: Attacking Midfielder (retired)
Foot: Both (mainly right)
Career Clubs: Cannes (1988–1992), Bordeaux (1992–1996), Juventus (1996–2001), Real Madrid (2001–2006)
Height: 1.85 m (6 ft 1 in)
Status: RETIRED as player and as manager

Career Goals: 125+ professional goals
International: France national team — 108 caps, 31 goals
Major International Trophies: FIFA World Cup 1998 (host nation France), UEFA Euro 2000, FIFA Confederations Cup 2003
Club Trophies: Juventus — 2x Serie A; Real Madrid — 1x La Liga, 1x Champions League (2002)
Individual Awards: FIFA World Player of the Year 3x (1998, 2000, 2003), Ballon d'Or 1998, Golden Ball 1998 World Cup, Golden Ball 2006 World Cup
Famous moments: Two headers in 1998 World Cup Final vs Brazil; headbutt on Marco Materazzi in 2006 World Cup Final (last act of his career); iconic 2002 Champions League volley vs Bayer Leverkusen (often called the greatest goal in CL history)
Post-career manager: Real Madrid manager — won 3 consecutive Champions League titles as manager (2016, 2017, 2018) — the only manager ever to achieve this; left in 2021 and has not taken another job since
Known for: World Cup headbutt, 1998 World Cup winner, Bernabéu volley, 3 consecutive CL titles as manager
`.trim()
  },

  "Ronaldo Nazário": {
    context: `
Name: Ronaldo Luís Nazário de Lima (nicknamed R9, El Fenómeno)
Nationality: Brazilian
Date of Birth: September 18, 1976 (age 49 as of July 2026)
Position: Striker / Centre Forward (retired)
Foot: Both
Career Clubs: Cruzeiro (1993–1994), PSV Eindhoven (1994–1996), FC Barcelona (1996–1997), Inter Milan (1997–2002), Real Madrid (2002–2007), AC Milan (2007–2008), Corinthians (2009–2011)
Height: 1.83 m (6 ft 0 in)
Status: RETIRED

Career Goals: 400+ professional goals
International: Brazil — 98 caps, 62 goals (was Brazil's all-time record at the time)
Major International Trophies: FIFA World Cup 1994 (on squad, did not play final due to seizure), FIFA World Cup 2002 — top scorer (8 goals) and Player of Tournament, Copa América 1997, Confederations Cup 1997
Club Trophies: PSV — Eredivisie; Barcelona — Copa del Rey; Inter Milan — UEFA Cup; Real Madrid — 1x La Liga
Individual Awards: FIFA World Player of the Year 3x (1996, 1997, 2002), Ballon d'Or 1997 and 2002, European Golden Boot
Famous moments: Two goals in 2002 World Cup Final vs Germany; the bizarre bowl-cut haircut at 2002 World Cup. Battled severe knee injuries and a hyperthyroidism diagnosis throughout career but made remarkable comebacks.
Known for: Most gifted striker many have ever seen, overcome serious knee injuries, remarkable 2002 World Cup, plays in a different era to modern players
`.trim()
  },

  "Pelé": {
    context: `
Name: Edson Arantes do Nascimento (known worldwide as Pelé)
Nationality: Brazilian
Date of Birth: October 23, 1940
Date of Death: December 29, 2022 (age 82) — DECEASED
Status: RETIRED (deceased)
Position: Forward / Inside Forward
Foot: Both
Career Clubs: Santos FC (1956–1974), New York Cosmos (1975–1977)
Height: 1.73 m (5 ft 8 in)

Career Goals: 1,281 goals in 1,363 total matches (757 in official competitive matches — the officially recognised record)
International: Brazil — 92 caps, 77 goals
Major International Trophies: FIFA World Cup 1958 (Sweden — aged only 17, youngest ever World Cup winner), FIFA World Cup 1962 (Chile, injured, played limited games), FIFA World Cup 1970 (Mexico — considered the greatest team in history)
Individual Awards: FIFA Player of the Century (jointly with Diego Maradona), honorary Ballon d'Or d'Or, 3x World Cup winner
Style: Athleticism for the era, acrobatic overhead kicks, dribbling, vision, feints, complete forward
Personal: Real name Edson. Passed away on December 29, 2022 from colon cancer at age 82. Son Edinho played as a goalkeeper.
Known for: Only player to win 3 World Cups, considered by many the greatest ever, global ambassador for football, deceased in 2022
`.trim()
  },

  "Neymar Jr": {
    context: `
Name: Neymar da Silva Santos Júnior
Nationality: Brazilian
Date of Birth: February 5, 1992 (age 34 as of July 2026)
Position: Forward / Left Winger / Attacking Midfielder
Foot: Right (plays on left wing, cuts inside)
Current Club: Santos FC (Brazilian Serie A, Brazil) — returned to boyhood club in 2025/2026
Previous Clubs: Santos (2009–2013), FC Barcelona (2013–2017), Paris Saint-Germain (2017–2023), Al Hilal (Saudi Pro League, 2023–2025, barely played due to injury)
Jersey Number: 10
Height: 1.75 m (5 ft 9 in)

Career Goals: 450+ professional goals across his career
International: Brazil — 125+ caps, 79+ international goals (2nd all time for Brazil behind Ronaldo Nazário)
Major International Trophies: Olympic Gold 2016 (Rio de Janeiro — scored the winning penalty in the shootout), Copa América runner-up multiple times (never won Copa América)
Club Trophies: Santos — Copa Libertadores (2011); Barcelona — 1x Champions League (2015), 1x La Liga; PSG — multiple Ligue 1 titles
World Cup: Key Brazil player every cycle. Best finish: 2014 quarterfinal (injured in QF vs Colombia; Brazil then lost 7-1 to Germany in the semi-final without him)
Transfer history: 222 million euros from Barcelona to PSG in 2017 — still the world record transfer fee
Injuries: ACL tear at Al Hilal in October 2023 — missed entire 2023/24 season. Returned to Santos in 2025/26.
Style: Flair, dribbling, skill moves, pace, dangerous one-on-one situations, set pieces
Known for: World record transfer, great entertainer, controversial diving reputation, returned to Santos boyhood club, never won Copa América
`.trim()
  },

  "Kevin De Bruyne": {
    context: `
Name: Kevin De Bruyne
Nationality: Belgian
Date of Birth: June 28, 1991 (age 35 as of July 2026)
Position: Central Midfielder / Attacking Midfielder
Foot: Right (strong with both)
Current Club: Napoli (Serie A, Italy) — since July 2025
Previous Clubs: Genk, Chelsea (2012–2014), VfL Wolfsburg (2014–2015), Manchester City (2015–2025)
Height: 1.81 m (5 ft 11 in)
Status: ACTIVE

International: Belgium — 100+ caps, 30+ goals
Major International Trophies: NONE — Belgium never won World Cup or European Championship
Club Trophies (Man City): 6x Premier League, 1x Champions League (2022/23), 1x FA Cup
Ballon d'Or: Has NEVER won the Ballon d'Or.
Individual Awards: 2x PFA Players' Player of the Year, multiple Premier League Player of the Season
Style: Exceptional vision, passing range, crossing, long shots — best midfielder of his generation
Known for: 10-year Man City career under Guardiola, moved to Napoli in Italy in 2025, Belgium captain
`.trim()
  },

  "Mohamed Salah": {
    context: `
Name: Mohamed Salah Ghaly
Nationality: Egyptian
Date of Birth: June 15, 1992 (age 34 as of July 2026)
Position: Right Winger / Forward
Foot: Left (plays on right wing and cuts inside on left foot)
Current Club: Left Liverpool end of 2025/26 season; verbally agreed to join Besiktas (Turkey) but not finalised as of July 2026
Previous Clubs: El Mokawloon, Basle, Chelsea (2014–2015), Roma (2015–2017), Liverpool (2017–2026)
Height: 1.75 m (5 ft 9 in)
Status: ACTIVE

International: Egypt — 100+ caps, 70+ goals — Egypt all-time top scorer
Major International Trophies: NONE — Egypt has not won the Africa Cup of Nations during his career
Club Trophies (Liverpool): 1x Premier League (2019/20), 1x Champions League (2019), 1x FA Cup, 1x League Cup
Liverpool goals: 230+ — Liverpool's all-time top scorer
Ballon d'Or: Has NEVER won the Ballon d'Or. Multiple Top 10 finishes.
Individual Awards: 4x Premier League Golden Boot, 2x PFA Players' Player of the Year
Style: Explosive pace, left-foot finishing, right wing but left-footed, prolific scorer
Known for: Egyptian icon, Liverpool legend, left Liverpool in 2026, plays on right wing but is left-footed
`.trim()
  },

  "Robert Lewandowski": {
    context: `
Name: Robert Lewandowski
Nationality: Polish
Date of Birth: August 21, 1988 (age 37 as of July 2026)
Position: Centre Forward / Striker
Foot: Right
Current Club: Chicago Fire (MLS, USA) — since June 2026
Previous Clubs: Borussia Dortmund (2010–2014), Bayern Munich (2014–2022), FC Barcelona (2022–2026)
Height: 1.85 m (6 ft 1 in)
Status: ACTIVE

International: Poland — 140+ caps, 80+ goals — Poland all-time top scorer
Major International Trophies: NONE — Poland never won World Cup or European Championship
Club Trophies (Bayern Munich): 8x Bundesliga, 1x Champions League (2020)
Bundesliga record: 41 goals in 2020/21 season — all-time Bundesliga single-season record
Ballon d'Or: Has NEVER officially won the Ballon d'Or. Considered moral winner in 2020 (cancelled due to COVID). Finished 2nd in 2021.
Individual Awards: FIFA Best Men's Player 2020 and 2021, 6x Bundesliga top scorer
Style: Clinical positioning, finishing, aerial ability, complete modern striker
Known for: Bundesliga record scorer, moved to MLS in 2026, Polish captain, never won Ballon d'Or
`.trim()
  },

  "Toni Kroos": {
    context: `
Name: Toni Kroos
Nationality: German
Date of Birth: January 4, 1990 (age 36 as of July 2026)
Position: Central Midfielder / Deep-lying Playmaker
Foot: Left
Status: RETIRED — retired from football in June 2024 after Euro 2024
Previous Clubs: Bayern Munich (2007–2014), Real Madrid (2014–2024)
Height: 1.83 m (6 ft 0 in)

International: Germany — 114 caps, 17 goals
Major International Trophies: FIFA World Cup 2014 (Germany)
Club Trophies: Real Madrid — 5x Champions League (2016, 2017, 2018, 2022, 2024), 4x La Liga; Bayern Munich — 1x Champions League (2013), 4x Bundesliga
Total Champions League titles as player: 6
Ballon d'Or: Has NEVER won the Ballon d'Or.
Style: Immaculate passing, game control, set-pieces, almost never loses the ball
Known for: 34+ career trophies, retired 2024, 6 Champions League medals, considered best passer ever
`.trim()
  },

  "Diego Maradona": {
    context: `
Name: Diego Armando Maradona
Nationality: Argentine
Date of Birth: October 30, 1960
Date of Death: November 25, 2020 (age 60) — DECEASED
Status: DECEASED (died of cardiac arrest November 25, 2020)
Position: Attacking Midfielder / Second Striker (retired, deceased)
Foot: Left
Career Clubs: Argentinos Juniors, Boca Juniors, Barcelona (1982–1984), Napoli (1984–1991), Sevilla, Newell's Old Boys
Height: 1.65 m (5 ft 5 in)

International: Argentina — 91 caps, 34 goals
Major International Trophies: FIFA World Cup 1986 (Mexico) — led Argentina, named Player of the Tournament; FIFA U-20 World Cup 1979
Club Trophies (Napoli): 2x Serie A (1987, 1990), 1x UEFA Cup (1989), 1x Coppa Italia
Ballon d'Or: WON 1 TIME ONLY — in 1986. He did NOT win multiple Ballon d'Or awards.
FIFA Player of the Century: Joint winner with Pelé (2000)
Famous moments: "Hand of God" goal vs England 1986 World Cup; "Goal of the Century" vs England 1986 — both in same quarter-final match
Known for: GOAT debate with Pelé, Hand of God, 1986 World Cup, Napoli legend, deceased in November 2020
`.trim()
  },
};

/**
 * Canonical guessing pool — the secret player is ALWAYS one of these.
 * These are the most popular, highly-recognisable FIFA / football icons
 * (legends + modern superstars) so the human player has a fair chance.
 * Kept in a stable, human-curated order and embedded into the LLM prompt
 * so the model knows the exact universe of valid answers.
 */
export const GUESSING_POOL = Object.keys(PLAYER_POOL);

/**
 * Returns a random player name from the pool (the secret player).
 */
export function pickRandomPlayer() {
  const names = GUESSING_POOL;
  return names[Math.floor(Math.random() * names.length)];
}

/**
 * Returns the context string for a given player name.
 */
export function getPlayerContext(playerName) {
  return PLAYER_POOL[playerName]?.context || null;
}

/**
 * Normalises a human guess against the pool (lenient: nicknames, partial
 * names, spelling mistakes) so the model only ever compares against the
 * real roster, never free-form text.
 */
export function matchPoolName(guess) {
  const g = guess.trim().toLowerCase();
  if (!g) return null;
  for (const name of GUESSING_POOL) {
    const lower = name.toLowerCase();
    if (lower === g) return name;
    // Partial match on first/last token (e.g. "Messi", "Haaland", "R9")
    const tokens = lower.split(/\s+/);
    if (tokens.some(t => t.length > 2 && g.includes(t))) return name;
  }
  return null;
}

export { PLAYER_POOL };
