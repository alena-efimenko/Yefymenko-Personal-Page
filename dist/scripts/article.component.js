const ArticleComponent = Vue.component("article", {
  template: "#article-template",
  mounted() {
    this.getArticle(this.$route.params.id);
  },
  data() {
    let item = {};
    return {
      item: item
    };
  },
  methods: {
    getArticle(id) {
      Vue.http.get(app.API_URL + "/article/" + id)
        .then(success => {
          this.item = success.body;
        }, error => {});
    }
  }
});