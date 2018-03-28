<template>
    <div class="header">
        <div class="logo">
            <router-link to="/home">
                <img src="/static/images/logo.png"/>
            </router-link>
        </div>
        <div class="sidebar-open-button" @click="toggleSidebarCollapse">
            <i class="fa fa-bars"></i>
        </div>
        <div class="user-info">
            <el-dropdown @command="handleCommand">
                <span class="el-dropdown-link">
                    <img class="user-logo" :src="$loadRemoteFile(shareState.userinfo ? shareState.userinfo.avatar : '')">
                    <div class="username">
                        <b>{{shareState.userinfo ? shareState.userinfo.nickname : ''}}</b>
                        <span class="caret"></span>
                    </div>
                </span>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="loginout">退出</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
    </div>
</template>
<script>
export default {
    data: function () {
        return {
            shareState: this.$root.store.state
        };
    },
    methods: {
        handleCommand: function (command) {
            if (command === 'loginout') {
                this.$http.get('logout')
                    .then((res) => {
                        if (res.data.result === 'success') {
                            this.$root.bus.$emit('clear_userinfo');
                            this.$router.push('/login');
                        }
                    });
            }
        },
        toggleSidebarCollapse: function () {
            this.$root.store.toggleSidebarCollapseAction();
        }
    }
};
</script>
<style scoped>
    .header {
        position: relative;
        box-sizing: border-box;
        width: 100%;
        height: 70px;
        font-size: 22px;
        line-height: 70px;
        color: #ffffff;
        background-color: #3d464d;
    }

    .header .logo {
        float: left;
        width: 250px;
        text-align: center;
        height: 100%;
    }

    .header .logo img {
        position: relative;
        display: inline-block;
        top: 50%;
        transform: translateY(-50%);
    }

    .user-info {
        float: right;
        padding-right: 50px;
        font-size: 16px;
        color: #ffffff;
    }

    .user-info .username {
        margin-left: 20px;
    }

    .user-info .username .caret {
        display: inline-block;
        width: 0;
        height: 0;
        margin-left: 2px;
        vertical-align: middle;
        border-top: 4px solid;
        border-right: 4px solid transparent;
        border-left: 4px solid transparent;
    }

    .user-info .el-dropdown-link {
        position: relative;
        display: inline-block;
        padding-left: 50px;
        color: #ffffff;
        cursor: pointer;
        vertical-align: middle;
    }

    .user-info .user-logo {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 60px;
        height: 60px;
        border-radius: 50%;
    }

    .el-dropdown-menu__item {
        text-align: center;
    }

    .sidebar-open-button {
        display: inline-block;
        width: 70px;
        text-align: center;
        float: left;
        color: rgba(255, 255, 255, 0.6);
        border-right: 1px solid rgba(255, 255, 255, 0.14);
        border-left: 1px solid rgba(255, 255, 255, 0.14);
        cursor: pointer;
    }

    .sidebar-open-button:hover {
        background-color: #383838;
    }
</style>
