<template>
    <div class="login-container">
        <div class="login-center">
            <h1>Sign in</h1>
            <el-form :model="user" ref="login" :rules="rules" status-icon>
                <el-form-item prop="username">
                    <el-input v-model="user.username" placeholder="用户名" @keyup.enter.native="signIn"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" v-model="user.password" placeholder="密码" @keyup.enter.native="signIn"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button class="button" type="primary" @click="signIn" :loading="submiting">{{submitText}}</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>

export default {
    name: 'login',
    data: function () {
        return {
            submiting: false,
            submitText: '登陆',
            user: {
                username: '',
                password: ''
            },
            rules: {
                username: [
                    { required: true, message: '请输入账号', trigger: 'change' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'change' }
                ]
            }
        };
    },
    methods: {
        signIn: function () {
            this.$refs.login.validate((valid) => {
                if (valid) {
                    this.submiting = true;
                    this.submitText = '登陆中';
                    this.$http.post('/login', this.user)
                        .then((res) => {
                            setTimeout(() => {
                                this.submiting = false;
                                this.submitText = '登陆';
                                if (res.data.result === 'success') {
                                    this.$root.bus.$emit('refresh_userinfo', res.data.user);
                                    this.$router.push('/home');
                                }
                            }, 800);
                        });
                } else {
                    return false;
                }
            });
        }
    }
};
</script>

<style scoped>
    .login-container {
        width: 100%;
        height: 100%;
        font-family: 'Open Sans',sans-serif;
        margin: 0;
        background: #4A374A url("/static/images/login_bg.png") center no-repeat;
    }

    .login-container .login-center {
        position: absolute;
        top: 50%;
        left:50%;
        margin: -150px 0 0 -150px;
        width: 300px;
        height: 300px;
    }
    .login-container .login-center h1{
        color: #fff;
        text-shadow:0 0 10px;
        letter-spacing: 1px;
        text-align: center;
        font-size: 2em;
        margin: 0.67em 0;
    }

    .login-container .login-center input {
        width: 278px;
        height: 18px;
        margin-bottom: 10px;
        outline: none;
        padding: 10px;
        font-size: 13px;
        color: #fff;
        text-shadow:1px 1px 1px;
        border-top: 1px solid #312E3D;
        border-left: 1px solid #312E3D;
        border-right: 1px solid #312E3D;
        border-bottom: 1px solid #56536A;
        border-radius: 4px;
        background-color: #2D2D3F;
    }

    .login-container .login-center .button {
        width: 300px;
        min-height: 20px;
        display: block;
        background-color: #4a77d4;
        border: 1px solid #3762bc;
        color: #fff;
        padding: 9px 14px;
        font-size: 15px;
        line-height: normal;
        border-radius: 5px;
        margin: 0;
    }
</style>
