// components/fate/fate.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {

    },

    /**
     * 组件的初始数据
     */
    data: {
        grayScore: 5,
        redScore: 0,
    },

    /**
     * 组件的方法列表
     */
    methods: {
        giveScore(e) {
            var redIndex = e.currentTarget.dataset.redindex;
            var grayIndex = e.currentTarget.dataset.grayindex;
            console.log("redIndex:" + redIndex);
            console.log("grayIndex:" + grayIndex);

            var m_redScore = this.data.redScore;
            var m_grayScore = this.data.grayScore;

            if (grayIndex != undefined) {
                m_redScore += grayIndex + 1;
                m_grayScore = 5 - m_redScore;
            }
            if (redIndex != undefined) {
                m_redScore = redIndex + 1;
                m_grayScore = 5 - m_redScore;
            }

            this.setData({
                redScore: m_redScore,
                grayScore: m_grayScore
            });
            this.triggerEvent('scoreChange', { m_redScore });
        }
    }
})