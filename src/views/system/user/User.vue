<template>
    <div class="user-container">
        <page-breadcrumb v-bind="breadcrumbData"></page-breadcrumb>
        <div class="panel">
            <div class="panel-title">
                <el-button type="primary" size="small" icon="fa fa-plus" @click="showAddDialog">新增</el-button>
                <el-button type="danger" size="small" icon="fa fa-trash" @click="batchDelete">批量删除</el-button>
                <div class="search">
                    <el-input placeholder="请输入账号" v-model="queryParams.username" class="input-with-select" @keyup.enter.native="loadData">
                        <el-select v-model="queryParams.active" slot="prepend">
                            <el-option label="状态" value=""></el-option>
                            <el-option v-for="param in shareState.paramMap.active" :label="param.value" :value="param.name" :key="param.id"></el-option>
                        </el-select>
                        <el-button slot="append" icon="el-icon-search" @click="loadData"></el-button>
                    </el-input>
                </div>
            </div>
            <div class="panel-body">
                <el-table stripe v-loading="loading" element-loading-text="拼命加载中" :data="pagination.dataList" style="width: 100%" @selection-change="handleSelectionChange">
                    <el-table-column type="selection" width="60"></el-table-column>
                    <el-table-column prop="username" label="账号"></el-table-column>
                    <el-table-column prop="nickname" label="昵称"></el-table-column>
                    <el-table-column prop="avatar" label="头像">
                        <template slot-scope="scope">
                            <img :src="$loadRemoteFile(scope.row.avatar)" style="width: 70px; height: 70px;" @click="handlePreviewImage({url: $loadRemoteFile(scope.row.avatar)})">
                        </template>
                    </el-table-column>
                    <el-table-column prop="email" label="邮箱" width="250">
                        <template slot-scope="scope">
                            <span>{{scope.row.email || '未填写'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="active" label="状态">
                        <template slot-scope="scope">
                            <span>{{shareState.paramMap.active[scope.row.active] ? shareState.paramMap.active[scope.row.active].value : '参数不存在'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="lockDeadline" label="锁定">
                        <template slot-scope="scope">
                            <span>{{scope.row.lockDeadline | dateDiffer | getLockDeadline}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="lastLoginTime" label="上次登陆时间" width="200">
                        <template slot-scope="scope">
                            <i class="el-icon-time"></i>
                            <span style="margin-left: 10px">{{scope.row.lastLoginTime | dateFormat('未登陆')}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="lastLoginIp" label="上次登陆IP">
                        <template slot-scope="scope">
                            <span>{{scope.row.lastLoginIp || '未登陆'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="250">
                        <template slot-scope="scope">
                            <el-button type="primary" size="mini" icon="fa fa-edit" @click="showUpdateDialog(scope.row)">修改</el-button>
                            <el-button type="danger" size="mini" icon="fa fa-trash" @click="deleteEntity(scope.row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <el-dialog :append-to-body="true" :visible.sync="previewImageVisible">
                    <img width="100%" :src="previewImage" alt="">
                </el-dialog>
            </div>
            <div class="panel-footer">
                <div class="block">
                    <el-pagination background
                                   @size-change="handleSizeChange" @current-change="handleCurrentChange"
                                   :page-size="pagination.pageSize" :total="pagination.total"
                                   :current-page.sync="pagination.currentPage" :layout="pagination.layout" :page-sizes="pagination.pageSizes">
                    </el-pagination>
                </div>
            </div>
        </div>
        <el-dialog fullscreen :title="addDialog.dialogTitle" :visible.sync="addDialog.dialogVisible" custom-class="dialog-custom" :before-close="closeAddDialog" :close-on-click-modal="false">
            <el-form :model="addDialog.formData" :ref="addDialog.formName" :rules="addDialog.formDataRules" :label-width="addDialog.formLabelWidth" label-position="right" status-icon>
                <el-form-item label="账号" prop="username">
                    <el-input v-model="addDialog.formData.username" placeholder="请输入账号"></el-input>
                </el-form-item>
                <el-form-item label="昵称" prop="nickname">
                    <el-input v-model="addDialog.formData.nickname" placeholder="请输入昵称"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input type="password" v-model="addDialog.formData.password" placeholder="请输入密码"></el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="repassword">
                    <el-input type="password" v-model="addDialog.formData.repassword" placeholder="请确认密码"></el-input>
                </el-form-item>
                <el-form-item label="角色" prop="roles">
                    <el-checkbox :indeterminate="addDialog.checkbox.isIndeterminate" v-model="addDialog.checkbox.checkAll" @change="handleAddCheckAllChange">全选</el-checkbox>
                    <el-checkbox-group v-model="addDialog.formData.roles" @change="handleAddCheckedRolesChange">
                        <el-checkbox v-for="item in roles" :label="item.id" :key="item.id">{{item.name}}</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="头像" prop="avatar">
                    <el-input :disabled="true" v-model="addDialog.formData.avatar" placeholder="上传头像后自动获取"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-upload :data="upload.uploadFunction === 'oss' ? shareState.aliyunOssSign : {}" with-credentials :ref="addDialog.formName + '_avatar'" drag :action="upload.imageUploadURL" :accept="upload.imageUploadAccept" :before-upload="$beforeImageUpload" :on-preview="handlePreviewImage" :on-progress="handleAddAvatarImageProgress" :on-success="handleAddAvatarImageSuccess" list-type="picture">
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                        <div class="el-upload__tip" slot="tip">{{upload.imageUploadTip}}, <b>{{upload.recommendSmallSize}}</b></div>
                    </el-upload>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addDialog.formData.email" placeholder="请输入邮箱"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                    <el-input v-model="addDialog.formData.phone" placeholder="请输入手机号"></el-input>
                </el-form-item>
                <el-form-item prop="active">
                    <el-switch v-model="addDialog.formData.active" active-color="#13ce66" inactive-color="#ff4949" active-text="启用账号" inactive-text="禁用账号">
                    </el-switch>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="resetAddForm()">重置</el-button>
                <el-button @click="closeAddDialog">取 消</el-button>
                <el-button type="primary" @click="addEntity" :loading="addDialog.submiting">{{addDialog.submitText}}</el-button>
            </div>
        </el-dialog>
        <el-dialog fullscreen :title="updateDialog.dialogTitle" :visible.sync="updateDialog.dialogVisible" custom-class="dialog-custom" :before-close="closeUpdateDialog" :close-on-click-modal="false" v-if="updateDialog.dialogVisible">
            <el-form :model="updateDialog.formData" :ref="updateDialog.formName" :rules="updateDialog.formDataRules" :label-width="updateDialog.formLabelWidth" label-position="right" status-icon>
                <el-form-item label="昵称" prop="nickname">
                    <el-input v-model="updateDialog.formData.nickname" placeholder="请输入昵称"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input type="password" v-model="updateDialog.formData.password" placeholder="请输入密码"></el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="repassword">
                    <el-input type="password" v-model="updateDialog.formData.repassword" placeholder="请确认密码"></el-input>
                </el-form-item>
                <el-form-item label="角色" prop="roles">
                    <el-checkbox :indeterminate="updateDialog.checkbox.isIndeterminate" v-model="updateDialog.checkbox.checkAll" @change="handleUpdateCheckAllChange">全选</el-checkbox>
                    <el-checkbox-group v-model="updateDialog.formData.roles" @change="handleUpdateCheckedRolesChange">
                        <el-checkbox v-for="item in roles" :label="item.id" :key="item.id">{{item.name}}</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="头像" prop="avatar">
                    <el-input :disabled="true" v-model="updateDialog.formData.avatar" placeholder="上传头像后自动获取"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-upload :data="upload.uploadFunction === 'oss' ? shareState.aliyunOssSign : {}" with-credentials :ref="updateDialog.formName + '_avatar'" drag :action="upload.imageUploadURL" :file-list="updateDialog.avatarImageFileList" :accept="upload.imageUploadAccept" :before-upload="$beforeImageUpload" :on-preview="handlePreviewImage" :on-progress="handleUpdateAvatarImageProgress" :on-success="handleUpdateAvatarImageSuccess" list-type="picture">
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                        <div class="el-upload__tip" slot="tip">{{upload.imageUploadTip}}, <b>{{upload.recommendSmallSize}}</b></div>
                    </el-upload>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="updateDialog.formData.email" placeholder="请输入邮箱"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                    <el-input v-model="updateDialog.formData.phone" placeholder="请输入手机号"></el-input>
                </el-form-item>
                <el-form-item prop="active">
                    <el-switch v-model="updateDialog.formData.active" active-color="#13ce66" inactive-color="#ff4949" active-text="启用账号" inactive-text="禁用账号">
                    </el-switch>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="resetUpdateForm()">重置</el-button>
                <el-button @click="closeUpdateDialog">取 消</el-button>
                <el-button type="primary" @click="updateEntity" :loading="updateDialog.submiting">{{updateDialog.submitText}}</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import PageBreadcrumb from '@/components/breadcurmb/PageBreadcrumb';
import GlobalConfig from '@/components/globalConfig/GlobalConfig';

export default {
    name: 'user',
    data: function () {
        var validateRepassword, validateUpdateRepassword, validateRemoteUsername;
        validateRepassword = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请确认密码'));
            } else if (value !== this.addDialog.formData.password) {
                callback(new Error('两次输入密码不一致!'));
            } else {
                callback();
            }
        };
        validateUpdateRepassword = (rule, value, callback) => {
            if (this.updateDialog.formData.password && value === '') {
                callback(new Error('请再次输入密码'));
            } else if (value !== this.updateDialog.formData.password) {
                callback(new Error('两次输入密码不一致!'));
            } else {
                callback();
            }
        };
        validateRemoteUsername = (rule, value, callback) => {
            this.$http.post('/system/user/checkUniqueUsername', {username: value})
                .then(function (res) {
                    if (res.data.result === 'success') {
                        callback();
                    } else {
                        callback(new Error(res.data.message));
                    }
                });
        };
        return {
            shareState: this.$root.store.state,
            pagination: GlobalConfig.pagination,
            upload: GlobalConfig.upload,
            previewImageVisible: false,
            previewImage: '',
            loading: true,
            roles: [],
            queryParams: {
                username: '',
                nickname: '',
                active: '',
                currentPage: GlobalConfig.pagination.currentPage,
                pageSize: GlobalConfig.pagination.pageSize,
                position: GlobalConfig.pagination.position
            },
            multipleSelection: [],
            addDialog: {
                dialogVisible: false,
                formLabelWidth: '100px',
                dialogTitle: '新增用户',
                formName: 'addForm',
                submiting: false,
                submitText: '确定',
                checkbox: {
                    isIndeterminate: false,
                    checkAll: false
                },
                formData: {
                    username: '',
                    nickname: '',
                    avatar: '',
                    password: '',
                    repassword: '',
                    email: '',
                    phone: '',
                    active: true,
                    roles: []
                },
                formDataRules: {
                    username: [
                        { required: true, message: '请输入账号', trigger: 'change' },
                        { min: 4, max: 32, message: '长度为 4 到 32 个字符', trigger: 'change' },
                        { pattern: /^[a-zA-Z][a-zA-Z0-9]{3,31}$/, message: '账号是以英文字母开头的英文字母或数字', trigger: 'change' },
                        { validator: validateRemoteUsername, trigger: 'change' }
                    ],
                    nickname: [
                        { required: true, message: '请输入昵称', trigger: 'change' },
                        { min: 2, max: 16, message: '长度为 2 到 16 个字符', trigger: 'change' },
                        { pattern: /^[\u4E00-\u9FA5a-zA-Z][\u4E00-\u9FA5a-zA-Z0-9]{1,15}$/, message: '昵称是以中英文字母开头的中英文字母或数字', trigger: 'change' }
                    ],
                    avatar: [
                        { required: false, max: 256, message: '长度不能超过 256 个字符', trigger: 'change' },
                        { pattern: /^(oss:\/\/|local:\/\/).+(\.JPEG|\.jpeg|\.JPG|\.jpg|\.GIF|\.gif|\.PNG|\.png)$/, message: '头像必须以oss://或local://开头, jpeg/jpg/gif/png为后缀', trigger: 'change' }
                    ],
                    password: [
                        { required: true, message: '请输入密码', trigger: 'change' },
                        { min: 8, max: 32, message: '长度为 8 到 32 个字符', trigger: 'change' },
                        { pattern: /[a-z]+/, message: '密码必须包含英文大小写字母、 数字和特殊字符', trigger: 'change' },
                        { pattern: /[A-Z]+/, message: '密码必须包含英文大小写字母、 数字和特殊字符', trigger: 'change' },
                        { pattern: /[0-9]+/, message: '密码必须包含英文大小写字母、 数字和特殊字符', trigger: 'change' },
                        { pattern: /[~`!@#$%^&*()\-_=+{}\\[\]\\|\\\\\\:\\;\\'\\"\\,\\.\\/\\?\\<\\>]+/, message: '密码必须包含英文大小写字母、 数字和英文特殊字符', trigger: 'change' }
                    ],
                    repassword: [
                        { validator: validateRepassword, trigger: 'change' }
                    ],
                    email: [
                        { type: 'email', required: false, message: '邮箱格式错误', trigger: 'change' },
                        { min: 0, max: 128, message: '长度不能超过 128 位', trigger: 'change' }
                    ],
                    phone: [
                        { required: false, pattern: /^1[3|4|5|8][0-9]\d{8}$/, message: '手机号是11位数字', trigger: 'change' }
                    ],
                    active: [
                        { required: true, message: '请选择启用或禁用账号', trigger: 'change' }
                    ],
                    roles: [
                        { required: true, message: '请选择用户角色', trigger: 'change' }
                    ]
                }
            },
            updateDialog: {
                dialogVisible: false,
                formLabelWidth: '100px',
                dialogTitle: '修改用户',
                formName: 'updateForm',
                submiting: false,
                submitText: '确定',
                avatarImageFileList: [],
                checkbox: {
                    isIndeterminate: false,
                    checkAll: false
                },
                formData: {
                    id: null,
                    username: '',
                    nickname: '',
                    avatar: '',
                    password: '',
                    repassword: '',
                    email: '',
                    phone: '',
                    active: true,
                    lockDeadline: null,
                    lastLoginTime: null,
                    lastLoginIp: '',
                    roles: []
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
                    password: [
                        { required: false, message: '请输入密码', trigger: 'change' },
                        { min: 8, max: 32, message: '长度为 8 到 32 个字符', trigger: 'change' },
                        { pattern: /[a-z]+/, message: '密码必须包含英文大小写字母、 数字和特殊字符', trigger: 'change' },
                        { pattern: /[A-Z]+/, message: '密码必须包含英文大小写字母、 数字和特殊字符', trigger: 'change' },
                        { pattern: /[0-9]+/, message: '密码必须包含英文大小写字母、 数字和特殊字符', trigger: 'change' },
                        { pattern: /[~`!@#$%^&*()\-_=+{}\\[\]\\|\\\\\\:\\;\\'\\"\\,\\.\\/\\?\\<\\>]+/, message: '密码必须包含英文大小写字母、 数字和英文特殊字符', trigger: 'change' }
                    ],
                    repassword: [
                        { validator: validateUpdateRepassword, trigger: 'change' }
                    ],
                    email: [
                        { type: 'email', required: false, message: '邮箱格式错误', trigger: 'change' },
                        { min: 0, max: 128, message: '长度不能超过 128 位', trigger: 'change' }
                    ],
                    phone: [
                        { required: false, pattern: /^1[3|4|5|8][0-9]\d{8}$/, message: '手机号是11位数字', trigger: 'change' }
                    ],
                    active: [
                        { required: true, message: '请选择启用或禁用账号', trigger: 'change' }
                    ],
                    roles: [
                        { required: true, message: '请选择用户角色', trigger: 'change' }
                    ]
                }
            },
            breadcrumbData: {
                pageInfo: '身材有道管理后台系统用户管理',
                items: [
                    {
                        id: 1,
                        title: '首页',
                        path: '/home'
                    }, {
                        id: 2,
                        title: '系统管理',
                        path: ''
                    }, {
                        id: 3,
                        title: '用户管理',
                        path: '/system/user'
                    }
                ]
            }
        };
    },
    components: {
        PageBreadcrumb
    },
    mounted: function () {
        this.loadData();
        this.loadAllRoles();
    },
    filters: {
        getLockDeadline: function (value) {
            if (value > 0) {
                return value + '小时后解锁';
            } else {
                return '未锁定';
            }
        }
    },
    methods: {
        handleSizeChange: function (val) {
            this.pagination.pageSize = val;
            this.loadData();
        },
        handleCurrentChange: function (val) {
            this.loadData();
        },
        handleSelectionChange: function (selection) {
            this.multipleSelection = selection;
        },
        showAddDialog: function () {
            this.addDialog.dialogVisible = true;
        },
        addEntity: function () {
            var formData = this.$deepCopy(this.addDialog.formData);
            formData = this.handleFormDataRoles(formData);
            this.$refs[this.addDialog.formName].validate((valid) => {
                if (valid) {
                    this.addDialog.submiting = true;
                    this.addDialog.submitText = '执行中';
                    this.$http.post('/system/user/add', formData)
                        .then((res) => {
                            this.addDialog.submiting = false;
                            this.addDialog.submitText = '确定';
                            if (res.data.result === 'success') {
                                this.closeAddDialog();
                                this.loadData();
                                this.$message({
                                    message: '创建账号成功',
                                    type: 'success'
                                });
                            }
                        });
                } else {
                    return false;
                }
            });
        },
        showUpdateDialog: function (rowData) {
            this.currentRowData = this.$deepCopy(rowData);
            this.initUpdateForm(rowData);
            this.updateDialog.dialogVisible = true;
        },
        initUpdateForm: function (rowData) {
            var url;
            this.updateDialog.formData = this.$deepCopy(rowData);
            url = this.$loadRemoteFile(rowData.avatar);
            this.updateDialog.avatarImageFileList = [{
                name: url.substring(url.lastIndexOf('/') + 1),
                url: url
            }];
            this.updateDialog.formData = this.convertRowDataToFormData(this.updateDialog.formData);
            this.handleUpdateCheckedRolesChange(this.updateDialog.formData.roles);
        },
        updateEntity: function () {
            var formData = this.$deepCopy(this.updateDialog.formData);
            formData = this.handleFormDataRoles(formData);
            this.$refs[this.updateDialog.formName].validate((valid) => {
                if (valid) {
                    this.updateDialog.submiting = true;
                    this.updateDialog.submitText = '执行中';
                    this.$http.post('/system/user/update', formData)
                        .then((res) => {
                            this.updateDialog.submiting = false;
                            this.updateDialog.submitText = '确定';
                            if (res.data.result === 'success') {
                                this.closeUpdateDialog();
                                this.loadData();
                                this.$message({
                                    message: '修改账号成功',
                                    type: 'success'
                                });
                                // 更新的是本人的信息,直接刷新
                                if (this.shareState.userinfo.id === res.data.user.id) {
                                    this.$root.bus.$emit('refresh_userinfo', res.data.user);
                                }
                            }
                        });
                } else {
                    return false;
                }
            });
        },
        deleteEntity: function (rowData) {
            if (rowData && rowData.id) {
                this.$confirm('此操作将永久删除该账号, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                }).then(() => {
                    this.$http.post('/system/user/delete/' + rowData.id)
                        .then((res) => {
                            if (res.data.result === 'success') {
                                this.loadData();
                                this.$message({
                                    message: '删除用户成功',
                                    type: 'success'
                                });
                            }
                        });
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            } else {
                this.$message({
                    message: '没有选择要删除的账号',
                    type: 'warning'
                });
            }
        },
        batchDelete: function () {
            var batchDeleteData = {
                ids: []
            };
            for (var i in this.multipleSelection) {
                batchDeleteData.ids.push(this.multipleSelection[i].id);
            }
            if (!batchDeleteData.ids || batchDeleteData.ids.length === 0) {
                this.$message({
                    message: '没有选择要批量删除的账号',
                    type: 'warning'
                });
            } else {
                this.$confirm('此操作将永久删除选择的账号, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true,
                    beforeClose: (action, instance, done) => {
                        if (action === 'confirm') {
                            instance.confirmButtonLoading = true;
                            instance.confirmButtonText = '执行中...';
                            this.$http.post('/system/user/batchDelete', batchDeleteData)
                                .then((res) => {
                                    instance.confirmButtonLoading = false;
                                    if (res.data.result === 'success') {
                                        this.loadData();
                                        this.$message({
                                            message: '批量删除账号成功',
                                            type: 'success'
                                        });
                                    }
                                    done();
                                });
                        } else {
                            done();
                        }
                    }
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消批量删除'
                    });
                });
            }
        },
        closeAddDialog: function () {
            this.addDialog.dialogVisible = false;
            this.resetAddForm();
        },
        closeUpdateDialog: function () {
            this.resetUpdateForm();
            this.updateDialog.dialogVisible = false;
        },
        resetAddForm: function () {
            this.$refs[this.addDialog.formName].resetFields();
            this.$refs[this.addDialog.formName + '_avatar'].clearFiles();
        },
        resetUpdateForm: function () {
            this.$refs[this.updateDialog.formName].resetFields();
            this.initUpdateForm(this.currentRowData);
        },
        loadData: function () {
            this.loading = true;
            this.queryParams.currentPage = this.pagination.currentPage;
            this.queryParams.pageSize = this.pagination.pageSize;
            this.$http.get('/system/user/list', this.queryParams)
                .then((res) => {
                    setTimeout(() => {
                        if (res.data.result === 'success') {
                            this.pagination = Object.assign({}, this.pagination, res.data.pagination);
                        }
                        this.loading = false;
                    }, 1000);
                });
        },
        handleAddAvatarImageProgress: function (event, file, fileList) {
            this.addDialog.formData.avatar = '';
        },
        handleUpdateAvatarImageProgress: function (event, file, fileList) {
            this.updateDialog.formData.avatar = '';
        },
        handleAddAvatarImageSuccess: function (response, file, fileList) {
            if (response.result === 'success') {
                this.addDialog.formData.avatar = response.fileUploadResp.uri;
            }
        },
        handleUpdateAvatarImageSuccess: function (response, file, fileList) {
            if (response.result === 'success') {
                this.updateDialog.formData.avatar = response.fileUploadResp.uri;
            }
        },
        handlePreviewImage: function (file) {
            this.previewImage = file.url;
            this.previewImageVisible = true;
        },
        loadAllRoles: function () {
            this.$http.get('/system/role/listAll')
                .then((res) => {
                    if (res.data.result === 'success') {
                        this.roles = res.data.dataList;
                    }
                });
        },
        handleAddCheckAllChange: function (value) {
            var i, tempRoles;
            tempRoles = [];
            for (i in this.roles) {
                tempRoles.push(this.roles[i].id);
            }
            this.addDialog.formData.roles = value ? tempRoles : [];
            this.addDialog.checkbox.isIndeterminate = false;
        },
        handleAddCheckedRolesChange: function (value) {
            let checkedCount = value.length;
            this.addDialog.checkbox.checkAll = checkedCount === this.roles.length;
            this.addDialog.checkbox.isIndeterminate = checkedCount > 0 && checkedCount < this.roles.length;
        },
        handleUpdateCheckAllChange: function (value) {
            var i, tempRoles;
            tempRoles = [];
            for (i in this.roles) {
                tempRoles.push(this.roles[i].id);
            }
            this.updateDialog.formData.roles = value ? tempRoles : [];
            this.updateDialog.checkbox.isIndeterminate = false;
        },
        handleUpdateCheckedRolesChange: function (value) {
            let checkedCount = value.length;
            this.updateDialog.checkbox.checkAll = checkedCount === this.roles.length;
            this.updateDialog.checkbox.isIndeterminate = checkedCount > 0 && checkedCount < this.roles.length;
        },
        handleFormDataRoles: function (formData) {
            var i, tempRoles;
            tempRoles = [];
            for (i in formData.roles) {
                tempRoles.push({
                    id: formData.roles[i]
                });
            }
            formData.roles = tempRoles;
            return formData;
        },
        convertRowDataToFormData: function (rowData) {
            var i, tempRoles;
            tempRoles = [];
            for (i in rowData.roles) {
                tempRoles.push(rowData.roles[i].id);
            }
            rowData.roles = tempRoles;
            return rowData;
        }
    }
};
</script>

<style scoped>
    .user-container {
        height: 100%;
    }

    .user-container >>> .el-dialog {
        width: 50%;
    }

    .user-container .panel-title .search {
        display: inline-block;
        width: 400px;
        margin-left: 10px;
    }

    .user-container .panel-title .search .el-select {
        display: inline-block;
        width: 90px;
    }

    .user-container .panel-footer {
        text-align: right;
    }
</style>
