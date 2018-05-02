<template>
    <div class="header">
        <div class="logo">
            <router-link to="/home">
                <img src="/static/images/logo.png"/>
            </router-link>
        </div>
        <div class="sidebar-open-button">
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
                <el-dropdown-menu slot="dropdown" style="width: 100px;">
                    <el-dropdown-item command="changeProfile">个人信息</el-dropdown-item>
                    <el-dropdown-item command="changePassword">修改密码</el-dropdown-item>
                    <el-dropdown-item command="loginout" divided>退出</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
        <el-dialog fullscreen :title="profileDialog.dialogTitle" :visible.sync="profileDialog.dialogVisible" custom-class="dialog-custom" :before-close="closeProfileDialog" :close-on-click-modal="false" v-if="profileDialog.dialogVisible">
            <el-form :model="profileDialog.formData" :ref="profileDialog.formName" :rules="profileDialog.formDataRules" :label-width="profileDialog.formLabelWidth" label-position="right" status-icon>
                <el-form-item label="昵称" prop="nickname">
                    <el-input v-model="profileDialog.formData.nickname" placeholder="请输入昵称"></el-input>
                </el-form-item>
                <el-form-item label="头像" prop="avatar">
                    <el-input :disabled="true" v-model="profileDialog.formData.avatar" placeholder="上传头像后自动获取"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-upload :data="upload.uploadFunction === 'oss' ? shareState.aliyunOssSign : {}" with-credentials :ref="profileDialog.formName + '_avatar'" drag :action="upload.imageUploadURL" :file-list="profileDialog.avatarImageFileList" :accept="upload.imageUploadAccept" :before-upload="$beforeImageUpload" :on-preview="handlePreviewImage" :on-progress="handleUpdateAvatarImageProgress" :on-success="handleUpdateAvatarImageSuccess" list-type="picture">
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                        <div class="el-upload__tip" slot="tip">{{upload.imageUploadTip}}</div>
                    </el-upload>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="profileDialog.formData.email" placeholder="请输入邮箱"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                    <el-input v-model="profileDialog.formData.phone" placeholder="请输入手机号"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="resetProfileForm()">重置</el-button>
                <el-button @click="closeProfileDialog">取 消</el-button>
                <el-button type="primary" @click="updateProfile" :loading="profileDialog.submiting">{{profileDialog.submitText}}</el-button>
            </div>
        </el-dialog>
        <el-dialog :title="passwordDialog.dialogTitle" :visible.sync="passwordDialog.dialogVisible" custom-class="dialog-custom" :before-close="closePasswordDialog" :close-on-click-modal="false" v-if="passwordDialog.dialogVisible">
            <el-steps :space="400" :active="passwordDialog.active" finish-status="success" style="margin-left: 100px; margin-bottom: 40px;">
                <el-step title="步骤一" description="确认旧密码"></el-step>
                <el-step title="步骤二" description="修改密码"></el-step>
            </el-steps>
            <el-form v-if="passwordDialog.active === 0" :model="passwordDialog.formDataStep1" :ref="passwordDialog.formStep1Name" :rules="passwordDialog.formDataStep1Rules" :label-width="passwordDialog.formLabelWidth" label-position="right" status-icon>
                <el-form-item label="旧密码" prop="oldPassword">
                    <el-input type="password" v-model="passwordDialog.formDataStep1.oldPassword" placeholder="请输入原始密码"></el-input>
                </el-form-item>
            </el-form>
            <el-form v-if="passwordDialog.active === 1" :model="passwordDialog.formDataStep2" :ref="passwordDialog.formStep2Name" :rules="passwordDialog.formDataStep2Rules" :label-width="passwordDialog.formLabelWidth" label-position="right" status-icon>
                <el-form-item label="密码" prop="password">
                    <el-input type="password" v-model="passwordDialog.formDataStep2.password" placeholder="请输入新密码"></el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="repassword">
                    <el-input type="password" v-model="passwordDialog.formDataStep2.repassword" placeholder="请确认新密码"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="resetPasswordForm()">重置</el-button>
                <el-button @click="closePasswordDialog">取 消</el-button>
                <el-button v-if="passwordDialog.active === 0" type="primary" @click="updatePassword" :loading="passwordDialog.submiting">{{passwordDialog.submitText}}</el-button>
                <el-button v-if="passwordDialog.active === 1" type="primary" @click="updatePassword" :loading="passwordDialog.submiting">{{passwordDialog.submitText}}</el-button>
            </div>
        </el-dialog>
        <el-dialog :append-to-body="true" :visible.sync="previewImageVisible">
            <img width="100%" :src="previewImage" alt="">
        </el-dialog>
    </div>
