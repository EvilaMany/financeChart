import * as Utils from "./staff/utils"

import Sidebar from "./Components/Sidebar"
import Timeline from "./Components/Timeline"
import Area from "./Components/Area"
import Grid from "./Components/Grid"
import Canvas from "./Components/Canvas/Canvas"
import Preloader from "./Components/Preloader"

import Crosshair from './Components/Crosshair'
import CurrentPrice from './Components/CurrentPrice'
import Candlesticks from "./Charts/Candlesticks.js"
import LineChart from "./Charts/Line.js"

import Animator from "./staff/Animator.js";

class FinanceChart {
    get mainChart() {
        return this.charts[0]
    }

    constructor(container, config) {
        this.destroyed = false
        this.config = {
            backgroundColor: "#222128",
            textColor: "rgb(158,158,158)",
            fontSize: 11,
            eraserColor: '#222128',

            timeline: {
                height: undefined,
                fontSize: 11,
                textColor: "rgb(158,158,158)",
                backgroundColor: '#222128',

                range: {
                    from: new Date().getTime() - 1000000,
                    to: new Date().getTime() + 1000000,
                    minRange: 60,
                    maxRange: Infinity,
                    beyond: {
                        before: 70, // percent
                        after: 70 // percent
                    }
                }

            },
            sidebar: {
                width: undefined,
                fontSize: 11,
                textColor: "rgb(158,158,158)",
                backgroundColor: '#222128',

                range: {
                    paddingFrom: 5,
                    paddingTo: 5,
                    from: 0,
                    to: 100
                }
            },
            area: {
                backgroundColor: '#222128'
            },
            crosshair: {
                lineDash: [5, 5],
                lineColor: 'rgba(255,255,255,0.5)',
                lineWidth: '1'
            },
            currentPrice: {
                lineColor: 'rgba(8,158,196,1)',
                lineWidth: '2',
                labelBackgroundColor: '#089ec4',
                labelColor: 'white',
                labelFontSize: '12',

                dotColor: 'rgba(8,158,196,1)',
                dotRadius: '6',

                dotShadowColor: 'rgba(8,158,196,1)',
                dotShadowRadius: '20',
                dotShadowDuration: 1200
            },
            grid: {
                lineWidth: '1',
                lineColor: 'rgba(255,255,255,0.05)',
                xColor: '',
                yColor: ''
            },
            preloader: {
                backgroundColor: 'black',
                color: 'rgba(255,255,255,0.8)'
            }
        }
        Utils.assign(this.config, config)

        this.renderable = []
        this.charts = []

        this.timeRange = {
            ...this.config.timeline.range
        }
        this.priceRange = {
            ...this.config.sidebar.range
        }



        this.Canvas = new Canvas(container)

        this.Animator = new Animator()



        this.calcComponentsDimensions()
        this.Timeline = new Timeline(this.config.timeline, this.timeRange, this.Canvas, this)
        this.Sidebar = new Sidebar(this.config.sidebar, this.priceRange, this.Canvas, this)
        this.Area = new Area(this.config.area, this.Canvas, this)
        this.Grid = new Grid(this.config.grid, this.Canvas, this.Timeline._labelPositions, this.Sidebar._labelPositions, this)
        this.Crosshair = new Crosshair(this.config.crosshair, this.Canvas, this)
        this.CurrentPrice = new CurrentPrice(this.config.currentPrice, this.Canvas, this)
        this.Preloader = new Preloader(this.config.preloader, this.Canvas, this)

        this.renderable.push({
            el: this.Area,
            z: -100
        })
        this.renderable.push({
            el: this.Timeline,
            z: 2000
        })
        this.renderable.push({
            el: this.Sidebar,
            z: 1001
        })
        this.renderable.push({
            el: this.Grid,
            z: -50
        })
        this.renderable.push({
            el: this.Crosshair,
            z: -25
        })
        this.renderable.push({
            el: this.CurrentPrice,
            z: 1500
        })
        this.renderable.push({
            el: this.Preloader,
            z: -30
        })


        this.bindEvents()
        this.bindWindowResize()

        let c = window.c

        requestAnimationFrame(function animation() {
            console.log('Anim')
            if (this.destroyed) return;

            if (this.needSidebarCalcRenderLabels) {
                this.Sidebar.calcRenderLabels()
                this.needSidebarCalcRenderLabels = 0
            }
            if (this.needTimelineCalcRenderLabels) {
                this.Timeline.calcRenderLabels()
                this.needTimelineCalcRenderLabels = 0
            }
            this.render()
            requestAnimationFrame(animation.bind(this))
        }.bind(this))

    }

