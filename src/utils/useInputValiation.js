import { useState, useCallback } from "react";

// Debounced validation function
export const useInputValidation = (initialValue, validator) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState(null);

  const validate = useCallback(() => {
    if (validator && value !== "") {
      const errorMessage = validator(value);
      setError(errorMessage);
    } else {
      setError(null);
    }
  }, [value, validator]);

  const changeHandler = (e) => {
    setValue(e.target.value);
  };

  const clear = () => {
    setValue("");
    setError(null);
  };

  return {
    value,
    error,
    changeHandler,
    validate,
    clear
  };
};
