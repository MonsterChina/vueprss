module.exports = {
    title: '每日一题',
    description: '积跬步以至千里,积小流以成江海出处',
    base: '/learn-javascript/',
    locales: {
        '/': {
          lang: 'zh-CN'
        }
      },
    theme: 'reco',
    themeConfig: {
        subSidebar: 'auto',
        nav: [
            { text: '首页', link: '/' },
            { 
                text: '追梦人的博客', 
                items: [
                    { text: 'Github', link: 'https://monsterchina.github.io/myblog.github.io/' },
                    { text: '掘金', link: 'https://juejin.cn/user/4125023357386781/posts' }
                ]
            }
        ],
        sidebar: [
            {
                title: '前言',
                path: '/',
                collapsable: false, // 不折叠
                children: [
                    { title: "专栏介绍", path: "/" }
                ]
            },
            {
              title: "基础学习",
              path: '/handbook/myNew',
              collapsable: false, // 不折叠
              children: [
                { title: "手写一个JS中的New方法", path: "/handbook/myNew" },
                { title: "手写一个深拷贝方法", path: "/handbook/deepClone" }
              ],
            }
          ]
    },
}