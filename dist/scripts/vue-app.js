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

const application = new Vue({
  router
}).$mount('#app');