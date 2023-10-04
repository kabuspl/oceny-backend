const gradeDesc = {
    "1": ["jedynka", "jedynek", "jedynki"],
    "2": ["dwójka", "dwójek", "dwójki"],
    "3": ["trójka", "trójek", "trójki"],
    "4": ["czwórka", "czwórek", "czwórki"],
    "5": ["piątka", "piątek", "piątki"],
    "6": ["szóstka", "szóstek", "szóstki"],
}

export function variant(grade, count) {
    let re = 3;
    const lastDigit = parseInt(count.toString().slice(-1));
    if (count == 1) {
        re = 0; //jedynka
    } else if ((lastDigit >= 5 && lastDigit <= 9) || lastDigit == 0 || lastDigit == 1 || (count >= 10 && count <= 20)) {
        re = 1; //jedynek
    } else if (lastDigit >= 2 && lastDigit <= 4) {
        re = 2; //jedynki
    }
    return gradeDesc[grade][re];
}