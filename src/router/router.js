import Layout from '@/components/layout/Layout';
import Home from '@/views/home/Home';
import Login from '@/views/login/Login';
import User from '@/views/system/user/User';
import Role from '@/views/system/role/Role';
import Privilege from '@/views/system/privilege/Privilege';
import Param from '@/views/system/param/Param';
import SystemMenu from '@/views/system/menu/Menu';
import Course from '@/views/portal/course/Course';
import Introduction from '@/views/portal/introduction/Introduction';
import PortalMenu from '@/views/portal/menu/Menu';
import Tutor from '@/views/portal/tutor/Tutor';
import Video from '@/views/portal/video/Video';
import PortalLog from '@/views/log/portal/PortalLog';
import SystemLog from '@/views/log/system/SystemLog';
import VideoLog from '@/views/log/video/VideoLog';
import AccessDenied from '@/views/error/AccessDenied';
import NotFound from '@/views/error/NotFound';

export default [
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/home',
        component: Layout,
        children: [
            {
                path: '/',
                component: Home,
                meta: {
                    position: 1,
                    type: ['authc'],
                    permission: ''
                }
            }, {
                path: '/system/user',
                component: User,
                meta: {
                    position: 2,
                    type: ['authc','perms'],
                    permission: 'router:systemUser'
                }
            }, {
                path: '/system/role',
                component: Role,
                meta: {
                    position: 3,
                    type: ['authc','perms'],
                    permission: 'router:systemRole'
                }
            }, {
                path: '/system/privilege',
                component: Privilege,
                meta: {
                    position: 4,
                    type: ['authc','perms'],
                    permission: 'router:systemPrivilege'
                }
            }, {
                path: '/system/menu',
                component: SystemMenu,
                meta: {
                    position: 5,
                    type: ['authc','perms'],
                    permission: 'router:systemMenu'
                }
            }, {
                path: '/system/param',
                component: Param,
                meta: {
                    position: 6,
                    type: ['authc','perms'],
                    permission: 'router:systemParam'
                }
            }, {
                path: '/portal/introduction',
                component: Introduction,
                meta: {
                    position: 7,
                    type: ['authc','perms'],
                    permission: 'router:portalIntroduction'
                }
            }, {
                path: '/portal/tutor',
                component: Tutor,
                meta: {
                    position: 8,
                    type: ['authc','perms'],
                    permission: 'router:portalTutor'
                }
            }, {
                path: '/portal/course',
                component: Course,
                meta: {
                    position: 9,
                    type: ['authc','perms'],
                    permission: 'router:portalCourse'
                }
            }, {
                path: '/portal/video',
                component: Video,
                meta: {
                    position: 10,
                    type: ['authc','perms'],
                    permission: 'router:portalVideo'
                }
            }, {
                path: '/portal/menu',
                component: PortalMenu,
                meta: {
                    position: 11,
                    type: ['authc','perms'],
                    permission: 'router:portalMenu'
                }
            }, {
                path: '/log/system',
                component: SystemLog,
                meta: {
                    position: 12,
                    type: ['authc','perms'],
                    permission: 'router:logSystem'
                }
            }, {
                path: '/log/portal',
                component: PortalLog,
                meta: {
                    position: 13,
                    type: ['authc','perms'],
                    permission: 'router:logPortal'
                }
            }, {
                path: '/log/video',
                component: VideoLog,
                meta: {
                    position: 14,
                    type: ['authc','perms'],
                    permission: 'router:logVideo'
                }
            }
        ]
    },
    {
        path: '/login',
        component: Login,
        meta: {
            type: ['anon'],
            permission: ''
        }
    },
    {
        path: '/access/denied',
        component: AccessDenied,
        meta: {
            type: ['authc'],
            permission: ''
        }
    },
    {
        path: '/404',
        component: NotFound,
        meta: {
            type: ['authc'],
            permission: ''
        }
    },
    {
        path: '*',
        redirect: '/404'
    }
];

