# tinytiny

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

## TODOs

- [ ] 判别文件类型，使用后缀是否为 _.lowercase === [.jpg .jpeg .png ...]

- [ ] 本次任务是否tiny 图片资源

- [ ] 本次任务是否重命名 图片资源(打勾需要输入图片首名, 否则默认是default, 接下来文件名 + ' (index)')

- [ ] 本次任务是否生成的新的同级文件夹置放对应资源(同级文件夹: 之前文件名+'_tinytiny')

- [x] 当前确认使用串行执行操作