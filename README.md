**项目预览**

https://chenning02.github.io/git-mi_music/dist/index.html 

**效果图**

开启一个测试服务器

```
npx parcel index.html
```

将代码自动编译到待发布的 dist 文件夹：
```
npx parcel build index.html
```

注意：上传到 GitHub 时要执行这句代码，来更改路径问题，不然 GitHub 预览没有效果

```sh
npx parcel build index.html --public-url ./
```

> 更改之前最好删除之前的 dist 文件夹

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

