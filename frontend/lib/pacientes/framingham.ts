/**
 * Escore de Risco de Framingham
 * PORTARIA SAS/MS Nº 08 DE 30/07/2019
 */

export interface FraminghamInput {
  age: number;
  sex: "M" | "F";
  totalCholesterol: number;
  hdlCholesterol: number;
  systolicBP: number;
  isTreatedForHypertension: boolean;
  isSmoker: boolean;
  isDiabetic: boolean; // Kept for compatibility but not used in this specific table
}

export type FraminghamCategory = "<10" | "10-20" | ">20";

export function calculateFraminghamScore(input: FraminghamInput): {
  score: number;
  category: FraminghamCategory;
} {
  const {
    age,
    sex,
    totalCholesterol: tc,
    hdlCholesterol: hdl,
    systolicBP: sbp,
    isTreatedForHypertension: treated,
    isSmoker: smoker,
  } = input;

  let points = 0;

  // 1. Idade
  points += getAgePoints(age, sex);

  // 2. Colesterol Total
  points += getCholesterolPoints(tc, age, sex);

  // 3. Fumo
  points += getSmokingPoints(smoker, age, sex);

  // 4. HDL Colesterol
  points += getHdlPoints(hdl);

  // 5. Pressão Arterial Sistólica
  points += getBpPoints(sbp, treated, sex);

  // Risco Absoluto em 10 anos
  const riskPercentage = getRiskPercentage(points, sex);

  return {
    score: riskPercentage,
    category: getCategory(riskPercentage),
  };
}

function getAgePoints(age: number, sex: "M" | "F"): number {
  if (sex === "M") {
    if (age < 35) return -9; // 20-34
    if (age < 40) return -4; // 35-39
    if (age < 45) return 0;  // 40-44
    if (age < 50) return 3;  // 45-49
    if (age < 55) return 6;  // 50-54
    if (age < 60) return 8;  // 55-59
    if (age < 65) return 10; // 60-64
    if (age < 70) return 11; // 65-69
    if (age < 75) return 12; // 70-74
    return 13;               // 75-79 (or more)
  } else {
    if (age < 35) return -7; // 20-34
    if (age < 40) return -3; // 35-39
    if (age < 45) return 0;  // 40-44
    if (age < 50) return 3;  // 45-49
    if (age < 55) return 6;  // 50-54
    if (age < 60) return 8;  // 55-59
    if (age < 65) return 10; // 60-64
    if (age < 70) return 12; // 65-69
    if (age < 75) return 14; // 70-74
    return 16;               // 75-79 (or more)
  }
}

function getCholesterolPoints(tc: number, age: number, sex: "M" | "F"): number {
  let ageGroup = 0;
  if (age < 40) ageGroup = 0;      // 20-39
  else if (age < 50) ageGroup = 1; // 40-49
  else if (age < 60) ageGroup = 2; // 50-59
  else if (age < 70) ageGroup = 3; // 60-69
  else ageGroup = 4;               // 70-79

  if (sex === "M") {
    if (tc < 160) return 0;
    if (tc < 200) return [4, 3, 2, 1, 0][ageGroup];
    if (tc < 240) return [7, 5, 3, 1, 0][ageGroup];
    if (tc < 280) return [9, 6, 4, 2, 1][ageGroup];
    return [11, 8, 5, 3, 1][ageGroup];
  } else {
    if (tc < 160) return 0;
    if (tc < 200) return [4, 3, 2, 1, 1][ageGroup];
    if (tc < 240) return [8, 6, 4, 2, 1][ageGroup];
    if (tc < 280) return [11, 8, 5, 3, 2][ageGroup];
    return [13, 10, 7, 4, 2][ageGroup];
  }
}

function getSmokingPoints(smoker: boolean, age: number, sex: "M" | "F"): number {
  if (!smoker) return 0;

  let ageGroup = 0;
  if (age < 40) ageGroup = 0;      // 20-39
  else if (age < 50) ageGroup = 1; // 40-49
  else if (age < 60) ageGroup = 2; // 50-59
  else if (age < 70) ageGroup = 3; // 60-69
  else ageGroup = 4;               // 70-79

  if (sex === "M") {
    return [8, 5, 3, 1, 1][ageGroup];
  } else {
    return [9, 7, 4, 2, 1][ageGroup];
  }
}

function getHdlPoints(hdl: number): number {
  if (hdl >= 60) return -1;
  if (hdl >= 50) return 0;
  if (hdl >= 40) return 1;
  return 2;
}

function getBpPoints(sbp: number, treated: boolean, sex: "M" | "F"): number {
  if (sex === "M") {
    if (sbp < 120) return 0; // treated and untreated are 0
    if (sbp < 130) return treated ? 1 : 0;
    if (sbp < 140) return treated ? 2 : 1;
    if (sbp < 160) return treated ? 2 : 1;
    return treated ? 3 : 2;
  } else {
    if (sbp < 120) return 0; // treated and untreated are 0
    if (sbp < 130) return treated ? 3 : 1;
    if (sbp < 140) return treated ? 4 : 2;
    if (sbp < 160) return treated ? 5 : 3;
    return treated ? 6 : 4;
  }
}

function getRiskPercentage(points: number, sex: "M" | "F"): number {
  if (sex === "M") {
    if (points <= -1) return 0.5; // menos de 1%
    if (points === 0) return 1;
    if (points === 1) return 1;
    if (points === 2) return 1;
    if (points === 3) return 1;
    if (points === 4) return 1;
    if (points === 5) return 2;
    if (points === 6) return 2;
    if (points === 7) return 3;
    if (points === 8) return 4;
    if (points === 9) return 5;
    if (points === 10) return 6;
    if (points === 11) return 8;
    if (points === 12) return 10;
    if (points === 13) return 12;
    if (points === 14) return 16;
    if (points === 15) return 20;
    if (points === 16) return 25;
    return 30; // 17 ou mais => 30 ou mais
  } else {
    if (points <= 8) return 0.5; // "menos de 9" => "menos de 1%" (0 na tabela provavelmente erro de digitação para <1%)
    if (points === 9) return 1;
    if (points === 10) return 1;
    if (points === 11) return 1;
    if (points === 12) return 1;
    if (points === 13) return 2;
    if (points === 14) return 2;
    if (points === 15) return 3;
    if (points === 16) return 4;
    if (points === 17) return 5;
    if (points === 18) return 6;
    if (points === 19) return 8;
    if (points === 20) return 11;
    if (points === 21) return 14;
    if (points === 22) return 17;
    if (points === 23) return 22;
    if (points === 24) return 27;
    return 30; // 25 ou mais => 30 ou mais
  }
}

function getCategory(percentage: number): FraminghamCategory {
  if (percentage < 10) return "<10";
  if (percentage <= 20) return "10-20";
  return ">20";
}
