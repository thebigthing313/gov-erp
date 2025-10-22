const holidayFunctionMap: Record<string, (year: number) => Date> = {
    "578dc39b-2ff1-4184-bcce-2d31c19ea0e3": getNewYearsDay,
    "90a8b962-db6c-43c8-b995-a06a9f9f2e87": getMLKDay,
    "932e9e62-75a2-4453-82d4-0ac9c81c5d6b": getLincolnsBirthday,
    "8589f561-5bbb-46fc-9390-0fb5ecf55545": getPresidentsDay,
    "d8668b92-9511-4d09-ac71-3ef5548304a9": getGoodFriday,
    "28e5b22b-f43d-4b8c-a9f9-b91bb29d8f47": getMemorialDay,
    "b768f036-f9c4-488b-b9e7-e0909e22ce92": getJuneteenthNJ,
    "9af07bea-cdd1-46a2-9612-2a85049ecf44": getIndpendenceDay,
    "06f5da74-8064-45bc-b79e-aca3604cee1e": getLaborDay,
    "bb269017-dd08-41e5-b068-20162b7a03e8": getColumbusDay,
    "a124e348-5125-4f4a-8f10-a9d812ada709": getElectionDay,
    "e32181c1-b23f-4b69-b56f-5faccb97a535": getVeteransDay,
    "eb3aec2d-c82e-453c-b737-2464f7a5324f": getThanksgivingDay,
    "e3a2ad37-f799-450c-a61d-8349fb9517cc": getDayAfterThanksgiving,
    "ca2e3381-b892-4ce5-80d7-379dd6863c55": getChristmasDay,
};

type HolidayDate = {
    id: string;
    date: Date;
};

export function generateHolidayDates(
    year: number,
    holiday_id: Array<string>,
): Array<HolidayDate | null> {
    return holiday_id.map((id) => {
        const holidayFunction = holidayFunctionMap[id];
        return holidayFunction ? { id, date: holidayFunction(year) } : null;
    });
}

function getNewYearsDay(year: number): Date {
    return new Date(year, 0, 1);
}

function getMLKDay(year: number): Date {
    const januaryFirst = new Date(year, 0, 1);
    const firstMonday = januaryFirst.getDate() +
        ((8 - januaryFirst.getDay()) % 7);
    return new Date(year, 0, firstMonday + 14); // Third Monday
}

function getLincolnsBirthday(year: number): Date {
    return new Date(year, 1, 12);
}

function getPresidentsDay(year: number): Date {
    const februaryFirst = new Date(year, 1, 1);
    const firstMonday = februaryFirst.getDate() +
        ((8 - februaryFirst.getDay()) % 7);
    return new Date(year, 1, firstMonday + 14); // Third Monday
}

function getGoodFriday(year: number): Date {
    // Calculate Easter Sunday using Anonymous Gregorian algorithm
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 16);
    const month = 3 + ((19 * a + b - d - g + 15) % 30);
    const day = 28 + c - e + Math.floor(c / 4) + month;
    const easterSunday = new Date(year, 2, day);
    return new Date(easterSunday.getTime() - 2 * 24 * 60 * 60 * 1000); // Good Friday is two days before Easter Sunday
}

function getMemorialDay(year: number): Date {
    const mayLast = new Date(year, 4, 31);
    const lastMonday = mayLast.getDate() - ((mayLast.getDay() + 6) % 7);
    return new Date(year, 4, lastMonday);
}

function getJuneteenthNJ(year: number): Date {
    const juneFirst = new Date(year, 5, 1);
    const firstFriday = juneFirst.getDate() + ((8 - juneFirst.getDay()) % 7);
    return new Date(year, 5, firstFriday + 14); // Third Friday
}

function getIndpendenceDay(year: number): Date {
    return new Date(year, 6, 4);
}

function getLaborDay(year: number): Date {
    const septemberFirst = new Date(year, 8, 1);
    const firstMonday = septemberFirst.getDate() +
        ((8 - septemberFirst.getDay()) % 7);
    return new Date(year, 8, firstMonday);
}

function getColumbusDay(year: number): Date {
    const octoberFirst = new Date(year, 9, 1);
    const firstMonday = octoberFirst.getDate() +
        ((8 - octoberFirst.getDay()) % 7);
    return new Date(year, 9, firstMonday + 7); // Second Monday
}

function getElectionDay(year: number): Date {
    const novemberFirst = new Date(year, 10, 1);
    const firstMonday = novemberFirst.getDate() +
        ((8 - novemberFirst.getDay()) % 7);
    return new Date(year, 10, firstMonday + 1); // Tuesday after the first Monday
}

function getVeteransDay(year: number): Date {
    return new Date(year, 10, 11);
}

function getThanksgivingDay(year: number): Date {
    const novemberFirst = new Date(year, 10, 1);
    const firstThursday = novemberFirst.getDate() +
        ((11 - novemberFirst.getDay()) % 7);
    return new Date(year, 10, firstThursday + 21); // Fourth Thursday
}

function getDayAfterThanksgiving(year: number): Date {
    const thanksgiving = getThanksgivingDay(year);
    return new Date(thanksgiving.getTime() + 24 * 60 * 60 * 1000); // Day after Thanksgiving
}

function getChristmasDay(year: number): Date {
    return new Date(year, 11, 25);
}
