import MixChart from "./MixChart"
import * as Utils from "../staff/utils.js"

class Candlesticks extends MixChart {
    constructor(config, canvas, $root) {
        super(config, canvas, $root)
    }

    render() {
        for (let i in this.config.series) {
            let piece = this.config.series[i]

            let color = '#23A776'
            if (piece[1][2] > piece[1][3]) color = "#E54150"
            this.renderCandleBody(piece[0], piece[1][2], piece[1][3], color)
            this.renderCandleStick(piece[0], piece[1][0], piece[1][1], color)
        }
    }

    renderCandleBody(time, from, to, color) {
        let interval = this.config.interval
        this.ctx.fillStyle = color

        let x1 = this.$root.getX(time - interval / 2.5);
        let y1 = this.$root.getY(Math.max(from, to));
        let x2 = this.$root.getX(time + interval / 2.5);
        let y2 = this.$root.getY(Math.min(from, to));

        this.ctx.fillRect(x1, y1, x2 - x1, y2 - y1)
    }

    renderCandleStick(time, from, to, color) {
        this.ctx.fillStyle = color

        let x = this.$root.getX(time);
        let y1 = this.$root.getY(Math.max(from, to));
        let y2 = this.$root.getY(Math.min(from, to));

        this.ctx.fillRect(x, y1, 1, y2 - y1)
    }

    getPriceLimits(timeFrom, timeTo) {
        let priceIds = this.priceIds || [0, 1, 2, 3]

        let min = Infinity,
            max = -Infinity;

        let closestToMin = -1,
            closestToMax = -1

        for (let i in this.series) {
            let curr = this.series[i]



            if (closestToMin == -1 && curr[0] > timeFrom) closestToMin = i - 1
            if (closestToMax == -1 && curr[0] > timeTo) closestToMax = i - 1

            if (curr[0] < timeFrom) continue;
            if (curr[0] > timeTo) break;
            priceIds.forEach((id) => {
                min = Math.min(min, curr[1][id])
                max = Math.max(max, curr[1][id])
            })
        }
        //console.log('FFFFfejefn', min,max)
        //console.log(timeFrom, timeTo)
        //console.log(timeFrom, this.series[closestToMin + 1][0], this.series[closestToMin][0])

        if (closestToMin != -1) {
            //какой кусок между двумя ближлежащими точками занимает левая граница таймлайна
            let borderLeftShare = Utils.getShareOfRange(timeFrom, this.series[closestToMin][0], this.series[closestToMin + 1][0])
            let borderLeftPrice = this.series[closestToMin][1][2] + (this.series[closestToMin + 1][1][2] - this.series[closestToMin][1][2]) * borderLeftShare
            min = Math.min(min, borderLeftPrice)
            max = Math.max(max, borderLeftPrice)
        }
        if (closestToMax != -1) {
            //какой кусок между двумя ближлежащими точками занимает правая граница таймлайна
            let borderRightShare = Utils.getShareOfRange(timeTo, this.series[closestToMax][0], this.series[closestToMax + 1][0])
            let borderRightPrice = this.series[closestToMax][1][3] + (this.series[closestToMax + 1][1][3] - this.series[closestToMax][1][3]) * borderRightShare
            min = Math.min(min, borderRightPrice)
            max = Math.max(max, borderRightPrice)
        }


        min = min - ((max - min) / 10);
        min = min < 0 ? 0 : min
        max = max + ((max - min) / 10);

        if (min == Infinity) min = Math.min(this.series[this.series.length - 2][1][2], this.series[this.series.length - 1][1][2])
        if (max == -Infinity) max = Math.max(this.series[this.series.length - 2][1][3], this.series[this.series.length - 1][1][3])

        //console.log('FR', timeFrom, timeTo, min, max)
        return {
            min: min,
            max: max
        }
    }


    addSeries(series) {
        let cloneSeries = Utils.clone(series)
        //console.log('Back 1',  this.series[this.series.length - 1],  this.series[this.series.length - 1][0])
        //console.log('Back 2',  this.series[this.series.length - 2],  this.series[this.series.length - 2][0])
        let interval = this.series[this.series.length - 1][0] - this.series[this.series.length - 2][0]
        //console.log('Interval', interval)
        //console.log('Lolkekz', series[0], series[0] % interval, series[0] - series[0] % interval, this.series[this.series.length - 1][0])
        if (interval == 0 || series[0] - series[0] % interval == this.series[this.series.length - 1][0]) {
            let fromState = this.series[this.series.length - 1]

            let animateObj = {
                min: fromState[1][0],
                max: fromState[1][1],
                close: fromState[1][3]
            }

            this.$root.Animator.animateProperty(animateObj, {
                min: Math.min(series[1], animateObj.min),
                max: Math.max(series[1], animateObj.max),
                close: series[1]
            }, {
                duration: 500,
                change: () => {
                    fromState[1][0] = animateObj.min
                    fromState[1][1] = animateObj.max
                    fromState[1][3] = animateObj.close

                    this.$root.checkSidebarVisibility()
                }
            })
        } else {
            series[0] = series[0] - series[0] % interval
            series[1] = [
                series[1],series[1],series[1],series[1]
            ]
            let i = this.series.push(series) - 1
            this.series.sort((a, b) => a[0] - b[0])
            console.log(this.series)
            for (let j = 0; j < this.series.length; j++) {
                if (this.series[j] == series) {
                    i = j;
                    break;
                }
            }

            let fromState = this.series[i > 0 ? i - 1 : i + 1]
            //console.log('FS', fromState)
            //this.series[i][0] = fromState[0]
            this.series[i][1][0] = fromState[1][3]
            this.series[i][1][1] = fromState[1][3]
            this.series[i][1][2] = fromState[1][3]
            this.series[i][1][3] = fromState[1][3]

            let animateObj = {
                min: fromState[1][3],
                max: fromState[1][3],
                open: fromState[1][3],
                close: fromState[1][3]
            }

            this.$root.Animator.animateProperty(animateObj, {
                //min: cloneSeries[1],
                //max: cloneSeries[1],
                open: fromState[1][3],
                close: cloneSeries[1]
            }, {
                duration: 500,
                change: () => {
                    this.series[i][1][0] = animateObj.min
                    this.series[i][1][1] = animateObj.max
                    this.series[i][1][2] = animateObj.open
                    this.series[i][1][3] = animateObj.close

                    this.$root.checkSidebarVisibility()
                }
            })


            if (this.$root.mainChart == this) {
                let from = this.$root.timeRange.from
                let to = this.$root.timeRange.to
                if (Utils.getShareOfRange(this.$root.mainChart.series[this.$root.mainChart.series.length - 1][0], from, to) * 100 < 100) {
                    let timeChange = Math.abs(cloneSeries[0] - fromState[0])
                    this.$root.moveTimeline(timeChange)
                }
            }
        }
    }




    getCurrentPrice() {
        return this.config.series[this.config.series.length - 1][1][3]
    }
}

export default Candlesticks
