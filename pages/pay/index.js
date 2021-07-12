/*
  1 页面要加载的时候
    (1)从缓存中获取购物车数据 渲染到页面中
      这些数据的 check=true
  2 微信支付
    (1) 哪些人 哪些账号可以实现微信支付
        i 企业账号 
        ii 企业账号的小程序后台中必须给开发者添加上白名单
            一个appid可以绑定多个开发者
            这些开发者可以共用appid和它的开发权限
  3 支付按钮
    (1)判断缓存中有没有token
        没有token--跳转到授权页面 进行token获取
        有token--
            创建订单，获取订单编号
    (2)已经完成了微信支付
   （3）手动删除缓存中 已经被选中了的商品
   （4）删除后的购物车数据 填充回缓存
   （5）再跳转页面

*/
import { request } from "../../request/index.js";
import { getSetting, chooseAddress, openSetting, showModal, showToast, requestPayment } from "../../utils/asyncWX.js";
import regeneratorRuntime from '../../lib/runtime/runtime';
Page({
    data: {
        address: {},
        cart: [],
        totalPrice: 0,
        totalNum: 0
    },
    onShow() {
        // 1 获取缓存中的收货地址信息
        const address = wx.getStorageSync("address");
        // 获取缓存中的购物车数据
        let cart = wx.getStorageSync("cart") || [];
        // 过滤后的购物车数组
        cart = cart.filter(v => v.checked);
        this.setData({ address });
        // 总价格 总数量
        let totalPrice = 0;
        let totalNum = 0;
        cart.forEach(v => {
            totalPrice += v.num * v.goods_price;
            totalNum += v.num;
        });
        this.setData({
            cart,
            totalPrice,
            totalNum,
            address
        });
    },
    // 点击支付
    async handleOrderPay() {
        try {
            // 1 判断缓存有没有token
            const token = wx.getStorageSync("token");
            if (!token) {
                wx.navigateTo({
                    url: '/pages/auth/index',
                });
                return;
            }
            // 2 创建订单
            // 2.1 准备创建订单的 请求头参数
            // const header = { Authorization: token };
            // 2.2 准备请求体参数
            const order_price = this.data.totalPrice;
            const consignee_addr = this.data.address.all;
            const cart = this.data.cart;
            let goods = [];
            cart.forEach(v => goods.push({
                goods_id: v.goods_id,
                goods_number: v.num,
                goods_price: v.goods_price
            }));
            const orderParams = { order_price, consignee_addr, goods };
            // 3 准备发送请求 创建订单 获取订单编号
            const { order_number } = await request({ url: "/my/orders/create", method: "POST", data: orderParams, });
            // 4 发起预支付接口
            const { pay } = await request({ url: "/my/orders/req_unifiedorder", method: "POST", data: { order_number } });
            // 5 发起微信支付
            await requestPayment(pay);
            // 6 查询后台 订单状态
            const res = await request({ url: "/my/orders/chkOrder", method: "POST", data: { order_number } });
            await showToast({ title: "支付成功" });
            // 7 手动删除缓存中已经支付了的商品
            let newCart = wx.getStorageSync("cart");
            newCart = newCart.filter(v => !v.checked);
            wx.setStorageSync("cart", newCart);
            // 7 支付成功了 跳转到订单页面
            wx.navigateTo({
                url: '/pages/order/index'
            });

        } catch (error) {
            await showToast({ title: "支付失败" });
            console.log(error);
        }
    }
})