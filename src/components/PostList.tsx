import React, { useState } from "react";
import { useQuery, gql } from "@apollo/client";
import Post from "./Post";

export const GET_POSTS = gql`
  query GetPosts($options: PageQueryOptions) {
    posts(options: $options) {
      data {
        id
        title
        body
      }
      meta {
        totalCount
      }
    }
  }
`;

const PostSkeleton: React.FC = () => (
  <div className="border p-4 my-2 rounded animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
  </div>
);

const PostList: React.FC = () => {
  const [page, setPage] = useState(1);
  const limit = 5;

  const { loading, error, data } = useQuery(GET_POSTS, {
    variables: { options: { paginate: { page, limit } } },
  });

  if (error)
    return <p className="text-center text-red-500">Error: {error.message}</p>;

  const totalPages = data ? Math.ceil(data.posts.meta.totalCount / limit) : 0;

  return (
    <div className="flex flex-col justify-between container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-center text-2xl	">★★★★★★ Hire me, please :) ★★★★★★</h1>
      <div>
        {loading
          ? Array.from({ length: limit }).map((_, index) => (
              <PostSkeleton key={index} />
            ))
          : data.posts.data.map(
              (post: { id: string; title: string; body: string }) => (
                <Post
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  body={post.body}
                />
              )
            )}
      </div>
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page <= 1 || loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages || loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PostList;
