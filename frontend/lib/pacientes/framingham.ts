/**
 * Framingham Risk Score (10-year General CVD Risk)
 * Based on D'Agostino et al. (2008) - "General Cardiovascular Risk Profile for Use in Primary Care"
 */

export interface FraminghamInput {
  age: number;
  sex: "M" | "F";
  totalCholesterol: number;
  hdlCholesterol: number;
  systolicBP: number;
  isTreatedForHypertension: boolean;
  isSmoker: boolean;
  isDiabetic: boolean;
}

export type FraminghamCategory = "<10" | "10-20" | ">20";

export function calculateFraminghamScore(input: FraminghamInput): {
  score: number;
  category: FraminghamCategory;
} {
  const {
    age,
    sex,
    totalCholesterol,
    hdlCholesterol,
    systolicBP,
    isTreatedForHypertension,
    isSmoker,
    isDiabetic,
  } = input;

  // Natural logs of the continuous variables
  const lnAge = Math.log(age);
  const lnTC = Math.log(totalCholesterol);
  const lnHdl = Math.log(hdlCholesterol);
  const lnSbp = Math.log(systolicBP);

  let sumBetaX = 0;

  if (sex === "M") {
    // Men's Coefficients
    sumBetaX += 3.06117 * lnAge;
    sumBetaX += 1.1237 * lnTC;
    sumBetaX += -0.93263 * lnHdl;
    sumBetaX += isTreatedForHypertension ? 1.99881 * lnSbp : 1.93303 * lnSbp;
    sumBetaX += isSmoker ? 0.65451 : 0;
    sumBetaX += isDiabetic ? 0.57367 : 0;

    const risk = 1 - Math.pow(0.88936, Math.exp(sumBetaX - 23.9802));
    const percentage = risk * 100;

    return {
      score: percentage,
      category: getCategory(percentage),
    };
  } else {
    // Women's Coefficients
    sumBetaX += 2.32888 * lnAge;
    sumBetaX += 1.20904 * lnTC;
    sumBetaX += -0.70833 * lnHdl;
    sumBetaX += isTreatedForHypertension ? 2.82263 * lnSbp : 2.76157 * lnSbp;
    sumBetaX += isSmoker ? 0.52873 : 0;
    sumBetaX += isDiabetic ? 0.69154 : 0;

    const risk = 1 - Math.pow(0.95012, Math.exp(sumBetaX - 26.1931));
    const percentage = risk * 100;

    return {
      score: percentage,
      category: getCategory(percentage),
    };
  }
}

function getCategory(percentage: number): FraminghamCategory {
  if (percentage < 10) return "<10";
  if (percentage <= 20) return "10-20";
  return ">20";
}
