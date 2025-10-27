export function formatDate(
    date: Date | undefined,
    options: Omit<Intl.DateTimeFormatOptions, "timeZone"> = {},
) {
    if (!date) {
        return "";
    }
    return date.toLocaleDateString("en-US", {
        timeZone: "UTC",
        ...options,
    });
}

export function isValidDate(date: Date | undefined) {
    if (!date) {
        return false;
    }
    return !isNaN(date.getTime());
}

export const getDateRange = (startString: string, endString: string) => {
    // 1. Convert the string inputs to Date objects, explicitly adding a time
    //    to force JavaScript to interpret the date in the local time zone at midnight (00:00:00).
    const startDate = new Date(startString + "T00:00:00");
    const endDate = new Date(endString + "T00:00:00");

    // Error check to ensure valid dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        // You could also try new Date(startString) as a fallback, but logging is key.
        console.error("Invalid date format detected.");
        return [];
    }

    const dateRange = [];
    // Use .getTime() to create a true clone of the start date for the loop.
    let currentDate = new Date(startDate.getTime());

    // Loop while the current date is less than or equal to the end date
    // Since both now have a time of T00:00:00 in the local timezone, the comparison is reliable.
    while (currentDate.getTime() <= endDate.getTime()) {
        // 2. Push a clone of the current date to the array.
        dateRange.push(new Date(currentDate.getTime()));

        // 3. Increment the current date by one day.
        // setDate() handles month and year rollovers automatically.
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateRange;
};

export function getUTCDate(year: number, month: number, day: number): Date {
    return new Date(Date.UTC(year, month, day));
}
