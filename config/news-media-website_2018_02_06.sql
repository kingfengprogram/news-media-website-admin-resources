/*
Navicat MySQL Data Transfer

Source Server         : 本地
Source Server Version : 50720
Source Host           : localhost:3306
Source Database       : news-media-website

Target Server Type    : MYSQL
Target Server Version : 50720
File Encoding         : 65001

Date: 2018-02-06 17:33:05
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `t_course`
-- ----------------------------
DROP TABLE IF EXISTS `t_course`;
CREATE TABLE `t_course` (
  `id` varchar(32) NOT NULL COMMENT '主键',
  `name` varchar(32) NOT NULL COMMENT '课程名',
  `code` varchar(32) NOT NULL COMMENT '课程编码',
  `thumb_image` varchar(256) NOT NULL COMMENT '课程推荐图',
  `poster_image` varchar(256) NOT NULL COMMENT '课程海报图',
  `introduction` varchar(256) NOT NULL COMMENT '课程简介',
  `choiceness_course` json NOT NULL COMMENT '精选课程(json字符串)',
  `active` bit(1) NOT NULL COMMENT '启用或禁用',
  `position` int(11) NOT NULL COMMENT '序号',
  `updated_username` varchar(32) NOT NULL COMMENT '管理人员用户名',
  `created_time` int(11) NOT NULL COMMENT '创建时间',
  `updated_time` int(11) DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_course
-- ----------------------------

-- ----------------------------
-- Table structure for `t_introduction_banner`
-- ----------------------------
DROP TABLE IF EXISTS `t_introduction_banner`;
CREATE TABLE `t_introduction_banner` (
  `id` varchar(32) NOT NULL COMMENT '主键',
  `banner_img` varchar(256) NOT NULL COMMENT '轮播图uri',
  `content_img` varchar(256) DEFAULT NULL COMMENT '内部介绍图片',
  `position` int(11) NOT NULL COMMENT '序号',
  `width` int(11) DEFAULT NULL COMMENT '上传图片的宽度',
  `height` int(11) DEFAULT NULL COMMENT '上传图片的高度',
  `active` bit(1) NOT NULL COMMENT '禁用或启用',
  `updated_username` varchar(32) NOT NULL COMMENT '管理人用户名',
  `created_time` int(11) NOT NULL COMMENT '创建时间',
  `updated_time` int(11) DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_introduction_banner
-- ----------------------------

-- ----------------------------
-- Table structure for `t_manager_menu`
-- ----------------------------
DROP TABLE IF EXISTS `t_manager_menu`;
CREATE TABLE `t_manager_menu` (
  `id` varchar(32) NOT NULL COMMENT '主键',
  `title` varchar(32) NOT NULL COMMENT '菜单标题',
  `uri` varchar(256) NOT NULL COMMENT '菜单uri',
  `position` int(11) NOT NULL COMMENT '菜单顺序',
  `description` varchar(256) DEFAULT NULL COMMENT '菜单描述',
  `style` varchar(16) NOT NULL COMMENT '菜单样式',
  `parentid` int(11) NOT NULL COMMENT '上级菜单id',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_manager_menu
-- ----------------------------

-- ----------------------------
-- Table structure for `t_manager_system_log`
-- ----------------------------
DROP TABLE IF EXISTS `t_manager_system_log`;
CREATE TABLE `t_manager_system_log` (
  `id` varchar(32) NOT NULL COMMENT '主键',
  `username` varchar(32) NOT NULL COMMENT '用户名',
  `module` varchar(16) NOT NULL COMMENT '日志所属模块',
  `action` varchar(16) NOT NULL COMMENT '日志所属操作类型',
  `message` varchar(256) NOT NULL COMMENT '日志内容',
  `data` text COMMENT '日志数据',
  `ip` varchar(32) NOT NULL COMMENT '日志记录ip',
  `created_time` int(11) NOT NULL COMMENT '日志产生时间',
  `level` varchar(16) NOT NULL COMMENT '日志级别',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_manager_system_log
-- ----------------------------

-- ----------------------------
-- Table structure for `t_manager_user`
-- ----------------------------
DROP TABLE IF EXISTS `t_manager_user`;
CREATE TABLE `t_manager_user` (
  `id` varchar(32) NOT NULL COMMENT '主键',
  `username` varchar(32) NOT NULL COMMENT '用户名',
  `nickname` varchar(32) DEFAULT NULL COMMENT '昵称',
  `password` varchar(32) NOT NULL COMMENT '密码',
  `salt` varchar(32) NOT NULL COMMENT '密码salt',
  `email` varchar(128) DEFAULT NULL COMMENT '邮箱',
  `phone` varchar(11) DEFAULT NULL COMMENT '手机号',
  `locked` bit(1) NOT NULL COMMENT '是否被禁止',
  `lock_deadline` int(11) DEFAULT NULL COMMENT '账号多次登陆失败锁定期限',
  `login_error_time` int(11) NOT NULL COMMENT '连续登陆错误次数',
  `last_login_time` int(11) DEFAULT NULL COMMENT '最后登陆时间',
  `last_login_ip` varchar(32) DEFAULT NULL COMMENT '最后登陆ip',
  `created_time` int(11) NOT NULL COMMENT '注册时间',
  `updated_time` int(11) DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_manager_user
-- ----------------------------

-- ----------------------------
-- Table structure for `t_param`
-- ----------------------------
DROP TABLE IF EXISTS `t_param`;
CREATE TABLE `t_param` (
  `id` varchar(32) NOT NULL COMMENT '主键',
  `value` varchar(32) NOT NULL COMMENT '参数值',
  `description` varchar(256) NOT NULL COMMENT '参数描述',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_param
-- ----------------------------

-- ----------------------------
-- Table structure for `t_param_item`
-- ----------------------------
DROP TABLE IF EXISTS `t_param_item`;
CREATE TABLE `t_param_item` (
  `id` varchar(32) NOT NULL COMMENT '主键',
  `param_id` varchar(32) NOT NULL COMMENT '参数id',
  `name` varchar(32) NOT NULL COMMENT '参数数据名',
  `value` varchar(32) NOT NULL COMMENT '参数数据值',
  PRIMARY KEY (`id`),
  KEY `FK_param_item` (`param_id`),
  CONSTRAINT `FK_param_item` FOREIGN KEY (`param_id`) REFERENCES `t_param` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_param_item
-- ----------------------------

-- ----------------------------
-- Table structure for `t_portal_system_log`
-- ----------------------------
DROP TABLE IF EXISTS `t_portal_system_log`;
CREATE TABLE `t_portal_system_log` (
  `id` varchar(32) NOT NULL COMMENT '主键',
  `username` varchar(32) DEFAULT NULL COMMENT '用户名',
  `module` varchar(16) NOT NULL COMMENT '模块',
  `action` varchar(16) DEFAULT NULL COMMENT '操作类型',
  `message` varchar(256) NOT NULL COMMENT '日志内容',
  `data` text COMMENT '日志数据',
  `ip` varchar(32) NOT NULL COMMENT '日志记录ip',
  `created_time` int(11) NOT NULL COMMENT '产生时间',
  `level` varchar(16) NOT NULL COMMENT '日志级别',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_portal_system_log
-- ----------------------------

-- ----------------------------
-- Table structure for `t_privilege`
-- ----------------------------
DROP TABLE IF EXISTS `t_privilege`;
CREATE TABLE `t_privilege` (
  `id` varchar(32) NOT NULL COMMENT '主键',
  `name` varchar(32) NOT NULL COMMENT '权限名',
  `uri` varchar(256) NOT NULL COMMENT '权限uri',
  `description` varchar(256) DEFAULT NULL COMMENT '权限描述',
  `is_admin` bit(1) NOT NULL COMMENT '系统管理特殊标志',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_privilege
-- ----------------------------

-- ----------------------------
-- Table structure for `t_portal_menu`
-- ----------------------------
DROP TABLE IF EXISTS `t_portal_menu`;
CREATE TABLE `t_portal_menu` (
  `id` varchar(32) NOT NULL COMMENT '主键',
  `title` varchar(32) NOT NULL COMMENT '菜单标题',
  `uri` varchar(256) NOT NULL COMMENT '菜单uri',
  `position` int(11) DEFAULT NULL COMMENT '序号',
  `description` varchar(256) DEFAULT NULL COMMENT '菜单描述',
  `style` varchar(16) DEFAULT NULL COMMENT '菜单样式',
  `parent_id` varchar(32) DEFAULT NULL COMMENT '上级菜单id',
  `created_time` int(11) DEFAULT NULL COMMENT '创建时间',
  `updated_time` int(11) DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_portal_menu
-- ----------------------------

-- ----------------------------
-- Table structure for `t_role`
-- ----------------------------
DROP TABLE IF EXISTS `t_role`;
CREATE TABLE `t_role` (
  `id` varchar(32) NOT NULL COMMENT '主键',
  `name` varchar(32) NOT NULL COMMENT '角色名',
  `description` varchar(256) DEFAULT NULL COMMENT '角色描述',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_role
-- ----------------------------

-- ----------------------------
-- Table structure for `t_role_privilege`
-- ----------------------------
DROP TABLE IF EXISTS `t_role_privilege`;
CREATE TABLE `t_role_privilege` (
  `id` varchar(32) NOT NULL COMMENT '主键',
  `role_id` varchar(32) NOT NULL COMMENT '角色id',
  `privilege_id` varchar(32) NOT NULL COMMENT '权限id',
  PRIMARY KEY (`id`),
  KEY `FK_role_privilege` (`role_id`),
  KEY `FK_privilege_role` (`privilege_id`),
  CONSTRAINT `FK_privilege_role` FOREIGN KEY (`privilege_id`) REFERENCES `t_privilege` (`id`),
  CONSTRAINT `FK_role_privilege` FOREIGN KEY (`role_id`) REFERENCES `t_role` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_role_privilege
-- ----------------------------

-- ----------------------------
-- Table structure for `t_tutor`
-- ----------------------------
DROP TABLE IF EXISTS `t_tutor`;
CREATE TABLE `t_tutor` (
  `id` varchar(32) NOT NULL COMMENT '主键',
  `name` varchar(32) NOT NULL COMMENT '导师名',
  `category` varchar(32) NOT NULL COMMENT '导师类别',
  `tag` varchar(32) NOT NULL COMMENT '导师标签',
  `bg_img` varchar(256) NOT NULL COMMENT '背景图片',
  `poster_img` varchar(256) NOT NULL COMMENT '海报图片',
  `introduction_video` varchar(256) NOT NULL COMMENT '导师简介视频',
  `active` bit(1) NOT NULL COMMENT '启用或禁用',
  `position` int(11) NOT NULL COMMENT '序号',
  `updated_username` varchar(32) NOT NULL COMMENT '管理人用户名',
  `created_time` int(11) NOT NULL COMMENT '创建时间',
  `updated_time` int(11) DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_tutor
-- ----------------------------

-- ----------------------------
-- Table structure for `t_user`
-- ----------------------------
DROP TABLE IF EXISTS `t_user`;
CREATE TABLE `t_user` (
  `id` varchar(32) NOT NULL COMMENT '主键',
  `openid` varchar(32) NOT NULL COMMENT '对接微信唯一用户标识',
  `phone` varchar(11) DEFAULT NULL COMMENT '手机号',
  `nickname` varchar(32) DEFAULT NULL COMMENT '昵称',
  `sex` varchar(8) DEFAULT NULL COMMENT '性别',
  `city` varchar(32) DEFAULT NULL COMMENT '所在城市',
  `country` varchar(32) DEFAULT NULL COMMENT '所在国家',
  `province` varchar(32) DEFAULT NULL COMMENT '所在省份',
  `headimgurl` varchar(256) DEFAULT NULL COMMENT '用户头像',
  `last_login_time` int(11) DEFAULT NULL COMMENT '最后登陆时间',
  `last_login_ip` varchar(32) DEFAULT NULL COMMENT '最后登陆ip',
  `created_time` int(11) NOT NULL COMMENT '注册时间',
  `updated_time` int(11) DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_user
-- ----------------------------

-- ----------------------------
-- Table structure for `t_user_role`
-- ----------------------------
DROP TABLE IF EXISTS `t_user_role`;
CREATE TABLE `t_user_role` (
  `id` varchar(32) NOT NULL COMMENT '主键',
  `userid` varchar(32) NOT NULL COMMENT '用户id',
  `role_id` varchar(32) NOT NULL COMMENT '角色id',
  PRIMARY KEY (`id`),
  KEY `FK_user_role` (`userid`),
  KEY `FK_role_user` (`role_id`),
  CONSTRAINT `FK_role_user` FOREIGN KEY (`role_id`) REFERENCES `t_role` (`id`),
  CONSTRAINT `FK_user_role` FOREIGN KEY (`userid`) REFERENCES `t_manager_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_user_role
-- ----------------------------

-- ----------------------------
-- Table structure for `t_video`
-- ----------------------------
DROP TABLE IF EXISTS `t_video`;
CREATE TABLE `t_video` (
  `id` varchar(32) NOT NULL COMMENT '主键',
  `category` varchar(32) NOT NULL COMMENT '视频分类',
  `title` varchar(64) NOT NULL COMMENT '视频标题',
  `difficulty` tinyint(4) NOT NULL COMMENT '难度',
  `total_number` int(11) NOT NULL COMMENT '训练人数',
  `bg_image` varchar(256) NOT NULL COMMENT '背景图片',
  `poster_image` varchar(256) NOT NULL COMMENT '视频推荐图',
  `active` bit(1) NOT NULL COMMENT '启用或禁用',
  `position` int(11) NOT NULL COMMENT '序号',
  `updated_username` varchar(32) NOT NULL COMMENT '管理人员用户名',
  `created_time` int(11) NOT NULL COMMENT '创建时间',
  `updated_time` int(11) DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_video
-- ----------------------------

-- ----------------------------
-- Table structure for `t_video_log`
-- ----------------------------
DROP TABLE IF EXISTS `t_video_log`;
CREATE TABLE `t_video_log` (
  `id` varchar(32) NOT NULL COMMENT '主键',
  `username` varchar(32) NOT NULL COMMENT '用户名',
  `course` varchar(32) NOT NULL COMMENT '课程',
  `video_id` varchar(32) NOT NULL COMMENT '视频id',
  `message` varchar(256) NOT NULL COMMENT '日志内容',
  `ip` varchar(32) NOT NULL COMMENT '日志记录ip',
  `created_time` int(11) NOT NULL COMMENT '产生时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_video_log
-- ----------------------------
