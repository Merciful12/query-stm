import { QueryClient, useQuery } from "react-query";

export const queryClient = new QueryClient();

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const fetchPost = async (post: number, signal?: AbortSignal) => {
  await sleep(1000);
  return fetch("https://jsonplaceholder.typicode.com/posts/" + post, {
    signal,
  }).then((res) => res.json()) as Promise<{ title: string }>;
};

export const useFetchTodo = (post: number) =>
  {
    return useQuery({
      queryKey: ["post", post] as const,
      queryFn: ({ queryKey: [, post], signal }) => fetchPost(post, signal),
    });
  };
