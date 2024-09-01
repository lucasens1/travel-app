<script>
export default{
    data(){
        return {
            email : '',
            password : ''
        }
    },
    methods : {
        async login(){
        try {
            const response = await fetch('http://localhost:5001/login', {
                method : 'POST',
                headers : {
                    'Content-type' : 'application/json'
                },
                body : JSON.stringify({
                    email : this.email,
                    password : this.password
                })
            });
            const data = await response.json();
            // console.log(data);
            if(response.ok){
                // token JWT -> localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                console.log('Login Riuscito ');
                this.$router.push('/diary');
                
            } else {
                alert('Login Fallito')
            }
        } catch (e){
            console.error('Error : ', e)
        }
        } 
    }
}
</script>

<template>
    <div class="login-card-container">
        <div class="login-card">
            <div class="login-card-logo">
                <img src="../assets/img/title.png" alt="logo">
            </div>
            <div class="login-card-header">
                <h1>Sign In</h1>
                <div>Please login to use the platform</div>
            </div>
            <form class="login-card-form" @submit.prevent="login">
                <div class="form-item">
                    <span class="form-item-icon material-symbols-rounded"></span>
                    <input type="email" placeholder="Enter Email" id="emailForm" v-model="email"
                    autofocus required>
                </div>
                <div class="form-item">
                    <span class="form-item-icon material-symbols-rounded"></span>
                    <input type="password" placeholder="Enter Password" id="passwordForm" v-model="password"
                     required>
                </div>
                <button type="submit">Sign In</button>
            </form>
            <div class="login-card-footer">
                Don't have an account? <a href="#"><router-link to="/register">Create a free account.</router-link></a>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
@use '../sass/partials/logreg' as *;
</style>