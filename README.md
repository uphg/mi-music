**项目预览**

https://chenning02.github.io/git-mi_music/dist/index.html 



开一个测试服务器

```
npx parcel index.html
```

将代码自动编译到待发布的 dist 文件夹：
```
npx parcel build index.html
```

处理异常

```js
setTimeout(function() {
    try {
        self.locateLyric()
    } catch (e) {
        // Handle this async error
    }
}, 1);
```

