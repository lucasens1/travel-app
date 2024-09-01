<script>
export default {
  data() {
    return {
      username: "",
      email: "",
      password: "",
    };
  },
  methods: {
    async register() {
      try {
        const response = await fetch("http://localhost:5001/register", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            username: this.username,
            email: this.email,
            password: this.password,
          }),
        });
        // Salvo la risposta
        const data = await response.json();

        if (response.ok) {
            // alert("Registration successful!");
            // Reindirizza l'utente alla pagina di login
            this.$router.push("/login");
        } else {
          alert(`Registration failed: ${data.error}`);
        }
      } catch (e) {
        console.error("Error : ", e);
      }
    },
  },
};
</script>

<template>
  <div class="login-card-container">
    <div class="login-card">
      <div class="login-card-logo">
        <img src="../assets/img/title.png" alt="logo" />
      </div>
      <div class="login-card-header">
        <h1>Sign Up</h1>
        <div>Please sign up to use the platform</div>
      </div>
      <form class="login-card-form" @submit.prevent="register">
        <div class="form-item">
          <span class="form-item-icon material-symbols-rounded"></span>
          <input
            type="text"
            placeholder="username"
            v-model="username"
            id="usernameForm"
            required
          />
        </div>
        <div class="form-item">
          <span class="form-item-icon material-symbols-rounded"></span>
          <input
            type="email"
            id="emailForm"
            placeholder="mail"
            v-model="email"
            autofocus
            required
          />
        </div>
        <div class="form-item">
          <span class="form-item-icon material-symbols-rounded"></span>
          <input
            type="password"
            id="passwordForm"
            placeholder="password"
            v-model="password"
            required
          />
        </div>
        <div class="login-card-footer">
          Already registered?
          <a href="#"><router-link to="/login">Login here.</router-link></a>
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  </div>
</template>

<style lang="scss">
@use "../sass/partials/logreg" as *;
</style>
