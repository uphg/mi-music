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
    }
    start() {
        fetch('https://chenning02.github.io/Document/song/mini-music/music_list.json')
            .then(res => res.json())
            .then(data => {
                this.songList = data
                this.audio.src = this.songList[this.currentIndex].url
                this.renderSong()
            })
    }
    bind() {
        let self = this
        let actions = this.$('.songBottom > .actions')
        let playerStart = actions.querySelector('svg:nth-child(3)')
        actions.querySelector('svg:nth-child(3)').onclick = function () {
            if (this.classList.contains('open')) {
                self.audio.play()
                this.classList.remove('open')
                this.classList.add('shut')
                this.querySelector('use').setAttribute('xlink:href', '#icon-iconstop')
            } else if (this.classList.contains('shut')) {
                self.audio.pause()
                this.classList.remove('shut')
                this.classList.add('open')
                this.querySelector('use').setAttribute('xlink:href', '#icon-weibiaoti518')
            }
        }
        actions.querySelector('svg:nth-child(2)').onclick = () => {
            this.currentIndex = (this.songList.length + this.currentIndex - 1) % this.songList.length
            this.audio.src = this.songList[this.currentIndex].url
            playerStart.classList.remove('open')
            playerStart.classList.add('shut')
            playerStart.querySelector('use').setAttribute('xlink:href', '#icon-iconstop')
            this.renderSong()
            this.audio.play()
        }
        actions.querySelector('svg:nth-child(4)').onclick = () => {
            this.currentIndex = (this.currentIndex + 1) % this.songList.length
            this.audio.src = this.songList[this.currentIndex].url
            playerStart.classList.remove('open')
            playerStart.classList.add('shut')
            playerStart.querySelector('use').setAttribute('xlink:href', '#icon-iconstop')
            this.renderSong()
            this.audio.play()
        }
        this.audio.ontimeupdate = function () {
            setTimeout(function () {
                try {
                    self.locateLyric()
                } catch (e) {
                    // Handle this async error
                    console.log(e)
                }
            }, 1);
            self.setProgerssBar()
        }
        let songMain = this.$('.songMain')
        let swiper = new Swiper(songMain)
        swiper.on('swipLeft', function () {
            this.classList.add('active')
        })
        swiper.on('swipRight', function () {
            this.classList.remove('active')
        })
    }
    /* 修改歌曲信息 */
    renderSong() {
        let songObj = this.songList[this.currentIndex]
        this.$('.songTop > h2').innerText = songObj.title
        this.$('.songTop > p').innerText = songObj.author
        this.$('.songMain .square img').src = songObj.img
        this.audio.src = songObj.url
        this.audio.onloadedmetadata = () => this.$('.time-end').innerText = this.formateTime(this.audio.duration)
        this.loadLyrics()
    }
    loadLyrics() {
        fetch(this.songList[this.currentIndex].lyric)
            .then(res => res.json())
            .then(data => {
                this.setLyrics(data.lrc.lyric)
                window.lyrics = data.lrc.lyric
            })
    }

    locateLyric() {
        let currentTime = this.audio.currentTime * 1000
        let nextLineTime = this.lyricsArr[this.lyricIndex + 1][0]
        if (currentTime > nextLineTime && this.lyricIndex < this.lyricsArr.length - 1) {
            this.lyricIndex++
            let node = this.$('[data-time="' + this.lyricsArr[this.lyricIndex][0] + '"]')
            if (node) this.setLineToCenter(node)
            this.$$('.panel-effect .mini-lyric p')[0].innerText = this.lyricsArr[this.lyricIndex][1]
            this.$$('.panel-effect .mini-lyric p')[1].innerText = this.lyricsArr[this.lyricIndex + 1] ? this.lyricsArr[this.lyricIndex + 1][1] : ''
        }
    }

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


    setLineToCenter(node) {
        let offset = node.offsetTop - this.$('.panel-lyrics').offsetHeight / 2
        offset = offset > 0 ? offset : 0
        this.$('.panel-lyrics > .container').style.transform = `translateY(-${offset}px)`
        this.$$('.panel-lyrics > .container p').forEach(node => node.classList.remove('current'))
        node.classList.add('current')
    }
    setProgerssBar() {
        let percent = (this.audio.currentTime * 100 / this.audio.duration) + '%'
        this.$('.bar-area .bar .progress').style.width = percent
        this.$('.time-start').innerText = this.formateTime(this.audio.currentTime)
    }

    formateTime(secondsTotal) {
        let minutes = parseInt(secondsTotal / 60)
        minutes = minutes >= 10 ? '' + minutes : '0' + minutes
        let seconds = parseInt(secondsTotal % 60)
        seconds = seconds >= 10 ? '' + seconds : '0' + seconds
        return minutes + ':' + seconds
    }
}

new Player('#player')