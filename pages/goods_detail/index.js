/*
  1 发送请求获取数据
  2 点击轮播图预览大图功能
      (1)给轮播图绑定点击事件
      (2)调用小程序api  previewImage
  3 点击加入购物车
      (1)先绑定点击事件
      (2)获取缓存中的购物车数据  数组格式
      (3)先判断当前的商品是否存在购物车
          已经存在---修改商品数据  执行购物车数量++  重新把购物车数组填入缓存中
          不存在---直接给购物车数组添加一个新元素,新元素带上购买数量属性,重新把购物车数组填入缓存中
      (4)弹出用户提升
  4 商品收藏功能
    （1）页面onshow时候，加载缓存中的商品收藏数据
    （2）判断当前商品是不是被收藏
            是---改变页面标题
            不是--啥不干
     (3) 点击收藏按钮
            判断商品是否在缓存数组中
                已经存在---则删除
                不存在--把商品添加到收藏数组中，也存入缓存中
 */
import { request } from "../../request/index.js";
import regeneratorRuntime from '../../lib/runtime/runtime';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        goodsObj: {},
        // 商品是否被收藏
        isCollect: false
    },
    // 商品对象
    GoodsInfo: {},

    /**
     * 生命周期函数--监听页面加载
     */
    onShow: function() {
        let pages = getCurrentPages();
        let currentPage = pages[pages.length - 1];
        let options = currentPage.options;
        const { goods_id } = options;
        this.getGoodsDetail(goods_id);

    },
    // 获取商品的详情数据
    async getGoodsDetail(goods_id) {
        const goodsObj = await request({ url: "/goods/detail", data: { goods_id } });
        this.GoodsInfo = goodsObj;
        // 1 获取缓存中商品收藏数组
        let collect = wx.getStorageSync("collect") || [];
        // 2 判断当前当前商品是否被收藏
        let isCollect = collect.some(v => v.goods_id === this.GoodsInfo.goods_id);
        this.setData({
            goodsObj: {
                goods_name: goodsObj.goods_name,
                goods_price: goodsObj.goods_price,
                // iphone部分手机不识别webp图片格式
                // 最后找到后台,让他进行修改
                // 临时自己改 确保后台存在1.webp => 1.jpg
                goods_introduce: goodsObj.goods_introduce.replace(/\.webp/g, '.jpg'),
                pics: goodsObj.pics
            },
            isCollect
        })
    },

    // 点击轮播图放大预览
    handlePreviewImage(e) {
        //  1 先构造要预览的图片数组
        const urls = this.GoodsInfo.pics.map(v => v.pics_mid);
        // 2 接收传递过来的图片的url
        const current = e.currentTarget.dataset.url;
        wx.previewImage({
            current: current,
            urls: urls
        });
    },

    // 点击加入购物车
    handleCartAdd() {
        // console.log('购物车');
        // 1 先获取缓存中的购物车数组
        let cart = wx.getStorageSync('cart') || [];
        // 2 判断商品对象是否存在购物车数组中
        let index = cart.findIndex(v => v.goods_id === this.GoodsInfo.goods_id);
        if (index === -1) {
            // 不存在 第一次添加
            this.GoodsInfo.num = 1;
            this.GoodsInfo.checked = true;
            cart.push(this.GoodsInfo);
        } else {
            // 已经存在 购物车数据 执行num++
            cart[index].num++;
        }
        // 3 把购物车重新添加回缓存中
        wx.setStorageSync("cart", cart);
        // 4 弹窗提示
        wx.showToast({
            title: '加入购物车成功',
            icon: 'sucess',
            // true 防止用户手抖 一直点击添加按钮
            mask: true
        })
    },
    // 点击商品收藏图标
    handleCollect() {
        let isCollect = false;
        // 1 获取缓存中的商品收藏数组
        let collect = wx.getStorageSync("collect") || [];
        // 2 判断是否被收藏
        let index = collect.findIndex(v => v.goods_id === this.GoodsInfo.goods_id);
        // 3 当index != -1表示已经收藏过
        if (index !== -1) {
            // 已经收藏过  在数组中删除
            collect.splice(index, 1);
            isCollect = false;
            wx.showToast({
                title: '取消成功',
                icon: 'success',
                duration: 1500,
                mask: true,
            });
        } else {
            // 没有收藏过
            collect.push(this.GoodsInfo);
            isCollect = true;
            wx.showToast({
                title: '收藏成功',
                icon: 'success',
                duration: 1500,
                mask: true,
            });
        }
        // 4 把数组存入缓存中
        wx.setStorageSync("collect", collect);
        // 5 修改data中的属性isColect
        this.setData({
            isCollect
        })
    }
})