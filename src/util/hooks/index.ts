import { useRef } from 'react';

export const useLatest = value => {
  const ctx = useRef(value);
  ctx.current = value;
  return ctx;
};
