<template>
  <section class="section">
    <div class="container has-text-centered">
      <!-- Title -->
      <h1 class="title is-3 mb-5 dark-blue-title">GitHub Repository Search</h1>

      <!-- Search input -->
      <div class="field has-addons has-addons-centered">
        <div class="control is-expanded">
            <input
                v-model="searchTerm"
                @input="debouncedInput"
                @keyup.enter="search(1)"
                :disabled="loading"
                class="input is-medium"
                type="text"
                placeholder="Type to search GitHub repositories..."
            />
        </div>
      </div>

      <!-- Show loading -->
      <div v-if="loading" class="mt-4">
        <span class="tag is-info is-light is-medium">Loading...</span>
      </div>

      <!-- Total results count -->
    <div v-if="!loading && !error && totalCount > 0" class="has-text-centered mb-4">
        <p class="is-size-6 has-text-grey">
           ( {{ totalCount.toLocaleString() }} ) result
        </p>
    </div>

      <!-- Show error -->
      <div v-if="error && searchTerm" class="notification is-danger mt-4">
        {{ error }}
      </div>

      <!-- No results message -->
      <div v-if="!loading && hasSearched && !error && searchTerm && results.length === 0" class="mt-5">
        <p class="has-text-centered has-text-grey is-size-5">
            No repositories found.
        </p>
      </div>

      <!-- Show results -->
      <div v-if="results.length" class="mt-5">
        <div
          v-for="repo in results"
          :key="repo.id"
          class="box has-text-left"
        >
            <a
                :href="repo.html_url"
                target="_blank"
                class="dark-blue-link has-text-weight-semibold is-size-5"
                :title="repo.full_name"
            >
                {{ truncate(repo.full_name, 40) }}
            </a>

            <!-- Repository description -->
            <p class="has-text-grey is-size-6 mt-2">
                {{ truncate(repo.description, 150) }}
            </p>
        </div>
      </div>

      <!-- Pagination -->
      <div class="buttons is-centered mt-5" v-if="totalPages > 1">
        <!-- Previous Button -->
        <button
          class="button is-dark-blue"
          :disabled="page === 1"
          @click="changePage(page - 1)"
        >
          Previous
        </button>

        <!-- Page Numbers -->
        <template v-for="p in visiblePages" :key="p">
          <button
            class="button"
            :class="{ 'is-dark-blue': p === page }"
            @click="changePage(p)"
          >
            {{ p }}
          </button>
        </template>

        <!-- Next Button -->
        <button
          class="button is-dark-blue"
          :disabled="page === totalPages"
          @click="changePage(page + 1)"
        >
          Next
        </button>
      </div>
    </div>
  </section>
</template>


<script>
import axios from 'axios'

export default {
  data() {
    return {
      searchTerm: '',
      results: [],
      loading: false,
      error: null,
      hasSearched: false,   
      abortController: null,
      page: 1,
      perPage: 10,
      totalCount: 0,
      debounceTimer: null //  used for delay while typing
    }
  },
  methods: {
    // This function runs when typing
    debouncedInput() {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = setTimeout(() => {
        this.page = 1
        this.search(1)
      }, 500)
    },

    // Fetch data from GitHub API
    async search(page = 1) {
        const query = this.searchTerm.trim()

        if (!query) {
            this.results = []
            this.totalCount = 0
            this.error = null
            this.loading = false
            this.hasSearched = false
            return
        }

        // Cancel any previous request
        if (this.abortController) {
            this.abortController.abort()
        }
        this.abortController = new AbortController()

        this.loading = true
        this.error = null
        
        this.totalCount = 0
        this.page = page

       try {
        const response = await axios.get(
            `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&page=${page}&per_page=${this.perPage}`,
            { signal: this.abortController.signal }
        )
        this.hasSearched = true

        this.results = response.data.items
        this.totalCount = response.data.total_count
        } catch (err) {
            if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
                if (err.response && err.response.status === 403) {
                this.error = 'API rate limit exceeded. Please wait a minute and try again.'
                } else {
                this.error = 'Failed to fetch data from GitHub'
                }
            }
        } finally {
            this.loading = false
        }
    },


    // Handle page changes
    changePage(newPage) {
      if (newPage >= 1 && newPage <= this.totalPages) {
        this.page = newPage
        this.search(newPage)
      }
    },

    // Limit size of description
    truncate(text, length) {
        if (!text) return ''
        return text.length > length ? text.slice(0, length) + '...' : text
    }
  },
  computed: {
    totalPages() {
    const limit = Math.min(this.totalCount, 1000) // GitHub returns max 1000
    return Math.ceil(limit / this.perPage)
  },
    visiblePages() {
      const pages = []
      const start = Math.max(1, this.page - 2)
      const end = Math.min(this.totalPages, this.page + 2)
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    }
  }
}
</script>

<style scoped>
    .button.is-dark-blue {
        background-color: #003366; 
        color: white;
        border: none;
    }

    .button.is-dark-blue:hover {
        background-color: #002244;
    }

    .dark-blue-link {
        color: #074e94; 
        text-decoration: none;
        transition: text-decoration 0.3s ease;
    }

    .dark-blue-link:hover {
        text-decoration: underline;
    }

    .dark-blue-title {
        color: #074e94;
    }
</style>
