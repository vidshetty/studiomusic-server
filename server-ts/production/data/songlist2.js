"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../helpers/utils");
const songlist = [
    {
        _albumId: "61271e9bfeea0f2ba0df73f9",
        _trackId: "61271e9bfeea0f2ba0df73f9",
        Album: 'Lose Yourself (From "8 Mile" Soundtrack)',
        AlbumArtist: "Eminem",
        Type: "Single",
        Year: "2005",
        Color: "rgba(16,48,88,1)",
        releaseDate: (0, utils_1.date)("06-12-2005"),
        Thumbnail: "https://lh3.googleusercontent.com/M3bE7uvxto_SLeAM0dVltklsikCiUxdh1-6oGlHd0x_6kuxd7pUgvjqjBJCdSc-7tSPuGo-7FGHaIOG_=w544-h544-l90-rj",
        Artist: "Eminem",
        Duration: "5: 26",
        lyrics: true,
        sync: true,
        url: `${utils_1.server[1]}/listen/Lose Yourself - Eminem`
    },
    {
        _albumId: "61246efa7686503104d13d1c",
        _trackId: "61246efa7686503104d13d1c",
        Album: "Lean On (feat. DJ Snake & MØ)",
        AlbumArtist: "Major Lazor, DJ Snake",
        Type: "Single",
        Year: "2015",
        // Color: "rgba(232,32,104,1)", //invalid
        Color: "rgba(0,171,129,255)",
        releaseDate: (0, utils_1.date)("27-11-2015"),
        Thumbnail: "https://lh3.googleusercontent.com/Tsrjm3acw1G2eHA8PvS8i98_U516ePzl0T0SwIiJsbGOT5xggjOq7dyNLkj-6CENp0GmmGCqwpizF4Gl=w544-h544-l90-rj",
        Artist: "Major Lazor, DJ Snake, MØ",
        Duration: "2: 56",
        url: `${utils_1.server[1]}/listen/Lean On - Major Lazer`
    },
    {
        _albumId: "611df1019c40143becf33159",
        Album: "Starboy",
        AlbumArtist: "The Weeknd",
        Type: "Album",
        Year: "2016",
        Color: "rgba(168,0,48,1)",
        releaseDate: (0, utils_1.date)("25-11-2016"),
        Thumbnail: "https://lh3.googleusercontent.com/dcxXIIlest09vnvKznWM9VWQXu1EL7lKxBzXGzwgmVjmMNBm1dEWT_0qn1xrEZYyKF_qRE1TLq8P_JY_mQ=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "611df10a766d9920447e2d8c",
                Title: "Starboy (feat. Daft Punk)",
                Artist: "The Weeknd, Daft Punk",
                Duration: "3: 51",
                url: `${utils_1.server[1]}/listen/Starboy - The Weeknd`
            }
        ]
    },
    {
        _albumId: "611d337b769a2d1e4029d6ae",
        Album: "The Eminem Show",
        AlbumArtist: "Eminem",
        Type: "Album",
        Year: "2002",
        Color: "rgba(96,24,24,1)",
        releaseDate: (0, utils_1.date)("26-05-2002"),
        Thumbnail: "https://lh3.googleusercontent.com/GJmbTYfaMrWuPSzhOAy7jGCQ70a2UN2-0moTq-uh_Prd73-Au51FDHhGteg543a7iBv1Y9SPm4huMSBS=w544-h544-s-l90-rj",
        Tracks: [
            {
                _trackId: "611d338324db6d19903c1ebf",
                Title: "Cleanin' Out My Closet",
                Artist: "Eminem",
                Duration: "4: 58",
                url: `${utils_1.server[1]}/listen/Cleanin' Out My Closet - Eminem`
            },
            {
                _trackId: "611d338be45afe278c384c2e",
                Title: "Without Me",
                Artist: "Eminem",
                Duration: "4: 50",
                url: `${utils_1.server[1]}/listen/Without Me - Eminem`
            },
            {
                _trackId: "611d338cba149d1d9003c4af",
                Title: "Superman",
                Artist: "Eminem",
                Duration: "5: 50",
                url: `${utils_1.server[1]}/listen/Superman - Eminem`
            },
            {
                _trackId: "611d338dce77222fc40c4eee",
                Title: "'Till I Collapse",
                Artist: "Eminem, Nate Dogg",
                Duration: "4: 57",
                url: `${utils_1.server[1]}/listen/'Till I Collapse - Eminem`
            }
        ]
    },
    {
        _albumId: "611d2dac16b5560a8cd99e15",
        _trackId: "611d2dac16b5560a8cd99e15",
        Album: "Dance Monkey",
        AlbumArtist: "Tones And I",
        Type: "Single",
        Year: "2019",
        Color: "rgba(8,48,64,1)",
        releaseDate: (0, utils_1.date)("17-10-2019"),
        Thumbnail: "https://lh3.googleusercontent.com/hDSzLR6UDLcfxL6Hl9k5kJ6KmDTOavpr-GSCPyKgZTlPZuFcbNFTBI8O9HJR_i-Ts_bGg6bn9-3AGSu1=w544-h544-l90-rj",
        Artist: "Tones And I",
        Duration: "3: 29",
        url: `${utils_1.server[1]}/listen/Dance Monkey - Tones And I`
    },
    {
        _albumId: "611b3e828758eb19dcb699f1",
        Album: "ASTROWORLD",
        AlbumArtist: "Travis Scott",
        Type: "Album",
        Year: "2018",
        Color: "rgba(48,112,168,1)",
        releaseDate: (0, utils_1.date)("03-08-2018"),
        Thumbnail: "https://lh3.googleusercontent.com/PSIZ9cf9hpESZwcSz2ylS5I-zIREqCSagxV-X4CJqefrE0sRCktRtFw-a7PlkLygmg7k1nZREKCaSzY=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "611b3e8f5c7979450835932d",
                Title: "STARGAZING",
                Artist: "Travis Scott",
                Duration: "4: 30",
                url: `${utils_1.server[0]}/listen/Stargazing - Travis Scott`
            },
            {
                _trackId: "611b3e9c573dba28d4f823de",
                Title: "SICKO MODE",
                Artist: "Travis Scott",
                Duration: "5: 12",
                url: `${utils_1.server[0]}/listen/Sicko Mode - Travis Scott`
            },
            {
                _trackId: "611b3ea209af6209c45d8be6",
                Title: "BUTTERFLY EFFECT",
                Artist: "Travis Scott",
                Duration: "3: 10",
                url: `${utils_1.server[0]}/listen/Butterfly Effect - Travis Scott`
            },
        ]
    },
    {
        _albumId: "611b3ea92d31335d2cd8d356",
        _trackId: "611b3ea92d31335d2cd8d356",
        Album: "HIGHEST IN THE ROOM",
        AlbumArtist: "Travis Scott",
        Type: "Single",
        Year: "2019",
        Color: "rgba(64,112,168,1)",
        releaseDate: (0, utils_1.date)("04-10-2019"),
        Thumbnail: "https://lh3.googleusercontent.com/R_ZGITXTLuvEMkaOwQez3i1ILBKF-ZnztKYZBwnmqxtsnbnPPVnx31W-E7ZBu7N6eUqRIMxL47k_K8FPeQ=w544-h544-l90-rj",
        Artist: "Travis Scott",
        Duration: "2: 57",
        url: `${utils_1.server[0]}/listen/Highest In The Room - Travis Scott`
    },
    {
        _albumId: "611b3eb7335b972bec61b670",
        Album: "Birds In The Trap Sing McKnight",
        AlbumArtist: "Travis Scott",
        Type: "Album",
        Year: "2016",
        Color: "rgba(184,72,64,1)",
        releaseDate: (0, utils_1.date)("16-09-2016"),
        Thumbnail: "https://lh3.googleusercontent.com/4KB4cS7i427tdsareLs5j10tifHVvmP6X3G4umnxCm8Ra9zkG1hYq0C7Lg-B-I-n1i8SP-heKzAKIQXw=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "611b3ebe9e627122b4712c50",
                Title: "goosebumps",
                Artist: "Travis Scott",
                Duration: "4: 03",
                url: `${utils_1.server[0]}/listen/Goosebumps - Travis Scott`
            }
        ]
    },
    {
        _albumId: "610ec10c7634aa50dcf7aec8",
        Album: "Gully Boy (Original Motion Picture Soundtrack)",
        AlbumArtist: "Various Artists",
        Type: "Album",
        Year: "2019",
        Color: "rgba(72,16,16,1)",
        releaseDate: (0, utils_1.date)("24-01-2019"),
        Thumbnail: "https://lh3.googleusercontent.com/bog_Soo6xEIBnsOgBdpeFcegIEuyp9XMhxKnFH7PfQxIeJNR0l2uq40yQrmC9dIkY06mnJQc4ugFn9c=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "610ec11793eb293dac7005b2",
                Title: "Asli Hip Hop",
                Artist: "Ranveer Singh, Spitfire, D-Cypher, BeatRAW",
                Duration: "1: 48",
                url: `${utils_1.server[0]}/listen/Asli Hip Hop - Gully Boy`
            },
            {
                _trackId: "610ec11ea5ad2848f825d380",
                Title: "Mere Gully Mein",
                Artist: "Ranveer Singh, DIVINE, Naezy, Sez on the Beat",
                Duration: "3: 05",
                url: `${utils_1.server[0]}/listen/Mere Gully Mein - Gully Boy`
            },
            {
                _trackId: "610ec127094dd359e848ddf5",
                Title: "Doori Poem",
                Artist: "Ranveer Singh, Rishi Rich",
                Duration: "1: 05",
                url: `${utils_1.server[0]}/listen/Doori Poem - Gully Boy`
            },
            {
                _trackId: "610ec1333e45ec3df8947da4",
                Title: "Doori",
                Artist: "Ranveer Singh, Rishi Rich",
                Duration: "2: 15",
                url: `${utils_1.server[0]}/listen/Doori - Gully Boy`
            },
            {
                _trackId: "610ec13ee9ffd22068414dab",
                Title: "Sher Aaya Sher",
                Artist: "DIVINE, Major C",
                Duration: "2: 14",
                url: `${utils_1.server[0]}/listen/Sher Aaya Sher - Gully Boy`
            },
            {
                _trackId: "610ec14ae0bbe4553482dec3",
                Title: "Azadi",
                Artist: "Dub Sharma, DIVINE",
                Duration: "2: 35",
                url: `${utils_1.server[0]}/listen/Azadi - Gully Boy`
            },
            {
                _trackId: "610ec156ea6a66257ccb6503",
                Title: "Kab Se Kab Tak",
                Artist: "Ranveer Singh, Vibha Saraf, Ankur Tewari, Karsh Kale, Kaam Bhaari",
                Duration: "3: 33",
                url: `${utils_1.server[0]}/listen/Kab Se Kab Tak - Gully Boy`
            },
            {
                _trackId: "610ec15f0422e04ac85d9f36",
                Title: "Kaam Bhaari",
                Artist: "Kaam Bhaari, Ankur Tewari",
                Duration: "2: 18",
                url: `${utils_1.server[0]}/listen/Kaam Bhaari - Gully Boy`
            },
            {
                _trackId: "610ec16813a38d186894c916",
                Title: "Apna Time Aayega",
                Artist: "Ranveer Singh, Dub Sharma, DIVINE",
                Duration: "2: 20",
                url: `${utils_1.server[0]}/listen/Apna Time Aayega - Gully Boy`
            }
        ]
    },
    {
        _albumId: "610f673b7c62ab0708ead3e7",
        Album: "Kamikaze",
        AlbumArtist: "Eminem",
        Type: "Album",
        Year: "2018",
        Color: "rgba(152,152,152,1)",
        releaseDate: (0, utils_1.date)("31-08-2018"),
        Thumbnail: "https://lh3.googleusercontent.com/JS6MK7XawzUUeCq-ANPfjk2BvkRnz5lblyK59uOhV9lmYSNdlZJx3KUQ6eF2CC7gjKOPO4Rq8tMPO2g=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "610f67479ede7941e81513db",
                Title: "The Ringer",
                Artist: "Eminem",
                Duration: "5: 37",
                lyrics: true,
                sync: true,
                url: `${utils_1.server[0]}/listen/The Ringer - Kamikaze`
            },
            // {
            //     _trackId: "610f674c76267d377caae88a",
            //     Title: "Greatest",
            //     Artist: "Eminem",
            //     Duration: "3: 47",
            //     url: `${server[0]}/listen/Greatest - Kamikaze`
            // },
            {
                _trackId: "610f675998d3030f481e0d7e",
                Title: "Lucky You (feat. Joyner Lucas)",
                Artist: "Eminem, Joyner Lucas",
                Duration: "4: 04",
                lyrics: true,
                sync: true,
                url: `${utils_1.server[0]}/listen/Lucky You - Kamikaze`
            },
            // {
            //     _trackId: "610f676068dc3b54f86ff853",
            //     Title: "Paul (Skit)",
            //     Artist: "Paul Rosenberg",
            //     Duration: "0: 35",
            //     url: `${server[0]}/listen/Paul (Skit) - Kamikaze`
            // },
            // {
            //     _trackId: "610f67665a088a0bcc445980",
            //     Title: "Normal",
            //     Artist: "Eminem",
            //     Duration: "3: 42",
            //     url: `${server[0]}/listen/Normal - Kamikaze`
            // },
            // {
            //     _trackId: "610f676e9de07f1d28be542e",
            //     Title: "Em Calls Paul (Skit)",
            //     Artist: "Eminem",
            //     Duration: "0: 49",
            //     url: `${server[0]}/listen/Em Calls Paul (Skit) - Kamikaze`
            // },
            // {
            //     _trackId: "610f67754437081204cb001a",
            //     Title: "Stepping Stone",
            //     Artist: "Eminem",
            //     Duration: "5: 09",
            //     url: `${server[0]}/listen/Stepping Stone - Kamikaze`
            // },
            {
                _trackId: "610f677b37668527a4fc3426",
                Title: `Not Alike (feat. Royce Da 5'9")`,
                Artist: `Eminem, Royce Da 5'9"`,
                Duration: "4: 48",
                url: `${utils_1.server[0]}/listen/Not Alike - Kamikaze`
            },
            {
                _trackId: "610f67848a657559b0ea2593",
                Title: "Kamikaze",
                Artist: "Eminem",
                Duration: "3: 36",
                url: `${utils_1.server[0]}/listen/Kamikaze - Kamikaze`
            },
            {
                _trackId: "610f678be003651ddcdd96cd",
                Title: "Fall",
                Artist: "Eminem",
                Duration: "4: 22",
                lyrics: true,
                sync: true,
                url: `${utils_1.server[0]}/listen/Fall - Kamikaze`
            },
            // {
            //     _trackId: "610f67917fc88d2528a9ab32",
            //     Title: "Nice Guy (feat. Jessie Reyez)",
            //     Artist: "Eminem, Jessie Reyez",
            //     Duration: "2: 30",
            //     url: `${server[0]}/listen/Nice Guy - Kamikaze`
            // },
            // {
            //     _trackId: "610f67995ef7ba461064517f",
            //     Title: "Good Guy (feat. Jessie Reyez)",
            //     Artist: "Eminem, Jessie Reyez",
            //     Duration: "2: 22",
            //     url: `${server[0]}/listen/Good Guy - Kamikaze`
            // },
            {
                _trackId: "610f67a03d695824347830f7",
                Title: "Venom (Music From The Motion Picture)",
                Artist: "Eminem",
                Duration: "4: 29",
                url: `${utils_1.server[0]}/listen/Venom - Kamikaze`
            }
        ]
    },
    {
        _albumId: "611108a9edbf925848726537",
        _trackId: "611108a9edbf925848726537",
        Album: "1-800-273-8255 (feat. Alessia Cara & Khalid)",
        AlbumArtist: "Logic",
        Year: "2017",
        Color: "rgba(216,216,192,1)",
        Thumbnail: "https://m.media-amazon.com/images/I/81pOU9aLHGL._UXNaN_FMwebp_QL85_.jpg?isCloudQueue=true",
        url: `${utils_1.server[0]}/listen/1-800-273-8255 - Logic`,
        Duration: "4: 10",
        Artist: "Logic, Alessia Cara, Khalid",
        Type: "Single",
        releaseDate: (0, utils_1.date)("05-05-2017")
    },
    {
        _albumId: "611108b8f6fe025b3c168042",
        _trackId: "611108b8f6fe025b3c168042",
        Album: "Everyday",
        AlbumArtist: "Logic",
        Year: "2018",
        Color: "rgba(192,24,32,1)",
        Thumbnail: "https://lh3.googleusercontent.com/_vIfBv2hP5qy0iLMGBu702gN6Oxw1keml_BsAeD5hR7iLmEWfSmQEyG3CUpARdq1kUUDW8ENLG6fCHce=w544-h544-l90-rj",
        url: `${utils_1.server[0]}/listen/Everyday - Logic`,
        Duration: "3: 24",
        Artist: "Logic, Marshmello",
        Type: "Single",
        releaseDate: (0, utils_1.date)("02-03-2018")
    },
    {
        _albumId: "611108c4a86cb14a4cf1a7c4",
        _trackId: "611108c4a86cb14a4cf1a7c4",
        Album: "Alone",
        AlbumArtist: "Marshmello",
        Year: "2016",
        Color: "rgba(40,136,216,1)",
        Thumbnail: "https://lh3.googleusercontent.com/lJklGBZrteai3SvZdVDyuqj5KqbiTa2QhAT1KUiyHBjaq6MbZJuT0PTyQb0UyDyuf-wE4hO0tWbVf6Lk=w544-h544-l90-rj",
        url: `${utils_1.server[0]}/listen/Alone - Marshmello`,
        Duration: "4: 33",
        Artist: "Marshmello",
        Type: "Single",
        releaseDate: (0, utils_1.date)("13-05-2016")
    },
    {
        _albumId: "61162c25d04a0c2b0060fe35",
        _trackId: "61162c25d04a0c2b0060fe35",
        Album: "Mockingbird",
        AlbumArtist: "Eminem",
        Type: "Single",
        Year: "2004",
        Color: "rgba(8,48,88,1)",
        releaseDate: (0, utils_1.date)("12-11-2004"),
        Thumbnail: "https://lh3.googleusercontent.com/oWyLklmIlgBVjLy63kmFrXfgmzK8EIwpzyXneeLu3Ly6eqB_Usf7zZhZzo-LlwbxMx4WugYNW1Lp-ec=w544-h544-l90-rj",
        // _trackId: "61162c2c4988032f4c557638",
        Artist: "Eminem",
        Duration: "4: 10",
        lyrics: true,
        sync: true,
        url: `${utils_1.server[0]}/listen/Mockingbird - Eminem`
    },
    {
        _albumId: "61173d71e850b008049625e6",
        _trackId: "61173d71e850b008049625e6",
        Album: "Space Bound",
        AlbumArtist: "Eminem",
        Type: "Single",
        Year: "2010",
        Color: "rgba(176,192,208,1)",
        releaseDate: (0, utils_1.date)("18-06-2010"),
        Thumbnail: "https://lh3.googleusercontent.com/IUuZFSUqFLMQlejTtsnLM_cB16A0T1g-savL7DYbWz5NFh2-DOw5-v9_PREJt9keX48NSan-8yUQCPM=w544-h544-l90-rj",
        // _trackId: "61173d78c0400e0f207c3b6b",
        Artist: "Eminem",
        Duration: "4: 38",
        lyrics: true,
        sync: true,
        url: `${utils_1.server[1]}/listen/Space Bound - Eminem`
    },
    {
        _albumId: "61174d671a41b60350424442",
        _trackId: "61174d671a41b60350424442",
        Album: "Godzilla (feat. Juice WRLD)",
        AlbumArtist: "Eminem",
        Year: "2020",
        Color: "rgba(128,8,32,1)",
        Thumbnail: "https://lh3.googleusercontent.com/gSjSpiwhol20w2GLjYSR81AOBvdo1UiLRBeu8RbVuRZjtHh6yipa22c26_TZK2Jm7_BGi4FApSXFIZo2VA=w544-h544-l90-rj",
        url: `${utils_1.server[1]}/listen/Godzilla - Eminem`,
        Duration: "3: 30",
        Artist: "Eminem, Juice WRLD",
        Type: "Single",
        releaseDate: (0, utils_1.date)("17-01-2020")
    },
    {
        _albumId: "6118b9936b7baa11347fdb3a",
        _trackId: "6118b9936b7baa11347fdb3a",
        Album: 'Killshot',
        AlbumArtist: "Eminem",
        Year: "2018",
        Color: "rgba(240,32,32,1)",
        Thumbnail: "https://lh3.googleusercontent.com/bVRFSKvGn8NxqDEQqedK9sZAxcRvW85feFS11zvGi8m7kXs5VxazPgjVGuuoxyCe3uu7MgOgnmuwykwF=w544-h544-l90-rj",
        url: `${utils_1.server[1]}/listen/Killshot - Eminem`,
        Duration: "4: 13",
        Artist: "Eminem",
        Type: "Single",
        lyrics: true,
        sync: true,
        releaseDate: (0, utils_1.date)("19-09-2018")
    },
    {
        _albumId: "61212fcf2802212be0808aea",
        Album: "Overexposed",
        AlbumArtist: "Maroon 5",
        Type: "Album",
        Year: "2012",
        Color: "rgba(216,80,152,1)",
        releaseDate: (0, utils_1.date)("01-01-2012"),
        Thumbnail: "https://lh3.googleusercontent.com/aqUChJrezGmTQ2x4_-Xj28XFlUVDIqEC2f_lEugI5EYRInPjlDyzBK1G5zwdlIEuBm3wDlJEu2O7F90Z=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "61212fdcf77b7623e414a717",
                Title: "Payphone (feat. Wiz Khalifa)",
                Artist: "Maroon 5, Wiz Khalifa",
                Duration: "3: 52",
                url: `${utils_1.server[1]}/listen/Payphone - Maroon 5`
            }
        ]
    },
    {
        _albumId: "61212fe920693821b4a94111",
        Album: "JORDI (Deluxe)",
        AlbumArtist: "Maroon 5",
        Type: "Album",
        Year: "2021",
        Color: "rgba(240,200,208,1)",
        releaseDate: (0, utils_1.date)("11-06-2021"),
        Thumbnail: "https://lh3.googleusercontent.com/fQrjUmKOy8LAMC3cUOYaWOrskW6vkvvGsCzTZ-WY80-R06pMz22SjdYWSuPYS7Ms7MvcAHF4syn27Of5=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "61212ff1beac891bfcd7d7f0",
                Title: "Memories",
                Artist: "Maroon 5",
                Duration: "3: 09",
                url: `${utils_1.server[1]}/listen/Memories - Maroon 5`
            }
        ]
    },
    {
        _albumId: "6121cc273662ee25fc92b500",
        Album: "Red Pill Blues (Deluxe)",
        AlbumArtist: "Maroon 5",
        Type: "Album",
        Year: "2018",
        Color: "rgba(144,120,120,1)",
        releaseDate: (0, utils_1.date)("15-06-2018"),
        Thumbnail: "https://lh3.googleusercontent.com/ukH2eUwVN4dgJR_xTGjFuPUp0NkLnUINgEBHDGglldxDEor4GAXiC_Ssln8x6-BBsnjsu-hH149u_ao=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "6121cc31a1f8393c80583fae",
                Title: "Girls Like You (feat. Cardi B)",
                Artist: "Maroon 5, Cardi B",
                Duration: "3: 55",
                url: `${utils_1.server[1]}/listen/Girls Like You - Maroon 5`
            }
        ]
    },
    {
        _albumId: "6136e8d10727082a9421a694",
        Album: "Baaraat",
        AlbumArtist: "Ritviz, Nucleya",
        Type: "Album",
        Year: "2021",
        Color: "rgba(83,83,83,1)",
        releaseDate: (0, utils_1.date)("06-09-2021"),
        Thumbnail: "https://lh3.googleusercontent.com/HnCAKTwUaOmaapms0ITq02cTzN3FafXwjrGFR1o9voXeHIAEeFISvHZLQc972SMlR0U90fo7A8yfRmnEcg=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "6136e8f7be270f2afc707440",
                Title: "Sathi",
                Artist: "Ritviz, Nucleya",
                url: `${utils_1.server[1]}/listen/Sathi - Ritviz`,
                Duration: "3: 36",
                lyrics: true,
                sync: true
            },
            {
                _trackId: "6136e904cfa99b2b1c25632e",
                Title: "Ari Ari",
                Artist: "Ritviz, Nucleya",
                url: `${utils_1.server[1]}/listen/Ari Ari - Ritviz`,
                Duration: "2: 47"
            },
            {
                _trackId: "6136e90b3c9de72b3ba11262",
                Title: "Roz",
                Artist: "Ritviz, Nucleya",
                url: `${utils_1.server[2]}/listen/Roz - Ritviz`,
                Duration: "3: 39",
                lyrics: true,
                sync: true
            },
            {
                _trackId: "615c2524a03f787ddd881639",
                Title: "Baaraat",
                Artist: "Ritviz, Nucleya",
                url: `${utils_1.server[2]}/listen/Baaraat - Ritviz`,
                Duration: "3: 42"
            }
        ]
    },
    {
        _albumId: "6142df80fc67f2461f8f018d",
        Album: "Fukrey",
        AlbumArtist: "Ram Sampath",
        Type: "Album",
        Year: "2013",
        Color: "rgba(96,136,128,1)",
        releaseDate: (0, utils_1.date)("14-05-2013"),
        Thumbnail: "https://lh3.googleusercontent.com/IPTS10kc4jvtmdiKtcbNx7sil5icTZlYIBcYuuCnwpGWVlloH5jHtPzlfrSADNdTe6XFOXvD18_YfjoW=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "6142df8b08c3a9462e97cfcd",
                Title: "Ambarsariya",
                Artist: "Sona Mohapatra",
                url: `${utils_1.server[2]}/listen/Ambarsariya - Fukrey`,
                Duration: "4: 08"
            }
        ]
    },
    {
        _albumId: "64e0cc0356f099571b08a656",
        _trackId: "64e0cc0356f099571b08a656",
        Album: "We Rollin",
        AlbumArtist: "Shubh",
        Type: "Single",
        Year: "2021",
        Color: "rgba(104,104,104,1)",
        releaseDate: (0, utils_1.date)("09-09-2021"),
        Thumbnail: "https://lh3.googleusercontent.com/Z52VtxBQZEZ80bb_gWFoun-50H9BC_hdRkExyQUzp3Rdx8OOoPiz1tJGzWF5WHwyyb0k7IOT7fLMI7uF=w544-h544-l90-rj",
        Artist: "Shubh",
        Duration: "3: 19",
        url: `${utils_1.server[3]}/listen/We Rollin - Shubh`
    },
    {
        _albumId: "616a9782c25ff861eec5edc7",
        Album: "Raabta",
        AlbumArtist: "Various Artists",
        Type: "Album",
        Year: "2017",
        Color: "rgba(128,40,24,1)",
        releaseDate: (0, utils_1.date)("03-06-2017"),
        Thumbnail: "https://lh3.googleusercontent.com/LBZZIThPWDYCSQVcJji-CcVDfDbYoCxLQS1WoNFxK8zOggzcdbNR4Bl2a2cVzqiD9qoatMgjrYDVfS4=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "616a978ec957de621aa6a3b8",
                Title: "Ik Vaari Aa",
                Artist: "Pritam, Arijit Singh",
                url: `${utils_1.server[1]}/listen/Ik Vaari Aa - Raabta`,
                Duration: "4: 34"
            }
        ]
    },
    {
        _albumId: "6172d317e9951aa9fe793c0c",
        Album: "Ra-One",
        AlbumArtist: "Vishal-Shekhar",
        Type: "Album",
        Year: "2011",
        Color: "rgba(200,16,40,1)",
        releaseDate: (0, utils_1.date)("16-09-2011"),
        Thumbnail: "https://lh3.googleusercontent.com/ev2blQxLfdvHD_M6CqkMo_7xmIB_RhcZ6bQ0Aax-txvXmulVXodOSI5L_xumqOq3AUMgp1464tUQLs9QIg=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "6172d323726b87aa10c6552a",
                Title: "Chammak Challo",
                Artist: "Akon, Hamsika Iyer",
                url: `${utils_1.server[0]}/listen/Chammak Challo - RaOne`,
                Duration: "3: 47"
            }
        ]
    },
    {
        _albumId: "617bc13a41f86d5a2e5c3c1b",
        _trackId: "617bc13a41f86d5a2e5c3c1b",
        Album: 'OG',
        AlbumArtist: "KR$NA",
        Year: "2021",
        Color: "rgba(112,8,104,1)",
        Thumbnail: "https://lh3.googleusercontent.com/8t38FsHRsI9HDp9mzVaN551qCWuTERwvrg9oeow0kSm3KHLLIN1B-eCRsvnHHioYzlx9s33xFbb6tPU_=w544-h544-l90-rj",
        url: `${utils_1.server[0]}/listen/OG - KR$NA`,
        Duration: "3: 31",
        Artist: "KR$NA",
        Type: "Single",
        releaseDate: (0, utils_1.date)("13-10-2021")
    },
    {
        _albumId: "617bc2350dfdbe5b12c8ea5e",
        _trackId: "617bc2350dfdbe5b12c8ea5e",
        Album: 'Sheikh Chilli',
        AlbumArtist: "Raftaar",
        Year: "2021",
        Color: "rgba(80,80,80,1)",
        Thumbnail: "https://lh3.googleusercontent.com/TanickwxoRyOi-VsoZ59eRxbfIGiRwbkDvY-v2DZ5NETV42Xpy4OeJyvc77OHUljEAh311JnGzlGQR72=w544-h544-l90-rj",
        url: `${utils_1.server[0]}/listen/Sheikh Chilli - Raftaar`,
        Duration: "4: 12",
        Artist: "Raftaar",
        Type: "Single",
        releaseDate: (0, utils_1.date)("08-01-2021")
    },
    {
        _albumId: "618e077d67371c2f91f5d6cf",
        _trackId: "618e077d67371c2f91f5d6cf",
        Album: 'No Cap',
        AlbumArtist: "KR$NA",
        Year: "2021",
        Color: "rgba(248,96,88,1)",
        Thumbnail: "https://lh3.googleusercontent.com/5UpT2hG4hlB1t3doKC4HWloVK5wgWsaZYyJqQI_MaLQM3gTlph25OuHIg3GGlLktnPY4SnGgyUmfh161sQ=w544-h544-l90-rj",
        url: `${utils_1.server[3]}/listen/No Cap - KR$NA`,
        Duration: "3: 25",
        Artist: "KR$NA",
        Type: "Single",
        lyrics: true,
        sync: true,
        releaseDate: (0, utils_1.date)("10-11-2021")
    },
    {
        _albumId: "6194a1863fa65728f15d5a91",
        Album: "Ajab Prem Ki Ghazab Kahani",
        AlbumArtist: "Pritam",
        Type: "Album",
        Year: "2009",
        Color: "rgba(248,112,32,1)",
        releaseDate: (0, utils_1.date)("06-11-2009"),
        Thumbnail: "https://lh3.googleusercontent.com/q0UH44DhbQcuEgst2IVV9cgHgXdPksIVkgixk1uDT7-wIDS1YlNAre2I3JAUFYrHJzXu9D57wRYbI7U=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "6194a18f049e5128ff467abb",
                Title: "Tu Jaane Na",
                Artist: "Atif Aslam",
                url: `${utils_1.server[3]}/listen/Tu Jaane Na - Ajab Prem Ki Ghazab Kahani`,
                Duration: "5: 41",
                lyrics: true,
                sync: true
            }
        ]
    },
    {
        _albumId: "61a086200ee3752e85a8ea3d",
        _trackId: "61a086200ee3752e85a8ea3d",
        Album: 'Bin Bulaye',
        AlbumArtist: "Dino James",
        Year: "2021",
        Color: "rgba(200,152,64,1)",
        Thumbnail: "https://lh3.googleusercontent.com/tKZqi8vxEQkDinNluHeTh0hn67J6l-v6U8eb8i4HrGBh_3960imMuRCleX4Aj1me5pGrImMSgYKWfxS2=w544-h544-l90-rj",
        url: `${utils_1.server[3]}/listen/Bin Bulaye - Dino James`,
        Duration: "4: 37",
        Artist: "Dino James",
        Type: "Single",
        releaseDate: (0, utils_1.date)("24-11-2021")
    },
    {
        _albumId: "61a34a6b983c0b19f048bc38",
        Album: "Agneepath",
        AlbumArtist: "Ajay-Atul",
        Type: "Album",
        Year: "2011",
        Color: "rgba(72,24,16,1)",
        releaseDate: (0, utils_1.date)("16-12-2011"),
        Thumbnail: "https://lh3.googleusercontent.com/8R_aFURgdR4cGtk_ScZpX2UoQFqW5x7MOeFSvoh7yvdlK6UJ0tk6zEuyxxv2xhTt2-6OhqKWAsAhZeU=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "61a34a75310af919fa6284a1",
                Title: "Chikni Chameli",
                Artist: "Ajay-Atul, Shreya Ghoshal",
                url: `${utils_1.server[3]}/listen/Chikni Chameli - Agneepath`,
                Duration: "5: 03"
            },
            {
                _trackId: "61a34a7b01eede1a0207350c",
                Title: "Abhi Mujh Mein Kahin",
                Artist: "Ajay-Atul, Sonu Nigam",
                url: `${utils_1.server[3]}/listen/Abhi Mujh Mein Kahin - Agneepath`,
                Duration: "6: 04"
            }
        ]
    },
    {
        _albumId: "61a619a270ad25981ddb0742",
        _trackId: "61a619a270ad25981ddb0742",
        Album: 'Goat Dekho',
        AlbumArtist: "Raftaar",
        Year: "2021",
        Color: "rgba(216,176,0,1)",
        Thumbnail: "https://lh3.googleusercontent.com/ihQDeWHeE8F1JaNzmOz5DyauIr3onX_zmnj1ic5fUeK0F-Pe6c4kgk4zcDgJFD2yuHBY_sd2efNakCnU7A=w544-h544-l90-rj",
        url: `${utils_1.server[3]}/listen/Goat Dekho - Raftaar`,
        Duration: "3: 33",
        Artist: "Raftaar",
        Type: "Single",
        releaseDate: (0, utils_1.date)("30-11-2021")
    },
    {
        _albumId: "61be0b94fa2f43136d8894d6",
        _trackId: "61be0b94fa2f43136d8894d6",
        Album: 'Bijlee Bijlee',
        AlbumArtist: "Harrdy Sandhu",
        Year: "2021",
        Color: "rgba(216,96,96,1)",
        Thumbnail: "https://lh3.googleusercontent.com/nR9vBx-e1fjukK48Z9-P14B_WuRLWRV9Dxdy9elRJOUOJtVWUVS50TK3r_xxNILCbHFv80bTtUcjJzky=w544-h544-l90-rj",
        url: `${utils_1.server[3]}/listen/Bijlee Bijlee - Harrdy Sandhu`,
        Duration: "2: 48",
        Artist: "Harrdy Sandhu",
        Type: "Single",
        releaseDate: (0, utils_1.date)("30-10-2021")
    },
    {
        _albumId: "61ade3761e67eb6bb1367c8c",
        Album: "83 (Original Motion Picture Soundtrack)",
        AlbumArtist: "Pritam",
        Type: "Album",
        Year: "2021",
        Color: "rgba(128,112,64,1)",
        releaseDate: (0, utils_1.date)("23-12-2021"),
        Thumbnail: "https://lh3.googleusercontent.com/yuANI6Qzit_8UZ_NG543ooMjP6mUTYgi6nB-HcNW9OjQTa5CgMWox1v56KZiApl_0Cj59rLpzJNVFaYRhg=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "61c84238c64eb9c75baa3989",
                Title: "Lehra Do",
                Artist: "Pritam, Arijit Singh",
                Duration: "3: 37",
                url: `${utils_1.server[3]}/listen/Lehra Do - 83`
            },
            {
                _trackId: "61c84250ee9aebd785d1b0ee",
                Title: "Jeetega Jeetega Film Version",
                Artist: "Pritam, Arijit Singh",
                Duration: "3: 57",
                url: `${utils_1.server[3]}/listen/Jeetega Jeetega Film Version - 83`
            }
        ]
    },
    {
        _albumId: "61f3997a57824141a6ea9b4e",
        _trackId: "61f3997a57824141a6ea9b4e",
        Album: "Excuses",
        AlbumArtist: "AP Dhillon, Gurinder Gill, Intense",
        Year: "2020",
        Color: "rgba(200,88,160,1)",
        Thumbnail: "https://lh3.googleusercontent.com/YodB8IMuc531lUrvJBl5gwh5yl242hTBKfVj-cpk4oFOqOm-wElw5Lcw3_DvagrR0arcXXs19l6xr6MN5Q=w544-h544-l90-rj",
        url: `${utils_1.server[3]}/listen/Excuses - AP Dhillon`,
        Duration: "2: 56",
        Artist: "AP Dhillon, Gurinder Gill, Intense",
        Type: "Single",
        lyrics: true,
        sync: true,
        releaseDate: (0, utils_1.date)("24-07-2020")
    },
    {
        _albumId: "61f512bd92c8fdab6123aadd",
        _trackId: "61f512bd92c8fdab6123aadd",
        Album: "Insane",
        AlbumArtist: "AP Dhillon, Shinda Kahlon, Gurinder Gill, Gminxr",
        Year: "2021",
        Color: "rgba(152,112,112,1)",
        Thumbnail: "https://lh3.googleusercontent.com/KeEBJiN7-fZM1K8i9Kzvo3lvMCOik6rfSV-pQETMJZnJzEh760ICEeFnJQFCFzB5DbOYFc97UfaBuRpymQ=w544-h544-l90-rj",
        url: `${utils_1.server[3]}/listen/Insane - AP Dhillon`,
        Duration: "3: 26",
        Artist: "AP Dhillon, Shinda Kahlon, Gurinder Gill, Gminxr",
        Type: "Single",
        releaseDate: (0, utils_1.date)("16-04-2021")
    },
    {
        _albumId: "61f7da84630ef2ada31c7d1f",
        Album: "HIDDEN GEMS",
        AlbumArtist: "Various Artists",
        Type: "Album",
        Year: "2021",
        Color: "rgba(136,176,192,1)",
        releaseDate: (0, utils_1.date)("21-11-2021"),
        Thumbnail: "https://lh3.googleusercontent.com/ciA_XfgFe6uevhFb3AimcHHFbXZBD6sV9Vj3tTgjNcNwXsdozzE9ESOMUJD9LVke8DA9KWqEwQSEwvIk=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "61f7da941c12066f17bbd74e",
                Title: "DESIRES",
                Artist: "AP Dhillon, Gurinder Gill",
                Duration: "2: 48",
                url: `${utils_1.server[3]}/listen/Desires - AP Dhillon`
            },
            {
                _trackId: "6203dc38e8924d614f5c4381",
                Title: "TERE TE",
                Artist: "AP Dhillon, Gurinder Gill",
                Duration: "1: 54",
                url: `${utils_1.server[3]}/listen/Tere Te - AP Dhillon`
            }
        ]
    },
    {
        _albumId: "61f7daa03d50ac2162ffd6e3",
        _trackId: "61f7daa03d50ac2162ffd6e3",
        Album: "Saada Pyaar",
        AlbumArtist: "AP Dhillon, Gurinder Gill, Money Musik",
        Year: "2021",
        Color: "rgba(192,104,104,1)",
        Thumbnail: "https://lh3.googleusercontent.com/pU8_889hY9-x1v-fFWaCAggLbf90jchYYxXUmDMd5sy6-aIoyv4TA-DcdQkAqzOtb9_KvqhQX_CyTX6E=w544-h544-l90-rj",
        url: `${utils_1.server[3]}/listen/Saada Pyaar - AP Dhillon`,
        Duration: "3: 33",
        Artist: "AP Dhillon, Gurinder Gill, Money Musik",
        Type: "Single",
        releaseDate: (0, utils_1.date)("19-12-2021")
    },
    {
        _albumId: "62074f10bbb6250989a312bd",
        Album: "The Carnival",
        AlbumArtist: "King",
        Type: "Album",
        Year: "2020",
        Color: "rgba(184,8,32,1)",
        releaseDate: (0, utils_1.date)("21-09-2020"),
        Thumbnail: "https://lh3.googleusercontent.com/BhJJKc9QEjxLIu4yL7Dd0HixVF5QHC4B9VEF8dbCQlUB2CV8HPMUU3Xe-G9ggCPsDbrDUQmOtgQ67pU=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "62130a825fae3f55cc7a93df",
                Title: "IICONIC",
                Artist: "King",
                Duration: "2: 58",
                lyrics: true,
                sync: true,
                url: `${utils_1.server[3]}/listen/IICONIC - King`
            },
            {
                _trackId: "62074f256eeadc2d59864985",
                Title: "Tu Aake Dekhle",
                Artist: "King",
                Duration: "4: 30",
                lyrics: true,
                sync: true,
                url: `${utils_1.server[3]}/listen/Tu Aake Dekhle - King`
            }
        ]
    },
    {
        _albumId: "620e853704d56a3ca0316f7e",
        _trackId: "620e853704d56a3ca0316f7e",
        Album: 'Arabic Kuthu - Halamithi Habibo (From "Beast")',
        AlbumArtist: "Anirudh Ravichander, Jonita Gandhi",
        Year: "2022",
        Color: "rgba(96,48,8,1)",
        Thumbnail: "https://lh3.googleusercontent.com/O4RhrlnxH-04BkiZEGih1ZfpkRwsbF4gsF-fGJL0jUactIoK732grGn3FWbKdhTqkBvRK9Hvw2riIetI=w544-h544-l90-rj",
        url: `${utils_1.server[3]}/listen/Arabic Kuthu - Beast`,
        Duration: "4: 39",
        Artist: "Anirudh Ravichander, Jonita Gandhi",
        Type: "Single",
        releaseDate: (0, utils_1.date)("14-02-2022")
    },
    {
        _albumId: "6211d3efb88608687a3aadde",
        Album: "Insaan",
        AlbumArtist: "MC STAN",
        Type: "Album",
        Year: "2022",
        Color: "rgba(72,24,16,1)",
        releaseDate: (0, utils_1.date)("18-02-2022"),
        Thumbnail: "https://lh3.googleusercontent.com/GGCm9oWw7Y3QqAzt8s88mG1Sx1oBbOqS1m-HrO2RleH2LuQ7US2keO3wvLONNeV8Wg8gP7q91czbWS7u=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "6211d4158189f980eaed3c78",
                Title: "Insaan",
                Artist: "MC STAN",
                Duration: "3: 25",
                url: `${utils_1.server[3]}/listen/Insaan - MC STAN`
            }
        ]
    },
    {
        _albumId: "621a1005c91e656764dc741f",
        _trackId: "621a1005c91e656764dc741f",
        Album: "Afsanay",
        AlbumArtist: "Talhah Yunus, Talha Anjum, Young Stunners",
        Year: "2021",
        Color: "rgba(32,48,72,1)",
        Thumbnail: "https://lh3.googleusercontent.com/YSYw9bEsPrFrSl4fp4GN0zBUE95KJ99nsWgrZEfvHCIlnyxN4yl3FcDV2T4g4EsJKaWqmB4OeBJA5FHE=w544-h544-l90-rj",
        url: `${utils_1.server[3]}/listen/Afsanay - Young Stunners`,
        Duration: "5: 43",
        lyrics: true,
        sync: true,
        Artist: "Talhah Yunus, Talha Anjum, Young Stunners",
        Type: "Single",
        releaseDate: (0, utils_1.date)("30-03-2021")
    },
    {
        _albumId: "622b4f2b3ed66d16a2a3da24",
        _trackId: "622b4f2b3ed66d16a2a3da24",
        Album: "Blowing Up",
        AlbumArtist: "KR$NA",
        Year: "2022",
        Color: "rgba(168,0,16,1)",
        Thumbnail: "https://lh3.googleusercontent.com/3TmeIq-T8Xs199YMt3U2ISMYTTUqx-AZ2QCKxbGdSX-Zav2Ir3qUSXuQJOpqI2_FKEuEE4xr3_k8vcIB=w544-h544-l90-rj",
        url: `${utils_1.server[3]}/listen/Blowing Up - KR$NA`,
        Duration: "4: 07",
        Artist: "KR$NA",
        Type: "Single",
        releaseDate: (0, utils_1.date)("10-03-2022")
    },
    {
        _albumId: "622f6495030f1e1c45eb5111",
        Album: "Retropanda - Part 1",
        AlbumArtist: "Badshah",
        Type: "Album",
        Year: "2022",
        Color: "rgba(248,48,200,1)",
        releaseDate: (0, utils_1.date)("14-03-2022"),
        Thumbnail: "https://lh3.googleusercontent.com/l9kGz-BKvEVpkeNFDSpbLEWri4Aph-fo8LAwXjDY9nfyEHIhdbgSHdH37FB_XhG5c59mpAmCF0OvkKUx=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "622f64afbf0711dbfc77aba5",
                Title: "Chamkeela Chehra",
                Artist: "Badshah",
                Duration: "2: 59",
                url: `${utils_1.server[3]}/listen/Chamkeela Chehra - Badshah`
            },
            {
                _trackId: "622f64c2933170a53ac5f3cb",
                Title: "Hosh",
                Artist: "Badshah, Aastha Gill",
                Duration: "4: 00",
                url: `${utils_1.server[3]}/listen/Hosh - Badshah`
            },
            {
                _trackId: "622f64cffdd4485bd141605c",
                Title: "Jugnu",
                Artist: "Badshah, Nikhita Gandhi",
                Duration: "3: 51",
                url: `${utils_1.server[0]}/listen/Jugnu - Badshah`
            }
        ]
    },
    {
        _albumId: "624eaf5362fe7a54b3e16500",
        _trackId: "624eaf5362fe7a54b3e16500",
        Album: "Ilzaam (From the album 'Industry')",
        AlbumArtist: "Arjun Kanungo, King",
        Type: "Single",
        Year: "2022",
        Color: "rgba(224,104,0,1)",
        releaseDate: (0, utils_1.date)("07-04-2022"),
        Thumbnail: "https://lh3.googleusercontent.com/8Fy-s-L452gIiiLyz4RLwyPduIwIz4odTgCZnoS4zMI2t48wLIDfH1F4af6xABbkwtfN7UfUMMAjczWcrw=w544-h544-l90-rj",
        Artist: "Arjun Kanungo, King",
        Duration: "4: 07",
        url: `${utils_1.server[3]}/listen/Ilzaam - Arjun Kanungo`
    },
    {
        _albumId: "624d49a463676eeef260a0b7",
        _trackId: "624d49a463676eeef260a0b7",
        Album: 'Pasoori (From Coke Studio: Season 14)',
        AlbumArtist: "Shae Gill, Ali Sethi",
        Type: "Single",
        Year: "2022",
        Color: "rgba(192,88,0,1)",
        releaseDate: (0, utils_1.date)("06-02-2022"),
        Thumbnail: "https://lh3.googleusercontent.com/uLpBZlZqkYQewkxUKaoMgN5kj2HK2tECEP2hwHaYQSVoI54VKyY7p-gjD0bwvQ8n1t0IEo1k7buJP2K3=w544-h544-l90-rj",
        Artist: "Shae Gill, Ali Sethi",
        Duration: "3: 44",
        url: `${utils_1.server[3]}/listen/Pasoori - CokeStudio14`
    },
    {
        _albumId: "626ff94d7b39fa0d05d9560e",
        _trackId: "626ff94d7b39fa0d05d9560e",
        Album: 'Bhool Bhulaiyaa 2 Title Track (From "Bhool Bhulaiyaa 2")',
        AlbumArtist: "Pritam, Tanishk Bagchi, Neeraj Shridhar",
        Type: "Single",
        Year: "2022",
        Color: "rgba(40,120,168,1)",
        releaseDate: (0, utils_1.date)("02-05-2022"),
        Thumbnail: "https://lh3.googleusercontent.com/bCmYseAlprwJvjh-7_K2OVJ2DeKOJW_kkEnNoxiuWFRpFek-r9e6WGCM8zHZwMDxt2WVg8Z_aoxGvuPs=w544-h544-l90-rj",
        Artist: "Pritam, Tanishk Bagchi, Neeraj Shridhar",
        Duration: "3: 31",
        url: `${utils_1.server[3]}/listen/Bhool Bhulaiyaa 2 Title Track`
    },
    {
        _albumId: "62834b773cce6ad885d06ed9",
        _trackId: "62834b773cce6ad885d06ed9",
        Album: "Lil Bunty",
        AlbumArtist: "KR$NA",
        Type: "Single",
        Year: "2022",
        Color: "rgba(32,104,168,1)",
        releaseDate: (0, utils_1.date)("16-05-2022"),
        Thumbnail: "https://lh3.googleusercontent.com/dqfS8zDQx_oamrVcDvJBpU9N14Rvt9CYCtXLrwGVyFiYnLxGb2cNCeMbo5TXDwOolfz9Nq80UbqmkIdT=w544-h544-l90-rj",
        Artist: "KR$NA",
        Duration: "3: 12",
        url: `${utils_1.server[3]}/listen/Lil Bunty - KR$NA`
    },
    {
        _albumId: "62cc269f521470695eb32ce5",
        _trackId: "62cc269f521470695eb32ce5",
        Album: 'Machayenge 4',
        AlbumArtist: "KR$NA",
        Type: "Single",
        Year: "2022",
        Color: "rgba(64,64,64,1)",
        releaseDate: (0, utils_1.date)("08-07-2022"),
        Thumbnail: "https://lh3.googleusercontent.com/WFi1g4QxLhsFG2gAY6EQ4WKZLlfnTQaj3c-6dGLK2vLWstJBxIV5Le3htmhLLP270MTXHVWX-eW_mFvNMg=w544-h544-l90-rj",
        Artist: "KR$NA",
        Duration: "6: 41",
        url: `${utils_1.server[3]}/listen/Machayenge 4 - KR$NA`,
        lyrics: true,
        sync: true
    },
    {
        _albumId: "62e3827fffa64d48ecf4356b",
        _trackId: "62e3827fffa64d48ecf4356b",
        Album: 'NO LOVE',
        AlbumArtist: "Shubh",
        Type: "Single",
        Year: "2022",
        Color: "rgba(40,48,104,1)",
        releaseDate: (0, utils_1.date)("26-02-2022"),
        Thumbnail: "https://lh3.googleusercontent.com/G2ryS0OQ-BJ4g94A315NXGxX3jGU0rph_zeqjBbKGkvMYQ56uLDsWHYZpLwmJmdUPZPxCE56Dw5w1fdjkA=w544-h544-l90-rj",
        Artist: "Shubh",
        Duration: "2: 50",
        url: `${utils_1.server[2]}/listen/NO LOVE - Shubh`
    },
    {
        _albumId: "636a2ccf59486d4f99921218",
        _trackId: "636a2ccf59486d4f99921218",
        Album: "Apna Bana Le (From 'Bhediya')",
        AlbumArtist: "Sachin-Jigar",
        Type: "Single",
        Year: "2022",
        Color: "rgba(184,216,232,1)",
        releaseDate: (0, utils_1.date)("05-11-2022"),
        Thumbnail: "https://lh3.googleusercontent.com/EqN-4y9jQg91mt-94KKI8L1xu3olMS-Fh_WLL5tMlnqh1pSRzt-uWdnTVlY_GBnvLuA_WJmS6FYAXJlZtQ=w544-h544-l90-rj",
        Artist: "Arijit Singh",
        Duration: "4: 21",
        url: `${utils_1.server[2]}/listen/Apna Bana Le - Bhediya`
    },
    {
        _albumId: "63b42e97c49ce709fc1126e5",
        Album: "HARD DRIVE Vol. 1",
        AlbumArtist: "Raftaar",
        Type: "Album",
        Year: "2022",
        Color: "rgba(192,120,152,1)",
        releaseDate: (0, utils_1.date)("16-11-2022"),
        Thumbnail: "https://lh3.googleusercontent.com/BlQuWQuPN4hXb2i4vzxBZFo1Hq5phUQcoJm83jDDGNOwWSnwkkQBpDPL4Y66m0JnoUAogDDeaxogKpA=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "63b42eaf8f0855c2ba467071",
                Title: "ICE",
                Artist: "Raftaar",
                Duration: "2: 48",
                url: `${utils_1.server[3]}/listen/ICE - Raftaar`
            },
            {
                _trackId: "63b42eb97a5ddd8075215e32",
                Title: "F16",
                Artist: "Raftaar, Sikander Kahlon",
                Duration: "3: 29",
                url: `${utils_1.server[3]}/listen/F16 - Raftaar`
            },
            {
                _trackId: "63b42ec1107364f422e0d208",
                Title: "GANGNUM",
                Artist: "Raftaar, Deep Kalsi",
                Duration: "2: 50",
                url: `${utils_1.server[3]}/listen/GANGNUM - Raftaar`
            },
            {
                _trackId: "63b42ecacc527ac7fdd7185e",
                Title: "NO CHINA",
                Artist: "Raftaar, KR$NA",
                Duration: "3: 18",
                url: `${utils_1.server[3]}/listen/NO CHINA - Raftaar`
            },
            {
                _trackId: "63b42ed3fafbed3f578b3e4c",
                Title: "36",
                Artist: "Raftaar, Karma",
                Duration: "3: 58",
                url: `${utils_1.server[3]}/listen/36 - Raftaar`
            },
            {
                _trackId: "63b42edaf4c0615d05859e94",
                Title: "RAASHAH",
                Artist: "Raftaar, Badshah",
                Duration: "3: 40",
                url: `${utils_1.server[3]}/listen/RAASHAH - Raftaar`
            }
        ]
    },
    {
        _albumId: "63da71fd42e734af91ee21c3",
        Album: "Two Hearts Never Break The Same",
        AlbumArtist: "AP Dhillon",
        Type: "Album",
        Year: "2022",
        Color: "rgba(176,24,24,1)",
        releaseDate: (0, utils_1.date)("07-10-2022"),
        Thumbnail: "https://lh3.googleusercontent.com/vWZmXgoqDLCBZk3nU5JvkM7KtviNkgk2MUbF43uilh9v1QMHvKIU4oQGy1uWB6hWv9tV6mjgM0DXu_gk=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "63da72042fa165cda9d41106",
                Title: "All Night (Live)",
                Artist: "AP Dhillon, Shinda Kahlon",
                Duration: "3: 49",
                url: `${utils_1.server[3]}/listen/All Night (Live) - AP Dhillon`
            },
            {
                _trackId: "62f39b42ae5efdf6e9028a65",
                Title: "Summer High",
                Artist: "AP Dhillon",
                Duration: "2: 57",
                url: `${utils_1.server[3]}/listen/Summer High - AP Dhillon`
            },
            {
                _trackId: "63da720c22f071182720d615",
                Title: "Dil Nu",
                Artist: "AP Dhillon, Shinda Kahlon",
                Duration: "3: 53",
                url: `${utils_1.server[3]}/listen/Dil Nu - AP Dhillon`
            }
        ]
    },
    {
        _albumId: "645e46d7588671ad8aab8557",
        Album: "Tu Jhoothi Main Makkaar",
        AlbumArtist: "Pritam",
        Type: "Album",
        Year: "2023",
        Color: "rgba(8,152,184,1)",
        releaseDate: (0, utils_1.date)("16-03-2023"),
        Thumbnail: "https://lh3.googleusercontent.com/3KkjFrmhYWsKJJ7JYaeQB_se2hy4NTfRnHnbTjkG8mHDK2uccgyYDkOMQPClHcC4iwSWHI6IqlnFXLvB-Q=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "645e46df73c1ce09849725e8",
                Title: "Tere Pyaar Mein",
                Artist: "Pritam, Arijit Singh, Nikhita Gandhi",
                Duration: "4: 25",
                url: `${utils_1.server[3]}/listen/Tere Pyaar Mein - Tu Jhoothi Main Makkaar`
            },
            {
                _trackId: "645e46e5d62c3e9d2d42ce64",
                Title: "Pyaar Hota Kayi Baar Hai",
                Artist: "Pritam, Arijit Singh",
                Duration: "3: 36",
                url: `${utils_1.server[3]}/listen/Pyaar Hota Kayi Baar Hai - Tu Jhoothi Main Makkaar`
            },
            {
                _trackId: "645e46ec56a55e3bfe455661",
                Title: "O Bedardeya",
                Artist: "Pritam, Arijit Singh",
                Duration: "5: 13",
                url: `${utils_1.server[3]}/listen/O Bedardeya - Tu Jhoothi Main Makkaar`,
                lyrics: true,
                sync: true
            },
            {
                _trackId: "64b619c6809da0e7a932c2c5",
                Title: "Jaadui",
                Artist: "Pritam, Jubin Nautiyal",
                Duration: "3: 42",
                url: `${utils_1.server[3]}/listen/Jaadui - Tu Jhoothi Main Makkaar`,
                lyrics: true,
                sync: true
            }
        ]
    },
    {
        _albumId: "648fe8bf8811d884880efb89",
        Album: "Spider-Man: Across The Spider Verse (SOUNDTRACK FROM THE MOTION PICTURE)",
        AlbumArtist: "Metro Boomin",
        Type: "Album",
        Year: "2023",
        Color: "rgba(192,8,104,1)",
        releaseDate: (0, utils_1.date)("02-06-2023"),
        Thumbnail: "https://lh3.googleusercontent.com/rra9ajpG50BoWyxszMpVqMAloA83Q1p3V4ryNrtDhAriAqvxyNAEAKU0KDs0JoxgDKoSsiWe_GDWong=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "648fe8cefeb92daef6ab02a2",
                Title: "Annihilate (Metro Boomin & Swae Lee, Lil Wayne, Offset)",
                Artist: "Metro Boomin, Swae Lee, Lil Wayne, Offset",
                Duration: "3: 52",
                url: `${utils_1.server[3]}/listen/Annihilate - Spider Man Across The Spider Verse`
            }
        ]
    },
    {
        _albumId: "64b53418febfcb823e932e7b",
        _trackId: "64b53418febfcb823e932e7b",
        Album: "Akhiyaan",
        AlbumArtist: "Mitraz",
        Type: "Single",
        Year: "2022",
        Color: "rgba(24,40,64,1)",
        releaseDate: (0, utils_1.date)("04-09-2022"),
        Thumbnail: "https://lh3.googleusercontent.com/JSwQ_BbPakmEGEZm5B81TRq0GuC4mMfoW76w0vfgpxuy57pH_xiwQzVLUxW5XB3dgoE21w5z8s_q4DyM=w544-h544-l90-rj",
        Artist: "Mitraz",
        Duration: "3: 11",
        url: `${utils_1.server[3]}/listen/Akhiyaan - Mitraz`
    },
    {
        _albumId: "64b9a45c6c78391cb0953627",
        Album: "Brahmastra (Original Motion Picture Soundtrack)",
        AlbumArtist: "Pritam",
        Type: "Album",
        Year: "2022",
        Color: "rgba(176,56,48,1)",
        releaseDate: (0, utils_1.date)("06-10-2022"),
        Thumbnail: "https://lh3.googleusercontent.com/eLoQKzskAIeNPego41FH2sz5uFy-A3Ynf1rcNdQ4eKv4J10atKk_RKbZDnQ3Ja-UNM8mKSu_-8gNeVYp4g=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "64b9a465634ff38911a8776e",
                Title: "Kesariya",
                Artist: "Arijit Singh",
                Duration: "4: 28",
                // url: `${server[3]}/listen/Kesariya - Brahmastra`,
                url: `${utils_1.server[3]}/hls/listen/Kesariya - Brahmastra/output.m3u8`,
                lyrics: true,
                sync: true
            },
            {
                _trackId: "64b9a46cef4cca544fd30f19",
                Title: "Deva Deva",
                Artist: "Arijit Singh, Jonita Gandhi",
                Duration: "4: 39",
                url: `${utils_1.server[3]}/listen/Deva Deva - Brahmastra`
            },
            {
                _trackId: "64b9a47489bde39f28d7aee3",
                Title: "Dance Ka Bhoot",
                Artist: "Arijit Singh",
                Duration: "4: 05",
                url: `${utils_1.server[3]}/listen/Dance Ka Bhoot - Brahmastra`
            },
            {
                _trackId: "64b9a47b1ef27c91138d7d63",
                Title: "Kesariya - Dance Mix",
                Artist: "Shashwat Singh, Antara Mitra, Arijit Singh",
                Duration: "3: 17",
                url: `${utils_1.server[3]}/listen/Kesariya Dance Mix - Brahmastra`
            }
        ]
    },
    {
        _albumId: "64bbbfe78b9da037dda51690",
        Album: "Champagne Talk",
        AlbumArtist: "King",
        Type: "Album",
        Year: "2022",
        Color: "rgba(0,64,72,1)",
        releaseDate: (0, utils_1.date)("12-10-2022"),
        Thumbnail: "https://lh3.googleusercontent.com/B8qfmAm8BOtXmSEwYMkcotK6nun-imczlC1r8OyeCxGMJqqfoxFkqCWL38MgFN3dcmYp63PLo4aQYbo=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "64bbbff9076b8ff8f68d3782",
                Title: "Maan Meri Jaan",
                Artist: "King",
                url: `${utils_1.server[3]}/listen/Maan Meri Jaan - King`,
                Duration: "3: 14",
                lyrics: true,
                sync: true
            }
        ]
    },
    {
        _albumId: "64d1017676dcba781b8ca9de",
        _trackId: "64d1017676dcba781b8ca9de",
        Album: "Sleepless",
        AlbumArtist: "AP Dhillon",
        Type: "Single",
        Year: "2023",
        Color: "rgba(56,136,192,1)",
        releaseDate: (0, utils_1.date)("14-07-2023"),
        Thumbnail: "https://lh3.googleusercontent.com/UnVfQfslFpPo8lsWo6deKarzpxcduZLMzSOzaLlIu0e_q6k9GinlR_3v8859t6Wiw4PCrCBmhL5K73s=w544-h544-l90-rj",
        Artist: "AP Dhillon",
        Duration: "2: 36",
        url: `${utils_1.server[3]}/listen/Sleepless - AP Dhillon`,
        lyrics: true,
        sync: true
    },
    {
        _albumId: "64d262be6abab9aaa8fb15f0",
        Album: "Laal Singh Chaddha",
        AlbumArtist: "Pritam",
        Type: "Album",
        Year: "2022",
        Color: "rgba(208,184,104,1)",
        releaseDate: (0, utils_1.date)("05-08-2022"),
        Thumbnail: "https://lh3.googleusercontent.com/EKLJnn97hUrFSI2R4hFqrWT5yfznhIS8o_e3mJKgSN07wFjFXGFMUROm28GZodfkFU1gYn1Hwazg0fr7ow=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "64d262c6c1842b32b7a9b2c1",
                Title: "Phir Na Aisi Raat Aayegi",
                Artist: "Arijit Singh",
                url: `${utils_1.server[3]}/listen/Phir Na Aisi Raat Aayegi - Laal Singh Chaddha`,
                Duration: "4: 45",
                lyrics: true,
                sync: true
            },
            {
                _trackId: "64d262cea1a40ce66059b59f",
                Title: "Tere Hawaale",
                Artist: "Arijit Singh, Shilpa Rao",
                url: `${utils_1.server[3]}/listen/Tere Hawaale - Laal Singh Chaddha`,
                Duration: "5: 46",
                lyrics: true,
                sync: true
            },
            {
                _trackId: "6671369d6be1c476d0a45fad",
                Title: "Tere Hawale (Arijit - Shreya Duet)",
                Artist: "Arijit Singh, Shreya Ghoshal",
                url: `${utils_1.server[3]}/hls/listen/Tere Hawale (Arijit - Shreya Duet) - Laal Singh Chaddha/output.m3u8`,
                Duration: "5: 48"
            }
        ]
    },
    {
        _albumId: "64d8b982d7a9efc6cc7646b9",
        _trackId: "64d8b982d7a9efc6cc7646b9",
        Album: "With You",
        AlbumArtist: "AP Dhillon",
        Type: "Single",
        Year: "2023",
        Color: "rgba(3,127,140,1)",
        releaseDate: (0, utils_1.date)("11-08-2023"),
        Thumbnail: "https://lh3.googleusercontent.com/pi19qcxHlxeVbw9V5hf-hxziqz7MV_Q9L9gRvr-XlcDkyZBOp4E4Veq78sMxD__cU83n8ar2BNqZ7XzW=w544-h544-l90-rj",
        Artist: "AP Dhillon",
        Duration: "2: 34",
        url: `${utils_1.server[3]}/listen/With You - AP Dhillon`
    },
    {
        _albumId: "64e0deea63133c1465d21924",
        Album: "Still Rollin",
        AlbumArtist: "Shubh",
        Type: "Album",
        Year: "2023",
        Color: "rgba(184,200,192,1)",
        LightColor: "rgba(184,200,192,1)",
        DarkColor: "rgba(111,121,116,1)",
        releaseDate: (0, utils_1.date)("19-05-2023"),
        Thumbnail: "https://lh3.googleusercontent.com/V_w7m2kuoVshpqcS1-RlEl-aONMQcGjP84WSo1tJS5IU8IDCr0v0s0NBMMGrLXtlL4CNjUKEdXcN3gAy=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "64e0dedd6145a50bdf7e3957",
                Title: "Still Rolling",
                Artist: "Shubh",
                url: `${utils_1.server[3]}/listen/Still Rollin - Shubh`,
                Duration: "2: 54"
            },
            {
                _trackId: "64e0dee3d57bade66fcb2728",
                Title: "Cheques",
                Artist: "Shubh",
                url: `${utils_1.server[3]}/listen/Cheques - Shubh`,
                Duration: "3: 03"
            }
        ]
    },
    {
        _albumId: "64e0dffaa7d412715c775bd2",
        _trackId: "64e0dffaa7d412715c775bd2",
        Album: "One Love",
        AlbumArtist: "Shubh",
        Type: "Single",
        Year: "2023",
        Color: "rgba(56,48,48,1)",
        releaseDate: (0, utils_1.date)("18-08-2023"),
        Thumbnail: "https://lh3.googleusercontent.com/1L5hDbqWRfzoPbCYQtNJLMqIr3KLQB4a0uzkkm8M_Ef9GrXsGkmdVp46dx6JDKr_h0qUPBlOJCYumds=w544-h544-l90-rj",
        Artist: "Shubh",
        Duration: "2: 39",
        url: `${utils_1.server[3]}/listen/One Love - Shubh`
    },
    {
        _albumId: "64ed975cdc7d21a92a24fc9f",
        Album: "FAR FROM OVER",
        AlbumArtist: "KR$NA",
        Type: "Album",
        Year: "2023",
        Color: "rgba(83,83,83,1)",
        releaseDate: (0, utils_1.date)("29-08-2023"),
        Thumbnail: "https://lh3.googleusercontent.com/dRdjS1dtvLGzVVDfyFpvATYf9Ee7ZZDeFNPO6-5XcfxpKn9x0DGQkq4R2F4PkGIBrAXILpefqOVmZAGI=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "64ef5744105029ea87ef3bf8",
                Title: "Still Standing",
                Artist: "KR$NA",
                url: `${utils_1.server[3]}/listen/Still Standing - KR$NA`,
                Duration: "3: 02"
            },
            {
                _trackId: "64ed9763414b8306c3cd0821",
                Title: "Prarthana",
                Artist: "KR$NA, Bharg",
                url: `${utils_1.server[3]}/listen/Prarthana - KR$NA`,
                Duration: "3: 19"
            },
            {
                _trackId: "64ef574c5f3140d6a643c144",
                Title: "Wanna Know",
                Artist: "KR$NA",
                url: `${utils_1.server[3]}/listen/Wanna Know - KR$NA`,
                Duration: "3: 25"
            },
            {
                _trackId: "64ef5754bcb03801a9afbe72",
                Title: "Hola Amigo",
                Artist: "KR$NA, Seedhe Maut, Umair",
                url: `${utils_1.server[3]}/listen/Hola Amigo - KR$NA`,
                Duration: "3: 46"
            },
            {
                _trackId: "64ef575ac7db0d2fe36f1033",
                Title: "Some Of Us",
                Artist: "KR$NA, AR Paisley",
                url: `${utils_1.server[3]}/listen/Some Of Us - KR$NA`,
                Duration: "3: 45"
            }
        ]
    },
    {
        _albumId: "64f0049484caf20c1477806f",
        _trackId: "64f0049484caf20c1477806f",
        Album: "CROWN",
        AlbumArtist: "King, Natania",
        Type: "Single",
        Year: "2023",
        Color: "rgba(208,8,24,1)",
        releaseDate: (0, utils_1.date)("23-08-2023"),
        Thumbnail: "https://lh3.googleusercontent.com/OQRDqhEUJli_P9Uwr6c2EJYN77d_9F2sHx4LEWIQhYCaD5alK9UgY7st8ODZQJI_834JNo9iqelOP46D=w544-h544-l90-rj",
        Artist: "King, Natania",
        Duration: "3: 17",
        url: `${utils_1.server[3]}/listen/CROWN - King`,
        lyrics: true,
        sync: true
    },
    {
        _albumId: "652f9232162331b12f7322aa",
        Album: "NEW LIFE",
        AlbumArtist: "King",
        Type: "Album",
        Year: "2023",
        Color: "rgba(86,89,2,1)",
        releaseDate: (0, utils_1.date)("18-10-2023"),
        Thumbnail: "https://lh3.googleusercontent.com/qPrZgSfmJdIslapEgSDUZFouozBidqBHDkc-u4Xl6zoG9qKkrMSqXx1OXXEgXmFxhCzQ5g5646sy_T3kiw=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "65354b2b402b4c9354780dcb",
                Title: "Tu Jaana Na Piya",
                Artist: "King",
                url: `${utils_1.server[3]}/hls/listen/Tu Jaana Na Piya - King/output.m3u8`,
                Duration: "3: 46",
                lyrics: true,
                sync: true
            },
            {
                _trackId: "652f923968b821749dd7821d",
                Title: "Sarkaare",
                Artist: "King",
                url: `${utils_1.server[3]}/hls/listen/Sarkaare - King/output.m3u8`,
                Duration: "2: 43",
                lyrics: true,
                sync: true
            }
        ]
    },
    {
        _albumId: "65355c14f518db1f404c800a",
        _trackId: "65355c14f518db1f404c800a",
        Album: "STILL NUMBER 1",
        AlbumArtist: "Emiway Bantai",
        Type: "Single",
        Year: "2023",
        Color: "rgba(248,16,8,1)",
        DarkColor: "rgba(238,15,8,1)",
        LightColor: "rgba(248,16,8,1)",
        releaseDate: (0, utils_1.date)("22-10-2023"),
        Thumbnail: "https://lh3.googleusercontent.com/y8O50Ie2tSWzq3YdSEvMdN2U6bNBPNywyxo7CA5A8Ygnoi46Utax78peXpM08udtS65EjFOLGYIyM7A=w544-h544-l90-rj",
        Artist: "Emiway Bantai",
        Duration: "3: 55",
        url: `${utils_1.server[3]}/hls/listen/Still Number 1 - Emiway Bantai/output.m3u8`
    },
    {
        _albumId: "654b49ea0d4af4a8301beaa5",
        Album: "Leo (Original Motion Picture Soundtrack)",
        AlbumArtist: "Anirudh Ravichander",
        Type: "Album",
        Year: "2023",
        Color: "rgba(128,200,192,1)",
        LightColor: "rgba(128,200,192,1)",
        DarkColor: "rgba(81,127,122,1)",
        releaseDate: (0, utils_1.date)("19-10-2023"),
        Thumbnail: "https://lh3.googleusercontent.com/f3kYwLkC5vROJGEnO-l676KxN2KVWeCQvqBaINDlWTAHGVCzbnfB33s_pL6aHPL-qS5i1laGquX_Dt8V=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "654b49f1262dca04c274779b",
                Title: "Badass",
                Artist: "Anirudh Ravichander",
                url: `${utils_1.server[3]}/hls/listen/Badass - Leo/output.m3u8`,
                Duration: "3: 49"
            },
            {
                _trackId: "654b49f81fed57156601797f",
                Title: "Lokiverse 2.0",
                Artist: "Anirudh Ravichander",
                url: `${utils_1.server[3]}/hls/listen/Lokiverse 2.0 - Leo/output.m3u8`,
                Duration: "1: 54"
            },
            {
                _trackId: "654b49fe9f4d697718417758",
                Title: "Ordinary Person",
                Artist: "Anirudh Ravichander, Nikitha Gandhi",
                url: `${utils_1.server[3]}/hls/listen/Ordinary Person - Leo/output.m3u8`,
                Duration: "2: 18"
            }
        ]
    },
    {
        _albumId: "6560eef8795ecd2477a99a5a",
        Album: "ANIMAL",
        AlbumArtist: "Various Artists",
        Type: "Album",
        Year: "2023",
        Color: "rgba(152,80,8,1)",
        LightColor: "rgba(183,96,10,1)",
        DarkColor: "rgba(152,80,8,1)",
        releaseDate: (0, utils_1.date)("24-11-2023"),
        Thumbnail: "https://lh3.googleusercontent.com/02xLoCOZmap3ihA_v28cqFz1zBcE9cMzfwzJHzsgwxyGklT0rRWkfUqztPCgAx7CdBtVM5MahamnGuJw=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "6560ef00874de40418d32396",
                Title: "Hua Main",
                Artist: "Raghav Chaitanya, Pritam",
                url: `${utils_1.server[3]}/hls/listen/Hua Main - Animal/output.m3u8`,
                Duration: "4: 37",
                lyrics: true,
                sync: true
            },
            {
                _trackId: "6560ef07a5d2ec8882711d98",
                Title: "Satranga",
                Artist: "Arijit Singh, Shreyas Puranik",
                url: `${utils_1.server[3]}/hls/listen/Satranga - Animal/output.m3u8`,
                Duration: "4: 31",
                lyrics: true,
                sync: true
            },
            {
                _trackId: "6560ef0ca80ac5527e89ea6d",
                Title: "Papa Meri Jaan",
                Artist: "Sonu Nigam, Harshavardhan Rameshwar",
                url: `${utils_1.server[3]}/hls/listen/Papa Meri Jaan - Animal/output.m3u8`,
                Duration: "5: 21"
            },
            {
                _trackId: "65714e03a8dfd45e1112cd9f",
                Title: "Pehle Bhi Main",
                Artist: "Vishal Mishra",
                url: `${utils_1.server[3]}/hls/listen/Pehle Bhi Main - Animal/output.m3u8`,
                Duration: "4: 10"
            }
        ]
    },
    {
        _albumId: "65649f845f92287d91d00502",
        Album: "Shayad Woh Sune",
        AlbumArtist: "King",
        Type: "Album",
        Year: "2023",
        Color: "rgba(168,48,8,1)",
        LightColor: "rgba(218,62,10,1)",
        DarkColor: "rgba(168,48,8,1)",
        releaseDate: (0, utils_1.date)("14-07-2023"),
        Thumbnail: "https://lh3.googleusercontent.com/kRCAAq-mYT5FjxWOfa6d4Mb9Dw8u6bj8jFB5xPHIPy8b6_E6dmBGy6DJU7t1WqQJoux6E3z7ysu1N3-L=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "65649f8c20943b9e343d8f97",
                Title: "Laapata",
                Artist: "King",
                url: `${utils_1.server[3]}/hls/listen/Laapata - King/output.m3u8`,
                Duration: "3: 54",
                lyrics: true,
                sync: true
            },
            {
                _trackId: "65649f966515c519d99c0194",
                Title: "Teri Ho Na Saki",
                Artist: "King",
                url: `${utils_1.server[3]}/hls/listen/Teri Ho Na Saki - King/output.m3u8`,
                Duration: "3: 51",
                lyrics: true,
                sync: true
            }
        ]
    },
    {
        _albumId: "6567167081ef936ec99ca5a3",
        Album: "Rocky Aur Rani Kii Prem Kahaani",
        AlbumArtist: "Pritam",
        Type: "Album",
        Year: "2023",
        Color: "rgba(112,16,88,1)",
        LightColor: "rgba(214,31,168,1)",
        DarkColor: "rgba(112,16,88,1)",
        releaseDate: (0, utils_1.date)("14-08-2023"),
        Thumbnail: "https://lh3.googleusercontent.com/viHJ9sET-dwcH6Ur2iBlegjNafJHLNcVNMqlCCMtK-ZKM8ln4ZVprKXmt3MSryFtG7tIji3XPGanGTh1cA=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "6567167877f9533a444c069d",
                Title: "Ve Kamleya",
                Artist: "Arijit Singh, Shreya Ghoshal",
                url: `${utils_1.server[3]}/hls/listen/Ve Kamleya - Rocky Aur Rani Kii Prem Kahaani/output.m3u8`,
                Duration: "4: 07"
            }
        ]
    },
    {
        _albumId: "656d4d4ca6bc2683a18d8c9b",
        Album: "Dunki",
        AlbumArtist: "Pritam",
        Type: "Album",
        Year: "2023",
        Color: "rgba(3,90,166,1)",
        releaseDate: (0, utils_1.date)("22-11-2023"),
        Thumbnail: "https://lh3.googleusercontent.com/olTad2rSFdiV02kmWaC_xYlKkZiB6nV7279LAf1r6uar7rcyojJ4WoCc9A6kY9Cf5ecp-yUk0-NGy1c=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "656d4d535d9d4a8b3232365e",
                Title: "Lutt Putt Gaya",
                Artist: "Arijit Singh",
                url: `${utils_1.server[3]}/hls/listen/Lutt Putt Gaya - Dunki/output.m3u8`,
                Duration: "3: 43",
                lyrics: true,
                sync: true
            }
        ]
    },
    {
        _albumId: "658544cfd1b0a7b7531d9433",
        _trackId: "658544cfd1b0a7b7531d9433",
        Album: "4.10",
        AlbumArtist: "DIVINE",
        Type: "Single",
        Year: "2023",
        Color: "rgba(184,0,0,1)",
        DarkColor: "rgba(184,0,0,1)",
        LightColor: "rgba(240,0,0,1)",
        releaseDate: (0, utils_1.date)("22-12-2023"),
        Thumbnail: "https://lh3.googleusercontent.com/4XNsAsDminInTxRRMa_MzINrnVO4qHKSvyvVUl-em1czdc6VM9RERH2_HU_WOwcJsGnw9-b6-G586Ev0=w544-h544-l90-rj",
        Artist: "DIVINE",
        Duration: "2: 49",
        url: `${utils_1.server[3]}/hls/listen/4.10 - Divine/output.m3u8`
    },
    {
        _albumId: "658f862fd185e18ed0a41ddb",
        _trackId: "658f862fd185e18ed0a41ddb",
        Album: "Baarishein",
        AlbumArtist: "Anuv Jain",
        Type: "Single",
        Year: "2018",
        Color: "rgba(83,83,83,1)",
        DarkColor: "rgba(83,83,83,1)",
        LightColor: "rgba(127,127,127,1)",
        releaseDate: (0, utils_1.date)("12-01-2018"),
        Thumbnail: "https://lh3.googleusercontent.com/3-krcQ6FdG53f1ovjz5mc8b7DkDQ6tRAtXCrEQpdGM-dNECmriD7pX4i5CfLNXuaF1WP4ppPaa801Ns=w544-h544-l90-rj",
        Artist: "Anuv Jain",
        Duration: "3: 27",
        url: `${utils_1.server[3]}/hls/listen/Baarishein - Anuv Jain/output.m3u8`
    },
    {
        _albumId: "658f863f4f83f165fe166080",
        _trackId: "658f863f4f83f165fe166080",
        Album: "Gul",
        AlbumArtist: "Anuv Jain",
        Type: "Single",
        Year: "2021",
        Color: "rgba(144,208,240,1)",
        DarkColor: "rgba(86,124,143,1)",
        LightColor: "rgba(144,208,240,1)",
        releaseDate: (0, utils_1.date)("16-07-2021"),
        Thumbnail: "https://lh3.googleusercontent.com/XVFqLdB92wrjHxysLMRPP0L44wNPNC8g30Sk8VHNyqlAEWrtuihhxKV6sM4c8oCKOEM20SuV95MKuQXE=w544-h544-l90-rj",
        Artist: "Anuv Jain",
        Duration: "3: 37",
        url: `${utils_1.server[3]}/hls/listen/Gul - Anuv Jain/output.m3u8`
    },
    {
        _albumId: "6590f74694e241eecfc27fec",
        _trackId: "6590f74694e241eecfc27fec",
        Album: "Husn",
        AlbumArtist: "Anuv Jain",
        Type: "Single",
        Year: "2023",
        Color: "rgba(40,72,64,1)",
        DarkColor: "rgba(40,72,64,1)",
        LightColor: "rgba(72,129,115,1)",
        releaseDate: (0, utils_1.date)("01-12-2023"),
        Thumbnail: "https://lh3.googleusercontent.com/KyrCGnftqfj4eJ9FnumH8GlNsddPCa8y_LUtsS1dZqX-cQmILOMPKZQp3tEmPWMGN-Ee97I1USn3911GLg=w544-h544-l90-rj",
        Artist: "Anuv Jain",
        Duration: "3: 37",
        url: `${utils_1.server[3]}/hls/listen/Husn - Anuv Jain/output.m3u8`
    },
    {
        _albumId: "6593b473b095706dd53574d3",
        _trackId: "6593b473b095706dd53574d3",
        Album: "Desperado",
        AlbumArtist: "Raghav, Tesher",
        Type: "Single",
        Year: "2023",
        Color: "rgba(192,24,24,1)",
        DarkColor: "rgba(192,24,24,1)",
        LightColor: "rgba(233,29,29,1)",
        releaseDate: (0, utils_1.date)("12-04-2023"),
        Thumbnail: "https://lh3.googleusercontent.com/zlBtmPpKD8u3lNBXoeQvMZW2JinbQhxL8eaoNXle7_2bQjNswp_bOz3wGDuO-9XyVM79y5hM6Dbmqj8=w544-h544-l90-rj",
        Artist: "Raghav, Tesher",
        Duration: "4: 07",
        url: `${utils_1.server[3]}/hls/listen/Desperado - Raghav/output.m3u8`
    },
    {
        _albumId: "65aa5444a29c0f3093924c47",
        _trackId: "65aa5444a29c0f3093924c47",
        Album: "Tu hai kahan",
        AlbumArtist: "AUR",
        Type: "Single",
        Year: "2023",
        Color: "rgba(168,176,168,1)",
        DarkColor: "rgba(114,120,114,1)",
        LightColor: "rgba(168,176,168,1)",
        releaseDate: (0, utils_1.date)("16-10-2023"),
        Thumbnail: "https://lh3.googleusercontent.com/X3Y2OGa2jzNcgv7jcoRVlfEMx2A9eHinSt7IiZ90QiqlpQoOtJjmUFexlF12dfG1_3_M43gZayt3KtE4=w544-h544-l90-rj",
        Artist: "AUR",
        Duration: "4: 23",
        url: `${utils_1.server[3]}/hls/listen/Tu Hai Kahan - AUR/output.m3u8`
    },
    {
        _albumId: "65b0c4d55d2033ed7de0ed1d",
        Album: "Teri Baaton Mein Aisa Uljha Jiya",
        AlbumArtist: "Various Artists",
        Type: "Album",
        Year: "2024",
        Color: "rgba(24,184,160,1)",
        LightColor: "rgba(24,184,160,1)",
        DarkColor: "rgba(17,133,116,1)",
        releaseDate: (0, utils_1.date)("19-01-2024"),
        Thumbnail: "https://lh3.googleusercontent.com/FMv7FYqkppHAM9Sn43aneV3eql6nCHldW0OO4ZvoimckHHKwM4Io8NWCdLjarWnh-ecC_LrdpYs3PJ_v=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "65b0c4de131829a78a3ee9dd",
                Title: "Akhiyaan Gulaab",
                Artist: "Mitraz",
                url: `${utils_1.server[3]}/hls/listen/Akhiyaan Gulaab - Mitraz/output.m3u8`,
                Duration: "2: 51",
                lyrics: true,
                sync: true
            },
            {
                _trackId: "66015217c2124d4e77256b85",
                Title: "Gallan",
                Artist: "Talwiinder, MC SQUARE, NDS",
                url: `${utils_1.server[3]}/hls/listen/Gallan - Teri Baaton Mein Aisa Uljha Jiya/output.m3u8`,
                Duration: "3: 31"
            }
        ]
    },
    {
        _albumId: "65cafdce9e2d8b170c31d0f4",
        Album: "ANIMAL (Original Motion Picture Soundtrack)",
        AlbumArtist: "Harshavardhan Rameshwar",
        Type: "Album",
        Year: "2024",
        Color: "rgba(46,57,89,1)",
        // LightColor: "",
        // DarkColor: "",
        releaseDate: (0, utils_1.date)("23-01-2024"),
        Thumbnail: "https://lh3.googleusercontent.com/tM7On61s7pbU8DsHeusopX-HRQerc4Xyv2Pc5Nveb3F932QuadCwslZEP_yeU7iQk2XX9w-r63nZgZk=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "65cafddb561ad55b592daa5d",
                Title: "Pajero Chase",
                Artist: "Harshavardhan Rameshwar",
                url: `${utils_1.server[3]}/hls/listen/Pajero Chase - Animal/output.m3u8`,
                Duration: "1: 00"
            },
            {
                _trackId: "65cafde393a5b55b63e6f20e",
                Title: "ANIMAL Theme",
                Artist: "Harshavardhan Rameshwar",
                url: `${utils_1.server[3]}/hls/listen/Animal Theme - Animal/output.m3u8`,
                Duration: "1: 20"
            },
            {
                _trackId: "65cafdeb2dd904220ae2afe9",
                Title: "Range Rover Entry",
                Artist: "Harshavardhan Rameshwar",
                url: `${utils_1.server[3]}/hls/listen/Range Rover Entry - Animal/output.m3u8`,
                Duration: "1: 24"
            },
            {
                _trackId: "65cafdf21bb02f8c5c192d66",
                Title: "Killing Jeeja",
                Artist: "Harshavardhan Rameshwar",
                url: `${utils_1.server[3]}/hls/listen/Killing Jeeja - Animal/output.m3u8`,
                Duration: "1: 04"
            },
            {
                _trackId: "65cafdf933411b2dfd14ea7f",
                Title: "ANIMAL Title Music",
                Artist: "Harshavardhan Rameshwar",
                url: `${utils_1.server[3]}/hls/listen/Animal Title Music - Animal/output.m3u8`,
                Duration: "1: 22"
            }
        ]
    },
    {
        _albumId: "6603ac4e2bb6062d677faea9",
        Album: "Ek Tha Raja",
        AlbumArtist: "Badshah",
        Type: "Album",
        Year: "2024",
        Color: "rgba(168,152,104,1)",
        LightColor: "rgba(168,152,104,1)",
        DarkColor: "rgba(130,118,81,1)",
        releaseDate: (0, utils_1.date)("18-03-2024"),
        Thumbnail: "https://lh3.googleusercontent.com/X9z43RY-8TZE8Vtxq7vuvRIWhp57i02tcFvgEUOUPSALtLloNQNnfwAZLDYPCCebcl2PSf2a6AMxBsnD=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "6603ac56b4ee4eec35f56b71",
                Title: "Soulmate",
                Artist: "Badshah, Arijit Singh",
                url: `${utils_1.server[3]}/hls/listen/Soulmate - Ek Tha Raja/output.m3u8`,
                Duration: "3: 33",
                lyrics: true,
                sync: true
            }
        ]
    },
    {
        _albumId: "660b8daa52acd0636526a9d3",
        _trackId: "660b8daa52acd0636526a9d3",
        Album: "Saajna",
        AlbumArtist: "Mitraz",
        Type: "Single",
        Year: "2023",
        Color: "rgba(56,72,56,1)",
        DarkColor: "rgba(56,72,56,1)",
        LightColor: "rgba(98,126,98,1)",
        releaseDate: (0, utils_1.date)("15-09-2023"),
        Thumbnail: "https://lh3.googleusercontent.com/SIi8j596tpxQ8xkCL6KafbqRlz99RhUzjtkhX568m4SRUwWLSjuJEnCel-iy5eL6Q2yXY_pRPsR1R0E=w544-h544-l90-rj",
        Artist: "Mitraz",
        Duration: "2: 57",
        url: `${utils_1.server[3]}/hls/listen/Saajna - Mitraz/output.m3u8`
    },
    {
        _albumId: "664ccdf3b5cd5e77c7185106",
        _trackId: "664ccdf3b5cd5e77c7185106",
        Album: "Laado",
        AlbumArtist: "MC SQUARE, Hiten",
        Type: "Single",
        Year: "2023",
        Color: "rgba(208,32,24,1)",
        DarkColor: "rgba(208,32,24,1)",
        LightColor: "rgba(231,36,27,1)",
        releaseDate: (0, utils_1.date)("30-08-2023"),
        Thumbnail: "https://lh3.googleusercontent.com/d6rL52C1cthuvTgofLfU6J1I2MEMjZlQ1WjJ402eGM20nh9TPTHafglZ7kwWNSFf21h-b2NPqW6y5I54=w544-h544-l90-rj",
        Artist: "MC SQUARE, Hiten",
        Duration: "2: 28",
        url: `${utils_1.server[3]}/hls/listen/Laado - MC SQUARE/output.m3u8`
    },
    {
        _albumId: "666027591eb4af927b7856aa",
        Album: "Zehen",
        AlbumArtist: "Mitraz",
        Type: "Album",
        Year: "2022",
        Color: "rgba(192,200,200,1)",
        LightColor: "rgba(192,200,200,1)",
        DarkColor: "rgba(115,120,120,1)",
        releaseDate: (0, utils_1.date)("18-11-2022"),
        Thumbnail: "https://lh3.googleusercontent.com/DPNpBja76rG-M24RxRXIBhyXVH8mZO22sIz18mjiZrDVkyYYlaC9clT3yztoYzFBJgTkiGPN48uNR788=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "66602769c404d4d709a1bfb0",
                Title: "Mehboob",
                Artist: "Mitraz",
                url: `${utils_1.server[3]}/hls/listen/Mehboob - Zehen/output.m3u8`,
                Duration: "3: 05"
            }
        ]
    },
    {
        _albumId: "66bca3c8795de468bab9be0f",
        Album: "MONOPOLY MOVES",
        AlbumArtist: "King",
        Type: "Album",
        Year: "2024",
        Color: "rgba(120,24,24,1)",
        LightColor: "rgba(227,45,45,1)",
        DarkColor: "rgba(120,24,24,1)",
        releaseDate: (0, utils_1.date)("02-08-2024"),
        Thumbnail: "https://lh3.googleusercontent.com/kTgRWBzSinIX8y7h_XOeaD3fpRZMWznCuFRwi3Iqyky1ZtuNLCmPWdYqdt7WYd8zxrpQaIOEtGWPjaU=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "66bca3d0964b1c100393acb7",
                Title: "STILL THE SAME",
                Artist: "King, Abhijay Sharma",
                url: `${utils_1.server[3]}/hls/listen/Still The Same - King/output.m3u8`,
                Duration: "2: 45"
            },
            {
                _trackId: "66bca3d7505441eaf5599439",
                Title: "WARCRY",
                Artist: "King, Raftaar",
                url: `${utils_1.server[3]}/hls/listen/Warcry - King/output.m3u8`,
                Duration: "5: 00"
            },
            {
                _trackId: "66d1f1bdeed04bbf8e67b6ff",
                Title: "TERE HO KE",
                Artist: "King, Bella",
                url: `${utils_1.server[3]}/hls/listen/Tere Ho Ke - King/output.m3u8`,
                Duration: "3: 43"
            }
        ]
    },
    {
        _albumId: "66c6fe84344af07a8bc0b464",
        Album: "The Death of Slim Shady (Coup de Grâce)",
        AlbumArtist: "Eminem",
        Type: "Album",
        Year: "2024",
        Color: "rgba(8,48,72,1)",
        LightColor: "rgba(21,124,187,1)",
        DarkColor: "rgba(8,48,72,1)",
        releaseDate: (0, utils_1.date)("12-07-2024"),
        Thumbnail: "https://lh3.googleusercontent.com/Xx3dX1EJDirqwpfQL05uAgmKGYpzTcFDXjjHqjNpIhgY5MWTJRLSlOjaYVtup2Ku6gBYEqXoxw5aGKC3=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "66c6fe8ba6d373d7162115a7",
                Title: "Somebody Save Me",
                Artist: "Eminem, Jelly Roll",
                url: `${utils_1.server[3]}/hls/listen/Somebody Save Me - Eminem/output.m3u8`,
                Duration: "3: 50",
                lyrics: true,
                sync: true
            }
        ]
    },
    {
        _albumId: "6728595ad37db113426cd1c5",
        _trackId: "6728595ad37db113426cd1c5",
        Album: "Jo Tum Mere Ho",
        AlbumArtist: "Anuv Jain",
        Type: "Single",
        Year: "2024",
        Color: "rgba(32,40,72,1)",
        DarkColor: "rgba(32,40,72,1)",
        LightColor: "rgba(90,113,203,1)",
        releaseDate: (0, utils_1.date)("02-08-2024"),
        Thumbnail: "https://lh3.googleusercontent.com/BU2wudOgpgn3sa2kO2MfEvfHeMTDZjZwPZlugNy89o_PtFbdCuXAJCZm8asRa9V9Y7cMZVw4FhqAQ_4=w544-h544-l90-rj",
        Artist: "Anuv Jain",
        Duration: "4: 11",
        url: `${utils_1.server[3]}/hls/listen/Jo Tum Mere Ho - Anuv Jain/output.m3u8`,
        lyrics: true,
        sync: true
    },
    {
        _albumId: "67334a501155ebd9e3cc36bc",
        Album: "MoonChild Era",
        AlbumArtist: "Diljit Dosanjh",
        Type: "Album",
        Year: "2021",
        Color: "rgba(184,80,96,1)",
        LightColor: "rgba(192,83,100,1)",
        DarkColor: "rgba(184,80,96,1)",
        releaseDate: (0, utils_1.date)("22-08-2021"),
        Thumbnail: "https://lh3.googleusercontent.com/iiKQZvRUWz-LYFs2rjqOYeTcZgRQJdL0iyPrefQ5-6oWON0_aXbLgPYDEmKL-KIww87pXzOg5qK9s_7U=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "67334a5d38b70ec383f3b89a",
                Title: "Lover",
                Artist: "Diljit Dosanjh",
                url: `${utils_1.server[3]}/hls/listen/Lover - Diljit Dosanjh/output.m3u8`,
                Duration: "3: 10",
                lyrics: true,
                sync: true
            }
        ]
    },
    {
        _albumId: "67346d754b648412e62d53ec",
        _trackId: "67346d754b648412e62d53ec",
        Album: 'Mayavi (From "Bhoomi 2024")',
        AlbumArtist: "Sanjith Hegde, Sonu Nigam",
        Type: "Single",
        Year: "2024",
        Color: "rgba(8,128,192,1)",
        DarkColor: "rgba(8,125,187,1)",
        LightColor: "rgba(8,128,192,1)",
        releaseDate: (0, utils_1.date)("06-11-2024"),
        Thumbnail: "https://lh3.googleusercontent.com/rpH8GWkLFNmlljmotC8-BunT0Ct2KLS36Q4ds5BNx1mmKtbEKrdZjzanTflGIK3twEZ45kSD5ist5TH_=w544-h544-l90-rj",
        Artist: "Sanjith Hegde, Sonu Nigam",
        Duration: "4: 18",
        url: `${utils_1.server[3]}/hls/listen/Mayavi - Sanjith Hegde/output.m3u8`
    },
    {
        _albumId: "675b13e880b037145b83fc16",
        _trackId: "675b13e880b037145b83fc16",
        Album: "Morni",
        AlbumArtist: "Badshah",
        Type: "Single",
        Year: "2024",
        Color: "rgba(56,40,40,1)",
        DarkColor: "rgba(56,40,40,1)",
        LightColor: "rgba(152,108,108,1)",
        releaseDate: (0, utils_1.date)("14-11-2024"),
        Thumbnail: "https://lh3.googleusercontent.com/n163MhLOuOmDuLI5XWPBKRqzgjg_dnK3-_-ayS4k9dc1_4Yxqx9M5WvICyqu7SRWj5S9ycbTMXZvQ0al=w544-h544-l90-rj",
        Artist: "Badshah",
        Duration: "2: 52",
        url: `${utils_1.server[3]}/hls/listen/Morni - Badshah/output.m3u8`
    },
    {
        _albumId: "67797cbacb9723276f1e593d",
        Album: "Drive Thru",
        AlbumArtist: "Diljit Dosanjh",
        Type: "Album",
        Year: "2022",
        Color: "rgba(192,88,120,1)",
        LightColor: "rgba(192,88,120,1)",
        DarkColor: "rgba(187,86,117,1)",
        releaseDate: (0, utils_1.date)("15-07-2022"),
        Thumbnail: "https://lh3.googleusercontent.com/RbDRUchWOaZADk3AhGUJsxO-XYS9yWalzXbTEUMFv1vRnNll3HTNjzRi9XhdJOSWuKQ7oVVPDRUPI7YyHQ=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "67797cc1d53516b15f087224",
                Title: "Peaches",
                Artist: "Diljit Dosanjh",
                url: `${utils_1.server[3]}/hls/listen/Peaches - Diljit Dosanjh/output.m3u8`,
                Duration: "3: 09"
            },
            {
                _trackId: "67797cc782ca5166e1a707fe",
                Title: "Lemonade",
                Artist: "Diljit Dosanjh",
                url: `${utils_1.server[3]}/hls/listen/Lemonade - Diljit Dosanjh/output.m3u8`,
                Duration: "2: 46"
            }
        ]
    },
    {
        _albumId: "679373e2239f6460e0d2675f",
        Album: "Ghost Stories",
        AlbumArtist: "Coldplay",
        Type: "Album",
        Year: "2014",
        Color: "rgba(16,40,64,1)",
        LightColor: "rgba(49,121,194,1)",
        DarkColor: "rgba(16,40,64,1)",
        releaseDate: (0, utils_1.date)("16-05-2014"),
        Thumbnail: "https://lh3.googleusercontent.com/FrPId047QbNpFZfEtUJQDTC2-MGkgo4JPzasmIkdvFLjbQGNppcmRdOFXo6c3swTP_iP-ozTXhu8OBRSOw=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "6795d60d57f8628361ad6d13",
                Title: "A Sky Full Of Stars",
                Artist: "Coldplay",
                url: `${utils_1.server[3]}/hls/listen/A Sky Full Of Stars - Coldplay/output.m3u8`,
                Duration: "4: 27"
            }
        ]
    },
    {
        _albumId: "6796694b98d954733ca4ba1b",
        Album: "Music Of The Spheres",
        AlbumArtist: "Coldplay",
        Type: "Album",
        Year: "2021",
        Color: "rgba(8,24,96,1)",
        LightColor: "rgba(22,65,255,1)",
        DarkColor: "rgba(8,24,96,1)",
        releaseDate: (0, utils_1.date)("15-10-2021"),
        Thumbnail: "https://lh3.googleusercontent.com/VolJV2juJ41K_RyjDjjF9Btpg27rhHQ42YOypeeCKD4vCS9_ZfEeWPAw6EcxZLLwjPRdh3Z98PnbdvlRPg=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "679669511f140e7486f158e6",
                Title: "Biutyful",
                Artist: "Coldplay",
                url: `${utils_1.server[3]}/hls/listen/Biutyful - Coldplay/output.m3u8`,
                Duration: "3: 12"
            }
        ]
    },
    {
        _albumId: "67973fca72a9ab71b70bd0e5",
        Album: "Parachutes",
        AlbumArtist: "Coldplay",
        Type: "Album",
        Year: "2000",
        Color: "rgba(192,104,8,1)",
        LightColor: "rgba(192,104,8,1)",
        DarkColor: "rgba(179,97,7,1)",
        releaseDate: (0, utils_1.date)("10-07-2000"),
        Thumbnail: "https://lh3.googleusercontent.com/7RK5kFu8RjjulsxsPCJ55wmJLchKaaIRAYih0ldj--RGbnOOdA0U2vmLWyVfjPW82nR-Dwm2r8PhEi61=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "67973fd071c36640dfaa900d",
                Title: "Yellow",
                Artist: "Coldplay",
                url: `${utils_1.server[3]}/hls/listen/Yellow - Coldplay/output.m3u8`,
                Duration: "4: 26"
            }
        ]
    },
    {
        _albumId: "679bce10a2ef330ff8eea35b",
        _trackId: "679bce10a2ef330ff8eea35b",
        Album: "Afsos",
        AlbumArtist: "Anuv Jain, AP Dhillon",
        Type: "Single",
        Year: "2025",
        Color: "rgba(240,80,40,1)",
        DarkColor: "rgba(211,70,35,1)",
        LightColor: "rgba(240,80,40,1)",
        releaseDate: (0, utils_1.date)("31-01-2025"),
        Thumbnail: "https://lh3.googleusercontent.com/RtrisEbMpw0qvN904DsYH4vOMyqHrwPoVlRM_tUcZL0OLqHs_IwPb-F6N_YlBqsqHGfCZdDL-o-99jsl=w544-h544-l90-rj",
        Artist: "Anuv Jain, AP Dhillon",
        Duration: "3: 11",
        url: `${utils_1.server[3]}/hls/listen/Afsos - Anuv Jain/output.m3u8`,
        lyrics: true,
        sync: true
    },
    {
        _albumId: "67b1a82c6db9368fefacdf03",
        _trackId: "67b1a82c6db9368fefacdf03",
        Album: "Water",
        AlbumArtist: "Diljit Dosanjh",
        Type: "Single",
        Year: "2025",
        Color: "rgba(8,40,64,1)",
        DarkColor: "rgba(8,40,64,1)",
        LightColor: "rgba(25,123,197,1)",
        releaseDate: (0, utils_1.date)("14-02-2025"),
        Thumbnail: "https://lh3.googleusercontent.com/O9KxjSk79lGtIdRKXHepjwRmryO7yDWg7KtAlS7P1PSvizQCB7lcP0Zo_Yk0PT2Po2T5yr9cpWF9okQ=w544-h544-l90-rj",
        Artist: "Diljit Dosanjh",
        Duration: "3: 16",
        url: `${utils_1.server[3]}/hls/listen/Water - Diljit Dosanjh/output.m3u8`
    },
    {
        _albumId: "67cf20bce653906f17136972",
        _trackId: "67cf20bce653906f17136972",
        Album: "Run It Up",
        AlbumArtist: "Hanumankind",
        Type: "Single",
        Year: "2025",
        Color: "rgba(248,160,24,1)",
        DarkColor: "rgba(164,106,16,1)",
        LightColor: "rgba(248,160,24,1)",
        releaseDate: (0, utils_1.date)("05-03-2025"),
        Thumbnail: "https://lh3.googleusercontent.com/6DSrfLUE2JEPhwnF-IFuM5IP8rL8DgrpWPtqh0GvCkdT25Vl5lw3nEjLu-dZ3qIByuoEmU7MS3D8PakF=w544-h544-l90-rj",
        Artist: "Hanumankind",
        Duration: "2: 53",
        url: `${utils_1.server[3]}/hls/listen/Run It Up - Hanumankind/output.m3u8`
    },
    {
        _albumId: "67ff4e4d48adac7f00e32e5a",
        _trackId: "67ff4e4d48adac7f00e32e5a",
        Album: "Weightless",
        AlbumArtist: "Martin Garrix, Arijit Singh",
        Type: "Single",
        Year: "2025",
        Color: "rgba(160,24,16,1)",
        DarkColor: "rgba(160,24,16,1)",
        LightColor: "rgba(231,35,23,1)",
        releaseDate: (0, utils_1.date)("11-04-2025"),
        Thumbnail: "https://lh3.googleusercontent.com/e8Yh5oYnEfg9lnT-_gVKRXArNrgVxJB8AXC8MKRw7fWkiam3R5ouHSj3BsRqws6vTBltejcvhAeb8J3oJQ=w544-h544-l90-rj",
        Artist: "Martin Garrix, Arijit Singh",
        Duration: "3: 42",
        url: `${utils_1.server[3]}/hls/listen/Weightless - Martin Garrix/output.m3u8`,
        lyrics: true,
        sync: true
    },
    {
        _albumId: "68441195ef280ce74955a4e6",
        _trackId: "68441195ef280ce74955a4e6",
        Album: "Sapphire",
        AlbumArtist: "Ed Sheeran",
        Type: "Single",
        Year: "2025",
        Color: "rgba(72,128,184,1)",
        DarkColor: "rgba(69,123,176,1)",
        LightColor: "rgba(72,128,184,1)",
        releaseDate: (0, utils_1.date)("05-06-2025"),
        Thumbnail: "https://lh3.googleusercontent.com/gFoL_IiMW-6i63a8FlitjPneJ0Usq1xNj1ZVE6sNgXsZimA3axRCuVCQKvj_300QDfkAQsQfMVguFdE=w544-h544-l90-rj",
        Artist: "Ed Sheeran",
        Duration: "2: 59",
        url: `${utils_1.server[3]}/hls/listen/Sapphire - Ed Sheeran/output.m3u8`,
        lyrics: true,
        sync: true
    },
    {
        _albumId: "6877e7d5aadb2f86c19cd382",
        Album: "Metro ... In Dino (Side A)",
        AlbumArtist: "Pritam",
        Type: "Album",
        Year: "2025",
        Color: "rgba(56,72,64,1)",
        LightColor: "rgba(97,124,110,1)",
        DarkColor: "rgba(56,72,64,1)",
        releaseDate: (0, utils_1.date)("23-06-2025"),
        Thumbnail: "https://lh3.googleusercontent.com/kGA8J0xaX_sO0lSR0hX0IeVLOVRKpS-HAAaWkcOYJR68rA0Ov672YwbGRrmyi9JDg-p9JbGXTnhZPVinGQ=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "6877e7e16d8600a3e1131407",
                Title: "Zamaana Lage",
                Artist: "Arijit Singh, Shashwat Singh",
                url: `${utils_1.server[3]}/hls/listen/Zamaana Lage - Metro In Dino/output.m3u8`,
                Duration: "3: 16"
            },
            {
                _trackId: "6877e7e9f60c5a5aa5b42b47",
                Title: "Dil Ka Kya",
                Artist: "Raghav Chaitanya",
                url: `${utils_1.server[3]}/hls/listen/Dil Ka Kya - Metro In Dino/output.m3u8`,
                Duration: "6: 00",
                lyrics: true,
                sync: true
            },
            {
                _trackId: "6877e7f04b81885d263394c2",
                Title: "Aur Mohabbat Kitni Karoon",
                Artist: "Arijit Singh",
                url: `${utils_1.server[3]}/hls/listen/Aur Mohabbat Kitni Karoon - Metro In Dino/output.m3u8`,
                Duration: "3: 56",
                lyrics: true,
                sync: true
            }
        ]
    },
    {
        _albumId: "6877e7f74450545caa29ea6c",
        Album: "Metro ... In Dino (Side B)",
        AlbumArtist: "Pritam",
        Type: "Album",
        Year: "2025",
        Color: "rgba(168,96,16,1)",
        LightColor: "rgba(176,100,17,1)",
        DarkColor: "rgba(168,96,16,1)",
        releaseDate: (0, utils_1.date)("14-07-2025"),
        Thumbnail: "https://lh3.googleusercontent.com/Rew_WPqRjxr4a8RCBlgp3udwezNSNjjDodxe6qSWLVdXptNTScjYN1JYRNP-NS_A8pCo8Kx00iUrM8Yr=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "6877e7ff1bdd91a8cb3c027a",
                Title: "Qayde Se",
                Artist: "Arijit Singh",
                url: `${utils_1.server[3]}/hls/listen/Qayde Se - Metro In Dino/output.m3u8`,
                Duration: "3: 35",
                lyrics: true,
                sync: true
            }
        ]
    },
    {
        _albumId: "68b1ee5826d8dab16f29b5c2",
        Album: "The Ba***ds Of Bollywood",
        AlbumArtist: "Various Artists",
        Type: "Album",
        Year: "2025",
        Color: "rgba(24,32,72,1)",
        LightColor: "rgba(80,107,240,1)",
        DarkColor: "rgba(24,32,72,1)",
        releaseDate: (0, utils_1.date)("29-08-2025"),
        Thumbnail: "https://lh3.googleusercontent.com/lyNmmgCP_yyn_whaw0Bp9YOqzLSuBPx-Aun6C1wiqZV4TXbVxQC8QwVH4O_UpGcpwvk8FOR3CN1Xx8_s=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "68b1ee5e25a92e041a6dfb4b",
                Title: "Tu Pehli Tu Aakhri",
                Artist: "Arijit Singh, Shashwat Sachdev",
                url: `${utils_1.server[3]}/hls/listen/Tu Pehli Tu Aakhri - Arijit Singh/output.m3u8`,
                Duration: "3: 20"
            }
        ]
    },
    {
        _albumId: "69354de24835b1a680d4a9a4",
        Album: "P-POP CULTURE",
        AlbumArtist: "Karan Aujla, Ikky",
        Type: "Album",
        Year: "2025",
        Color: "rgba(56,56,56,1)",
        LightColor: "rgba(118,118,118,1)",
        DarkColor: "rgba(56,56,56,1)",
        releaseDate: (0, utils_1.date)("22-08-2025"),
        Thumbnail: "https://lh3.googleusercontent.com/BzOBERVwxHIkVDpePVN8mnT0MID3cySSHcZvY84FHusBL78dxkdpWBBk8o4O5e8BaenNlHKlI9fWb_Rccw=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "69354de9e76aa31e3d2a4f57",
                Title: "For A Reason",
                Artist: "Karan Aujla, Ikky",
                url: `${utils_1.server[3]}/hls/listen/For A Reason - P-POP CULTURE/output.m3u8`,
                Duration: "3: 00"
            }
        ]
    },
    {
        _albumId: "693fceaad147e0b429729931",
        Album: "Dhurandhar",
        AlbumArtist: "Various Artists",
        Type: "Album",
        Year: "2025",
        Color: "rgba(168,0,0,1)",
        LightColor: "rgba(239,0,0,1)",
        DarkColor: "rgba(168,0,0,1)",
        releaseDate: (0, utils_1.date)("05-12-2025"),
        Thumbnail: "https://lh3.googleusercontent.com/H6lZYHIsFNq4pSYN4_4ZSW5ZcFjjm2G_CfhLyWnZJhVj1QXJ4hY5R2Lf1k3w7zQ1n3CGZ_UKKcZrf08=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "693fceb4b47401a7a7a0ba0d",
                Title: "Ishq Jalakar - Karvaan",
                Artist: "Shashwat Sachdev, Various Artists",
                url: `${utils_1.server[3]}/hls/listen/Ishq Jalakar - Karvaan - Dhurandhar/output.m3u8`,
                Duration: "4: 10",
                lyrics: true,
                sync: true
            },
            {
                _trackId: "693fcebdd764e9f716bef2fa",
                Title: "Gehra Hua",
                Artist: "Shashwat Sachdev, Arijit Singh, Various Artists",
                url: `${utils_1.server[3]}/hls/listen/Gehra Hua - Dhurandhar/output.m3u8`,
                Duration: "6: 02",
                lyrics: true,
                sync: true
            },
            {
                _trackId: "694eb4d356b30ee982c6d32f",
                Title: "Ez-Ez",
                Artist: "Shashwat Sachdev, Diljit Dosanjh, Hanumankind, Various Artists",
                url: `${utils_1.server[3]}/hls/listen/Ez-Ez - Dhurandhar/output.m3u8`,
                Duration: "3: 02"
            },
            {
                _trackId: "694eb4dba0dd27264214afa6",
                Title: "Move - Yeh Ishq Ishq",
                Artist: "Shashwat Sachdev, Sonu Nigam, Various Artists",
                url: `${utils_1.server[3]}/hls/listen/Move - Yeh Ishq Ishq - Dhurandhar/output.m3u8`,
                Duration: "3: 24"
            },
            {
                _trackId: "694eb4e2ff48fff29fbc27c0",
                Title: "Naal Nachna",
                Artist: "Shashwat Sachdev, Various Artists",
                url: `${utils_1.server[3]}/hls/listen/Naal Nachna - Dhurandhar/output.m3u8`,
                Duration: "2: 25"
            }
        ]
    },
    {
        _albumId: "694ed7d8b270eb0e05b4bd9f",
        _trackId: "694ed7d8b270eb0e05b4bd9f",
        Album: 'Sitaare (From "Ikkis")',
        AlbumArtist: "White Noise Collectives",
        Type: "Single",
        Year: "2025",
        Color: "rgba(184,96,8,1)",
        DarkColor: "rgba(184,96,8,1)",
        LightColor: "rgba(184,96,8,1)",
        releaseDate: (0, utils_1.date)("03-12-2025"),
        Thumbnail: "https://lh3.googleusercontent.com/XvvdvvJF54vqL_1FSspuGguIKMMz5OhyhXMRls0jrBra5OcVujKFCHdI-hKxtnwbO-v-lDKdPmSUD_h33w=w544-h544-l90-rj",
        Artist: "Arijit Singh",
        Duration: "4: 02",
        url: `${utils_1.server[3]}/hls/listen/Sitaare - Ikkis/output.m3u8`,
        lyrics: true,
        sync: true
    },
    {
        _albumId: "69540a62cb20197858c6d1ae",
        _trackId: "69540a62cb20197858c6d1ae",
        Album: 'By My Side',
        AlbumArtist: "AP Dhillon & Shinda Kahlon",
        Type: "Single",
        Year: "2025",
        Color: "rgba(248,136,48,1)",
        DarkColor: "rgba(179,98,35,1)",
        LightColor: "rgba(248,136,48,1)",
        releaseDate: (0, utils_1.date)("24-10-2025"),
        Thumbnail: "https://lh3.googleusercontent.com/Wcs-0uu0rSZDWEGN7XECXMw5NjlMbD5oNi27fASVk1WMRPcNhvP5NU3v4M_dZa1BwCQQ47OlbE4wb_YJ1g=w544-h544-l90-rj",
        Artist: "AP Dhillon & Shinda Kahlon",
        Duration: "2: 56",
        url: `${utils_1.server[3]}/hls/listen/By My Side - AP Dhillon/output.m3u8`,
        lyrics: true,
        sync: true
    },
    {
        _albumId: "698c8346b1fed4de2f1b2005",
        _trackId: "698c8346b1fed4de2f1b2005",
        Album: "Thinking of You",
        AlbumArtist: "AP Dhillon",
        Type: "Single",
        Year: "2026",
        Color: "rgba(216,168,168,1)",
        DarkColor: "rgba(143,111,111,1)",
        LightColor: "rgba(216,168,168,1)",
        releaseDate: (0, utils_1.date)("06-02-2026"),
        Thumbnail: "https://lh3.googleusercontent.com/0M8blHCtwxvreARVVz_T7a3nRpfSHjC5p_AfpgWPgCDWba_CeaWkdU4qD1LC3RDIW_e9a6JhKJhPgSk=w544-h544-l90-rj",
        Artist: "AP Dhillon",
        Duration: "3: 00",
        url: `${utils_1.server[3]}/hls/listen/Thinking of You - AP Dhillon/output.m3u8`
    },
    {
        _albumId: "69c93d2e9dd18eb5acf485e0",
        Album: "Dhurandhar The Revenge",
        AlbumArtist: "Shashwat Sachdev",
        Type: "Album",
        Year: "2026",
        Color: "rgba(176,72,8,1)",
        LightColor: "rgba(200,82,9,1)",
        DarkColor: "rgba(176,72,8,1)",
        releaseDate: (0, utils_1.date)("24-03-2026"),
        Thumbnail: "https://yt3.googleusercontent.com/o0VCkTQynMGGvlqcJiCpgRZx9RPR9AtdAA-U49rHh4gaTIO4hDo4N-t3dT_xvRVsKIlE_cHHs129GC4=w544-h544-l90-rj",
        Tracks: [
            {
                _trackId: "69c93d38a7f6ebb7b65f2048",
                Title: "Dhurandhar The Revenge - Aari Aari",
                Artist: "Shashwat Sachdev, Various Artists",
                url: `${utils_1.server[3]}/hls/listen/Dhurandhar The Revenge - Aari Aari - Dhurandhar The Revenge/output.m3u8`,
                Duration: "3: 30"
            },
            {
                _trackId: "69c93d3f3a98936c24e79789",
                Title: "Aakhri Ishq",
                Artist: "Shashwat Sachdev, Jubin Nautiyal",
                url: `${utils_1.server[3]}/hls/listen/Aakhri Ishq - Dhurandhar The Revenge/output.m3u8`,
                Duration: "4: 21"
            },
            {
                _trackId: "69c93d481648d3878ff08535",
                Title: "Phir Se",
                Artist: "Shashwat Sachdev, Arijit Singh",
                url: `${utils_1.server[3]}/hls/listen/Phir Se - Dhurandhar The Revenge/output.m3u8`,
                Duration: "5: 53"
            },
            {
                _trackId: "69c93d5012d5d3c42fc0d529",
                Title: "Destiny - Mann Atkeya",
                Artist: "Shashwat Sachdev, Various Artists",
                url: `${utils_1.server[3]}/hls/listen/Destiny - Mann Atkeya - Dhurandhar The Revenge/output.m3u8`,
                Duration: "3: 46"
            },
            {
                _trackId: "69c93d58a554a1df2d3b69c5",
                Title: "Jaiye Sajana",
                Artist: "Shashwat Sachdev, Jasmine Sandlas, Satinder Sartaaj",
                url: `${utils_1.server[3]}/hls/listen/Jaiye Sajana - Dhurandhar The Revenge/output.m3u8`,
                Duration: "3: 00"
            }
        ]
    }
];
exports.default = songlist;
//# sourceMappingURL=songlist2.js.map