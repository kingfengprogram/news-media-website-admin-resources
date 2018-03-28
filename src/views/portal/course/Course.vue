<template>
    <div class="course-container">
        <page-breadcrumb v-bind="breadcrumbData"></page-breadcrumb>
        <div class="panel">
            <div class="panel-title">
                <el-button type="primary" size="small" icon="fa fa-plus" @click="showAddDialog">新增</el-button>
                <el-button type="danger" size="small" icon="fa fa-trash" @click="batchDelete">批量删除</el-button>
                <el-button size="small" icon="fa fa-sort-numeric-asc" @click="showSortDialog">排序</el-button>
                <div class="search">
                    <el-input placeholder="请输入课程名称" v-model="queryParams.name" class="input-with-select" @keyup.enter.native="loadData">
                        <el-select v-model="queryParams.active" slot="prepend">
                            <el-option label="状态" value=""></el-option>
                            <el-option v-for="item in shareState.paramMap.active" :label="item.value" :value="item.name" :key="item.id"></el-option>
                        </el-select>
                        <el-button slot="append" icon="el-icon-search" @click="loadData"></el-button>
                    </el-input>
                </div>
            </div>
            <div class="panel-body">
                <el-table stripe v-loading="loading" element-loading-text="拼命加载中" :data="pagination.dataList" style="width: 100%" @selection-change="handleSelectionChange">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="course-table-expand">
                                <el-form-item label="课程名称">
                                    <span>{{ props.row.name }}</span>
                                </el-form-item>
                                <el-form-item label="课程编码">
                                    <span>{{ props.row.code }}</span>
                                </el-form-item>
                                <el-form-item label="课程推荐图">
                                    <img :src="$loadRemoteFile(props.row.thumbImage)" style="width: 70px; height: 70px;" @click="handlePreviewImage({url: $loadRemoteFile(props.row.thumbImage)})">
                                </el-form-item>
                                <el-form-item label="课程海报图">
                                    <img :src="$loadRemoteFile(props.row.posterImage)" style="width: 70px; height: 70px;" @click="handlePreviewImage({url: $loadRemoteFile(props.row.posterImage)})">
                                </el-form-item>
                                <el-form-item label="课程简介">
                                    <span>{{ props.row.introduction }}</span>
                                </el-form-item>
                                <el-form-item label="精选课程">
                                    <div class="choiceness-course" v-if="props.row.choicenessCourses.length != 0">
                                        <ul>
                                            <li v-for="choicenessCourse in props.row.choicenessCourses" :key="choicenessCourse.id"><span></span>{{choicenessCourse.tag ? '【' + choicenessCourse.tag + '】' : ''}}{{choicenessCourse.title}}</li>
                                        </ul>
                                    </div>
                                    <span v-else>无</span>
                                </el-form-item>
                                <el-form-item label="状态">
                                    <span>{{ shareState.paramMap.active[props.row.active] ? shareState.paramMap.active[props.row.active].value : '参数不存在' }}</span>
                                </el-form-item>
                                <el-form-item label="管理人员(最后修改)">
                                    <span>{{ props.row.updatedUsername }}</span>
                                </el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column type="selection" width="60"></el-table-column>
                    <el-table-column prop="name" label="课程名称"></el-table-column>
                    <el-table-column prop="code" label="课程编码"></el-table-column>
                    <el-table-column prop="thumbImage" label="课程推荐图">
                        <template slot-scope="scope">
                            <img :src="$loadRemoteFile(scope.row.thumbImage)" style="width: 70px; height: 70px;" @click="handlePreviewImage({url: $loadRemoteFile(scope.row.thumbImage)})">
                        </template>
                    </el-table-column>
                    <el-table-column prop="posterImage" label="课程海报图">
                        <template slot-scope="scope">
                            <img :src="$loadRemoteFile(scope.row.posterImage)" style="width: 70px; height: 70px;" @click="handlePreviewImage({url: $loadRemoteFile(scope.row.posterImage)})">
                        </template>
                    </el-table-column>
                    <el-table-column prop="introduction" label="课程简介" show-overflow-tooltip></el-table-column>
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
                <el-form-item label="课程名称" prop="name">
                    <el-input v-model="addDialog.formData.name" placeholder="请输入课程名称"></el-input>
                </el-form-item>
                <el-form-item label="课程编码" prop="code">
                    <el-input v-model="addDialog.formData.code" placeholder="请输入课程编码"></el-input>
                </el-form-item>
                <el-form-item label="课程推荐图" prop="thumbImage">
                    <el-input :disabled="true" v-model="addDialog.formData.thumbImage" placeholder="上传课程推荐图后自动获取"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-upload :data="upload.uploadFunction === 'oss' ? shareState.aliyunOssSign : {}" with-credentials :ref="addDialog.formName + '_thumb'" drag :action="upload.imageUploadURL" :accept="upload.imageUploadAccept" :before-upload="$beforeImageUpload" :on-preview="handlePreviewImage" :on-progress="handleAddThumbImageProgress" :on-success="handleAddThumbImageSuccess" list-type="picture">
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                        <div class="el-upload__tip" slot="tip">{{upload.imageUploadTip}}<b>{{upload.recommendSmallSize}}</b></div>
                    </el-upload>
                </el-form-item>
                <el-form-item label="课程海报图" prop="posterImage">
                    <el-input :disabled="true" v-model="addDialog.formData.posterImage" placeholder="上传课程海报图后自动获取"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-upload :data="upload.uploadFunction === 'oss' ? shareState.aliyunOssSign : {}" with-credentials :ref="addDialog.formName + '_poster'" drag :action="upload.imageUploadURL" :accept="upload.imageUploadAccept" :before-upload="$beforeImageUpload" :on-preview="handlePreviewImage" :on-progress="handleAddPosterImageProgress" :on-success="handleAddPosterImageSuccess" list-type="picture">
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                        <div class="el-upload__tip" slot="tip">{{upload.imageUploadTip}}<b>{{upload.recommendBigSize}}</b></div>
                    </el-upload>
                </el-form-item>
                <el-form-item label="课程简介" prop="introduction">
                    <el-input v-model="addDialog.formData.introduction" placeholder="请输入课程简介"></el-input>
                </el-form-item>
                <el-form-item prop="active">
                    <el-switch v-model="addDialog.formData.active" active-color="#13ce66" inactive-color="#ff4949" active-text="启用" inactive-text="禁用">
                    </el-switch>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" class="button-small" size="small" icon="fa fa-plus" @click="addChoicenessCourse('addDialog')">新增精选课程</el-button>
                </el-form-item>
                <div class="choiceness-courses" v-show="addDialog.formData.choicenessCourses.length != 0">
                    <div v-for="(child, index) in addDialog.formData.choicenessCourses" v-dragging="{ item: child, list: addDialog.formData.choicenessCourses, group: 'updateDialog' }"  :key="'addDialog.' + index">
                        <el-form-item>
                            <i>{{index}}</i>
                        </el-form-item>
                        <el-form-item label="标签" :prop="'choicenessCourses.' + index + '.tag'" :rules="addDialog.formDataRules.choicenessCourse.tag">
                            <el-input v-model="addDialog.formData.choicenessCourses[index].tag" placeholder="请输入标签"></el-input>
                        </el-form-item>
                        <el-form-item label="标题" :prop="'choicenessCourses.' + index + '.title'" :rules="addDialog.formDataRules.choicenessCourse.title">
                            <el-input v-model="addDialog.formData.choicenessCourses[index].title" placeholder="请输入标题"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" class="button-small" size="small" icon="fa fa-trash" @click="deleteChoicenessCourse('addDialog', index)"></el-button>
                        </el-form-item>
                    </div>
                </div>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="resetAddForm">重置</el-button>
                <el-button @click="closeAddDialog">取 消</el-button>
                <el-button type="primary" @click="addEntity" :loading="addDialog.submiting">{{addDialog.submitText}}</el-button>
            </div>
        </el-dialog>
        <el-dialog fullscreen :title="updateDialog.dialogTitle" :visible.sync="updateDialog.dialogVisible" custom-class="dialog-custom" :before-close="closeUpdateDialog" :close-on-click-modal="false" v-if="updateDialog.dialogVisible">
            <el-form :model="updateDialog.formData" :ref="updateDialog.formName" :rules="updateDialog.formDataRules" :label-width="updateDialog.formLabelWidth" label-position="right" status-icon>
                <el-form-item label="课程名称" prop="name">
                    <el-input v-model="updateDialog.formData.name" placeholder="请输入课程名称"></el-input>
                </el-form-item>
                <el-form-item label="课程编码" prop="code">
                    <el-input v-model="updateDialog.formData.code" placeholder="请输入课程编码"></el-input>
                </el-form-item>
                <el-form-item label="课程推荐图" prop="thumbImage">
                    <el-input :disabled="true" v-model="updateDialog.formData.thumbImage" placeholder="上传课程推荐图后自动获取"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-upload :data="upload.uploadFunction === 'oss' ? shareState.aliyunOssSign : {}" with-credentials :ref="updateDialog.formName + '_thumb'" drag :action="upload.imageUploadURL" :file-list="updateDialog.thumbImageFileList" :accept="upload.imageUploadAccept" :before-upload="$beforeImageUpload" :on-preview="handlePreviewImage" :on-progress="handleUpdateThumbImageProgress" :on-success="handleUpdateThumbImageSuccess" list-type="picture">
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                        <div class="el-upload__tip" slot="tip">{{upload.imageUploadTip}}<b>{{upload.recommendSmallSize}}</b></div>
                    </el-upload>
                </el-form-item>
                <el-form-item label="课程海报图" prop="posterImage">
                    <el-input :disabled="true" v-model="updateDialog.formData.posterImage" placeholder="上传课程海报图后自动获取"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-upload :data="upload.uploadFunction === 'oss' ? shareState.aliyunOssSign : {}" with-credentials :ref="updateDialog.formName + '_poster'" drag :action="upload.imageUploadURL" :file-list="updateDialog.posterImageFileList" :accept="upload.imageUploadAccept" :before-upload="$beforeImageUpload" :on-preview="handlePreviewImage" :on-progress="handleUpdatePosterImageProgress" :on-success="handleUpdatePosterImageSuccess" list-type="picture">
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                        <div class="el-upload__tip" slot="tip">{{upload.imageUploadTip}}<b>{{upload.recommendBigSize}}</b></div>
                    </el-upload>
                </el-form-item>
                <el-form-item label="课程简介" prop="introduction">
                    <el-input v-model="updateDialog.formData.introduction" placeholder="请输入课程简介"></el-input>
                </el-form-item>
                <el-form-item prop="active">
                    <el-switch v-model="updateDialog.formData.active" active-color="#13ce66" inactive-color="#ff4949" active-text="启用" inactive-text="禁用">
                    </el-switch>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" class="button-small" size="small" icon="fa fa-plus" @click="addChoicenessCourse('updateDialog')">新增精选课程</el-button>
                </el-form-item>
                <div class="choiceness-courses" v-show="updateDialog.formData.choicenessCourses.length != 0">
                    <div v-for="(child, index) in updateDialog.formData.choicenessCourses" v-dragging="{ item: child, list: updateDialog.formData.choicenessCourses, group: 'updateDialog' }"  :key="'updateDialog.' + index">
                        <el-form-item>
                            <i>{{index}}</i>
                        </el-form-item>
                        <el-form-item label="参数名" :prop="'choicenessCourses.' + index + '.tag'" :rules="updateDialog.formDataRules.choicenessCourse.tag">
                            <el-input v-model="updateDialog.formData.choicenessCourses[index].tag" placeholder="请输入标签"></el-input>
                        </el-form-item>
                        <el-form-item label="参数值" :prop="'choicenessCourses.' + index + '.title'" :rules="updateDialog.formDataRules.choicenessCourse.title">
                            <el-input v-model="updateDialog.formData.choicenessCourses[index].title" placeholder="请输入标题"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" class="button-small" size="small" icon="fa fa-trash" @click="deleteChoicenessCourse('updateDialog', index)"></el-button>
                        </el-form-item>
                    </div>
                </div>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="resetUpdateForm">重置</el-button>
                <el-button @click="closeUpdateDialog">取 消</el-button>
                <el-button type="primary" @click="updateEntity" :loading="updateDialog.submiting">{{updateDialog.submitText}}</el-button>
            </div>
        </el-dialog>
        <el-dialog fullscreen v-loading="carousel.loading" element-loading-text="拼命加载中" :title="carousel.dialogTitle" :visible.sync="carousel.dialogVisible" custom-class="dialog-custom  dialog-carousel" :close-on-click-modal="false">
            <div class="sort-data-container" v-if="carousel.dataList && carousel.dataList.length > 0">
                <div class="sort-data-item" v-for="(item, index) in carousel.dataList" v-dragging="{ item: item, list: carousel.dataList, group: 'sort' }" :key="item.id">
                    <img :src="$loadRemoteFile(item.thumbImage)" style="width: 100%;"/>
                    <span class="sort-item-index">{{index + 1}}</span>
                </div>
            </div>
            <div v-else>
                <h3 style="text-align: center">请先创建课程内容,再进行排序操作</h3>
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
    name: 'course',
    data: function () {
        var validateAddRemoteName, validateUpdateRemoteName, validateAddRemoteCode, validateUpdateRemoteCode;
        validateAddRemoteName = (roule, value, callback) => {
            this.$http.post('/portal/course/checkUniqueName', {name: value})
                .then(function (res) {
                    if (res.data.result === 'success') {
                        callback();
                    } else {
                        callback(new Error(res.data.message));
                    }
                });
        };
        validateUpdateRemoteName = (roule, value, callback) => {
            if (this.currentRowData.name !== value) {
                this.$http.post('/portal/course/checkUniqueName', {name: value})
                    .then(function (res) {
                        if (res.data.result === 'success') {
                            callback();
                        } else {
                            callback(new Error(res.data.message));
                        }
                    });
            } else {
                callback();
            }
        };
        validateAddRemoteCode = (roule, value, callback) => {
            this.$http.post('/portal/course/checkUniqueCode', {code: value})
                .then(function (res) {
                    if (res.data.result === 'success') {
                        callback();
                    } else {
                        callback(new Error(res.data.message));
                    }
                });
        };
        validateUpdateRemoteCode = (roule, value, callback) => {
            if (this.currentRowData.code !== value) {
                this.$http.post('/portal/course/checkUniqueCode', {code: value})
                    .then(function (res) {
                        if (res.data.result === 'success') {
                            callback();
                        } else {
                            callback(new Error(res.data.message));
                        }
                    });
            } else {
                callback();
            }
        };
        return {
            shareState: this.$root.store.state,
            pagination: GlobalConfig.pagination,
            upload: GlobalConfig.upload,
            previewImageVisible: false,
            previewImage: '',
            loading: true,
            carousel: {
                dialogTitle: '课程内容排序',
                dialogVisible: false,
                interval: 4000,
                height: '200px',
                loading: false,
                submiting: false,
                submitText: '确定',
                dataList: []
            },
            queryParams: {
                name: '',
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
                dialogTitle: '新增课程内容',
                formName: 'addForm',
                submiting: false,
                submitText: '确定',
                formData: {
                    name: '',
                    code: '',
                    thumbImage: '',
                    posterImage: '',
                    introduction: '',
                    choicenessCourses: [],
                    position: null,
                    active: true
                },
                formDataRules: {
                    name: [
                        { required: true, message: '请输入课程名称', trigger: 'change' },
                        { min: 2, max: 32, message: '长度为 2 到 32 个字符', trigger: 'change' },
                        { pattern: /^[\u4E00-\u9FA5a-zA-Z0-9]{2,32}$/, message: '课程名称是中英文字母或数字', trigger: 'change' },
                        { validator: validateAddRemoteName, trigger: 'change' }
                    ],
                    code: [
                        { required: true, message: '请输入课程编码', trigger: 'change' },
                        { min: 2, max: 32, message: '长度为 2 到 32 个字符', trigger: 'change' },
                        { pattern: /^[a-zA-Z0-9& ]{2,32}$/, message: '课程编码是英文字母、数字、空格或者&符号', trigger: 'change' },
                        { validator: validateAddRemoteCode, trigger: 'change' }
                    ],
                    thumbImage: [
                        { required: true, message: '请上传课程推荐图', trigger: 'change' },
                        { max: 256, message: '长度不能超过 256 个字符', trigger: 'change' },
                        { pattern: /^(oss:\/\/|local:\/\/).+(\.JPEG|\.jpeg|\.JPG|\.jpg|\.GIF|\.gif|\.PNG|\.png)$/, message: '课程推荐图必须以oss://或local://开头, jpeg/jpg/gif/png为后缀', trigger: 'change' }
                    ],
                    posterImage: [
                        { required: true, message: '请上传课程海报图', trigger: 'change' },
                        { max: 256, message: '长度不能超过 256 个字符', trigger: 'change' },
                        { pattern: /^(oss:\/\/|local:\/\/).+(\.JPEG|\.jpeg|\.JPG|\.jpg|\.GIF|\.gif|\.PNG|\.png)$/, message: '课程推荐图必须以oss://或local://开头, jpeg/jpg/gif/png为后缀', trigger: 'change' }
                    ],
                    introduction: [
                        { required: false, max: 256, message: '长度不能超过 256 个字符', trigger: 'change' }
                    ],
                    active: [
                        { required: true, message: '请选择启用或者禁用', trigger: 'change' }
                    ],
                    choicenessCourse: {
                        tag: [
                            { required: false, min: 2, max: 32, message: '精选课程标签为 2 到 32 个字符', trigger: 'change' }
                        ],
                        title: [
                            { required: true, message: '请输入精选课程标题', trigger: 'change' },
                            { min: 2, max: 32, message: '精选课程标题为 2 到 32 个字符', trigger: 'change' }
                        ]
                    }
                }
            },
            updateDialog: {
                dialogVisible: false,
                formLabelWidth: '150px',
                dialogTitle: '修改课程内容',
                formName: 'updateForm',
                submiting: false,
                submitText: '确定',
                thumbImageFileList: [],
                posterImageFileList: [],
                formData: {
                    id: null,
                    name: '',
                    code: '',
                    thumbImage: '',
                    posterImage: '',
                    introduction: '',
                    choicenessCourses: [],
                    position: null,
                    active: true
                },
                formDataRules: {
                    name: [
                        { required: true, message: '请输入课程名称', trigger: 'change' },
                        { min: 2, max: 32, message: '长度为 2 到 32 个字符', trigger: 'change' },
                        { pattern: /^[\u4E00-\u9FA5a-zA-Z0-9]{2,32}$/, message: '课程名称是中英文字母或数字', trigger: 'change' },
                        { validator: validateUpdateRemoteName, trigger: 'change' }
                    ],
                    code: [
                        { required: true, message: '请输入课程编码', trigger: 'change' },
                        { min: 2, max: 32, message: '长度为 2 到 32 个字符', trigger: 'change' },
                        { pattern: /^[a-zA-Z0-9& ]{2,32}$/, message: '课程编码是英文字母、数字、空格或者&符号', trigger: 'change' },
                        { validator: validateUpdateRemoteCode, trigger: 'change' }
                    ],
                    thumbImage: [
                        { required: true, message: '请上传课程推荐图', trigger: 'change' },
                        { max: 256, message: '长度不能超过 256 个字符', trigger: 'change' },
                        { pattern: /^(oss:\/\/|local:\/\/).+(\.JPEG|\.jpeg|\.JPG|\.jpg|\.GIF|\.gif|\.PNG|\.png)$/, message: '课程推荐图必须以oss://或local://开头, jpeg/jpg/gif/png为后缀', trigger: 'change' }
                    ],
                    posterImage: [
                        { required: true, message: '请上传课程海报图', trigger: 'change' },
                        { max: 256, message: '长度不能超过 256 个字符', trigger: 'change' },
                        { pattern: /^(oss:\/\/|local:\/\/).+(\.JPEG|\.jpeg|\.JPG|\.jpg|\.GIF|\.gif|\.PNG|\.png)$/, message: '课程推荐图必须以oss://或local://开头, jpeg/jpg/gif/png为后缀', trigger: 'change' }
                    ],
                    introduction: [
                        { required: false, max: 256, message: '长度不能超过 256 个字符', trigger: 'change' }
                    ],
                    active: [
                        { required: true, message: '请选择启用或者禁用', trigger: 'change' }
                    ],
                    choicenessCourse: {
                        tag: [
                            { required: false, min: 2, max: 32, message: '精选课程标签为 2 到 32 个字符', trigger: 'change' }
                        ],
                        title: [
                            { required: true, message: '请输入精选课程标题', trigger: 'change' },
                            { min: 2, max: 32, message: '精选课程标题为 2 到 32 个字符', trigger: 'change' }
                        ]
                    }
                }
            },
            breadcrumbData: {
                pageInfo: '身材有道门户系统课程内容管理',
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
                        title: '课程内容管理',
                        path: '/portal/course'
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
            var emptyData = {
                name: '',
                code: '',
                thumbImage: '',
                posterImage: '',
                introduction: '',
                choicenessCourses: [],
                position: null,
                active: true
            };
            this.addDialog.formData = emptyData;
            this.addDialog.dialogVisible = true;
        },
        addChoicenessCourse: function (dialogName) {
            this[dialogName].formData.choicenessCourses.push({
                tag: '',
                title: '',
                position: null
            });
        },
        deleteChoicenessCourse: function (dialogName, index) {
            this[dialogName].formData.choicenessCourses.splice(index, 1);
        },
        addEntity: function () {
            var formData = this.addDialog.formData;
            formData.position = this.pagination.total;
            for (var i in formData.choicenessCourses) {
                formData.choicenessCourses[i].position = i;
            }
            this.$refs[this.addDialog.formName].validate((valid) => {
                if (valid) {
                    this.addDialog.submiting = true;
                    this.addDialog.submitText = '执行中';
                    this.$http.post('/portal/course/add', formData)
                        .then((res) => {
                            this.addDialog.submiting = false;
                            this.addDialog.submitText = '确定';
                            if (res.data.result === 'success') {
                                this.closeAddDialog();
                                this.loadData();
                                this.$message({
                                    message: '新增课程内容成功',
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
            url = this.$loadRemoteFile(rowData.thumbImage);
            this.updateDialog.thumbImageFileList = [{
                name: url.substring(url.lastIndexOf('/') + 1),
                url: url
            }];
            url = this.$loadRemoteFile(rowData.posterImage);
            this.updateDialog.posterImageFileList = [{
                name: url.substring(url.lastIndexOf('/') + 1),
                url: url
            }];
        },
        updateEntity: function () {
            var formData = this.updateDialog.formData;
            for (var i in formData.choicenessCourses) {
                formData.choicenessCourses[i].position = i;
            }
            this.$refs[this.updateDialog.formName].validate((valid) => {
                if (valid) {
                    this.updateDialog.submiting = true;
                    this.updateDialog.submitText = '执行中';
                    this.$http.post('/portal/course/update', formData)
                        .then((res) => {
                            this.updateDialog.submiting = false;
                            this.updateDialog.submitText = '确定';
                            if (res.data.result === 'success') {
                                this.closeUpdateDialog();
                                this.loadData();
                                this.$message({
                                    message: '修改课程内容成功',
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
                this.$confirm('此操作将永久删除该课程内容, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                }).then(() => {
                    this.$http.post('/portal/course/delete/' + rowData.id)
                        .then((res) => {
                            if (res.data.result === 'success') {
                                this.loadData();
                                this.$message({
                                    message: '删除课程内容成功',
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
                    message: '没有选择要删除的课程内容',
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
                    message: '没有选择要批量删除的课程内容',
                    type: 'warning'
                });
            } else {
                this.$confirm('此操作将永久删除选择的课程内容, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true,
                    beforeClose: (action, instance, done) => {
                        if (action === 'confirm') {
                            instance.confirmButtonLoading = true;
                            instance.confirmButtonText = '执行中...';
                            this.$http.post('/portal/course/batchDelete', batchDeleteData)
                                .then((res) => {
                                    instance.confirmButtonLoading = false;
                                    if (res.data.result === 'success') {
                                        this.loadData();
                                        this.$message({
                                            message: '批量删除课程内容成功',
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
                    message: '修改课程内容排序失败, 内容列表为空',
                    type: 'error'
                });
                return;
            }
            formData = {
                courses: this.carousel.dataList
            };
            for (var i in formData.courses) {
                formData.courses[i].position = i;
            }
            this.carousel.submiting = true;
            this.carousel.submitText = '执行中';
            this.$http.post('/portal/course/updateSort', formData)
                .then((res) => {
                    this.carousel.submiting = false;
                    this.carousel.submitText = '确定';
                    if (res.data.result === 'success') {
                        this.closeSortDialog();
                        this.loadData();
                        this.$message({
                            message: '修改课程内容排序成功',
                            type: 'success'
                        });
                    }
                });
        },
        resetAddForm: function () {
            this.$refs[this.addDialog.formName].resetFields();
            this.$refs[this.addDialog.formName + '_thumb'].clearFiles();
            this.$refs[this.addDialog.formName + '_poster'].clearFiles();
            this.addDialog.formData.choicenessCourses = [];
        },
        resetUpdateForm: function () {
            this.$refs[this.updateDialog.formName].resetFields();
            this.initUpdateForm(this.currentRowData);
        },
        loadData: function () {
            this.loading = true;
            this.queryParams.currentPage = this.pagination.currentPage;
            this.queryParams.pageSize = this.pagination.pageSize;
            this.$http.get('/portal/course/list', this.queryParams)
                .then((res) => {
                    setTimeout(() => {
                        if (res.data.result === 'success') {
                            this.pagination = Object.assign({}, this.pagination, res.data.pagination);
                        }
                        this.loading = false;
                    }, 1000);
                });
        },
        handleAddThumbImageProgress: function (event, file, fileList) {
            this.addDialog.formData.thumbImage = '';
        },
        handleAddPosterImageProgress: function (event, file, fileList) {
            this.addDialog.formData.posterImage = '';
        },
        handleUpdateThumbImageProgress: function (event, file, fileList) {
            this.updateDialog.formData.thumbImage = '';
        },
        handleUpdatePosterImageProgress: function (event, file, fileList) {
            this.updateDialog.formData.posterImage = '';
        },
        handleAddThumbImageSuccess: function (response, file, fileList) {
            if (response.result === 'success') {
                this.addDialog.formData.thumbImage = response.fileUploadResp.uri;
            }
        },
        handleAddPosterImageSuccess: function (response, file, fileList) {
            if (response.result === 'success') {
                this.addDialog.formData.posterImage = response.fileUploadResp.uri;
            }
        },
        handleUpdateThumbImageSuccess: function (response, file, fileList) {
            if (response.result === 'success') {
                this.updateDialog.formData.thumbImage = response.fileUploadResp.uri;
            }
        },
        handleUpdatePosterImageSuccess: function (response, file, fileList) {
            if (response.result === 'success') {
                this.updateDialog.formData.posterImage = response.fileUploadResp.uri;
            }
        },
        handlePreviewImage: function (file) {
            this.previewImage = file.url;
            this.previewImageVisible = true;
        },
        showSortDialog: function () {
            this.carousel.loading = true;
            this.carousel.dialogVisible = true;
            this.$http.get('/portal/course/listAll', { active: true, position: 'asc' })
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
    .course-container {
        height: 100%;
    }

    .course-container .choiceness-courses {
        border-top: 1px solid #e2e2e2;
        padding-top: 20px;
    }

    .course-container .course-table-expand {
        font-size: 0;
    }

    .course-container .course-table-expand >>> label {
        width: 150px;
        color: #99a9bf;
    }

    .course-container .course-table-expand >>> .el-form-item {
        margin-right: 0;
        margin-bottom: 0;
        width: 50%;
    }

    .course-container >>> .el-dialog {
        width: 50%;
    }

    .course-container >>> .dialog-carousel {
        width: 60%;
    }

    .course-container .panel-title .search {
        display: inline-block;
        margin-left: 10px;
    }

    .course-container .panel-title .search .el-select {
        display: inline-block;
        width: 90px;
    }

    .course-container .panel-footer {
        text-align: right;
    }

    .course-container .sort-data-container {
        width: 100%;
        text-align: center;
    }

    .course-container .sort-data-container .sort-data-item {
        position: relative;
        display: inline-block;
        margin-right: 10px;
        width: 32%;
    }

    .course-container .sort-data-container .sort-data-item .sort-item-index {
        position: absolute;
        top: 50%;
        left:50%;
        transform: translate(-50%, -50%);
        color: #ffffff;
        font-size: 50px;
    }

    .course-container .choiceness-course {
        margin-top: 10px;
        font-size: 16px;
    }

    .course-container .choiceness-course li {
        margin-bottom: 5px;
    }

    .course-container .choiceness-course li span {
        margin-right: 8px;
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 4px;
        background-color: white;
    }
</style>
