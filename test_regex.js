const text = "killed an estimated 176,000–212,000+ people, including 46,319 civilians. In addition, 66,650 people were killed in the related War in North-West Pakistan. While more than 5.7 million former refugees returned to Afghanistan after the 2001 invasion, by the time the Taliban returned to power in 2021, 2.6 million Afghans remained refugees, while another 4 million were internally displaced.";

const t = text.replace(/\s+/g, ' ');

function parseNumericValue(str) {
    if (!str) return null;
    str = str.replace(/,/g, '').trim();
    const num = parseFloat(str);
    if (isNaN(num)) return null;
    return num;
}

let result = {};

let match = t.match(/estimated\s+([\d,]+)[–\-]([\d,]+)/i);
console.log("Killed match:", match);
if (match) {
    const v1 = parseNumericValue(match[1]);
    const v2 = parseNumericValue(match[2]);
    const max = Math.max(v1 || 0, v2 || 0);
    result.totalKilled = max;
}

match = t.match(/([\d,.]+)\s*(million|m)?\s+(?:were\s+)?internally\s+displaced/i);
console.log("Displaced match:", match);
if (match) {
    let v = parseNumericValue(match[1]);
    if (match[2] || v < 1000) v = v * 1000000;
    result.totalDisplaced = v;
}

console.log(result);
