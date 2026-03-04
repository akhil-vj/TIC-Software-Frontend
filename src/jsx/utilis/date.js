export const formatDate = (date, type = "en-CA") => {
  const value = new Date(date).toLocaleDateString(type); // formated date
  return value;
};
export const parseDate = (date) => {
  if(date){
  const value = new Date(date); // parse date
    return value;
  }
};

export const dateComparison = (date) => {
  // Create a date object representing today's date
  const today = new Date();
  
  // Create a date object for the date you want to compare (replace with your desired date)
  const otherDate = new Date(date); // This is just an example, replace it with your date

  // Compare the two date objects
  const isGreaterThanToday = otherDate > today;
  return isGreaterThanToday
  }

export const formatTimeToHis = (timeString) => {
  const [hours, minutes] = timeString.split(':');

  // Create a new Date object
  const time = new Date();
  time.setHours(parseInt(hours, 10));
  time.setMinutes(parseInt(minutes, 10));

  // Format the time as "H:i:s"
  const formattedTime = time.toTimeString().split(' ')[0];
  return formattedTime
}
export const parseTime = (time) => {
  if (!time) return "";
  const value = String(time).trim();
  // Supports "HH:mm", "HH:mm:ss", or already formatted "h:mm AM/PM"
  const match = value.match(/^(\d{1,2})(?::(\d{2}))?(?::\d{2})?\s*(am|pm)?/i);
  if (!match) return value;

  const hrNum = Number(match[1]);
  const minRaw = match[2] ?? "00";
  const meridian = match[3]?.toUpperCase();

  // If already has AM/PM, normalize hours and return.
  if (meridian) {
    const hour12 = ((hrNum + 11) % 12) + 1;
    const minutes = String(minRaw).padStart(2, "0");
    return `${hour12}:${minutes} ${meridian}`;
  }

  if (Number.isNaN(hrNum)) return value;
  const period = hrNum >= 12 ? "PM" : "AM";
  const hour12 = ((hrNum + 11) % 12) + 1;
  const minutes = String(minRaw).padStart(2, "0");
  return `${hour12}:${minutes} ${period}`;
};
