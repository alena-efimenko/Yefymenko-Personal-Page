const ArticleListComponent = Vue.component("article-list", {
  template: "#article-list-template",
  mounted() {
    this.getArticles();
  },
  data() {
    let articles = [];
    let recentPosts = [];

    return {
      articles: articles,
      recentPosts: recentPosts
    }
  },
  methods: {
    getArticles() {
      Vue.http.get(app.API_URL + "/articles")
        .then(success => {
          this.articles = success.body;
          this.recentPosts = this.getRecentArticles();
        }, error => {});
    },
    getRecentArticles() {
      return this.articles.sort((a, b) => Date(b.date) - Date(a.date)).slice(0, 5).map(function(a) {
        return {
          id: a.id,
          header: a.header.substring(0, 70) + "..."
        }
      });
    }
  }
});