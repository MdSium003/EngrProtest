import React, { useState, useEffect } from 'react';

// Helper function to get the correct "st", "nd", "rd", "th" suffix for a day
const getOrdinalSuffix = (day) => {
  if (day > 3 && day < 21) return 'th'; // for 11th, 12th, 13th
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
};

const Footer = () => {
  const [dayString, setDayString] = useState('');

  useEffect(() => {
    const protestStartDate = new Date('2025-08-27T00:00:00');
    const today = new Date();
    const differenceInMs = today.getTime() - protestStartDate.getTime();
    const days = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
    const currentDayOfProtest = days >= 0 ? days + 1 : 0;

    if (currentDayOfProtest > 0) {
      const suffix = getOrdinalSuffix(currentDayOfProtest);
      setDayString(`${currentDayOfProtest}${suffix} day of protest`);
    } else {
      setDayString('The movement begins');
    }
  }, []);

  return (
    <footer className="site-footer">
      <div className="footer-left">
        {dayString}
      </div>
      <div className="footer-right">
        made by MS & RJBee
      </div>
    </footer>
  );
};

export default Footer;