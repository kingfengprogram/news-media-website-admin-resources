import Vue from 'vue';
import VueRouter from 'vue-router';
import routes from './router/router';
import App from './App';
import http from './utils/http';
import commonUtil from './utils/commonUtil';
import ElementUi from 'element-ui';
import VueDND from 'awe-dnd';
import '../static/css/theme-default/index.css';
import '../static/css/icon/font-awesome-4.7.0/css/font-awesome.min.css';
import '../static/css/animate.css';

Vue.config.productionTip = false;

Vue.use(VueRouter);
Vue.use(ElementUi);
Vue.use(VueDND);
Vue.use(commonUtil);
Vue.use(require('vue-moment'));
Vue.prototype.$http = http;

Vue.filter('dateFormat', function (value, message, format) {
    if (!value) {
        return message;
    } else {
        format = format || 'YYYY-MM-DD HH:mm:ss';
        return Vue.moment(value).format(format);
    }
});

Vue.filter('dateDiffer', function (value, startTime) {
    var start, end;
    startTime = startTime || Date.now();
    if (value) {
        start = Vue.moment(startTime);
        end = Vue.moment(value);
        return end.diff(start, 'hours');
    } else {
        return '';
    }
});

const router = new VueRouter({
    routes
});

let contains = function (array, item) {
    for (var i in array) {
        if (item === array[i]) {
            return true;
        }
    }
    return false;
};

var store = {
    debug: false,
    state: {
        paramMap: {},
        sidebarCollapse: false,
        userinfo: null,
        portalPrivileges: [],
        systemPrivileges: [],
        aliyunOssSign: {}
    },
    setParamMapAction: function (newValue) {
        if (this.debug) {
            console.log('setParamMapAction triggered with', newValue);
        }
        this.state.paramMap = newValue;
    },
    setUserinfoAction: function (newValue) {
        if (this.debug) {
            console.log('setUserinfoAction triggered with', newValue);
        }
        this.state.userinfo = newValue;
    },
    setPortalPrivilegesAction: function (newValue) {
        if (this.debug) {
            console.log('setPortalPrivilegesAction triggered with', newValue);
        }
        this.state.portalPrivileges = newValue;
    },
    setSystemPrivilegesAction: function (newValue) {
        if (this.debug) {
            console.log('setSystemPrivilegesAction triggered with', newValue);
        }
        this.state.systemPrivileges = newValue;
    },
    setAliyunOssSignAction: function (newValue) {
        if (this.debug) {
            console.log('setAliyunOssSignAction triggered with', newValue);
        }
        this.state.aliyunOssSign = newValue;
    },
    clearUserinfoAction: function () {
        if (this.debug) {
            console.log('clearUserinfoAction userinfo portalPrivileges systemPrivileges');
        }
        this.state.userinfo = {};
        this.state.portalPrivileges = [];
        this.state.systemPrivileges = [];
    },
    toggleSidebarCollapseAction: function () {
        if (this.debug) {
            console.log('toggleSidebarCollapseAction triggered with', !this.state.sidebarCollapse);
        }
        this.state.sidebarCollapse = !this.state.sidebarCollapse;
    }
};

new Vue({
    router,
    components: {
        App
    },
    template: '<App/>',
    data: {
        bus: new Vue(),
        store: store
    },
    beforeCreate: function () {
        this.$http.get('/checkCurrentUserinfo')
            .then((res) => {
                if (res.data.result === 'success' && res.data.user !== null) {
                    this.refreshUserinfo(res.data.user);
                } else {
                    this.$router.replace('/login');
                }
            });
    },
    created: function () {
        this.bus.$on('refresh_userinfo', this.refreshUserinfo);
        this.bus.$on('clear_userinfo', this.clearUserinfo);
        this.$router.beforeEach((to, from, next) => {
            let portalPrivileges = store.state.portalPrivileges;
            let userinfo = store.state.userinfo;
            var hasPremission = true;
            portalPrivileges = store.state.portalPrivileges;
            userinfo = store.state.userinfo;
            to.meta.type.forEach((item) => {
                if (item === 'authc') { // 需要登陆
                    if (!userinfo) {
                        hasPremission = false;
                        this.$root.bus.$emit('clear_userinfo');
                        next('/');
                    }
                } else if (item === 'perms') { // 需要权限
                    if (to.meta.permission !== '' && !contains(portalPrivileges, to.meta.permission)) {
                        hasPremission = false;
                        next('/access/denied');
                    }
                }
            });
            if (hasPremission) {
                next();
            }
        });
    },
    methods: {
        refreshUserinfo: function (user) {
            var portalPrivileges, systemPrivileges;
            portalPrivileges = [];
            systemPrivileges = [];
            this.$setUserinfo(user);
            user.roles.forEach((role) => {
                role.privileges.forEach((privilege) => {
                    if (privilege.privilegeGroup === 'portal') {
                        portalPrivileges.push(privilege.code);
                    } else {
                        systemPrivileges.push(privilege.code);
                    }
                });
            });
            this.store.setUserinfoAction(user);
            this.store.setPortalPrivilegesAction(portalPrivileges);
            this.store.setSystemPrivilegesAction(systemPrivileges);
        },
        clearUserinfo: function () {
            this.$clearStorage();
            this.store.clearUserinfoAction();
        }
    }
}).$mount('#app');
