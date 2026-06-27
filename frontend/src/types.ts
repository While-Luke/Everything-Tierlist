export type TierName =
  | "S"
  | "A"
  | "B"
  | "C"
  | "D"
  | "F"
  | "unranked";

export type TierState = {
  [key in TierName]: string[];
};