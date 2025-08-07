const https = require('https');
const http = require('http');

function checkURL(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        
        const req = client.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: data
                });
            });
        });
        
        req.on('error', (err) => {
            reject(err);
        });
        
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

async function testDeployment(baseURL) {
    console.log('🧪 开始测试云端部署...\n');
    
    const tests = [
        { name: '主页面', url: baseURL },
        { name: '管理员界面', url: `${baseURL}/admin.html` },
        { name: 'API健康检查', url: `${baseURL}/api/health` },
        { name: '静态文件', url: `${baseURL}/style.css` }
    ];
    
    for (const test of tests) {
        try {
            console.log(`📋 测试: ${test.name}`);
            const result = await checkURL(test.url);
            
            if (result.statusCode === 200) {
                console.log(`✅ ${test.name}: 正常 (${result.statusCode})`);
            } else {
                console.log(`⚠️  ${test.name}: 状态码 ${result.statusCode}`);
            }
        } catch (error) {
            console.log(`❌ ${test.name}: 错误 - ${error.message}`);
        }
        console.log('');
    }
    
    console.log('🎉 测试完成！');
    console.log(`🌐 您的应用URL: ${baseURL}`);
    console.log(`📊 管理员界面: ${baseURL}/admin.html`);
    console.log('\n📋 下一步:');
    console.log('1. 访问主页面测试调查功能');
    console.log('2. 提交一份测试问卷');
    console.log('3. 在管理员界面查看数据');
    console.log('4. 分享URL给其他人测试');
}

// 如果直接运行此脚本
if (require.main === module) {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    rl.question('请输入您的Render应用URL: ', (url) => {
        rl.close();
        testDeployment(url);
    });
}

module.exports = { checkURL, testDeployment }; 