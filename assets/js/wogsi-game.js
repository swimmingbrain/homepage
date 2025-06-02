// WoGsi? Game (Uses static images instead of Mapillary viewer)
let game = {
    currentRound: 0,
    totalRounds: 5,
    totalScore: 0,
    bestGuess: null,
    locations: [],
    currentLocation: null,
    guessMarker: null,
    actualMarker: null,
    guessMap: null,
    resultMap: null,
    guessLatLng: null,
    hasGuessed: false,
    apiKey: null,
    currentImageIndex: 0,
    locationImages: []
};

// Updated Vorarlberg locations with actual Mapillary image IDs from the API test
const vorarlbergLocations = [
    // ------------- Rhine Valley (Rheintal) -------------
    {
        name: "Lustenau Zentrum",
        lat: 47.4310,
        lng: 9.6610,
        searchLat: 47.4300,
        searchLng: 9.6600,
        hint: "Austria's largest market town, famed for embroidery and the Rhine.",
        description: "Center of Lustenau, a vibrant town on the border with Switzerland."
    },
    {
        name: "Hard am Bodensee",
        lat: 47.4875,
        lng: 9.6890,
        searchLat: 47.4870,
        searchLng: 9.6880,
        hint: "Town at the Rhine delta, where the river flows into Lake Constance.",
        description: "Port town Hard, known for its nature reserve at the Rhine delta."
    },
    {
        name: "Lauterach Zentrum",
        lat: 47.4583,
        lng: 9.7208,
        searchLat: 47.4580,
        searchLng: 9.7200,
        hint: "Industrial and residential town south of Bregenz.",
        description: "The center of Lauterach in the Rhine Valley."
    },
    {
        name: "Wolfurt Zentrum",
        lat: 47.4417,
        lng: 9.7500,
        searchLat: 47.4410,
        searchLng: 9.7500,
        hint: "Known for its 'Cubus' cultural center and transport connections.",
        description: "The market town of Wolfurt, near Dornbirn and Bregenz."
    },
    {
        name: "Götzis Zentrum",
        lat: 47.3333,
        lng: 9.6333,
        searchLat: 47.3330,
        searchLng: 9.6330,
        hint: "Home to the famous Hypo-Meeting multi-event athletics competition.",
        description: "The town center of Götzis in the upper Rhine Valley."
    },
    {
        name: "Rankweil Basilika",
        lat: 47.2700,
        lng: 9.6490,
        searchLat: 47.2700,
        searchLng: 9.6490,
        hint: "Impressive pilgrimage church overlooking the Rhine Valley.",
        description: "The Basilica of Rankweil, a significant religious and historical site."
    },
    {
        name: "Altach Zentrum",
        lat: 47.3500,
        lng: 9.6417,
        searchLat: 47.3500,
        searchLng: 9.6410,
        hint: "Town known for its football club, SCR Altach.",
        description: "The center of Altach, a community in the Rhine Valley."
    },
    {
        name: "Mäder Au",
        lat: 47.3000,
        lng: 9.6167,
        searchLat: 47.3000,
        searchLng: 9.6160,
        hint: "Village near the Rhine, known for its natural river landscapes.",
        description: "The alluvial plains area near Mäder, part of the Rhine delta."
    },
    {
        name: "Koblach Zentrum",
        lat: 47.3050,
        lng: 9.6290,
        searchLat: 47.3050,
        searchLng: 9.6290,
        hint: "Known for the Neuburg castle ruins and views over the Rhine.",
        description: "Center of Koblach, a village at the foot of the Kummenberg."
    },
    {
        name: "Höchst Zentrum",
        lat: 47.4630,
        lng: 9.6400,
        searchLat: 47.4630,
        searchLng: 9.6400,
        hint: "Border town to Switzerland, at the Rhine delta.",
        description: "The center of Höchst, located where the old Rhine meets Lake Constance."
    },
    {
        name: "Fußach Hafen",
        lat: 47.4760,
        lng: 9.6580,
        searchLat: 47.4760,
        searchLng: 9.6580,
        hint: "Small harbor village at the entrance of the new Rhine into Lake Constance.",
        description: "Harbor area of Fußach, popular for boating."
    },
    {
        name: "Gaißau am See",
        lat: 47.4790,
        lng: 9.6220,
        searchLat: 47.4790,
        searchLng: 9.6220,
        hint: "Village directly on the border, where the Rhine used to flow into the lake.",
        description: "Lakeside part of Gaißau, bordering Switzerland."
    },
    {
        name: "Rheindelta Naturschutzgebiet",
        lat: 47.4900,
        lng: 9.6500,
        searchLat: 47.4900,
        searchLng: 9.6500,
        hint: "Important nature reserve with diverse birdlife at the Rhine's entry to Lake Constance.",
        description: "The Rhine Delta nature reserve, a haven for birds and nature lovers."
    },
    {
        name: "Karrenseilbahn Bergstation",
        lat: 47.3985,
        lng: 9.7705,
        searchLat: 47.3985,
        searchLng: 9.7705,
        hint: "Dornbirn's cable car with panoramic views and a unique 'Karren-Kante' platform.",
        description: "Mountain station of the Karren cable car, overlooking Dornbirn and the Rhine Valley."
    },
    {
        name: "Rappenlochschlucht Eingang",
        lat: 47.3865,
        lng: 9.7770,
        searchLat: 47.3865,
        searchLng: 9.7770,
        hint: "Impressive gorge carved by the Dornbirner Ach, near Dornbirn.",
        description: "Entrance to the Rappenloch Gorge, a popular natural attraction."
    },
    {
        name: "Inatura Erlebnis Naturschau Dornbirn",
        lat: 47.4150,
        lng: 9.7310,
        searchLat: 47.4150,
        searchLng: 9.7310,
        hint: "Interactive nature museum in Dornbirn, focusing on Vorarlberg's ecology.",
        description: "The Inatura museum, offering hands-on exhibits about nature and technology."
    },
    {
        name: "Rolls-Royce Museum Gütle",
        lat: 47.3833,
        lng: 9.7845,
        searchLat: 47.3833,
        searchLng: 9.7845,
        hint: "Private museum housing the world's largest collection of Rolls-Royce cars.",
        description: "The Rolls-Royce Museum located in Gütle, near Dornbirn."
    },
    {
        name: "Stoffels Säge-Mühle",
        lat: 47.3760,
        lng: 9.7000,
        searchLat: 47.3760,
        searchLng: 9.7000,
        hint: "Historic sawmill and museum in Hohenems.",
        description: "A preserved historical industrial site in Hohenems."
    },
    {
        name: "Jüdisches Museum Hohenems",
        lat: 47.3620,
        lng: 9.6870,
        searchLat: 47.3620,
        searchLng: 9.6870,
        hint: "Museum dedicated to the rich Jewish history of Hohenems.",
        description: "The Jewish Museum Hohenems, housed in the Villa Heimann-Rosenthal."
    },
    {
        name: "Palast Hohenems",
        lat: 47.3661,
        lng: 9.6865,
        searchLat: 47.3661,
        searchLng: 9.6865,
        hint: "Renaissance palace, once home to the manuscripts of the Nibelungenlied.",
        description: "The impressive Renaissance palace in the center of Hohenems."
    },
    {
        name: "Schattenburg Feldkirch",
        lat: 47.2390,
        lng: 9.6000,
        searchLat: 47.2390,
        searchLng: 9.6000,
        hint: "Well-preserved medieval castle overlooking Feldkirch.",
        description: "The Schattenburg castle, now a museum and restaurant."
    },
    {
        name: "Wildpark Feldkirch",
        lat: 47.2490,
        lng: 9.6100,
        searchLat: 47.2490,
        searchLng: 9.6100,
        hint: "Wildlife park with native alpine animals, free admission.",
        description: "The Feldkirch Wildlife Park, home to over 200 animals."
    },

    // ------------- Bregenzerwald -------------
    {
        name: "Egg Zentrum",
        lat: 47.4333,
        lng: 9.8917,
        searchLat: 47.4330,
        searchLng: 9.8910,
        hint: "Main village in the Vorderer Bregenzerwald, known for its wooden architecture.",
        description: "The bustling center of Egg, a hub in the Bregenzerwald region."
    },
    {
        name: "Schwarzenberg Dorfplatz",
        lat: 47.4167,
        lng: 9.8500,
        searchLat: 47.4160,
        searchLng: 9.8500,
        hint: "Picturesque village, home of artist Angelika Kauffmann.",
        description: "The historic village square of Schwarzenberg, famed for its beauty."
    },
    {
        name: "Angelika Kauffmann Museum",
        lat: 47.4160,
        lng: 9.8510,
        searchLat: 47.4160,
        searchLng: 9.8510,
        hint: "Museum dedicated to the neoclassical painter Angelika Kauffmann.",
        description: "Located in Schwarzenberg, celebrating the life and work of the artist."
    },
    {
        name: "Bezau Zentrum",
        lat: 47.3833,
        lng: 9.9000,
        searchLat: 47.3830,
        searchLng: 9.9000,
        hint: "Central village in Bregenzerwald with cable car access to hiking areas.",
        description: "The market town of Bezau, a popular tourist destination."
    },
    {
        name: "Andelsbuch Stausee",
        lat: 47.4150,
        lng: 9.9030,
        searchLat: 47.4150,
        searchLng: 9.9030,
        hint: "Reservoir lake in Andelsbuch, used for power generation and recreation.",
        description: "The reservoir in Andelsbuch, popular for walks."
    },
    {
        name: "Werkraum Bregenzerwald",
        lat: 47.4083, // In Andelsbuch
        lng: 9.9030,
        searchLat: 47.4083,
        searchLng: 9.9030,
        hint: "Showcase of craftsmanship and design from the Bregenzerwald region.",
        description: "Exhibition and event space in Andelsbuch highlighting local artisans."
    },
    {
        name: "Hittisau Dorfplatz",
        lat: 47.4570,
        lng: 9.9630,
        searchLat: 47.4570,
        searchLng: 9.9630,
        hint: "Charming village known for its traditional wooden houses and women's museum.",
        description: "The village center of Hittisau in the Vorderer Bregenzerwald."
    },
    {
        name: "Frauenmuseum Hittisau",
        lat: 47.4575,
        lng: 9.9635,
        searchLat: 47.4575,
        searchLng: 9.9635,
        hint: "Unique museum dedicated to the cultural achievements of women.",
        description: "The Women's Museum in Hittisau, the only one of its kind in Austria."
    },
    {
        name: "Lingenau Ortszentrum",
        lat: 47.4500,
        lng: 9.9167,
        searchLat: 47.4500,
        searchLng: 9.9160,
        hint: "Village known for its suspension bridge and natural beauty.",
        description: "The center of Lingenau, offering views of the Subersach gorge."
    },
    {
        name: "Krumbach Bushaltestellen (BUSSTOPS)",
        lat: 47.4667, // Approximate center for the project
        lng: 9.9167,
        searchLat: 47.4660,
        searchLng: 9.9160,
        hint: "Village famous for its architecturally unique bus stops designed by international architects.",
        description: "Krumbach, where art meets public transport with its designer bus shelters."
    },
    {
        name: "Alberschwende Dorf",
        lat: 47.4500,
        lng: 9.8333,
        searchLat: 47.4500,
        searchLng: 9.8330,
        hint: "Village offering views from the Rhine Valley to Lake Constance.",
        description: "The center of Alberschwende, a gateway to the Bregenzerwald."
    },
    {
        name: "Mellau Zentrum",
        lat: 47.3500,
        lng: 9.8833,
        searchLat: 47.3500,
        searchLng: 9.8830,
        hint: "Part of the Damüls-Mellau ski area, popular year-round.",
        description: "The village center of Mellau in the Bregenzerwald."
    },
    {
        name: "Damüls Kirchdorf",
        lat: 47.2833,
        lng: 9.9000,
        searchLat: 47.2830,
        searchLng: 9.9000,
        hint: "Highest Walser village in Vorarlberg, part of a large ski area.",
        description: "The picturesque church village of Damüls, a major ski resort."
    },
    {
        name: "Pfarrkirche St. Nikolaus Damüls",
        lat: 47.2835,
        lng: 9.9005,
        searchLat: 47.2835,
        searchLng: 9.9005,
        hint: "Historic church in Damüls, one of the highest in the region.",
        description: "The iconic St. Nicholas parish church in Damüls."
    },
    {
        name: "Au-Schoppernau Zentrum (Au)",
        lat: 47.3167,
        lng: 9.9667,
        searchLat: 47.3160,
        searchLng: 9.9660,
        hint: "Twin villages in the upper Bregenzerwald, great for hiking and skiing.",
        description: "The center of Au, part of the Au-Schoppernau holiday region."
    },
    {
        name: "Diedamskopf Seilbahn Bergstation",
        lat: 47.3000,
        lng: 10.0050,
        searchLat: 47.3000,
        searchLng: 10.0050,
        hint: "Mountain top near Schoppernau with stunning panoramic views.",
        description: "The Diedamskopf cable car mountain station, a popular viewpoint and ski area."
    },
    {
        name: "Kanisfluh Aussichtspunkt",
        lat: 47.3350, // Approx for a viewpoint
        lng: 9.9300,  // Approx for a viewpoint
        searchLat: 47.3350,
        searchLng: 9.9300,
        hint: "Iconic mountain massif in the Bregenzerwald, known for its steep north face.",
        description: "A viewpoint for the Kanisfluh, a dominant peak in the region."
    },
    {
        name: "Bödele Passhöhe",
        lat: 47.4190,
        lng: 9.8100,
        searchLat: 47.4190,
        searchLng: 9.8100,
        hint: "Mountain pass and ski area between Dornbirn and Schwarzenberg.",
        description: "The Bödele pass, a popular recreational area year-round."
    },

    // ------------- Montafon -------------
    {
        name: "Schruns Zentrum",
        lat: 47.0800,
        lng: 9.9180,
        searchLat: 47.0800,
        searchLng: 9.9180,
        hint: "Main town in the Montafon valley, a hub for alpine activities.",
        description: "The lively center of Schruns, popular for skiing and hiking."
    },
    {
        name: "Tschagguns Zentrum",
        lat: 47.0750,
        lng: 9.9000,
        searchLat: 47.0750,
        searchLng: 9.9000,
        hint: "Neighboring village to Schruns, known for its sports facilities.",
        description: "The village center of Tschagguns in the Montafon."
    },
    {
        name: "Golm Bewegungsberg Talstation Vandans",
        lat: 47.1020,
        lng: 9.8620,
        searchLat: 47.1020,
        searchLng: 9.8620,
        hint: "Family-friendly adventure mountain with various attractions.",
        description: "Valley station of the Golmerbahn in Vandans, leading to the Golm adventure area."
    },
    {
        name: "Lünerseebahn Bergstation",
        lat: 47.0583,
        lng: 9.7550,
        searchLat: 47.0583,
        searchLng: 9.7550,
        hint: "Cable car to the stunning Lünersee, 'Jewel of the Rätikon'.",
        description: "Mountain station of the Lünerseebahn, offering access to the high alpine lake."
    },
    {
        name: "Lünersee",
        lat: 47.0530,
        lng: 9.7590,
        searchLat: 47.0530,
        searchLng: 9.7590,
        hint: "One of Austria's most beautiful alpine lakes, nestled in the Rätikon.",
        description: "The turquoise Lünersee, a popular hiking destination."
    },
    {
        name: "Silvretta-Hochalpenstraße Bielerhöhe",
        lat: 46.9170,
        lng: 10.0930,
        searchLat: 46.9170,
        searchLng: 10.0930,
        hint: "Famous high alpine road with breathtaking scenery and the Silvretta reservoir.",
        description: "Bielerhöhe pass on the Silvretta High Alpine Road, with views of Piz Buin."
    },
    {
        name: "Silvretta Stausee",
        lat: 46.9200,
        lng: 10.0850,
        searchLat: 46.9200,
        searchLng: 10.0850,
        hint: "Large reservoir lake on the Bielerhöhe, surrounded by high peaks.",
        description: "The Silvretta Reservoir, a key feature of the Silvretta High Alpine Road."
    },
    {
        name: "Piz Buin (Austrian side viewpoint)",
        lat: 46.8400, // Approx. viewpoint from Bielerhöhe side
        lng: 10.1200,
        searchLat: 46.8400,
        searchLng: 10.1200,
        hint: "Vorarlberg's highest mountain, a majestic peak in the Silvretta Alps.",
        description: "View towards Piz Buin, the highest mountain in Vorarlberg."
    },
    {
        name: "St. Gallenkirch Zentrum",
        lat: 47.0000,
        lng: 9.9667,
        searchLat: 47.0000,
        searchLng: 9.9660,
        hint: "Village in the Montafon with access to the Silvretta Montafon ski area.",
        description: "The center of St. Gallenkirch, a popular base for winter and summer sports."
    },
    {
        name: "Gaschurn Zentrum",
        lat: 46.9833,
        lng: 10.0333,
        searchLat: 46.9830,
        searchLng: 10.0330,
        hint: "Southernmost village in Montafon before the Silvretta High Alpine Road.",
        description: "The village of Gaschurn, offering access to the Versettla ski area."
    },
    {
        name: "Partenen Dorf",
        lat: 46.9667,
        lng: 10.0500,
        searchLat: 46.9660,
        searchLng: 10.0500,
        hint: "Last village before the Silvretta High Alpine Road (from Montafon side).",
        description: "Partenen, known for its proximity to the Vermunt and Kops reservoirs."
    },
    {
        name: "Versettla Bahn Talstation Gaschurn",
        lat: 46.9850,
        lng: 10.0250,
        searchLat: 46.9850,
        searchLng: 10.0250,
        hint: "Cable car in Gaschurn providing access to the Silvretta Montafon Nova area.",
        description: "Valley station of the Versettla Bahn, leading to a large hiking and skiing area."
    },
    {
        name: "Valisera Bahn Talstation St. Gallenkirch",
        lat: 47.0050,
        lng: 9.9750,
        searchLat: 47.0050,
        searchLng: 9.9750,
        hint: "Main access point in St. Gallenkirch to the Silvretta Montafon ski area.",
        description: "Valley station of the Valisera Bahn, a key lift in the Silvretta Montafon."
    },
    {
        name: "Hochjoch Bahn Talstation Schruns",
        lat: 47.0780,
        lng: 9.9250,
        searchLat: 47.0780,
        searchLng: 9.9250,
        hint: "Cable car from Schruns to the Hochjoch ski and hiking area.",
        description: "Valley station of the Hochjoch Bahn, gateway to the Kapell ski area."
    },
    {
        name: "Schesaplana Gipfel",
        lat: 47.0510,
        lng: 9.7070,
        searchLat: 47.0510,
        searchLng: 9.7070,
        hint: "Highest peak in the Rätikon range, on the border with Switzerland.",
        description: "The summit of Schesaplana, a challenging but rewarding climb."
    },
    {
        name: "Bartholomäberg Kirche",
        lat: 47.0950,
        lng: 9.9000,
        searchLat: 47.0950,
        searchLng: 9.9000,
        hint: "Sunny plateau village with one of the oldest churches in Montafon.",
        description: "The historic church of Bartholomäberg, offering panoramic views."
    },
    {
        name: "Silbertal Dorf",
        lat: 47.1000,
        lng: 9.9833,
        searchLat: 47.1000,
        searchLng: 9.9830,
        hint: "Charming side valley of Montafon, known for its mining history and nature.",
        description: "The idyllic village of Silbertal, starting point for hikes in the Verwall."
    },

    // ------------- Kleinwalsertal -------------
    {
        name: "Riezlern Zentrum",
        lat: 47.3550,
        lng: 10.1800,
        searchLat: 47.3550,
        searchLng: 10.1800,
        hint: "Main village in Kleinwalsertal, a German-speaking Austrian valley accessible only from Germany.",
        description: "The bustling center of Riezlern, the gateway to Kleinwalsertal."
    },
    {
        name: "Kanzelwandbahn Talstation Riezlern",
        lat: 47.3500,
        lng: 10.1750,
        searchLat: 47.3500,
        searchLng: 10.1750,
        hint: "Cable car in Riezlern leading to a cross-border ski and hiking area with Oberstdorf.",
        description: "Valley station of the Kanzelwandbahn, accessing the Fellhorn/Kanzelwand area."
    },
    {
        name: "Hirschegg Zentrum",
        lat: 47.3380,
        lng: 10.1580,
        searchLat: 47.3380,
        searchLng: 10.1580,
        hint: "Village in Kleinwalsertal known for the Ifen ski area and hiking trails.",
        description: "The center of Hirschegg, offering access to diverse alpine activities."
    },
    {
        name: "Ifenbahn Bergstation",
        lat: 47.3300, // Approx. Bergstation Ifen I or II
        lng: 10.1300,
        searchLat: 47.3300,
        searchLng: 10.1300,
        hint: "Mountain station for the unique Ifen plateau, great for skiing and views.",
        description: "Top of the Ifen cable car, gateway to the Gottesackerplateau."
    },
    {
        name: "Mittelberg Zentrum",
        lat: 47.3300,
        lng: 10.1500,
        searchLat: 47.3300,
        searchLng: 10.1500,
        hint: "Central village in Kleinwalsertal with traditional Walser houses.",
        description: "The historic village of Mittelberg, known for its church and alpine scenery."
    },
    {
        name: "Walmendingerhornbahn Talstation Mittelberg",
        lat: 47.3250,
        lng: 10.1480,
        searchLat: 47.3250,
        searchLng: 10.1480,
        hint: "Cable car in Mittelberg to a panoramic peak with a viewing platform.",
        description: "Valley station of the Walmendingerhornbahn, offering stunning views from the top."
    },
    {
        name: "Baad (Kleinwalsertal)",
        lat: 47.3000,
        lng: 10.1167,
        searchLat: 47.3000,
        searchLng: 10.1160,
        hint: "Innermost village in Kleinwalsertal, surrounded by mountains.",
        description: "The tranquil village of Baad, the starting point for many alpine tours."
    },
    {
        name: "Breitachklamm Eingang (Austrian side access)",
        lat: 47.3780, // Near Walserschanz, the gorge is mostly Bavarian
        lng: 10.2250,
        searchLat: 47.3780,
        searchLng: 10.2250,
        hint: "Deepest rock gorge in Central Europe, partially accessible from Kleinwalsertal.",
        description: "Entrance area to the Breitachklamm, a spectacular natural wonder (main access from Germany)."
    },

    // ------------- Walgau, Klostertal, Arlberg, Großes Walsertal -------------
    {
        name: "Nenzing Zentrum",
        lat: 47.1833,
        lng: 9.7000,
        searchLat: 47.1830,
        searchLng: 9.7000,
        hint: "Large municipality in Walgau, gateway to the Gamperdonatal (Nenzinger Himmel).",
        description: "The center of Nenzing, a starting point for excursions into alpine valleys."
    },
    {
        name: "Frastanz Zentrum",
        lat: 47.2167,
        lng: 9.6667,
        searchLat: 47.2160,
        searchLng: 9.6660,
        hint: "Industrial town in Walgau, known for its brewery.",
        description: "The center of Frastanz, located at the entrance to the Klostertal."
    },
    {
        name: "Muttersberg Seilbahn Talstation (Bludenz/Nüziders)",
        lat: 47.1710,
        lng: 9.7950,
        searchLat: 47.1710,
        searchLng: 9.7950,
        hint: "Cable car to a sunny plateau above Bludenz, popular for hiking.",
        description: "Valley station of the Muttersbergbahn, leading to a recreational area."
    },
    {
        name: "Brand Dorfzentrum",
        lat: 47.1028,
        lng: 9.7380,
        searchLat: 47.1020,
        searchLng: 9.7380,
        hint: "Picturesque village in Brandnertal, at the foot of the Schesaplana.",
        description: "The charming center of Brand, a popular alpine resort."
    },
    {
        name: "Dorfbahn Brand Bergstation",
        lat: 47.0950, // Approximate
        lng: 9.7300,
        searchLat: 47.0950,
        searchLng: 9.7300,
        hint: "Mountain station in the Brandnertal ski area.",
        description: "Top of the Dorfbahn Brand, providing access to slopes and trails."
    },
    {
        name: "Bürserberg Dorf",
        lat: 47.1500,
        lng: 9.7667,
        searchLat: 47.1500,
        searchLng: 9.7660,
        hint: "Sunny plateau village above Bürs, part of Brandnertal.",
        description: "The village of Bürserberg, offering great views and access to hiking."
    },
    {
        name: "Einhornbahn II Bergstation (Bürserberg)",
        lat: 47.1350, // Approximate
        lng: 9.7500,
        searchLat: 47.1350,
        searchLng: 9.7500,
        hint: "Mountain station in the Brandnertal ski area above Bürserberg.",
        description: "Top of the Einhornbahn II, part of the Brandnertal ski resort."
    },
    {
        name: "Dalaas Dorfmitte",
        lat: 47.1230,
        lng: 9.9950,
        searchLat: 47.1230,
        searchLng: 9.9950,
        hint: "Village in the Klostertal valley, on the way to the Arlberg.",
        description: "The center of Dalaas in the Klostertal."
    },
    {
        name: "Klösterle am Arlberg",
        lat: 47.1333,
        lng: 10.0833,
        searchLat: 47.1330,
        searchLng: 10.0830,
        hint: "Village near the Arlberg pass, with access to the Sonnenkopf ski area.",
        description: "The village of Klösterle, a base for exploring the Arlberg region."
    },
    {
        name: "Sonnenkopf Bergbahn Talstation",
        lat: 47.1290, // Klösterle/Wald am Arlberg
        lng: 10.0620,
        searchLat: 47.1290,
        searchLng: 10.0620,
        hint: "Family-friendly ski and hiking area in the Klostertal.",
        description: "Valley station of the Sonnenkopf Bergbahn."
    },
    {
        name: "Lech am Arlberg Zentrum",
        lat: 47.2083,
        lng: 10.1417,
        searchLat: 47.2080,
        searchLng: 10.1410,
        hint: "World-famous exclusive ski resort, part of the vast Arlberg ski area.",
        description: "The sophisticated village center of Lech am Arlberg."
    },
    {
        name: "Rüfikopfbahn Bergstation (Lech)",
        lat: 47.2100,
        lng: 10.1650,
        searchLat: 47.2100,
        searchLng: 10.1650,
        hint: "Cable car in Lech offering panoramic views and access to the 'White Ring' ski circuit.",
        description: "Mountain station of the Rüfikopfbahn, a key lift in Lech."
    },
    {
        name: "Zürs am Arlberg",
        lat: 47.1667,
        lng: 10.1667,
        searchLat: 47.1660,
        searchLng: 10.1660,
        hint: "Exclusive high-altitude ski village, connected to Lech.",
        description: "The luxurious ski resort of Zürs, known for its excellent snow conditions."
    },
    {
        name: "Warth Dorf",
        lat: 47.2583,
        lng: 10.1833,
        searchLat: 47.2580,
        searchLng: 10.1830,
        hint: "High-altitude village connected to the Ski Arlberg area, known for abundant snowfall.",
        description: "The village of Warth, part of the Warth-Schröcken ski resort."
    },
    {
        name: "Schröcken Dorf",
        lat: 47.2500,
        lng: 10.0833,
        searchLat: 47.2500,
        searchLng: 10.0830,
        hint: "Picturesque mountain village, part of the Ski Arlberg area.",
        description: "The village of Schröcken, known for its natural beauty and outdoor activities."
    },
    {
        name: "Körbersee",
        lat: 47.2650,
        lng: 10.1200,
        searchLat: 47.2650,
        searchLng: 10.1200,
        hint: "Idyllic mountain lake near Schröcken, voted Austria's most beautiful place.",
        description: "The stunning Körbersee, accessible by a short hike."
    },
    {
        name: "Stuben am Arlberg",
        lat: 47.1333,
        lng: 10.1667,
        searchLat: 47.1330,
        searchLng: 10.1660,
        hint: "Birthplace of ski pioneer Hannes Schneider, cozy Arlberg village.",
        description: "The charming village of Stuben, a historic ski resort."
    },
    {
        name: "Flexenpass Höhe",
        lat: 47.1550,
        lng: 10.1600,
        searchLat: 47.1550,
        searchLng: 10.1600,
        hint: "Mountain pass connecting the Klostertal/Arlberg with Lech and Zürs.",
        description: "The Flexen Pass, known for its impressive road engineering."
    },
    {
        name: "Hochtannbergpass",
        lat: 47.2680,
        lng: 10.1350,
        searchLat: 47.2680,
        searchLng: 10.1350,
        hint: "Pass connecting the Bregenzerwald (Schröcken) with the Lechtal (Warth).",
        description: "The Hochtannberg Pass, a scenic route between two valleys."
    },
    {
        name: "Sonntag-Stein Seilbahn Bergstation",
        lat: 47.2400, // Approximate
        lng: 9.8800,  // Approximate
        searchLat: 47.2400,
        searchLng: 9.8800,
        hint: "Cable car in Großes Walsertal leading to a sunny hiking area.",
        description: "Mountain station of the Sonntag-Stein cable car in the Biosphere Park."
    },
    {
        name: "Propstei St. Gerold",
        lat: 47.2333,
        lng: 9.8167,
        searchLat: 47.2333,
        searchLng: 9.8167,
        hint: "Historic monastery and cultural center in Großes Walsertal.",
        description: "The Propstei St. Gerold, a place of tranquility and culture."
    },
    {
        name: "Fontanella-Faschina (Faschinajoch)",
        lat: 47.2667, // Faschinajoch
        lng: 9.9167,  // Faschinajoch
        searchLat: 47.2660,
        searchLng: 9.9160,
        hint: "Mountain pass and small ski resort connecting Großes Walsertal and Damüls.",
        description: "The Faschinajoch, a scenic pass and starting point for hikes."
    },
    {
        name: "Thüringerberg Dorf",
        lat: 47.2167,
        lng: 9.7833,
        searchLat: 47.2160,
        searchLng: 9.7830,
        hint: "Sunny village at the entrance to the Großes Walsertal Biosphere Park.",
        description: "The village of Thüringerberg, offering beautiful valley views."
    },
    {
        name: "Laterns-Gapfohl Skigebiet (Talstation)",
        lat: 47.2950, // Innerlaterns
        lng: 9.7100,  // Innerlaterns
        searchLat: 47.2950,
        searchLng: 9.7100,
        hint: "Family-friendly ski and hiking area in the Laternser Valley.",
        description: "Valley station of the Laterns-Gapfohl ski area."
    },
    {
        name: "Üble Schlucht Eingang",
        lat: 47.3000, // Approx. entrance near Laterns
        lng: 9.7000,
        searchLat: 47.3000,
        searchLng: 9.7000,
        hint: "Spectacular gorge in the Laternser Valley, known for its wild beauty.",
        description: "Entrance to the Üble Schlucht, a challenging but impressive natural gorge."
    },

    // ------------- Peaks & Other Landmarks -------------
    {
        name: "Pfänder Bregenz (Gipfel)",
        lat: 47.5070,
        lng: 9.7740,
        searchLat: 47.5070,
        searchLng: 9.7740,
        hint: "Bregenz's local mountain with views over Lake Constance and hundreds of Alpine peaks.",
        description: "The summit of the Pfänder, accessible by cable car or hiking."
    },
    {
        name: "Hoher Freschen Gipfel",
        lat: 47.2860,
        lng: 9.7800,
        searchLat: 47.2860,
        searchLng: 9.7800,
        hint: "Prominent peak in the Bregenzerwald Mountains, popular hiking destination.",
        description: "The summit of Hoher Freschen, offering panoramic views."
    },
    {
        name: "Drei Schwestern Gipfel (Frastanzer Seite)",
        lat: 47.1667, // Approx. main peak
        lng: 9.5900,
        searchLat: 47.1667,
        searchLng: 9.5900,
        hint: "Iconic triple-peaked mountain on the border with Liechtenstein.",
        description: "The Drei Schwestern (Three Sisters) mountain range, a striking landmark."
    },
    {
        name: "Rote Wand Gipfel",
        lat: 47.1760,
        lng: 9.9650,
        searchLat: 47.1760,
        searchLng: 9.9650,
        hint: "Distinctive limestone mountain in the Lechquellengebirge, known for its reddish rock.",
        description: "The summit of the Rote Wand, a challenging alpine tour."
    },
    {
        name: "Widderstein Gipfel",
        lat: 47.3050,
        lng: 10.1780,
        searchLat: 47.3050,
        searchLng: 10.1780,
        hint: "Imposing mountain peak near Warth, popular with climbers and hikers.",
        description: "The summit of the Widderstein, offering extensive views."
    },
    {
        name: "Hoher Ifen Gipfel",
        lat: 47.3390,
        lng: 10.1330,
        searchLat: 47.3390,
        searchLng: 10.1330,
        hint: "Unique table mountain with a vast plateau, on the border with Germany.",
        description: "The summit of the Hoher Ifen, known for its Gottesacker plateau."
    },
    {
        name: "Mittagspitze Damüls Gipfel",
        lat: 47.2930,
        lng: 9.9220,
        searchLat: 47.2930,
        searchLng: 9.9220,
        hint: "Popular hiking peak above Damüls with great views of the Bregenzerwald.",
        description: "The summit of the Mittagspitze near Damüls."
    },
    {
        name: "Braunarlspitze Gipfel",
        lat: 47.2280,
        lng: 10.0950,
        searchLat: 47.2280,
        searchLng: 10.0950,
        hint: "Highest mountain in the Bregenzerwald Mountains.",
        description: "The summit of the Braunarlspitze, offering superb panoramic views."
    },
    {
        name: "Vorarlberg Museum Bregenz",
        lat: 47.5040,
        lng: 9.7450,
        searchLat: 47.5040,
        searchLng: 9.7450,
        hint: "State museum in Bregenz focusing on the art, history, and culture of Vorarlberg.",
        description: "The Vorarlberg Museum, known for its modern architecture and diverse exhibits."
    },
    {
        name: "Kunsthaus Bregenz (KUB)",
        lat: 47.5045,
        lng: 9.7435,
        searchLat: 47.5045,
        searchLng: 9.7435,
        hint: "Internationally renowned exhibition center for contemporary art.",
        description: "The Kunsthaus Bregenz, an architectural landmark designed by Peter Zumthor."
    },
    {
        name: "Pfänderbahn Talstation Bregenz",
        lat: 47.5030,
        lng: 9.7520,
        searchLat: 47.5030,
        searchLng: 9.7520,
        hint: "Valley station of the cable car to Bregenz's local mountain.",
        description: "The Pfänderbahn valley station, providing easy access to the Pfänder."
    },
    {
        name: "Casino Bregenz",
        lat: 47.5048,
        lng: 9.7410,
        searchLat: 47.5048,
        searchLng: 9.7410,
        hint: "Popular casino located near the Festspielhaus and Lake Constance.",
        description: "The Casino Bregenz, offering gaming and entertainment."
    },
    {
        name: "Messe Dornbirn",
        lat: 47.4000,
        lng: 9.7250,
        searchLat: 47.4000,
        searchLng: 9.7250,
        hint: "Major exhibition and trade fair center in Vorarlberg.",
        description: "The Dornbirn Exhibition Centre, hosting various national and international events."
    },
    {
        name: "Montforthaus Feldkirch",
        lat: 47.2375,
        lng: 9.5975,
        searchLat: 47.2375,
        searchLng: 9.5975,
        hint: "Modern cultural and convention center in the heart of Feldkirch.",
        description: "The Montforthaus, a hub for events, conferences, and culture in Feldkirch."
    },
    {
        name: "Alpenbad Montafon (Schruns-Tschagguns)",
        lat: 47.0770,
        lng: 9.9100,
        searchLat: 47.0770,
        searchLng: 9.9100,
        hint: "Large outdoor and indoor swimming pool complex in the Montafon valley.",
        description: "The Alpenbad Montafon offers year-round swimming and leisure facilities."
    },
    {
        name: "Skimuseum Damüls",
        lat: 47.2830,
        lng: 9.9010,
        searchLat: 47.2830,
        searchLng: 9.9010,
        hint: "Small museum showcasing the history of skiing in the Damüls region.",
        description: "The Damüls Ski Museum, located near the church, offers insights into local ski heritage."
    },
    {
        name: "Silvretta Montafon - Grasjoch Bahn Bergstation",
        lat: 47.0330,
        lng: 9.9630,
        searchLat: 47.0330,
        searchLng: 9.9630,
        hint: "Mountain station connecting Hochjoch and Nova ski areas.",
        description: "Grasjoch Bahn mountain station, a central point in the Silvretta Montafon ski resort."
    },
    {
        name: "Kops Stausee",
        lat: 46.9500,
        lng: 10.0750,
        searchLat: 46.9500,
        searchLng: 10.0750,
        hint: "Reservoir lake near Partenen, part of the Vorarlberger Illwerke hydro-power scheme.",
        description: "The Kops Reservoir, offering scenic walks and views in the Silvretta region."
    },
    {
        name: "Europatreppe 4000 Partenen",
        lat: 46.9650,
        lng: 10.0450,
        searchLat: 46.9650,
        searchLng: 10.0450,
        hint: "One of Europe's longest straight outdoor staircases, with 4000 steps.",
        description: "The 'Stairway to Heaven' runs alongside the Vermuntbahn funicular tracks."
    }
];