    calcComponentsDimensions() {
        let timeline = {},
            sidebar = {},
            area = {}

        timeline.width = this.Canvas._canvas.width;
        timeline.height = this.config.timeline.height || Utils.getTextWidth('20', this.config.fontSize) * 2;
        timeline.x = 0;
        timeline.y = this.Canvas._canvas.height - timeline.height;
        this.config.timeline = Object.assign(this.config.timeline, timeline)

        sidebar.width = this.config.sidebar.width || (Utils.getTextWidth('3030.33333', this.config.fontSize) + 10)
        sidebar.height = this.Canvas._canvas.height - timeline.height
        sidebar.x = this.Canvas._canvas.width - sidebar.width
        sidebar.y = 0
        this.config.sidebar = Object.assign(this.config.sidebar, sidebar)

        area.x = 0
        area.y = 0
        area.width = this.Canvas._canvas.width - sidebar.width
        area.height = this.Canvas._canvas.height - timeline.height

        this.config.area = Object.assign(this.config.area, area)
    }

    render() {
        this.Canvas.ctx.fillStyle = this.config.eraserColor
        this.Canvas.ctx.clearRect(0, 0, this.Canvas.config.width, this.Canvas.config.height)
        this.Canvas.ctx.fillRect(0, 0, this.Canvas.config.width, this.Canvas.config.height)
        this.renderable.sort((a, b) => (a.z - b.z)).forEach((item) => {
            item.el.render()
        })
    }


    bindWindowResize() {
        window.addEventListener('resize', e => {
            this.Canvas.checkSize()
            this.calcComponentsDimensions()

            this.Sidebar.calcRenderLabels()
            this.Timeline.calcRenderLabels()
        })
    }

    bindEvents() {
        this.Canvas.Events.addEmiter('timeline', (x, y) => {
                return Utils.dotInRect(x, y, this.config.timeline.x, this.config.timeline.y, this.config.timeline.width, this.config.timeline.height)
            })
            .addEmiter('sidebar', (x, y) => {
                return Utils.dotInRect(x, y, this.config.sidebar.x, this.config.sidebar.y, this.config.sidebar.width, this.config.sidebar.height)
            })
            .addEmiter('area', (x, y) => {
                return Utils.dotInRect(x, y, this.config.area.x, this.config.area.y, this.config.area.width, this.config.area.height)
            })
            .addEmiter('timezone', (x, y) => {
                return Utils.dotInRect(x, y, this.config.area.x, this.config.area.y, this.config.area.width, (this.config.area.height + this.config.timeline.height))
            })

        this.bindScrollTimearea()
        this.bindScaleTimearea()
    }

    checkLoadingSeriesNeed() {
        if (this.mainChart &&
            (this.mainChart.series[0][0] > this.timeRange.from || this.timeRange.from - this.mainChart.series[0][0] < (this.timeRange.to - this.timeRange.from * 2)) &&
            this.mainChart.config.loadCallback
        ) {
            this.mainChart.config.loadCallback(this.timeRange.from - (this.timeRange.to - this.timeRange.from), this.mainChart.series[0][0])
        }

    }

