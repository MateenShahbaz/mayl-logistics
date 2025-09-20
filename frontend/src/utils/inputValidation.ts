export const allowOnlyNumbers = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const allowedKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "Escape",
    "Enter",
    "ArrowLeft",
    "ArrowRight",
  ];

  if (allowedKeys.includes(e.key)) {
    return;
  }

  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
};
