import React, { useEffect, useState } from "react";
import { StyledBanner } from "./style";

const Banner = () => {
  const [targetDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    return date;
  });

  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <StyledBanner>
      <div className="main-container">
        {/* <span className="heading">Introducing the 'Amazing NFT Collection</span> */}
        {/* <p style={{
          marginTop:"150px",
          color:"white"
        }}>Release Date and Time</p> */}
        {/* {timeLeft.days !== undefined ? (
          <div style={{ marginTop: "200px" }} className="countdown-container">
            <div className="count-div">
              <span className="count-number">{timeLeft.days}</span>
              <span>Days</span>
            </div>
            <div className="count-div">
              <span className="count-number">{timeLeft.hours}</span>
              <span>hrs</span>
            </div>
            <div className="count-div">
              <span className="count-number">{timeLeft.minutes}</span>
              <span>min</span>
            </div>
            <div className="count-div">
              <span className="count-number">{timeLeft.seconds}</span>
              <span>sec</span>
            </div>
          </div>
        ) : (
          <span>Time's up!</span>
        )} */}
      </div>
    </StyledBanner>
  );
};

export default Banner;
