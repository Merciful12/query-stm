import {
  createEvent,
  restore,
  sample,
  Store,
  createStore,
  combine,
  attach,
} from "effector";
import {
  QueryKey,
  QueryObserver,
  QueryObserverOptions,
  QueryObserverResult,
} from "react-query";
import { queryClient, fetchPost } from "./model";
import { spread } from "patronum";

const createQuery = <
  State,
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(options: {
  source: Store<State>;
  fn: (
    source: State
  ) => QueryObserverOptions<TQueryFnData, TError, TData, TQueryKey>;
}): {
  data: Store<TData | undefined>;
  isLoading: Store<boolean>;
} => {
  type Observer = QueryObserver<TQueryFnData, TError, TData, TQueryKey>;
  const init = createEvent();
  const newValueReceived = createEvent<QueryObserverResult<TData, TError>>();

  const $options = combine(options.source, options.fn);
  const $loading = createStore(false);
  const $data = createStore<TData | undefined>(undefined, {
    skipVoid: false,
  });
  const $observer = createStore<Observer | null>(null);

  const subscribeFx = attach({
    source: $observer,
    effect: (observer) => observer?.subscribe(newValueReceived),
  });
  const setOptionsFx = attach({
    source: $observer,
    effect: (
      observer,
      options: QueryObserverOptions<TQueryFnData, TError, TData, TQueryKey>
    ) => observer?.setOptions(queryClient.defaultQueryObserverOptions(options)),
  });

  sample({
    clock: init,
    source: $options,
    fn: (options) =>
      new QueryObserver<TQueryFnData, TError, TData, TQueryKey>(
        queryClient,
        queryClient.defaultQueryObserverOptions(options)
      ),
    target: $observer,
  });

  sample({
    clock: $observer,
    target: subscribeFx,
  });

  sample({
    clock: newValueReceived,
    target: spread({
      data: $data,
      isLoading: $loading,
    }),
  });

  sample({
    clock: $options,
    target: setOptionsFx,
  });

  init();

  return {
    data: $data.map((v) => v, { skipVoid: false }),
    isLoading: $loading.map((v) => v),
  };
};
export const changePost = createEvent<number>();
export const $currentPost = restore(changePost, 1);

export const $postQuery = createQuery({
  source: $currentPost,
  fn: (post) => ({
    queryKey: ["post", post] as const,
    queryFn: async ({ queryKey: [, post], signal }) => fetchPost(post, signal),
  }),
});

export const $postTitle = $postQuery.data.map((data) => data?.title, {
  skipVoid: false,
});
