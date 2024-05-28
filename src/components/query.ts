export const queryParams = {
  encode: (x: string) => btoa(encodeURIComponent(x)),
  decode: (x?: string | null) => {
    if (!x) return x;
    try {
      return decodeURIComponent(atob(x));
    } catch (error) {
      console.error(error);
    }
    return x;
  },
};
