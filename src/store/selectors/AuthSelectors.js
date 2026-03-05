export const isAuthenticated = (state) => {
  if (state.auth.auth.data?.id) return true;
  return false;
};
