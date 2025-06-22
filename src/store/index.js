import { createStore } from 'vuex'
import axios from 'axios'

export default createStore({
  state: {
    query: '',
    results: [],
    loading: false,
    error: null
  },
  mutations: {
    SET_QUERY(state, query) {
      state.query = query
    },
    SET_RESULTS(state, results) {
      state.results = results
    },
    SET_LOADING(state, status) {
      state.loading = status
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
    async searchRepos({ commit }, query) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      commit('SET_QUERY', query)
      try {
        const res = await axios.get(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}`
        )
        commit('SET_RESULTS', res.data.items)
      } catch (err) {
        commit('SET_ERROR', 'Failed to fetch repositories')
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },
  getters: {
    results: (state) => state.results,
    loading: (state) => state.loading,
    error: (state) => state.error
  }
})