    bindScrollTimearea() {

        let backMouseX, backMouseY, backTimestamp;
        let mousepressed = 0

        this.Canvas.canvas.addEventListener('timezone:pointerdown', (e) => {
            mousepressed = 1
            console.log('MOUSEDOWN')
        })

        let moveHandler = (e) => {
            if(!/touch/.test(e.type)) e.preventDefault()
            let clientX = e.clientX
            let clientY = e.clientY
            if (e.type == 'touchmove') {
                clientX = e.touches[0].clientX
                clientY = e.touches[0].clientY
            }

            if (mousepressed && backMouseX && backMouseY && backTimestamp) {
                //насколько переместился курсор по сравнению с прежним срабатыванием
                let moveX = (clientX - backMouseX) / this.config.area.width
                let moveY = (clientY - backMouseY) / this.config.area.height


                let moveTimestamp = e.timeStamp - backTimestamp
                let from = this.Timeline.range.from - (this.Timeline.range.to - this.Timeline.range.from) * (moveX)
                let to = this.Timeline.range.to - (this.Timeline.range.to - this.Timeline.range.from) * (moveX)


                let leftBeyondPercent = Utils.getShareOfRange(this.mainChart.config.series[0][0], from, to) * 100
                let rightBeyondPercent = 100 - Utils.getShareOfRange(this.mainChart.config.series[this.mainChart.config.series.length - 1][0], from, to) * 100

                //проверяем что график выходит за границы в допустимых пределах
                if ((leftBeyondPercent <= this.timeRange.beyond.before || moveX < 0) &&
                    (rightBeyondPercent <= this.timeRange.beyond.after || moveX > 0)) {
                    this.Animator.stopPropertyAnimation(this.timeRange)
                    this.Timeline.range.from = from
                    this.Timeline.range.to = to
                    this.needTimelineCalcRenderLabels = 1
                    this.checkSidebarVisibility()
                    this.checkLoadingSeriesNeed()

                    this.Canvas.container.dispatchEvent(new Event('scroll'));
                }
            }
            //запоминаем для след срабатываний
            backMouseX = clientX
            backMouseY = clientY
            backTimestamp = e.timeStamp
        }

        let mouseupHandler = (e) => {
            if(!/touch/.test(e.type)) e.preventDefault()
            mousepressed = 0
            backMouseX = undefined
            console.log('mouseup')
        }

        if(!Utils.isTablet()) {
            document.addEventListener('pointermove', moveHandler)
            document.addEventListener('pointerup', mouseupHandler)
            document.addEventListener('pointercancel', mouseupHandler)
        } else {
            document.addEventListener('touchmove', moveHandler)
            document.addEventListener('touchend', mouseupHandler)
            document.addEventListener('touchcancel', mouseupHandler)
        }
    }

    checkSidebarVisibility() {
        let from = this.Timeline.range.from
        let to = this.Timeline.range.to
        //console.log('from to ', from, to)
        let priceLimits = this.mainChart.getPriceLimits(from, to)
        //console.log(priceLimits)
        if (priceLimits.to != this.priceRange.to || priceLimits.from != this.priceRange.from) { // && !this.activeAnimations) {
            //this.Animator.stopPropertyAnimation(this.priceRange)

            this.activeAnimations = 1
            let duration = 110 //moveTimestamp * 5

            this.Animator.animateProperty(this.priceRange, {
                from: priceLimits.min,
                to: priceLimits.max
            }, {
                change: () => {
                    this.needSidebarCalcRenderLabels = 1
                },
                duration: duration,
                complete: () => {
                    this.activeAnimations = 0
                }
            })
        }
    }

    bindScaleTimearea() {
        this.Canvas.canvas.addEventListener('timezone:wheel', (e) => {
            let from = this.timeRange.from - e.originalEvent.deltaY * 50
            let to = this.timeRange.to + e.originalEvent.deltaY * 50

            if (to - from < this.timeRange.minRange * 1000) {
                return //from = from - (to - from - (this.timeRange.minRange * 1000) / 2)
            }
            if (to - from > this.timeRange.maxRange * 1000) {
                return //to = to + (to - from - (this.timeRange.minRange * 1000) / 2)
            };

            this.Animator.stopPropertyAnimation(this.timeRange)

            this.timeRange.from = from
            this.timeRange.to = to

            let priceLimits = this.mainChart.getPriceLimits(from, to)
            this.priceRange.from = priceLimits.min
            this.priceRange.to = priceLimits.max

            this.Sidebar.calcRenderLabels()
            this.Timeline.calcRenderLabels()

            this.calcComponentsDimensions()
            this.checkLoadingSeriesNeed()
            //this.render()
        })
    }

