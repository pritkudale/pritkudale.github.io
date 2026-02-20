// Dangerous Dave - Level Data
// Tile Legend:
//   . = empty       B = brick (red)     W = blue wall    P = platform
//   G = gray brick  U = purple wall     S = spike
//   ~ = water       F = fire            D = door (visual)
//
// Item Legend:
//   d = diamond (100pts)   r = ring (200pts)    c = crown (300pts)
//   t = trophy (500pts)    g = gun pickup       j = jetpack
//   l = extra life         k = key (needed for door)
//
// Enemy Legend:
//   1 = spider     2 = snake    3 = fireball   4 = bat
//
// Special:
//   @ = Dave start   X = door exit (walk here with key)

const Levels = (() => {

    const levels = [
        // ===== LEVEL 1 - Introduction =====
        {
            name: "LEVEL 1",
            map: [
                '............................................................',
                '............................................................',
                '...........d.........d..........d..........c................',
                '..........BBB......BBBBB......BBBBB......BBB...............',
                '............................................................',
                '......d.........d....................d.........r.............',
                '.....BBB......BBB..................BBB......BBBBB...........',
                '..@.......................................................X.',
                '.BBB.....d........d........d..........d........k.......DBBB.',
                '.........BBB....BBB......BBBBB......BBBBB...BBBBB....BBBBB.',
                '............................................................',
                '..1.......................................2.................',
                'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
            ],
        },
        // ===== LEVEL 2 - Higher Ground =====
        {
            name: "LEVEL 2",
            map: [
                '............................................................',
                '............................................................',
                '..........d........r.........d.........c.........t..........',
                '.........BBB......BBB......BBBBB.....BBB......BBB..........',
                '............................................................',
                '...d...........d...........d..............d.................',
                '..BBB.........BBB........BBBBB..........BBB........d.......',
                '..............................................BBB..BBB......',
                '.@.......d.........d...........d.........k.........X.......',
                '.BB.....BBB.......BBB.........BBB......BBBBB.....DBBB.....',
                '............................................................',
                '.....1...............2.............1.............3...........',
                'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
            ],
        },
        // ===== LEVEL 3 - Watch Your Step =====
        {
            name: "LEVEL 3",
            map: [
                '......................................................................',
                '......................................................................',
                '........d........r.........d........c..........d........r........t.....',
                '......BBBBB....BBB......BBBBB....BBB........BBBBB....BBB......BBB.....',
                '......................................................................',
                '...d..........d..........d..........d...........d..........d..........k.',
                '..BBB.......BBB........BBB........BBB.........BBB........BBB.......BBB.',
                '..@..................................................................X.',
                '..BB.........d.........d..........d..........d.........d..........DBBB.',
                '...........BBBBB....BBB........BBBBB......BBB.......BBBBB....BBBBBBB.',
                '......................................................................',
                '..1........2.........3.........1..........4..........2..............1...',
                'SSSS....SSSS....SSSS....SSSS....SSSS....SSSS....SSSS.................',
                '......................................................................',
                'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
            ],
        },
        // ===== LEVEL 4 - Fire Cavern =====
        {
            name: "LEVEL 4",
            map: [
                'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                'B..................................................................B',
                'B...d.........r..........d........c..........d..........t.........kB',
                'B..BBB......BBBBB......BBB......BBBBB......BBB.......BBB......BBBB',
                'B..................................................................B',
                'B..d..........d..........d..........d..........d..........r........B',
                'B.BBB........BBB........BBB........BBB........BBB........BBB......B',
                'B@..............................................................X.B',
                'BBB.........d..........d..........d..........d..........g......DBBB',
                'B.........BBBBB.....BBB........BBBBB......BBB.......BBBBB..BBBBBB',
                'B..................................................................B',
                'B..1.........3.........1..........2..........4.........3..........1B',
                'BFFFFF..FFFFF..FFFFF..FFFFF..FFFFF..FFFFF..FFFFF..FFFFF.........B',
                'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
            ],
        },
        // ===== LEVEL 5 - The Gauntlet =====
        {
            name: "LEVEL 5",
            map: [
                '................................................................................',
                '................................................................................',
                '........d.........r.........c.........t.........d.........r.........c.........t.',
                '......BBBBB....BBB......BBB......BBB........BBBBB....BBB......BBB......BBB....',
                '................................................................................',
                '..d..........d..........d..........d..........d..........d..........d...........',
                '.BBB........BBB........BBB........BBB........BBB........BBB........BBB.........',
                '.@..........................................................................X..',
                '.BB..........d..........d..........d..........d..........d..........k.....DBBB..',
                '..........BBBBB......BBB......BBBBB......BBB........BBBBB......BBBBBBBBBBBBB..',
                '................................................................................',
                '..1........2........3........4........1........2........3........4........1.....',
                'SSSSSS.SSSSSS.SSSSSS.SSSSSS.SSSSSS.SSSSSS.SSSSSS.SSSSSS.SSSSSS...............',
                '................................................................................',
                'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
            ],
        },
        // ===== LEVEL 6 - Sky Temple =====
        {
            name: "LEVEL 6",
            map: [
                '......................................................................',
                '...l..................................................................',
                '..BBB.................................................................',
                '......................................................................',
                '........d.........r..........c..........t..........d.........r.........',
                '.......BBBBB....BBBBB.....BBBBB.....BBBBB......BBBBB....BBBBB.......',
                '......................................................................',
                '.@.d..........d..........d..........d..........d..........k.........X..',
                '.BBBBB.....BBBBB......BBBBB......BBBBB......BBBBB.....BBBBB...DBBBBB',
                '......................................................................',
                '...1........4........1........3........2........4........1........3....',
                '......................................................................',
                '......................................................................',
                '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
                'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
            ],
        },
        // ===== LEVEL 7 - Dark Fortress =====
        {
            name: "LEVEL 7",
            map: [
                'UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU',
                'U....................................................................U',
                'U....d........r..........c..........t..........d.........r.........k..U',
                'U...BBB.....BBBBB.....BBBBB......BBB........BBBBB....BBB.......BBBBBU',
                'U....................................................................U',
                'U.d..........d..........d..........d..........d..........d............U',
                'UBBB........BBB........BBB........BBB........BBB........BBB..........U',
                'U@..................................................................XU',
                'UBB..........d..........d..........d..........d..........g.........DUUU',
                'U.........BBBBB......BBB.......BBBBB......BBB........BBBBB....BBBBUUU',
                'U....................................................................U',
                'U..1........3........2........4........1........3........2........4..U',
                'USSSSSS.FFFFFF.SSSSSS.FFFFFF.SSSSSS.FFFFFF.SSSSSS.FFFFFF.............U',
                'UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU',
            ],
        },
        // ===== LEVEL 8 - Stone Maze =====
        {
            name: "LEVEL 8",
            map: [
                'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
                'G....................................................................G',
                'G..d..........r..........c..........t..........d.........r.........k..G',
                'G.BBB.......BBBBB......BBB.......BBBBB......BBB........BBB.....BBBBBGG',
                'G....................................................................G',
                'G..d..........d..........d..........d..........d..........d...........G',
                'G.BBB........BBB........BBB........BBB........BBB........BBB.........G',
                'G@..................................................................XG',
                'GBB..........d..........d..........d..........d..........g.........DGGG',
                'G.........BBBBB......BBB........BBBBB......BBB.......BBBBB....GGGGGGG',
                'G....................................................................G',
                'G..4........1........3........2........4........1........3........2..G',
                'GFFFFF.SSSSSS.FFFFF.SSSSSS.FFFFF.SSSSSS.FFFFF.SSSSSS...............G',
                'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
            ],
        },
        // ===== LEVEL 9 - Final Challenge =====
        {
            name: "LEVEL 9",
            map: [
                'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
                'W..............................................................................W',
                'W..l..d........r..........c..........t..........d.........r.........c.........kW',
                'W.BBB..BBB....BBBBB.....BBBBB......BBB........BBBBB....BBB.......BBBBB...BBBWW',
                'W..............................................................................W',
                'W.d..........d..........d..........d..........d..........d..........d..........W',
                'WBBB........BBB........BBB........BBB........BBB........BBB........BBB........W',
                'W@..........................................................................X.W',
                'WBB..........d..........d..........d..........d..........g..........j......DWWW',
                'W.........BBBBB......BBB.......BBBBB......BBB........BBBBB.....BBBBBBBBBWWWWW',
                'W..............................................................................W',
                'W..1..3..2..4..1..3..2..4..1..3..2..4..1..3..2..4..1..3..2..4..1..3..2..4..1.W',
                'WFFSSFFSSFFSSFFSSFFSSFFSSFFSSFFSSFFSSFFSSFFSSFFSSFFSSFFSSFFSSFFSSFFSSFFSSFFS..W',
                'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
            ],
        },
        // ===== LEVEL 10 - Victory Lap =====
        {
            name: "FINAL LEVEL",
            map: [
                'BBWWBBWWBBWWBBWWBBWWBBWWBBWWBBWWBBWWBBWWBBWWBBWWBBWWBBWWBBWWBBWWBBWWBBWWBBWWBBWWBBWWBBWWBB',
                'B........................................................................................B',
                'B..l..d........r........c........t........d........r........c........t........d........k.B',
                'B.BBB..BBB...BBBBB...BBBBB....BBB......BBBBB...BBB......BBBBB...BBB......BBBBB...BBBBBBB',
                'B........................................................................................B',
                'B.d........d........d........d........d........d........d........d........d..............B',
                'BBBB......BBB......BBB......BBB......BBB......BBB......BBB......BBB......BBB............B',
                'B@.......................................................................................XB',
                'BBB........d........d........d........d........d........d........g........j..........DBBBB',
                'B........BBBBB...BBB......BBBBB...BBB......BBBBB....BBB......BBBBB...BBBBBBBBBBBBBBBBBBB',
                'B........................................................................................B',
                'B.1..3..2..4..1..3..2..4..1..3..2..4..1..3..2..4..1..3..2..4..1..3..2..4..1..3..2..4..B',
                'BFFSSFFSSFFSSFFSSFFSSFFSSFFSSFFSSFFSSFFSSFFSSFFSSFFSSFFSSFFSSFFSSFFSSFFSSFFSSFFSSFFSF...B',
                'BBWWBBWWBBWWBBWWBBWWBBWWBBWWBBWWBBWWBBWWBBWWBBWWBBWWBBWWBBWWBBWWBBWWBBWWBBWWBBWWBBWWBBWWBB',
            ],
        },
    ];

    // Parse a level map into tile/entity data
    function parse(levelIndex) {
        const lvl = levels[levelIndex];
        if (!lvl) return null;

        // Find max row width
        let maxWidth = 0;
        for (const row of lvl.map) {
            if (row.length > maxWidth) maxWidth = row.length;
        }

        const tiles = [];
        const items = [];
        const enemies = [];
        let start = { x: 2, y: 7 };
        let door = { x: 50, y: 7 };

        for (let y = 0; y < lvl.map.length; y++) {
            tiles[y] = [];
            const row = lvl.map[y];
            for (let x = 0; x < maxWidth; x++) {
                const ch = x < row.length ? row[x] : '.';
                let tile = 0; // empty

                switch (ch) {
                    case 'B': tile = 1; break;  // brick
                    case 'W': tile = 2; break;  // blue wall
                    case 'P': tile = 3; break;  // platform
                    case 'G': tile = 4; break;  // gray brick
                    case 'U': tile = 5; break;  // purple wall
                    case '~': tile = 6; break;  // water (hazard)
                    case 'F': tile = 7; break;  // fire (hazard)
                    case 'S': tile = 8; break;  // spike (hazard)

                    // Items
                    case 'd': items.push({ type: 'diamond', x: x, y: y, points: 100 }); break;
                    case 'r': items.push({ type: 'ring', x: x, y: y, points: 200 }); break;
                    case 'c': items.push({ type: 'crown', x: x, y: y, points: 300 }); break;
                    case 't': items.push({ type: 'trophy', x: x, y: y, points: 500 }); break;
                    case 'g': items.push({ type: 'gun', x: x, y: y, points: 0 }); break;
                    case 'j': items.push({ type: 'jetpack', x: x, y: y, points: 0 }); break;
                    case 'l': items.push({ type: 'extraLife', x: x, y: y, points: 0 }); break;
                    case 'k': items.push({ type: 'key', x: x, y: y, points: 0 }); break;

                    // Enemies
                    case '1': enemies.push({ type: 'spider', x: x, y: y }); break;
                    case '2': enemies.push({ type: 'snake', x: x, y: y }); break;
                    case '3': enemies.push({ type: 'fireball', x: x, y: y }); break;
                    case '4': enemies.push({ type: 'bat', x: x, y: y }); break;

                    // Special
                    case '@': start = { x: x, y: y }; break;
                    case 'X': door = { x: x, y: y }; break;
                    case 'D': tile = 11; break; // door tile (visual)
                }

                tiles[y][x] = tile;
            }
        }

        return {
            name: lvl.name,
            width: maxWidth,
            height: lvl.map.length,
            bgColor: lvl.bgColor || '#000022',
            tiles,
            items,
            enemies,
            start,
            door,
        };
    }

    return {
        count: levels.length,
        parse,
    };
})();
