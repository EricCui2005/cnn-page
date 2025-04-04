"use client";
import { useEffect } from "react";

export default function Home() {
  const fetchData = async () => {
    const response = await fetch("/api/model-summary");
    const data = await response.json();
    console.log(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <h1>Testing</h1>
    </>
  );
}
