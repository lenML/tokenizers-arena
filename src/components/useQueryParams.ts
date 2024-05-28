import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { queryParams } from "./query";

/**
 * Custom hook to manage query parameters in React Router v6.
 * @returns [getQueryParam, setQueryParam, deleteQueryParam]
 */
export const useQueryParams = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Returns the value of a query parameter
  const getQueryParam = useCallback(
    (key: string) => {
      const searchParams = new URLSearchParams(location.search);
      return queryParams.decode(searchParams.get(key));
    },
    [location.search]
  );

  // Sets a query parameter
  const setQueryParam = useCallback(
    (key: string, value: any) => {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set(key, queryParams.encode(value));
      navigate({ search: searchParams.toString() }, { replace: true });
    },
    [location.search, navigate]
  );

  // Deletes a query parameter
  const deleteQueryParam = useCallback(
    (key: string) => {
      const searchParams = new URLSearchParams(location.search);
      searchParams.delete(key);
      navigate({ search: searchParams.toString() }, { replace: true });
    },
    [location.search, navigate]
  );

  return { getQueryParam, setQueryParam, deleteQueryParam };
};