    createChart(config) {
        if (0 && new Number(config.series[0][0]).toString().length > 10) {
            config.series = config.series.map(function(item) {
                item[0] /= 1000;
                return item;
            })
        }

        let c = {}
        if (config.type == 'candlesticks') {
            c = new Candlesticks(config, this.Canvas, this);
        } else if (config.type == 'line') {
            c = new LineChart(config, this.Canvas, this);
        }

        this.charts.push(c)
        this.renderable.push({
            el: c,
            z: (config.z || 500)
        })

        if (this.charts.length == 1) {
            /*c.series.map(item => {
                item[1].map(item => item.toFixed(6))
            })*/
            console.log('SSSS', c.series)

            let timeLimits = c.getTimeLimits()
            console.log(timeLimits)
            let timeLength = timeLimits.max - timeLimits.min

            this.timeRange.from = timeLimits.min + timeLength / 2
            this.timeRange.to = timeLimits.max + timeLength / 2

            this.config.sidebar.width = (Utils.getTextWidth(c.series[0][1][1], this.config.fontSize))

            console.log('WIdth', this.config.sidebar.width)

            let priceLimits = c.getPriceLimits(this.timeRange.from, this.timeRange.to)
            this.priceRange.from = priceLimits.min
            this.priceRange.to = priceLimits.max

            this.Sidebar.calcRenderLabels()
            this.Timeline.calcRenderLabels()
            this.calcComponentsDimensions()
        }
        return c
    }

    moveTimeline(time, animated = 1) {
        if (!animated) {
            this.timeRange.from += time
            this.timeRange.to += time
            this.checkSidebarVisibility()
        } else {
            this.Animator.animateProperty(this.timeRange, {
                from: this.timeRange.from + time,
                to: this.timeRange.to + time
            }, {
                duration: 500,
                change: () => {
                    this.needTimelineCalcRenderLabels = 1
                    this.checkSidebarVisibility()
                }
            })
        }
    }

    getX(time) {
        let pxPerSecond = this.config.area.width / (this.timeRange.to - this.timeRange.from)
        return ((time - this.timeRange.from) * pxPerSecond)
    }

    getY(price) {
        let to = this.priceRange.to + (this.priceRange.to - this.priceRange.from) * (this.priceRange.paddingTo / 100)
        let from = this.priceRange.from - (this.priceRange.to - this.priceRange.from) * (this.priceRange.paddingFrom / 100)

        let yTop = 0 + (this.config.fontSize / 2) + 2
        let yBottom = this.config.area.height - (this.config.fontSize / 2) - 2


        let pxPerSecond = (yBottom - yTop) / (to - from)
        return yBottom - ((price - from) * pxPerSecond)
    }

    getPrice(y) {
        let to = this.priceRange.to + (this.priceRange.to - this.priceRange.from) * (this.priceRange.paddingTo / 100)
        let from = this.priceRange.from - (this.priceRange.to - this.priceRange.from) * (this.priceRange.paddingFrom / 100)

        let yTop = 0 + (this.config.fontSize / 2) + 2
        let yBottom = this.config.area.height - (this.config.fontSize / 2) - 2


        let pxPerSecond = (to - from) / (yBottom - yTop)
        return from + (yBottom - y) * pxPerSecond
    }

    addCustomComponent(ComponentClass, componentConfig, renderOptions) {
        if (typeof ComponentClass.prototype.render != 'function') {
            console.error(ComponentClass.name + ' has no render function')
            return 0;
        }
        let object = new ComponentClass(componentConfig, this.Canvas, this)
        this.renderable.push({
            z: -10,
            el: object,
            ...renderOptions
        })
        return object;
    }

    deleteCustomComponent(object) {
        for (let i in this.renderable) {
            if (this.renderable[i].el == object) {
                delete this.renderable[i]
                return 1;
            }
        }
        return 0;
    }

    destroy() {
        this.Animator.destroy()
        this.destroyed = true
        this.Canvas._container.removeChild(this.Canvas._canvas)
    }
}


export default FinanceChart
