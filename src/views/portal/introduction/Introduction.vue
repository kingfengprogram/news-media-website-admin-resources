<template>
    <div class="introduction-container">
        <page-breadcrumb v-bind="breadcrumbData"></page-breadcrumb>
        <div class="panel">
            <div class="panel-title">
                <el-button type="primary" size="small" icon="fa fa-plus" @click="showAddDialog">新增</el-button>
                <el-button type="danger" size="small" icon="fa fa-trash" @click="batchDelete">批量删除</el-button>
                <el-button size="small" icon="fa fa-sort-numeric-asc" @click="showSortDialog">排序</el-button>
                <div class="search">
                    <el-select v-model="queryParams.active" @change="loadData">
                        <el-option label="状态" value=""></el-option>
                        <el-option v-for="item in shareState.paramMap.active" :label="item.value" :value="item.name" :key="item.id"></el-option>
                    </el-select>
                </div>
            </div>
            <div class="panel-body">
                <el-table stripe v-loading="loading" element-loading-text="拼命加载中" :data="pagination.dataList" style="width: 100%" @selection-change="handleSelectionChange">
                    <el-table-column type="selection" width="60"></el-table-column>
                    <el-table-column prop="bannerImg" label="轮播图">
                        <template slot-scope="scope">
                            <img :src="$loadRemoteFile(scope.row.bannerImg)" style="width: 70px; height: 70px;" @click="handlePreviewImage({url: $loadRemoteFile(scope.row.bannerImg)})">
                        </template>
                    </el-table-column>
                    <el-table-column prop="width" label="轮播图宽度">
                        <template slot-scope="scope">
                            <span>{{scope.row.width + 'px'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="height" label="轮播图高度">
                        <template slot-scope="scope">
                            <span>{{scope.row.height + 'px'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="contentImg" label="内部介绍图">
                        <template slot-scope="scope">
                            <img :src="$loadRemoteFile(scope.row.contentImg)" style="width: 70px; height: 70px;" @click="handlePreviewImage({url: $loadRemoteFile(scope.row.contentImg)})">
                        </template>
                    </el-table-column>
                    <el-table-column prop="active" label="状态">
                        <template slot-scope="scope">
                            <span>{{shareState.paramMap.active[scope.row.active] ? shareState.paramMap.active[scope.row.active].value : '参数不存在'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="updatedUsername" label="管理人员"></el-table-column>
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
                                   :current-page.sync="pagination.currentPage" :layout="pagination.layout"
                                   :page-sizes="pagination.pageSizes">
                    </el-pagination>
                </div>
            </div>
        </div>
        <el-dialog fullscreen :title="addDialog.dialogTitle" :visible.sync="addDialog.dialogVisible" custom-class="dialog-custom" :before-close="closeAddDialog" :close-on-click-modal="false">
            <el-form :model="addDialog.formData" :ref="addDialog.formName" :rules="addDialog.formDataRules" :label-width="addDialog.formLabelWidth" label-position="right" status-icon>
                <el-form-item label="轮播图" prop="bannerImg">
                    <el-input :disabled="true" v-model="addDialog.formData.bannerImg" placeholder="上传轮播图后自动获取"></el-input>
                </el-form-item>
                <el-form-item label="轮播图宽度" prop="width">
                    <el-input :disabled="true" v-model="addDialog.formData.width" placeholder="上传轮播图后自动获取"></el-input>
                </el-form-item>
                <el-form-item label="轮播图高度" prop="height">
                    <el-input :disabled="true" v-model="addDialog.formData.height" placeholder="上传轮播图后自动获取"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-upload :data="upload.uploadFunction === 'oss' ? shareState.aliyunOssSign : {}" with-credentials :ref="addDialog.formName + '_banner'" drag :action="upload.imageUploadURL" :accept="upload.imageUploadAccept" :before-upload="$beforeImageUpload" :on-preview="handlePreviewImage" :on-progress="handleAddBannerImageProgress" :on-success="handleAddBannerImageSuccess" list-type="picture">
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                        <div class="el-upload__tip" slot="tip">{{upload.imageUploadTip}}<b>{{upload.recommendBigSize}}</b></div>
                    </el-upload>
                </el-form-item>
                <el-form-item label="内部介绍图片" prop="contentImg">
                    <el-input :disabled="true" v-model="addDialog.formData.contentImg" placeholder="上传内部介绍图后自动获取"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-upload :data="upload.uploadFunction === 'oss' ? shareState.aliyunOssSign : {}" with-credentials :ref="addDialog.formName + '_content'" drag :action="upload.imageUploadURL" :accept="upload.imageUploadAccept" :before-upload="$beforeImageUpload" :on-preview="handlePreviewImage" :on-progress="handleAddContentImageProgress" :on-success="handleAddContentImageSuccess" list-type="picture">
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                        <div class="el-upload__tip" slot="tip">{{upload.imageUploadTip}}</div>
                    </el-upload>
                </el-form-item>
                <el-form-item prop="active">
                    <el-switch v-model="addDialog.formData.active" active-color="#13ce66" inactive-color="#ff4949" active-text="启用" inactive-text="禁用">
                    </el-switch>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="resetAddForm">重置</el-button>
                <el-button @click="closeAddDialog">取 消</el-button>
                <el-button type="primary" @click="addEntity" :loading="addDialog.submiting">{{addDialog.submitText}}</el-button>
            </div>
        </el-dialog>
        <el-dialog fullscreen :title="updateDialog.dialogTitle" :visible.sync="updateDialog.dialogVisible" custom-class="dialog-custom" :before-close="closeUpdateDialog" :close-on-click-modal="false" v-if="updateDialog.dialogVisible">
            <el-form :model="updateDialog.formData" :ref="updateDialog.formName" :rules="updateDialog.formDataRules" :label-width="updateDialog.formLabelWidth" label-position="right" status-icon>
                <el-form-item label="轮播图" prop="bannerImg">
                    <el-input :disabled="true" v-model="updateDialog.formData.bannerImg" placeholder="上传轮播图后自动获取"></el-input>
                </el-form-item>
                <el-form-item label="轮播图宽度" prop="width">
                    <el-input :disabled="true" v-model="updateDialog.formData.width" placeholder="上传轮播图后自动获取"></el-input>
                </el-form-item>
                <el-form-item label="轮播图高度" prop="height">
                    <el-input :disabled="true" v-model="updateDialog.formData.height" placeholder="上传轮播图后自动获取"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-upload :data="upload.uploadFunction === 'oss' ? shareState.aliyunOssSign : {}" with-credentials :ref="updateDialog.formName + '_banner'" drag :action="upload.imageUploadURL" :file-list="updateDialog.bannerImgFileList" :accept="upload.imageUploadAccept" :before-upload="$beforeImageUpload" :on-preview="handlePreviewImage" :on-progress="handleUpdateBannerImageProgress" :on-success="handleUpdateBannerImageSuccess" list-type="picture">
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                        <div class="el-upload__tip" slot="tip">{{upload.imageUploadTip}}<b>{{upload.recommendBigSize}}</b></div>
                    </el-upload>
                </el-form-item>
                <el-form-item label="内部介绍图片" prop="contentImg">
                    <el-input :disabled="true" v-model="updateDialog.formData.contentImg" placeholder="请上传轮播图"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-upload :data="upload.uploadFunction === 'oss' ? shareState.aliyunOssSign : {}" with-credentials :ref="updateDialog.formName + '_content'" drag :action="upload.imageUploadURL" :file-list="updateDialog.contentImgFileList" :accept="upload.imageUploadAccept" :before-upload="$beforeImageUpload" :on-preview="handlePreviewImage" :on-progress="handleUpdateContentImageProgress" :on-success="handleUpdateContentImageSuccess" list-type="picture">
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                        <div class="el-upload__tip" slot="tip">{{upload.imageUploadTip}}</div>
                    </el-upload>
                </el-form-item>
                <el-form-item prop="active">
                    <el-switch v-model="updateDialog.formData.active" active-color="#13ce66" inactive-color="#ff4949" active-text="启用" inactive-text="禁用">
                    </el-switch>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="resetUpdateForm">重置</el-button>
                <el-button @click="closeUpdateDialog">取 消</el-button>
                <el-button type="primary" @click="updateEntity" :loading="updateDialog.submiting">{{updateDialog.submitText}}</el-button>
            </div>
        </el-dialog>
        <el-dialog fullscreen v-loading="carousel.loading" element-loading-text="拼命加载中" :title="carousel.dialogTitle" :visible.sync="carousel.dialogVisible" custom-class="dialog-custom  dialog-carousel" :close-on-click-modal="true">
            <div class="sort-data-container" v-if="carousel.dataList && carousel.dataList.length > 0">
                <div class="sort-data-item" v-for="(item, index) in carousel.dataList" v-dragging="{ item: item, list: carousel.dataList, group: 'sort' }" :key="item.id">
                    <img :src="$loadRemoteFile(item.bannerImg)" style="width: 100%;"/>
                    <span class="sort-item-index">{{index + 1}}</span>
                </div>
            </div>
            <div v-else>
                <h3 style="text-align: center">请先创建轮播图,再进行排序操作</h3>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="closeSortDialog">取 消</el-button>
                <el-button type="primary" @click="updateSortEntity" :loading="carousel.submiting">{{carousel.submitText}}</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import PageBreadcrumb from '@/components/breadcurmb/PageBreadcrumb';
import GlobalConfig from '@/components/globalConfig/GlobalConfig';

export default {
    name: 'introductionBanner',
    data: function () {
        return {
            shareState: this.$root.store.state,
            pagination: GlobalConfig.pagination,
            upload: GlobalConfig.upload,
            previewImageVisible: false,
            previewImage: '',
            loading: true,
            carousel: {
                dialogTitle: '轮播图排序',
                dialogVisible: false,
                interval: 4000,
                height: '200px',
                loading: false,
                submiting: false,
                submitText: '确定',
                dataList: []
            },
            queryParams: {
                active: '',
                currentPage: GlobalConfig.pagination.currentPage,
                pageSize: GlobalConfig.pagination.pageSize,
                position: GlobalConfig.pagination.position
            },
            multipleSelection: [],
            currentRowData: {},
            addDialog: {
                dialogVisible: false,
                formLabelWidth: '150px',
                dialogTitle: '新增轮播图',
                formName: 'addForm',
                submiting: false,
                submitText: '确定',
                formData: {
                    bannerImg: '',
                    width: null,
                    height: null,
                    contentImg: '',
                    position: null,
                    active: true
                },
                formDataRules: {
                    bannerImg: [
                        { required: true, message: '请上传轮播图', trigger: 'change' },
                        { max: 256, message: '长度不能超过 256 个字符', trigger: 'change' },
                        { pattern: /^(oss:\/\/|local:\/\/).+(\.JPEG|\.jpeg|\.JPG|\.jpg|\.GIF|\.gif|\.PNG|\.png)$/, message: '课程推荐图必须以oss://或local://开头, jpeg/jpg/gif/png为后缀', trigger: 'change' }
                    ],
                    width: [
                        { type: 'integer', required: true, message: '请上传轮播图', trigger: 'change' },
                        { type: 'integer',min: 1920, max: 1920, message: '轮播图宽度为1920px', trigger: 'change' }
                    ],
                    height: [
                        { type: 'integer', required: true, message: '请上传轮播图', trigger: 'change' },
                        { type: 'integer',min: 1080, max: 1080, message: '轮播图高度为1080px', trigger: 'change' }
                    ],
                    contentImg: [
                        { required: false, max: 256, message: '长度不能超过 256 个字符', trigger: 'change' },
                        { pattern: /^(oss:\/\/|local:\/\/).+(\.JPEG|\.jpeg|\.JPG|\.jpg|\.GIF|\.gif|\.PNG|\.png)$/, message: '课程推荐图必须以oss://或local://开头, jpeg/jpg/gif/png为后缀', trigger: 'change' }
                    ],
                    active: [
                        { required: true, message: '请选择启用或者禁用', trigger: 'change' }
                    ]
                }
            },
            updateDialog: {
                dialogVisible: false,
                formLabelWidth: '150px',
                dialogTitle: '修改轮播图',
                formName: 'updateForm',
                submiting: false,
                submitText: '确定',
                bannerImgFileList: [],
                contentImgFileList: [],
                formData: {
                    id: null,
                    bannerImg: '',
                    width: null,
                    height: null,
                    contentImg: '',
                    position: null,
                    active: true
                },
                formDataRules: {
                    bannerImg: [
                        { required: true, message: '请上传轮播图', trigger: 'change' },
                        { max: 256, message: '路径不能超过 256 个字符', trigger: 'change' },
                        { pattern: /^(oss:\/\/|local:\/\/).+(\.JPEG|\.jpeg|\.JPG|\.jpg|\.GIF|\.gif|\.PNG|\.png)$/, message: '课程推荐图必须以oss://或local://开头, jpeg/jpg/gif/png为后缀', trigger: 'change' }
                    ],
                    width: [
                        { type: 'integer', required: true, message: '请上传轮播图', trigger: 'change' },
                        { type: 'integer',min: 1920, max: 1920, message: '轮播图宽度为1920px', trigger: 'change' }
                    ],
                    height: [
                        { type: 'integer', required: true, message: '请上传轮播图', trigger: 'change' },
                        { type: 'integer',min: 1080, max: 1080, message: '轮播图高度为1080px', trigger: 'change' }
                    ],
                    contentImg: [
                        { required: false, max: 256, message: '长度不能超过 256 个字符', trigger: 'change' },
                        { pattern: /^(oss:\/\/|local:\/\/).+(\.JPEG|\.jpeg|\.JPG|\.jpg|\.GIF|\.gif|\.PNG|\.png)$/, message: '课程推荐图必须以oss://或local://开头, jpeg/jpg/gif/png为后缀', trigger: 'change' }
                    ],
                    active: [
                        { required: true, message: '请选择启用或者禁用', trigger: 'change' }
                    ]
                }
            },
            breadcrumbData: {
                pageInfo: '身材有道门户系统轮播图管理',
                items: [
                    {
                        id: 1,
                        title: '首页',
                        path: '/home'
                    }, {
                        id: 2,
                        title: '运营管理',
                        path: ''
                    }, {
                        id: 3,
                        title: '轮播图管理',
                        path: '/portal/introduction'
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
            var formData = this.addDialog.formData;
            formData.position = this.pagination.total;
            this.$refs[this.addDialog.formName].validate((valid) => {
                if (valid) {
                    this.addDialog.submiting = true;
                    this.addDialog.submitText = '执行中';
                    this.$http.post('/portal/introductionBanner/add', formData)
                        .then((res) => {
                            this.addDialog.submiting = false;
                            this.addDialog.submitText = '确定';
                            if (res.data.result === 'success') {
                                this.closeAddDialog();
                                this.loadData();
                                this.$message({
                                    message: '新增轮播图成功',
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
            url = this.$loadRemoteFile(rowData.bannerImg);
            this.updateDialog.bannerImgFileList = [{
                name: url.substring(url.lastIndexOf('/') + 1),
                url: url
            }];
            url = this.$loadRemoteFile(rowData.contentImg);
            this.updateDialog.contentImgFileList = [{
                name: url.substring(url.lastIndexOf('/') + 1),
                url: url
            }];
        },
        updateEntity: function () {
            var formData = this.updateDialog.formData;
            this.$refs[this.updateDialog.formName].validate((valid) => {
                if (valid) {
                    this.updateDialog.submiting = true;
                    this.updateDialog.submitText = '执行中';
                    this.$http.post('/portal/introductionBanner/update', formData)
                        .then((res) => {
                            this.updateDialog.submiting = false;
                            this.updateDialog.submitText = '确定';
                            if (res.data.result === 'success') {
                                this.closeUpdateDialog();
                                this.loadData();
                                this.$message({
                                    message: '修改轮播图成功',
                                    type: 'success'
                                });
                            }
                        });
                } else {
                    return false;
                }
            });
        },
        deleteEntity: function (rowData) {
            if (rowData && rowData.id) {
                this.$confirm('此操作将永久删除该轮播图, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                }).then(() => {
                    this.$http.post('/portal/introductionBanner/delete/' + rowData.id)
                        .then((res) => {
                            if (res.data.result === 'success') {
                                this.loadData();
                                this.$message({
                                    message: '删除轮播图成功',
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
                    message: '没有选择要删除的轮播图',
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
                    message: '没有选择要批量删除的轮播图',
                    type: 'warning'
                });
            } else {
                this.$confirm('此操作将永久删除选择的轮播图, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true,
                    beforeClose: (action, instance, done) => {
                        if (action === 'confirm') {
                            instance.confirmButtonLoading = true;
                            instance.confirmButtonText = '执行中...';
                            this.$http.post('/portal/introductionBanner/batchDelete', batchDeleteData)
                                .then((res) => {
                                    instance.confirmButtonLoading = false;
                                    if (res.data.result === 'success') {
                                        this.loadData();
                                        this.$message({
                                            message: '批量删除轮播图成功',
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
            this.resetAddForm(this.addDialog.formName);
        },
        closeUpdateDialog: function () {
            this.resetUpdateForm(this.updateDialog.formName);
            this.updateDialog.dialogVisible = false;
        },
        closeSortDialog: function () {
            this.carousel.dialogVisible = false;
        },
        updateSortEntity: function () {
            var formData;
            if (!this.carousel.dataList || this.carousel.dataList.length === 0) {
                this.$message({
                    message: '修改轮播图排序失败, 内容列表为空',
                    type: 'error'
                });
                return;
            }
            formData = {
                introductionBanners: this.carousel.dataList
            };
            for (var i in formData.introductionBanners) {
                formData.introductionBanners[i].position = i;
            }
            this.carousel.submiting = true;
            this.carousel.submitText = '执行中';
            this.$http.post('/portal/introductionBanner/updateSort', formData)
                .then((res) => {
                    this.carousel.submiting = false;
                    this.carousel.submitText = '确定';
                    if (res.data.result === 'success') {
                        this.closeSortDialog();
                        this.loadData();
                        this.$message({
                            message: '修改轮播图排序成功',
                            type: 'success'
                        });
                    }
                });
        },
        resetAddForm: function () {
            this.$refs[this.addDialog.formName].resetFields();
            this.$refs[this.addDialog.formName + '_banner'].clearFiles();
            this.$refs[this.addDialog.formName + '_content'].clearFiles();
        },
        resetUpdateForm: function () {
            this.$refs[this.updateDialog.formName].resetFields();
            this.initUpdateForm(this.currentRowData);
        },
        loadData: function () {
            this.loading = true;
            this.queryParams.currentPage = this.pagination.currentPage;
            this.queryParams.pageSize = this.pagination.pageSize;
            this.$http.get('/portal/introductionBanner/list', this.queryParams)
                .then((res) => {
                    setTimeout(() => {
                        if (res.data.result === 'success') {
                            this.pagination = Object.assign({}, this.pagination, res.data.pagination);
                        }
                        this.loading = false;
                    }, 1000);
                });
        },
        handleAddBannerImageProgress: function (event, file, fileList) {
            this.addDialog.formData.bannerImg = '';
            this.addDialog.formData.width = null;
            this.addDialog.formData.height = null;
        },
        handleAddContentImageProgress: function (event, file, fileList) {
            this.addDialog.formData.contentImg = '';
        },
        handleUpdateBannerImageProgress: function (event, file, fileList) {
            this.updateDialog.formData.bannerImg = '';
            this.updateDialog.formData.width = null;
            this.updateDialog.formData.height = null;
        },
        handleUpdateContentImageProgress: function (event, file, fileList) {
            this.updateDialog.formData.contentImg = '';
        },
        handleAddBannerImageSuccess: function (response, file, fileList) {
            if (response.result === 'success') {
                this.addDialog.formData.bannerImg = response.fileUploadResp.uri;
                this.addDialog.formData.width = response.fileUploadResp.width;
                this.addDialog.formData.height = response.fileUploadResp.height;
            }
        },
        handleAddContentImageSuccess: function (response, file, fileList) {
            if (response.result === 'success') {
                this.addDialog.formData.contentImg = response.fileUploadResp.uri;
            }
        },
        handleUpdateBannerImageSuccess: function (response, file, fileList) {
            if (response.result === 'success') {
                this.updateDialog.formData.bannerImg = response.fileUploadResp.uri;
                this.updateDialog.formData.width = response.fileUploadResp.width;
                this.updateDialog.formData.height = response.fileUploadResp.height;
            }
        },
        handleUpdateContentImageSuccess: function (response, file, fileList) {
            if (response.result === 'success') {
                this.updateDialog.formData.contentImg = response.fileUploadResp.uri;
            }
        },
        handlePreviewImage: function (file) {
            this.previewImage = file.url;
            this.previewImageVisible = true;
        },
        showSortDialog: function () {
            this.carousel.loading = true;
            this.carousel.dialogVisible = true;
            this.$http.get('/portal/introductionBanner/listAll', { active: true, position: 'asc' })
                .then((res) => {
                    setTimeout(() => {
                        if (res.data.result === 'success') {
                            this.carousel.dataList = res.data.dataList;
                        }
                        this.carousel.loading = false;
                    }, 1000);
                });
        }
    }
};
</script>

<style scoped>
    .introduction-container {
        height: 100%;
    }

    .introduction-container >>> .el-dialog {
        width: 50%;
    }

    .introduction-container >>> .dialog-carousel {
        width: 72%;
    }

    .introduction-container .panel-title .search {
        display: inline-block;
        margin-left: 10px;
    }

    .introduction-container .panel-title .search .el-select {
        display: inline-block;
        width: 90px;
    }

    .introduction-container .panel-footer {
        text-align: right;
    }

    .introduction-container .sort-data-container {
        width: 100%;
        text-align: center;
    }

    .introduction-container .sort-data-container .sort-data-item {
        position: relative;
        display: inline-block;
        margin-right: 10px;
        width: 49%;
    }

    .introduction-container .sort-data-container .sort-data-item .sort-item-index {
        position: absolute;
        top: 50%;
        left:50%;
        transform: translate(-50%, -50%);
        color: #ffffff;
        font-size: 50px;
    }

</style>
