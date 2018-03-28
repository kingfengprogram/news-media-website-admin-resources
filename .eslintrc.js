// https://eslint.org/docs/user-guide/configuring

module.exports = {
    root: true,
    parserOptions: {
        parser: 'babel-eslint'
    },
    env: {
        browser: true,
    },
    extends: [
        // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
        // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
        'plugin:vue/essential',
        // https://github.com/standard/standard/blob/master/docs/RULES-en.md
        'standard'
    ],
    // required to lint *.vue files
    plugins: [
        'vue'
    ],
    // add your custom rules here
    rules: {
        'generator-star-spacing': 'off', // allow async-await
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off', // allow debugger during development
        'no-alert': 0, // 禁止使用alert confirm prompt
        'no-const-assign': 2, // 禁止修改const声明的变量
        'no-constant-condition': 2, // 禁止在条件中使用常量表达式 if(true) if(1)
        'no-continue': 0, // 禁止使用continue
        'no-dupe-keys': 2, // 在创建对象字面量时不允许键重复 {a:1,a:1}
        'no-duplicate-case': 2, // switch中的case标签不能重复
        'no-dupe-args': 2, // 函数参数不能重复
        'no-eq-null': 2, // 禁止对null使用==或!=运算符
        'no-eval': 1, // 禁止使用eval
        'no-ex-assign': 2, // 禁止给catch语句中的异常参数赋值
        'no-extend-native': 2, // 禁止扩展native对象
        'no-extra-bind': 2, // 禁止不必要的函数绑定
        'no-extra-boolean-cast': 2, // 禁止不必要的bool转换
        'no-extra-parens': 2, // 禁止非必要的括号
        'no-extra-semi': 2, // 禁止多余的冒号
        'no-fallthrough': 1, // 禁止switch穿透
        'no-func-assign': 2, // 禁止重复的函数声明
        'no-implicit-coercion': 1, // 禁止隐式转换
        'no-implied-eval': 2, // 禁止使用隐式eval
        'no-inner-declarations': [2, 'functions'], // 禁止在块语句中使用声明（变量或函数）
        'no-lonely-if': 2, // 禁止else语句内只有if语句
        'no-loop-func': 1, // 禁止在循环中使用函数（如果没有引用外部变量不形成闭包就可以）
        'no-multiple-empty-lines': [1, {'max': 2}], // 空行最多不能超过2行
        'no-nested-ternary': 0, // 禁止使用嵌套的三目运算
        'no-new-func': 1, // 禁止使用new Function
        'no-new-object': 2, // 禁止使用new Object()
        'no-new-require': 2, // 禁止使用new require
        'no-plusplus': 0, // 禁止使用++，--
        'no-proto': 2, // 禁止使用__proto__属性
        'no-redeclare': 2, // 禁止重复声明变量
        'no-script-url': 0, // 禁止使用javascript:void(0)
        'no-self-compare': 2, // 不能比较自身
        'no-spaced-func': 2, // 函数调用时 函数名与()之间不能有空格
        'no-sync': 0, // nodejs 禁止同步方法
        'no-undef': 1, // 不能有未定义的变量
        'no-undef-init': 2, // 变量初始化时不能直接给它赋值为undefined
        'no-undefined': 2, // 不能使用undefined
        'no-unreachable': 2, // 不能有无法执行的代码
        // 'no-unused-vars': [2, {'vars': 'all', 'args': 'after-used'}], // 不能有声明后未被使用的变量或参数
        'no-use-before-define': 2, // 未定义前不能使用
        'no-var': 0, // 禁用var，用let和const代替
        'no-with': 2, // 禁用with
        'camelcase': 2, // 强制驼峰法命名
        'comma-dangle': [2, 'never'], // 对象字面量项尾不能有逗号
        'comma-spacing': 0, // 逗号前后的空格
        'comma-style': [2, 'last'], // 逗号风格，换行时在行首还是行尾
        'curly': [2, 'all'], // 必须使用 if(){} 中的{}
        'default-case': 2, // switch语句最后必须有default
        'eqeqeq': 2, // 必须使用全等
        'indent': [2, 4], // 缩进风格
        'init-declarations': 0, // 声明时必须赋初值
        'radix': 2, // parseInt必须指定第二个参数
        'semi': [2, 'always'], // 语句强制分号结尾
        'strict': 2 // 使用严格模式
    }
}
