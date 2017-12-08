const AdminComponent = Vue.component("admin", {
  template: "#admin-template",
  data() {
    return {
      adminData: "",
      errorMessage: ""
    }
  },
  methods: {
    getAdminPanel() {
      authApi.adminRequest("/admin", (success, error) => {
        if (success) {
          console.log("Admin response : " + success);
          this.adminData = success;
        } else {
          console.log(error);
          this.adminData = error;
        }
      });
    }
  },
  mounted() {
    this.$nextTick(this.getAdminPanel);
  }
});
