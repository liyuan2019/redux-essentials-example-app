import React, { useMemo } from 'react'
// import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import classnames from 'classnames'

import { Spinner } from '../../components/Spinner'
import { PostAuthor } from './PostAuthor'
import { TimeAgo } from './TimeAgo'
import { ReactionButtons } from './ReactionButtons'
// import {
//   // selectAllPosts,
//   fetchPosts,
//   selectPostIds,
//   selectPostById,
// } from './postsSlice'
import { useGetPostsQuery } from '../api/apiSlice'

let PostExcerpt = ({ post }) => {
  // const post = useSelector((state) => selectPostById(state, postId))
  return (
    <article className="post-excerpt">
      <h3>{post.title}</h3>
      <div>
        <PostAuthor userId={post.user} />
        <TimeAgo timestamp={post.date} />
      </div>
      <p className="post-content">{post.content.substring(0, 100)}</p>

      <ReactionButtons post={post} />
      <Link to={`/posts/${post.id}`} className="button muted-button">
        View Post
      </Link>
    </article>
  )
}

export const PostsList = () => {
  // const dispatch = useDispatch()
  // const orderedPostIds = useSelector(selectPostIds)
  // // const posts = useSelector(selectAllPosts)
  // const postStatus = useSelector((state) => state.posts.status)
  // const error = useSelector((state) => state.posts.error)

  // useEffect(() => {
  //   if (postStatus === 'idle') {
  //     dispatch(fetchPosts())
  //   }
  // }, [postStatus, dispatch])

  //The useGetPostsQuery Hook replaces all of ↑!
  const {
    //We'll also want to give posts a default empty array in case it's undefined, so that we always have an array to sort on.
    data: posts = [],
    isLoading,
    isFetching,
    isSuccess,
    isError,
    error,
  } = useGetPostsQuery()

  //do the sorting in a useMemo() hook.
  const sortedPosts = useMemo(() => {
    const sortedPosts = posts.slice()
    // Sort posts in descending chronological order
    sortedPosts.sort((a, b) => b.date.localeCompare(a.date))
    return sortedPosts
  }, [posts])

  let content

  // if (postStatus === 'loading') {
  //   content = <Spinner text="Loading..." />
  // } else if (postStatus === 'succeeded') {
  //   // Sort posts in reverse chronological order by datetime string
  //   // const orderedPosts = posts
  //   //   .slice()
  //   //   .sort((a, b) => b.date.localeCompare(a.date))

  //   // content = orderedPosts.map((post) => (
  //   //   <PostExcerpt key={post.id} post={post} />
  //   // ))
  //   content = orderedPostIds.map((postId) => (
  //     <PostExcerpt key={postId} postId={postId} />
  //   ))
  // } else if (postStatus === 'failed') {
  //   content = <div>{error}</div>
  // }

  if (isLoading) {
    content = <Spinner text="Loading..." />
  } else if (isSuccess) {
    // content = posts.map((post) => <PostExcerpt key={post.id} post={post} />)
    // content = sortedPosts.map((post) => (
    //   <PostExcerpt key={post.id} post={post} />
    // ))
    const renderedPosts = sortedPosts.map((post) => (
      <PostExcerpt key={post.id} post={post} />
    ))

    const containerClassname = classnames('posts-container', {
      disabled: isFetching,
    })

    content = <div className={containerClassname}>{renderedPosts}</div>
  } else if (isError) {
    content = <div>{error.toString()}</div>
  }

  return (
    <section className="posts-list">
      <h2>Posts</h2>
      {content}
    </section>
  )
}
