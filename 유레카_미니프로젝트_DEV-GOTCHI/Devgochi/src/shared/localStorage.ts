const setLocalStorage = <T>(key: string, value: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Unknown error occurred");
    }
  }
};

const getLocalStorage = (key: string): number => {
  const value = localStorage.getItem(key);

  // 1. 값이 없으면 '0' 저장 후 숫자 0 반환
  if (!value) {
    setLocalStorage(key, 0);
    return 0;
  }

  try {
    // 2. JSON.parse 결과를 숫자로 강제 변환
    const parsed = JSON.parse(value);
    const num = Number(parsed);

    // 3. 변환된 결과가 NaN(숫자가 아님)이면 0 반환
    return isNaN(num) ? 0 : num;
  } catch {
    return 0;
  }
};

export { setLocalStorage, getLocalStorage };
