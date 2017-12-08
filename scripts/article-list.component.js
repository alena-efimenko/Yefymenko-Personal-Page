const ArticleListComponent = Vue.component("article-list", {
  template: "#article-list-template",
  data() {
    return {
      articles: articlesApi.getArticles(),
      recentPosts: articlesApi.getRecentArticles()
    }
  }
});