</template>
<script>
import GlobalConfig from '@/components/globalConfig/GlobalConfig';

export default {
    data: function () {
        var validateUpdateRepassword = (rule, value, callback) => {
            if (this.passwordDialog.formData.password && value === '') {
                callback(new Error('请再次输入密码'));
            } else if (value !== this.passwordDialog.formData.password) {
                callback(new Error('两次输入密码不一致!'));
            } else {
                callback();
            }
        };
        return {
            shareState: this.$root.store.state,
            upload: GlobalConfig.upload,
            previewImage: '',
            previewImageVisible: false,
            profileDialog: {
                dialogVisible: false,
                formLabelWidth: '100px',
                dialogTitle: '修改个人信息',
                formName: 'profileForm',
                submiting: false,
                submitText: '下一步',
                avatarImageFileList: [],
                formData: {
                    nickname: '',
                    avatar: '',
                    email: '',
                    phone: ''
                },
                formDataRules: {
                    nickname: [
                        { required: true, message: '请输入昵称', trigger: 'change' },
                        { min: 2, max: 16, message: '长度为 2 到 16 个字符', trigger: 'change' },
                        { pattern: /^[\u4E00-\u9FA5a-zA-Z][\u4E00-\u9FA5a-zA-Z0-9]{1,15}$/, message: '昵称是以中英文字母开头的中英文字母或数字', trigger: 'change' }
                    ],
                    avatar: [
                        { required: false, max: 256, message: '长度不能超过 256 个字符', trigger: 'change' },
                        { pattern: /^(oss:\/\/|local:\/\/).+(\.JPEG|\.jpeg|\.JPG|\.jpg|\.GIF|\.gif|\.PNG|\.png)$/, message: '头像必须以oss://或local://开头, jpeg/jpg/gif/png为后缀', trigger: 'change' }
                    ],
                    email: [
                        { type: 'email', required: false, message: '邮箱格式错误', trigger: 'change' },
                        { min: 0, max: 128, message: '长度不能超过 128 位', trigger: 'change' }
                    ],
                    phone: [
                        { required: false, pattern: /^1[3|4|5|8][0-9]\d{8}$/, message: '手机号是11位数字', trigger: 'change' }
                    ]
                }
            },
            passwordDialog: {
                dialogVisible: false,
                formLabelWidth: '100px',
                dialogTitle: '修改密码',
                formStep1Name: 'passwordStep1Form',
                formStep2Name: 'passwordStep2Form',
                submiting: false,
                submitText: '确定',
                active: 0,
                formDataStep1: {
                    oldPassword: ''
                },
                formDataStep1Rules: {
                    oldPassword: [
                        { required: true, message: '请输入原始密码', trigger: 'change' },
                        { min: 8, max: 32, message: '长度为 8 到 32 个字符', trigger: 'change' },
                        { pattern: /[a-z]+/, message: '密码必须包含英文大小写字母、 数字和特殊字符', trigger: 'change' },
                        { pattern: /[A-Z]+/, message: '密码必须包含英文大小写字母、 数字和特殊字符', trigger: 'change' },
                        { pattern: /[0-9]+/, message: '密码必须包含英文大小写字母、 数字和特殊字符', trigger: 'change' },
                        { pattern: /[~`!@#$%^&*()\-_=+{}\\[\]\\|\\\\\\:\\;\\'\\"\\,\\.\\/\\?\\<\\>]+/, message: '密码必须包含英文大小写字母、 数字和英文特殊字符', trigger: 'change' }
                    ]
                },
                formDataStep2: {
                    password: '',
                    repassword: ''
                },
                formDataStep2Rules: {
                    password: [
                        { required: true, message: '请输入新密码', trigger: 'change' },
                        { min: 8, max: 32, message: '长度为 8 到 32 个字符', trigger: 'change' },
                        { pattern: /[a-z]+/, message: '密码必须包含英文大小写字母、 数字和特殊字符', trigger: 'change' },
                        { pattern: /[A-Z]+/, message: '密码必须包含英文大小写字母、 数字和特殊字符', trigger: 'change' },
                        { pattern: /[0-9]+/, message: '密码必须包含英文大小写字母、 数字和特殊字符', trigger: 'change' },
                        { pattern: /[~`!@#$%^&*()\-_=+{}\\[\]\\|\\\\\\:\\;\\'\\"\\,\\.\\/\\?\\<\\>]+/, message: '密码必须包含英文大小写字母、 数字和英文特殊字符', trigger: 'change' }
                    ],
                    repassword: [
                        { required: true, message: '请确认新密码', trigger: 'change' },
                        { validator: validateUpdateRepassword, trigger: 'change' }
                    ]
                }
            }
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
            } else if (command === 'changePassword') {
                this.showPasswordDialog();
            } else if (command === 'changeProfile') {
                this.showProfileDialog();
            }
        },
        showProfileDialog: function () {
            this.initProfileForm();
            this.profileDialog.dialogVisible = true;
        },
        closeProfileDialog: function () {
            this.resetProfileForm();
            this.profileDialog.dialogVisible = false;
        },
        resetProfileForm: function () {
            this.$refs[this.profileDialog.formName].resetFields();
            this.initProfileForm();
        },
        initProfileForm: function () {
            var url;
            this.profileDialog.submitText = '确定';
            this.profileDialog.formData.nickname = this.shareState.userinfo.nickname;
            this.profileDialog.formData.avatar = this.shareState.userinfo.avatar;
            this.profileDialog.formData.email = this.shareState.userinfo.email;
            this.profileDialog.formData.phone = this.shareState.userinfo.phone;
            url = this.$loadRemoteFile(this.shareState.userinfo.avatar);
            this.profileDialog.avatarImageFileList = [{
                name: url.substring(url.lastIndexOf('/') + 1),
                url: url
            }];
        },
        updateProfile: function () {
            var formData = this.profileDialog.formData;
            this.$refs[this.profileDialog.formName].validate((valid) => {
                if (valid) {
                    this.profileDialog.submiting = true;
                    this.profileDialog.submitText = '执行中';
                    this.$http.post('/system/user/update', formData)
                        .then((res) => {
                            this.profileDialog.submiting = false;
                            this.profileDialog.submitText = '确定';
                            if (res.data.result === 'success') {
                                this.closeProfileDialog();
                                this.$message({
                                    message: '修改个人信息成功',
                                    type: 'success'
                                });
                                this.$root.bus.$emit('refresh_userinfo', res.data.user);
                            }
                        });
                } else {
                    return false;
                }
            });
        },
        showPasswordDialog: function () {
            this.passwordDialog.dialogVisible = true;
        },
        closePasswordDialog: function () {
            this.passwordDialog.dialogVisible = false;
        },
        resetPasswordForm: function () {
            this.$refs[this.passwordDialog.formName].resetFields();
        },
        updatePassword: function () {
            var formData = this.passwordDialog.formData;
            this.$refs[this.passwordDialog.formName].validate((valid) => {
                if (valid) {
                    this.passwordDialog.submiting = true;
                    this.passwordDialog.submitText = '执行中';
                    this.$http.post('/system/user/update', formData)
                        .then((res) => {
                            this.passwordDialog.submiting = false;
                            this.passwordDialog.submitText = '确定';
                            if (res.data.result === 'success') {
                                this.closePasswordDialog();
                                this.$message({
                                    message: '修改密码成功',
                                    type: 'success'
                                });
                            }
                        });
                } else {
                    return false;
                }
            });
        },
        handleUpdateAvatarImageProgress: function (event, file, fileList) {
            this.profileDialog.formData.avatar = '';
        },
        handleUpdateAvatarImageSuccess: function (response, file, fileList) {
            if (response.result === 'success') {
                this.profileDialog.formData.avatar = response.fileUploadResp.uri;
            }
        },
        handlePreviewImage: function (file) {
            this.previewImage = file.url;
            this.previewImageVisible = true;
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
        margin-right: 100px;
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

    .header >>> .el-dialog {
        width: 50%;
    }
</style>
