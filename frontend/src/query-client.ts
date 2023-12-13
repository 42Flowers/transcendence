import { AxiosError } from "axios";
import { QueryClient } from "react-query";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: Infinity,
			retry(failureCount, error) {
				if (error instanceof AxiosError) {
					/* If we have a response but it is considered to be an error, we don't retry the request */
					if (error.response)
						return false;
				}
				return (failureCount < 3);
			},
		},
	},
});
