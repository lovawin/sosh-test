export const calculateTimeLeft = (startTime, endTime) => {
  const now = new Date().getTime();
  const start = new Date(startTime * 1000).getTime(); // Convert Unix timestamp to milliseconds
  const end = new Date(endTime * 1000).getTime(); // Convert Unix timestamp to milliseconds
  let timeLeft = {};
  let message = "";

  if (start > now) {
    const difference = start - now;
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
    message = "Sales start in";
  } else if (end > now) {
    const difference = end - now;
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
    message = "Sale ends in";
  }

  return { timeLeft, message };
};

export default function formatTimestamp(timestamp) {
  const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
  const year = date.getFullYear();   

  const month = String(date.getMonth() + 1).padStart(2,   
 '0'); // Pad month with leading zero if needed
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2,   
 '0');

  const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
  console.log('formattedDate', formattedDate)
  return formattedDate;   

}
