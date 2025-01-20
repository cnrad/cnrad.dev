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
    x: -4,
    scale: 0.98,
  },
  transition: {
    duration: 0.35,
    ease: "easeOut",
  },
};
