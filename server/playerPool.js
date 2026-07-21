/**
 * RAG Knowledge Base — 100% Currently Active FIFA Football Players (Updated: July 2026)
 * Contains ONLY active professional players currently playing for top clubs.
 * Zero retired players, zero coaches, zero ex-players.
 */

const PLAYER_POOL = {
  "Lionel Messi": {
    context: `
Full Name: Lionel Andrés Messi
Common Names / Aliases: Messi, Leo Messi, La Pulga, The GOAT
Nationality: Argentine
Continent: South America
Status: ACTIVE
Date of Birth: June 24, 1987 (age 39 as of July 2026)
Position: Forward / Attacking Midfielder / Playmaker
Position Category: Forward / Midfielder
Preferred Foot: Left
Weak Foot Quality: 4/5 (Extremely competent right foot)
Skill Moves: 4-star skill moves
Height: 1.70 m (5 ft 7 in)
Youth Academy: Newell's Old Boys (1994–2000), FC Barcelona La Masia (2000–2004)
Current Club: Inter Miami CF (MLS, USA) — since July 2023
Previous Clubs: FC Barcelona (2004–2021), Paris Saint-Germain (2021–2023)
Jersey Number: 10
Career Goals: 850+ professional goals across club and international career (All-time Barcelona top scorer with 672 goals)
International Team: Argentina (190+ caps, 109+ goals — Argentina all-time top goalscorer & captain)
Major International Trophies: FIFA World Cup 2022 (Qatar - Golden Ball winner), Copa América 2021 & 2024, Olympic Gold 2008, Finalissima 2022
Major Club Trophies: 10x La Liga, 7x Copa del Rey, 4x UEFA Champions League (2006, 2009, 2011, 2015), 2x Ligue 1, 1x Leagues Cup
Ballon d'Or Count: EXACTLY 8 Ballon d'Or awards (2009, 2010, 2011, 2012, 2015, 2019, 2021, 2023) - All-time world record
Individual Records: Most goals in a calendar year (91 goals in 2012), 6x European Golden Shoe, 8x Pichichi Trophy
Key Attributes: Dribbling maestro, low center of gravity, free-kicks, legendary vision, body feints, 360-degree passing
Signature Celebration: Pointing both index fingers to the sky (dedication to his grandmother Celia)
Famous Matches / Losses: 2022 World Cup Final win vs France (3-3, 4-2 pens), 2011 Champions League Final win vs Man Utd, Barcelona 8-2 Bayern 2020 loss, 2014 World Cup Final loss vs Germany
Known Facts: Grew up in Rosario, Argentina. Joined Barcelona at age 13 after growth hormone treatment. Plays for Inter Miami in MLS.
`.trim()
  },

  "Cristiano Ronaldo": {
    context: `
Full Name: Cristiano Ronaldo dos Santos Aveiro
Common Names / Aliases: Cristiano Ronaldo, CR7, Ronaldo, El Comandante
Nationality: Portuguese
Continent: Europe
Status: ACTIVE
Date of Birth: February 5, 1985 (age 41 as of July 2026)
Position: Forward / Striker / Left Winger
Position Category: Forward
Preferred Foot: Right
Weak Foot Quality: 5/5 (Lethal with both feet)
Skill Moves: 5-star skill moves
Height: 1.87 m (6 ft 1 in)
Youth Academy: Andorinha (1992–1995), Nacional (1995–1997), Sporting CP Academy (1997–2002)
Current Club: Al Nassr FC (Saudi Pro League, Saudi Arabia) — since January 2023
Previous Clubs: Sporting CP (2002–2003), Manchester United (2003–2009, 2021–2022), Real Madrid (2009–2018), Juventus (2018–2021)
Jersey Number: 7
Career Goals: 900+ professional goals — all-time top goalscorer in official football history (Real Madrid all-time top scorer with 450 goals in 438 games)
International Team: Portugal (210+ caps, 135+ goals — all-time top international goalscorer in world history)
Major International Trophies: UEFA Euro 2016 (France), UEFA Nations League 2019
Major Club Trophies: 5x UEFA Champions League (1 Man Utd 2008, 4 Real Madrid 2014, 2016, 2017, 2018), 3x Premier League, 2x La Liga, 2x Serie A
Ballon d'Or Count: EXACTLY 5 Ballon d'Or awards (2008, 2013, 2014, 2016, 2017)
Individual Records: All-time top scorer in UEFA Champions League (140 goals), 4x European Golden Shoe
Key Attributes: Aerial vertical jump (2.93m height), power, sprinting speed, knuckleball free-kicks, penalty dominance
Signature Celebration: Iconic "Siuuu" jump, 180-turn & arm extension to the ground
Famous Matches / Losses: 2016 Euro Final win vs France, 2018 World Cup 3-3 hat-trick vs Spain, 2009 Champions League Final loss vs Barcelona
Known Facts: Born in Funchal, Madeira, Portugal. CR7 global brand. Plays for Al Nassr in Saudi Arabia.
`.trim()
  },

  "Erling Haaland": {
    context: `
Full Name: Erling Braut Haaland
Common Names / Aliases: Erling Haaland, Haaland, The Cyborg, The Viking
Nationality: Norwegian
Continent: Europe
Status: ACTIVE
Date of Birth: July 21, 2000 (age 26 as of July 2026)
Position: Centre Forward / Striker
Position Category: Forward
Preferred Foot: Left
Weak Foot Quality: 4/5
Skill Moves: 3-star skill moves
Height: 1.94 m (6 ft 4 in)
Youth Academy: Bryne FK Youth (2006–2015)
Current Club: Manchester City (Premier League, England) — since July 2022
Previous Clubs: Bryne FK (2015–2017), Molde FK (2017–2019), Red Bull Salzburg (2019–2020), Borussia Dortmund (2020–2022)
Jersey Number: 9
Career Goals: 250+ professional goals
International Team: Norway (35+ caps, 35+ goals — Norway top goalscorer)
Major International Trophies: NONE (Norway has not won major trophies)
Major Club Trophies: 1x UEFA Champions League (2022/23), 2x Premier League, 1x FA Cup — European Treble Winner with Man City in 2023
Ballon d'Or Count: EXACTLY 0 (Zero) Ballon d'Or awards (Runner-up in 2023)
Individual Records: Premier League single-season goal record (36 goals in 2022/23), European Golden Shoe 2023, Gerd Müller Trophy 2023
Key Attributes: Explosive sprint speed (36 km/h), physical power, acrobatic volleying, clinical left-foot finishing
Signature Celebration: Lotus meditation pose on the turf
Famous Matches / Losses: 2023 Champions League Final win vs Inter Milan (Man City Treble), 5 goals in single UCL match vs RB Leipzig (2023)
Known Facts: Born in Leeds, England (father Alfie Haaland played for Man City and Leeds United), but represents Norway.
`.trim()
  },

  "Kylian Mbappé": {
    context: `
Full Name: Kylian Mbappé Lottin
Common Names / Aliases: Kylian Mbappe, Mbappe, Donatello, Kiki
Nationality: French
Continent: Europe
Status: ACTIVE
Date of Birth: December 20, 1998 (age 27 as of July 2026)
Position: Forward / Left Winger / Striker
Position Category: Forward
Preferred Foot: Right
Weak Foot Quality: 4/5
Skill Moves: 5-star skill moves
Height: 1.78 m (5 ft 10 in)
Youth Academy: AS Bondy (2004–2011), INF Clairefontaine (2011–2013), AS Monaco Youth (2013–2015)
Current Club: Real Madrid (La Liga, Spain) — since July 2024 (Free transfer)
Previous Clubs: AS Monaco (2015–2017), Paris Saint-Germain (2017–2024)
Jersey Number: 9 (Real Madrid), 10 (France National Team)
Major International Trophies: FIFA World Cup 2018 (France)
Key Attributes: World-class acceleration, lethal dribbling on counterattacks, right-foot curling shots
Known Facts: Raised in Bondy sub-district of Paris. Joined Real Madrid in summer 2024.
`.trim()
  },

  "Vinicius Junior": {
    context: `
Full Name: Vinicius José Paixão de Oliveira Júnior
Common Names / Aliases: Vinicius Jr, Vini Jr, Vinicius
Nationality: Brazilian
Continent: South America
Status: ACTIVE
Date of Birth: July 12, 2000 (age 26 as of July 2026)
Position: Left Winger / Forward
Position Category: Forward
Preferred Foot: Right
Height: 1.76 m (5 ft 9 in)
Current Club: Real Madrid (La Liga, Spain) — since July 2018
Previous Clubs: Flamengo (2017–2018)
Jersey Number: 7
Career Goals: 150+ professional goals
International Team: Brazil (40+ caps)
Major International Trophies: NONE (Copa América runner-up)
Major Club Trophies: 2x UEFA Champions League (2021/22, 2023/24 - scored in both finals!), 3x La Liga
Ballon d'Or Count: EXACTLY 0 (Zero) Ballon d'Or awards (Finished 2nd in 2024 behind Rodri)
Key Attributes: Electric flair, samba dribbling, acceleration, scoring decisive Champions League final goals
Known Facts: Born in São Gonçalo, Rio de Janeiro. Wears number 7 at Real Madrid. Activist against racism in football.
`.trim()
  },

  "Lamine Yamal": {
    context: `
Full Name: Lamine Yamal Nasraoui Ebana
Common Names / Aliases: Lamine Yamal, Yamal
Nationality: Spanish
Continent: Europe
Status: ACTIVE
Date of Birth: July 13, 2007 (age 19 as of July 2026)
Position: Right Winger / Forward
Position Category: Forward
Preferred Foot: Left
Height: 1.76 m (5 ft 9 in)
Current Club: FC Barcelona (La Liga, Spain) — since youth academy
Jersey Number: 19
Career Goals: 35+ professional goals
International Team: Spain (25+ caps)
Major International Trophies: UEFA Euro 2024 (Germany) — scored iconic curling goal vs France in semi-final
Major Club Trophies: 1x La Liga (2022/23)
Ballon d'Or Count: EXACTLY 0 (Zero) Ballon d'Or awards (Won Kopa Trophy 2024 & Golden Boy 2024 for best young player)
Key Attributes: Precocious left-foot curling shots, 1v1 dribbling from right wing, composure
Known Facts: Raised in Rocafonda, Mataró near Barcelona. Father from Equatorial Guinea, mother from Morocco. Photographed as a baby with Lionel Messi.
`.trim()
  },

  "Jude Bellingham": {
    context: `
Full Name: Jude Victor William Bellingham
Common Names / Aliases: Jude Bellingham, Bellingham
Nationality: English
Continent: Europe
Status: ACTIVE
Date of Birth: June 29, 2003 (age 23 as of July 2026)
Position: Central Midfielder / Attacking Midfielder
Position Category: Midfielder
Preferred Foot: Right
Height: 1.86 m (6 ft 1 in)
Current Club: Real Madrid (La Liga, Spain) — since July 2023
Previous Clubs: Birmingham City (2019–2020), Borussia Dortmund (2020–2023)
Jersey Number: 5 (Real Madrid), 10 (England)
Career Goals: 60+ professional goals
International Team: England (45+ caps)
Major International Trophies: NONE (UEFA Euro runner-up 2021, 2024)
Major Club Trophies: 1x UEFA Champions League (2023/24), 1x La Liga (2023/24), 1x DFB-Pokal
Ballon d'Or Count: EXACTLY 0 (Zero) Ballon d'Or awards (Kopa Trophy 2023 winner)
Key Attributes: Box-to-box dominance, late runs into penalty box, open-arms goal celebration, leadership
Known Facts: Born in Stourbridge, England. Birmingham City retired his shirt number 22 when he was 17. Younger brother Jobe Bellingham is also a footballer.
`.trim()
  },

  "Rodri": {
    context: `
Full Name: Rodrigo Hernández Cascante
Common Names / Aliases: Rodri
Nationality: Spanish
Continent: Europe
Status: ACTIVE
Date of Birth: June 22, 1996 (age 30 as of July 2026)
Position: Defensive Midfielder / Pivot
Position Category: Midfielder
Preferred Foot: Right
Height: 1.91 m (6 ft 3 in)
Current Club: Manchester City (Premier League, England) — since 2019
Previous Clubs: Villarreal (2015–2018), Atlético Madrid (2018–2019)
Jersey Number: 16
Career Goals: 30+ goals (scored winning goal in 2023 Champions League Final vs Inter Milan)
International Team: Spain (55+ caps)
Major International Trophies: UEFA Euro 2024 (Named Player of the Tournament / Golden Ball), UEFA Nations League 2023
Major Club Trophies: 1x UEFA Champions League (2022/23), 4x Premier League, 1x FA Cup
Ballon d'Or Count: EXACTLY 1 Ballon d'Or award (Won 2024 Ballon d'Or)
Key Attributes: Positional intelligence, breaking up opposition plays, precise long passing, long-range strikes
Known Facts: Won 2024 Ballon d'Or. Suffered ACL knee injury in late 2024 and returned for 2025/26 season. Does not have social media accounts.
`.trim()
  },

  "Pedri": {
    context: `
Full Name: Pedro González López
Common Names / Aliases: Pedri
Nationality: Spanish
Continent: Europe
Status: ACTIVE
Date of Birth: November 25, 2002 (age 23 as of July 2026)
Position: Central Midfielder / Playmaker
Position Category: Midfielder
Preferred Foot: Right
Height: 1.74 m (5 ft 8 in)
Current Club: FC Barcelona (La Liga, Spain) — since 2020
Previous Clubs: Las Palmas (2019–2020)
Jersey Number: 8
Career Goals: 25+ professional goals
International Team: Spain (35+ caps)
Major International Trophies: UEFA Euro 2024
Major Club Trophies: 1x La Liga (2022/23), 1x Copa del Rey (2020/21)
Ballon d'Or Count: EXACTLY 0 (Zero) Ballon d'Or awards (Golden Boy 2021, Kopa Trophy 2021)
Key Attributes: Exceptional press-resistance, short 360-degree passing vision, comparison to Andres Iniesta
Known Facts: Born in Tegueste, Tenerife, Canary Islands. Famous for playing 73 matches in a single season in 2020/21.
`.trim()
  },

  "Neymar Jr": {
    context: `
Full Name: Neymar da Silva Santos Júnior
Common Names / Aliases: Neymar Jr, Neymar, Ney
Nationality: Brazilian
Continent: South America
Status: ACTIVE
Date of Birth: February 5, 1992 (age 34 as of July 2026)
Position: Left Winger / Attacking Midfielder / Playmaker
Position Category: Forward / Midfielder
Preferred Foot: Right
Height: 1.75 m (5 ft 9 in)
Current Club: Santos FC (Serie A, Brazil) — returned to boyhood club in 2025/2026
Previous Clubs: Santos FC (2009–2013), FC Barcelona (2013–2017), Paris Saint-Germain (2017–2023), Al Hilal (2023–2025)
Jersey Number: 10
Career Goals: 440+ professional goals
International Team: Brazil (128 caps, 79 goals — Brazil all-time top goalscorer ahead of Pelé)
Major International Trophies: Olympic Gold 2016 (Rio de Janeiro), FIFA Confederations Cup 2013
Major Club Trophies: 1x UEFA Champions League (Barcelona 2014/15 - MSN treble), 1x Copa Libertadores (Santos 2011), 2x La Liga, 5x Ligue 1
World Record Transfer: €222 million transfer fee from Barcelona to PSG in August 2017 (most expensive transfer in football history)
Ballon d'Or Count: EXACTLY 0 (Zero) Ballon d'Or awards (Finished 3rd in 2015 and 2017)
Key Attributes: Rainbow flicks, sombreros, ultimate 1v1 dribbler, set-piece specialist
Famous Matches / Losses: 7-1 World Cup 2014 semifinal loss vs Germany (Brazil famously lost), La Remontada 6-1 vs PSG (2017), 2015 UEFA Champions League Final victory with Barcelona
Known Facts: Brazil all-time top goalscorer with 79 goals. Scored in 2015 UCL Final. Played for Santos, Barcelona, PSG, Al Hilal.
`.trim()
  },

  "Kevin De Bruyne": {
    context: `
Full Name: Kevin De Bruyne
Common Names / Aliases: De Bruyne, KDB
Nationality: Belgian
Continent: Europe
Status: ACTIVE
Date of Birth: June 28, 1991 (age 35 as of July 2026)
Position: Central Midfielder / Attacking Midfielder
Position Category: Midfielder
Preferred Foot: Right (two-footed long passer)
Height: 1.81 m (5 ft 11 in)
Current Club: SSC Napoli (Serie A, Italy) — since July 2025
Previous Clubs: Genk (2008–2012), Chelsea (2012–2014), VfL Wolfsburg (2014–2015), Manchester City (2015–2025)
Jersey Number: 17
Career Goals: 150+ professional goals & 300+ career assists
International Team: Belgium (105+ caps)
Major International Trophies: NONE (3rd place at 2018 World Cup with Belgium Golden Generation)
Major Club Trophies: 1x UEFA Champions League (Man City 2022/23), 6x Premier League, 2x FA Cup, 1x DFB-Pokal
Ballon d'Or Count: EXACTLY 0 (Zero) Ballon d'Or awards (Finished 3rd in 2022)
Individual Awards: 2x PFA Players' Player of the Year (2020, 2021), 3x Premier League Playmaker of the Season
Key Attributes: Laser-guided whip crosses, through-balls with millimeter precision, long-range thunderbolts
Known Facts: Spent 10 trophy-filled years at Man City before joining Napoli in 2025.
`.trim()
  },

  "Mohamed Salah": {
    context: `
Full Name: Mohamed Salah Ghaly
Common Names / Aliases: Mohamed Salah, Mo Salah, The Egyptian King
Nationality: Egyptian
Continent: Africa
Status: ACTIVE
Date of Birth: June 15, 1992 (age 34 as of July 2026)
Position: Right Winger / Forward
Position Category: Forward
Preferred Foot: Left
Height: 1.75 m (5 ft 9 in)
Current Club: Beşiktaş (Süper Lig, Turkey) — agreed 2026 summer move after Liverpool contract ended
Previous Clubs: El Mokawloon (2010–2012), FC Basel (2012–2014), Chelsea (2014–2015), Fiorentina (2015), AS Roma (2015–2017), Liverpool (2017–2026)
Jersey Number: 11
Career Goals: 330+ professional goals (210+ goals for Liverpool)
International Team: Egypt (100+ caps, 55+ goals — Egypt all-time top goalscorer)
Major International Trophies: NONE (2x Africa Cup of Nations runner-up 2017, 2021)
Major Club Trophies: 1x UEFA Champions League (Liverpool 2018/19), 1x Premier League (2019/20), 1x FA Cup, 1x FIFA Club World Cup
Ballon d'Or Count: EXACTLY 0 (Zero) Ballon d'Or awards
Golden Shoes: 3x Premier League Golden Boot (2017/18, 2018/19, 2021/22)
Key Attributes: Cutting inside from right wing onto left foot, lightning pace, upper-body strength
Known Facts: Holds Premier League 38-game season goal record for wingers (32 goals in 2017/18). National icon in Egypt.
`.trim()
  },

  "Robert Lewandowski": {
    context: `
Full Name: Robert Lewandowski
Common Names / Aliases: Lewandowski, Lewy
Nationality: Polish
Continent: Europe
Status: ACTIVE
Date of Birth: August 21, 1988 (age 37 as of July 2026)
Position: Centre Forward / Striker
Position Category: Forward
Preferred Foot: Right
Height: 1.85 m (6 ft 1 in)
Current Club: Chicago Fire FC (MLS, USA) — joined summer 2026
Previous Clubs: Znicz Pruszków, Lech Poznań (2008–2010), Borussia Dortmund (2010–2014), Bayern Munich (2014–2022), FC Barcelona (2022–2026)
Jersey Number: 9
Career Goals: 650+ professional goals (344 goals for Bayern Munich)
International Team: Poland (150+ caps, 82+ goals — Poland all-time top goalscorer)
Major International Trophies: NONE
Major Club Trophies: 1x UEFA Champions League (Bayern Munich 2019/20 - Treble), 10x Bundesliga (8 Bayern, 2 Dortmund), 1x La Liga (Barcelona 2022/23)
Bundesliga Single-Season Record: Scored 41 goals in 2020/21 season (surpassing Gerd Müller's 40-goal record)
Ballon d'Or Count: EXACTLY 0 official (2020 ceremony cancelled due to COVID when he was clear favorite; 2nd in 2021 behind Messi)
Individual Awards: 2x FIFA Best Men's Player (2020, 2021), 2x European Golden Shoe (2021, 2022)
Key Attributes: Athletic volume scoring, penalty perfection, back-to-goal hold-up play
`.trim()
  },

  "Manuel Neuer": {
    context: `
Full Name: Manuel Peter Neuer
Common Names / Aliases: Manuel Neuer, Neuer
Nationality: German
Continent: Europe
Status: ACTIVE
Date of Birth: March 27, 1986 (age 40 as of July 2026)
Position: Goalkeeper
Position Category: Goalkeeper
Preferred Foot: Right (excellent with left)
Height: 1.93 m (6 ft 4 in)
Current Club: Bayern Munich (Bundesliga, Germany) — since 2011
Previous Clubs: Schalke 04 (2006–2011)
Jersey Number: 1
Career Goals: 0 (Goalkeeper)
International Team: Germany (124 caps)
Major International Trophies: FIFA World Cup 2014 (Brazil - Golden Glove winner)
Major Club Trophies: 2x UEFA Champions League (Bayern Munich 2012/13, 2019/20 - both Trebles), 11x Bundesliga, 6x DFB-Pokal
Ballon d'Or Count: EXACTLY 0 (Zero) Ballon d'Or awards (Finished 3rd in 2014 behind Ronaldo & Messi)
Key Attributes: Modern "sweeper-keeper" pioneer, rushing out outside penalty box, giant arm-spread saves, long throw starts
Known Facts: Revolutionized modern goalkeeping playstyle. Active at Bayern Munich.
`.trim()
  },

  "Luka Modrić": {
    context: `
Full Name: Luka Modrić
Common Names / Aliases: Luka Modric, Modric
Nationality: Croatian
Continent: Europe
Status: ACTIVE
Date of Birth: September 9, 1985 (age 40 as of July 2026)
Position: Central Midfielder / Playmaker
Position Category: Midfielder
Preferred Foot: Right (master of outside-of-foot trivela pass)
Height: 1.72 m (5 ft 8 in)
Current Club: Real Madrid (La Liga, Spain) — since August 2012
Previous Clubs: Dinamo Zagreb (2003–2008), Zrinjski Mostar (loan), Inter Zaprešić (loan), Tottenham Hotspur (2008–2012)
Jersey Number: 10 (Real Madrid, Croatia)
Career Goals: 80+ goals & 160+ assists
International Team: Croatia (178+ caps — all-time record for Croatia)
Major International Trophies: FIFA World Cup 2018 Runner-up (Golden Ball winner), 2022 3rd Place
Major Club Trophies: 6x UEFA Champions League (Real Madrid 2014, 2016, 2017, 2018, 2022, 2024), 4x La Liga, 2x Copa del Rey
Ballon d'Or Count: EXACTLY 1 Ballon d'Or award (Won 2018 Ballon d'Or, breaking Messi-Ronaldo 10-year duopoly)
Key Attributes: Outside-of-foot trivela passes, press evasion, endless stamina late into matches
Known Facts: Fled war as a child refugee in Zadar, Croatia. Oldest outfield active player in Real Madrid history.
`.trim()
  },

  "Karim Benzema": {
    context: `
Full Name: Karim Mostafa Benzema
Common Names / Aliases: Karim Benzema, Benzema, KB9
Nationality: French
Continent: Europe
Status: ACTIVE
Date of Birth: December 19, 1987 (age 38 as of July 2026)
Position: Centre Forward / Striker
Position Category: Forward
Preferred Foot: Right
Height: 1.85 m (6 ft 1 in)
Current Club: Al Ittihad (Saudi Pro League, Saudi Arabia) — since July 2023
Previous Clubs: Olympique Lyonnais (2004–2009), Real Madrid (2009–2023)
Jersey Number: 9
Career Goals: 450+ professional goals (354 goals for Real Madrid - 2nd all-time scorer behind Cristiano Ronaldo)
International Team: France (97 caps, 37 goals)
Major International Trophies: UEFA Nations League 2021
Major Club Trophies: 5x UEFA Champions League (Real Madrid 2014, 2016, 2017, 2018, 2022), 4x La Liga, 4x Ligue 1 (Lyon)
Ballon d'Or Count: EXACTLY 1 Ballon d'Or award (Won 2022 Ballon d'Or after iconic 15-goal Champions League run)
Key Attributes: Link-up play with wingers, bandage on right hand, unselfish assist creation, clutch knock-out round hat-tricks
`.trim()
  },

  "Harry Kane": {
    context: `
Full Name: Harry Edward Kane
Common Names / Aliases: Harry Kane, Kane
Nationality: English
Continent: Europe
Status: ACTIVE
Date of Birth: July 28, 1993 (age 33 as of July 2026)
Position: Centre Forward / Striker / Playmaking Striker
Position Category: Forward
Preferred Foot: Right
Height: 1.88 m (6 ft 2 in)
Current Club: Bayern Munich (Bundesliga, Germany) — since August 2023
Previous Clubs: Tottenham Hotspur (2009–2023), Leyton Orient (loan), Millwall (loan), Norwich (loan), Leicester (loan)
Jersey Number: 9
Career Goals: 400+ professional goals
International Team: England (100+ caps, 68+ goals — England all-time top goalscorer)
Major International Trophies: NONE (UEFA Euro runner-up 2021, 2024; World Cup 2018 Golden Boot)
Major Club Trophies: 1x Bundesliga (Bayern Munich), 1x DFL-Supercup
Ballon d'Or Count: EXACTLY 0 (Zero) Ballon d'Or awards
Golden Shoes: European Golden Shoe 2023/24 (36 Bundesliga goals in debut season), 3x Premier League Golden Boot
Key Attributes: Dropping deep to play long diagonal passes, lethal penalty accuracy, physical header finishing
Known Facts: Tottenham Hotspur all-time top goalscorer (280 goals). Active at Bayern Munich.
`.trim()
  },

  "Antoine Griezmann": {
    context: `
Full Name: Antoine Griezmann
Common Names / Aliases: Antoine Griezmann, Griezmann, Grizou
Nationality: French
Continent: Europe
Status: ACTIVE
Date of Birth: March 21, 1991 (age 35 as of July 2026)
Position: Second Striker / Attacking Midfielder
Position Category: Forward / Midfielder
Preferred Foot: Left
Height: 1.76 m (5 ft 9 in)
Current Club: Atlético Madrid (La Liga, Spain) — since 2021 (previously 2014–2019)
Previous Clubs: Real Sociedad (2009–2014), Atlético Madrid (2014–2019, 2021–present), FC Barcelona (2019–2021)
Jersey Number: 7
Career Goals: 300+ professional goals (Atlético Madrid all-time top goalscorer)
International Team: France (137 caps, 44 goals)
Major International Trophies: FIFA World Cup 2018 (Bronze Ball & Silver Boot), UEFA Nations League 2021
Major Club Trophies: 1x UEFA Europa League (Atlético Madrid 2017/18), 1x Copa del Rey (Barcelona 2020/21)
Ballon d'Or Count: EXACTLY 0 (Zero) Ballon d'Or awards (Finished 3rd in 2016 and 2018)
Key Attributes: Relentless defensive work rate, left-foot set pieces, Fortnite / Hotline Bling celebrations
`.trim()
  },

  "Virgil van Dijk": {
    context: `
Full Name: Virgil van Dijk
Common Names / Aliases: Virgil van Dijk, Van Dijk, VVD
Nationality: Dutch
Continent: Europe
Status: ACTIVE
Date of Birth: July 8, 1991 (age 35 as of July 2026)
Position: Centre Back / Defender
Position Category: Defender
Preferred Foot: Right
Height: 1.95 m (6 ft 5 in)
Current Club: Liverpool (Premier League, England) — since January 2018
Previous Clubs: FC Groningen (2011–2013), Celtic (2013–2015), Southampton (2015–2018)
Jersey Number: 4
Career Goals: 30+ goals (head goals from corner kicks)
International Team: Netherlands (75+ caps - Captain)
Major International Trophies: NONE (UEFA Nations League runner-up 2019)
Major Club Trophies: 1x UEFA Champions League (Liverpool 2018/19), 1x Premier League (2019/20), 1x FA Cup, 1x FIFA Club World Cup
Ballon d'Or Count: EXACTLY 0 (Zero) Ballon d'Or awards (Finished 2nd in 2019 behind Lionel Messi by just 7 votes)
Individual Awards: UEFA Men's Player of the Year 2019, Premier League Player of the Season 2018/19
Key Attributes: Unbeatable 1v1 defensive aerial duels, calm leadership, long diagonal switches of play
`.trim()
  },

  "Lautaro Martínez": {
    context: `
Full Name: Lautaro Javier Martínez
Common Names / Aliases: Lautaro Martínez, Lautaro, El Toro
Nationality: Argentine
Continent: South America
Status: ACTIVE
Date of Birth: August 22, 1997 (age 28 as of July 2026)
Position: Centre Forward / Striker
Position Category: Forward
Preferred Foot: Right
Height: 1.74 m (5 ft 9 in)
Current Club: Inter Milan (Serie A, Italy) — since 2018 (Captain)
Previous Clubs: Racing Club (2015–2018)
Jersey Number: 10
Career Goals: 170+ professional goals
International Team: Argentina (65+ caps, 30+ goals)
Major International Trophies: FIFA World Cup 2022 (Qatar), 2x Copa América (2021, 2024 - Golden Boot winner in 2024 with 5 goals including extra-time final winner)
Major Club Trophies: 2x Serie A (Inter Milan 2020/21, 2023/24 - Capocannoniere top scorer 2023/24), 2x Coppa Italia, Champions League runner-up 2023
Ballon d'Or Count: EXACTLY 0 (Zero) Ballon d'Or awards (Finished 7th in 2024)
Key Attributes: Aggressive pressing ("El Toro" / The Bull), volley finishing, sharp penalty box movement
`.trim()
  },

  "Bukayo Saka": {
    context: `
Full Name: Bukayo Ayoyinka Temidayo Saka
Common Names / Aliases: Bukayo Saka, Saka, Starboy
Nationality: English
Continent: Europe
Status: ACTIVE
Date of Birth: September 5, 2001 (age 24 as of July 2026)
Position: Right Winger / Forward
Position Category: Forward
Preferred Foot: Left
Height: 1.78 m (5 ft 10 in)
Current Club: Arsenal (Premier League, England) — since Hale End youth academy
Jersey Number: 7
Career Goals: 70+ goals & 60+ assists for Arsenal
International Team: England (45+ caps)
Major International Trophies: NONE (UEFA Euro runner-up 2021, 2024)
Major Club Trophies: 1x FA Cup (Arsenal 2019/20), 2x FA Community Shield
Ballon d'Or Count: EXACTLY 0 (Zero) Ballon d'Or awards
Key Attributes: Cutting in from right flank onto left foot, low center of gravity dribbling, high durability
Known Facts: Born in Ealing, London to Nigerian parents. Graduated from Arsenal's Hale End academy. Nicknamed "Starboy".
`.trim()
  },

  "Phil Foden": {
    context: `
Full Name: Philip Walter Foden
Common Names / Aliases: Phil Foden, Foden, The Stockport Iniesta
Nationality: English
Continent: Europe
Status: ACTIVE
Date of Birth: May 28, 2000 (age 26 as of July 2026)
Position: Attacking Midfielder / Left Winger / Right Winger
Position Category: Midfielder / Forward
Preferred Foot: Left
Height: 1.71 m (5 ft 7 in)
Current Club: Manchester City (Premier League, England) — since youth academy
Jersey Number: 47
Career Goals: 90+ goals for Manchester City
International Team: England (45+ caps)
Major International Trophies: NONE (U-17 World Cup 2017 Golden Ball winner)
Major Club Trophies: 1x UEFA Champions League (2022/23 Treble), 6x Premier League, 2x FA Cup
Ballon d'Or Count: EXACTLY 0 (Zero) Ballon d'Or awards
Individual Awards: PFA Players' Player of the Year 2023/24, Premier League Player of the Season 2023/24
Key Attributes: Close ball control in tight half-spaces, left-foot driving shots into top corner, quick turning radius
Known Facts: Wears shirt number 47 in honor of his late grandfather Ronnie who passed away at age 47. Born in Stockport.
`.trim()
  },

  "Son Heung-min": {
    context: `
Full Name: Son Heung-min (손흥민)
Common Names / Aliases: Son Heung-min, Son, Sonny
Nationality: South Korean
Continent: Asia
Status: ACTIVE
Date of Birth: July 8, 1992 (age 34 as of July 2026)
Position: Left Winger / Forward / Striker
Position Category: Forward
Preferred Foot: Both (Completely two-footed with equal power & precision on right and left)
Height: 1.83 m (6 ft 0 in)
Current Club: Tottenham Hotspur (Premier League, England) — since August 2015 (Captain)
Previous Clubs: Hamburger SV (2010–2013), Bayer Leverkusen (2013–2015)
Jersey Number: 7
Career Goals: 220+ professional goals (160+ goals for Tottenham)
International Team: South Korea (130+ caps, 48+ goals — Captain)
Major International Trophies: Asian Games Gold Medal 2018 (Jakarta - earned military service exemption)
Major Club Trophies: Champions League runner-up 2019
Ballon d'Or Count: EXACTLY 0 (Zero) Ballon d'Or awards (11th place in 2022 - highest ever for Asian player)
Individual Awards: FIFA Puskás Award 2020 (70-meter solo goal vs Burnley), Premier League Golden Boot 2021/22 (23 goals)
Key Attributes: Completely two-footed curling finishes from outside penalty box, blistering counterattack speed
`.trim()
  },

  "Bruno Fernandes": {
    context: `
Full Name: Bruno Miguel Borges Fernandes
Common Names / Aliases: Bruno Fernandes, Bruno
Nationality: Portuguese
Continent: Europe
Status: ACTIVE
Date of Birth: September 8, 1994 (age 31 as of July 2026)
Position: Attacking Midfielder / Playmaker
Position Category: Midfielder
Preferred Foot: Right
Height: 1.79 m (5 ft 10 in)
Current Club: Manchester United (Premier League, England) — since January 2020 (Captain)
Previous Clubs: Novara (2012–2013), Udinese (2013–2016), Sampdoria (2016–2017), Sporting CP (2017–2020)
Jersey Number: 8
Career Goals: 160+ professional goals & 140+ assists
International Team: Portugal (75+ caps)
Major International Trophies: UEFA Nations League 2019
Major Club Trophies: 1x FA Cup (Man Utd 2023/24), 1x EFL Cup (2022/23), 1x Taça de Portugal (Sporting)
Ballon d'Or Count: EXACTLY 0 (Zero) Ballon d'Or awards
Key Attributes: High volume chance creation, skip-step penalty technique, risk-taking killer passes
`.trim()
  },

  "Jamal Musiala": {
    context: `
Full Name: Jamal Musiala
Common Names / Aliases: Jamal Musiala, Musiala, Bambi
Nationality: German
Continent: Europe
Status: ACTIVE
Date of Birth: February 26, 2003 (age 23 as of July 2026)
Position: Attacking Midfielder / Left Winger
Position Category: Midfielder / Forward
Preferred Foot: Right
Height: 1.84 m (6 ft 0 in)
Current Club: Bayern Munich (Bundesliga, Germany) — since youth system
Previous Clubs: Southampton, Chelsea (youth academy)
Jersey Number: 42
Career Goals: 60+ goals & 40+ assists for Bayern Munich
International Team: Germany (40+ caps)
Major International Trophies: NONE (UEFA Euro 2024 joint top scorer with 3 goals)
Major Club Trophies: 1x UEFA Champions League (Bayern Munich 2019/20 Treble), 4x Bundesliga (scored Title-winning 89th minute goal vs Cologne in 2023)
Ballon d'Or Count: EXACTLY 0 (Zero) Ballon d'Or awards (Kopa Trophy 2nd place)
Key Attributes: "Bambi" snake-like dribbling through crowded penalty boxes, close touch control, right-foot curling finish
Known Facts: Represented England at youth level before choosing Germany senior national team.
`.trim()
  },

  "Florian Wirtz": {
    context: `
Full Name: Florian Richard Wirtz
Common Names / Aliases: Florian Wirtz, Wirtz
Nationality: German
Continent: Europe
Status: ACTIVE
Date of Birth: May 3, 2003 (age 23 as of July 2026)
Position: Attacking Midfielder / Playmaker
Position Category: Midfielder
Preferred Foot: Right
Height: 1.76 m (5 ft 9 in)
Current Club: Bayer Leverkusen (Bundesliga, Germany) — since 2020
Previous Clubs: 1. FC Köln (youth)
Jersey Number: 10
Career Goals: 55+ goals & 60+ assists for Bayer Leverkusen
International Team: Germany (30+ caps)
Major International Trophies: NONE
Major Club Trophies: 1x Bundesliga (Bayer Leverkusen 2023/24 - historic unbeaten domestic double under Xabi Alonso), 1x DFB-Pokal
Ballon d'Or Count: EXACTLY 0 (Zero) Ballon d'Or awards
Individual Awards: Bundesliga Player of the Season 2023/24
Key Attributes: Fastest goal in international history (7 seconds vs France in 2024), visionary key passes, hat-trick on title clinching match
`.trim()
  },

  "Federico Valverde": {
    context: `
Full Name: Federico Santiago Valverde Dipetta
Common Names / Aliases: Federico Valverde, Fede Valverde, Valverde, El Pajarito
Nationality: Uruguayan
Continent: South America
Status: ACTIVE
Date of Birth: July 22, 1998 (age 28 as of July 2026)
Position: Central Midfielder / Right Midfielder
Position Category: Midfielder
Preferred Foot: Right
Height: 1.82 m (6 ft 0 in)
Current Club: Real Madrid (La Liga, Spain) — since 2016
Previous Clubs: Peñarol (2015–2016), Deportivo La Coruña (loan)
Jersey Number: 8 (Real Madrid), 15 (Uruguay)
Career Goals: 35+ professional goals (famous for long-range cannon strikes)
International Team: Uruguay (65+ caps)
Major International Trophies: NONE (Copa América 3rd place 2024)
Major Club Trophies: 2x UEFA Champions League (Real Madrid 2021/22, 2023/24 - provided winning assist to Vinicius Jr in 2022 final), 3x La Liga
Ballon d'Or Count: EXACTLY 0 (Zero) Ballon d'Or awards
Key Attributes: Unstoppable long-distance shooting power ("Halcon"), unlimited engine stamina, tactical versatility
`.trim()
  },

  "Cole Palmer": {
    context: `
Full Name: Cole Jermaine Palmer
Common Names / Aliases: Cole Palmer, Palmer, Cold Palmer
Nationality: English
Continent: Europe
Status: ACTIVE
Date of Birth: May 6, 2002 (age 24 as of July 2026)
Position: Attacking Midfielder / Right Winger
Position Category: Midfielder / Forward
Preferred Foot: Left
Height: 1.89 m (6 ft 2 in)
Current Club: Chelsea (Premier League, England) — since August 2023
Previous Clubs: Manchester City (2020–2023)
Jersey Number: 20
Career Goals: 45+ goals & 25+ assists across two Chelsea seasons
International Team: England (20+ caps — scored in UEFA Euro 2024 Final vs Spain)
Major International Trophies: NONE (UEFA Euro runner-up 2024)
Major Club Trophies: 1x UEFA Champions League (Man City 2022/23), 1x Premier League (Man City)
Ballon d'Or Count: EXACTLY 0 (Zero) Ballon d'Or awards
Individual Awards: PFA Young Player of the Year 2023/24, Premier League Young Player of the Season
Key Attributes: Shivering "Cold Palmer" rubbing-arms goal celebration, ice-cold composure under pressure, penalty perfection
`.trim()
  },

  "Julián Álvarez": {
    context: `
Full Name: Julián Álvarez
Common Names / Aliases: Julián Álvarez, Alvarez, La Araña (The Spider)
Nationality: Argentine
Continent: South America
Status: ACTIVE
Date of Birth: January 31, 2000 (age 26 as of July 2026)
Position: Centre Forward / Second Striker
Position Category: Forward
Preferred Foot: Right
Height: 1.70 m (5 ft 7 in)
Current Club: Atlético Madrid (La Liga, Spain) — since August 2024
Previous Clubs: River Plate (2018–2022), Manchester City (2022–2024)
Jersey Number: 19
Career Goals: 110+ professional goals
International Team: Argentina (40+ caps, 10+ goals)
Major International Trophies: FIFA World Cup 2022 (Qatar - scored 4 goals in World Cup), 2x Copa América (2021, 2024)
Major Club Trophies: 1x UEFA Champions League (Man City 2022/23 Treble), 2x Premier League, 1x Copa Libertadores (River Plate 2018) - ONLY player in history to win World Cup, Copa Libertadores, Champions League, and Copa América!
Ballon d'Or Count: EXACTLY 0 (Zero) Ballon d'Or awards (Finished 7th in 2023)
Key Attributes: Spider-Man celebration, relentless front-line pressing, two-touch finishing
`.trim()
  },

  "William Saliba": {
    context: `
Full Name: William Alain André Gabriel Saliba
Common Names / Aliases: William Saliba, Saliba, Wilo
Nationality: French
Continent: Europe
Status: ACTIVE
Date of Birth: March 24, 2001 (age 25 as of July 2026)
Position: Centre Back / Defender
Position Category: Defender
Preferred Foot: Right
Height: 1.92 m (6 ft 4 in)
Current Club: Arsenal (Premier League, England) — since 2019 (loans at Saint-Étienne, Nice, Marseille)
Previous Clubs: Saint-Étienne (2018–2020), OGC Nice (2021 loan), Olympique de Marseille (2021–2022 loan)
Jersey Number: 2
Career Goals: 10+ goals
International Team: France (25+ caps)
Major International Trophies: NONE (UEFA Euro 2024 semi-finalist - Team of the Tournament)
Major Club Trophies: 2x FA Community Shield (Arsenal 2020, 2023)
Ballon d'Or Count: EXACTLY 0 (Zero) Ballon d'Or awards
Individual Awards: 2x PFA Premier League Team of the Year (2022/23, 2023/24), Ligue 1 Young Player of the Year 2021/22
Key Attributes: "Do do do do do do do Saliba" chant, calm 1v1 jockeying defense, roll-out passing from back
`.trim()
  },

  "Achraf Hakimi": {
    context: `
Full Name: Achraf Hakimi Mouh
Common Names / Aliases: Achraf Hakimi, Hakimi
Nationality: Moroccan
Continent: Africa
Status: ACTIVE
Date of Birth: November 4, 1998 (age 27 as of July 2026)
Position: Right Back / Right Wing Back / Defender
Position Category: Defender
Preferred Foot: Right
Height: 1.81 m (5 ft 11 in)
Current Club: Paris Saint-Germain (Ligue 1, France) — since July 2021
Previous Clubs: Real Madrid (2017–2018), Borussia Dortmund (2018–2020 loan), Inter Milan (2020–2021)
Jersey Number: 2
Career Goals: 40+ goals & 60+ assists from right back
International Team: Morocco (75+ caps — led Morocco to historic 2022 World Cup semi-finals, 1st African country ever)
Major International Trophies: NONE (FIFA World Cup 4th place 2022)
Major Club Trophies: 1x UEFA Champions League (Real Madrid 2017/18), 1x Serie A (Inter Milan 2020/21), 3x Ligue 1 (PSG)
Ballon d'Or Count: EXACTLY 0 (Zero) Ballon d'Or awards
Key Attributes: Panenka penalty vs Spain in 2022 World Cup, penguin dance celebration, overlap speed on right flank
`.trim()
  },

  "Thibaut Courtois": {
    context: `
Full Name: Thibaut Nicolas Marc Courtois
Common Names / Aliases: Thibaut Courtois, Courtois
Nationality: Belgian
Continent: Europe
Status: ACTIVE
Date of Birth: May 11, 1992 (age 34 as of July 2026)
Position: Goalkeeper
Position Category: Goalkeeper
Preferred Foot: Left (kicking foot)
Height: 2.00 m (6 ft 7 in)
Current Club: Real Madrid (La Liga, Spain) — since August 2018
Previous Clubs: Genk (2009–2011), Atlético Madrid (2011–2014 loan), Chelsea (2014–2018)
Jersey Number: 1
Career Goals: 0 (Goalkeeper)
International Team: Belgium (102 caps — 2018 World Cup Golden Glove winner)
Major International Trophies: NONE (3rd place 2018 World Cup)
Major Club Trophies: 2x UEFA Champions League (Real Madrid 2021/22 - Man of Match with 9 saves vs Liverpool in final, 2023/24), 3x La Liga, 2x Premier League (Chelsea)
Ballon d'Or Count: EXACTLY 0 (Zero) Ballon d'Or awards (Yashin Trophy 2022 winner)
Key Attributes: 2-meter giant height, impossible reaction saves on low shots, command of penalty area
`.trim()
  },

  "Alisson Becker": {
    context: `
Full Name: Alisson Ramses Becker
Common Names / Aliases: Alisson Becker, Alisson
Nationality: Brazilian
Continent: South America
Status: ACTIVE
Date of Birth: October 2, 1992 (age 33 as of July 2026)
Position: Goalkeeper
Position Category: Goalkeeper
Preferred Foot: Right
Height: 1.93 m (6 ft 4 in)
Current Club: Liverpool (Premier League, England) — since July 2018
Previous Clubs: Internacional (2013–2016), AS Roma (2016–2018)
Jersey Number: 1
Career Goals: 1 goal (iconic 95th-minute header goal vs West Bromwich Albion in May 2021!)
International Team: Brazil (70+ caps)
Major International Trophies: Copa América 2019 (Brazil - Golden Glove winner)
Major Club Trophies: 1x UEFA Champions League (Liverpool 2018/19), 1x Premier League (2019/20), 1x FA Cup, 1x FIFA Club World Cup
Ballon d'Or Count: EXACTLY 0 (Zero) Ballon d'Or awards (Inaugural Yashin Trophy winner 2019, 7th in 2019 Ballon d'Or)
Key Attributes: 1v1 smothering stance, header goal scorer, quick side-arm counter-attack distributions
`.trim()
  },

  "Martin Ødegaard": {
    context: `
Full Name: Martin Ødegaard
Common Names / Aliases: Martin Odegaard, Odegaard
Nationality: Norwegian
Continent: Europe
Status: ACTIVE
Date of Birth: December 17, 1998 (age 27 as of July 2026)
Position: Central Midfielder / Playmaker / Captain
Position Category: Midfielder
Preferred Foot: Left
Height: 1.78 m (5 ft 10 in)
Current Club: Arsenal (Premier League, England) — since 2021 (Captain)
Previous Clubs: Strømsgodset (2014), Real Madrid (2015–2021), Heerenveen (loan), Vitesse (loan), Real Sociedad (2019–2020 loan)
Jersey Number: 8
Career Goals: 55+ goals & 50+ assists for Arsenal
International Team: Norway (60+ caps — Captain)
Major International Trophies: NONE
Major Club Trophies: 1x Copa del Rey (Real Sociedad 2019/20), 2x FA Community Shield (Arsenal)
Ballon d'Or Count: EXACTLY 0 (Zero) Ballon d'Or awards
Key Attributes: Press-triggering captain leadership, left-foot disguised eye-of-a-needle through-balls, youngest player in Real Madrid history
`.trim()
  },

  "Khvicha Kvaratskhelia": {
    context: `
Full Name: Khvicha Kvaratskhelia (ხვიჩა კვარაცხელია)
Common Names / Aliases: Khvicha Kvaratskhelia, Kvaratskhelia, Kvara, Kvaradona
Nationality: Georgian
Continent: Europe
Status: ACTIVE
Date of Birth: February 12, 2001 (age 25 as of July 2026)
Position: Left Winger / Attacking Forward
Position Category: Forward
Preferred Foot: Right (equally lethal with left)
Height: 1.83 m (6 ft 0 in)
Current Club: Paris Saint-Germain (Ligue 1, France) — joined 2025/2026
Previous Clubs: Dinamo Tbilisi, Rustavi, Lokomotiv Moscow, Rubin Kazan, Dinamo Batumi, SSC Napoli (2022–2025)
Jersey Number: 77
Career Goals: 60+ goals & 50+ assists
International Team: Georgia (35+ caps — led Georgia to historic Euro 2024 knockout round)
Major International Trophies: NONE
Major Club Trophies: 1x Serie A (SSC Napoli 2022/23 - historic first scudetto for Napoli in 33 years since Maradona)
Ballon d'Or Count: EXACTLY 0 (Zero) Ballon d'Or awards (17th in 2023)
Individual Awards: Serie A Most Valuable Player 2022/23, UEFA Champions League Young Player of the Season 2022/23
Key Attributes: Nicknamed "Kvaradona" in Naples, direct 1v1 dribbling from left wing, unpredictable two-footed cutting
`.trim()
  }
};

/**
 * Returns a random player name from the pool.
 */
export function pickRandomPlayer() {
  const names = Object.keys(PLAYER_POOL);
  return names[Math.floor(Math.random() * names.length)];
}

/**
 * Returns the context string for a given player name.
 */
export function getPlayerContext(playerName) {
  return PLAYER_POOL[playerName]?.context || null;
}

export { PLAYER_POOL };
