declare module "zxcvbn" {
  interface ZxcvbnResult {
    score: 0 | 1 | 2 | 3 | 4;
    feedback: {
      warning: string;
      suggestions: string[];
    };
    crack_times_display: {
      offline_fast_hashing_1e10_per_second: string;
    };
  }
  function zxcvbn(password: string, userInputs?: string[]): ZxcvbnResult;
  export default zxcvbn;
}

declare module "bcryptjs" {
  function hash(data: string, saltOrRounds: string | number): Promise<string>;
  function compare(data: string, encrypted: string): Promise<boolean>;
  function genSalt(rounds?: number): Promise<string>;
  export default { hash, compare, genSalt };
  export { hash, compare, genSalt };
}

declare module "leaflet/dist/images/marker-icon.png" {
  const src: string;
  export default src;
}

declare module "leaflet/dist/images/marker-icon-2x.png" {
  const src: string;
  export default src;
}

declare module "leaflet/dist/images/marker-shadow.png" {
  const src: string;
  export default src;
}
