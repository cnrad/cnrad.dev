"use client";

import { useEffect, useRef } from "react";

export const CurrentAge = () => {
  const ref = useRef<HTMLSpanElement>(null);

  const update = () => {
    const age = (
      (new Date().getTime() - new Date("2004-12-08T17:10:00Z").getTime()) /
      (365.25 * 24 * 60 * 60 * 1000)
    ).toFixed(10);

    if (ref.current) ref.current.innerText = age;
  };

  useEffect(() => {
    const interval = setInterval(update, 1);

    return () => clearInterval(interval);
  }, []);

  return <span ref={ref} />;
};
