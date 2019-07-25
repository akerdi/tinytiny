# tinytiny

> An electron-vue project

#### Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build

# run unit tests
npm test


```

---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).

# Other important progress learning skill

## [use pug](https://github.com/SimulatedGREG/electron-vue/issues/702)

## [增加ElementUI](https://zhuanlan.zhihu.com/p/51586724)

## ElementUI 使用2.10.x 出现el-table 显示有问题

回退到2.4.11 版本

## position fixed X居中

```css
.style {
  left: 50%;
  transform: translateX(-50%); // 这句话可以让position fixed 的div 居中
}
```

## build

    打包mac yarn build: node .electron-vue/build.js && electron-builder

    打包win yarn build: node .electron-vue/build.js && electron-builder -w