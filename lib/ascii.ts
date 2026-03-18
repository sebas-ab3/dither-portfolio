export const TITLE_PHRASES = [
  'HELLO, WORLD',
  'HELLO, USER',
  'HELLO, SEB',
  'HELLO, EMPLOYER',
  'HELLO, ___',
] as const;

export type TitlePhrase = (typeof TITLE_PHRASES)[number];
