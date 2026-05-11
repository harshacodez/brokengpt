function formatTimestamp(timestampStr: string): string {
  // Remove "GMT" from the timestamp string, if present
  const cleanedTimestampStr = timestampStr.replace(" GMT", "");

  // Parse the timestamp using the Date constructor
  let date = new Date(cleanedTimestampStr);

  // If the date is invalid, try to parse it using ISO 8601 format
  if (isNaN(date.getTime())) {
    date = new Date(cleanedTimestampStr);
  }

  // If the date is still invalid, log an error and throw an exception
  if (isNaN(date.getTime())) {
    console.error("Invalid timestamp format:", cleanedTimestampStr); // Debug log
    throw new Error("Invalid timestamp format");
  }

  // Get the user's local timezone offset in minutes
  const userTimezoneOffset = date.getTimezoneOffset() * 60000; // Convert to milliseconds
  const userDate = new Date(date.getTime() - userTimezoneOffset);

  // Format the date in "Today 5:30 PM" format using Intl.DateTimeFormat
  const now = new Date();
  const diff = (now.getTime() - userDate.getTime()) / (1000 * 60 * 60 * 24); // Difference in days

  let formattedDate;

  if (diff < 1) {
    // Today
    formattedDate = `Today ${userDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (diff < 2) {
    // Yesterday
    formattedDate = `Yesterday ${userDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (diff < 7) {
    // Last week
    formattedDate = userDate.toLocaleDateString([], {
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    // Other dates
    formattedDate = userDate.toLocaleDateString([], {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return formattedDate;
}

export default formatTimestamp;
