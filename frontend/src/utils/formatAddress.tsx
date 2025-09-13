// utils/formatAddress.ts
import { ReactNode } from "react";

export const formatAddress = (
  address: string,
  wordsPerLine: number = 3
): ReactNode[] => {
  if (!address) return [];
  const words = address.split(" ");
  const lines: string[] = [];

  for (let i = 0; i < words.length; i += wordsPerLine) {
    lines.push(words.slice(i, i + wordsPerLine).join(" "));
  }

  return lines.map((line, index) => <div key={index}>{line}</div>);
};
