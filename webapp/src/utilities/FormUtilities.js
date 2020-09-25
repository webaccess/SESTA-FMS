/** returns true if json is empty */
export const checkEmpty = (obj) => {
  return !Object.keys(obj).length ? true : false;
};
