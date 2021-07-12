// pages/fate/fate.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        score: 0,
    },

    // 点击事件 从子组件传递过来的
    handleScoreChange(e) {
        console.log(e);
        this.setData({
            score: e.detail.value,
        })
    }

})