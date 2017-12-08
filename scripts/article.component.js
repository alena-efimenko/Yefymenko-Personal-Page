const ArticleComponent = Vue.component("article", {
  template: "#article-template",
  data: function() {
    return {
      item: articlesApi.getArticle(this.$route.params.id)
    };
  }
});
