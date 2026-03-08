export const REGIONS = {
    ukraine: {
        name: 'Ukraine',
        label: 'Ukraine / E. Europe',
        center: [48.5, 35.0],
        zoom: 6,
        bounds: { lamin: 44.0, lomin: 22.0, lamax: 53.0, lomax: 42.0 },
        acledRegion: 'Europe',
        countries: ['Ukraine', 'Russia', 'Belarus', 'Moldova', 'Poland'],
        noFlyZones: [
            { name: 'Eastern Ukraine', coords: [[52, 30], [52, 42], [44, 42], [44, 30]] }
        ],
        borderCrossings: [
            { name: 'Medyka–Shehyni', country: 'Poland-Ukraine', status: 'open', waitTime: '2-4 hrs' },
            { name: 'Dorohusk–Yahodyn', country: 'Poland-Ukraine', status: 'open', waitTime: '1-3 hrs' },
            { name: 'Ubla–Malyy Bereznyi', country: 'Slovakia-Ukraine', status: 'open', waitTime: '1-2 hrs' },
            { name: 'Záhony–Chop', country: 'Hungary-Ukraine', status: 'open', waitTime: '2-3 hrs' },
            { name: 'Siret–Porubne', country: 'Romania-Ukraine', status: 'open', waitTime: '1-2 hrs' }
        ],
        emergencyContacts: {
            icrc: '+41 22 734 60 01',
            unhcr: '+380 44 288 9710',
            local: '112',
            msf: '+33 1 40 21 29 29'
        },
        corridors: [
            { name: 'Kyiv–Lviv Corridor', points: [[50.45, 30.52], [49.84, 24.03]], status: 'safe' },
            { name: 'Zaporizhzhia–Dnipro', points: [[47.84, 35.14], [48.46, 35.04]], status: 'caution' },
            { name: 'Kherson–Mykolaiv', points: [[46.64, 32.62], [46.97, 31.99]], status: 'danger' }
        ]
    },
    gaza: {
        name: 'Gaza & Lebanon',
        label: 'Gaza / Lebanon',
        center: [32.5, 35.0],
        zoom: 8,
        bounds: { lamin: 29.0, lomin: 33.0, lamax: 35.0, lomax: 37.0 },
        acledRegion: 'Middle East',
        countries: ['Palestine', 'Israel', 'Lebanon'],
        noFlyZones: [
            { name: 'Gaza Strip', coords: [[31.6, 34.2], [31.6, 34.6], [31.2, 34.6], [31.2, 34.2]] },
            { name: 'Southern Lebanon', coords: [[33.9, 35.1], [33.9, 36.6], [33.0, 36.6], [33.0, 35.1]] }
        ],
        borderCrossings: [
            { name: 'Rafah Crossing', country: 'Gaza-Egypt', status: 'closed', waitTime: 'N/A' },
            { name: 'Erez Crossing', country: 'Gaza-Israel', status: 'closed', waitTime: 'N/A' },
            { name: 'Kerem Abu Salem', country: 'Gaza-Israel', status: 'restricted', waitTime: 'N/A' },
            { name: 'Naqoura', country: 'Lebanon-Israel', status: 'closed', waitTime: 'N/A' },
            { name: 'Masnaa', country: 'Lebanon-Syria', status: 'open', waitTime: '3-6 hrs' }
        ],
        emergencyContacts: {
            icrc: '+972 2 591 1220',
            unhcr: '+961 1 849 201',
            local: '101',
            msf: '+970 8 286 5920'
        },
        corridors: [
            { name: 'Salah al-Din Road', points: [[31.5, 34.45], [31.35, 34.38]], status: 'danger' },
            { name: 'Beirut–Sidon Coastal', points: [[33.89, 35.50], [33.56, 35.37]], status: 'caution' }
        ]
    },
    iran: {
        name: 'Iran / UAE / Israel',
        label: 'Iran vs UAE & Israel',
        center: [28.0, 50.0],
        zoom: 5,
        bounds: { lamin: 12.0, lomin: 30.0, lamax: 42.0, lomax: 65.0 },
        acledRegion: 'Middle East',
        countries: ['Iran', 'Israel', 'Syria', 'Iraq', 'Yemen', 'Lebanon', 'United Arab Emirates', 'Saudi Arabia', 'Bahrain', 'Qatar', 'Kuwait', 'Oman'],
        noFlyZones: [
            { name: 'Iranian Airspace', coords: [[40, 44], [40, 63], [25, 63], [25, 44]] },
            { name: 'Syrian Airspace', coords: [[37, 35.5], [37, 42.5], [32, 42.5], [32, 35.5]] },
            { name: 'Strait of Hormuz', coords: [[27.5, 55.5], [27.5, 57.0], [25.5, 57.0], [25.5, 55.5]] }
        ],
        borderCrossings: [
            { name: 'Al-Qa\'im', country: 'Iraq-Syria', status: 'restricted', waitTime: '4-8 hrs' },
            { name: 'Bashmakh', country: 'Iraq-Iran', status: 'open', waitTime: '2-4 hrs' },
            { name: 'Bab al-Hawa', country: 'Turkey-Syria', status: 'open', waitTime: '3-6 hrs' },
            { name: 'Al Ghuwaifat', country: 'UAE-Saudi Arabia', status: 'open', waitTime: '1-2 hrs' },
            { name: 'Hili Border', country: 'UAE-Oman', status: 'open', waitTime: '30 min' }
        ],
        emergencyContacts: {
            icrc: '+41 22 734 60 01',
            unhcr: '+98 21 8871 4258',
            local: '999 (UAE) / 115 (Iran)',
            msf: '+33 1 40 21 29 29'
        },
        corridors: [
            { name: 'Erbil–Duhok Corridor', points: [[36.19, 44.01], [36.87, 43.00]], status: 'safe' },
            { name: 'Damascus–Beirut', points: [[33.51, 36.29], [33.89, 35.50]], status: 'caution' },
            { name: 'Dubai–Abu Dhabi Evac', points: [[25.27, 55.30], [24.45, 54.65]], status: 'safe' },
            { name: 'Strait of Hormuz Shipping', points: [[26.60, 56.25], [25.30, 57.00]], status: 'danger' }
        ]
    },
    sudan: {
        name: 'Sudan / Africa',
        label: 'Sudan / Africa',
        center: [12.5, 30.0],
        zoom: 5,
        bounds: { lamin: -5.0, lomin: 20.0, lamax: 25.0, lomax: 45.0 },
        acledRegion: 'Africa',
        countries: ['Sudan', 'South Sudan', 'Chad', 'Ethiopia', 'Eritrea', 'Central African Republic'],
        noFlyZones: [
            { name: 'Khartoum Area', coords: [[16.5, 31.5], [16.5, 33.5], [14.5, 33.5], [14.5, 31.5]] }
        ],
        borderCrossings: [
            { name: 'Adré', country: 'Chad-Sudan', status: 'open', waitTime: '2-6 hrs' },
            { name: 'Gallabat', country: 'Sudan-Ethiopia', status: 'open', waitTime: '3-5 hrs' },
            { name: 'Wadi Halfa', country: 'Sudan-Egypt', status: 'open', waitTime: '4-8 hrs' },
            { name: 'Renk', country: 'Sudan-S.Sudan', status: 'congested', waitTime: '6-12 hrs' }
        ],
        emergencyContacts: {
            icrc: '+249 183 77 22 63',
            unhcr: '+249 15 550 0697',
            local: '999',
            msf: '+249 183 48 61 85'
        },
        corridors: [
            { name: 'Port Sudan Evac Route', points: [[15.59, 32.54], [19.62, 37.22]], status: 'safe' },
            { name: 'Khartoum–Wadi Halfa', points: [[15.59, 32.54], [21.80, 31.35]], status: 'caution' }
        ]
    },
    afghanistan: {
        name: 'Afghanistan–Pakistan',
        label: 'Afghanistan–Pakistan Conflict',
        center: [33.5, 67],
        zoom: 5,
        bounds: { lamin: 23, lomin: 58, lamax: 42, lomax: 78 },
        acledRegion: 'Southern Asia',
        countries: ['Afghanistan', 'Pakistan'],
        noFlyZones: [
            {
                name: 'Kabul Restricted Airspace',
                coords: [[34.2, 68.5], [34.2, 69.8], [35.0, 69.8], [35.0, 68.5]]
            }
        ],
        borderCrossings: [
            { name: 'Torkham', country: 'Afghanistan-Pakistan', status: 'varies', waitTime: 'Check locally', lat: 34.09, lng: 71.09 },
            { name: 'Chaman / Spin Boldak', country: 'Afghanistan-Pakistan', status: 'varies', waitTime: 'Check locally', lat: 30.92, lng: 66.45 },
            { name: 'Ghulam Khan', country: 'Afghanistan-Pakistan', status: 'varies', waitTime: 'Check locally', lat: 33.24, lng: 69.93 }
        ],
        emergencyContacts: {
            icrc: '+93 20 210 0418',
            unhcr: '+92 51 209 5700',
            local: '102 (Afghanistan), 1122 (Pakistan)',
            msf: '+33 1 40 21 29 29'
        },
        corridors: [
            { name: 'Kabul–Jalalabad Highway', points: [[34.52, 69.17], [34.42, 70.45]], status: 'danger' },
            { name: 'Torkham Border Route', points: [[34.09, 71.09], [34.42, 70.45]], status: 'caution' },
            { name: 'Chaman–Kandahar', points: [[30.92, 66.45], [31.62, 65.72]], status: 'danger' }
        ]
    },
    myanmar: {
        name: 'Myanmar',
        label: 'Myanmar Civil War',
        center: [19.5, 96.5],
        zoom: 6,
        bounds: { lamin: 9.0, lomin: 92.0, lamax: 29.0, lomax: 102.0 },
        acledRegion: 'South-East Asia',
        countries: ['Myanmar', 'Thailand', 'Bangladesh', 'India', 'China'],
        noFlyZones: [
            { name: 'Central Myanmar', coords: [[22, 94], [22, 97], [18, 97], [18, 94]] }
        ],
        borderCrossings: [
            { name: 'Mae Sot–Myawaddy', country: 'Thailand-Myanmar', status: 'restricted', waitTime: '2-6 hrs' },
            { name: 'Tamu–Moreh', country: 'Myanmar-India', status: 'restricted', waitTime: '4-8 hrs' },
            { name: 'Teknaf', country: 'Myanmar-Bangladesh', status: 'closed', waitTime: 'N/A' }
        ],
        emergencyContacts: {
            icrc: '+95 1 384 834',
            unhcr: '+95 1 524 022',
            local: '199',
            msf: '+33 1 40 21 29 29'
        },
        corridors: [
            { name: 'Mandalay–Muse Highway', points: [[21.97, 96.08], [23.99, 97.85]], status: 'danger' },
            { name: 'Yangon–Thai Border', points: [[16.87, 96.20], [16.73, 98.51]], status: 'caution' }
        ]
    },
    ethiopia: {
        name: 'Ethiopia / Tigray',
        label: 'Ethiopia / Horn of Africa',
        center: [9.0, 40.0],
        zoom: 6,
        bounds: { lamin: 3.0, lomin: 33.0, lamax: 16.0, lomax: 48.0 },
        acledRegion: 'Africa',
        countries: ['Ethiopia', 'Eritrea', 'Somalia', 'Djibouti', 'Kenya'],
        noFlyZones: [
            { name: 'Tigray Region', coords: [[15, 36.5], [15, 40], [12.5, 40], [12.5, 36.5]] }
        ],
        borderCrossings: [
            { name: 'Moyale', country: 'Ethiopia-Kenya', status: 'open', waitTime: '2-4 hrs' },
            { name: 'Galafi', country: 'Ethiopia-Djibouti', status: 'open', waitTime: '1-2 hrs' },
            { name: 'Metema', country: 'Ethiopia-Sudan', status: 'restricted', waitTime: '4-8 hrs' }
        ],
        emergencyContacts: {
            icrc: '+251 11 551 14 77',
            unhcr: '+251 11 661 2822',
            local: '991',
            msf: '+33 1 40 21 29 29'
        },
        corridors: [
            { name: 'Addis Ababa–Djibouti Road', points: [[9.02, 38.75], [11.59, 43.15]], status: 'safe' },
            { name: 'Mekelle–Adigrat', points: [[13.50, 39.47], [14.28, 39.46]], status: 'caution' }
        ]
    },
    drc: {
        name: 'DRC / Congo',
        label: 'Congo / Great Lakes',
        center: [-2.5, 28.0],
        zoom: 6,
        bounds: { lamin: -14.0, lomin: 12.0, lamax: 6.0, lomax: 32.0 },
        acledRegion: 'Africa',
        countries: ['Democratic Republic of the Congo', 'Rwanda', 'Uganda', 'Burundi', 'Republic of Congo'],
        noFlyZones: [
            { name: 'North Kivu', coords: [[-0.5, 28], [-0.5, 30], [-3, 30], [-3, 28]] }
        ],
        borderCrossings: [
            { name: 'Petite Barrière (Goma)', country: 'DRC-Rwanda', status: 'restricted', waitTime: '2-6 hrs' },
            { name: 'Bunagana', country: 'DRC-Uganda', status: 'closed', waitTime: 'N/A' },
            { name: 'Kasumbalesa', country: 'DRC-Zambia', status: 'open', waitTime: '3-6 hrs' }
        ],
        emergencyContacts: {
            icrc: '+243 12 21 484',
            unhcr: '+243 81 700 4388',
            local: '112',
            msf: '+33 1 40 21 29 29'
        },
        corridors: [
            { name: 'Goma–Bukavu', points: [[-1.68, 29.23], [-2.51, 28.86]], status: 'danger' },
            { name: 'Kinshasa–Brazzaville Ferry', points: [[-4.32, 15.31], [-4.27, 15.28]], status: 'safe' }
        ]
    },
    somalia: {
        name: 'Somalia',
        label: 'Somalia / Al-Shabaab',
        center: [5.0, 46.0],
        zoom: 6,
        bounds: { lamin: -2.0, lomin: 40.0, lamax: 12.0, lomax: 52.0 },
        acledRegion: 'Africa',
        countries: ['Somalia', 'Kenya', 'Ethiopia', 'Djibouti'],
        noFlyZones: [
            { name: 'South-Central Somalia', coords: [[5, 42], [5, 48], [0, 48], [0, 42]] }
        ],
        borderCrossings: [
            { name: 'Mandera', country: 'Somalia-Kenya', status: 'restricted', waitTime: '4-8 hrs' },
            { name: 'Doolow', country: 'Somalia-Ethiopia', status: 'open', waitTime: '2-4 hrs' },
            { name: 'Loyada', country: 'Somalia-Djibouti', status: 'open', waitTime: '1-3 hrs' }
        ],
        emergencyContacts: {
            icrc: '+252 61 510 5255',
            unhcr: '+252 61 554 1007',
            local: '888',
            msf: '+33 1 40 21 29 29'
        },
        corridors: [
            { name: 'Mogadishu Airport Road', points: [[2.15, 45.30], [2.01, 45.34]], status: 'danger' },
            { name: 'Mogadishu–Baidoa', points: [[2.05, 45.32], [3.12, 43.65]], status: 'danger' }
        ]
    },
    yemen: {
        name: 'Yemen',
        label: 'Yemen / Houthi Crisis',
        center: [15.5, 44.5],
        zoom: 6,
        bounds: { lamin: 12.0, lomin: 41.0, lamax: 20.0, lomax: 55.0 },
        acledRegion: 'Middle East',
        countries: ['Yemen', 'Saudi Arabia', 'Oman'],
        noFlyZones: [
            { name: 'Houthi-Controlled Yemen', coords: [[18, 42], [18, 46], [13, 46], [13, 42]] },
            { name: 'Bab al-Mandab Strait', coords: [[13, 42.5], [13, 44], [12, 44], [12, 42.5]] }
        ],
        borderCrossings: [
            { name: 'Al Tuwal', country: 'Yemen-Saudi Arabia', status: 'restricted', waitTime: '4-8 hrs' },
            { name: 'Haradh', country: 'Yemen-Saudi Arabia', status: 'closed', waitTime: 'N/A' },
            { name: 'Al Mazyounah', country: 'Yemen-Oman', status: 'open', waitTime: '2-4 hrs' }
        ],
        emergencyContacts: {
            icrc: '+967 1 211 575',
            unhcr: '+967 1 469 771',
            local: '199',
            msf: '+33 1 40 21 29 29'
        },
        corridors: [
            { name: 'Aden Port Evacuation', points: [[12.80, 45.03], [12.50, 44.50]], status: 'caution' },
            { name: 'Sana\'a–Marib Road', points: [[15.35, 44.21], [15.47, 45.32]], status: 'danger' }
        ]
    },
    global: {
        name: 'Global',
        label: 'Global Overview',
        center: [20, 30],
        zoom: 3,
        bounds: { lamin: -60, lomin: -180, lamax: 60, lomax: 180 },
        acledRegion: null,
        countries: [
            'Ukraine', 'Russia', 'Belarus', 'Moldova', 'Poland',
            'Palestine', 'Israel', 'Lebanon',
            'Iran', 'Syria', 'Iraq', 'Yemen', 'United Arab Emirates', 'Saudi Arabia',
            'Sudan', 'South Sudan', 'Chad', 'Ethiopia', 'Eritrea', 'Central African Republic',
            'Afghanistan', 'Pakistan',
            'Myanmar', 'Thailand', 'Bangladesh',
            'Democratic Republic of the Congo', 'Rwanda', 'Uganda',
            'Somalia', 'Kenya', 'Djibouti',
            'Oman', 'Bahrain', 'Qatar', 'Kuwait'
        ],
        noFlyZones: [],
        borderCrossings: [],
        emergencyContacts: {
            icrc: '+41 22 734 60 01',
            unhcr: '+41 22 739 81 11',
            local: 'Check local directory',
            msf: '+33 1 40 21 29 29'
        },
        corridors: []
    }
};

export const REGION_KEYS = Object.keys(REGIONS);

export function getRegionByKey(key) {
    return REGIONS[key] || REGIONS.global;
}
