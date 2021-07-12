/*
    1 用户上滑页面 滚动条触底开始加载下一页数据
        （1）找到滚动条触底事件----微信小程序官方开发文档中找
        （2）判断还有没有下一页数据
                i 获取到总页数  只有总条数
                    总页数=Math.ceil(总条数/页容量pagesize)
                ii 获取到当前的页面  pagenum
                iii 判断当前的页码是否大于等于总页数
        （3）没有下一页数据----弹出提示框
        （4）有下一页数据---加载下一页数据
                i 当前页码++
                ii 重新发送请求
                iii 数据请求回来 要对data中的数组进行拼接 而不是全部替换
    
    2 下拉刷新页面
        （1）触发下拉刷新事件--需要在json文件中开启一个配置项
                找到触发下拉刷新事件
        （2）重置数据数组
        （3）重置页码为1
        （4）重新发送请求
         (5) 数据回来了，需要手动关闭等待效果
 */
import { request } from "../../request/index.js";
import regeneratorRuntime from '../../lib/runtime/runtime';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        tabs: [{
                id: 0,
                value: "综合",
                isActive: true
            },
            {
                id: 1,
                value: "销量",
                isActive: false
            },
            {
                id: 2,
                value: "价格",
                isActive: false
            }
        ],
        goodsList: []
    },
    // 接口要的参数
    QueryParams: {
        query: "",
        cid: "",
        pagenum: 1,
        pagesize: 10
    },
    // 总页数
    totalPage: 1,

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.QueryParams.cid = options.cid || "";
        this.QueryParams.query = options.query || "";
        this.getGoodsList();
    },
    //获取商品列表数据
    async getGoodsList() {
        const res = await request({ url: "/goods/search", data: this.QueryParams });
        // 获取总条数
        const total = res.total;
        // 计算总页数
        this.totalPage = Math.ceil(total / this.QueryParams.pagesize);
        this.setData({
            // 拼接了的数组
            goodsList: [...this.data.goodsList, ...res.goods]
        })

        // 关闭下拉刷新窗口 如果没有调用下拉刷新窗口，直接关闭也不会报错
        wx.stopPullDownRefresh();
    },

    // 标题点击事件 从子组件传递过来的
    handleTabsItemChange(e) {
        // 1 获取被点击的标题索引
        const { index } = e.detail;
        // 2 修改原数组
        let { tabs } = this.data;
        tabs.forEach((v, i) => i === index ? v.isActive = true : v.isActive = false);
        // 3 赋值到data中
        this.setData({
            tabs: tabs
        })
    },

    // 页面上滑 滚动条触底事件
    onReachBottom() {
        // 判断还有没有下一页数据
        if (this.QueryParams.pagenum >= this.totalPage) {
            // 没有下一页数据
            // console.log("没有下一页数据");
            wx.showToast({
                title: '没有更多数据了',
            });
        } else {
            // 有下一页数据
            this.QueryParams.pagenum++;
            this.getGoodsList();
        }
    },

    // 下拉刷新事件
    onPullDownRefresh() {
        // 1 重置数据数组
        this.setData({
            goodsList: []
        });
        // 2 重置页码为1
        this.QueryParams.pagenum = 1;
        // 3 重新发送请求
        this.getGoodsList();
    }

})