// Initialize the game
function init() {
    console.log('Initializing WoGsi?...');
    
    // Set API key directly
    game.apiKey = 'MLY|30634047539527293|81b8b31fda1638a58b5d5124a26fb7ab';
    
    // Set up event listeners
    document.getElementById('start-game')?.addEventListener('click', startGame);
    document.getElementById('make-guess')?.addEventListener('click', makeGuess);
    document.getElementById('next-round')?.addEventListener('click', nextRound);
    document.getElementById('play-again')?.addEventListener('click', resetGame);
    document.getElementById('hint-toggle')?.addEventListener('click', toggleHint);
    
    // Initialize maps
    initializeMaps();
    
    // Check API key
    checkMapillaryConnection();
}

// Check Mapillary connection
async function checkMapillaryConnection() {
    const statusEl = document.getElementById('api-status');
    
    try {
        statusEl.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Validating API key...';
        
        const response = await fetch(
            `https://graph.mapillary.com/images?bbox=9.5,47.0,10.3,47.6&limit=1`,
            {
                headers: {
                    'Authorization': `OAuth ${game.apiKey}`
                }
            }
        );
        
        if (response.ok) {
            statusEl.innerHTML = '<i class="fas fa-check-circle"></i> Ready to play!';
            statusEl.className = 'api-status success';
            document.getElementById('start-game').disabled = false;
        } else {
            throw new Error('Invalid API key');
        }
        
    } catch (error) {
        console.error('API key validation error:', error);
        statusEl.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error connecting to Mapillary';
        statusEl.className = 'api-status error';
    }
}

