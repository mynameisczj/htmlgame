class LossAversionExperiment {
    constructor() {
        this.balance = 1000;
        this.history = [this.balance];
        this.rounds = 0;
        this.win_count = 0;
        this.loss_count = 0;
        this.userChoices = [];
        this.chart = null;
        
        // 初始化UI元素
        this.startBtn = document.getElementById('start-btn');
        this.choiceButtons = document.querySelectorAll('[data-choice]');
        this.choiceContainer = document.getElementById('choice-buttons');
        this.balanceDisplay = document.getElementById('balance-display');
        this.resultOutput = document.getElementById('result-output');
        this.consentForm = document.getElementById('consent-form');
        this.submitDataBtn = document.getElementById('submit-data-btn');
        this.consentCheckbox = document.getElementById('consent-checkbox');
        
        // 初始化图表
        this.initChart();
        
        // 绑定事件
        this.startBtn.addEventListener('click', () => this.startExperiment());
        this.choiceButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const choice = parseInt(e.target.getAttribute('data-choice'));
                this.makeChoice(choice);
            });
        });
        this.submitDataBtn.addEventListener('click', () => this.submitData());
        this.consentCheckbox.addEventListener('change', (e) => {
            this.submitDataBtn.disabled = !e.target.checked;
        });
    }
    
    startExperiment() {
        this.startBtn.classList.add('hidden');
        this.choiceContainer.classList.remove('hidden');
        this.resultOutput.textContent = "实验开始！请做出你的选择...";
    }
    
    makeChoice(choiceIdx) {
        this.rounds++;
        this.userChoices.push(choiceIdx);
        let result = "";
        
        // 处理不同选择
        if (choiceIdx === 0) {  // 50%赢得200元
            if (Math.random() < 0.5) {
                this.balance += 200;
                result = "恭喜！你赢得了200元！";
                this.win_count++;
            } else {
                result = "很遗憾，这次没有赢得奖金。";
            }
        } else if (choiceIdx === 1) {  // 100%赢得100元
            this.balance += 100;
            result = "你获得了100元！";
            this.win_count++;
        } else if (choiceIdx === 2) {  // 50%损失200元
            if (Math.random() < 0.5) {
                this.balance -= 200;
                result = "糟糕！你损失了200元！";
                this.loss_count++;
            } else {
                result = "幸运！这次没有损失。";
            }
        } else if (choiceIdx === 3) {  // 100%损失100元
            this.balance -= 100;
            result = "你损失了100元。";
            this.loss_count++;
        }
        
        // 更新显示
        this.history.push(this.balance);
        this.balanceDisplay.textContent = `当前余额: ${this.balance}元`;
        
        this.resultOutput.innerHTML = `
            <p>第${this.rounds}轮结果: ${result}</p>
            <p>当前余额: ${this.balance}元</p>
            <p>获胜次数: ${this.win_count}次</p>
            <p>损失次数: ${this.loss_count}次</p>
        `;
        
        this.updateChart();
        
        // 检查游戏结束条件
        if (this.balance <= 0 || this.rounds >= 20) {
            this.choiceButtons.forEach(btn => {
                btn.disabled = true;
            });
            
            if (this.balance <= 0) {
                this.resultOutput.innerHTML += '<p>游戏结束！你的资金已耗尽。</p>';
            } else {
                this.resultOutput.innerHTML += `
                    <p>实验结束！感谢参与。</p>
                    <p>心理学分析：</p>
                    <p>大多数人更倾向于选择B(确定的收益)而非A(风险收益)，</p>
                    <p>同时更倾向于选择C(风险损失)而非D(确定损失)，</p>
                    <p>这体现了人们对损失的厌恶大于对同等收益的喜爱。</p>
                `;
            }
            
            // 显示数据提交表单
            this.consentForm.classList.remove('hidden');
        }
    }
    
    initChart() {
        const ctx = document.getElementById('balance-chart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array(this.history.length).fill(''),
                datasets: [{
                    label: '资金余额',
                    data: this.history,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }
    
    updateChart() {
        this.chart.data.labels = Array(this.history.length).fill('');
        this.chart.data.datasets[0].data = this.history;
        this.chart.update();
    }
    
    submitData() {
        if (!this.consentCheckbox.checked) return;
        
        // 准备数据
        const now = new Date();
        const title = `实验数据 - ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
        
        const body = `
## 实验结果概览
- 最终余额: ${this.balance}元
- 总轮次: ${this.rounds}
- 获胜次数: ${this.win_count}
- 损失次数: ${this.loss_count}

## 详细选择记录
${this.userChoices.map((choice, index) => `轮次 ${index + 1}: ${this.getChoiceDescription(choice)}`).join('\n')}

## 资金变化历史
${this.history.join(' → ')}

### 选择对应关系
0: 选择A - 50%赢得200元  
1: 选择B - 100%赢得100元  
2: 选择C - 50%损失200元  
3: 选择D - 100%损失100元

*数据提交时间: ${now.toLocaleString()}*
        `;
        
        // 填充表单并提交
        document.getElementById('issue-title').value = title;
        document.getElementById('issue-body').value = body;
        document.getElementById('data-form').submit();
        
        // 禁用提交按钮防止重复提交
        this.submitDataBtn.disabled = true;
        this.submitDataBtn.textContent = '数据已提交，谢谢！';
    }
    
    getChoiceDescription(choiceIdx) {
        const descriptions = [
            "选择A: 50%赢得200元",
            "选择B: 100%赢得100元",
            "选择C: 50%损失200元",
            "选择D: 100%损失100元"
        ];
        return descriptions[choiceIdx];
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    window.game = new LossAversionExperiment();
});