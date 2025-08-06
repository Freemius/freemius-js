export function parseFreemiusDate(dateString: string): Date | null {
    if (!dateString) {
        return null;
    }

    // Freemius date format is "YYYY-MM-DD HH:mm:ss" in UTC
    const dateParts = dateString.split(' ');
    if (dateParts.length !== 2) {
        return null;
    }

    const date = dateParts[0]!.split('-');
    const time = dateParts[1]!.split(':');
    if (date.length !== 3 || time.length !== 3) {
        return null;
    }

    const year = Number.parseInt(date[0]!);
    const month = Number.parseInt(date[1]!) - 1; // Months are zero-based
    const day = Number.parseInt(date[2]!);
    const hours = Number.parseInt(time[0]!);
    const minutes = Number.parseInt(time[1]!);
    const seconds = Number.parseInt(time[2]!);

    const utcDate = new Date(Date.UTC(year, month, day, hours, minutes, seconds));

    return utcDate;
}
