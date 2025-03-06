export const PAGE_TRANSITION = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    filter: "blur(0)",
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    filter: "blur(4px)",
    transition: {
      duration: 0.35,
      ease: [0.26, 1, 0.6, 1],
    },
  },
  transition: {
    duration: 0.75,
    ease: [0.26, 1, 0.6, 1],
  },
};
