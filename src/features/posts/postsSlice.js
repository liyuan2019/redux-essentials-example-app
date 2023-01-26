import {
  createSlice,
  createAsyncThunk,
  createSelector,
  createEntityAdapter,
} from '@reduxjs/toolkit'
import { client } from '../../api/client'

// import { sub } from 'date-fns'

const postsAdapter = createEntityAdapter({
  sortComparer: (a, b) => b.date.localeCompare(a.date),
})

const initialState = postsAdapter.getInitialState({
  status: 'idle',
  error: null,
})

// const initialState = [
//   {
//     id: '1',
//     date: sub(new Date(), { minutes: 10 }).toISOString(),
//     title: 'First Post!',
//     content: 'Hello!',
//     user: '0',
//     reactions: { thumbsUp: 0, hooray: 0, heart: 0, rocket: 0, eyes: 0 },
//   },
//   {
//     id: '2',
//     date: '2023-01-10 16:30',
//     title: 'Second Post',
//     content: 'More text',
//     user: '1',
//     reactions: { thumbsUp: 0, hooray: 0, heart: 0, rocket: 0, eyes: 0 },
//   },
// ]

// const initialState = {
//   posts: [],
//   status: 'idle',
//   error: null,
// }

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  const response = await client.get('/fakeApi/posts')
  return response.data
})

export const addNewPost = createAsyncThunk(
  'posts/addNewPost',
  // The payload creator receives the partial `{title, content, user}` object
  async (initialPost) => {
    // We send the initial data to the fake API server
    const response = await client.post('/fakeApi/posts', initialPost)
    // The response includes the complete post object, including unique ID
    return response.data
  }
)

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // postAdded(state, action) {
    //   state.push(action.payload)
    // },
    // postAdded: {
    //   reducer(state, action) {
    //     state.posts.push(action.payload)
    //   },
    //   prepare(title, content, userId) {
    //     return {
    //       payload: {
    //         id: nanoid(),
    //         date: new Date().toISOString(),
    //         title,
    //         content,
    //         user: userId,
    //       },
    //     }
    //   },
    // },
    postUpdated(state, action) {
      const { id, title, content } = action.payload
      // const existingPost = state.posts.find((post) => post.id === id)
      const existingPost = state.entities[id]
      if (existingPost) {
        existingPost.title = title
        existingPost.content = content
      }
    },
    reactionAdded(state, action) {
      const { postId, reaction } = action.payload
      // const existingPost = state.posts.find((post) => post.id === postId)
      const existingPost = state.entities[postId]
      if (existingPost) {
        existingPost.reactions[reaction]++
      }
    },
  },
  //respond to other actions that weren't defined as part of this slice's reducers field
  extraReducers(builder) {
    builder
      .addCase(fetchPosts.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // Add any fetched posts to the array
        // state.posts = state.posts.concat(action.payload)
        // Use the `upsertMany` reducer as a mutating update utility
        postsAdapter.upsertMany(state, action.payload)
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      // .addCase(addNewPost.fulfilled, (state, action) => {
      //   // We can directly add the new post object to our posts array
      //   state.posts.push(action.payload)
      // })
      // Use the `addOne` reducer for the fulfilled case
      .addCase(addNewPost.fulfilled, postsAdapter.addOne)
  },
})

export const { postAdded, postUpdated, reactionAdded } = postsSlice.actions

export default postsSlice.reducer

//reusable selectors
// export const selectAllPosts = (state) => state.posts.posts

// export const selectPostById = (state, postId) =>
//   state.posts.posts.find((post) => post.id === postId)

// Export the customized selectors for this adapter using `getSelectors`
export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
  // Pass in a selector that returns the posts slice of state
} = postsAdapter.getSelectors((state) => state.posts)

//createSelector function generates memoized selectors that will only recalculate results when the inputs change.
/** createSelector takes one or more "input selector" functions as argument, plus an "output 
selector" function. When we call selectPostsByUser(state, userId), createSelector will pass 
all of the arguments into each of our input selectors. Whatever those input selectors return 
becomes the arguments for the output selector. **/
export const selectPostsByUser = createSelector(
  //Since the user ID is the second argument we're passing into selectPostsByUser, we can write a small selector that just returns userId.
  [selectAllPosts, (state, userId) => userId],
  (posts, userId) => posts.filter((post) => post.user === userId)
)
