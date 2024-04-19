import {
  batch,
  computed,
  effect,
  signal,
  ReadonlySignal,
} from "@preact/signals-react";
import { fetchPost, queryClient } from "./model";
import { QueryKey, QueryObserver, QueryObserverOptions } from "react-query";

export const createQuerySignal = <
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  options: () => QueryObserverOptions<TQueryFnData, TError, TData, TQueryKey>
): {
  data: ReadonlySignal<TData | undefined>;
  isLoading: ReadonlySignal<boolean>;
} => {
  const comOptions = computed(options);
  const isLoading = signal(false);
  const data = signal<TData | undefined>(undefined);

  const defaultedOptions = queryClient.defaultQueryObserverOptions(
    comOptions.value
  );
  const observer = new QueryObserver(queryClient, defaultedOptions);
  observer?.subscribe((result) => {
    batch(() => {
      data.value = result.data;
      isLoading.value = result.isLoading;
    });
  });

  effect(() => {
    const defaultedOptions = queryClient.defaultQueryObserverOptions(
      comOptions.value
    );

    observer.setOptions(defaultedOptions);
  });

  return {
    isLoading: computed(() => isLoading.value),
    data: computed(() => data.value),
  };
};

export const currentPost = signal(1);

export const postQuery = createQuerySignal(() => ({
  queryKey: ["todos", currentPost.value] as const,
  queryFn: ({ queryKey: [, post], signal }) => fetchPost(post, signal),
}));

export const postTitle = computed(() => postQuery.data.value?.title);
