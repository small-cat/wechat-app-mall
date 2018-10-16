// var postsData = require('../../data/posts-data.js')
var app = getApp()
Page({
  data: {
    //小程序总是会读取data对象来做数据绑定，这个动作我们称为动作A
    // 而这个动作A的执行，是在onLoad函数执行之后发生的
    postList: []
  },
  onLoad: function () {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain +
      '/cms/news/list',
      success: function(res) {
        var categories = []
        console.log(categories);
        console.log(res.data.data);
        if (res.data.code == 0) {
          for (var i = 0; i < res.data.data.length; i++) {
            categories.push (res.data.data[i]);
          }
          that.setData({
            postList:categories
          })
        }
      }
    })
  },

  onPostTap: function (event) {
    var postId = event.currentTarget.dataset.postid;
    // console.log("on post id is" + postId);
    wx.navigateTo({
      url: "post-detail/post-detail?id=" + postId
    })
  }
})