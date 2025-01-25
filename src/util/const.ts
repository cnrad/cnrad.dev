export const PAGE_TRANSITION = {
  initial: {
    opacity: 0,
    x: 4,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: -10,
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: "easeOut",
    },
  },
  transition: {
    duration: 0.25,
    ease: "easeOut",
  },
};
