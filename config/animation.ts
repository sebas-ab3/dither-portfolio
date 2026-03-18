export const ANIMATION = {
  scramble: {
    duration: 1200,
    charInterval: 30,
    staggerMax: 400,
    charset: '!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  },
  blur: {
    duration: 500,
    amount: '4px',
    easing: 'ease-out',
  },
  powerOff: {
    flash: 100,
    collapseVertical: 200,
    collapseHorizontal: 150,
    dotFade: 200,
    blackHold: 300,
  },
  powerOn: {
    blackHold: 300,
    dotAppear: 100,
    expandHorizontal: 150,
    expandVertical: 250,
    staticBurst: 100,
    contentFade: 200,
  },
  boot: {
    lineDelay: 150,
    typeSpeed: 20,
    holdAfterComplete: 1000,
  },
  titleCycle: {
    displayDuration: 2500,
    scrambleResolve: 400,
  },
  hover: {
    glowTransition: 200,
  },
} as const;
