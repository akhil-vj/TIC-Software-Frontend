export const checkIsFile = (value) => {
  const check = value instanceof File;
  return check;
};
export const checkFormValue = (value, type) => {
  const isNumber = typeof value === "number" || type === "number";
  if (!!isNumber) {
    if (value === 0) {
      return 0;
    }
    if (!!value) {
      return value;
      // formData.append(name,value)
    } else {
      return 0;
    }
  } else {
    if (value) {
      return value;
      // formData.append(name,value)
    } else {
      return "";
    }
  }
};