// Initialize maps
function initializeMaps() {
    game.guessMap = L.map('guess-map').setView([47.2692, 9.8916], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(game.guessMap);
    
    const vorarlbergBounds = [
        [47.6, 9.5],
        [47.6, 10.3],
        [46.8, 10.3],
        [46.8, 9.5]
    ];
    L.polygon(vorarlbergBounds, {
        color: 'var(--color-primary)',
        weight: 2,
        fillOpacity: 0.1
    }).addTo(game.guessMap);
    
    game.guessMap.on('click', function(e) {
        if (!game.hasGuessed) {
            placeGuessMarker(e.latlng);
        }
    });
}

// Start the game
function startGame() {
    const startModal = document.getElementById('start-modal');
    startModal.classList.remove('show');
    startModal.style.display = 'none';
    game.locations = shuffleArray([...vorarlbergLocations]).slice(0, game.totalRounds);
    nextRound();
}

// Load next round
function nextRound() {
    if (game.currentRound >= game.totalRounds) {
        endGame();
        return;
    }
    
    game.currentRound++;
    game.currentLocation = game.locations[game.currentRound - 1];
    game.guessLatLng = null;
    game.hasGuessed = false;
    game.currentImageIndex = 0;
    game.locationImages = [];
    
    document.getElementById('round-number').textContent = `${game.currentRound}/${game.totalRounds}`;
    document.getElementById('results-modal').classList.remove('show');
    document.getElementById('make-guess').disabled = true;
    document.getElementById('hint-overlay').style.display = 'none';
    document.getElementById('hint-toggle').classList.remove('active');
    
    if (game.guessMarker) {
        game.guessMap.removeLayer(game.guessMarker);
        game.guessMarker = null;
    }
    
    if (game.resultMap) {
        game.resultMap.remove();
        game.resultMap = null;
    }
    
    loadLocationImages();
}

// Load images for location
async function loadLocationImages() {
    const viewerEl = document.getElementById('mapillary-viewer');
    viewerEl.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading images...</p></div>';
    
    try {
        // Use search coordinates if available, otherwise use location coordinates
        const searchLat = game.currentLocation.searchLat || game.currentLocation.lat;
        const searchLng = game.currentLocation.searchLng || game.currentLocation.lng;
        
        const bbox = [
            searchLng - 0.02,
            searchLat - 0.02,
            searchLng + 0.02,
            searchLat + 0.02
        ].join(',');
        
        console.log('Fetching images with bbox:', bbox);
        
        const response = await fetch(
            `https://graph.mapillary.com/images?bbox=${bbox}&fields=id,thumb_2048_url,computed_geometry,captured_at&limit=10`,
            {
                headers: {
                    'Authorization': `OAuth ${game.apiKey}`,
                    'Accept': 'application/json'
                },
                mode: 'cors'
            }
        );
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Mapillary API error:', response.status, response.statusText, errorText);
            throw new Error(`Failed to fetch images: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Received images:', data.data?.length || 0);
        
        if (data.data && data.data.length > 0) {
            game.locationImages = data.data;
            displayImage(0);
        } else {
            throw new Error('No images found in the area');
        }
        
    } catch (error) {
        console.error('Error loading images:', error);
        viewerEl.innerHTML = `
            <div class="street-view-fallback">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error loading images</h3>
                <p>${error.message}</p>
                <p><strong>Hint:</strong> ${game.currentLocation.hint}</p>
            </div>
        `;
    }
}

// Display image
function displayImage(index) {
    if (!game.locationImages || game.locationImages.length === 0) return;
    
    game.currentImageIndex = index;
    const image = game.locationImages[index];
    
    const viewerEl = document.getElementById('mapillary-viewer');
    viewerEl.innerHTML = `
        <div class="static-image-viewer">
            <img src="${image.thumb_2048_url}" alt="Street view" id="current-image">
            <div class="image-info">
                Image ${index + 1} of ${game.locationImages.length}
            </div>
            <div class="image-navigation">
                <button class="nav-arrow" id="prev-image" ${index === 0 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button class="nav-arrow" id="next-image" ${index === game.locationImages.length - 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `;
    
    // Add navigation listeners
    document.getElementById('prev-image')?.addEventListener('click', () => {
        if (game.currentImageIndex > 0) {
            displayImage(game.currentImageIndex - 1);
        }
    });
    
    document.getElementById('next-image')?.addEventListener('click', () => {
        if (game.currentImageIndex < game.locationImages.length - 1) {
            displayImage(game.currentImageIndex + 1);
        }
    });
}

// Toggle hint
function toggleHint() {
    const hintOverlay = document.getElementById('hint-overlay');
    const hintToggle = document.getElementById('hint-toggle');
    
    if (hintOverlay.style.display === 'none') {
        document.getElementById('hint-text').textContent = game.currentLocation.hint;
        hintOverlay.style.display = 'flex';
        hintToggle.classList.add('active');
    } else {
        hintOverlay.style.display = 'none';
        hintToggle.classList.remove('active');
    }
}

// Place guess marker
function placeGuessMarker(latlng) {
    if (game.guessMarker) {
        game.guessMap.removeLayer(game.guessMarker);
    }
    
    game.guessMarker = L.marker(latlng, {
        icon: L.divIcon({
            className: 'guess-marker',
            iconSize: [20, 20]
        })
    }).addTo(game.guessMap);
    
    game.guessLatLng = latlng;
    document.getElementById('make-guess').disabled = false;
}

// Make guess
function makeGuess() {
    if (!game.guessLatLng || game.hasGuessed) return;
    
    game.hasGuessed = true;
    document.getElementById('make-guess').disabled = true;
    
    const distance = calculateDistance(
        game.guessLatLng.lat,
        game.guessLatLng.lng,
        game.currentLocation.lat,
        game.currentLocation.lng
    );
    
    const points = calculatePoints(distance);
    game.totalScore += points;
    
    if (!game.bestGuess || distance < game.bestGuess) {
        game.bestGuess = distance;
        document.getElementById('best-guess').textContent = `${game.bestGuess.toFixed(1)} km`;
    }
    
    document.getElementById('total-score').textContent = game.totalScore.toLocaleString();
    showResults(distance, points);
}

// Show results
function showResults(distance, points) {
    document.getElementById('distance-text').textContent = `${distance.toFixed(1)} km away`;
    document.getElementById('score-text').textContent = `${points.toLocaleString()} points`;
    
    const resultMapDiv = document.getElementById('result-map');
    resultMapDiv.innerHTML = '';
    
    // Show the modal first
    const resultsModal = document.getElementById('results-modal');
    resultsModal.classList.add('show');
    
    // Calculate bounds
    const bounds = L.latLngBounds([
        [game.guessLatLng.lat, game.guessLatLng.lng],
        [game.currentLocation.lat, game.currentLocation.lng]
    ]);
    
    // Wait for modal animation and container sizing
    setTimeout(() => {
        // Create map with initial bounds
        game.resultMap = L.map('result-map', {
            zoomControl: false,
            minZoom: 8,
            maxZoom: 18
        });
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(game.resultMap);
        
        // Add zoom control after the map is created
        L.control.zoom({
            position: 'bottomright'
        }).addTo(game.resultMap);
        
        const guessMarker = L.marker([game.guessLatLng.lat, game.guessLatLng.lng], {
            icon: L.divIcon({
                className: 'guess-marker',
                iconSize: [20, 20]
            })
        }).addTo(game.resultMap);
        
        const actualMarker = L.marker([game.currentLocation.lat, game.currentLocation.lng], {
            icon: L.divIcon({
                className: 'actual-marker',
                iconSize: [20, 20]
            })
        }).addTo(game.resultMap);
        
        L.polyline([
            [game.guessLatLng.lat, game.guessLatLng.lng],
            [game.currentLocation.lat, game.currentLocation.lng]
        ], {
            color: 'var(--color-primary)',
            weight: 3,
            opacity: 0.7,
            dashArray: '10, 10'
        }).addTo(game.resultMap);
        
        // Force a resize and fit bounds
        game.resultMap.invalidateSize(true);
        game.resultMap.fitBounds(bounds, { 
            padding: [50, 50],
            maxZoom: 12
        });
        
        guessMarker.bindPopup('<b>Your Guess</b>').openPopup();
        actualMarker.bindPopup(`<b>${game.currentLocation.name}</b><br>${game.currentLocation.description}`);
        
        // Additional resize check after a short delay
        setTimeout(() => {
            game.resultMap.invalidateSize(true);
            game.resultMap.fitBounds(bounds, { 
                padding: [50, 50],
                maxZoom: 12
            });
        }, 300);
    }, 100);
}

// End game
function endGame() {
    const breakdown = document.getElementById('score-breakdown');
    breakdown.innerHTML = '<h3>Your Performance:</h3>';
    breakdown.innerHTML += `
        <div class="round-score">
            <span>Total Rounds:</span>
            <span>${game.totalRounds}</span>
        </div>
        <div class="round-score">
            <span>Best Guess:</span>
            <span>${game.bestGuess ? game.bestGuess.toFixed(1) + ' km' : 'N/A'}</span>
        </div>
        <div class="round-score">
            <span>Average Score:</span>
            <span>${Math.round(game.totalScore / game.totalRounds)} points</span>
        </div>
    `;
    
    document.getElementById('final-score-text').textContent = game.totalScore.toLocaleString();
    document.getElementById('game-over-modal').classList.add('show');
}

// Reset game
function resetGame() {
    game.currentRound = 0;
    game.totalScore = 0;
    game.bestGuess = null;
    game.locations = [];
    game.currentLocation = null;
    game.guessLatLng = null;
    game.hasGuessed = false;
    game.currentImageIndex = 0;
    game.locationImages = [];
    
    if (game.resultMap) {
        game.resultMap.remove();
        game.resultMap = null;
    }
    
    document.getElementById('total-score').textContent = '0';
    document.getElementById('best-guess').textContent = '-';
    document.getElementById('game-over-modal').classList.remove('show');
    
    startGame();
}

// Calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Calculate points
function calculatePoints(distance) {
    const maxPoints = 5000;
    const points = Math.round(maxPoints * Math.exp(-distance / 50));
    return Math.max(0, points);
}

// Shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);