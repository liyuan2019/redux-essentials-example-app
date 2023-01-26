import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
} from '@reduxjs/toolkit'
import { client } from '../../api/client'

// const initialState = [
//   { id: '0', name: 'Tianna Jenkins' },
//   { id: '1', name: 'Kevin Grant' },
//   { id: '2', name: 'Madison Price' },
// ]

// const initialState = []
const usersAdapter = createEntityAdapter()

const initialState = usersAdapter.getInitialState()

export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const response = await client.get('/fakeApi/users')
  return response.data
})

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers(builder) {
    // builder.addCase(fetchUsers.fulfilled, (state, action) => {
    //reducer isn't using the state variable at all.
    //Immer lets us update state in two ways: either mutating the existing state value, or returning a new result.
    //state.push(...action.payload)
    //return a new value, that will replace the existing state completely with whatever we return.
    // return action.payload
    // })
    builder.addCase(fetchUsers.fulfilled, usersAdapter.setAll)
  },
})

// export const selectAllUsers = (state) => state.users

// export const selectUserById = (state, userId) =>
//   state.users.find((user) => user.id === userId)

export const { selectAll: selectAllUsers, selectById: selectUserById } =
  usersAdapter.getSelectors((state) => state.users)

export default usersSlice.reducer
