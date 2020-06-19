import './iconfont.js'
import Swiper from './swiper.js'

class Player {
    constructor(node) {
        this.root = typeof node === 'string' ? document.querySelector(node) : node
        this.$ = selector => this.root.querySelector(selector)
        this.$$ = selector => this.root.querySelectorAll(selector)
        this.songList = []
        this.currentIndex = 0
        this.audio = new Audio()
        this.lyricsArr = []
        this.lyricIndex = -1
        this.start()
        this.bind()
        this.upQRcode()
    }
    // 获取数据
    start() {
        fetch('https://chenning02.github.io/Document/song/mini-music/music_list.json')
            .then(res => res.json())
            .then(data => {
                this.songList = data
                this.audio.src = this.songList[this.currentIndex].url
                this.renderSong()
            })
    }
    // 绑定事件
    bind() {
        // 此处 this 代表最外层的 new Player()
        let ancestor = this
        // 播放操作相关的按钮列表 actions
        let actions = this.$('.songBottom > .actions')
        // 随机播放开关：
        let randomOpen = 0
        // 随机播放按钮
        let random = actions.querySelector('svg:nth-child(1)')
        // 播放/暂停 按钮
        let playerStart = actions.querySelector('svg:nth-child(3)')
        // 上一首按钮
        let previous = actions.querySelector('svg:nth-child(2)')
        // 下一首按钮
        let next = actions.querySelector('svg:nth-child(4)')
        // 显示播放列表按钮
        let iconPlayList = actions.querySelector('svg:nth-child(5)')
        // 播放列表父元素
        let playlist = this.$('.playlist')
        // 播放列表ul
        let playlistUl

        // 歌曲列表切换
        fetch('https://chenning02.github.io/Document/song/mini-music/music_list.json')
            .then(res => res.json())
            .then(data => {
                let playlist = data
                let ul = document.createElement('ul')
                playlistUl = ul
                playlist.forEach(item => {
                    const li = document.createElement("li");
                    li.className = 'playli-item'
                    li.innerHTML = `<h3 class="playli-name"><span>${item.title}</span><span class="playli-author"> - ${item.author}</span></h3>
        <div class="playli-open"><svg xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true">
        <use xlink:href="#icon-guangdie"></use>
    </svg></div>`;
                    ul.appendChild(li);
                });
                ancestor.$('.playlist').appendChild(ul)
                // 歌曲列表添加点击事件
                let liList = ancestor.$$('.playlist li')
                let liArray = [...liList]
                liArray[0].classList.add('active')
                liArray.forEach((item, index) => {
                    item.addEventListener('click', (e) => {
                        e.stopPropagation()
                        liArray.forEach(el => {
                            el.classList.remove('active')
                        });
                        liArray[index].classList.add('active')
                        // 播放指定音乐
                        ancestor.audio.src = ancestor.songList[index].url
                        openClassName()
                        // 切换歌曲数据
                        let songObj = ancestor.songList[index]
                        ancestor.$('.songTop > h2').innerText = songObj.title
                        ancestor.$('.songTop > p').innerText = songObj.author
                        ancestor.$('.songMain .square img').src = songObj.img
                        ancestor.audio.src = songObj.url
                        ancestor.audio.onloadedmetadata = () => ancestor.$('.time-end').innerText = ancestor.formateTime(ancestor.audio.duration)
                        // 切换歌词
                        fetch(ancestor.songList[index].lyric)
                            .then(res => res.json())
                            .then(data => {
                                ancestor.setLyrics(data.lrc.lyric)
                                window.lyrics = data.lrc.lyric
                            })

                        ancestor.audio.play()
                    })
                });
                // 禁止事件冒泡
                playlistUl.addEventListener('click', function(e){
                    e.stopPropagation()
                })
            })

        // 播放/暂停 按钮点击事件
        playerStart.onclick = function () {
            // 当前被点击元素
            let element = this
            if (element.classList.contains('open')) {
                ancestor.audio.play()
                openClassName()
            } else if (element.classList.contains('shut')) {
                ancestor.audio.pause()
                element.classList.remove('shut')
                element.classList.add('open')
                element.querySelector('use').setAttribute('xlink:href', '#icon-weibiaoti518')
            }
        }
        // 上一首 按钮事件
        previous.onclick = () => {
            ancestor.currentIndex = (ancestor.songList.length + ancestor.currentIndex - 1) % ancestor.songList.length
            this.audio.src = ancestor.songList[ancestor.currentIndex].url
            openClassName()
            this.renderSong()
            this.audio.play()
            let liList = ancestor.$$('.playlist li')
            let liArray = [...liList]
            liArray.forEach(el => {
                el.classList.remove('active')
            });
            liArray[ancestor.currentIndex].classList.add('active')
        }
        // 下一首 按钮事件
        next.onclick = () => {
            ancestor.currentIndex = (ancestor.currentIndex + 1) % ancestor.songList.length
            this.audio.src = ancestor.songList[ancestor.currentIndex].url
            openClassName()
            this.renderSong()
            this.audio.play()
            let liList = ancestor.$$('.playlist li')
            let liArray = [...liList]
            liArray.forEach(el => {
                el.classList.remove('active')
            });
            liArray[ancestor.currentIndex].classList.add('active')
        }
        this.audio.ontimeupdate = function () {
            setTimeout(function () {
                try {
                    ancestor.locateLyric()
                } catch (e) {
                    // Handle this async error
                    // console.log(e)
                }
            }, 0);
            ancestor.setProgerssBar()
        }
        // 滑动切换歌词/封面
        let songMain = ancestor.$('.songMain')
        let swiper = new Swiper(songMain)
        swiper.on('swipLeft', function () {
            this.classList.add('active')
        })
        swiper.on('swipRight', function () {
            this.classList.remove('active')
        })
        // 使按钮变为播放状态
        let openClassName = () => {
            playerStart.classList.remove('open')
            playerStart.classList.add('shut')
            playerStart.querySelector('use').setAttribute('xlink:href', '#icon-iconstop')
        }
        // 点击显示播放列表
        iconPlayList.onclick = function () {
            // listOpen = true
            playlist.classList.add('active')
            playlistUl.classList.add('active')

        }
        // 点击隐藏播放列表
        playlist.onclick = function () {
            playlist.classList.remove('active')
            playlistUl.classList.remove('active')
        }
        // 自动播放下一首
        ancestor.audio.addEventListener("ended", function(){
            // 判断歌曲播放方式：顺序 0，随机 1，单曲循环 2
            if(randomOpen===0){
                // 顺序播放
                ancestor.currentIndex = (ancestor.currentIndex + 1) % ancestor.songList.length
            }else if(randomOpen===1){
                // 随机播放
                let width = ancestor.songList.length
                let a = parseInt(Math.random() * width + 1, 10);
                if(a===ancestor.currentIndex){
                    a = a + 1
                }
                ancestor.currentIndex = a % width
            } else if(randomOpen===2){
                // 单曲循环
                ancestor.currentIndex = ancestor.currentIndex
            }
            // 切换歌曲信息
            ancestor.audio.src = ancestor.songList[ancestor.currentIndex].url
            openClassName()
            ancestor.renderSong()
            ancestor.audio.play()
            let liList = ancestor.$$('.playlist li')
            let liArray = [...liList]
            liArray.forEach(el => {
                el.classList.remove('active')
            });
            liArray[ancestor.currentIndex].classList.add('active')
        });
        // 随机播放
        random.onclick = function(){
            randomOpen = (randomOpen + 1) % 3
            if(randomOpen===0){
                random.querySelector('use').setAttribute('xlink:href', '#icon-cycle')
            } else if (randomOpen===1){
                random.querySelector('use').setAttribute('xlink:href', '#icon-random')
            } else if (randomOpen===2){
                random.querySelector('use').setAttribute('xlink:href', '#icon-Single')
            }
        }
    }
    /* 修改歌曲信息 */
    renderSong() {
        // 此处 this 代表最外层的 new Player()
        let ancestor = this
        let songObj = ancestor.songList[ancestor.currentIndex]
        ancestor.$('.songTop > h2').innerText = songObj.title
        ancestor.$('.songTop > p').innerText = songObj.author
        ancestor.$('.songMain .square img').src = songObj.img
        ancestor.audio.src = songObj.url
        ancestor.audio.onloadedmetadata = () => ancestor.$('.time-end').innerText = ancestor.formateTime(ancestor.audio.duration)
        ancestor.loadLyrics()
    }
    // 获取指定歌曲歌词列表
    loadLyrics() {
        fetch(this.songList[this.currentIndex].lyric)
            .then(res => res.json())
            .then(data => {
                this.setLyrics(data.lrc.lyric)
                window.lyrics = data.lrc.lyric
            })
    }
    // 歌词滚动
    locateLyric() {
        let currentTime = this.audio.currentTime * 1000
        let nextLineTime = this.lyricsArr[this.lyricIndex + 1][0]
        if (currentTime > nextLineTime && this.lyricIndex < this.lyricsArr.length - 1) {
            this.lyricIndex++
            let node = this.$('[data-time="' + this.lyricsArr[this.lyricIndex][0] + '"]')
            if (node) { this.setLineToCenter(node) }
            this.$$('.panel-effect .mini-lyric p')[0].innerText = this.lyricsArr[this.lyricIndex][1]
            this.$$('.panel-effect .mini-lyric p')[1].innerText = this.lyricsArr[this.lyricIndex + 1] ? this.lyricsArr[this.lyricIndex + 1][1] : ''
        }
    }
    // 利用正则筛选歌词
    setLyrics(lyrics) {
        this.lyricIndex = 0
        let fragment = document.createDocumentFragment()
        let lyricsArr = []
        this.lyricsArr = lyricsArr
        lyrics.split(/\n/)
            .filter(str => str.match(/\[.+?\]/))
            .forEach(line => {
                let str = line.replace(/\[.+?\]/g, '')
                line.match(/\[.+?\]/g).forEach(t => {
                    t = t.replace(/[\[\]]/g, '')
                    let milliseconds = parseInt(t.slice(0, 2)) * 60 * 1000 + parseInt(t.slice(3, 5)) * 1000 + parseInt(t.slice(6))
                    lyricsArr.push([milliseconds, str])
                })
            })

        lyricsArr.filter(line => line[1].trim() !== '').sort((v1, v2) => {
            if (v1[0] > v2[0]) {
                return 1
            } else {
                return -1
            }
        }).forEach(line => {
            let node = document.createElement('p')
            node.setAttribute('data-time', line[0])
            node.innerText = line[1]
            fragment.appendChild(node)
        })
        this.$('.panel-lyrics .container').innerHTML = ''
        this.$('.panel-lyrics .container').appendChild(fragment)
    }
    // 歌词滚动
    setLineToCenter(node) {
        let offset = node.offsetTop - this.$('.panel-lyrics').offsetHeight / 3
        offset = offset > 0 ? offset : 0
        this.$('.panel-lyrics > .container').style.transform = `translateY(-${offset}px)`
        this.$$('.panel-lyrics > .container p').forEach(node => node.classList.remove('current'))
        node.classList.add('current')
    }
    // 播放进度条
    setProgerssBar() {
        let percent = (this.audio.currentTime * 100 / this.audio.duration) + '%'
        this.$('.bar-area .bar .progress').style.width = percent
        this.$('.time-start').innerText = this.formateTime(this.audio.currentTime)
    }
    // 将时间转为 00:00 格式
    formateTime(secondsTotal) {
        let minutes = parseInt(secondsTotal / 60)
        minutes = minutes >= 10 ? '' + minutes : '0' + minutes
        let seconds = parseInt(secondsTotal % 60)
        seconds = seconds >= 10 ? '' + seconds : '0' + seconds
        return minutes + ':' + seconds
    }
    // 二维码层
    upQRcode() {
        let $q = selector => document.querySelector(selector)
        let open = false
        let parent = $q('.QRcode')
        let child = $q('.QRcode .child')
        let collapse = $q('.QRcode .collapse')
        let content = $q('.QRcode .content')
        collapse.onclick = function () {
            open = !open
            collapse.classList.toggle('active')
            child.classList.toggle('active')
            parent.classList.toggle('active')
            if (open) {
                content.innerHTML = '展开'
            } else {
                content.innerHTML = '收起'
            }
        }
    }
}

new Player('#player')