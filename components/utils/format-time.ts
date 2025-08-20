export const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp)
    const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",   // "short" for "May", "long" for "May"
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZoneName: "short" // optional
    };

    return new Intl.DateTimeFormat("en-US", options).format(date);
}
