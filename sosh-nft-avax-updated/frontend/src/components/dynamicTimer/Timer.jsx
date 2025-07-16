import React, { useState, useEffect } from "react";

const CountdownTimer = ({ startTime, endTime }) => {
  const [prevMessage, setPrevMessage] = useState("");
  const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const start = new Date(startTime * 1000).getTime();
    const end = new Date(endTime * 1000).getTime();
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

    // setPrevMessage(message);

    return { timeLeft, message };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, endTime]);

  if (timeLeft.message) {
    return (
      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          fontWeight: "bold",
          fontSize: "14px",
        }}
      >
        <p
          style={{
            margin: 0,

            fontSize: "14px",
          }}
        >
          {timeLeft.message}
        </p>
        <div>
          {timeLeft.timeLeft.days}d {timeLeft.timeLeft.hours}h{" "}
          {timeLeft.timeLeft.minutes}m {timeLeft.timeLeft.seconds}s
        </div>
      </div>
    );
  } else {
    return null;
  }
};

export default CountdownTimer;
