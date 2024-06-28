import React, { useState, useEffect, useCallback } from "react";
import { gql, useMutation } from "@apollo/client";
import { GET_POSTS } from "./PostList";
import InputField from "./InputField";

const UPDATE_POST = gql`
  mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
    updatePost(id: $id, input: $input) {
      id
      title
      body
    }
  }
`;

export const DELETE_POST = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }
`;

interface PostProps {
  id: string;
  title: string;
  body: string;
}

const Post: React.FC<PostProps> = ({
  id,
  title: initialTitle,
  body: initialBody,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [postTitle, setPostTitle] = useState(initialTitle);
  const [postBody, setPostBody] = useState(initialBody);
  const [titleError, setTitleError] = useState(false);
  const [bodyError, setBodyError] = useState(false);

  const [updatePost] = useMutation(UPDATE_POST);
  const [deletePost] = useMutation(DELETE_POST, {
    update(cache, { data: { deletePost } }) {
      const existingPosts: any = cache.readQuery({
        query: GET_POSTS,
        variables: { options: { paginate: { page: 1, limit: 5 } } },
      });
      const newPosts = existingPosts.posts.data.filter(
        (post: any) => post.id !== id
      );
      cache.writeQuery({
        query: GET_POSTS,
        variables: { options: { paginate: { page: 1, limit: 5 } } },
        data: {
          posts: {
            ...existingPosts.posts,
            data: newPosts,
          },
        },
      });
    },
  });

  const validateInput = useCallback((input: string): boolean => {
    return input.trim().length > 0;
  }, []);

  const handleSave = useCallback(() => {
    const isTitleValid = validateInput(postTitle);
    const isBodyValid = validateInput(postBody);

    setTitleError(!isTitleValid);
    setBodyError(!isBodyValid);

    if (isTitleValid && isBodyValid) {
      updatePost({
        variables: { id, input: { title: postTitle, body: postBody } },
      });
      setIsEditing(false);
    }
  }, [id, postTitle, postBody, updatePost, validateInput]);

  const handleInputChange = useCallback(
    (
        setter: React.Dispatch<React.SetStateAction<string>>,
        errorSetter: React.Dispatch<React.SetStateAction<boolean>>
      ) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setter(e.target.value);
        errorSetter(false);
      },
    []
  );

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isEditing) {
        updatePost({
          variables: { id, input: { title: postTitle, body: postBody } },
        });
        event.returnValue =
          "You have unsaved changes, do you really want to leave?";
        return event.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isEditing, postTitle, postBody, id, updatePost]);

  return (
    <div className="border p-4 my-2 rounded">
      {isEditing ? (
        <div className="space-y-2">
          <InputField
            value={postTitle}
            onChange={handleInputChange(setPostTitle, setTitleError)}
            error={titleError}
            errorMessage="Title cannot be empty"
            placeholder="Enter title"
          />
          <InputField
            as="textarea"
            value={postBody}
            onChange={handleInputChange(setPostBody, setBodyError)}
            error={bodyError}
            errorMessage="Body cannot be empty"
            placeholder="Enter body"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div onClick={() => setIsEditing(true)} className="cursor-pointer">
          <h3 className="text-lg font-bold">{postTitle}</h3>
          <p>{postBody}</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(Post);
