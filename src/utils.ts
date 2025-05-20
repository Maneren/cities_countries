// Format number with spaces as thousands separator
export const prettyPrintNumber = (num: number) => {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1 ");
};

export const zip = <T, U>(a: T[], b: U[]): [T, U][] => {
  return a.map((a, i) => [a, b[i]]);
};
