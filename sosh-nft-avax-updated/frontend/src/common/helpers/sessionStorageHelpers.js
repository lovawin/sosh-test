export const setItemToSession = (key, value) => {
  try {
    const stringify = JSON.stringify(value);
    sessionStorage.setItem(key, stringify);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const removeItemFromSession = (key) => {
  try {
    sessionStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const getItemFromSession = (key) => {
  let item;
  try {
    item = sessionStorage.getItem(key);

    return JSON.parse(item);
  } catch (error) {
    console.error(error);
    return item || null;
  }
};
