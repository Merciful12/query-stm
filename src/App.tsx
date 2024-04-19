import { QueryClientProvider } from "react-query";
import { useUnit } from "effector-react";
import { currentPost, postQuery, postTitle } from "./model.signals";
import {
  $currentPost,
  $postQuery,
  $postTitle,
  changePost,
} from "./model.effector";
import { queryClient, useFetchTodo } from "./model";

function App() {
  return (
    <>
      <button
        onClick={() => {
          changePost(currentPost.value + 1);

          return currentPost.value++;
        }}
      >
        inc
      </button>
      <button
        onClick={() => {
          changePost(currentPost.value - 1);
          return currentPost.value--;
        }}
      >
        dec
      </button>
      <QueryClientProvider client={queryClient}>
        <ReactQuery />
      </QueryClientProvider>

      <CoreQuerySignal />

      <CoreQueryEffector />
    </>
  );
}

function ReactQuery() {
  const { data, isLoading } = useFetchTodo(currentPost.value);

  return (
    <div>
      <h2>ReactQuery</h2>
      post: {currentPost} <br /> {isLoading && "loading"} {data?.title}
    </div>
  );
}

function CoreQueryEffector() {
  const { isLoading, title, currentPost } = useUnit({
    isLoading: $postQuery.isLoading,
    title: $postTitle,
    currentPost: $currentPost,
  });

  return (
    <div>
      <h2>Effector</h2>
      post: {currentPost} <br /> {isLoading && "loading"} {title}
    </div>
  );
}

function CoreQuerySignal() {
  return (
    <div>
      <h2>Signals</h2>
      post: {currentPost} <br /> {postQuery.isLoading.value && "loading"}{" "}
      {postTitle}
    </div>
  );
}

export default App;
