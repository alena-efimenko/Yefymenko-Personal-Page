Vue.component("login-widget", {
  template: "#login-template",
  data() {
    return {
      loggedIn: false,
      userName: "",
      password: "",
      authErrorMessage: ""
    }
  },
  computed: {
    isValid() {
      return !!this.userNameValid && !!this.passwordValid;
    },
    userNameValid() {
      return !!this.userName.trim();
    },
    passwordValid() {
      return !!this.password.trim();
    },
    errorMessage() {
      if (!this.userName || !this.password)
        this.authErrorMessage = "";
      return this.authErrorMessage;
    }
  },
  methods: {
    showModal() {
      let modal = document.getElementById('myModal');
      // open the modal
      modal.style.display = "block";

      // Get the <span> element that closes the modal
      let closeSpan = document.getElementsByClassName("close")[0];

      // When the user clicks on <span> (x), close the modal
      closeSpan.onclick = function() {
        modal.style.display = "none";
      }

      // When the user clicks anywhere outside of the modal, do not close it
      window.onclick = function(event) {
        if (event.target == modal) {
          // do nothing
        }
      }
    },
    login() {
      if (this.isValid) {
        authApi.authenticate(this.userName, this.password, (success, error) => {
          if (error) {
            this.loggedIn = false;
            this.authErrorMessage = error.body;
          } else {
            this.loggedIn = true;
            this.closeModal();
            this.$router.push("/admin");
          }
        });
      }
    },

    closeModal() {
      let modal = document.getElementById('myModal');
      modal.style.display = "none";
    }
  }
});
