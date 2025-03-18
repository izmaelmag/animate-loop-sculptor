export const waitUntilFrame = (
  frame: number,
  currentFrame: number
): boolean => {
  if (currentFrame < frame) {
    return false;
  }

  return true;
};
