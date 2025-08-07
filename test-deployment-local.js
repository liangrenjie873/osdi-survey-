const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🚀 OSDI调查系统部署测试');
console.log('========================');
console.log('');

rl.question('请输入您的Render应用URL (例如: https://osdi-survey-xxxxx.onrender.com): ', (url) => {
    console.log('');
    console.log('🔍 开始测试您的应用...');
    console.log('');
    
    // 移除URL末尾的斜杠
    const baseURL = url.replace(/\/$/, '');
    
    console.log('📋 测试项目:');
    console.log('1. 主页面');
    console.log('2. 管理员界面');
    console.log('3. 测试页面');
    console.log('4. API健康检查');
    console.log('');
    
    console.log('🌐 测试链接:');
    console.log(`主页面: ${baseURL}`);
    console.log(`管理员界面: ${baseURL}/admin.html`);
    console.log(`测试页面: ${baseURL}/test-admin.html`);
    console.log(`API健康检查: ${baseURL}/api/health`);
    console.log('');
    
    console.log('📊 测试步骤:');
    console.log('1. 访问主页面并测试调查功能');
    console.log('2. 点击logo，输入密码: 123456');
    console.log('3. 检查管理员界面是否正常');
    console.log('4. 提交一份测试问卷');
    console.log('');
    
    console.log('🔧 如果遇到问题:');
    console.log('- 检查Render控制台的部署日志');
    console.log('- 确认所有文件都已上传');
    console.log('- 等待部署完成（可能需要几分钟）');
    console.log('');
    
    console.log('✅ 测试完成！');
    console.log('');
    console.log('📞 需要帮助？');
    console.log('- 查看Render控制台的错误日志');
    console.log('- 检查GitHub仓库是否正确连接');
    console.log('- 确认环境变量设置正确');
    
    rl.close();
}); 