const router = new VueRouter({
  routes: [{
      path: '/',
      component: ArticleListComponent
    },
    {
      path: '/article/:id',
      component: ArticleComponent
    },
    {
      path: '/admin',
      component: AdminComponent
    }
  ]
})

const app = new Vue({
  router
}).$mount('#app');

app.DEBUG = true;
app.API_URL = "http://localhost:5000/api";
